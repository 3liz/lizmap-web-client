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

    // Get title layer
    $layerXmlZero = $this->layerXml[0];
    $_title = $layerXmlZero->xpath('title');
    $title = (string)$_title[0];
    if ( !$title )
      $title = jLocale::get("view~edition.modal.title.default");

    $messages = jMessage::getAll();
    $rep = $this->getResponse('htmlfragment');
    $tpl = new jTpl();
    $tpl->assign('title', $title);
    $content = $tpl->fetch('view~jmessage_modal');
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
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return false;
    }

    // Get repository data
    $lrep = lizmap::getRepository($repository);
    $lproj = lizmap::getProject($repository.'~'.$project);

    // Redirect if no rights to access this repository
    if(!jacl2::check('lizmap.repositories.view', $lrep->getKey())){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return false;
    }

    // Redirect if no rights to use the edition tool
    if(!jacl2::check('lizmap.tools.edition.use', $lrep->getKey())){
      jMessage::add(jLocale::get('view~edition.access.denied'), 'AuthorizationRequired');
      return false;
    }

    $layerXml = $lproj->getXmlLayer( $layerId );
    $layerXmlZero = $layerXml[0];
    $_layerName = $layerXmlZero->xpath('layername');
    $layerName = (string)$_layerName[0];

    // feature Id (optionnal, only for edition and save)
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
    $this->layerXml = $layerXml;
    $this->layerName = $layerName;

    // Optionnaly filter data by login
    if( !jacl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey()) ){
      $this->loginFilteredLayers = True;
    }
    $this->loginFilteredOveride = jacl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey());

    return true;
  }


  /**
  * Filter data by login if necessary
  * as configured in the plugin for login filtered layers.
  */
  protected function filterDataByLogin($layername) {

    // Optionnaly add a filter parameter
    $lproj = lizmap::getProject($this->repository->getKey().'~'.$this->project->getKey());
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
         && $pConfig->loginFilteredLayers->$layername->filterPrivate = 'True')
          $type = 'login';

        // Check if a user is authenticated
        $isConnected = jAuth::isConnected();
        $cnx = jDb::getConnection();
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
          $this->loginFilteredLayers = array(
            'where' => $where,
            'type' => $type,
            'attribute' => $attribute
          );
        }
      }
    }
  }

  /**
  * Get field data from a database layer corresponding to a QGIS layer
  * @param string $datasource String corresponding to the QGIS <datasource> item for the layer
  * @return object containing the sql fields information
  */
  private function getDataFields($datasource){

    // Get datasource information from QGIS
    $datasourceMatch = preg_match(
      "#dbname='([^ ]+)' (?:host=([^ ]+) )?(?:port=([0-9]+) )?(?:user='([^ ]+)' )?(?:password='([^ ]+)' )?(?:sslmode=([^ ]+) )?(?:key='([^ ]+)' )?(?:estimatedmetadata=([^ ]+) )?(?:srid=([0-9]+) )?(?:type=([a-zA-Z]+) )?(?:table=\"(.+)\" \()?(?:([^ ]+)\) )?(?:sql=(.*))?#",
      $datasource,
      $dt
    );
    $dbname = $dt[1];
    $host = $dt[2]; $port = $dt[3];
    $user = $dt[4]; $password = $dt[5];
    $sslmode = $dt[6]; $key = $dt[7];
    $estimatedmetadata = $dt[8];
    $srid = $dt[9]; $type = $dt[10];
    $table = $dt[11];
    $geocol = $dt[12];
    $sql = $dt[13];

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
      $jdbParams = array(
        "driver" => $driver,
        "host" => $host,
        "port" => (integer)$port,
        "database" => $dbname,
        "user" => $user,
        "password" => $password
      );
    }

    // Create the virtual jdb profile
    $profile = $this->layerId;
    jProfiles::createVirtualProfile('jdb', $profile, $jdbParams);

    // Get the fields using jelix tools for this connection
    $cnx = jDb::getConnection($profile);
    $tools = $cnx->tools();
    $sequence = null;
    $fields = $tools->getFieldList($tableAlone, $sequence);
    $this->dataFields = $fields;

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
    jClasses::inc('lizmap~qgisFormControl');
    $this->formControls = array();
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

      // Fill comboboxes of editType "Value relation" from relation layer
      // Query QGIS Server via WFS
      if( ($this->formControls[$fieldName]->fieldEditType == 15
      or $this->formControls[$fieldName]->fieldEditType == 'ValueRelation')
        and $this->formControls[$fieldName]->valueRelationData
      ){
        $this->fillComboboxFromValueRelationLayer($fieldName);
      }

      // Add the control to the form
      $form->addControl($this->formControls[$fieldName]->ctrl);
      // Set readonly if needed
      $form->setReadOnly($fieldName, $this->formControls[$fieldName]->isReadOnly);


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
        $this->filterDataByLogin($this->layerName);

    if ( is_array($this->loginFilteredLayers) ) {
        $type = $this->loginFilteredLayers['type'];
        $attribute = $this->loginFilteredLayers['attribute'];
        //jLog::log('updateFormByLogin', 'error');

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
                    //jLog::log('updateFormByLogin '.$uGroup, 'error');
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
  * Get WFS data from a "Value Relation" layer and fill the combobox form control for a specific field.
  * @param string $fieldName Name of QGIS field
  *
  * @return Modified form control
  */
  private function fillComboboxFromValueRelationLayer($fieldName){

    // Build WFS request parameters
    //   Get layername via id
    $relationLayerId = $this->formControls[$fieldName]->valueRelationData['layer'];
    $_relationayerXml = $this->project->getXmlLayer($relationLayerId);
    $relationayerXml = $_relationayerXml[0];
    $_layerName = $relationayerXml->xpath('layername');
    $layerName = (string)$_layerName[0];
    $valueColumn = $this->formControls[$fieldName]->valueRelationData['value'];
    $keyColumn = $this->formControls[$fieldName]->valueRelationData['key'];
    $filterExpression = $this->formControls[$fieldName]->valueRelationData['filterExpression'];
    $params = array(
      'SERVICE' => 'WFS',
      'VERSION' => '1.0.0',
      'REQUEST' => 'GetFeature',
      'TYPENAME' => $layerName,
      'PROPERTYNAME' => $valueColumn.','.$keyColumn,
      'OUTPUTFORMAT' => 'GeoJSON',
      'map' => $this->repository->getPath().$this->project->getKey().".qgs"
    );
    // add EXP_FILTER. Only for QGIS >=2.0
    $expFilter = Null;
    if($filterExpression){
      $expFilter = $filterExpression;
    }
    // Filter by login
    if( !$this->loginFilteredOveride ) {
      $this->filterDataByLogin($layerName);
      if( is_array( $this->loginFilteredLayers )){
        if($expFilter){
          $expFilter = " ( ".$expFilter." ) AND ( ".$this->loginFilteredLayers['where']." ) ";
        }else {
          $expFilter = $this->loginFilteredLayers['where'];
        }
      }
    }
    if($expFilter)
      $params['EXP_FILTER'] = $expFilter;

    // Build query
    $lizmapServices = lizmap::getServices();
    $url = $lizmapServices->wmsServerURL.'?';
    $bparams = http_build_query($params);
    $querystring = $url . $bparams;

    // Get remote data
    $lizmapCache = jClasses::getService('lizmap~lizmapCache');
    $getRemoteData = $lizmapCache->getRemoteData(
      $querystring,
      $lizmapServices->proxyMethod,
      $lizmapServices->debugMode
    );
    $wfsData = $getRemoteData[0];
    $mime = $getRemoteData[1];

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
      // orderByValue
      if ( strtolower($this->formControls[$fieldName]->valueRelationData['orderByValue']) == 'true'
        || strtolower($this->formControls[$fieldName]->valueRelationData['orderByValue']) == '1' )
        asort($data);
      $dataSource->data = $data;
      $this->formControls[$fieldName]->ctrl->datasource = $dataSource;
      $this->formControls[$fieldName]->ctrl->emptyItemLabel = '';
      // required
      if ( strtolower($this->formControls[$fieldName]->valueRelationData['allowNull']) == 'false'
        || strtolower($this->formControls[$fieldName]->valueRelationData['allowNull']) == '0' )
        $this->formControls[$fieldName]->ctrl->required = True;
    }
    else{
      if(!preg_match('#No feature found error messages#', $wfsData)){
        $this->formControls[$fieldName]->ctrl->hint = 'Problem : cannot get data to fill this combobox !';
        $this->formControls[$fieldName]->ctrl->help = 'Problem : cannot get data to fill this combobox !';
      }else{
        $this->formControls[$fieldName]->ctrl->hint = 'No data to fill this combobox !';
        $this->formControls[$fieldName]->ctrl->help = 'No data to fill this combobox !';
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
      foreach ( $this->dataFields as $ref=>$prop ) {
          if ( $prop->hasDefault )
              $form->setData( $ref, $prop->default );
      }
      return true;
  }


  /**
  * Set the form controls data from the database value
  *
  * @param object $form Jelix jForm object
  * @return Boolean True if filled form
  */
  public function setFormDataFromFields( $form ) {
      $this->setFormDataFromDefault($form);

    // Get database connection object
    $cnx = jDb::getConnection($this->layerId);

    // Get the array of feature ids
    if(ctype_digit($this->featureId))
      $featureId = array($this->featureId);

    // Build the SQL query to retrieve data from the table
    $sql = "SELECT *, ST_AsText(".$this->geometryColumn.") AS astext FROM ".$this->table;
    $v = ''; $i = 0;
    $sql.= ' WHERE';
    foreach($this->primaryKeys as $key){
      $sql.= "$v $key = ".$featureId[$i];
      $i++;
      $v = " AND ";
    }

    // Run the query and loop through the result to set the form data
    $rs = $cnx->query($sql);
    foreach($rs as $record){
      // Loop through the data fields
      foreach($this->dataFields as $ref=>$prop){
        $form->setData($ref, $record->$ref);
      }
      // geometry column : override binary with text representation
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

    // Get list of fields which are not primary keys
    $fields = array();
    foreach($this->dataFields as $fieldName=>$prop){
      if(!$prop->primary)
        $fields[] = $fieldName;
    }

    // Loop though the fields and filter the form posted values
    $update = array(); $insert = array(); $refs= array();
    foreach($fields as $ref){
      // Get and filter the posted data foreach form control
      $value = $form->getData($ref);

      switch($this->formControls[$ref]->fieldDataType){
      case 'geometry':
        $value = "ST_GeomFromText('".filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)."', ".$this->srid.")";
        $rs = $cnx->query('SELECT GeometryType('.$value.') as geomtype');
        $rs = $rs->fetch();
        if ( !preg_match('/'.$this->geometryType.'/',strtolower($rs->geomtype)) )
          if ( preg_match('/'.str_replace('multi','',$this->geometryType).'/',strtolower($rs->geomtype)) )
            $value = 'ST_Multi('.$value.')';
          else {
            $form->setErrorOn($this->geometryColumn, "The geometry type doen't match!");
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
      default:
        $value = $cnx->quote(
          filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)
        );
        break;
      }
      // Build the SQL insert and update query
      $insert[]=$value;
      $refs[]='"'.$ref.'"';
      $update[]='"'.$ref.'"='.$value;
    }

    $sql = '';
    // update
    if($this->featureId){
      if(ctype_digit($this->featureId))
        $featureId = array($this->featureId);
      // featureId is set
      // SQL for updating on line in the edition table
      $sql = " UPDATE ".$this->table." SET ";
      $sql.= implode(', ', $update);
      $v = ''; $i = 0;
      $sql.= ' WHERE';
      foreach($this->primaryKeys as $key){
        $sql.= "$v $key = ".$featureId[$i];
        $i++;
        $v = " AND ";
      }
      // Add login filter if needed
      if( !$this->loginFilteredOveride ) {
        $this->filterDataByLogin($this->layerName);
        if( is_array( $this->loginFilteredLayers ) ){
          $sql.= ' AND '.$this->loginFilteredLayers['where'];
        }
      }
    }
    // insert
    else {
      // SQL for insertion into the edition this->table
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
   * Get features from the edition layer.
   * @param string $repository Lizmap Repository
   * @param string $project Name of the project
   * @param string $layerId Qgis id of the layer
   * @param string $bbox Bounding box for the query
   * @param string $crs The CRS of the bounding box
   * @return HTML fragment.
   */
  public function getFeature(){

    // Get repository, project data and do some right checking
    if(!$this->getEditionParameters())
      return $this->serviceAnswer();
    $bbox = $this->param('bbox');
    if( !preg_match('#(-)?\d+(\.\d+)?,(-)?\d+(\.\d+)?,(-)?\d+(\.\d+)?,(-)?\d+(\.\d+)?#',$bbox) ) {
      jMessage::add( jLocale::get('view~edition.message.error.bbox'), 'error');
      return $this->serviceAnswer();
    }
    $crs = str_replace('EPSG:','',$this->param('crs'));
    if (!preg_match('/^[1-9][0-9]*$/', $crs)) {
      jMessage::add( jLocale::get('view~edition.message.error.crs'), 'error');
      return $this->serviceAnswer();
    }

    // Get fields data from the edition database
    $layerXmlZero = $this->layerXml[0];
    $_datasource = $layerXmlZero->xpath('datasource');
    $datasource = (string)$_datasource[0];
    $s_provider = $layerXmlZero->xpath('provider');
    $this->provider = (string)$s_provider[0];
    $this->getDataFields($datasource);

    // Get proj4 string
    $proj4 = (string)$layerXmlZero->srs->spatialrefsys->proj4;
    $this->proj4 = $proj4;

    // Get layer srid
    $srid = (integer)$layerXmlZero->srs->spatialrefsys->srid;
    $this->srid = $srid;

    // Optionnaly query for the feature
    $cnx = jDb::getConnection($this->layerId);

    $sql = "SELECT *, ST_AsText(".$this->geometryColumn.") AS astext FROM ".$this->table;
    if ( $this->provider == 'spatialite' )
      $sql .= " WHERE intersects( BuildMBR(".$bbox.", ".$crs." ), transform(".$this->geometryColumn.", ".$crs." ) )";
    else
      $sql .= " WHERE ST_Intersects( ST_MakeEnvelope(".$bbox.", ".$crs." ), ST_Transform(".$this->geometryColumn.", ".$crs." ) )";

    // Add the QGIS WHERE clause if needed
    if($this->whereClause)
      $sql.= ' AND '.$this->whereClause;

    // Filter by login if needed
    if( !$this->loginFilteredOveride ) {
      $this->filterDataByLogin($this->layerName);
      if( is_array( $this->loginFilteredLayers )){
        $sql .= ' AND '.$this->loginFilteredLayers['where'];
      }
    }

    // Get the corresponding features
    try {
      // Run the query and loop through the result to set an array
      $forms = array();
      $rs = $cnx->query($sql);
      foreach($rs as $record){
        // featureId
        $featureId = array();
        foreach($this->primaryKeys as $pk) {
          $featureId[] = $record->$pk;
        }
        //create form
        $form = jForms::create('view~edition', implode(',',$featureId));
        $form->setData('liz_repository', $this->repository->getKey());
        $form->setData('liz_project', $this->project->getKey());
        $form->setData('liz_layerId', $this->layerId);
        $form->setData('liz_featureId', implode(',',$featureId) );

        $this->addFormControls($form);

        $form->setData('liz_srid', $this->srid);
        $form->setData('liz_proj4', $this->proj4);
        $form->setData('liz_geometryColumn', $this->geometryColumn);

        // Loop through the data fields
        foreach($this->dataFields as $ref=>$prop){
          $form->setData($ref, $record->$ref);
        }
        // geometry column : override binary with text representation
        $form->setData($this->geometryColumn, $record->astext);

        // redo some code for templating the data
        $controls = array();
        foreach($form->getControls() as $ctrlref=>$ctrl){
          if($ctrl->type == 'reset' || $ctrl->type == 'hidden') continue;
          if($ctrl->type == 'submit' && $ctrl->standalone) continue;
          if($ctrl->type == 'captcha' || $ctrl->type == 'secretconfirm') continue;
          $value = $form->getData($ctrlref);
          $value = $ctrl->getDisplayValue($value);
          if(is_array($value)){
            $s ='';
            foreach($value as $v){
              $s.=$sep.htmlspecialchars($v);
            }
            $value = substr($s, strlen($sep));
          }elseif($ctrl->isHtmlContent())
            $value = $value;
          else if($ctrl->type == 'textarea')
            $value = nl2br(htmlspecialchars($value));
          else
            $value = htmlspecialchars($value);
          $controls[] = (object) array("label"=>$ctrl->label,"value"=>$value);
        }
        $hidden = array(
          'liz_srid'=>$form->getData('liz_srid'),
          'liz_proj4'=>$form->getData('liz_proj4'),
          'liz_geometryColumn'=>$form->getData('liz_geometryColumn'),
          $form->getData('liz_geometryColumn')=>$form->getData( $form->getData('liz_geometryColumn') ),
          'liz_featureId'=>$form->getData('liz_featureId'),
        );
        $forms[] = (object) array('controls'=>$controls,'hidden'=>$hidden);
      }
      // Get title layer
      $layerXmlZero = $this->layerXml[0];
      $_title = $layerXmlZero->xpath('title');
      $title = (string)$_title[0];

      // Use template to create html form content
      $tpl = new jTpl();
      $tpl->assign(array(
        'title'=>$title,
        'forms'=>$forms
      ));
      $content = $tpl->fetch('view~edition_data');

      // Return html fragment response
      $rep = $this->getResponse('htmlfragment');
      $rep->addContent($content);
      return $rep;
    } catch (Exception $e) {
      jMessage::add('An error occured for : \''.$sql.'\', the message:'.$e->getMessage(), 'error');
    }
    return $this->serviceAnswer();
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
    if($this->featureId)
      $this->setFormDataFromFields($form);
    else
      $this->setFormDataFromDefault($form);


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
    $attribute = $this->loginFilteredLayers['attribute'];
    //jLog::log('updateFormByLogin '.json_encode($this->loginFilteredLayers), 'error');

    // Get title layer
    $layerXmlZero = $this->layerXml[0];
    $_title = $layerXmlZero->xpath('title');
    $title = (string)$_title[0];

    // Use template to create html form content
    $tpl = new jTpl();
    $tpl->assign(array(
      'title'=>$title,
      'form'=>$form
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
    if ( $form->getData( $this->geometryColumn ) == '' ) {
      $check = False;
      $form->setErrorOn($this->geometryColumn, "You must set the geometry");
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

    // Log
    $eventParams = array(
      'key' => 'editionSaveFeature',
      'content' => "table=".$this->tableName.", id=".$this->featureId,
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
    if(!$this->getEditionParameters($save))
      return $this->serviceAnswer();

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
    // featureId is set
    // SQL for deleting on line in the edition table
    $sql = " DELETE FROM ".$this->table;
    $v = ''; $i = 0;
    $sql.= ' WHERE';
    foreach($this->primaryKeys as $key){
      $sql.= "$v $key = ".$featureId[$i];
      $i++;
      $v = " AND ";
    }
    // Add login filter if needed
    if( !$this->loginFilteredOveride ) {
      $this->filterDataByLogin($this->layerName);
      if( is_array( $this->loginFilteredLayers ) ){
        $sql.= ' AND '.$this->loginFilteredLayers['where'];
      }
    }

    try {
      $rs = $cnx->query($sql);
      jMessage::add( jLocale::get('view~edition.message.success.delete'), 'success');

      // Log
      $eventParams = array(
        'key' => 'editionDeleteFeature',
        'content' => "table=".$this->tableName.", id=".$this->featureId,
        'repository' => $this->repository->getKey(),
        'project' => $this->project->getKey()
      );
      jEvent::notify('LizLogItem', $eventParams);

    } catch (Exception $e) {
      jLog::log("SQL = ".$sql);
      jLog::log("An error has been raised when saving form data edition to db : ".$e->getMessage() ,'error');
      jMessage::add( jLocale::get('view~edition.message.success.delete'), 'error');
    }
    return $this->serviceAnswer();
  }

}
