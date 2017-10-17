<?php
/**
* Create and set jForms form based on QGIS vector layer.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


class qgisForm {

    protected $layer = null;
    protected $form = null;
    protected $featureId = null;
    protected $loginFilteredOveride = False;

    protected $dbFieldsInfo = null;
    protected $formControls = array();

    public function __construct ( $layer, $form, $featureId, $loginFilteredOveride ){
        if ( $layer->getType() != 'vector' )
            throw new Exception('The layer "'.$layer->getName().'" is not a vector layer!');
        if ( !$layer->isEditable() )
            throw new Exception('The layer "'.$layer->getName().'" is not an editable vector layer!');

        //Get the fields info
        $dbFieldsInfo = $layer->getDbFieldsInfo();
        // verifying db fields info
        if ( !$dbFieldsInfo )
            throw new Exception('Can\'t get Db fields information for the layer "'.$layer->getName().'"!');

        if( count($dbFieldsInfo->primaryKeys) == 0 )
            throw new Exception('The layer "'.$layer->getName().'" has no primary keys. The edition tool needs a primary key on the table to be defined.');

        $this->layer = $layer;
        $this->form = $form;
        $this->featureId = $featureId;
        $this->loginFilteredOveride = $loginFilteredOveride;

        $this->dbFieldsInfo = $dbFieldsInfo;

        $layerXml = $layer->getXmlLayer();
        $edittypesXml = $layerXml->edittypes[0];
        $categoriesXml = $layerXml->xpath('renderer-v2/categories');
        if ( $categoriesXml && count( $categoriesXml ) != 0 )
            $categoriesXml = $categoriesXml[0];
        else
            $categoriesXml = null;

        $eCapabilities = $layer->getEditionCapabilities();
        $capabilities = $eCapabilities->capabilities;
        $aliases = $layer->getAliasFields();
        $dataFields = $dbFieldsInfo->dataFields;
        $toDeactivate = array();
        $toSetReadOnly = array();
        foreach( $dataFields as $fieldName=>$prop ) {
            // get field edit type
            $edittype = null;
            if ( $edittypesXml ) {
                $edittype = $edittypesXml->xpath("edittype[@name='$fieldName']");
                if ( $edittype && count( $edittype ) != 0 )
                    $edittype = $edittype[0];
                else
                  $edittype = null;
            }
            // get field alias
            $alias = null;
            if ( $aliases and array_key_exists( $fieldName, $aliases ) )
                $alias = $aliases[$fieldName];
            $formControl = new qgisFormControl($fieldName, $edittype, $alias, $categoriesXml, $prop);

            if( ( $formControl->fieldEditType == 15
                  or $formControl->fieldEditType == 'ValueRelation')
                and $formControl->valueRelationData ){
                // Fill comboboxes of editType "Value relation" from relation layer
                // Query QGIS Server via WFS
                $this->fillControlFromValueRelationLayer( $fieldName, $formControl );
            } else if ( $formControl->fieldEditType == 8
                        or $formControl->fieldEditType == 'FileName'
                        or $formControl->fieldEditType == 'Photo' ) {
                // Add Hidden Control for upload
                // help to retrieve file path
                $hiddenCtrl = new jFormsControlHidden($fieldName.'_hidden');
                $form->addControl($hiddenCtrl);
                $toDeactivate[] = $fieldName.'_choice';
            }

            // Add the control to the form
            $form->addControl($formControl->ctrl);
            // Set readonly if needed
            $form->setReadOnly($fieldName, $formControl->isReadOnly);

            // Hide when no modify capabilities, only for UPDATE cases ( when $this->featureId control exists )
            if ( !empty($featureId)
                and strtolower( $capabilities->modifyAttribute ) == 'false'
                and $fieldName != $dbFieldsInfo->geometryColumn ){
                if( $prop->primary )
                    $toSetReadOnly[] = $fieldName;
                else
                    $toDeactivate[] = $fieldName;
            }

            $this->formControls[$fieldName] = $formControl;
        }

        // Hide when no modify capabilities, only for UPDATE cases (  when $this->featureId control exists )
        if( !empty($featureId) && strtolower($capabilities->modifyAttribute) == 'false'){
            foreach( $toDeactivate as $de ){
                if( $form->getControl( $de ) )
                    $form->deactivate( $de, true );
            }
            foreach( $toSetReadOnly as $de ){
                if( $form->getControl( $de ) )
                    $form->setReadOnly( $de, true );
            }
        }

    }

    /**
     * Set the form controls data from the database default value
     *
     * @return object the Jelix jForm object
     */
    public function setFormDataFromDefault() {
        if ( !$this->dbFieldsInfo )
            return $this->form;

        $form = $this->form;

        // Get dafult values
        $defaultValues = $this->layer->getDbFieldDefaultValues();
        foreach ( $defaultValues as $ref=>$val ) {
            $ctrl = $form->getControl( $ref );
            // only set default value for non hidden field
            if( $ctrl->type == 'hidden' )
                continue;
            $form->setData( $ref, $val );
        }
        return $form;
    }

    /**
     * Set the form controls data from the database value
     *
     * @return object the Jelix jForm object
     */
    public function setFormDataFromFields( $feature ){
        if ( !$this->dbFieldsInfo )
            return $this->form;

        $form = $this->form;
        $values = $this->layer->getDbFieldValues( $feature );
        foreach ( $values as $ref=>$value ) {
            $form->setData($ref, $value);
            // ValueRelation can be an array (i.e. {1,2,3})
            if( $this->formControls[$ref]->fieldEditType == 15
                or $this->formControls[$ref]->fieldEditType === 'ValueRelation' ){
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
                    $path = explode( '/', $value );
                    $filename = array_pop($path);
                    $filename = preg_replace('#_|-#', ' ', $filename);
                    $ctrl->itemsNames['keep'] = jLocale::get("view~edition.upload.choice.keep") . ' ' . $filename;
                    $ctrl->itemsNames['update'] = jLocale::get("view~edition.upload.choice.update");
                    $ctrl->itemsNames['delete'] = jLocale::get("view~edition.upload.choice.delete") . ' ' . $filename;
                }
                $form->setData($ref.'_hidden', $value);
            }
        }
        return $form;
    }

    /**
     * Save the form to the database
     *
     */
    public function saveToDb( $feature = null ){
        if ( !$this->dbFieldsInfo )
            throw new Exception('Save to database can\'t be done for the layer "'.$this->layer->getName().'"!');

        // Update or Insert
        $updateAction = false; $insertAction = false;
        if( $this->featureId )
            $updateAction = true;
        else
            $insertAction = true;


        $eCapabilities = $this->layer->getEditionCapabilities();
        $capabilities = $eCapabilities->capabilities;

        $dataFields = $this->dbFieldsInfo->dataFields;
        $geometryColumn = $this->dbFieldsInfo->geometryColumn;

        // Get list of fields which are not primary keys
        $fields = array();
        foreach($dataFields as $fieldName=>$prop){
            // For update : And get only fields corresponding to edition capabilities
            if(
                ( strtolower($capabilities->modifyAttribute) == 'true' and $fieldName != $geometryColumn )
                or ( strtolower($capabilities->modifyGeometry) == 'true' and $fieldName == $geometryColumn )
                or $insertAction
            )
                $fields[] = $fieldName;
        }

        if( count($fields) == 0){
            jLog::log('Not enough capabilities for this layer ! SQL cannot be constructed: no fields available !' ,'error');
            $this->form->setErrorOn($this->geometryColumn, 'An error has been raised when saving the form: Not enough capabilities for this layer !');
            throw new Exception( jLocale::get('view~edition.link.error.sql') );
        }

        $form = $this->form;
        $cnx = $this->layer->getDatasourceConnection();
        $values = array();
        // Loop though the fields and filter the form posted values
        foreach($fields as $ref){
          // Get and filter the posted data foreach form control
          $value = $form->getData($ref);

          if(is_array($value)){
            $value = '{'.implode(',',$value).'}';
          }

          switch($this->formControls[$ref]->fieldDataType){
              case 'geometry':
                try {
                    $value = $this->layer->getGeometryAsSql( $value );
                } catch (Exception $e) {
                    $form->setErrorOn($this->geometryColumn, $e->getMessage());
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
            $project = $this->layer->getProject();
            $dtParams = $this->layer->getDatasourceParameters();
            $value = $form->getData( $ref );
            $choiceValue = $form->getData( $ref.'_choice' );
            $hiddenValue = $form->getData( $ref.'_hidden' );
            $repPath = $this->repository->getPath();
            if ( $choiceValue == 'update' && $value != '') {
                $refPath = realpath($repPath.'/media').'/upload/'.$project->getKey().'/'.$dtParams->tablename.'/'.$ref;
                $alreadyValueIdx = 0;
                while ( file_exists( $refPath.'/'.$value ) ) {
                    $alreadyValueIdx += 1;
                    $splitValue = explode('.', $value);
                    $splitValue[0] = $splitValue[0].$alreadyValueIdx;
                    $value = implode('.', $splitValue);
                }
                $form->saveFile( $ref, $refPath, $value );
                $value = 'media'.'/upload/'.$project->getKey().'/'.$dtParams->tablename.'/'.$ref.'/'.$value;
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

          $values[ $ref ] = $value;
        }

        try {
            if( $updateAction ) {
                $loginFilteredLayers = $this->filterDataByLogin($this->layer->getName());
                return $this->layer->updateFeature( $feature, $values, $loginFilteredLayers );
            } else {
                return $this->layer->insertFeature( $values );
            }
        } catch (Exception $e) {
            $form->setErrorOn($this->geometryColumn, 'An error has been raised when saving the form');
            jLog::log("An error has been raised when saving form data edition to db : ".$e->getMessage() ,'error');
            return false;
        }
        return 0;
    }

    /**
     * Delete the feature from the database
     *
     */
    public function deleteFromDb( $feature ){
        if ( !$this->dbFieldsInfo )
            throw new Exception('Delete from database can\'t be done for the layer "'.$this->layer->getName().'"!');

        $loginFilteredLayers = $this->filterDataByLogin($this->layer->getName());
        return $this->layer->deleteFeature( $feature, $loginFilteredLayers );
    }

    /**
     * Dynamically update form by modifying the filter by login control
     *
     * @return modified form.
     */
    public function updateFormByLogin() {
        $loginFilteredLayers = $this->filterDataByLogin($this->layer->getName());

        if ( $loginFilteredLayers && is_array($loginFilteredLayers) ) {
            $type = $loginFilteredLayers['type'];
            $attribute = $loginFilteredLayers['attribute'];

            $form = $this->form;

            // Check if a user is authenticated
            if ( !jAuth::isConnected() )
                return $form;

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
            return $form;
        }
        return $this->form;
    }

    /**
     * Get WFS data from a "Value Relation" layer and fill the form control for a specific field.
     * @param string $fieldName Name of QGIS field
     *
     * @return Modified form control
     */
    private function fillControlFromValueRelationLayer( $fieldName, $formControl ) {
        $wfsData = null;
        $mime = '';

        // Build WFS request parameters
        //   Get layername via id
        $project = $this->layer->getProject();
        $relationLayerId = $formControl->valueRelationData['layer'];

        $_relationLayerXml = $project->getXmlLayer($relationLayerId);
        if(count($_relationLayerXml) == 0){
            $formControl->ctrl->hint = 'Control not well configured!';
            $formControl->ctrl->help = 'Control not well configured!';
            return;
        }
        $relationLayerXml = $_relationLayerXml[0];

        $_layerName = $relationLayerXml->xpath('layername');
        if(count($_layerName) == 0){
            $formControl->ctrl->hint = 'Control not well configured!';
            $formControl->ctrl->help = 'Control not well configured!';
            return;
        }
        $layerName = (string)$_layerName[0];

        $valueColumn = $formControl->valueRelationData['value'];
        $keyColumn = $formControl->valueRelationData['key'];
        $filterExpression = $formControl->valueRelationData['filterExpression'];
        $typename = str_replace(' ', '_', $layerName);

        $params = array(
            'SERVICE' => 'WFS',
            'VERSION' => '1.0.0',
            'REQUEST' => 'GetFeature',
            'TYPENAME' => $typename,
            'PROPERTYNAME' => $valueColumn.','.$keyColumn,
            'OUTPUTFORMAT' => 'GeoJSON',
            'GEOMETRYNAME' => 'none',
            'map' => $project->getPath()
        );

        // add EXP_FILTER. Only for QGIS >=2.0
        $expFilter = Null;
        if ( $filterExpression ) {
            $expFilter = $filterExpression;
        }
        // Filter by login
        if( !$this->loginFilteredOveride ) {
          $loginFilteredLayers = $this->filterDataByLogin($layerName);
          if ( is_array( $loginFilteredLayers ) ) {
            if ( $expFilter ){
              $expFilter = " ( ".$expFilter." ) AND ( ".$loginFilteredLayers['where']." ) ";
            } else {
              $expFilter = $loginFilteredLayers['where'];
            }
          }
        }
        if ( $expFilter ) {
            $params['EXP_FILTER'] = $expFilter;
            // disable PROPERTYNAME in this case : if the exp_filter uses other fields, no data would be returned otherwise
            unset( $params['PROPERTYNAME'] );
        }

        // Perform request
        $wfsRequest = new lizmapWFSRequest( $project, $params );
        $result = $wfsRequest->process();

        $wfsData = $result->data;
        if( property_exists($result, 'file') and $result->file and is_file($wfsData) ){
            $wfsData = jFile::read($wfsData);
        }
        $mime = $result->mime;

        // Used data
        if ( $wfsData and !in_array( strtolower( $mime ), array( 'text/html', 'text/xml' ) ) ) {
            $wfsData = json_decode( $wfsData );
            // Get data from layer
            $features = $wfsData->features;
            $data = array();
            foreach( $features as $feat ) {
                if( property_exists( $feat, 'properties' )
                    and property_exists( $feat->properties, $keyColumn )
                    and property_exists( $feat->properties, $valueColumn ) )
                    $data[(string)$feat->properties->$keyColumn] = $feat->properties->$valueColumn;
            }
            $dataSource = new jFormsStaticDatasource();

            // required
            if(
                strtolower( $formControl->valueRelationData['allowNull'] ) == 'false'
                or
                strtolower( $formControl->valueRelationData['allowNull'] ) == '0'
            ){
                $formControl->ctrl->required = True;
            }

            // Add default empty value for required fields
            // Jelix does not do it, but we think it is better this way to avoid unwanted set values
            if( $formControl->ctrl->required )
                $data[''] = '';

            // orderByValue
            if(
                strtolower( $formControl->valueRelationData['orderByValue'] ) == 'true'
                or
                strtolower( $formControl->valueRelationData['orderByValue'] ) == '1'
            ){
                asort($data);
            }

            $dataSource->data = $data;
            $formControl->ctrl->datasource = $dataSource;
        } else {
            if( !preg_match( '#No feature found error messages#', $wfsData ) ) {
                $formControl->ctrl->hint = 'Problem : cannot get data to fill this control!';
                $formControl->ctrl->help = 'Problem : cannot get data to fill this control!';
            } else {
                $formControl->ctrl->hint = 'No data to fill this control!';
                $formControl->ctrl->help = 'No data to fill this control!';
            }
        }
    }

    /**
     * Filter data by login if necessary
     * as configured in the plugin for login filtered layers.
     */
    protected function filterDataByLogin($layername) {

        // Optionnaly add a filter parameter
        $lproj = $this->layer->getProject();
        $pConfig = $lproj->getFullCfg();

        if ( $lproj->hasLoginFilteredLayers() and $pConfig->loginFilteredLayers ) {
            if ( property_exists($pConfig->loginFilteredLayers, $layername) ) {
                $v='';
                $where='';
                $type='groups';
                $attribute = $pConfig->loginFilteredLayers->$layername->filterAttribute;

                // check filter type
                if ( property_exists($pConfig->loginFilteredLayers->$layername, 'filterPrivate')
                     and $pConfig->loginFilteredLayers->$layername->filterPrivate == 'True' )
                    $type = 'login';

                // Check if a user is authenticated
                $isConnected = jAuth::isConnected();
                $cnx = jDb::getConnection( $this->layer->getId() );
                if ( $isConnected ){
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
                } else {
                    // The user is not authenticated: only show data with attribute = 'all'
                    $where = ' "'.$attribute.'" = '.$cnx->quote("all");
                }
                // Set filter when multiple layers concerned
                if ( $where ) {
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

}