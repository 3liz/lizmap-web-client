<?php
/**
* Edition tool web services
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class editionCtrl extends jController {

  // lizmapProject
  private $project = null;

  // lizmapRepository
  private $repository = null;

  // layer id in the QGIS project file
  private $layerId = '';

  // layer name (<layername> in QGIS project)
  private $layerName = '';

  // table name
  private $table = '';

  // Schema
  private $schema = '';

  // table name without schema
  private $tableName = '';

  // QGIS where clause
  private $whereClause = '';

  // provider driver map
  private $providerDriverMap = array(
    'spatialite'=>'sqlite3',
    'postgres'=>'pgsql'
  );

  // provider
  private $provider = '';

  // featureIdParam : featureId parameter from the request
  private $featureIdParam = Null;

  // featureId : an integer or a string whith coma separated integers
  private $featureId = Null;

  // featureData : feature data as a PHP object from GeoJSON via json_decode
  private $featureData = Null;

  // Layer date as simpleXml object
  private $layerXml = '';

  // Fields information taken from database
  private $dataFields = '';

  // Primary key
  private $primaryKeys = array();

  // Map data type as geometry type
  private $geometryDatatypeMap = array(
    'point', 'linestring', 'polygon', 'multipoint',
    'multilinestring', 'multipolygon', 'geometrycollection', 'geometry'
  );

  // Geometry type
  private $geometryType = '';

  // Geometry column
  private $geometryColumn = '';

  // Geometry srid
  private $srid = '';

  // Geometry proj4 string
  private $proj4 = '';

  // Form controls
  private $formControls = '';

  // Filter override flag
  private $loginFilteredOveride = False;

  // Filter by login information
  private $loginFilteredLayers = Null;


  /**
  * Send an answer
  * @return HTML fragment.
  */
  function serviceAnswer(){

    $title = jLocale::get("view~edition.modal.title.default");

    // Get title layer
    if( $this->layerXml and $this->layerXml[0] ){
        $layerXmlZero = $this->layerXml[0];
        $_title = $layerXmlZero->xpath('title');
        if( $_title and $_title[0] )
            $title = (string)$_title[0];
    }

    $rep = $this->getResponse('htmlfragment');
    $tpl = new jTpl();
    $tpl->assign('title', $title);
    $content = $tpl->fetch('view~jmessage_answer');
    $rep->addContent($content);
    jMessage::clearAll();
    return $rep;
  }


  /**
  * Get parameters and set classes for the project and repository given.
  *
  * @param boolean $save If true, we have to save the form. So take liz_repository and others instead of repository from request parameters.
  * @return array List of needed variables : $params, $lizmapRepository, lizmapProject, etc.
  */
  private function getEditionParameters($save=Null){

    // Get the project
    $project = $this->param('project');
    $repository = $this->param('repository');
    $layerId = $this->param('layerId');
    $featureIdParam = $this->param('featureId');

    if($save){
      $project = $this->param('liz_project');
      $repository = $this->param('liz_repository');
      $layerId = $this->param('liz_layerId');
      $featureIdParam = $this->param('liz_featureId');
    }

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefined');
      return false;
    }

    // Get repository data
    $lrep = lizmap::getRepository($repository);
    if(!$lrep){
      jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');
      return false;
    }
    // Get the project data
    $lproj = null;
    try {
        $lproj = lizmap::getProject($repository.'~'.$project);
        if(!$lproj){
            jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
            return false;
        }
    }
    catch(UnknownLizmapProjectException $e) {
        jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
        return false;
    }

    // Redirect if no rights to access this repository
    if ( !$lproj->checkAcl() ){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return false;
    }

    // Redirect if no rights to use the edition tool
    if(!jAcl2::check('lizmap.tools.edition.use', $lrep->getKey())){
      jMessage::add(jLocale::get('view~edition.access.denied'), 'AuthorizationRequired');
      return false;
    }

    $layer = $lproj->getLayer( $layerId );
    $layerXml = $lproj->getXmlLayer( $layerId );
    $layerXmlZero = $layerXml[0];
    $_layerName = $layerXmlZero->xpath('layername');
    $layerName = (string)$_layerName[0];

    // Verifying if the layer is editable
    $eLayers  = $lproj->getEditionLayers();
    if ( !property_exists( $eLayers, $layerName ) ) {
      jMessage::add('The layer is not editable!', 'LayerNotEditable');
      return false;
    }
    $eLayer = $eLayers->$layerName;
    if ( $eLayer->capabilities->modifyGeometry != "True"
         && $eLayer->capabilities->modifyAttribute != "True"
         && $eLayer->capabilities->deleteFeature != "True"
         && $eLayer->capabilities->createFeature != "True" ) {
      jMessage::add('The layer is not editable!', 'LayerNotEditable');
      return false;
    }

    // Check if user groups intersects groups allowed by project editor
    // If user is admin, no need to check for given groups
    if( jAuth::isConnected() and !jAcl2::check('lizmap.admin.repositories.delete') and property_exists($eLayer, 'acl') and $eLayer->acl){
        // Check if configured groups white list and authenticated user groups list intersects
        $editionGroups = $eLayer->acl;
        $editionGroups = array_map('trim', explode(',', $editionGroups));
        if( is_array($editionGroups) and count($editionGroups)>0 ){
            $userGroups = jAcl2DbUserGroup::getGroups();
            if( !array_intersect($editionGroups, $userGroups) ){
              jMessage::add(jLocale::get('view~edition.access.denied'), 'AuthorizationRequired');
              return false;
            }
        }
    }


    // feature Id (optional, only for edition and save)
    if(preg_match('#,#', $featureIdParam))
      $featureId = preg_split('#,#', $featureIdParam);
    else
      $featureId = $featureIdParam;

    // Define class private properties
    $this->project = $lproj;
    $this->repository = $lrep;
    $this->layerId = $layerId;
    $this->featureId = $featureId;
    $this->featureIdParam = $featureIdParam;
    $this->layer = $layer;
    $this->layerXml = $layerXml;
    $this->layerName = $layerName;

    // Optionnaly filter data by login
    if( !jAcl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey()) ){
      $this->loginFilteredLayers = True;
    }
    $this->loginFilteredOveride = jacl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey());

    // Get features primary key field values corresponding to featureId(s)
    if( !empty($featureId) ){
        $_datasource = $layerXmlZero->xpath('datasource');
        $datasource = (string)$_datasource[0];
        $s_provider = $layerXmlZero->xpath('provider');
        $this->provider = (string)$s_provider[0];
        $this->getDataFields($datasource);
        $typename = str_replace(' ', '_', $layerName);
        $wfsparams = array(
            'SERVICE' => 'WFS',
            'VERSION' => '1.0.0',
            'REQUEST' => 'GetFeature',
            'TYPENAME' => $typename,
            'OUTPUTFORMAT' => 'GeoJSON',
            'GEOMETRYNAME' => 'none',
            'PROPERTYNAME' => implode(',',$this->primaryKeys),
            'FEATUREID' => $typename . '.' . $featureId
        );

        $wfsrequest = new lizmapWFSRequest( $lproj, $wfsparams );
        $wfsresponse = $wfsrequest->getfeature();
        if( property_exists($wfsresponse, 'data') ){
            $data = $wfsresponse->data;
            if( property_exists($wfsresponse, 'file') and $wfsresponse->file and is_file($data) ){
                $data = jFile::read($data);
            }
            $this->featureData = json_decode($data);
            if( empty($this->featureData) ){
                $this->featureData = Null;
            }
            else{
                if( empty($this->featureData->features ) )
                    $this->featureData = Null;
            }
        }
    }

    return true;
  }


  /**
  * Filter data by login if necessary
  * as configured in the plugin for login filtered layers.
  */
  protected function filterDataByLogin($layername) {

    // Optionnaly add a filter parameter
    $lproj = $this->project;
    $pConfig = $lproj->getFullCfg();

    if( $lproj->hasLoginFilteredLayers()
      and $pConfig->loginFilteredLayers
    ){
      if( property_exists($pConfig->loginFilteredLayers, $layername) ) {
        $v='';
        $where='';
        $type='groups';
        $attribute = $pConfig->loginFilteredLayers->$layername->filterAttribute;

        if (property_exists($pConfig->loginFilteredLayers->$layername, 'filterPrivate')
         && $pConfig->loginFilteredLayers->$layername->filterPrivate == 'True')
          $type = 'login';

        // Check if a user is authenticated
        $isConnected = jAuth::isConnected();
        $cnx = jDb::getConnection($this->layerId);
        if($isConnected){
          $user = jAuth::getUserSession();
          $login = $user->login;
          if ( $type == 'login' ) {
            $where = ' "'.$attribute."\" IN ( '".$login."' , 'all' )";
          } else {
            $userGroups = jAcl2DbUserGroup::getGroups();
            // Set XML Filter if getFeature request
            $flatGroups = implode("' , '", $userGroups);
            $where = ' "'.$attribute."\" IN ( '".$flatGroups."' , 'all' )";
          }
        }else{
          // The user is not authenticated: only show data with attribute = 'all'
          $where = ' "'.$attribute.'" = '.$cnx->quote("all");
        }
        // Set filter when multiple layers concerned
        if($where){
          return array(
            'where' => $where,
            'type' => $type,
            'attribute' => $attribute
          );
        }
      }
    }
    return null;
  }

  /**
  * Get field data from a database layer corresponding to a QGIS layer
  * @param string $datasource String corresponding to the QGIS <datasource> item for the layer
  * @return object containing the sql fields information
  */
  private function getDataFields($datasource){

    // Get datasource information from QGIS
    $datasourceMatch = preg_match(
      "#(?:dbname='([^ ]+)' )?(?:service='([^ ]+)' )?(?:host=([^ ]+) )?(?:port=([0-9]+) )?(?:user='([^ ]+)' )?(?:password='([^ ]+)' )?(?:sslmode=([^ ]+) )?(?:key='([^ ]+)' )?(?:estimatedmetadata=([^ ]+) )?(?:srid=([0-9]+) )?(?:type=([a-zA-Z]+) )?(?:table=\"([^ ]+)\" )?(?:\()?(?:([^ ]+)\) )?(?:sql=(.*))?#",
      $datasource,
      $dt
    );
    $dbname = $dt[1];
    $service = $dt[2];
    $host = $dt[3]; $port = $dt[4];
    $user = $dt[5]; $password = $dt[6];
    $sslmode = $dt[7]; $key = $dt[8];
    $estimatedmetadata = $dt[9];
    $srid = $dt[10]; $type = $dt[11];
    $table = $dt[12];
    $geocol = $dt[13];
    $sql = $dt[14];

    // If table contains schema name, like "public"."mytable"
    // We need to add double quotes around and find the real table name (without schema)
    // to retrieve the columns with jelix tools.
    $tableAlone = $table;
    $schema = '';
    if(preg_match('#"."#', $table)){
      $table = '"'.$table.'"';
      $exp = explode('.', str_replace('"', '', $table));
      $tableAlone = $exp[1];
      $schema = $exp[0];
    }
    $this->schema = $schema;

    // Set some private properties
    $this->table = $table;
    $this->tableName = $tableAlone;
    $this->whereClause = $sql;
    $driver = $this->providerDriverMap[$this->provider];

    // Build array of parameters for the virtual profile
    if($driver == 'sqlite3'){
      $jdbParams = array(
        "driver" => $driver,
        "database" => realpath($this->repository->getPath().$dbname),
        "extensions"=>"libspatialite.so,mod_spatialite.so"
      );
    }
    else{
        if(!empty($service) ){
          $jdbParams = array(
            "driver" => $driver,
            "service" => $service
          );
        }else{
          $jdbParams = array(
            "driver" => $driver,
            "host" => $host,
            "port" => (integer)$port,
            "database" => $dbname,
            "user" => $user,
            "password" => $password
          );
        }
    }

    // Create the virtual jdb profile
    $profile = $this->layerId;
    jProfiles::createVirtualProfile('jdb', $profile, $jdbParams);

    // Get the fields using jelix tools for this connection
    $cnx = jDb::getConnection($profile);
    $tools = $cnx->tools();
    $sequence = null;

    $fields = $tools->getFieldList($tableAlone, $sequence, $schema);
    $wfsFields = $this->layer->getWfsFields();

    $this->dataFields = array();
    foreach($fields as $fieldName=>$prop){
        if( in_array($fieldName, $wfsFields) || in_array( strtolower($prop->type), $this->geometryDatatypeMap ) )
            $this->dataFields[$fieldName] = $prop;
    }

    foreach($this->dataFields as $fieldName=>$prop){
      // Detect primary key column
      if($prop->primary && !in_array($fieldName, $this->primaryKeys)){
        $this->primaryKeys[] = $fieldName;
      }

      // Detect geometry column
      if(in_array( strtolower($prop->type), $this->geometryDatatypeMap)) {
        $this->geometryColumn = $fieldName;
        $this->geometryType = strtolower($prop->type);
        // If postgresql, get real geometryType from geometry_columns (jelix prop gives 'geometry')
        if( $this->provider == 'postgres' and $this->geometryType == 'geometry' ){
          $cnx = jDb::getConnection($this->layerId);
          $res = $cnx->query('SELECT type FROM geometry_columns WHERE f_table_name = '.$cnx->quote($this->tableName));
          $res = $res->fetch();
          if( $res )
            $this->geometryType = strtolower($res->type);
        }
      }
    }

    // For views : add key from datasource
    if(!$this->primaryKeys and $key){
      // check if layer is a view
      $cnx = jDb::getConnection($this->layerId);
      if($this->provider == 'postgres'){
        $sql = " SELECT table_name FROM INFORMATION_SCHEMA.views";
        $sql.= " WHERE 2>1";
        $sql.= " AND (table_schema = ANY (current_schemas(false)) OR table_schema = " . $cnx->quote($schema) . ")";
        $sql.= " AND table_name=".$cnx->quote($tableAlone);
      }
      if($this->provider == 'spatialite'){
        $sql = " SELECT name FROM sqlite_master WHERE type = 'view'";
        $sql.= " AND name=".$cnx->quote($tableAlone);
      }
      $res = $cnx->query($sql);
      if($res->rowCount() > 0)
        $this->primaryKeys[] = $key;
    }
    return true;
  }


  /**
  * Dynamically add controls to the form based on QGIS layer information
  *
  * @param object $form Jelix form to add controls to.
  * @return modified form.
  */
  private function addFormControls($form){

    // Get fields data from the edition database
    $layerXmlZero = $this->layerXml[0];
    $_datasource = $layerXmlZero->xpath('datasource');
    $datasource = (string)$_datasource[0];
    $s_provider = $layerXmlZero->xpath('provider');
    $this->provider = (string)$s_provider[0];
    $this->getDataFields($datasource);

    // Get QGIS fields extra information from XML for the layer
    // edittypes and categories
    $edittypesXml = $layerXmlZero->edittypes[0];
    $_categoriesXml = $layerXmlZero->xpath('renderer-v2/categories');
    $categoriesXml = Null;
    if( isset($_categoriesXml[0]) )
      $categoriesXml = $_categoriesXml[0];

    // Get proj4 string
    $proj4 = (string)$layerXmlZero->srs->spatialrefsys->proj4;
    $this->proj4 = $proj4;

    // Get layer srid
    $srid = (integer)$layerXmlZero->srs->spatialrefsys->srid;
    $this->srid = $srid;

    // Loop through the table fields
    // and create a form control if needed
    $this->formControls = array();

    $layerName = $this->layerName;
    $capabilities = $this->project->getEditionLayers()->$layerName->capabilities;
    $toDeactivate = array();
    $toSetReadOnly = array();
    foreach($this->dataFields as $fieldName=>$prop){

      // Create new control from qgis edit type
      $aliasXml = Null;
      if($layerXmlZero->aliases){
        $aliasesZero = $layerXmlZero->aliases[0];
        $aliasXml = $aliasesZero->xpath("alias[@field='$fieldName']");
      }
      $edittype = null;
      if($edittypesXml)
        $edittype = $edittypesXml->xpath("edittype[@name='$fieldName']");

      $this->formControls[$fieldName] = new qgisFormControl($fieldName, $edittype, $aliasXml, $categoriesXml, $prop);

      if( ($this->formControls[$fieldName]->fieldEditType == 15
           or $this->formControls[$fieldName]->fieldEditType == 'ValueRelation')
         and $this->formControls[$fieldName]->valueRelationData ){
          // Fill comboboxes of editType "Value relation" from relation layer
          // Query QGIS Server via WFS
          $this->fillControlFromValueRelationLayer($fieldName);
      } else if ( $this->formControls[$fieldName]->fieldEditType == 8
               or $this->formControls[$fieldName]->fieldEditType == 'FileName'
               or $this->formControls[$fieldName]->fieldEditType == 'Photo' ) {
          // Add Hidden Control for upload
          // help to retrieve file path
          $hiddenCtrl = new jFormsControlHidden($fieldName.'_hidden');
          $form->addControl($hiddenCtrl);
          $toDeactivate[] = $fieldName.'_choice';
      }

      // Add the control to the form
      $form->addControl($this->formControls[$fieldName]->ctrl);
      // Set readonly if needed
      $form->setReadOnly($fieldName, $this->formControls[$fieldName]->isReadOnly);

      // Hide when no modify capabilities, only for UPDATE cases ( when $this->featureId control exists )
      if( !empty($this->featureId) and strtolower($capabilities->modifyAttribute) == 'false' and $fieldName != $this->geometryColumn ){
            if( $prop->primary )
                $toSetReadOnly[] = $fieldName;
            else
                $toDeactivate[] = $fieldName;
      }

    }

    // Hide when no modify capabilities, only for UPDATE cases (  when $this->featureId control exists )
    if( !empty($this->featureId) && strtolower($capabilities->modifyAttribute) == 'false'){
        foreach( $toDeactivate as $de ){
            if( $form->getControl( $de ) )
                $form->deactivate( $de, true );
        }
        foreach( $toSetReadOnly as $de ){
            if( $form->getControl( $de ) )
                $form->setReadOnly( $de, true );
        }
    }

    if(!$this->primaryKeys){
      jMessage::add("The table ".$this->table." has no primary keys. The edition tool needs a primary key on the table to be defined.", "error");
      return false;
    }

    return True;
  }


  /**
  * Dynamically update form by modifying the filter by login control
  *
  * @param object $form Jelix form to modify control.
  * @param string $save does the form will be used for update or insert.
  * @return modified form.
  */
  private function updateFormByLogin($form, $save) {
    if( !is_array($this->loginFilteredLayers) ) //&& $this->loginFilteredOveride )
        $this->loginFilteredLayers = $this->filterDataByLogin($this->layerName);

    if ( is_array($this->loginFilteredLayers) ) {
        $type = $this->loginFilteredLayers['type'];
        $attribute = $this->loginFilteredLayers['attribute'];

        // Check if a user is authenticated
        if ( !jAuth::isConnected() )
            return True;

        $user = jAuth::getUserSession();
        if( !$this->loginFilteredOveride ){
            if ( $type == 'login' ) {
                $user = jAuth::getUserSession();
                $form->setData($attribute, $user->login);
                $form->setReadOnly($attribute, True);
            } else {
                $oldCtrl = $form->getControl( $attribute );
                $userGroups = jAcl2DbUserGroup::getGroups();
                $userGroups[] = 'all';
                $uGroups = array();
                foreach( $userGroups as $uGroup ) {
                    if ($uGroup != 'users' and substr( $uGroup, 0, 7 ) != "__priv_")
                        $uGroups[$uGroup] = $uGroup;
                }
                $dataSource = new jFormsStaticDatasource();
                $dataSource->data = $uGroups;
                $ctrl = new jFormsControlMenulist($attribute);
                $ctrl->required = true;
                if ( $oldCtrl != null )
                    $ctrl->label = $oldCtrl->label;
                else
                    $ctrl->label = $attribute;
                $ctrl->datasource = $dataSource;
                $value = null;
                if ( $oldCtrl != null ) {
                    $value = $form->getData( $attribute );
                    $form->removeControl( $attribute );
                }
                $form->addControl( $ctrl );
                if ( $value != null )
                    $form->setData( $attribute, $value );
            }
        } else {
            $oldCtrl = $form->getControl( $attribute );
            $value = null;
            if ( $oldCtrl != null )
                $value = $form->getData( $attribute );

            $data = array();
            if ( $type == 'login' ) {
                $plugin = jApp::coord()->getPlugin('auth');
                if ($plugin->config['driver'] == 'Db') {
                    $authConfig = $plugin->config['Db'];
                    $dao = jDao::get($authConfig['dao'], $authConfig['profile']);
                    $cond = jDao::createConditions();
                    $cond->addItemOrder('login', 'asc');
                    $us = $dao->findBy($cond);
                    foreach($us as $u){
                        $data[$u->login] = $u->login;
                    }
                }
            } else {
                $gp = jAcl2DbUserGroup::getGroupList();
                foreach($gp as $g){
                    if ( $g->id_aclgrp != 'users' )
                        $data[$g->id_aclgrp] = $g->id_aclgrp;
                }
                $data['all'] = 'all';
            }
            $dataSource = new jFormsStaticDatasource();
            $dataSource->data = $data;
            $ctrl = new jFormsControlMenulist($attribute);
            $ctrl->required = true;
            if ( $oldCtrl != null )
                $ctrl->label = $oldCtrl->label;
            else
                $ctrl->label = $attribute;
            $ctrl->datasource = $dataSource;
            $form->removeControl( $attribute );
            $form->addControl( $ctrl );
            if ( $value != null )
                $form->setData( $attribute, $value );
            else if ( $type == 'login' )
              $form->setData( $attribute, $user->login );
        }
    }
    return True;
  }




  /**
  * Get WFS data from a "Value Relation" layer and fill the form control for a specific field.
  * @param string $fieldName Name of QGIS field
  *
  * @return Modified form control
  */
  private function fillControlFromValueRelationLayer($fieldName){

    $wfsData = null;
    $mime = '';

    // Build WFS request parameters
    //   Get layername via id
    $relationLayerId = $this->formControls[$fieldName]->valueRelationData['layer'];

    $_relationLayerXml = $this->project->getXmlLayer($relationLayerId);
    if(count($_relationLayerXml) == 0){
        $this->formControls[$fieldName]->ctrl->hint = 'Control not well configured!';
        $this->formControls[$fieldName]->ctrl->help = 'Control not well configured!';
        return;
    }
    $relationLayerXml = $_relationLayerXml[0];

    $_layerName = $relationLayerXml->xpath('layername');
    if(count($_layerName) == 0){
        $this->formControls[$fieldName]->ctrl->hint = 'Control not well configured!';
        $this->formControls[$fieldName]->ctrl->help = 'Control not well configured!';
    }
    $layerName = (string)$_layerName[0];

    $valueColumn = $this->formControls[$fieldName]->valueRelationData['value'];
    $keyColumn = $this->formControls[$fieldName]->valueRelationData['key'];
    $filterExpression = $this->formControls[$fieldName]->valueRelationData['filterExpression'];
    $typename = str_replace(' ', '_', $layerName);
    $params = array(
      'SERVICE' => 'WFS',
      'VERSION' => '1.0.0',
      'REQUEST' => 'GetFeature',
      'TYPENAME' => $typename,
      'PROPERTYNAME' => $valueColumn.','.$keyColumn,
      'OUTPUTFORMAT' => 'GeoJSON',
      'GEOMETRYNAME' => 'none',
      //'map' => $this->repository->getPath().$this->project->getKey().".qgs"
    );
    // add EXP_FILTER. Only for QGIS >=2.0
    $expFilter = Null;
    if($filterExpression){
      $expFilter = $filterExpression;
    }
    // Filter by login
    if( !$this->loginFilteredOveride ) {
      $loginFilteredLayers = $this->filterDataByLogin($layerName);
      if( is_array( $loginFilteredLayers )){
        if($expFilter){
          $expFilter = " ( ".$expFilter." ) AND ( ".$loginFilteredLayers['where']." ) ";
        }else {
          $expFilter = $loginFilteredLayers['where'];
        }
      }
    }
    if($expFilter){
      $params['EXP_FILTER'] = $expFilter;
      // disable PROPERTYNAME in this case : if the exp_filter uses other fields, no data would be returned otherwise
      unset( $params['PROPERTYNAME'] );
    }

    // Build query
    //$lizmapServices = lizmap::getServices();
    //$url = $lizmapServices->wmsServerURL.'?';
    //$bparams = http_build_query($params);
    //$querystring = $url . $bparams;

    // Get remote data
    //$lizmapCache = jClasses::getService('lizmap~lizmapCache');
    //$getRemoteData = $lizmapCache->getRemoteData(
      //$querystring,
      //$lizmapServices->proxyMethod,
      //$lizmapServices->debugMode
    //);
    //$wfsData = $getRemoteData[0];
    //$mime = $getRemoteData[1];

    $wfsrequest = new lizmapWFSRequest( $this->project, $params );
    $wfsresponse = $wfsrequest->getfeature();
    $wfsData = Null;
    if( property_exists($wfsresponse, 'data') ){
        $wfsData = $wfsresponse->data;
        if( property_exists($wfsresponse, 'file') and $wfsresponse->file and is_file($wfsData) ){
            $wfsData = jFile::read($wfsData);
        }
    }
    $mime = $wfsresponse->mime;
    if($wfsData and !in_array(strtolower($mime), array('text/html', 'text/xml')) ){
      $wfsData = json_decode($wfsData);
      // Get data from layer
      $features = $wfsData->features;
      $data = array();
      foreach($features as $feat){
        if(property_exists($feat, 'properties')){
          if(property_exists($feat->properties,$keyColumn) && property_exists($feat->properties,$valueColumn))
            $data[(string)$feat->properties->$keyColumn] = $feat->properties->$valueColumn;
        }
      }
      $dataSource = new jFormsStaticDatasource();

      // required
      if(
        strtolower( $this->formControls[$fieldName]->valueRelationData['allowNull'] ) == 'false'
        or
        strtolower( $this->formControls[$fieldName]->valueRelationData['allowNull'] ) == '0'
      ){
        $this->formControls[$fieldName]->ctrl->required = True;
      }

      // Add default empty value for required fields
      // Jelix does not do it, but we think it is better this way to avoid unwanted set values
      if( $this->formControls[$fieldName]->ctrl->required )
        $data[''] = '';

      // orderByValue
      if(
        strtolower( $this->formControls[$fieldName]->valueRelationData['orderByValue'] ) == 'true'
        or
        strtolower( $this->formControls[$fieldName]->valueRelationData['orderByValue'] ) == '1'
      ){
        asort($data);
      }

      $dataSource->data = $data;
      $this->formControls[$fieldName]->ctrl->datasource = $dataSource;
    }
    else{
      if(!preg_match('#No feature found error messages#', $wfsData)){
        $this->formControls[$fieldName]->ctrl->hint = 'Problem : cannot get data to fill this control!';
        $this->formControls[$fieldName]->ctrl->help = 'Problem : cannot get data to fill this control!';
      }else{
        $this->formControls[$fieldName]->ctrl->hint = 'No data to fill this control!';
        $this->formControls[$fieldName]->ctrl->help = 'No data to fill this control!';
      }
    }
  }


  /**
  * Set the form controls data from the database default value
  *
  * @param object $form Jelix jForm object
  * @return Boolean True if filled form
  */
  public function setFormDataFromDefault( $form ) {

      // Get database connection object
      $cnx = jDb::getConnection($this->layerId);

      foreach ( $this->dataFields as $ref=>$prop ) {
          if ( $prop->hasDefault ){
              $ctrl = $form->getControl( $ref );
              // only set default value for non hidden field
              if( $ctrl->type != 'hidden' ) {
                  $form->setData( $ref, $prop->default );
                  // if provider is postgres evaluate default value
                  if( $this->provider == 'postgres' && $prop->default != '' ){
                      $ds = $cnx->query ('SELECT '.$prop->default.' AS v;');
                      $d = $ds->fetch();
                      if( $d )
                          $form->setData( $ref, $d->v );
                  }
              }
          }
      }
      return true;
  }


  /**
  * Set the form controls data from the database value
  *
  * @param object $form Jelix jForm object
  * @return Boolean True if filled form
  */
  public function setFormDataFromFields($form){

    // Get database connection object
    $cnx = jDb::getConnection($this->layerId);

    // Get the array of feature ids
    if(ctype_digit($this->featureId))
      $featureId = array($this->featureId);

    // Build the SQL query to retrieve data from the table
    $sql = "SELECT *";
    if ( $this->geometryColumn != '' )
      $sql.= ", ST_AsText(".$this->geometryColumn.") AS astext";
    $sql.= " FROM ".$this->table;
    $sqlw = array();
    $feature = $this->featureData->features[0];
    foreach($this->primaryKeys as $key){
      $val = $feature->properties->$key;
      if( $this->dataFields[$key]->unifiedType != 'integer' )
        $val = $cnx->quote($val);
      $sqlw[] = '"' . $key . '"' . ' = ' . $val;
    }
    $sql.= ' WHERE ';
    $sql.= implode(' AND ', $sqlw );

    // Run the query and loop through the result to set the form data
    $rs = $cnx->query($sql);
    foreach($rs as $record){
      // Loop through the data fields
      foreach($this->dataFields as $ref=>$prop){
        $form->setData($ref, $record->$ref);
        // ValueRelation can be an array (i.e. {1,2,3})
        if( $this->formControls[$ref]->fieldEditType == 15
          or $this->formControls[$ref]->fieldEditType === 'ValueRelation' ){
            $value = $record->$ref;
            if($value[0] == '{'){
              $arrayValue = explode(",",trim($value, "{}"));
              $form->setData($ref, $arrayValue);
            }
        }
        if ( $this->formControls[$ref]->fieldEditType == 8
          or $this->formControls[$ref]->fieldEditType == 'FileName'
          or $this->formControls[$ref]->fieldEditType == 'Photo' ) {
            $ctrl = $form->getControl($ref.'_choice');
            if ($ctrl && $ctrl->type == 'choice' ) {
                $path = explode( '/', $record->$ref );
                $filename = array_pop($path);
                $filename = preg_replace('#_|-#', ' ', $filename);
                $ctrl->itemsNames['keep'] = jLocale::get("view~edition.upload.choice.keep") . ' ' . $filename;
                $ctrl->itemsNames['update'] = jLocale::get("view~edition.upload.choice.update");
                $ctrl->itemsNames['delete'] = jLocale::get("view~edition.upload.choice.delete") . ' ' . $filename;
            }
            $form->setData($ref.'_hidden', $record->$ref);
        }
      }
      // geometry column : override binary with text representation
      // jLog::log( 'geometryColumn = ' . $this->geometryColumn );
      if ( $this->geometryColumn != '' )
        $form->setData($this->geometryColumn, $record->astext);
    }

    return True;
  }

  /**
  * Save the form controls data to the database
  *
  * @param object $form Jelix jForm object
  * @return Boolean True if the has been saved
  */
  public function saveFormDataToDb($form){
    // Set the form from request
    //$form->initFromRequest();

    // Optionnaly query for the feature
    $cnx = jDb::getConnection($this->layerId);
    $layerName = $this->layerName;
    $capabilities = $this->project->getEditionLayers()->$layerName->capabilities;

    // Update or Insert
    $updateAction = false; $insertAction = false;
    if( $this->featureId )
        $updateAction = true;
    else
        $insertAction = true;

    // Check if data has been fetched via WFS for the feature
    if($updateAction && !$this->featureData){
      jMessage::clearAll();
      jMessage::add('Lizmap cannot get this feature data via WFS', 'featureNotFoundViaWfs');
      return false;
    }

    // Get list of fields which are not primary keys
    $fields = array();
    foreach($this->dataFields as $fieldName=>$prop){
        // For update : And get only fields corresponding to edition capabilities
        if(
            ( strtolower($capabilities->modifyAttribute) == 'true' and $fieldName != $this->geometryColumn )
            or ( strtolower($capabilities->modifyGeometry) == 'true' and $fieldName == $this->geometryColumn )
            or $insertAction
        )
            $fields[] = $fieldName;
    }

    if( count($fields) == 0){
        jLog::log('Not enough capabilities for this layer ! SQL cannot be constructed: no fields available !' ,'error');
        $form->setErrorOn($this->geometryColumn, 'An error has been raised when saving the form: Not enough capabilities for this layer !');
        jMessage::clearAll();
        jMessage::add( jLocale::get('view~edition.link.error.sql'), 'error');
        return false;
    }

    // Loop though the fields and filter the form posted values
    $update = array(); $insert = array(); $refs= array();
    $finalFields = array();
    foreach($fields as $ref){
      // Get and filter the posted data foreach form control
      $value = $form->getData($ref);

      if(is_array($value)){
        $value = '{'.implode(',',$value).'}';
      }

      switch($this->formControls[$ref]->fieldDataType){
          case 'geometry':
            $value = "ST_GeomFromText('".filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)."', ".$this->srid.")";
            $rs = $cnx->query('SELECT GeometryType('.$value.') as geomtype');
            $rs = $rs->fetch();
            if ( !preg_match('/'.$this->geometryType.'/',strtolower($rs->geomtype)) )
              if ( preg_match('/'.str_replace('multi','',$this->geometryType).'/',strtolower($rs->geomtype)) )
                $value = 'ST_Multi('.$value.')';
              else {
                $form->setErrorOn($this->geometryColumn, "The geometry type does not match!");
                return false;
              }
            break;
          case 'date':
          case 'datetime':
            $value = filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
            if ( !$value )
              $value = 'NULL';
            else
              $value = $cnx->quote( $value );
            break;
          case 'integer':
            $value = filter_var($value, FILTER_SANITIZE_NUMBER_INT);
            if ( !$value )
              $value = 'NULL';
            break;
          case 'float':
            $value = (float)$value;
            if ( !$value )
              $value = 'NULL';
            break;
          case 'text':
          case 'boolean':
            $value= filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
            if ( !$value or empty($value))
              $value = 'NULL';
            else
              $value = $value = $cnx->quote($value);
            break;
          default:
            $value = $cnx->quote(
              filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)
            );
            break;
      }
      if ( $form->hasUpload() && array_key_exists( $ref, $form->getUploads() ) ) {
        $value = $form->getData( $ref );
        $choiceValue = $form->getData( $ref.'_choice' );
        $hiddenValue = $form->getData( $ref.'_hidden' );
        $repPath = $this->repository->getPath();
        if ( $choiceValue == 'update' && $value != '') {
            $refPath = realpath($repPath.'/media').'/upload/'.$this->project->getKey().'/'.$this->tableName.'/'.$ref;
            $alreadyValueIdx = 0;
            while ( file_exists( $refPath.'/'.$value ) ) {
                $alreadyValueIdx += 1;
                $splitValue = explode('.', $value);
                $splitValue[0] = $splitValue[0].$alreadyValueIdx;
                $value = implode('.', $splitValue);
            }
            $form->saveFile( $ref, $refPath, $value );
            $value = 'media'.'/upload/'.$this->project->getKey().'/'.$this->tableName.'/'.$ref.'/'.$value;
            if ( $hiddenValue && file_exists( realPath( $repPath ).'/'.$hiddenValue ) )
                unlink( realPath( $repPath ).'/'.$hiddenValue );
        } else if ( $choiceValue == 'delete' ) {
            if ( $hiddenValue && file_exists( realPath( $repPath ).'/'.$hiddenValue ) )
                unlink( realPath( $repPath ).'/'.$hiddenValue );
            $value = 'NULL';
        } else {
            $value = $hiddenValue;
        }
        if ( empty($value) )
            $value = 'NULL';
        else if ( $value != 'NULL' )
            $value = $cnx->quote(
              filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)
            );
      }

      // Add fields only if no NULL value passed
      if( $value != 'NULL' )
        $finalFields[] = $ref;

      // Build the SQL insert and update query
      // For insert, only for not NULL values to allow serial and default values to work
      if( $value != 'NULL' ){
        $insert[]=$value;
        $refs[]='"'.$ref.'"';
      }
      // For update, keep fields with NULL to allow deletion of values
      $update[]='"'.$ref.'"='.$value;
    }

    $sql = '';
    // update
    if( $updateAction ){
      if(ctype_digit($this->featureId))
        $featureId = array($this->featureId);

      // SQL for updating on line in the edition table
      $sql = " UPDATE ".$this->table." SET ";
      $sql.= implode(', ', $update);

      // Add where clause with primary keys
      $sqlw = array();
      $feature = $this->featureData->features[0];
      foreach($this->primaryKeys as $key){
        $val = $feature->properties->$key;
        if( $this->dataFields[$key]->unifiedType != 'integer' )
          $val = $cnx->quote($val);
        $sqlw[] = '"' . $key . '"' . ' = ' . $val;
      }
      $sql.= ' WHERE ';
      $sql.= implode(' AND ', $sqlw );

      // Add login filter if needed
      if( !$this->loginFilteredOveride ) {
        $this->loginFilteredLayers = $this->filterDataByLogin($this->layerName);
        if( is_array( $this->loginFilteredLayers ) ){
          $sql.= ' AND '.$this->loginFilteredLayers['where'];
        }
      }
    }
    // insert
    if( $insertAction ) {
      // SQL for insertion into the edition this->table
      function dquote($n){
          return '"' . $n . '"';
      }
      $dfields = array_map( "dquote", $finalFields );
      $sql = " INSERT INTO ".$this->table." (";
      $sql.= implode(', ', $refs);
      $sql.= " ) VALUES (";
      $sql.= implode(', ', $insert);
      $sql.= " );";
    }

    try {
      $rs = $cnx->query($sql);
    } catch (Exception $e) {
      $form->setErrorOn($this->geometryColumn, 'An error has been raised when saving the form');
      jLog::log("SQL = ".$sql);
      jLog::log("An error has been raised when saving form data edition to db : ".$e->getMessage() ,'error');
      return false;
    }

    return true;
  }



  /**
   * Create a feature form based on the edition layer.
   * @param string $repository Lizmap Repository
   * @param string $project Name of the project
   * @param string $layerId Qgis id of the layer
   * @return redirect to the display action.
   */
  public function createFeature(){

    // Get repository, project data and do some right checking
    if(!$this->getEditionParameters())
      return $this->serviceAnswer();

    // Get editLayer capabilities
    $eLayers  = $this->project->getEditionLayers();
    $layerName = $this->layerName;
    $eLayer = $eLayers->$layerName;
    if ( $eLayer->capabilities->createFeature != 'True' ) {
        jMessage::add('Create feature for this layer is not in the capabilities!', 'LayerNotEditable');
        return $this->serviceAnswer();
    }

    jForms::destroy('view~edition');
    // Create form instance
    $form = jForms::create('view~edition');

    // Redirect to the display action
    $rep = $this->getResponse('redirect');
    $rep->params = array(
      "project"=>$this->project->getKey(),
      "repository"=>$this->repository->getKey(),
      "layerId"=>$this->layerId
    );
    $rep->action="lizmap~edition:editFeature";

    return $rep;

  }


  /**
   * Modify a feature.
   * @param string $repository Lizmap Repository
   * @param string $project Name of the project
   * @param string $layerId Qgis id of the layer
   * @param integer $featureId Id of the feature.
   * @return redirect to the display action.
   */
  public function modifyFeature(){

    // Get repository, project data and do some right checking
    if(!$this->getEditionParameters())
      return $this->serviceAnswer();

    // Check if data has been fetched via WFS for the feature
    if(!$this->featureData){
      jMessage::add('Lizmap cannot get this feature data via WFS', 'featureNotFoundViaWfs');
      return $this->serviceAnswer();
    }

    // Create form instance
    $form = jForms::create('view~edition', $this->featureId);
    if(!$form){
      jMessage::add('An error has been raised when creating the form', 'formNotDefined');
      return $this->serviceAnswer();
    }

    // Dynamically add form controls based on QGIS layer information
    // And set form data from database content
    if(!$this->addFormControls($form))
      return $this->serviceAnswer();

    // Redirect to the display action
    $rep = $this->getResponse('redirect');
    $rep->params = array(
      "project"=>$this->project->getKey(),
      "repository"=>$this->repository->getKey(),
      "layerId"=>$this->layerId,
      "featureId"=>$this->featureIdParam
    );

    $rep->action="lizmap~edition:editFeature";
    return $rep;

  }

  /**
   * Display the edition form (output as html fragment)
   *
   * @return HTML code containing the form.
   */
  public function editFeature(){

    // Get repository, project data and do some right checking
    if(!$this->getEditionParameters())
      return $this->serviceAnswer();

    // Check if data has been fetched via WFS for the feature
    if($this->featureId and !$this->featureData){
      jMessage::add('Lizmap cannot get this feature data via WFS', 'featureNotFoundViaWfs');
      return $this->serviceAnswer();
    }

    // Get the form instance
    $form = jForms::get('view~edition', $this->featureId);
    if(!$form){
      jMessage::add('An error has been raised when getting the form', 'formNotDefined');
      return $this->serviceAnswer();
    }
    // Set lizmap form controls (hard-coded in the form xml file)
    $form->setData('liz_repository', $this->repository->getKey());
    $form->setData('liz_project', $this->project->getKey());
    $form->setData('liz_layerId', $this->layerId);
    $form->setData('liz_featureId', $this->featureId);

    // Dynamically add form controls based on QGIS layer information
    if(!$this->addFormControls($form) )
      return $this->serviceAnswer();

    // Set data for the layer geometry: srid, proj4 and geometryColumn
    $form->setData('liz_srid', $this->srid);
    $form->setData('liz_proj4', $this->proj4);
    $form->setData('liz_geometryColumn', $this->geometryColumn);

    // SELECT data from the database and set the form data accordingly
    $this->setFormDataFromDefault($form);
    if( $this->featureId )
      $this->setFormDataFromFields($form);
    else if ( $form->hasUpload() ) {
        foreach( $form->getUploads() as $upload ) {
            $choiceRef = $upload->ref.'_choice';
            $choiceCtrl = $form->getControl( $choiceRef );
            if ( $choiceCtrl ) {
                $form->setData( $choiceRef, 'update' );
                $choiceCtrl->itemsNames['update'] = jLocale::get("view~edition.upload.choice.update");
                $choiceCtrl->deactivateItem('keep');
                $choiceCtrl->deactivateItem('delete');
            }
        }
    }


    // If the user has been redirected here from the saveFeature method
    // Set the form controls data from the request parameters
    if($this->param('error')){
      $token = $this->param('error');
      if(isset($_SESSION[$token.$this->layerId]) and $_SESSION[$token.$this->layerId]){
        foreach($_SESSION[$token.$this->layerId] as $ctrl=>$data){
          $form->setData($ctrl, $data);
        }
        unset($_SESSION[$token.$this->layerId]);
      }
    }
    $this->updateFormByLogin($form, False);

    // Get title layer
    $_layerXmlZero = $this->layerXml;
    $layerXmlZero = $_layerXmlZero[0];
    $_title = $layerXmlZero->xpath('title');
    if ($_title) {
        $title = (string)$_title[0];
    }
    else {
        $title = 'No title';
    }

    // Get form layout
    $_editorlayout = $layerXmlZero->xpath('editorlayout');
    $formLayout = '{}';
    if ($_editorlayout && $_editorlayout[0] == 'tablayout') {
        $_attributeEditorForm = $layerXmlZero->xpath('attributeEditorForm');
        if ($_attributeEditorForm && count($_attributeEditorForm)) {
            $formLayout = str_replace(
                '@',
                '',
                json_encode($_attributeEditorForm[0] )
            );
        }
    }

    // Use template to create html form content
    $tpl = new jTpl();
    $tpl->assign(array(
      'title'=>$title,
      'form'=>$form,
      'formLayout'=>$formLayout
    ));
    $content = $tpl->fetch('view~edition_form');

    // Return html fragment response
    $rep = $this->getResponse('htmlfragment');
    $rep->addContent($content);
    return $rep;

  }

  /**
   * Save the edition form (output as html fragment)
   *
   * @param string $repository Lizmap Repository
   * @param string $project Name of the project
   * @param string $layerId Qgis id of the layer
   * @param integer $featureId Id of the feature.
   * @return Redirect to the validation action.
   */
  public function saveFeature(){

    // Get repository, project data and do some right checking
    $save = True;
    if(!$this->getEditionParameters($save))
      return $this->serviceAnswer();

    // Get the form instance
    $form = jForms::get('view~edition', $this->featureId);

    if(!$form){
      jMessage::add('An error has been raised when getting the form', 'formNotDefined');
      return $this->serviceAnswer();
    }

    // Dynamically add form controls based on QGIS layer information
    // And save data into the edition table (insert or update line)
    $save =True;
    if(!$this->addFormControls($form) )
      return $this->serviceAnswer();

    // Get data from the request and set the form controls data accordingly
    $form->initFromRequest();

    // Check the form data and redirect if needed
    $check = $form->check();
    if ( $this->geometryColumn != '' && $form->getData( $this->geometryColumn ) == '' ) {
      $check = False;
      $form->setErrorOn($this->geometryColumn, jLocale::get("view~edition.message.error.no.geometry") );
    }

    $rep = $this->getResponse('redirect');
    $rep->params = array(
      "project"=>$this->project->getKey(),
      "repository"=>$this->repository->getKey(),
      "layerId"=>$this->layerId,
      "featureId"=>$this->featureIdParam
    );

    // Save data into database
    if ($check)
      $check = $this->saveFormDataToDb($form);

    if ( !$check ) {
      // Redirect to the display action
      $token = uniqid('lizform_');
      $params["error"] = $token;

      // Build array of data for all the controls
      // And save it in session
      $controlData = array();
      foreach(array_keys($form->getControls()) as $ctrl) {
        $controlData[$ctrl] = $form->getData($ctrl);
      }
      $_SESSION[$token.$this->layerId] = $controlData;

      $rep->action="lizmap~edition:editFeature";
      return $rep;
    }


    $pks = array();
    foreach(array_keys($form->getControls()) as $ctrl) {
      $d = $form->getData($ctrl);
      if(in_array($ctrl->ref, $this->primaryKeys)){
        $pks[] = $d;
      }
    }

    // Log
    $content = "table=".$this->tableName;
    if( !empty($this->featureId) )
      $content.", id=".$this->featureId;
    if( count($pk)>0 )
      $content.= ", pk=" . implode(',', $pks);
    $eventParams = array(
      'key' => 'editionSaveFeature',
      'content' => $content,
      'repository' => $this->repository->getKey(),
      'project' => $this->project->getKey()
    );
    jEvent::notify('LizLogItem', $eventParams);

    // Redirect to the validation action
    $rep->action="lizmap~edition:validateFeature";
    return $rep;

  }

  /**
  * Form validation : destroy it and display a message
  *
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project
  * @param string $layerId Qgis id of the layer
  * @param integer $featureId Id of the feature.
  * @return Confirmation message that the form has been saved.
  */
  public function validateFeature(){

    // Get repository, project data and do some right checking
    if(!$this->getEditionParameters())
      return $this->serviceAnswer();

    // Destroy the form
    if($form = jForms::get('view~edition', $this->featureId)){
      jForms::destroy('view~edition', $this->featureId);
    }else{
      // undefined form : redirect to error
      jMessage::add('An error has been raised when getting the form', 'error');
      return $this->serviceAnswer();
    }

    // Return html fragment response
    jMessage::add(jLocale::get('view~edition.form.data.saved'), 'success');
    return $this->serviceAnswer();

  }

  /**
   * Delete Feature (output as html fragment)
   *
   * @param string $repository Lizmap Repository
   * @param string $project Name of the project
   * @param string $layerId Qgis id of the layer
   * @param integer $featureId Id of the feature.
   * @return Redirect to the validation action.
   */
  public function deleteFeature(){
    if( !$this->getEditionParameters() )
      return $this->serviceAnswer();

    // Check if data has been fetched via WFS for the feature
    if(!$this->featureData){
      jMessage::add('Lizmap cannot get this feature data via WFS', 'featureNotFoundViaWfs');
      return $this->serviceAnswer();
    }

    // Get editLayer capabilities
    $eLayers  = $this->project->getEditionLayers();
    $layerName = $this->layerName;
    $eLayer = $eLayers->$layerName;
    if ( $eLayer->capabilities->deleteFeature != 'True' ) {
      jMessage::add('Delete feature for this layer is not in the capabilities!', 'LayerNotEditable');
      return $this->serviceAnswer();
    }

    $featureId = $this->param('featureId');
    if( !$featureId ) {
      jMessage::add('The featureId is mandatory !', 'error');
      return $this->serviceAnswer();
    }

    // Get fields data from the edition database
    $layerXmlZero = $this->layerXml[0];
    $_datasource = $layerXmlZero->xpath('datasource');
    $datasource = (string)$_datasource[0];
    $s_provider = $layerXmlZero->xpath('provider');
    $this->provider = (string)$s_provider[0];
    $this->getDataFields($datasource);

    $cnx = jDb::getConnection($this->layerId);
    if(ctype_digit($this->featureId))
      $featureId = array($this->featureId);

    // Create form instance to get uploads file
    $form = jForms::create('view~edition', $featureId);
    $deleteFiles = array();
    if( $form  and $this->addFormControls($form) ) {
        // SELECT data from the database and set the form data accordingly
        $this->setFormDataFromDefault($form);
        if( $this->featureId )
          $this->setFormDataFromFields($form);
        if ( $form->hasUpload() ) {
            foreach( $form->getUploads() as $upload ) {
                $choiceRef = $upload->ref.'_choice';
                $value = $form->getData( $upload->ref );
                $hiddenValue = $form->getData( $upload->ref.'_hidden' );
                $repPath = $this->repository->getPath();
                if ( $hiddenValue && file_exists( realPath( $repPath ).'/'.$hiddenValue ) )
                    $deleteFiles[] = realPath( $repPath ).'/'.$hiddenValue;
            }
        }
    }

    // SQL for deleting on line in the edition table
    $sql = " DELETE FROM ".$this->table;

    // Add where clause with primary keys
    $sqlw = array();
    $feature = $this->featureData->features[0];
    $pks = array();
    foreach($this->primaryKeys as $key){
      $val = $feature->properties->$key;
      $pks[] = $val;
      if( $this->dataFields[$key]->unifiedType != 'integer' )
        $val = $cnx->quote($val);
      $sqlw[] = '"' . $key . '"' . ' = ' . $val;
    }
    $sql.= ' WHERE ';
    $sql.= implode(' AND ', $sqlw );

    // Add login filter if needed
    if( !$this->loginFilteredOveride ) {
      $this->loginFilteredLayers = $this->filterDataByLogin($this->layerName);
      if( is_array( $this->loginFilteredLayers ) ){
        $sql.= ' AND '.$this->loginFilteredLayers['where'];
      }
    }

    try {
      $rs = $cnx->query($sql);
      jMessage::add( jLocale::get('view~edition.message.success.delete'), 'success');

      // Log
      $content = "table=" . $this->tableName;
      $content.= ", id=" . $this->featureId;
      if( count($pks)>0 )
        $content.= ", pk=" . implode(',', $pks);
      $eventParams = array(
        'key' => 'editionDeleteFeature',
        'content' => $content,
        'repository' => $this->repository->getKey(),
        'project' => $this->project->getKey()
      );
      jEvent::notify('LizLogItem', $eventParams);

      foreach( $deleteFiles as $path ) {
          if ( file_exists( $path ) )
            unlink( $path );
      }

    } catch (Exception $e) {
      jLog::log("SQL = ".$sql);
      jLog::log("An error has been raised when saving form data edition to db : ".$e->getMessage() ,'error');
      jMessage::add( jLocale::get('view~edition.message.error.delete'), 'error');
    }
    return $this->serviceAnswer();
  }

  /**
   * Link features between 2 tables via pivot table
   *
   * @param string $repository Lizmap Repository
   * @param string $project Name of the project
   * @param string $pivot Pivot layer id. Example : mypivot1234
   * @param string $features1 Layer id + features. Example : mylayer456:1,2
   * @param string $features2 Layer id + features. Example : otherlayer789:5
   * @param integer $featureId Id of the feature.
   * @return Redirect to the validation action.
   */
    public function linkFeatures(){

        $features1 = $this->param('features1');
        $features2 = $this->param('features2');
        $pivotId = $this->param('pivot');
        if( !$features1 or !$features2 or !$pivotId ) {
            jMessage::add(jLocale::get("view~edition.link.error.missing.parameter"), 'error');
            return $this->serviceAnswer();
        }

        // Cut layers id and features ids
        $exp1 = explode(':', $features1);
        $exp2 = explode(':', $features2);
        if( count($exp1) != 3 or count($exp2) != 3 ){
            jMessage::add(jLocale::get("view~edition.link.error.missing.parameter"), 'error');
            return $this->serviceAnswer();
        }

        $ids1 = explode( ',', $exp1[2] );
        $ids2 = explode( ',', $exp2[2] );
        if( count($ids1) > 1 and count($ids2) > 1 ){
            jMessage::add(jLocale::get("view~edition.link.error.multiple.ids"), 'error');
            return $this->serviceAnswer();
        }
        if( count($ids1) == 0 or count($ids2) == 0 or empty( $exp1[2] ) or empty( $exp2[2] ) ){
            jMessage::add( jLocale::get("view~edition.link.error.missing.id"), 'error');
            return $this->serviceAnswer();
        }

        $project = $this->param('project');
        $repository = $this->param('repository');

        // Get repository data
        $lrep = lizmap::getRepository($repository);
        if(!$lrep){
          jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');
          return $this->serviceAnswer();
        }
        // Get the project data
        $lproj = null;
        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if(!$lproj){
                jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
                return $this->serviceAnswer();
            }
        }
        catch(UnknownLizmapProjectException $e) {
            jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
            return $this->serviceAnswer();
        }

        $this->project = $lproj;
        $this->repository = $lrep;

        // Get layer names
        $layerXml1 = $lproj->getXmlLayer( $exp1[0] );
        $layerXml2 = $lproj->getXmlLayer( $exp2[0] );

        if ( !$layerXml1 or !$layerXml2 ) {
            jMessage::add( jLocale::get("view~edition.link.error.wrong.layer"), 'error' );
            return $this->serviceAnswer();
        }

        $layerXmlZero1 = $layerXml1[0];
        $_layerName1 = $layerXmlZero1->xpath('layername');
        $layerName1 = (string)$_layerName1[0];
        $layerXmlZero2 = $layerXml2[0];
        $_layerName2 = $layerXmlZero2->xpath('layername');
        $layerName2 = (string)$_layerName2[0];

        $pConfig = $lproj->getFullCfg();
        if ( !$lproj->hasAttributeLayers()
            or !property_exists($pConfig->attributeLayers, $layerName1)
            or !property_exists($pConfig->attributeLayers, $layerName2)
        ) {
            jMessage::add( jLocale::get("view~edition.link.error.not.attribute.layer"), 'error' );
            return $this->serviceAnswer();
        }

        $layerXml = $lproj->getXmlLayer( $pivotId );
        $layerXmlZero = $layerXml[0];
        $_layerName = $layerXmlZero->xpath('layername');
        $layerNamePivot = (string)$_layerName[0];
        $this->layerXml = $layerXml;

        // Get editLayer capabilities
        $eLayers  = $lproj->getEditionLayers();
        $eLayer = $eLayers->$layerNamePivot;
        if( $layerNamePivot == $layerName2 ){
            // pivot layer (n:m)
            if ( $eLayer->capabilities->createFeature != 'True' ) {
                jMessage::add('Create feature for this layer ' . $layerNamePivot . ' is not in the capabilities!', 'LayerNotEditable');
                return $this->serviceAnswer();
            }
        }else{
            // child layer (1:n)
            if ( $eLayer->capabilities->modifyAttribute != 'True' ) {
                jMessage::add('Modify attributes for this layer ' . $layerNamePivot . ' is not in the capabilities!', 'LayerNotEditable');
                return $this->serviceAnswer();
            }
        }

        // Get fields data from the edition database
        $_datasource = $layerXmlZero->xpath('datasource');
        $datasource = (string)$_datasource[0];
        $s_provider = $layerXmlZero->xpath('provider');
        $this->provider = (string)$s_provider[0];
        $this->layerId = $pivotId;
        $this->layer = $lproj->getLayer( $pivotId );
        $this->layerName = $layerNamePivot;
        $this->getDataFields($datasource);

        // Check fields
        if( !array_key_exists( $exp1[1], $this->dataFields ) or !array_key_exists( $exp2[1], $this->dataFields ) ){
            jMessage::add('Given fields do not exists !', 'error');
            return $this->serviceAnswer();
        }
        $key1 = $exp1[1];
        $key2 = $exp2[1];

        // Check if we need to insert a new row in a pivot table (n:m)
        // or if we need to update a foreign key in a child table ( 1:n)
        if( $layerNamePivot == $layerName2 ){
            // 1:n relation

            // Build SQL
            $sql = '';
            $cnx = jDb::getConnection($this->layerId);
            $msg = false;
            foreach( $ids1 as $a ){
                $one = (int) $a;
                if( $this->dataFields[$key1]->unifiedType != 'integer' )
                    $one = $cnx->quote( $one );
                foreach( $ids2 as $b ){
                    $two = (int) $b;
                    if( $this->dataFields[$key2]->unifiedType != 'integer' )
                        $two = $cnx->quote( $two );
                    $sql = ' UPDATE '.$this->table;
                    $sql.= ' SET "' . $key2 . '" = ' . $one;
                    $sql.= ' WHERE "' . $key1 . '" = ' . $two ;
                    $sql.= ';';

                    // Need to break SQL ( if sqlite
                    try {
                        $rs = $cnx->query($sql);
                        if(!$msg){
                            jMessage::add( jLocale::get('view~edition.link.success'), 'success');
                        }
                        $msg = true;
                    } catch (Exception $e) {
                        jLog::log("An error has been raised when modifiying data : ".$e->getMessage() ,'error');
                        jLog::log("SQL = ".$sql);
                        jMessage::add( jLocale::get('view~edition.link.error.sql'), 'error');
                    }

                }
                break;
            }

        }
        else{
            // pivot table ( n:m relation )

            // Build SQL
            $sql = '';
            $cnx = jDb::getConnection($this->layerId);
            foreach( $ids1 as $a ){
                $one = (int) $a;
                if( $this->dataFields[$key1]->unifiedType != 'integer' )
                    $one = $cnx->quote( $one );
                foreach( $ids2 as $b ){
                    $two = (int) $b;
                    if( $this->dataFields[$key2]->unifiedType != 'integer' )
                        $two = $cnx->quote( $two );
                    $sql.= ' INSERT INTO '.$this->table.' (';
                    $sql.= ' "' . $key1 . '" , ';
                    $sql.= ' "' . $key2 . '" )';
                    $sql.= ' SELECT '. $one . ', ' . $two ;
                    $sql.= ' WHERE NOT EXISTS';
                    $sql.= ' ( SELECT ';
                    $sql.= ' "' . $key1 . '" , ';
                    $sql.= ' "' . $key2 . '" ';
                    $sql.= ' FROM '.$this->table;
                    $sql.= ' WHERE "' . $key1 . '" = ' . $one ;
                    $sql.= ' AND "' . $key2 . '" = ' . $two . ')';
                    $sql.= ';';
                }
            }

            try {
                $rs = $cnx->query($sql);
                jMessage::add( jLocale::get('view~edition.link.success'), 'success');
            } catch (Exception $e) {
                jLog::log("An error has been raised when modifiying data : ".$e->getMessage() ,'error');
                jLog::log("SQL = ".$sql);
                jMessage::add( jLocale::get('view~edition.link.error.sql'), 'error');
            }

        }




        return $this->serviceAnswer();
    }

  /**
   * Unlink child feature from their parent ( 1:n ) relation
   * by setting the foreign key to NULL
   *
   * @param string $repository Lizmap Repository
   * @param string $project Name of the project
   * @param string $layerId Child layer id.
   * @param string $pkey Child layer primary key value -> id of the line to update
   * @param string $fkey Child layer foreign key column (pointing to the parent layer primary key)
   * @return Redirect to the validation action.
   */
    function unlinkChild(){
        $lid = $this->param('lid');
        $fkey = $this->param('fkey');
        $pkey = $this->param('pkey');
        $pkeyval = $this->param('pkeyval');
        $project = $this->param('project');
        $repository = $this->param('repository');

        if( !$lid or !$fkey or !$pkey or !$pkeyval or !$project or !$repository ) {
            jMessage::add(jLocale::get("view~edition.link.error.missing.parameter"), 'error');
            return $this->serviceAnswer();
        }

        // Get repository data
        $lrep = lizmap::getRepository($repository);
        if(!$lrep){
          jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');
          return $this->serviceAnswer();
        }
        // Get the project data
        $lproj = null;
        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if(!$lproj){
                jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
                return $this->serviceAnswer();
            }
        }
        catch(UnknownLizmapProjectException $e) {
            jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
            return $this->serviceAnswer();
        }
        $this->project = $lproj;
        $this->repository = $lrep;

        // Get child layer information
        $layerXml = $lproj->getXmlLayer( $lid );
        $layerXmlZero = $layerXml[0];
        $_layerName = $layerXmlZero->xpath('layername');
        $layerName = (string)$_layerName[0];
        $this->layerXml = $layerXml;

        // Get editLayer capabilities
        $eLayers  = $lproj->getEditionLayers();
        $eLayer = $eLayers->$layerName;
        if ( $eLayer->capabilities->modifyAttribute != 'True' ) {
            jMessage::add('Modify feature attributes for this layer ' . $layerName . ' is not in the capabilities!', 'LayerNotEditable');
            return $this->serviceAnswer();
        }

        // Get fields data from the edition database
        $_datasource = $layerXmlZero->xpath('datasource');
        $datasource = (string)$_datasource[0];
        $s_provider = $layerXmlZero->xpath('provider');
        $this->provider = (string)$s_provider[0];
        $this->layerId = $lid;
        $this->layerName = $layerName;
        $this->getDataFields($datasource);

        // Check fields
        if( !array_key_exists( $fkey, $this->dataFields ) or !array_key_exists( $pkey, $this->dataFields ) ){
            jMessage::add('Given fields do not exists !', 'error');
            return $this->serviceAnswer();
        }


        // Build SQL
        $sql = '';
        $cnx = jDb::getConnection( $this->layerId );
        $msg = false;

        $val = (int) $pkeyval;
        if( $this->dataFields[$pkey]->unifiedType != 'integer' )
            $val = $cnx->quote( $val );
        $sql = ' UPDATE '.$this->table;
        $sql.= ' SET "' . $fkey . '" = NULL';
        $sql.= ' WHERE "' . $pkey . '" = ' . $val ;
        $sql.= ';';

        // Need to break SQL ( if sqlite
        try {
            $rs = $cnx->query($sql);
            if(!$msg){
                jMessage::add( jLocale::get('view~edition.unlink.success'), 'success');
            }
            $msg = true;
        } catch (Exception $e) {
            jLog::log("An error has been raised when modifiying data : ".$e->getMessage() ,'error');
            jLog::log("SQL = ".$sql);
            jMessage::add( jLocale::get('view~edition.unlink.error.sql'), 'error');
        }



        return $this->serviceAnswer();

    }
}
