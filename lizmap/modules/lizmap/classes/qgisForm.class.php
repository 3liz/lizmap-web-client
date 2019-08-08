<?php
/**
 * Create and set jForms form based on QGIS vector layer.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisForm
{
    /**
     * @var qgisMapLayer|qgisVectorLayer
     */
    protected $layer;

    /**
     * @var jFormsBase
     */
    protected $form;

    /**
     * @var string the form id into the HTML
     */
    protected $form_name;

    /**
     * @var string
     */
    protected $featureId;

    /**
     * @var bool
     */
    protected $loginFilteredOverride = false;

    /**
     * @var null|qgisLayerDbFieldsInfo
     */
    protected $dbFieldsInfo;

    /** @var qgisFormControl[] */
    protected $formControls = array();

    /** @var jFormsPlugin[] */
    protected $formPlugins = array();


    /**
     * qgisForm constructor.
     *
     * @param qgisMapLayer|qgisVectorLayer $layer
     * @param jFormsBase                   $form
     * @param string                       $featureId
     * @param bool                         $loginFilteredOverride
     *
     * @throws Exception
     */
    public function __construct($layer, $form, $featureId, $loginFilteredOverride)
    {
        if ($layer->getType() != 'vector') {
            throw new Exception('The layer "'.$layer->getName().'" is not a vector layer!');
        }
        if (!$layer->isEditable()) {
            throw new Exception('The layer "'.$layer->getName().'" is not an editable vector layer!');
        }

        //Get the fields info
        $dbFieldsInfo = $layer->getDbFieldsInfo();
        // verifying db fields info
        if (!$dbFieldsInfo) {
            throw new Exception('Can\'t get Db fields information for the layer "'.$layer->getName().'"!');
        }

        if (count($dbFieldsInfo->primaryKeys) == 0) {
            throw new Exception('The layer "'.$layer->getName().'" has no primary keys. The edition tool needs a primary key on the table to be defined.');
        }

        $this->layer = $layer;
        $this->form = $form;
        $this->featureId = $featureId;
        $this->loginFilteredOverride = $loginFilteredOverride;

        $this->dbFieldsInfo = $dbFieldsInfo;

        $layerXml = $layer->getXmlLayer();
        $edittypesXml = $layerXml->edittypes[0];
        $categoriesXml = $layerXml->xpath('renderer-v2/categories');
        if ($categoriesXml && count($categoriesXml) != 0) {
            $categoriesXml = $categoriesXml[0];
        } else {
            $categoriesXml = null;
        }

        $eCapabilities = $layer->getEditionCapabilities();
        $capabilities = $eCapabilities->capabilities;
        $aliases = $layer->getAliasFields();
        $dataFields = $dbFieldsInfo->dataFields;
        $toDeactivate = array();
        $toSetReadOnly = array();
        foreach ($dataFields as $fieldName => $prop) {
            // get field edit type
            $edittype = null;
            if ($edittypesXml) {
                $edittype = $edittypesXml->xpath("edittype[@name='${fieldName}']");
                if ($edittype && count($edittype) != 0) {
                    $edittype = $edittype[0];
                } else {
                    $edittype = null;
                }
            }
            // get field alias
            $alias = null;
            if ($aliases and array_key_exists($fieldName, $aliases)) {
                $alias = $aliases[$fieldName];
            }

            $formControl = new qgisFormControl($fieldName, $edittype, $alias, $categoriesXml, $prop);

            if ($formControl->fieldEditType === 2
                 or $formControl->fieldEditType === 'UniqueValues'
                 or $formControl->fieldEditType === 'UniqueValuesEditable') {
                $this->fillControlFromUniqueValues($fieldName, $formControl);
            } elseif (($formControl->fieldEditType === 15
                  or $formControl->fieldEditType === 'ValueRelation')
                and $formControl->valueRelationData) {
                // Fill comboboxes of editType "Value relation" from relation layer
                // Query QGIS Server via WFS
                $this->fillControlFromValueRelationLayer($fieldName, $formControl);
            } elseif ($formControl->fieldEditType === 'RelationReference'
                        and $formControl->relationReferenceData) {
                // Fill comboboxes of editType "Relation reference" from relation layer
                // Query QGIS Server via WFS
                $this->fillControlFromRelationReference($fieldName, $formControl);
            } elseif ($formControl->fieldEditType === 8
                        or $formControl->fieldEditType === 'FileName'
                        or $formControl->fieldEditType === 'Photo'
                        or $formControl->fieldEditType === 'ExternalResource') {
                // Add Hidden Control for upload
                // help to retrieve file path
                $hiddenCtrl = new jFormsControlHidden($fieldName.'_hidden');
                $form->addControl($hiddenCtrl);
                $toDeactivate[] = $fieldName.'_choice';
            } elseif ($formControl->fieldEditType === 'Color') {
                $this->formPlugins[$fieldName] = 'color_html';
            }

            // Add the control to the form
            $form->addControl($formControl->ctrl);
            // Set readonly if needed
            $form->setReadOnly($fieldName, $formControl->isReadOnly);

            // Hide when no modify capabilities, only for UPDATE cases ( when $this->featureId control exists )
            if (!empty($featureId)
                and strtolower($capabilities->modifyAttribute) == 'false'
                and $fieldName != $dbFieldsInfo->geometryColumn) {
                if ($prop->primary) {
                    $toSetReadOnly[] = $fieldName;
                } else {
                    $toDeactivate[] = $fieldName;
                }
            }

            $this->formControls[$fieldName] = $formControl;
        }

        // Hide when no modify capabilities, only for UPDATE cases (  when $this->featureId control exists )
        if (!empty($featureId) && strtolower($capabilities->modifyAttribute) == 'false') {
            foreach ($toDeactivate as $de) {
                if ($form->getControl($de)) {
                    $form->deactivate($de, true);
                }
            }
            foreach ($toSetReadOnly as $de) {
                if ($form->getControl($de)) {
                    $form->setReadOnly($de, true);
                }
            }
        }
    }

    public function getFormControls()
    {
        return $this->formControls;
    }

    /**
     * get the html content.
     *
     * @return string the Html content for the form
     */
    public function getHtmlForm()
    {
        $this->form_name = self::generateFormName($this->form->getSelector());

        $layerXml = $this->layer->getXmlLayer();
        $_editorlayout = $layerXml->xpath('editorlayout');
        $attributeEditorForm = null;
        if ($_editorlayout && $_editorlayout[0] == 'tablayout') {
            $_attributeEditorForm = $layerXml->xpath('attributeEditorForm');
            if ($_attributeEditorForm && count($_attributeEditorForm)) {
                $attributeEditorForm = $this->xml2obj($_attributeEditorForm[0]);
            }
        }

        $formPlugins = array();
        foreach ($this->formPlugins as $fName => $pName) {
            $formPlugins[] = '\''.$fName.'\'=>\''.$pName.'\'';
        }

        if ($attributeEditorForm && property_exists($attributeEditorForm, 'children')) {
            $template = '{form $form, "lizmap~edition:saveFeature", array(), "htmlbootstrap", array("errorDecorator"=>"lizEditionErrorDecorator","plugins"=>array('.implode(',', $formPlugins).'))}';
            $template .= $this->getEditorContainerHtmlContent($attributeEditorForm, $this->form_name, 0);
            $template .= '<div class="control-group">';
            $template .= '{ctrl_label "liz_future_action"}';
            $template .= '<div class="controls">';
            $template .= '{ctrl_control "liz_future_action"}';
            $template .= '</div>';
            $template .= '</div>';
            $template .= '<div class="jforms-submit-buttons form-actions">{formreset}{formsubmit}</div>';
            $template .= '{/form}';
        } else {
            $fieldNames = array();
            foreach (array_keys($this->formControls) as $k) {
                // Get field name
                $fName = $k;
                $formControl = $this->formControls[$fName];
                // Change field name to choice for files upoad control
                if ($formControl->fieldEditType === 8
                     or $formControl->fieldEditType === 'FileName'
                     or $formControl->fieldEditType === 'Photo'
                     or $formControl->fieldEditType === 'ExternalResource'
                ) {
                    $fName = $fName.'_choice';
                }
                $fieldNames[] = '\''.$fName.'\'';
            }
            $template = '{form $form, "lizmap~edition:saveFeature", array(), "htmlbootstrap", array("errorDecorator"=>"lizEditionErrorDecorator","plugins"=>array('.implode(',', $formPlugins).'))}';
            $template .= '{formcontrols array('.implode(',', $fieldNames).')}';
            $template .= '<div class="control-group">';
            $template .= '{ctrl_label}';
            $template .= '<div class="controls">';
            $template .= '{ctrl_control}';
            $template .= '</div>';
            $template .= '</div>';
            $template .= '{/formcontrols}';
            $template .= '<div class="control-group">';
            $template .= '{ctrl_label "liz_future_action"}';
            $template .= '<div class="controls">';
            $template .= '{ctrl_control "liz_future_action"}';
            $template .= '</div>';
            $template .= '</div>';
            $template .= '<div class="jforms-submit-buttons form-actions">{formreset}{formsubmit}</div>';
            $template .= '{/form}';
        }

        $tpl = new jTpl();
        $tpl->assign('form', $this->form);

        return $tpl->fetchFromString($template, 'html');
    }

    private function xml2obj($node)
    {
        $jsnode = array(
            'name' => $node->getName(),
        );
        $attributesObj = json_decode(
            str_replace(
                '@',
                '',
                json_encode($node->attributes())
            )
        );
        if (property_exists($attributesObj, 'attributes')) {
            $jsnode['attributes'] = $attributesObj->attributes;
        }
        $children = array();
        foreach ($node->children() as $child) {
            $children[] = $this->xml2obj($child);
        }
        if (count($children) > 0) {
            $jsnode['children'] = $children;
        }

        return (object) $jsnode;
    }

    private function getEditorContainerHtmlContent($container, $parent_id, $depth)
    {
        // a container has children
        if (!property_exists($container, 'children')) {
            return '';
        }
        // a container has a name
        if (!property_exists($container, 'name')) {
            return '';
        }
        // a container can be the root
        if ($container->name != 'attributeEditorContainer' && $container->name != 'attributeEditorForm') {
            return '';
        }

        $htmlBeforeTab = '';
        $htmlTabNav = '';
        $htmlTabContent = '';
        $htmlAfterTab = '';
        $idx = 0;
        foreach ($container->children as $c) {
            if ($c->name === 'attributeEditorField') {
                $html = $this->getEditorFieldHtmlContent($c);
                if ($htmlTabNav === '') {
                    $htmlBeforeTab .= $html;
                } else {
                    $htmlAfterTab .= $html;
                }
            } elseif ($c->name === 'attributeEditorContainer') {
                $groupBox = false;
                if (property_exists($c->attributes, 'groupBox')) {
                    $groupBox = ($c->attributes->groupBox === '1');
                } else {
                    $groupBox = (($depth % 2) == 1);
                }
                if ($groupBox) {
                    $html = '<fieldset>';
                    $html .= '<legend style="font-weight:bold;">';
                    $html .= $c->attributes->name;
                    $html .= '</legend>';
                    $html .= '<div class="jforms-table-group" border="0" id="'.$parent_id.'-group'.$idx.'">';
                    $html .= $this->getEditorContainerHtmlContent($c, $parent_id.'-group'.$idx, $depth + 1);
                    $html .= '</div>';
                    $html .= '</fieldset>';
                    if ($htmlTabNav === '') {
                        $htmlBeforeTab .= $html;
                    } else {
                        $htmlAfterTab .= $html;
                    }
                } else {
                    $htmlTabNav .= '<li><a href="#'.$parent_id.'-tab'.$idx.'" data-toggle="tab">';
                    $htmlTabNav .= $c->attributes->name;
                    $htmlTabNav .= '</a></li>';

                    $htmlTabContent .= '<div class="tab-pane" id="'.$parent_id.'-tab'.$idx.'">';
                    $htmlTabContent .= $this->getEditorContainerHtmlContent($c, $parent_id.'-tab'.$idx, $depth + 1);
                    $htmlTabContent .= '</div>';
                }
            }
            ++$idx;
        }

        if ($htmlTabNav === '') {
            return $htmlBeforeTab;
        }

        $html = $htmlBeforeTab;
        $html .= '<ul id="'.$parent_id.'-tabs" class="nav nav-tabs">';
        $html .= $htmlTabNav;
        $html .= '</ul>';
        $html .= '<div id="'.$parent_id.'-tab-content" class="tab-content">';
        $html .= $htmlTabContent;
        $html .= '</div>';
        $html .= $htmlAfterTab;

        return $html;
    }

    private function getEditorFieldHtmlContent($field)
    {
        // field node is named attributeEditorField
        if (!property_exists($field, 'name') && $field->name != 'attributeEditorField') {
            return '';
        }

        $html = '';
        // Get field name
        $fName = $field->attributes->name;
        // Verifying that the field is defined
        if (!array_key_exists($fName, $this->formControls)) {
            return $html;
        }
        $formControl = $this->formControls[$fName];
        // Change field name to choice for files upoad control
        if ($formControl->fieldEditType === 8
             or $formControl->fieldEditType === 'FileName'
             or $formControl->fieldEditType === 'Photo'
             or $formControl->fieldEditType === 'ExternalResource') {
            $fName = $fName.'_choice';
        }
        // generate the template
        $html .= '<div class="control-group">';
        $html .= '{ctrl_label "'.$fName.'"}';
        $html .= '<div class="controls">';
        $html .= '{ctrl_control "'.$fName.'"}';
        $html .= '</div>';
        $html .= '</div>';

        return $html;
    }

    /**
     * Set the form controls data from the database default value.
     *
     * @return object the Jelix jForm object
     */
    public function setFormDataFromDefault()
    {
        if (!$this->dbFieldsInfo) {
            return $this->form;
        }

        $form = $this->form;

        // Get default values
        $defaultValues = $this->layer->getDbFieldDefaultValues();
        foreach ($defaultValues as $ref => $value) {
            $ctrl = $form->getControl($ref);
            // only set default value for non hidden field
            if ($ctrl->type == 'hidden') {
                continue;
            }

            if (($this->formControls[$ref]->fieldEditType === 7
                or $this->formControls[$ref]->fieldEditType === 'CheckBox')
                and $this->formControls[$ref]->fieldDataType === 'boolean') {
                $ctrl->setDataFromDao($value, 'boolean');
            }else{
                $form->setData($ref, $value);
            }
        }

        return $form;
    }

    /**
     * Set the form controls data from the database value.
     *
     * @param mixed $feature
     *
     * @return object the Jelix jForm object
     */
    public function setFormDataFromFields($feature)
    {
        if (!$this->dbFieldsInfo) {
            return $this->form;
        }

        $form = $this->form;
        $values = $this->layer->getDbFieldValues($feature);
        foreach ($values as $ref => $value) {
            if (($this->formControls[$ref]->fieldEditType === 7
                or $this->formControls[$ref]->fieldEditType === 'CheckBox')
                and $this->formControls[$ref]->fieldDataType === 'boolean') {
                $form->getControl($ref)->setDataFromDao($value, 'boolean');
            }
            // ValueRelation can be an array (i.e. {1,2,3})
            elseif ($this->formControls[$ref]->fieldEditType === 15
                or $this->formControls[$ref]->fieldEditType === 'ValueRelation') {
                if ($value[0] == '{') {
                    $arrayValue = explode(',', trim($value, '{}'));
                    $form->setData($ref, $arrayValue);
                }else{
                    $form->setData($ref, $value);
                }
            }
            elseif ($this->formControls[$ref]->fieldEditType === 8
                or $this->formControls[$ref]->fieldEditType === 'FileName'
                or $this->formControls[$ref]->fieldEditType === 'Photo'
                or $this->formControls[$ref]->fieldEditType === 'ExternalResource') {
                $ctrl = $form->getControl($ref.'_choice');
                if ($ctrl && $ctrl->type == 'choice') {
                    $path = explode('/', $value);
                    $filename = array_pop($path);
                    $filename = preg_replace('#_|-#', ' ', $filename);
                    $ctrl->itemsNames['keep'] = jLocale::get('view~edition.upload.choice.keep').' '.$filename;
                    $ctrl->itemsNames['update'] = jLocale::get('view~edition.upload.choice.update');
                    $ctrl->itemsNames['delete'] = jLocale::get('view~edition.upload.choice.delete').' '.$filename;
                }
                $form->setData($ref.'_hidden', $value);
            }else{
                $form->setData($ref, $value);
            }
        }

        return $form;
    }

    /**
     * Save the form to the database.
     *
     * @param null|mixed $feature
     */
    public function saveToDb($feature = null)
    {
        if (!$this->dbFieldsInfo) {
            throw new Exception('Save to database can\'t be done for the layer "'.$this->layer->getName().'"!');
        }

        // Update or Insert
        $updateAction = false;
        $insertAction = false;
        if ($this->featureId) {
            $updateAction = true;
        } else {
            $insertAction = true;
        }

        $eCapabilities = $this->layer->getEditionCapabilities();
        $capabilities = $eCapabilities->capabilities;

        $dataFields = $this->dbFieldsInfo->dataFields;
        $geometryColumn = $this->dbFieldsInfo->geometryColumn;

        // Get list of fields which are not primary keys
        $fields = array();
        foreach ($dataFields as $fieldName => $prop) {
            // For update : And get only fields corresponding to edition capabilities
            if (
                (strtolower($capabilities->modifyAttribute) == 'true' and $fieldName != $geometryColumn)
                or (strtolower($capabilities->modifyGeometry) == 'true' and $fieldName == $geometryColumn)
                or $insertAction
            ) {
                $fields[] = $fieldName;
            }
        }

        if (count($fields) == 0) {
            jLog::log('Not enough capabilities for this layer ! SQL cannot be constructed: no fields available !', 'error');
            $this->form->setErrorOn($geometryColumn, jLocale::get('view~edition.message.error.save').' '.jLocale::get('view~edition.message.error.save.fields'));

            throw new Exception(jLocale::get('view~edition.link.error.sql'));
        }

        $form = $this->form;
        $cnx = $this->layer->getDatasourceConnection();
        $values = array();
        // Loop though the fields and filter the form posted values
        foreach ($fields as $ref) {
            if ($form->getControl($ref) instanceof jFormsControlUpload) {
                $values[$ref] = $this->processUploadedFile($form, $ref, $cnx);

                continue;
            }

            // Get and filter the posted data foreach form control
            $value = $form->getData($ref);

            if (is_array($value)) {
                $value = '{'.implode(',', $value).'}';
            }

            if (($value === '' || $value === null) &&
              !$this->formControls[$ref]->required
            ) {
                $values[$ref] = 'NULL';

                continue;
            }

            switch ($this->formControls[$ref]->fieldDataType) {
                case 'geometry':
                    try {
                        $value = $this->layer->getGeometryAsSql($value);
                    } catch (Exception $e) {
                        $form->setErrorOn($geometryColumn, $e->getMessage());

                        return false;
                    }

                    break;
                case 'date':
                case 'time':
                case 'datetime':
                    $value = filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
                    if (!$value) {
                        $value = 'NULL';
                    } else {
                        $value = $cnx->quote($value);
                    }

                    break;
                case 'integer':
                    if (is_numeric($value)) {
                        $value = (int) filter_var($value, FILTER_SANITIZE_NUMBER_INT);
                        if (!$value && $value !== 0) {
                            $value = 'NULL';
                        }
                    } else {
                        $value = 'NULL';
                    }

                    break;
                case 'float':
                    if (is_numeric($value)) {
                        $value = (float) $value;
                        if (!$value && $value !== 0.0) {
                            $value = 'NULL';
                        }
                    } else {
                        $value = 'NULL';
                    }

                    break;
                case 'text':
                    $value = $cnx->quote($value);

                    break;
                case 'boolean':
                    $strVal = strtolower($value);
                    if ($strVal != 'true' && $strVal !== 't' && intval($value) != 1 &&
                       $strVal !== 'on' && $value !== true &&
                       $strVal != 'false' && $strVal !== 'f' && intval($value) != 0 &&
                       $strVal !== 'off' && $value !== false
                    ) {
                        $value = 'NULL';
                    } else {
                        $value = $cnx->quote($value);
                    }

                    break;
                default:
                    $value = $cnx->quote(
                        filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)
                    );

                    break;
            }
            $values[$ref] = $value;
        }

        try {
            if ($updateAction) {
                $loginFilteredLayers = $this->filterDataByLogin($this->layer->getName());

                return $this->layer->updateFeature($feature, $values, $loginFilteredLayers);
            }

            return $this->layer->insertFeature($values);
        } catch (Exception $e) {
            $form->setErrorOn($geometryColumn, jLocale::get('view~edition.message.error.save'));
            jLog::log('An error has been raised when saving form data edition to db : ', 'error');
            jLog::logEx($e, 'error');

            return false;
        }

        return 0;
    }

    /**
     * @param jFormsBase    $form
     * @param string        $ref
     * @param jDbConnection $cnx
     */
    protected function processUploadedFile($form, $ref, $cnx)
    {
        $project = $this->layer->getProject();
        $dtParams = $this->layer->getDatasourceParameters();
        $value = $form->getData($ref);
        $choiceValue = $form->getData($ref.'_choice');
        $hiddenValue = $form->getData($ref.'_hidden');
        $repPath = $project->getRepository()->getPath();

        $targetPath = 'media/upload/'.$project->getKey().'/'.$dtParams->tablename.'/'.$ref;
        $targetFullPath = $repPath.$targetPath;
        // Else use given root, but only if it is a child or brother of the repository path
        if (!empty($this->formControls[$ref]->DefaultRoot)) {
            jFile::createDir($repPath.$this->formControls[$ref]->DefaultRoot); // Need to create it to then make the realpath checks
            if (
                (substr(realpath($repPath.$this->formControls[$ref]->DefaultRoot), 0, strlen(realpath($repPath))) === realpath($repPath))
                or
                (substr(realpath($repPath.$this->formControls[$ref]->DefaultRoot), 0, strlen(realpath($repPath.'/../'))) === realpath($repPath.'/../'))
            ) {
                $targetPath = $this->formControls[$ref]->DefaultRoot;
                $targetFullPath = realpath($repPath.$this->formControls[$ref]->DefaultRoot);
            }
        }

        // update
        if ($choiceValue == 'update' && $value != '') {
            // if the new file and the old file have the same name...
            if ($hiddenValue == preg_replace('#/{2,3}#', '/', $targetPath.'/'.$value)) {
                // overwrite the old file by the new one, and don't delete old file
                $form->saveFile($ref, $targetFullPath, $value);
                $value = $targetPath.'/'.$value;
            } else {
                $alreadyValueIdx = 0;
                $originalValue = $value;
                while (file_exists($targetFullPath.'/'.$value)) {
                    ++$alreadyValueIdx;
                    $splitValue = explode('.', $originalValue);
                    $splitValue[0] = $splitValue[0].$alreadyValueIdx;
                    $value = implode('.', $splitValue);
                }
                if ($form->saveFile($ref, $targetFullPath, $value)) {
                    $value = $targetPath.'/'.$value;
                    if ($hiddenValue && file_exists(realpath($repPath.'/'.$hiddenValue))) {
                        unlink(realpath($repPath.'/'.$hiddenValue));
                    }
                } else {
                    // something wrong did happen, let's keep the old file
                    $value = $hiddenValue;
                }
            }
        }
        // delete
        elseif ($choiceValue == 'delete') {
            if ($hiddenValue && file_exists(realpath($repPath.'/'.$hiddenValue))) {
                unlink(realpath($repPath.'/'.$hiddenValue));
            }
            $value = 'NULL';
        } else {
            $value = $hiddenValue;
        }
        if (empty($value)) {
            $value = 'NULL';
        } elseif ($value != 'NULL') {
            $value = $cnx->quote(
                filter_var($value, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)
            );
        }

        return preg_replace('#/{2,3}#', '/', $value);
    }

    /**
     * Delete the feature from the database.
     *
     * @param mixed $feature
     */
    public function deleteFromDb($feature)
    {
        if (!$this->dbFieldsInfo) {
            throw new Exception('Delete from database can\'t be done for the layer "'.$this->layer->getName().'"!');
        }

        $loginFilteredLayers = $this->filterDataByLogin($this->layer->getName());

        return $this->layer->deleteFeature($feature, $loginFilteredLayers);
    }

    /**
     * Dynamically update form by modifying the filter by login control.
     *
     * @return jFormsBase modified form
     */
    public function updateFormByLogin()
    {
        $loginFilteredLayers = $this->filterDataByLogin($this->layer->getName());

        if ($loginFilteredLayers && is_array($loginFilteredLayers)) {
            $type = $loginFilteredLayers['type'];
            $attribute = $loginFilteredLayers['attribute'];

            $form = $this->form;
            $oldCtrl = $form->getControl($attribute);
            if (!$oldCtrl) {
                return $form;
            }

            // Check if a user is authenticated
            if (!jAuth::isConnected()) {
                $form->setData($attribute, 'all');
                $form->setReadOnly($attribute, true);

                return $form;
            }

            $user = jAuth::getUserSession();
            if (!$this->loginFilteredOverride) {
                $value = null;
                if ($oldCtrl != null) {
                    $value = $form->getData($attribute);
                }

                $data = array();
                $data['all'] = 'all';
                if ($type == 'login') {
                    $data[$user->login] = $user->login;
                    $value = $user->login;
                } else {
                    $userGroups = jAcl2DbUserGroup::getGroups();
                    foreach ($userGroups as $uGroup) {
                        if ($uGroup != 'users' and substr($uGroup, 0, 7) != '__priv_') {
                            $data[$uGroup] = $uGroup;
                        }
                    }
                }
                $dataSource = new jFormsStaticDatasource();
                $dataSource->data = $data;
                $ctrl = new jFormsControlMenulist($attribute);
                $ctrl->required = true;
                if ($oldCtrl != null) {
                    $ctrl->label = $oldCtrl->label;
                } else {
                    $ctrl->label = $attribute;
                }
                $ctrl->datasource = $dataSource;
                $form->removeControl($attribute);
                $form->addControl($ctrl);
                if ($value != null) {
                    $form->setData($attribute, $value);
                }
            } else {
                $value = null;
                if ($oldCtrl != null) {
                    $value = $form->getData($attribute);
                }

                $data = array();
                if ($type == 'login') {
                    $plugin = jApp::coord()->getPlugin('auth');
                    if ($plugin->config['driver'] == 'Db') {
                        $authConfig = $plugin->config['Db'];
                        $dao = jDao::get($authConfig['dao'], $authConfig['profile']);
                        $cond = jDao::createConditions();
                        $cond->addItemOrder('login', 'asc');
                        $us = $dao->findBy($cond);
                        foreach ($us as $u) {
                            $data[$u->login] = $u->login;
                        }
                    }
                } else {
                    $gp = jAcl2DbUserGroup::getGroupList();
                    foreach ($gp as $g) {
                        if ($g->id_aclgrp != 'users') {
                            $data[$g->id_aclgrp] = $g->id_aclgrp;
                        }
                    }
                }
                $data['all'] = 'all';
                $dataSource = new jFormsStaticDatasource();
                $dataSource->data = $data;
                $ctrl = new jFormsControlMenulist($attribute);
                $ctrl->required = true;
                if ($oldCtrl != null) {
                    $ctrl->label = $oldCtrl->label;
                } else {
                    $ctrl->label = $attribute;
                }
                $ctrl->datasource = $dataSource;
                $form->removeControl($attribute);
                $form->addControl($ctrl);
                if ($value != null) {
                    $form->setData($attribute, $value);
                } elseif ($type == 'login') {
                    $form->setData($attribute, $user->login);
                }
            }

            return $form;
        }

        return $this->form;
    }

    /**
     * Get the values for a "Unique Values" layer's field and fill the form control for a specific field.
     *
     * @param string          $fieldName   Name of QGIS field
     * @param qgisFormControl $formControl
     */
    private function fillControlFromUniqueValues($fieldName, $formControl)
    {
        $values = $this->layer->getDbFieldDistinctValues($fieldName);

        $data = array();
        foreach ($values as $v) {
            $data[$v] = $v;
        }

        $dataSource = new jFormsStaticDatasource();

        // required
        if (array_key_exists('notNull', $formControl->uniqueValuesData)
            and strtolower($formControl->uniqueValuesData['notNull']) == '1'
        ) {
            jLog::log('notNull '.$formControl->uniqueValuesData['notNull'], 'error');
            $formControl->ctrl->required = true;
        }
        // combobox
        if (array_key_exists('editable', $formControl->uniqueValuesData)
             and strtolower($formControl->uniqueValuesData['editable']) == '1'
        ) {
            $formControl->ctrl->setAttribute('class', 'autocomplete');
        }

        // Add default empty value for required fields
        // Jelix does not do it, but we think it is better this way to avoid unwanted set values
        if ($formControl->ctrl->required) {
            $data[''] = '';
        }

        asort($data);

        $dataSource->data = $data;
        $formControl->ctrl->datasource = $dataSource;
    }

    /**
     * Get WFS data from a "Value Relation" layer and fill the form control for a specific field.
     *
     * @param string          $fieldName   Name of QGIS field
     * @param qgisFormControl $formControl
     */
    private function fillControlFromValueRelationLayer($fieldName, $formControl)
    {
        $wfsData = null;
        $mime = '';

        // Build WFS request parameters
        //   Get layername via id
        $project = $this->layer->getProject();
        $relationLayerId = $formControl->valueRelationData['layer'];

        $_relationLayerXml = $project->getXmlLayer($relationLayerId);
        if (count($_relationLayerXml) == 0) {
            $formControl->ctrl->hint = 'Control not well configured!';
            $formControl->ctrl->help = 'Control not well configured!';

            return;
        }
        $relationLayerXml = $_relationLayerXml[0];

        $_layerName = $relationLayerXml->xpath('layername');
        if (count($_layerName) == 0) {
            $formControl->ctrl->hint = 'Control not well configured!';
            $formControl->ctrl->help = 'Control not well configured!';

            return;
        }
        $layerName = (string) $_layerName[0];

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
            'map' => $project->getPath(),
        );

        // add EXP_FILTER. Only for QGIS >=2.0
        $expFilter = null;
        if ($filterExpression) {
            $expFilter = $filterExpression;
        }
        // Filter by login
        if (!$this->loginFilteredOverride) {
            $loginFilteredLayers = $this->filterDataByLogin($layerName);
            if (is_array($loginFilteredLayers)) {
                if ($expFilter) {
                    $expFilter = ' ( '.$expFilter.' ) AND ( '.$loginFilteredLayers['where'].' ) ';
                } else {
                    $expFilter = $loginFilteredLayers['where'];
                }
            }
        }
        if ($expFilter) {
            $params['EXP_FILTER'] = $expFilter;
            // disable PROPERTYNAME in this case : if the exp_filter uses other fields, no data would be returned otherwise
            unset($params['PROPERTYNAME']);
        }

        // Perform request
        $wfsRequest = new lizmapWFSRequest($project, $params);
        $result = $wfsRequest->process();

        $wfsData = $result->data;
        if (property_exists($result, 'file') and $result->file and is_file($wfsData)) {
            $wfsData = jFile::read($wfsData);
        }
        $mime = $result->mime;

        // Used data
        if ($wfsData and !in_array(strtolower($mime), array('text/html', 'text/xml'))) {
            $wfsData = json_decode($wfsData);
            // Get data from layer
            $features = $wfsData->features;
            $data = array();
            foreach ($features as $feat) {
                if (property_exists($feat, 'properties')
                    and property_exists($feat->properties, $keyColumn)
                    and property_exists($feat->properties, $valueColumn)) {
                    $data[(string) $feat->properties->{$keyColumn}] = $feat->properties->{$valueColumn};
                }
            }
            $dataSource = new jFormsStaticDatasource();

            // required
            if (
                strtolower($formControl->valueRelationData['allowNull']) == 'false'
                or
                strtolower($formControl->valueRelationData['allowNull']) == '0'
            ) {
                $formControl->ctrl->required = true;
            }
            // combobox
            if (array_key_exists('useCompleter', $formControl->valueRelationData)
                 and $formControl->valueRelationData['useCompleter'] == '1'
            ) {
                $formControl->ctrl->setAttribute('class', 'combobox');
            }

            // Add default empty value for required fields
            // Jelix does not do it, but we think it is better this way to avoid unwanted set values
            if ($formControl->ctrl->required) {
                $data[''] = '';
            }

            // orderByValue
            if (
                strtolower($formControl->valueRelationData['orderByValue']) == 'true'
                or
                strtolower($formControl->valueRelationData['orderByValue']) == '1'
            ) {
                asort($data);
            }

            $dataSource->data = $data;
            $formControl->ctrl->datasource = $dataSource;
        } else {
            if (!preg_match('#No feature found error messages#', $wfsData)) {
                $formControl->ctrl->hint = 'Problem : cannot get data to fill this control!';
                $formControl->ctrl->help = 'Problem : cannot get data to fill this control!';
            } else {
                $formControl->ctrl->hint = 'No data to fill this control!';
                $formControl->ctrl->help = 'No data to fill this control!';
            }
        }
    }

    /**
     * Get WFS data from a "Relation Reference" and fill the form control for a specific field.
     *
     * @param string          $fieldName   Name of QGIS field
     * @param qgisFormControl $formControl
     */
    private function fillControlFromRelationReference($fieldName, $formControl)
    {
        $wfsData = null;
        $mime = '';

        // Build WFS request parameters
        //   Get layername via id
        $project = $this->layer->getProject();
        $relationId = $formControl->relationReferenceData['relation'];

        $_relationXml = $project->getXmlRelation($relationId);
        if (count($_relationXml) == 0) {
            $formControl->ctrl->hint = 'Control not well configured!';
            $formControl->ctrl->help = 'Control not well configured!';

            return;
        }
        $relationXml = $_relationXml[0];

        $referencedLayerId = $relationXml->attributes()->referencedLayer;

        $_referencedLayerXml = $project->getXmlLayer($referencedLayerId);
        if (count($_referencedLayerXml) == 0) {
            $formControl->ctrl->hint = 'Control not well configured!';
            $formControl->ctrl->help = 'Control not well configured!';

            return;
        }
        $referencedLayerXml = $_referencedLayerXml[0];

        $_layerName = $referencedLayerXml->xpath('layername');
        if (count($_layerName) == 0) {
            $formControl->ctrl->hint = 'Control not well configured!';
            $formControl->ctrl->help = 'Control not well configured!';

            return;
        }
        $layerName = (string) $_layerName[0];

        $_previewExpression = $referencedLayerXml->xpath('previewExpression');
        if (count($_previewExpression) == 0) {
            $formControl->ctrl->hint = 'Control not well configured!';
            $formControl->ctrl->help = 'Control not well configured!';

            return;
        }
        $previewExpression = (string) $_previewExpression[0];
        $referencedField = $relationXml->fieldRef->attributes()->referencedField;
        $previewField = $previewExpression;
        if (substr($previewField, 0, 8) == 'COALESCE') {
            if (preg_match('/"([\S ]+)"/g', $previewField, $matches) == 1) {
                $previewField = $matches[1];
            } else {
                $previewField = $referencedField;
            }
        } elseif (substr($previewField, 0, 1) == '"' and substr($previewField, -1) == '"') {
            $previewField = substr($previewField, 1, -1);
        }

        $filterExpression = '';
        $typename = str_replace(' ', '_', $layerName);
        $propertyname = $referencedField.','.$previewField;

        $params = array(
            'SERVICE' => 'WFS',
            'VERSION' => '1.0.0',
            'REQUEST' => 'GetFeature',
            'TYPENAME' => $typename,
            'PROPERTYNAME' => $propertyname,
            'OUTPUTFORMAT' => 'GeoJSON',
            'GEOMETRYNAME' => 'none',
            'map' => $project->getPath(),
        );

        // add EXP_FILTER. Only for QGIS >=2.0
        $expFilter = null;
        if ($filterExpression) {
            $expFilter = $filterExpression;
        }
        // Filter by login
        if (!$this->loginFilteredOverride) {
            $loginFilteredLayers = $this->filterDataByLogin($layerName);
            if (is_array($loginFilteredLayers)) {
                if ($expFilter) {
                    $expFilter = ' ( '.$expFilter.' ) AND ( '.$loginFilteredLayers['where'].' ) ';
                } else {
                    $expFilter = $loginFilteredLayers['where'];
                }
            }
        }
        if ($expFilter) {
            $params['EXP_FILTER'] = $expFilter;
            // disable PROPERTYNAME in this case : if the exp_filter uses other fields, no data would be returned otherwise
            unset($params['PROPERTYNAME']);
        }

        // Perform request
        $wfsRequest = new lizmapWFSRequest($project, $params);
        $result = $wfsRequest->process();

        $wfsData = $result->data;
        if (property_exists($result, 'file') and $result->file and is_file($wfsData)) {
            $wfsData = jFile::read($wfsData);
        }
        $mime = $result->mime;

        // Used data
        if ($wfsData and !in_array(strtolower($mime), array('text/html', 'text/xml'))) {
            $wfsData = json_decode($wfsData);
            // Get data from layer
            $features = $wfsData->features;
            $data = array();
            foreach ($features as $feat) {
                if (property_exists($feat, 'properties')
                    and property_exists($feat->properties, $referencedField)
                    and property_exists($feat->properties, $previewField)) {
                    $data[(string) $feat->properties->{$referencedField}] = $feat->properties->{$previewField};
                }
            }
            $dataSource = new jFormsStaticDatasource();

            // required
            if (
                strtolower($formControl->relationReferenceData['allowNull']) == 'false'
                or
                strtolower($formControl->relationReferenceData['allowNull']) == '0'
            ) {
                $formControl->ctrl->required = true;
            }

            // Add default empty value for required fields
            // Jelix does not do it, but we think it is better this way to avoid unwanted set values
            if ($formControl->ctrl->required) {
                $data[''] = '';
            }

            // orderByValue
            if (
                strtolower($formControl->relationReferenceData['orderByValue']) == 'true'
                or
                strtolower($formControl->relationReferenceData['orderByValue']) == '1'
            ) {
                asort($data);
            }

            $dataSource->data = $data;
            $formControl->ctrl->datasource = $dataSource;
        } else {
            if (!preg_match('#No feature found error messages#', $wfsData)) {
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
     *
     * @param string $layername
     *
     * @return null|array array with these keys:
     *                    - where: SQL WHERE statement
     *                    - type: 'groups' or 'login'
     *                    - attribute: filter attribute from the layer
     */
    protected function filterDataByLogin($layername)
    {
        if ($this->loginFilteredOverride) {
            return null;
        }

        // Optionnaly add a filter parameter
        $lproj = $this->layer->getProject();
        $pConfig = $lproj->getFullCfg();

        if ($lproj->hasLoginFilteredLayers() and $pConfig->loginFilteredLayers) {
            if (property_exists($pConfig->loginFilteredLayers, $layername)) {
                $v = '';
                $where = '';
                $type = 'groups';
                $attribute = $pConfig->loginFilteredLayers->{$layername}->filterAttribute;

                // check filter type
                if (property_exists($pConfig->loginFilteredLayers->{$layername}, 'filterPrivate')
                     and $pConfig->loginFilteredLayers->{$layername}->filterPrivate == 'True') {
                    $type = 'login';
                }

                // Check if a user is authenticated
                $isConnected = jAuth::isConnected();
                $cnx = jDb::getConnection($this->layer->getId());
                if ($isConnected) {
                    $user = jAuth::getUserSession();
                    $login = $user->login;
                    if ($type == 'login') {
                        $where = ' "'.$attribute."\" IN ( '".$login."' , 'all' )";
                    } else {
                        $userGroups = jAcl2DbUserGroup::getGroups();
                        // Set XML Filter if getFeature request
                        $flatGroups = implode("' , '", $userGroups);
                        $where = ' "'.$attribute."\" IN ( '".$flatGroups."' , 'all' )";
                    }
                } else {
                    // The user is not authenticated: only show data with attribute = 'all'
                    $where = ' "'.$attribute.'" = '.$cnx->quote('all');
                }
                // Set filter when multiple layers concerned
                if ($where) {
                    return array(
                        'where' => $where,
                        'type' => $type,
                        'attribute' => $attribute,
                    );
                }
            }
        }

        return null;
    }

    /**
     * generates a name for the form.
     *
     * @param mixed $sel
     */
    protected static function generateFormName($sel)
    {
        static $forms = array();
        $name = 'jforms_'.str_replace('~', '_', $sel);
        if (isset($forms[$sel])) {
            return $name.(++$forms[$sel]);
        }
        $forms[$sel] = 0;

        return $name;
    }
}
