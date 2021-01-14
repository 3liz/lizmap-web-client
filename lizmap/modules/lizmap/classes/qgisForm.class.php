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
class qgisForm implements qgisFormControlsInterface
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

        $edittypesXml = $layerXml->edittypes;
        if ($edittypesXml && count($edittypesXml) !== 0) {
            $edittypesXml = $edittypesXml[0];
        } else {
            $edittypesXml = null;
        }

        $fieldConfigurationXml = $layerXml->fieldConfiguration;
        if ($fieldConfigurationXml && count($fieldConfigurationXml) !== 0) {
            $fieldConfigurationXml = $fieldConfigurationXml[0];
        } else {
            $fieldConfigurationXml = null;
        }

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
                $edittype = $edittypesXml->xpath("edittype[@name='{$fieldName}']");
                if ($edittype && count($edittype) != 0) {
                    $edittype = $edittype[0];
                } else {
                    $edittype = null;
                }
            } elseif ($fieldConfigurationXml) {
                $fieldConfiguration = $fieldConfigurationXml->xpath("field[@name='{$fieldName}']");
                if ($fieldConfiguration && count($fieldConfiguration) !== 0) {
                    $fieldConfiguration = $fieldConfiguration[0];
                    $editWidgetXml = $fieldConfiguration->editWidget;
                    if ($editWidgetXml && count($editWidgetXml) !== 0) {
                        $editWidgetXml = $editWidgetXml[0];
                        // type
                        $fieldEditType = (string) $editWidgetXml->attributes()->type;
                        // options
                        $fieldEditOptions = array();
                        foreach ($editWidgetXml->config as $config) {
                            foreach ($config->Option as $option) {
                                foreach ($option->Option as $opt) {
                                    // Option with list of values
                                    if ((string) $opt->attributes()->type === 'List') {
                                        $values = array();
                                        foreach ($opt->Option as $l) {
                                            if ((string) $l->attributes()->type === 'Map') {
                                                foreach ($l->Option as $v) {
                                                    $values[] = (object) array(
                                                        'key' => (string) $v->attributes()->name,
                                                        'value' => (string) $v->attributes()->value,
                                                    );
                                                }
                                            } else {
                                                $values[] = (string) $l->attributes()->value;
                                            }
                                        }
                                        $fieldEditOptions[(string) $opt->attributes()->name] = $values;
                                    // Option with list of values as Map
                                    } elseif ((string) $opt->attributes()->type === 'Map') {
                                        $values = array();
                                        foreach ($opt->Option as $v) {
                                            $values[] = (object) array(
                                                'key' => (string) $v->attributes()->name,
                                                'value' => (string) $v->attributes()->value,
                                            );
                                        }
                                        $fieldEditOptions[(string) $opt->attributes()->name] = $values;
                                    // Option with string list of values
                                    } elseif ((string) $opt->attributes()->type === 'StringList') {
                                        $values = array();
                                        foreach ($opt->Option as $v) {
                                            $values[] = (string) $v->attributes()->value;
                                        }
                                        $fieldEditOptions[(string) $opt->attributes()->name] = $values;
                                    // Simple option
                                    } else {
                                        $fieldEditOptions[(string) $opt->attributes()->name] = (string) $opt->attributes()->value;
                                    }
                                }
                            }
                        }

                        $edittype = array(
                            'type' => $fieldEditType,
                            'options' => (object) $fieldEditOptions,
                        );

                        // editable
                        $editableFieldXml = $layerXml->xpath("editable/field[@name='{$fieldName}']");
                        if ($editableFieldXml && count($editableFieldXml) !== 0) {
                            $editableFieldXml = $editableFieldXml[0];
                            $edittype['editable'] = (int) $editableFieldXml->attributes()->editable;
                        } else {
                            $edittype['editable'] = 1;
                        }

                        $edittype = (object) $edittype;
                    }
                } else {
                    $edittype = null;
                }
            }
            // get field alias
            $alias = null;
            if ($aliases and array_key_exists($fieldName, $aliases)) {
                $alias = $aliases[$fieldName];
            }

            $defaultValue = $this->getDefaultValue($fieldName);

            $constraints = $this->getConstraints($fieldName);

            $formControl = new qgisFormControl($fieldName, $edittype, $prop, $alias, $defaultValue, $constraints, $categoriesXml);

            if ($formControl->isUniqueValue()) {
                $this->fillControlFromUniqueValues($fieldName, $formControl);
            } elseif ($formControl->isValueRelation()) {
                // Fill comboboxes of editType "Value relation" from relation layer
                // Query QGIS Server via WFS
                $this->fillControlFromValueRelationLayer($fieldName, $formControl);
            } elseif ($formControl->isRelationReference()) {
                // Fill comboboxes of editType "Relation reference" from relation layer
                // Query QGIS Server via WFS
                $this->fillControlFromRelationReference($fieldName, $formControl);
            } elseif ($formControl->isUploadControl()) {
                // Add Hidden Control for upload
                // help to retrieve file path
                $hiddenCtrl = new jFormsControlHidden($fieldName.'_hidden');
                $form->addControl($hiddenCtrl);
                $toDeactivate[] = $formControl->getControlName();
            } elseif ($formControl->fieldEditType === 'Color') {
                $this->formPlugins[$fieldName] = 'color_html';
            }

            // Force readonly to not be required
            if ($formControl->isReadOnly && $formControl->ctrl->required) {
                $formControl->required = false;
                $formControl->ctrl->required = false;
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

        // Deactivate undisplayed fields in Drag and Drop form
        $attributeEditorForm = $this->getAttributesEditorForm();
        if ($attributeEditorForm) {
            $attributeEditorFormFields = $attributeEditorForm->getFields();
            if (count($attributeEditorFormFields) > 0) {
                foreach ($this->formControls as $fieldName => $formControl) {
                    if (in_array($fieldName, $attributeEditorFormFields)) {
                        continue;
                    }
                    if ($formControl->ctrl->type == 'hidden') {
                        continue;
                    }
                    $ctrlref = $formControl->getControlName();
                    if (!$form->isActivated($ctrlref)) {
                        continue;
                    }
                    $form->setReadOnly($ctrlref, true);
                }
            }
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

    /**
     * Get the default value of a QGIS field, if this is
     * a simple raw value.
     *
     * @param string $fieldName
     *
     * @return null|string return null if this is not a number or a string
     */
    protected function getDefaultValue($fieldName)
    {
        $expression = $this->layer->getDefaultValue($fieldName);
        if ($expression === null) {
            return null;
        }
        if (is_numeric($expression)) {
            return $expression;
        }
        if (preg_match("/^'.*'$/", $expression)) {
            // it seems this is a simple string
            $expression = trim($expression, "'");
            // if there are some ' without a \, then probably we have a
            // true expression, not a single string.
            if (!preg_match("/(?<!\\\\)'/", $expression)) {
                return str_replace("\\'", "'", $expression);
            }
        }
        // TODO implement a true QGIS expression parser or add the possibility
        // to evaluate the expression by qgis
        return null;
    }

    protected function getConstraints($fieldName)
    {
        return $this->layer->getConstraints($fieldName);
    }

    public function getQgisControls()
    {
        return $this->formControls;
    }

    public function getQgisControl($name)
    {
        if (!array_key_exists($name, $this->formControls)) {
            return null;
        }

        return $this->formControls[$name];
    }

    public function getFormControlName($name)
    {
        $ctrl = $this->getQgisControl($name);
        if ($ctrl) {
            return $ctrl->getControlName();
        }

        return null;
    }

    /**
     * @return null|qgisAttributeEditorElement
     */
    public function getAttributesEditorForm()
    {
        $this->form_name = self::generateFormName($this->form->getSelector());

        $layerXml = $this->layer->getXmlLayer();
        $_editorlayout = $layerXml->xpath('editorlayout');
        $attributeEditorForm = null;
        if ($_editorlayout && $_editorlayout[0] == 'tablayout') {
            $_attributeEditorForm = $layerXml->xpath('attributeEditorForm');
            if ($_attributeEditorForm && count($_attributeEditorForm)) {
                $attributeEditorForm = new qgisAttributeEditorElement($this, $_attributeEditorForm[0], $this->form_name);
            }
        }

        if ($attributeEditorForm && $attributeEditorForm->hasChildren()) {
            return $attributeEditorForm;
        }

        return null;
    }

    /**
     * @return jFormsPlugin[]
     */
    public function getFormPlugins()
    {
        return $this->formPlugins;
    }

    /**
     * List of field name for a jForms form.
     *
     * @return string[]
     */
    public function getFieldNames()
    {
        return array_map(function ($formControl) {
            return $formControl->getControlName();
        }, $this->formControls);
    }

    /**
     * @return jFormsBase
     */
    public function getForm()
    {
        return $this->form;
    }

    /**
     * Reset the form controls data to Null.
     *
     * @return jFormsBase the Jelix jForm object
     */
    public function resetFormData()
    {
        if (!$this->dbFieldsInfo) {
            return $this->form;
        }

        $form = $this->form;
        $dataFields = $this->dbFieldsInfo->dataFields;
        foreach ($dataFields as $ref => $prop) {
            $form->setData($ref, null);
        }

        return $form;
    }

    /**
     * Set the form controls data from the database default value.
     *
     * @return jFormsBase the Jelix jForm object
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
            } else {
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
     * @return jFormsBase the Jelix jForm object
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
            elseif ($this->formControls[$ref]->isValueRelation() && $value[0] === '{') {
                $arrayValue = array_map('intval', explode(',', trim($value, '{}')));
                $form->setData($ref, $arrayValue);
            } elseif ($this->formControls[$ref]->isUploadControl()) {
                $ctrl = $form->getControl($this->formControls[$ref]->getControlName());
                if ($ctrl && $ctrl->type == 'choice') {
                    $path = explode('/', $value);
                    $filename = array_pop($path);
                    $filename = preg_replace('#_|-#', ' ', $filename);
                    $ctrl->itemsNames['keep'] = jLocale::get('view~edition.upload.choice.keep').' '.$filename;
                    $ctrl->itemsNames['update'] = jLocale::get('view~edition.upload.choice.update');
                    $ctrl->itemsNames['delete'] = jLocale::get('view~edition.upload.choice.delete').' '.$filename;
                }
                $form->setData($ref.'_hidden', $value);
            } else {
                if (in_array(strtolower($this->formControls[$ref]->fieldEditType), array('date', 'time', 'datetime'))) {
                    $edittype = $this->formControls[$ref]->getEditType();
                    if ($edittype && property_exists($edittype, 'options')
                            && property_exists($edittype->options, 'field_format') && $value) {
                        $format = $this->convertQgisFormatToPHP($edittype->options->field_format);
                        $date = DateTime::createFromFormat($format, $value);
                        if ($date) {
                            $value = $date->format('Y-m-d H:i:s');
                        }
                    }
                }
                $form->setData($ref, $value);
            }
        }

        return $form;
    }

    public function getDateTimeConversionTab()
    {
        // 'ZZ' is not an actual PHP Format it's to avoid php format to be reconverted as if it was Qgis format
        return array_reverse(array(
            'ZZ' => 'd',
            'd' => 'j',
            'dd' => 'ZZ',
            'ddd' => 'D',
            'dddd' => 'l',
            'M' => 'n',
            'MM' => 'm',
            'MMM' => 'M',
            'MMMM' => 'F',
            'yy' => 'y',
            'yyyy' => 'Y',
            'H' => 'G',
            'HH' => 'H',
            'h' => 'G',
            'hh' => 'H',
            'AP' => 'A',
            'ap' => 'a',
            'm' => 'i',
            'mm' => 'i',
            'ss' => 's',
            't' => 'T',
            'Qt ISO Date' => 'c',
        ));
    }

    /**
     * Converts the format of a date from QGIS syntax to PHP syntax.
     *
     * @param string $fieldFormat The format to convert
     *
     * @return string The format converted
     */
    public function convertQgisFormatToPHP($fieldFormat)
    {
        $dateFormat = $fieldFormat;
        // convertion from QGIS to PHP format
        $format = $this->getDateTimeConversionTab();
        $format12h = array('a', 'ap', 'A', 'AP');
        foreach ($format12h as $am) {
            if (strstr($dateFormat, $am)) {
                $format['h'] = 'g';
                $format['hh'] = 'h';

                break;
            }
        }
        foreach ($format as $qgis => $php) {
            $dateFormat = str_replace($qgis, $php, $dateFormat);
        }

        return $dateFormat;
    }

    /**
     * Converts the datetime to the format specified in the qgis Project.
     *
     * @param string $value       The datetime to convert
     * @param string $fieldFormat The format in which to convert the date
     *
     * @return string The date converted
     */
    public function convertDateTimeToFormat($value, $fieldFormat)
    {
        $dateFormat = $this->convertQgisFormatToPHP($fieldFormat);

        $date = new DateTime($value);

        return $date->format($dateFormat);
    }

    /**
     * Save the form to the database.
     *
     * @param null|mixed $feature
     * @param array      $modifiedControls
     *
     * @return array|false|int value of primary key or false if an error occured
     */
    public function saveToDb($feature = null, $modifiedControls = array())
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

        // Get list of modified fields
        // can be an empty list
        $modifiedFields = array_keys($modifiedControls);

        // Get list of fields which are not primary keys
        $fields = array();
        foreach ($dataFields as $fieldName => $prop) {
            // For geometry column does not add it
            // if it's not an insert action
            // and no geometry modification capability
            if ($fieldName == $geometryColumn
                && !$insertAction
                && strtolower($capabilities->modifyGeometry) != 'true') {
                continue;
            }

            // For other column than geometry does not add it
            // if it's not an insert action
            // and no attribute modification capability
            if ($fieldName != $geometryColumn
                && !$insertAction
                && strtolower($capabilities->modifyAttribute) != 'true') {
                continue;
            }

            // For other column than geometry does not add it
            // if it's column not in form
            if ($fieldName != $geometryColumn
                && count($modifiedFields) != 0
                && !in_array($fieldName, $modifiedFields)
                && !in_array($this->getFormControlName($fieldName), $modifiedFields)) {
                continue;
            }

            $fields[] = $fieldName;
        }

        if (count($fields) == 0) {
            if ($insertAction) {
                // For insertion, one field has to be set
                jLog::log('Error in form, SQL cannot be constructed: no fields available for insert !', 'error');
                $this->form->setErrorOn($geometryColumn, jLocale::get('view~edition.message.error.save').' '.jLocale::get('view~edition.message.error.save.fields'));
                // do not throw an exception to let the user update the form
                jLog::log(jLocale::get('view~edition.link.error.sql'), 'error');

                return false;
            }
            // For update, nothing has changed so nothing to do except close form
            jLog::log('SQL cannot be constructed: no fields available for update !', 'error');

            return true;
        }

        $form = $this->form;
        $cnx = $this->layer->getDatasourceConnection();
        $values = array();
        // Loop though the fields and filter the form posted values
        foreach ($fields as $ref) {
            $jCtrl = $form->getControl($ref);
            // Field not in form
            if ($jCtrl === null) {
                continue;
            }
            // Control is an upload control
            if ($jCtrl instanceof jFormsControlUpload) {
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

            $convertDate = array('date', 'time', 'datetime');

            if (in_array(strtolower($this->formControls[$ref]->fieldEditType), $convertDate)) {
                $edittype = $this->formControls[$ref]->getEditType();
                if ($edittype && property_exists($edittype, 'options')
                    && property_exists($edittype->options, 'field_format')) {
                    $value = $this->convertDateTimeToFormat($value, $edittype->options->field_format);
                }
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
            $dtParams = $this->layer->getDatasourceParameters();
            // event to add or modify some values before the update
            $eventParams = array(
                'form' => $this->form,
                'action' => ($updateAction ? 'update' : 'insert'),
                'layer' => $this->layer,
                'featureId' => $this->featureId,
                'tablename' => $dtParams->tablename,
                'schema' => $dtParams->schema,
            );
            $event = jEvent::notify('LizmapEditionFeaturePreUpdateInsert', $eventParams);
            $additionnalValues = $event->getResponseByKey('values');
            if ($additionnalValues !== null) {
                foreach ($additionnalValues as $additionnalValue) {
                    $values = array_merge($values, $additionnalValue);
                }
            }

            if ($updateAction) {
                $loginFilteredLayers = $this->filterDataByLogin($this->layer->getName());
                $pkVal = $this->layer->updateFeature($feature, $values, $loginFilteredLayers);
            } else {
                $pkVal = $this->layer->insertFeature($values);
            }

            // event to execute additional process on updated/inserted data
            $eventParams['pkVal'] = $pkVal;
            jEvent::notify('LizmapEditionFeaturePostUpdateInsert', $eventParams);

            return $pkVal;
        } catch (Exception $e) {
            $form->setErrorOn($geometryColumn, jLocale::get('view~edition.message.error.save'));
            jLog::log('An error has been raised when saving form data edition to db : ', 'error');
            jLog::logEx($e, 'error');

            return false;
        }

        return false;
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

        // event to process data before the deletion
        $dtParams = $this->layer->getDatasourceParameters();
        $eventParams = array(
            'form' => $this->form,
            'layer' => $this->layer,
            'featureId' => $this->featureId,
            'tablename' => $dtParams->tablename,
            'schema' => $dtParams->schema,
            'loginFilteredLayers' => $loginFilteredLayers,
            'pkVal' => $this->layer->getPrimaryKeyValues($feature),
        );
        $event = jEvent::notify('LizmapEditionFeaturePreDelete', $eventParams);
        if ($event->allResponsesByKeyAreTrue('deleteIsAlreadyDone')) {
            return 1;
        }
        if ($event->allResponsesByKeyAreFalse('cancelDelete') === false) {
            return 0;
        }
        $result = $this->layer->deleteFeature($feature, $loginFilteredLayers);
        jEvent::notify('LizmapEditionFeaturePostDelete', $eventParams);

        return $result;
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
            and $formControl->uniqueValuesData['notNull']
        ) {
            jLog::log('notNull '.$formControl->uniqueValuesData['notNull'], 'error');
            $formControl->ctrl->required = true;
        }
        // combobox
        if (array_key_exists('editable', $formControl->uniqueValuesData)
             and $formControl->uniqueValuesData['editable']
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

            // combobox
            if (array_key_exists('useCompleter', $formControl->valueRelationData)
                 && $formControl->valueRelationData['useCompleter']
            ) {
                $formControl->ctrl->setAttribute('class', 'combobox');
            }

            // Add default empty value for required fields
            // Jelix does not do it, but we think it is better this way to avoid unwanted set values
            if (($formControl->ctrl->required and !$formControl->valueRelationData['allowMulti']) or $formControl->valueRelationData['allowNull']) {
                $data[''] = '';
            }

            // orderByValue
            if ($formControl->valueRelationData['orderByValue']) {
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
            if (!$formControl->relationReferenceData['allowNull']) {
                $formControl->ctrl->required = true;
            }

            // Add default empty value for required fields
            // Jelix does not do it, but we think it is better this way to avoid unwanted set values
            if ($formControl->ctrl->required) {
                $data[''] = '';
            }

            // orderByValue
            if ($formControl->relationReferenceData['orderByValue']) {
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
