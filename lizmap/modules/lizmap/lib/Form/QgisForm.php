<?php
/**
 * Create and set \jForms form based on QGIS vector layer.
 *
 * @author    3liz
 * @copyright 2017-2021 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Form;

use Lizmap\App;

class QgisForm implements QgisFormControlsInterface
{
    /**
     * @var \qgisVectorLayer
     */
    protected $layer;

    /**
     * @var \jFormsBase
     */
    protected $form;

    /**
     * @var string the form id into the HTML
     */
    protected $form_name;

    /**
     * @var null|\qgisAttributeEditorElement the qgis form element
     */
    protected $attributeEditorForm;

    /**
     * @var string
     */
    protected $featureId;

    /**
     * @var bool
     */
    protected $loginFilteredOverride = false;

    /**
     * @var null|\qgisLayerDbFieldsInfo
     */
    protected $dbFieldsInfo;

    /** @var QgisFormControl[] */
    protected $formControls = array();

    /** @var string[] */
    protected $formPlugins = array();

    /** @var array[] keys are control names, values are an associative array of values for jforms widgets */
    protected $formWidgetsAttributes = array();

    /** @var App\AppContextInterface */
    protected $appContext;

    /**
     * QgisForm constructor.
     *
     * @param \qgisVectorLayer $layer
     * @param \jFormsBase      $form
     * @param string           $featureId
     * @param bool             $loginFilteredOverride
     *
     * @throws \Exception
     */
    public function __construct($layer, $form, $featureId, $loginFilteredOverride, App\AppContextInterface $appContext)
    {
        if ($layer->getType() != 'vector') {
            throw new \Exception('The layer "'.$layer->getName().'" is not a vector layer!');
        }
        if (!$layer->isEditable()) {
            throw new \Exception('The layer "'.$layer->getName().'" is not an editable vector layer!');
        }

        // Get the fields info
        $dbFieldsInfo = $layer->getDbFieldsInfo();
        // verifying db fields info
        if (!$dbFieldsInfo) {
            throw new \Exception('Can\'t get Db fields information for the layer "'.$layer->getName().'"!');
        }

        if (count($dbFieldsInfo->primaryKeys) == 0) {
            throw new \Exception('The layer "'.$layer->getName().'" has no primary keys. The edition tool needs a primary key on the table to be defined.');
        }

        $this->layer = $layer;
        $this->form = $form;
        $this->featureId = $featureId;
        $this->loginFilteredOverride = $loginFilteredOverride;
        $this->appContext = $appContext;
        $this->dbFieldsInfo = $dbFieldsInfo;

        $capabilities = $layer->getRealEditionCapabilities();
        $dataFields = $dbFieldsInfo->dataFields;
        $toDeactivate = array();
        $toSetReadOnly = array();

        $cacheHandler = $layer->getProject()->getCacheHandler();
        $formInfos = $cacheHandler->getEditableLayerFormCache($layer->getId());

        foreach ($dataFields as $fieldName => $prop) {
            $defaultValue = $this->getDefaultValue($fieldName);

            $constraints = $this->getConstraints($fieldName);

            if (isset($formInfos[$fieldName])) {
                $formControl = new QgisFormControl($fieldName, $formInfos[$fieldName], $prop, $defaultValue, $constraints, $this->appContext);
            } else {
                // The field is not present in the .XML
                $formControl = new QgisFormControl($fieldName, null, $prop, null, $constraints, $this->appContext);
            }

            $this->fillFormControl($formControl, $fieldName, $form);

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

        // Set form's private data
        $privateData = array();

        // we need some QgisFormControl data in some case where we have only the jForms object,
        // not the QgisForm object (like in jForms datasource objects etc.)
        $privateData['qgis_controls'] = array();
        foreach ($this->formControls as $fieldName => $formControl) {
            $privateData['qgis_controls'][$formControl->ref] = array(
                'valueRelationData' => $formControl->valueRelationData,
            );
        }

        $attributeEditorForm = $this->getAttributesEditorForm();
        if ($attributeEditorForm) {
            $groupVisibilities = $attributeEditorForm->getGroupVisibilityExpressions();
            $qgis_groupDependencies = \qgisExpressionUtils::getCriteriaFromExpressions($groupVisibilities);
            $privateData['qgis_groupDependencies'] = array_intersect($qgis_groupDependencies, array_keys($this->dbFieldsInfo->dataFields));
        } else {
            $privateData['qgis_groupDependencies'] = array();
        }

        $form->getContainer()->privateData = array_merge($form->getContainer()->privateData, $privateData);
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
        if ($expression === null || trim($expression) === '') {
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
        // Evaluate the expression by qgis
        $results = $this->evaluateExpression(array($fieldName => $expression));

        if ($results && property_exists($results, $fieldName)) {
            return $results->{$fieldName};
        }

        return null;
    }

    /**
     * @param QgisFormControl $formControl
     * @param string          $fieldName
     * @param \jFormsBase     $form
     */
    protected function fillFormControl($formControl, $fieldName, $form)
    {
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
            if ($formControl->isImageUploadControl()) {
                $this->formPlugins[$fieldName] = 'imageupload_htmlbootstrap';
            } else {
                $this->formPlugins[$fieldName] = 'upload2_htmlbootstrap';
            }

            list($targetPath, $tfp) = $formControl->getStoragePath($this->layer);
            $maxWidthHeight = \lizmap::getServices()->uploadedImageMaxWidthHeight;
            $this->formWidgetsAttributes[$fieldName] = array(
                'uriAction' => 'view~media:getMedia',
                'uriActionParameters' => array(
                    'repository' => $this->layer->getProject()->getRepository()->getKey(),
                    'project' => $this->layer->getProject()->getKey(),
                    'path' => $targetPath.'%s',
                ),
                'uriActionFileParameter' => 'path',
                // maximum size of the image when displayed into the popup
                'imgMaxWidth' => 260,
                'imgMaxHeight' => 320,
                // size of the dialog box where we can modify the image
                'dialogWidth' => 'auto',
                'dialogHeight' => 'auto',
                // maximum size of the uploaded image. If its size is larger this maximum
                // size, the image will be resized.
                'newImgMaxWidth' => $maxWidthHeight,
                'newImgMaxHeight' => $maxWidthHeight,
            );
        } elseif ($formControl->fieldEditType === 'Color') {
            $this->formPlugins[$fieldName] = 'color_html';
        }
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
     * @param $ref
     *
     * @return null|string[]
     */
    public function getStoragePathForControl($ref)
    {
        $ctrl = $this->getQgisControl($ref);
        if ($ctrl) {
            return $ctrl->getStoragePath($this->layer);
        }

        return array('', '');
    }

    /**
     * Return path of all files uploaded with the form.
     *
     * @param \jFormsBase $form
     *
     * @return string[] the list of path
     */
    public function getUploadedFiles($form)
    {
        $files = array();
        if ($form->hasUpload()) {
            foreach ($form->getUploads() as $upload) {
                list($path, $fullPath) = $this->getStoragePathForControl($upload->ref);
                $filename = $form->getData($upload->ref);
                if ($fullPath && $filename && file_exists($fullPath.$filename)) {
                    $files[] = $fullPath.$filename;
                }
            }
        }

        return $files;
    }

    /**
     * @return null|\qgisAttributeEditorElement
     */
    public function getAttributesEditorForm()
    {
        if ($this->form_name !== null && $this->form_name != '') {
            return $this->attributeEditorForm;
        }

        $this->form_name = self::generateFormName($this->form->getSelector());
        // FIXME do not use anymore XML in this method, migrate XML code to QgisProject  or other low level classes
        $layerXml = $this->layer->getXmlLayer();
        $_editorlayout = $layerXml->xpath('editorlayout');
        $attributeEditorForm = null;
        if ($_editorlayout && $_editorlayout[0] == 'tablayout') {
            $_attributeEditorForm = $layerXml->xpath('attributeEditorForm');
            if ($_attributeEditorForm && count($_attributeEditorForm)) {
                $attributeEditorForm = new \qgisAttributeEditorElement($this, $_attributeEditorForm[0], $this->form_name);
            }
        }

        if ($attributeEditorForm && $attributeEditorForm->hasChildren()) {
            $this->attributeEditorForm = $attributeEditorForm;

            return $attributeEditorForm;
        }

        return null;
    }

    /**
     * @return string[]
     */
    public function getFormPlugins()
    {
        return $this->formPlugins;
    }

    /**
     * @return array[] keys are control names, values are an associative array of values for jforms widgets
     */
    public function getFormWidgetsAttributes()
    {
        return $this->formWidgetsAttributes;
    }

    /**
     * List of field name for a \jForms form.
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
     * @return \jFormsBase
     */
    public function getForm()
    {
        return $this->form;
    }

    /**
     * Reset the form controls data to Null.
     *
     * @return \jFormsBase the Jelix jForm object
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
     * @return \jFormsBase the Jelix jForm object
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
                || $this->formControls[$ref]->fieldEditType === 'CheckBox')
                && $this->formControls[$ref]->fieldDataType === 'boolean') {
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
     * @return \jFormsBase the Jelix jForm object
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
                and $this->formControls[$ref]->fieldDataType === 'boolean'
            ) {
                $form->getControl($ref)->setDataFromDao($value, 'boolean');
            }
            // ValueRelation can be an array (i.e. {1,2,3} or {'foo', 'bar'})
            elseif ($this->formControls[$ref]->isValueRelation() && is_string($value) && strpos($value, '{') === 0) {
                $arrayValue = explode(',', trim($value, '{}'));
                // Depending on the QGIS version or values,
                // QGIS also enclose each single value with double-quotes
                $func = function (string $str): string {
                    return trim($str, '"');
                };
                $arrayValue = array_map($func, $arrayValue);
                $form->setData($ref, $arrayValue);
            } elseif ($this->formControls[$ref]->isUploadControl()) {
                /** @var \jFormsControlUpload2 $ctrl */
                $ctrl = $form->getControl($this->formControls[$ref]->getControlName());
                if ($ctrl) {
                    $filename = basename($value);
                    $ctrl->setDataFromDao($filename, 'string');
                }
            } else {
                if (in_array(strtolower($this->formControls[$ref]->fieldEditType), array('date', 'time', 'datetime'))) {
                    $format = $this->formControls[$ref]->getEditAttribute('field_format');
                    if ($format && $value) {
                        $format = $this->convertQgisFormatToPHP($format);
                        $date = \DateTime::createFromFormat($format, $value);
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

    public function check($feature = null)
    {
        $form = $this->form;

        $dataFields = $this->dbFieldsInfo->dataFields;
        $geometryColumn = $this->dbFieldsInfo->geometryColumn;

        // Jelix check
        $check = $form->check();

        // Geom check
        $allow_without_geom = $this->layer->getRealEditionCapabilities()->allow_without_geom;
        if (strtolower($allow_without_geom) == 'false' && $geometryColumn != '' && $form->getData($geometryColumn) == '') {
            $check = false;
            $form->setErrorOn($geometryColumn, $this->appContext->getLocale('view~edition.message.error.no.geometry'));
        }

        // Get values and form fields
        $values = array();
        $formFields = array();
        $dtParams = $this->layer->getDatasourceParameters();
        foreach ($dataFields as $fieldName => $prop) {
            $values[$fieldName] = null;
            $formFields[] = $fieldName;

            if ($form->getControl($fieldName) instanceof \jFormsControlUpload2) {
                list($targetPath, $targetFullPath) = $this->getStoragePathForControl($fieldName);
                // if the target path to store the file is not valid: error
                if ($targetFullPath == '' || !is_dir($targetFullPath) || !is_writable($targetFullPath)) {
                    $form->setErrorOn($fieldName, \jLocale::get('view~edition.message.error.upload.layer', array($dtParams->tablename)));
                }
            }
        }
        if ($feature) {
            $values = $this->layer->getDbFieldValues($feature);
        }

        // Get list of fields displayed in form
        // can be an empty list
        $attributeEditorForm = $this->getAttributesEditorForm();
        if ($attributeEditorForm) {
            $formFields = $attributeEditorForm->getFields();
        }

        // Get values from form and get expressions
        $constraintExpressions = array();
        foreach ($formFields as $fieldName) {
            $values[$fieldName] = $this->getFieldValue($fieldName, $form);
            // Get expression constraint
            $constraints = $this->getConstraints($fieldName);
            if ($constraints && $constraints['exp'] && $constraints['exp_value'] !== '') {
                $constraintExpressions[$fieldName] = $constraints['exp_value'];
            }
        }

        // Check the geometry is inside the filtering polygons, if relevant
        $geomInPolygon = $this->layer->checkFeatureAgainstPolygonFilter($values);
        if (!$geomInPolygon) {
            $check = false;
            $form->setErrorOn($geometryColumn, $this->appContext->getLocale('view~edition.message.error.geometry.outside.polygons'));
        }

        $project = $this->layer->getProject();

        // Get filter by login
        $expByUserLoginKey = 'filterByLogin';
        $expByUserLoginObj = $project->getLoginFilter($this->layer->getName(), true);
        $expByUserLogin = '';
        if (!empty($expByUserLoginObj) && array_key_exists('filter', $expByUserLoginObj)) {
            $expByUserLogin = $expByUserLoginObj['filter'];
        }
        if ($expByUserLogin !== '') {
            while (array_key_exists($expByUserLoginKey, $constraintExpressions)) {
                $expByUserLoginKey .= '@';
            }
            $constraintExpressions[$expByUserLoginKey] = $expByUserLogin;
        }

        // Evaluate constraint expressions
        if (count($constraintExpressions) > 0) {
            $form_feature = array(
                'type' => 'Feature',
                'geometry' => null,
                'properties' => $values,
            );
            $results = $this->evaluateExpression($constraintExpressions, $form_feature);

            if (!$results) {
                // Evaluation failed
                return $check;
            }
            $results = (array) $results;
            foreach ($results as $fieldName => $result) {
                if ($result === 1) {
                    continue;
                }
                if ($fieldName === $expByUserLoginKey) {
                    $loginFilterConfig = $project->getLoginFilteredConfig($this->layer->getName());
                    $form->setErrorOn($loginFilterConfig->filterAttribute, \jLocale::get('view~edition.message.error.feature.editable'));

                    $check = false;

                    continue;
                }
                $constraints = $this->getConstraints($fieldName);
                if ($constraints['exp_desc'] !== '') {
                    $form->setErrorOn($fieldName, $constraints['exp_desc']);
                } else {
                    $form->setErrorOn($fieldName, $this->appContext->getLocale('view~edition.message.error.constraint', array($constraints['exp_value'])));
                }
                $check = false;
            }
        }

        return $check;
    }

    public function getFieldValue($fieldName, $form)
    {
        $jCtrl = $form->getControl($fieldName);
        // Field not in form
        if ($jCtrl === null) {
            return null;
        }
        // Get and filter the posted data foreach form control
        $value = $form->getData($fieldName);

        if (is_array($value)) {
            $value = '{'.implode(',', $value).'}';
        }

        if ($value === '') {
            $value = null;
        }

        return $value;
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
        // conversion from QGIS to PHP format
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

        $date = new \DateTime($value);

        return $date->format($dateFormat);
    }

    /**
     * Save the form to the database.
     *
     * @param null|mixed $feature
     * @param array      $modifiedControls
     *
     * @return array|false|int value of primary key or false if an error occurred
     */
    public function saveToDb($feature = null, $modifiedControls = array())
    {
        if (!$this->dbFieldsInfo) {
            throw new \Exception('Save to database can\'t be done for the layer "'.$this->layer->getName().'"!');
        }

        $cnx = $this->layer->getDatasourceConnection();
        // Update or Insert
        $updateAction = false;
        $insertAction = false;
        if ($this->featureId) {
            $updateAction = true;
        } else {
            $insertAction = true;
        }

        $geometryColumn = $this->dbFieldsInfo->geometryColumn;
        $fields = $this->getFieldList($geometryColumn, $insertAction, $modifiedControls);

        if (count($fields) == 0) {
            if ($insertAction) {
                // For insertion, one field has to be set
                // FIXME missing context
                $this->appContext->logMessage('Error in form, SQL cannot be constructed: no fields available for insert !', 'lizmapadmin');
                $this->form->setErrorOn($geometryColumn, \jLocale::get('view~edition.message.error.save').' '.\jLocale::get('view~edition.message.error.save.fields'));
                // do not throw an exception to let the user update the form
                throw new \Exception($this->appContext->getLocale('view~edition.link.error.sql'));
            }
            // For update, nothing has changed so nothing to do except close form
            $this->appContext->logMessage('SQL cannot be constructed: no fields available for update !', 'lizmapadmin');

            return true;
        }

        $values = array();
        // Loop though the fields and filter the form posted values
        $form = $this->form;
        foreach ($fields as $ref) {
            $jCtrl = $form->getControl($ref);
            // Field not in form
            if ($jCtrl === null) {
                continue;
            }
            // Control is an upload control
            if ($jCtrl instanceof \jFormsControlUpload2 || $jCtrl instanceof \jFormsControlUpload) {
                $values[$ref] = $this->processUploadedFile($form, $ref);

                continue;
            }

            $values[$ref] = $this->getParsedValue($ref, $geometryColumn);
            if ($values[$ref] === false) {
                return false;
            }
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
            $event = $this->appContext->eventNotify('LizmapEditionFeaturePreUpdateInsert', $eventParams);
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
            $this->appContext->eventNotify('LizmapEditionFeaturePostUpdateInsert', $eventParams);

            return $pkVal;
        } catch (\Exception $e) {
            $form->setErrorOn($geometryColumn, $this->appContext->getLocale('view~edition.message.error.save'));
            $this->appContext->logMessage('An error has been raised when saving form data edition to db : ', 'lizmapadmin');
            $this->appContext->logException($e, 'lizmapadmin');

            return false;
        }

        return false;
    }

    protected function getFieldList($geometryColumn, $insertAction, $modifiedControls)
    {
        $capabilities = $this->layer->getRealEditionCapabilities();

        $dataFields = $this->dbFieldsInfo->dataFields;

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

        return $fields;
    }

    protected function getParsedValue($ref, $geometryColumn)
    {
        $form = $this->form;
        // Get and filter the posted data foreach form control
        $value = $form->getData($ref);
        $cnx = $this->layer->getDatasourceConnection();

        if (is_array($value)) {
            $value = '{'.implode(',', $value).'}';
        }

        if (($value === '' || $value === null)
            && !$this->formControls[$ref]->required) {
            return 'NULL';
        }

        $convertDate = array('date', 'time', 'datetime');

        if (in_array(strtolower($this->formControls[$ref]->fieldEditType), $convertDate)) {
            $format = $this->formControls[$ref]->getEditAttribute('field_format');
            if ($format) {
                $value = $this->convertDateTimeToFormat($value, $format);
            }
        }

        switch ($this->formControls[$ref]->fieldDataType) {
                case 'geometry':
                    try {
                        $value = $this->layer->getGeometryAsSql($value);
                    } catch (\Exception $e) {
                        $form->setErrorOn($geometryColumn, $e->getMessage());

                        return false;
                    }

                break;

            case 'date':
            case 'time':
            case 'datetime':
                $value = htmlspecialchars(strip_tags($value), ENT_NOQUOTES);
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

            case 'decimal':
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
                if ($strVal != 'true' && $strVal !== 't' && intval($value) != 1
                   && $strVal !== 'on' && $value !== true
                   && $strVal != 'false' && $strVal !== 'f' && intval($value) != 0
                   && $strVal !== 'off' && $value !== false
                ) {
                    $value = 'NULL';
                } else {
                    $value = $cnx->quote($value);
                }

                break;

            default:
                $value = $cnx->quote(
                    htmlspecialchars(strip_tags($value), ENT_NOQUOTES)
                );

                break;
        }

        return $value;
    }

    /**
     * @param \jFormsBase    $form
     * @param string         $ref
     * @param \jDbConnection $cnx
     */
    protected function processUploadedFile($form, $ref)
    {
        list($targetPath, $targetFullPath) = $this->formControls[$ref]->getStoragePath($this->layer);
        if ($targetFullPath == '') {
            return 'NULL';
        }

        /** @var \jFormsControlUpload2 $uploadCtrl */
        $uploadCtrl = $form->getControl($ref);
        $filename = $form->getData($ref);
        $cnx = $this->layer->getDatasourceConnection();
        $newFilename = $uploadCtrl->getUniqueFileName($targetFullPath);

        // save new file, delete old file if needed etc.
        $uploadCtrl->saveFile($targetFullPath, $newFilename);

        if ($newFilename) {
            // there is a new file
            return $cnx->quote($targetPath.$newFilename);
        }
        if ($filename) {
            // we keep the current file
            return $cnx->quote($targetPath.$filename);
        }

        return 'NULL';
    }

    /**
     * Delete the feature from the database.
     *
     * @param mixed $feature
     */
    public function deleteFromDb($feature)
    {
        if (!$this->dbFieldsInfo) {
            throw new \Exception('Delete from database can\'t be done for the layer "'.$this->layer->getName().'"!');
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
        $event = $this->appContext->eventNotify('LizmapEditionFeaturePreDelete', $eventParams);
        if ($event->allResponsesByKeyAreTrue('deleteIsAlreadyDone')) {
            return 1;
        }
        if ($event->allResponsesByKeyAreFalse('cancelDelete') === false) {
            return 0;
        }
        $result = $this->layer->deleteFeature($feature, $loginFilteredLayers);
        $this->appContext->eventNotify('LizmapEditionFeaturePostDelete', $eventParams);

        return $result;
    }

    /**
     * Dynamically update form by modifying the filter by login control.
     *
     * @return \jFormsBase modified form
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
            if (!$this->appContext->userIsConnected()) {
                $form->setData($attribute, 'all');
                $form->setReadOnly($attribute, true);

                return $form;
            }

            $user = $this->appContext->getUserSession();
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
                    $userGroups = $this->appContext->aclUserPublicGroupsId();
                    foreach ($userGroups as $uGroup) {
                        if ($uGroup != 'users') {
                            $data[$uGroup] = $uGroup;
                        }
                    }
                }
                $this->changeLoginFilteredControl($attribute, $data);
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
                    $plugin = \jApp::coord()->getPlugin('auth');
                    if ($plugin->config['driver'] == 'Db') {
                        $authConfig = $plugin->config['Db'];
                        $dao = $this->appContext->getJelixDao($authConfig['dao'], $authConfig['profile']);
                        $cond = \jDao::createConditions();
                        $cond->addItemOrder('login', 'asc');
                        $us = $dao->findBy($cond);
                        foreach ($us as $u) {
                            $data[$u->login] = $u->login;
                        }
                    }
                } else {
                    $gp = $this->appContext->aclUserGroupsInfo();
                    foreach ($gp as $g) {
                        if ($g->id_aclgrp != 'users') {
                            $data[$g->id_aclgrp] = $g->id_aclgrp;
                        }
                    }
                }
                $data['all'] = 'all';
                $this->changeLoginFilteredControl($attribute, $data);
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

    protected function changeLoginFilteredControl($attribute, $data)
    {
        $form = $this->form;
        $dataSource = new \jFormsStaticDatasource();
        $dataSource->data = $data;
        $ctrl = new \jFormsControlMenulist($attribute);
        $ctrl->required = true;
        $oldCtrl = $form->getControl($attribute);
        if ($oldCtrl != null) {
            $ctrl->label = $oldCtrl->label;
        } else {
            $ctrl->label = $attribute;
        }
        $ctrl->datasource = $dataSource;
        $form->removeControl($attribute);
        $form->addControl($ctrl);
    }

    /**
     * Get the values for a "Unique Values" layer's field and fill the form control for a specific field.
     *
     * @param string          $fieldName   Name of QGIS field
     * @param QgisFormControl $formControl
     */
    protected function fillControlFromUniqueValues($fieldName, $formControl)
    {
        $values = $this->layer->getDbFieldDistinctValues($fieldName);

        $data = array();
        foreach ($values as $v) {
            $data[$v] = $v;
        }

        $dataSource = new \jFormsStaticDatasource();

        // required
        if (array_key_exists('notNull', $formControl->uniqueValuesData)
            && $formControl->uniqueValuesData['notNull']
        ) {
            $this->appContext->logMessage('notNull '.$formControl->uniqueValuesData['notNull'], 'lizmapadmin');
            $formControl->ctrl->required = true;
        }
        // combobox
        if (array_key_exists('editable', $formControl->uniqueValuesData)
             && $formControl->uniqueValuesData['editable']
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
     * @param QgisFormControl $formControl
     */
    private function fillControlFromValueRelationLayer($fieldName, $formControl)
    {

        // required
        if (array_key_exists('notNull', $formControl->valueRelationData)
                and $formControl->valueRelationData['notNull']
        ) {
            \jLog::log('notNull '.$formControl->valueRelationData['notNull'], 'lizmapadmin');
            $formControl->ctrl->required = true;
        }
        // combobox
        if (array_key_exists('useCompleter', $formControl->valueRelationData)
             && $formControl->valueRelationData['useCompleter']
        ) {
            $formControl->ctrl->setAttribute('class', 'combobox');
        }

        // In lib/jelix/plugins/formwidget/menulist_html/menulist_html.formwidget.php
        // An empty value is added with these rules
        // if ($this->ctrl->emptyItemLabel !== null || !$this->ctrl->required)
        // To add an empty value to ValueRelation displayed as menulist, we only
        // have to set an emptyItemLabel !== null
        $formControl->ctrl->emptyItemLabel = '';

        // Create Datasource
        $dataSource = new QgisFormValueRelationDynamicDatasource($formControl->ref);

        // In lib/jelix/plugins/formwidget/checkboxes_html/checkboxes_html.formwidget.php
        // no empty value is added by checking the value of the Jelix Control attributes
        // emptyItemLabel and required
        // To get an empty checkbox in the list of values like in QGIS, we have to force
        // an empty value for ValueRelation not required with allowMulti and allowNull
        if ($formControl->valueRelationData['allowMulti']
            && $formControl->valueRelationData['allowNull']
            && !$formControl->ctrl->required) {
            $dataSource->setForceEmptyValue(true);
        }

        // criteriaFrom based on current_value in filterExpression
        if (array_key_exists('filterExpression', $formControl->valueRelationData)
             && $formControl->valueRelationData['filterExpression'] !== ''
        ) {
            $filterExpression = $formControl->valueRelationData['filterExpression'];
            $criteriaFrom = \qgisExpressionUtils::getCurrentValueCriteriaFromExpression($filterExpression);
            if (\qgisExpressionUtils::hasCurrentGeometry($filterExpression)) {
                $criteriaFrom[] = $this->dbFieldsInfo->geometryColumn;
            }
            if (count($criteriaFrom) !== 0) {
                $dataSource->setCriteriaControls($criteriaFrom);
            }
        }

        $formControl->ctrl->datasource = $dataSource;

        // @FIXME Is this big comment useful or can we delete it  ?
        // Add default empty value for required fields
        // Jelix does not do it, but we think it is better this way to avoid unwanted set values
        // if ($formControl->ctrl->required) {
        //    $data[''] = '';
        // }

        /*
        $wfsData = null;
        $mime = '';

        // Build WFS request parameters
        //   Get layername via id
        $project = $this->layer->getProject();
        $relationLayerId = $formControl->valueRelationData['layer'];

        $layer = $project->getLayer($relationLayerId);
        if ($layer === null) {
            $formControl->ctrl->hint = 'Control not well configured!';
            $formControl->ctrl->help = 'Control not well configured!';

            return;
        }

        $typename = $layer->getShortName();
        if ($typename === null || $typename === '') {
            $typename = str_replace(' ', '_', $layer->getName());
        }

        $valueColumn = $formControl->valueRelationData['value'];
        $keyColumn = $formControl->valueRelationData['key'];
        $filterExpression = $formControl->valueRelationData['filterExpression'];

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
        $wfsRequest = new \Lizmap\Request\WFSRequest($project, $params);
        $result = $wfsRequest->process();

        $wfsData = $result->data;
        if (property_exists($result, 'file') and $result->file and is_file($wfsData)) {
            $wfsData = \jFile::read($wfsData);
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
            $dataSource = new \jFormsStaticDatasource();

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
        }*/
    }

    /**
     * Get WFS data from a "Relation Reference" and fill the form control for a specific field.
     *
     * @param string          $fieldName   Name of QGIS field
     * @param QgisFormControl $formControl
     */
    private function fillControlFromRelationReference($fieldName, $formControl)
    {
        // Build WFS request parameters
        //   Get layername via id
        $project = $this->layer->getProject();
        $relationId = $formControl->relationReferenceData['relation'];

        $relation = $project->getRelationField($relationId);
        if (!$relation || $relation['propertyName'] == '') {
            $this->disableControl($formControl);

            return;
        }

        $params = array(
            'SERVICE' => 'WFS',
            'VERSION' => '1.0.0',
            'REQUEST' => 'GetFeature',
            'TYPENAME' => $relation['typeName'],
            'PROPERTYNAME' => $relation['propertyName'],
            'OUTPUTFORMAT' => 'GeoJSON',
            'GEOMETRYNAME' => 'none',
        );

        // add EXP_FILTER. Only for QGIS >=2.0
        $expFilter = null;
        if ($relation['filterExpression']) {
            $expFilter = $relation['filterExpression'];
        }
        // Filter by login
        if (!$this->loginFilteredOverride) {
            $loginFilteredLayers = $this->filterDataByLogin($relation['layerName']);
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

        // Get request
        $wfsRequest = new \Lizmap\Request\WFSRequest($project, $params, \lizmap::getServices());
        // Set Editing context
        $wfsRequest->setEditingContext(true);
        // Perform request
        $this->PerformWfsRequest($wfsRequest, $formControl, $relation['referencedField'], $relation['previewField']);
    }

    protected function disableControl($formControl, $message = 'Control not well configured')
    {
        $formControl->ctrl->hint = $message;
        $formControl->ctrl->help = $message;
    }

    protected function PerformWfsRequest($wfsRequest, $formControl, $referencedField, $previewField)
    {
        // Perform request
        $result = $wfsRequest->process();

        $wfsData = $result->getBodyAsString();
        $mime = $result->getMime();

        // Used data
        if ($wfsData && !in_array(strtolower($mime), array('text/html', 'text/xml'))) {
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
            $dataSource = new \jFormsStaticDatasource();

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
                return $this->disableControl($formControl, 'Problem : cannot get data to fill this control!');
            }

            return $this->disableControl($formControl, 'No data to fill this control!');
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
        $loginFilteredConfig = $lproj->getLoginFilteredConfig($layername);

        if ($loginFilteredConfig) {
            $type = 'groups';
            $attribute = $loginFilteredConfig->filterAttribute;

            // check filter type
            if (property_exists($loginFilteredConfig, 'filterPrivate')
                 && $loginFilteredConfig->filterPrivate == 'True') {
                $type = 'login';
            }

            // Check if a user is authenticated
            $isConnected = $this->appContext->userIsConnected();
            $cnx = $this->appContext->getDbConnection($this->layer->getId());
            if ($isConnected) {
                $user = $this->appContext->getUserSession();
                $login = $user->login;
                if ($type == 'login') {
                    $where = ' "'.$attribute."\" IN ( '".$login."' , 'all' )";
                } else {
                    $userGroups = $this->appContext->aclUserPublicGroupsId();
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

    public function evaluateExpression($expression, $form_feature = null)
    {
        return \qgisExpressionUtils::evaluateExpressions(
            $this->layer,
            $expression,
            $form_feature
        );
    }
}
