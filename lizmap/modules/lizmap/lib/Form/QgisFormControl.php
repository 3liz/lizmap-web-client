<?php

/**
 * Create and set jForms controls based on QGIS form edit type.
 *
 * @author    3liz
 * @copyright 2012-2021 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Form;

use Jelix\FileUtilities\Path;
use Lizmap\App;

class QgisFormControl
{
    public $ref = '';

    /**
     * @var \jFormsControl|\jFormsControlDatasource
     */
    public $ctrl;

    // Qgis field name
    public $fieldName = '';

    // QGIS default value
    public $defaultValue;

    // Qgis field type
    public $fieldEditType = '';

    /**
     * Qgis field alias.
     *
     * @deprecated use getFieldAlias()
     */
    public $fieldAlias = '';

    /**
     * Qgis rendererCategories.
     *
     * @deprecated use getRendererCategories
     */
    public $rendererCategories = '';

    // Qgis data type (text, decimal, integer, etc.)
    public $fieldDataType = '';

    // Read-only
    public $isReadOnly = false;

    // required
    public $required = false;

    // Value relation : one of the edittypes. We store information in an array
    public $valueRelationData;

    public $relationReferenceData;

    public $uniqueValuesData;

    public $DefaultRoot;

    public $rootPathExpression;

    public $isWebDAV;

    public $webDavStorageUrl;

    public const QGIS_NULL_VALUE = '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}';

    // Table mapping QGIS and jelix forms
    protected static $qgisEdittypeMap = array(
        0 => array(
            'qgis' => array('name' => 'Line edit', 'description' => 'Simple edit box'),
            'jform' => array('markup' => 'input'),
        ),
        4 => array(
            'qgis' => array('name' => 'Classification', 'description' => 'Display combobox containing values of attribute used for classification'),
            'jform' => array('markup' => 'menulist'),
        ),
        5 => array(
            'qgis' => array('name' => 'Range', 'description' => 'Allow one to set numeric values from a specified range. the edit widget can be either a slider or a spin box'),
            'jform' => array('markup' => array('input', 'menulist')),
        ),
        2 => array(
            'qgis' => array('name' => 'Unique values', 'description' => 'the user can select one of the values already used in the attribute. If editable, a line edit is shown with autocompletion support, otherwise a combo box is used'),
            'jform' => array('markup' => 'menulist'),
        ),
        8 => array(
            'qgis' => array('name' => 'File name', 'description' => 'Simplifies file selection by adding a file chooser dialog.'),
            'jform' => array('markup' => 'upload'),
        ),
        3 => array(
            'qgis' => array('name' => 'Value map', 'description' => 'Combo box with predefined items. Value is stored in the attribute, description is shown in the combobox'),
            'jform' => array('markup' => 'menulist'),
        ),
        -1 => array(
            'qgis' => array('name' => 'Enumeration', 'description' => 'Combo box with values that can be used within the column s type. Must be supported by the provider.'),
            'jform' => array('markup' => 'input'),
        ),
        10 => array(
            'qgis' => array('name' => 'Immutable', 'description' => 'An immutable attribute is read-only- the user is not able to modify the contents.'),
            'jform' => array('markup' => 'input', 'readonly' => true),
        ),
        11 => array(
            'qgis' => array('name' => 'Hidden', 'description' => 'A hidden attribute will be invisible- the user is not able to see its contents'),
            'jform' => array('markup' => 'hidden'),
        ),
        7 => array(
            'qgis' => array('name' => 'Checkbox', 'description' => 'A checkbox with a value for checked state and a value for unchecked state'),
            'jform' => array('markup' => 'checkbox'),
        ),
        12 => array(
            'qgis' => array('name' => 'Text edit', 'description' => 'A text edit field that accepts multiple lines will be used'),
            'jform' => array('markup' => array('textarea', 'htmleditor')),
        ),
        13 => array(
            'qgis' => array('name' => 'Calendar', 'description' => 'A calendar widget to enter a date'),
            'jform' => array('markup' => 'date'),
        ),
        15 => array(
            'qgis' => array('name' => 'Value relation', 'description' => 'Select layer, key column and value column'),
            'jform' => array('markup' => array('menulist', 'checkboxes')),
        ),
        16 => array(
            'qgis' => array('name' => 'UUID generator', 'description' => 'Read-only field that generates a UUID if empty'),
            'jform' => array('markup' => 'input', 'readonly' => true),
        ),
        17 => array(
            'qgis' => array('name' => 'External Resource', 'description' => 'Simplifies file selection by adding a file chooser dialog.'),
            'jform' => array('markup' => 'upload'),
        ),
        18 => array(
            'qgis' => array('name' => 'Relation reference', 'description' => 'Use relation to select value'),
            'jform' => array('markup' => 'menulist'),
        ),
        'builded' => false,
    );

    // Table to map arbitrary data types to expected ones
    public const castDataType = array(
        'float' => 'decimal',
        'real' => 'decimal',
        'double' => 'decimal',
        'double decimal' => 'decimal',
        'numeric' => 'decimal',
        'int' => 'integer',
        'integer' => 'integer',
        'int4' => 'integer',
        'int8' => 'integer',
        'bigint' => 'integer',
        'smallint' => 'integer',
        '_int' => 'integer[]',
        'text' => 'text',
        'string' => 'text',
        'varchar' => 'text',
        'bpchar' => 'text',
        'char' => 'text',
        '_text' => 'text[]',
        'blob' => 'blob',
        'bytea' => 'blob',
        'geometry' => 'geometry',
        'geometrycollection' => 'geometry',
        'point' => 'geometry',
        'multipoint' => 'geometry',
        'line' => 'geometry',
        'linestring' => 'geometry',
        'multilinestring' => 'geometry',
        'polygon' => 'geometry',
        'multipolygon' => 'geometry',
        'bool' => 'boolean',
        'boolean' => 'boolean',
        'date' => 'date',
        'datetime' => 'datetime',
        'timestamp' => 'datetime',
        'timestamptz' => 'datetime',
        'time' => 'time',
        'uuid' => 'text',
    );

    /** @var App\AppContextInterface */
    protected $appContext;

    /**
     * @var QgisFormControlProperties
     */
    protected $properties;

    /**
     * Create an jForms control object based on a qgis edit widget.
     * And add it to the passed form.
     *
     * @param string                         $ref          name of the control
     * @param null|QgisFormControlProperties $properties
     * @param \jDbFieldProperties            $prop         Jelix object with field properties (datatype, required, etc.)
     * @param null|string                    $defaultValue the QGIS expression of the default value
     * @param null|array                     $constraints  the QGIS constraints
     */
    public function __construct($ref, $properties, $prop, $defaultValue, $constraints, App\AppContextInterface $appContext)
    {
        // Set class attributes
        $this->ref = $ref;
        $this->fieldName = $ref;
        $this->appContext = $appContext;
        $this->fieldDataType = self::castDataType[strtolower($prop->type)];
        $this->defaultValue = $defaultValue;

        if ($properties) {
            $this->setProperties($properties);
        }

        $this->getEditTypeMap();
        // An auto-increment field cannot be required!
        if (!$prop->autoIncrement) {
            if ($prop->notNull) {
                $this->required = true;
            }

            if ($constraints !== null
                && !$prop->notNull
                && $constraints['constraints'] > 0
                && $constraints['notNull']
            ) {
                $this->required = true;
            }
        } else {
            $this->required = false;
        }

        if ($this->fieldDataType == 'geometry') {
            $markup = 'hidden';
        } elseif ($properties) {
            $markup = $properties->getMarkup();
        } else {
            $markup = 'input';
        }

        // Create the control
        switch ($markup) {
            case 'input':
                $this->ctrl = new \jFormsControlInput($this->ref);
                if ($this->fieldEditType === 15
                    || $this->fieldEditType === 'Range'
                    || $this->fieldEditType === 'EditRange'
                ) {
                    if ($this->fieldDataType == 'integer') {
                        $this->ctrl->datatype = new \jDatatypeInteger();
                    } else {
                        $this->ctrl->datatype = new \jDatatypeDecimal();
                    }
                    $min = $this->getEditAttribute('Min');
                    if ($min !== null) {
                        $this->ctrl->datatype->addFacet('minValue', $min);
                    }
                    $max = $this->getEditAttribute('Max');
                    if ($max !== null) {
                        $this->ctrl->datatype->addFacet('maxValue', $max);
                    }
                    $step = $this->getEditAttribute('Step');
                    $precision = $this->getEditAttribute('Precision');
                    // step cast as integer, use only if datatype is integer
                    if ($step !== null && $this->fieldDataType == 'integer') {
                        $this->ctrl->setAttribute('stepValue', $step);
                    } elseif ($this->fieldDataType == 'decimal' && $precision !== null) {
                        // use precision as stepValue (will override untrustable step Value)
                        $this->ctrl->setAttribute('stepValue', pow(10, -intval($precision)));
                    }
                } elseif (!$properties || !$properties->useHtml()) {
                    // we don't want HTML into this input
                    $this->ctrl->datatype->addFacet('filterHtml', true);
                } elseif ($properties->useHtml()) {
                    // html is accepted, but will be sanitized
                    $this->ctrl->datatype = new \jDatatypeHtml();
                }

                break;

            case 'time':
                $this->ctrl = new \jFormsControlInput($this->ref);
                // we don't want HTML into this input
                $this->ctrl->datatype->addFacet('filterHtml', true);

                break;

            case 'upload':
                $this->getUploadControl();

                break;

            case 'checkbox':
                $this->ctrl = new \jFormsControlCheckbox($this->ref);
                $this->fillCheckboxValues();

                break;

            case 'htmleditor':
                $this->ctrl = new \jFormsControlHtmlEditor($this->ref);

                break;

            case 'menulist':
            case 'hidden':
            case 'checkboxes':
            case 'textarea':
            case 'date':
            case 'datetime':
                $class = '\jFormsControl'.ucfirst($markup);
                $this->ctrl = new $class($this->ref);
                if ($markup == 'menulist' || $markup == 'checkboxes') {
                    $this->fillControlDatasource();
                    if ($this->fieldDataType === 'boolean' && $prop->notNull) {
                        $this->reworkBooleanControl($markup);
                    }
                } elseif ($markup == 'textarea') {
                    if ($properties && $properties->useHtml()) {
                        // html is accepted, but will be sanitized
                        $this->ctrl->datatype = new \jDatatypeHtml();
                    } else {
                        // we don't want HTML into this input
                        $this->ctrl->datatype->addFacet('filterHtml', true);
                    }
                }

                break;

            default:
                $this->ctrl = new \jFormsControlInput($this->ref);
                if ($properties && $properties->useHtml()) {
                    // html is accepted, but will be sanitized
                    $this->ctrl->datatype = new \jDatatypeHtml();
                } else {
                    // we don't want HTML into this input
                    $this->ctrl->datatype->addFacet('filterHtml', true);
                }

                break;
        }

        // Set control main properties
        $this->setControlMainProperties();

        // Hint based on constraints
        if ($constraints !== null && $constraints['exp']) {
            if ($constraints['exp_desc'] !== '') {
                $this->ctrl->hint = $constraints['exp_desc'];
            } else {
                $this->ctrl->hint = $this->appContext->getLocale('view~edition.message.hint.constraint', array($constraints['exp_value']));
            }
        }
    }

    /**
     * @param QgisFormControlProperties $properties
     */
    protected function setProperties($properties)
    {
        $this->properties = $properties;

        $this->fieldEditType = $properties->getFieldEditType();
        $this->fieldAlias = $properties->getFieldAlias();
        $this->rendererCategories = $properties->getRendererCategories();
    }

    protected function getUploadControl()
    {
        if ($this->properties->isImageUpload()) {
            $upload = new \jFormsControlImageUpload($this->ref);
        } else {
            $upload = new \jFormsControlUpload2($this->ref);
        }
        $upload->mimetype = $this->properties->getMimeTypes();
        $upload->accept = $this->properties->getUploadAccept();
        $upload->capture = $this->properties->getUploadCapture();
        $this->DefaultRoot = $this->getEditAttribute('DefaultRoot');

        // WebDAV External Resource
        if ($this->getEditAttribute('StorageType') == 'WebDAV') {
            $this->isWebDAV = true;
            $this->webDavStorageUrl = $this->getEditAttribute('webDAVStorageUrl');
        }

        // Test if the root path must be calculated with a QGIS expression
        $propertyCollection = $this->getEditAttribute('PropertyCollection');
        if (
            isset(
                $propertyCollection,
                $propertyCollection['properties'],
                $propertyCollection['properties']['propertyRootPath'],
                $propertyCollection['properties']['propertyRootPath']['expression'],
                $propertyCollection['properties']['propertyRootPath']['active'],
            )
            && !empty(trim($propertyCollection['properties']['propertyRootPath']['expression']))
            && $propertyCollection['properties']['propertyRootPath']['active'] == true
        ) {
            $this->rootPathExpression = trim($propertyCollection['properties']['propertyRootPath']['expression']);
        }

        $this->ctrl = $upload;
    }

    protected static function buildEditTypeMap()
    {
        if (self::$qgisEdittypeMap['builded']) {
            // as self::$qgisEdittypeMap is static, it may already exists
            // if a QgisFormControl has already been instanciated
            return;
        }

        // Add new editTypes naming convention since QGIS 2.4
        self::$qgisEdittypeMap['LineEdit'] = self::$qgisEdittypeMap[0];
        self::$qgisEdittypeMap['UniqueValues'] = self::$qgisEdittypeMap[2];
        self::$qgisEdittypeMap['UniqueValuesEditable'] = self::$qgisEdittypeMap[2];
        self::$qgisEdittypeMap['ValueMap'] = self::$qgisEdittypeMap[3];
        self::$qgisEdittypeMap['Classification'] = self::$qgisEdittypeMap[4];
        self::$qgisEdittypeMap['Range'] = self::$qgisEdittypeMap[5];
        self::$qgisEdittypeMap['EditRange'] = self::$qgisEdittypeMap[5];
        self::$qgisEdittypeMap['SliderRange'] = self::$qgisEdittypeMap[5];
        self::$qgisEdittypeMap['CheckBox'] = self::$qgisEdittypeMap[7];
        self::$qgisEdittypeMap['FileName'] = self::$qgisEdittypeMap[8];
        self::$qgisEdittypeMap['Enumeration'] = self::$qgisEdittypeMap[-1];
        self::$qgisEdittypeMap['Immutable'] = self::$qgisEdittypeMap[10];
        self::$qgisEdittypeMap['Hidden'] = self::$qgisEdittypeMap[11];
        self::$qgisEdittypeMap['TextEdit'] = self::$qgisEdittypeMap[12];
        self::$qgisEdittypeMap['Calendar'] = self::$qgisEdittypeMap[13];
        self::$qgisEdittypeMap['DateTime'] = self::$qgisEdittypeMap[13];
        self::$qgisEdittypeMap['DialRange'] = self::$qgisEdittypeMap[5];
        self::$qgisEdittypeMap['ValueRelation'] = self::$qgisEdittypeMap[15];
        self::$qgisEdittypeMap['UuidGenerator'] = self::$qgisEdittypeMap[16];
        self::$qgisEdittypeMap['Photo'] = self::$qgisEdittypeMap[8];
        self::$qgisEdittypeMap['WebView'] = self::$qgisEdittypeMap[0];
        self::$qgisEdittypeMap['Color'] = self::$qgisEdittypeMap[0];
        self::$qgisEdittypeMap['ExternalResource'] = self::$qgisEdittypeMap[17];
        self::$qgisEdittypeMap['RelationReference'] = self::$qgisEdittypeMap[18];
        self::$qgisEdittypeMap['undefined'] = self::$qgisEdittypeMap[0];
        self::$qgisEdittypeMap['builded'] = true;
    }

    public static function getEditTypeMap()
    {
        if (!self::$qgisEdittypeMap['builded']) {
            self::buildEditTypeMap();
        }

        return self::$qgisEdittypeMap;
    }

    /*
    * Create an jForms control object based on a qgis edit widget.
    * @return object Jforms control object
    */
    protected function setControlMainProperties()
    {
        // Label
        $alias = $this->getFieldAlias();
        if ($alias) {
            $this->ctrl->label = $alias;
        } else {
            $this->ctrl->label = $this->fieldName;
        }

        // Data type
        if ($this->ctrl->datatype instanceof \jDatatypeString) {
            // let's change datatype when control has the default one, \jDatatypeString
            // we don't want to change datatype that are specific to a control type, like in\jFormsControlHtmlEditor,
            // \jFormsControlDate etc..
            $typeTab = array('Integer', 'Decimal', 'Date', 'DateTime', 'Time', 'Boolean');
            foreach ($typeTab as $type) {
                if ($this->fieldDataType === strtolower($type)) {
                    $class = '\jDatatype'.$type;
                    $this->ctrl->datatype = new $class();
                }
            }
        }

        // Read-only
        if ($this->fieldDataType != 'geometry') {
            if ($this->fieldEditType !== '' && is_array(self::$qgisEdittypeMap[$this->fieldEditType]) && array_key_exists('readonly', self::$qgisEdittypeMap[$this->fieldEditType]['jform'])) {
                $this->isReadOnly = true;
            }
            if ($this->properties !== null && !$this->properties->isEditable()) {
                $this->isReadOnly = true;
            }
        }

        // Read-only can't be required
        if ($this->isReadOnly && $this->required) {
            $this->required = false;
        }

        // Required
        if ($this->required) {
            $this->ctrl->required = true;
        }

        if ($this->defaultValue !== null) {
            $this->ctrl->defaultValue = $this->defaultValue;
        }
    }

    /*
    * Define checked and unchecked values for a jForms control checkbox, based on Qgis edittype
    * @return object Modified jForms control.
    */
    protected function fillCheckboxValues()
    {
        $checked = $this->getEditAttribute('CheckedState');
        $unchecked = $this->getEditAttribute('UncheckedState');

        if ($this->fieldEditType === 'CheckBox') {
            $checked = $checked === '' ? 't' : $checked;
            $unchecked = $unchecked === '' ? 'f' : $unchecked;
        }
        $this->ctrl->valueOnCheck = $checked;
        $this->ctrl->valueOnUncheck = $unchecked;
        $this->required = false; // As there is only a value, even if the checkbox is unchecked
        $this->ctrl->defaultValue = $unchecked; // defined a default value to one of the possible value
    }

    /*
    * Create and populate a datasource for a jForms control based on Qgis edittype
    * @return object Modified jForms control.
    */
    protected function fillControlDatasource()
    {
        // Create a datasource for some types : menulist
        $dataSource = new \jFormsStaticDatasource();

        // Create an array of data specific for the qgis edittype
        $data = array();

        // Add default empty value for required fields
        // Jelix does not do it, but we think it is better this way to avoid unwanted set values
        if ($this->required) {
            $data[''] = '';
        }

        switch ($this->fieldEditType) {
            // Enumeration
            case -1:
            case 'Enumeration':
                $data[0] = '--qgis edit type not supported yet--';

                break;

                // Unique Values
            case 2:
            case 'UniqueValuesEditable':
            case 'UniqueValues':
                $this->uniqueValuesData = array(
                    'notNull' => $this->getEditAttribute('notNull'),
                    'editable' => $this->properties->isEditable(),
                );
                if ($this->fieldEditType === 'UniqueValuesEditable') {
                    $this->uniqueValuesData['editable'] = true;
                }

                break;

                // Value map
            case 3:
            case 'ValueMap':
                $valueMap = $this->properties->getValueMap();
                if (is_array($valueMap)) {
                    // Override values for boolean
                    if ($this->fieldDataType == 'boolean') {
                        // remove the QGIS null value if the control value is not
                        // required, as the widget will have a possibility to choose
                        // no value (so null value... ?)
                        if (!$this->required
                            && isset($valueMap[self::QGIS_NULL_VALUE])
                        ) {
                            unset($valueMap[self::QGIS_NULL_VALUE]);
                        }
                        // transform values from QGIS ValueMap to Postgres Boolean
                        $booleanValues = array();
                        foreach ($valueMap as $v => $label) {
                            $strV = strtolower($v);
                            if ($v === self::QGIS_NULL_VALUE) {
                                $booleanValues[self::QGIS_NULL_VALUE] = $label;
                            } elseif ($strV === 'true' || $strV === 't'
                                || intval($v) === 1 || $strV === 'on') {
                                // Postgres true
                                $booleanValues['t'] = $label;
                            } elseif ($strV === 'false' || $strV === 'f'
                                || intval($v) === 0 || $strV === 'off') {
                                // Postgres false
                                $booleanValues['f'] = $label;
                            } else {
                                $booleanValues[$strV] = $label;
                            }
                        }
                        $valueMap = $booleanValues;
                    }
                    // we don't use array_merge, because this function reindexes keys if they are
                    // numerical values, and this is not what we want.
                    $data += $valueMap;
                }

                break;

                // Classification
            case 4:
            case 'Classification':
                $data = $this->properties->getRendererCategories();

                break;

                // Range
            case 5:
            case 'Range':
            case 'EditRange':
            case 'SliderRange':
            case 'DialRange':
                // Get range of data
                $min = $this->getEditAttribute('Min');
                $max = $this->getEditAttribute('Max');
                $step = $this->getEditAttribute('Step');
                if ($this->fieldDataType != 'decimal') {
                    // XXX why ?
                    $min = (int) $min;
                    $max = (int) $max;
                }
                $data[(string) $min] = $min;
                for ($i = $min; $i <= $max; $i += $step) {
                    $data[(string) $i] = $i;
                }
                $data[(string) $max] = $max;
                asort($data);

                break;

                // Value relation
            case 15:
            case 'ValueRelation':
                $this->valueRelationData = $this->properties->getValueRelationData();

                break;

            case 'RelationReference':
                $this->relationReferenceData = $this->properties->getRelationReference();

                break;
        }

        $dataSource->data = $data;
        $this->ctrl->datasource = $dataSource;
    }

    /*
    * For boolean not null field, jForms control has to be a checkbox not a list of values
    *
    * @param string $markup the jForms markup
    *
    * @return object Modified jForms control.
    */
    protected function reworkBooleanControl($markup)
    {
        if ($this->fieldDataType !== 'boolean') {
            return;
        }
        if (!in_array($markup, array('menulist', 'checkboxes'))) {
            return;
        }

        // Get data list, to use label
        $data = $this->ctrl->datasource->data;
        // Set edit type
        $this->fieldEditType = 'CheckBox';
        // Checkbox should not be required
        $this->required = false;
        // Set control
        $this->ctrl = new \jFormsControlCheckbox($this->ref);
        // Check data list
        foreach ($data as $v => $label) {
            if ($v === self::QGIS_NULL_VALUE) {
                // it is a null value for QGIS and
                // intval('{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}') === 0
                continue;
            }
            $strV = strtolower($v);
            if ($strV === 'true' || $strV === 't'
                || intval($v) === 1 || $strV === 'on') {
                // Check info
                $this->ctrl->valueOnCheck = $v;
                $this->ctrl->valueLabelOnCheck = $label;
            } elseif ($strV === 'false' || $strV === 'f'
                || intval($v) === 0 || $strV === 'off') {
                // Uncheck info
                $this->ctrl->valueOnUncheck = $v;
                $this->ctrl->valueLabelOnUncheck = $label;
            }
        }
    }

    public function isUniqueValue()
    {
        return $this->fieldEditType === 2
           || $this->fieldEditType === 'UniqueValues'
           || $this->fieldEditType === 'UniqueValuesEditable';
    }

    public function isValueRelation()
    {
        return ($this->fieldEditType === 15
            || $this->fieldEditType === 'ValueRelation')
            && $this->valueRelationData;
    }

    public function isRelationReference()
    {
        return $this->fieldEditType === 'RelationReference'
           && $this->relationReferenceData;
    }

    public function isUploadControl()
    {
        return $this->fieldEditType === 8
            || $this->fieldEditType === 'FileName'
            || $this->fieldEditType === 'Photo'
            || $this->fieldEditType === 'ExternalResource';
    }

    public function isImageUploadControl()
    {
        return $this->properties->isImageUpload();
    }

    public function getControlName()
    {
        return $this->ref;
    }

    /**
     * @return array
     */
    public function getRendererCategories()
    {
        if ($this->properties) {
            return $this->properties->getRendererCategories();
        }

        return array();
    }

    /**
     * @return string
     */
    public function getFieldAlias()
    {
        if ($this->properties) {
            return $this->properties->getFieldAlias();
        }

        return '';
    }

    /**
     * @param mixed $name
     *
     * @return mixed
     */
    public function getEditAttribute($name)
    {
        if ($this->properties) {
            return $this->properties->getEditAttribute($name);
        }

        return null;
    }

    /**
     * gets the path where to store the file.
     *
     * @param \qgisVectorLayer $layer         the layer which have the column corresponding to the control
     * @param string           $alternatePath an alternate path to store the file, depending on the field
     *
     * @return string[] the relative path to the project path, and the full path
     */
    public function getStoragePath($layer, $alternatePath = '')
    {
        $project = $layer->getProject();
        $dtParams = $layer->getDatasourceParameters();
        $repPath = $project->getRepository()->getPath();

        // If not default root is set, use the old method media/upload/projectname/tablename/
        $targetPath = 'media/upload/'.$project->getKey().'/'.$dtParams->tablename.'/'.$this->ref.'/';
        $targetFullPath = $repPath.$targetPath;

        // Else use given root, but only if it is a child or brother of the repository path
        if (!empty($alternatePath)) {
            $fullPath = Path::normalizePath(
                $repPath.$alternatePath,
                Path::NORM_ADD_TRAILING_SLASH
            );
            $parentPath = realpath($repPath.'../');
            if (strpos($fullPath, $repPath) === 0
                || strpos($fullPath, $parentPath) === 0
            ) {
                $targetPath = $alternatePath;
                $targetFullPath = $fullPath;
            }
        }

        // Create directory if needed
        // Avoid to create local directory if the files will be stored on remote WEBDAV server
        if (!is_dir($targetFullPath) && !$this->isWebDAV) {
            \jFile::createDir($targetFullPath);
        }

        return array($targetPath, $targetFullPath);
    }
}
