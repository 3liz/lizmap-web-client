<?php
/**
 * Create and set jForms controls based on QGIS form edit type.
 *
 * @author    3liz
 * @copyright 2012-2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisFormControl
{
    public $ref = '';

    /**
     * @var jFormsControl
     */
    public $ctrl;

    /**
     * Qgis edittype as a simpleXml object.
     *
     * @var SimpleXMLElement
     */
    protected $edittype;

    // Qgis field name
    public $fieldName = '';

    // QGIS default value
    public $defaultValue = null;

    // Qgis field type
    public $fieldEditType = '';

    // Qgis field alias
    public $fieldAlias = '';

    // Qgis rendererCategories
    public $rendererCategories = '';

    // Qgis data type (text, float, integer, etc.)
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

    // Table mapping QGIS and jelix forms
    protected $qgisEdittypeMap = array(
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
    );

    // Table to map arbitrary data types to expected ones
    public $castDataType = array(
        'float' => 'float',
        'real' => 'float',
        'double' => 'float',
        'double decimal' => 'float',
        'numeric' => 'float',
        'int' => 'integer',
        'integer' => 'integer',
        'int4' => 'integer',
        'int8' => 'integer',
        'bigint' => 'integer',
        'smallint' => 'integer',
        'text' => 'text',
        'string' => 'text',
        'varchar' => 'text',
        'bpchar' => 'text',
        'char' => 'text',
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
        'time' => 'time',
    );

    /**
     * @var SimpleXMLElement attributes on the widgetv2config element
     */
    protected $widgetv2configAttr;

    /**
     * Create an jForms control object based on a qgis edit widget.
     * And add it to the passed form.
     *
     * @param string           $ref                name of the control
     * @param SimpleXMLElement $edittype           simplexml object corresponding to the QGIS edittype for this field
     * @param object           $prop               Jelix object with field properties (datatype, required, etc.)
     * @param object|array|string $aliasXml        simplexml object corresponding to the QGIS alias for this field
     * @param string           $defaultValue       the QGIS expression of the default value
     * @param array            $constraints        the QGIS constraints
     * @param object           $rendererCategories simplexml object corresponding to the QGIS categories of the renderer
     */
    public function __construct($ref, $edittype, $prop, $aliasXml = null, $defaultValue=null, $constraints=null, $rendererCategories = null)
    {

    // Add new editTypes naming convention since QGIS 2.4
        $this->qgisEdittypeMap['LineEdit'] = $this->qgisEdittypeMap[0];
        $this->qgisEdittypeMap['UniqueValues'] = $this->qgisEdittypeMap[2];
        $this->qgisEdittypeMap['UniqueValuesEditable'] = $this->qgisEdittypeMap[2];
        $this->qgisEdittypeMap['ValueMap'] = $this->qgisEdittypeMap[3];
        $this->qgisEdittypeMap['Classification'] = $this->qgisEdittypeMap[4];
        $this->qgisEdittypeMap['Range'] = $this->qgisEdittypeMap[5];
        $this->qgisEdittypeMap['EditRange'] = $this->qgisEdittypeMap[5];
        $this->qgisEdittypeMap['SliderRange'] = $this->qgisEdittypeMap[5];
        $this->qgisEdittypeMap['CheckBox'] = $this->qgisEdittypeMap[7];
        $this->qgisEdittypeMap['FileName'] = $this->qgisEdittypeMap[8];
        $this->qgisEdittypeMap['Enumeration'] = $this->qgisEdittypeMap[-1];
        $this->qgisEdittypeMap['Immutable'] = $this->qgisEdittypeMap[10];
        $this->qgisEdittypeMap['Hidden'] = $this->qgisEdittypeMap[11];
        $this->qgisEdittypeMap['TextEdit'] = $this->qgisEdittypeMap[12];
        $this->qgisEdittypeMap['Calendar'] = $this->qgisEdittypeMap[13];
        $this->qgisEdittypeMap['DateTime'] = $this->qgisEdittypeMap[13];
        $this->qgisEdittypeMap['DialRange'] = $this->qgisEdittypeMap[5];
        $this->qgisEdittypeMap['ValueRelation'] = $this->qgisEdittypeMap[15];
        $this->qgisEdittypeMap['UuidGenerator'] = $this->qgisEdittypeMap[16];
        $this->qgisEdittypeMap['Photo'] = $this->qgisEdittypeMap[8];
        $this->qgisEdittypeMap['WebView'] = $this->qgisEdittypeMap[0];
        $this->qgisEdittypeMap['Color'] = $this->qgisEdittypeMap[0];
        $this->qgisEdittypeMap['ExternalResource'] = $this->qgisEdittypeMap[17];
        $this->qgisEdittypeMap['RelationReference'] = $this->qgisEdittypeMap[18];

        // Set class attributes
        $this->ref = $ref;
        $this->fieldName = $ref;
        if (is_string($aliasXml)) {
            $this->fieldAlias = $aliasXml;
        } elseif ($aliasXml and is_array($aliasXml) and count($aliasXml) != 0) {
            $this->fieldAlias = (string) $aliasXml[0]->attributes()->name;
        } elseif ($aliasXml and count($aliasXml) != 0) {
            $this->fieldAlias = $aliasXml;
        }
        $this->fieldDataType = $this->castDataType[strtolower($prop->type)];

        $this->defaultValue = $defaultValue;

        // An auto-increment field cannot be required!
        if ( !$prop->autoIncrement ) {
            if ($prop->notNull) {
                $this->required = true;
            }

            if ($constraints !== null && !$prop->notNull &&
                $constraints['constraints'] > 0 && $constraints['notNull']) {
                $this->required = true;
            }
        } else {
            $this->required = false;
        }

        if ($this->fieldDataType != 'geometry') {
            $this->edittype = $edittype;
            $this->rendererCategories = $rendererCategories;

            // Get qgis edittype data
            if ($this->edittype && ($this->edittype instanceof SimpleXMLElement)) {
                // New QGIS 2.4 edittypes : use widgetv2type property
                if (property_exists($this->edittype->attributes(), 'widgetv2type')) {
                    $this->widgetv2configAttr = $this->edittype->widgetv2config->attributes();
                    $this->fieldEditType = (string) $this->edittype->attributes()->widgetv2type;
                }
                // Before QGIS 2.4
                else {
                    $this->fieldEditType = (int) $this->edittype->attributes()->type;
                }
            } else if ($this->edittype && is_object($this->edittype)) {
                $this->widgetv2configAttr = $this->edittype->options;
                $this->fieldEditType = $this->edittype->type;
            } else {
                $this->fieldEditType = 0;
            }

            // Get jform control type
            if ($this->fieldEditType === 12) {
                $useHtml = 0;
                if (property_exists($this->edittype->attributes(), 'UseHtml')) {
                    $useHtml =(int) filter_var((string)$this->edittype->attributes()->UseHtml, FILTER_VALIDATE_BOOLEAN);
                }
                $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'][$useHtml];
            } elseif ($this->fieldEditType === 'TextEdit') {
                $isMultiLine = false;
                if (property_exists($this->widgetv2configAttr, 'IsMultiline')) {
                    $isMultiLine = filter_var((string)$this->widgetv2configAttr->IsMultiline, FILTER_VALIDATE_BOOLEAN);
                }

                if (!$isMultiLine) {
                    $this->fieldEditType = 'LineEdit';
                    $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'];
                } else {
                    $useHtml = 0;
                    if (property_exists($this->widgetv2configAttr, 'UseHtml')) {
                        $useHtml = (int) filter_var((string)$this->widgetv2configAttr->UseHtml, FILTER_VALIDATE_BOOLEAN);
                    }
                    $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'][$useHtml];
                }
            } elseif ($this->fieldEditType === 5) {
                $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'][0];
            } elseif ($this->fieldEditType === 15) {
                $allowMulti = (int) filter_var((string)$this->edittype->attributes()->allowMulti, FILTER_VALIDATE_BOOLEAN);
                $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'][$allowMulti];
            } elseif ($this->fieldEditType === 'Range' || $this->fieldEditType === 'EditRange') {
                $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'][0];
            } elseif ($this->fieldEditType === 'SliderRange' || $this->fieldEditType === 'DialRange') {
                $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'][1];
            } elseif ($this->fieldEditType === 'ValueRelation') {
                $allowMulti = (int) filter_var((string)$this->widgetv2configAttr->AllowMulti, FILTER_VALIDATE_BOOLEAN);
                $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'][$allowMulti];
            } elseif ($this->fieldEditType === 'DateTime') {
                $markup = 'date';
                $display_format = $this->widgetv2configAttr->display_format;
                // Use date AND time widget id type is DateTime and we find HH
                if (preg_match('#HH#i', $display_format)) {
                    $markup = 'datetime';
                }
                // Use only time if field is only time
                if (preg_match('#HH#i', $display_format) and !preg_match('#YY#i', $display_format)) {
                    $markup = 'time';
                }
            } else {
                $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'];
            }
        } else {
            $markup = 'hidden';
        }

        // Create the control
        switch ($markup) {
            case 'input':
                $this->ctrl = new jFormsControlInput($this->ref);
                if ($this->fieldEditType === 15) {
                    $this->ctrl->minvalue = (float) $this->edittype->attributes()->min;
                    $this->ctrl->maxvalue = (float) $this->edittype->attributes()->max;
                } elseif ($this->fieldEditType === 'Range' ||
                         $this->fieldEditType === 'EditRange') {
                    $this->ctrl->minvalue = (float) $this->widgetv2configAttr->Min;
                    $this->ctrl->maxvalue = (float) $this->widgetv2configAttr->Max;
                }

                break;

            case 'menulist':
                $this->ctrl = new jFormsControlMenulist($this->ref);
                $this->fillControlDatasource();

                break;

            case 'checkboxes':
                $this->ctrl = new jFormsControlCheckboxes($this->ref);
                $this->fillControlDatasource();

                break;

            case 'hidden':
                $this->ctrl = new jFormsControlHidden($this->ref);

                break;

            case 'checkbox':
                $this->ctrl = new jFormsControlCheckbox($this->ref);
                $this->fillCheckboxValues();

                break;

            case 'textarea':
                $this->ctrl = new jFormsControlTextarea($this->ref);

                break;

            case 'htmleditor':
                $this->ctrl = new jFormsControlHtmlEditor($this->ref);

                break;

            case 'date':
                $this->ctrl = new jFormsControlDate($this->ref);

                break;

            case 'datetime':
                $this->ctrl = new jFormsControlDatetime($this->ref);

                break;

            case 'time':
                //$this->ctrl = new jFormsControlDatetime($this->ref);
                $this->ctrl = new jFormsControlInput($this->ref);

                break;

            case 'upload':
                $choice = new jFormsControlChoice($this->ref.'_choice');
                $choice->createItem('keep', 'keep');
                $choice->createItem('update', 'update');
                $upload = new jFormsControlUpload($this->ref);
                if ($this->fieldEditType === 'Photo') {
                    $upload->mimetype = array('image/jpg', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/gif');
                    $upload->accept = 'image/jpg, image/jpeg, image/pjpeg, image/png, image/gif';
                    $upload->capture = 'camera';
                } elseif ($this->fieldEditType === 'ExternalResource') {
                    $upload->accept = '';
                    if (property_exists($this->widgetv2configAttr, 'FileWidgetFilter')) {
                        //QFileDialog::getOpenFileName filter
                        $FileWidgetFilter = $this->widgetv2configAttr->FileWidgetFilter;
                        $FileWidgetFilter = explode(';;', $FileWidgetFilter);
                        $accepts = array();
                        $re = '/(\*\.\w{3,6})/';
                        foreach ($FileWidgetFilter as $FileFilter) {
                            $matches = array();
                            if (preg_match_all($re, $FileFilter, $matches) == 1) {
                                foreach (array_slice($matches, 1) as $m) {
                                    $accepts[] = substr($m, 1);
                                }
                            }
                        }
                        if (count($accepts) > 0) {
                            $upload->accept = implode(', ', array_unique($accepts));
                        }
                    }
                    if (property_exists($this->widgetv2configAttr, 'DocumentViewer')
                        && ($this->widgetv2configAttr->DocumentViewer === '1' || $this->widgetv2configAttr->DocumentViewer === 'true')) {
                        if ($upload->accept != '') {
                            $mimetypes = array();
                            $accepts = explode(', ', $upload->accept);
                            foreach ($accepts as $a) {
                                if ($a == '.gif') {
                                    $mimetypes[] = 'image/gif';
                                } elseif ($a == '.png') {
                                    $mimetypes[] = 'image/png';
                                } elseif ($a == '.jpg' or $a == '.jpeg') {
                                    if (!in_array('image/jpg', $mimetypes)) {
                                        $mimetypes = array_merge($mimetypes, array('image/jpg', 'image/jpeg', 'image/pjpeg'));
                                    }
                                } elseif ($a == '.bm' or $a == '.bmp') {
                                    if (!in_array('image/bmp', $mimetypes)) {
                                        $mimetypes = array_merge($mimetypes, array('image/bmp', 'image/x-windows-bmp'));
                                    }
                                } elseif ($a == '.pbm') {
                                    $mimetypes[] = 'image/x-portable-bitmap';
                                } elseif ($a == '.pgm') {
                                    $mimetypes = array_merge($mimetypes, array('image/x-portable-graymap', 'image/x-portable-greymap'));
                                } elseif ($a == '.ppm') {
                                    $mimetypes[] = 'image/x-portable-pixmap';
                                } elseif ($a == '.xbm') {
                                    $mimetypes = array_merge($mimetypes, array('image/xbm', 'image/x-xbm', 'image/x-xbitmap'));
                                } elseif ($a == '.xpm') {
                                    $mimetypes = array_merge($mimetypes, array('image/xpm', 'image/x-xpixmap'));
                                } elseif ($a == '.svg') {
                                    $mimetypes[] = 'image/svg+xml';
                                }
                            }
                            $upload->mimetype = array_unique($mimetypes);
                        } else {
                            $upload->mimetype = array('image/jpg', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/gif');
                            $upload->accept = 'image/jpg, image/jpeg, image/pjpeg, image/png, image/gif';
                        }
                        $upload->capture = 'camera';
                    }
                    if (property_exists($this->widgetv2configAttr, 'DefaultRoot')
                        and (
                          preg_match(
                              '#^../media(/)?#',
                              $this->widgetv2configAttr->DefaultRoot
                          )
                          or
                          preg_match(
                              '#^media(/)?#',
                              $this->widgetv2configAttr->DefaultRoot
                          )
                        )
                    ) {
                        $this->DefaultRoot = $this->widgetv2configAttr->DefaultRoot.'/';
                    } else {
                        $this->DefaultRoot = '';
                    }
                }
                $choice->addChildControl($upload, 'update');
                $choice->createItem('delete', 'delete');
                $choice->defaultValue = 'keep';
                $this->ctrl = $choice;

                break;

            default:
                $this->ctrl = new jFormsControlInput($this->ref);

                break;
        }

        // Rework for boolean
        if ($this->fieldDataType == 'boolean' &&
            in_array($markup, array('menulist', 'checkboxes'))) {
            // Get data list, to use label
            $data = $this->ctrl->datasource->data;
            // Set edit type
            $this->fieldEditType = 'CheckBox';
            // Checkbox should not be required
            $this->required = false;
            // Set control
            $this->ctrl = new jFormsControlCheckbox($this->ref);
            // Check data list
            foreach ($data as $k=>$v) {
                $strK = strtolower($k);
                if ($strK === 'true' || $strK === 't' ||
                    intval($k) === 1 || $strK === 'on') {
                    // Check info
                    $this->ctrl->valueOnCheck = $k;
                    $this->ctrl->valueLabelOnCheck = $v;
                } else if ($strK === 'false' || $strK === 'f' ||
                    intval($k) === 0 || $strK === 'off') {
                    // Uncheck info
                    $this->ctrl->valueOnUncheck = $k;
                    $this->ctrl->valueLabelOnUncheck = $v;
                }
            }
        }

        // Set control main properties
        $this->setControlMainProperties();
    }

    /*
    * Create an jForms control object based on a qgis edit widget.
    * @return object Jforms control object
    */
    protected function setControlMainProperties()
    {

        // Label
        if ($this->fieldAlias) {
            $this->ctrl->label = $this->fieldAlias;
        } else {
            $this->ctrl->label = $this->fieldName;
        }

        // Data type
        if ($this->ctrl->datatype instanceof jDatatypeString) {
            // let's change datatype when control has the default one, jDatatypeString
            // we don't want to change datatype that are specific to a control type, like in jFormsControlHtmlEditor,
            // jFormsControlDate etc..

            switch ($this->fieldDataType) {
                case 'integer':
                    $this->ctrl->datatype = new jDatatypeInteger();

                    break;

                case 'float':
                    $this->ctrl->datatype = new jDatatypeDecimal();

                    break;

                case 'date':
                    $this->ctrl->datatype = new jDatatypeDate();

                    break;

                case 'datetime':
                    $this->ctrl->datatype = new jDatatypeDateTime();

                    break;

                case 'time':
                    $this->ctrl->datatype = new jDatatypeTime();

                    break;

                case 'boolean':
                    $this->ctrl->datatype = new jDatatypeBoolean();

                    break;
            }
        }

        // Read-only
        if ($this->fieldDataType != 'geometry') {
            if (array_key_exists('readonly', $this->qgisEdittypeMap[$this->fieldEditType]['jform'])) {
                $this->isReadOnly = true;
            }
            if ($this->edittype && ($this->edittype instanceof SimpleXMLElement)) {
                $isEditable = true;
                // Also use "editable" property
                if (property_exists($this->edittype->attributes(), 'editable')) {
                    $isEditable = filter_var((string)$this->edittype->attributes()->editable, FILTER_VALIDATE_BOOLEAN);
                }
                // Also use "fieldEditable" property
                else if (property_exists($this->edittype->attributes(), 'widgetv2type') &&
                        property_exists($this->widgetv2configAttr, 'fieldEditable')
                ) {
                    $isEditable = filter_var((string) $this->widgetv2configAttr->fieldEditable, FILTER_VALIDATE_BOOLEAN);
                }
                if (!$isEditable) {
                    $this->isReadOnly = true;
                }
            } else if ($this->edittype && is_object($this->edittype) && $this->edittype->editable === 0) {
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
        $checked = null;
        $unchecked = null;
        if ($this->fieldEditType === 'CheckBox') {
            $checked = (string) ($this->widgetv2configAttr->CheckedState === '' ? 't' : $this->widgetv2configAttr->CheckedState);
            $unchecked = (string) ($this->widgetv2configAttr->UncheckedState === '' ? 'f' : $this->widgetv2configAttr->UncheckedState);
        } else {
            $checked = (string) $this->edittype->attributes()->checked;
            $unchecked = (string) $this->edittype->attributes()->unchecked;
        }
        $this->ctrl->valueOnCheck = $checked;
        $this->ctrl->valueOnUncheck = $unchecked;
        $this->required = false; // As there is only a value, even if the checkbox is unchecked
    }

    /*
    * Create and populate a datasource for a jForms control based on Qgis edittype
    * @return object Modified jForms control.
    */
    protected function fillControlDatasource()
    {

        // Create a datasource for some types : menulist
        $dataSource = new jFormsStaticDatasource();

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
                    'notNull' => False,
                    'editable' => False,
                );
                if ($this->fieldEditType === 'UniqueValuesEditable') {
                    $this->uniqueValuesData['editable'] = True;
                }
                if (($this->edittype instanceof SimpleXMLElement) && $this->edittype->widgetv2config) {
                    $this->uniqueValuesData['notNull'] = filter_var($this->widgetv2configAttr->notNull, FILTER_VALIDATE_BOOLEAN);
                    $this->uniqueValuesData['editable'] = filter_var($this->widgetv2configAttr->Editable, FILTER_VALIDATE_BOOLEAN);
                } else if (is_object($this->edittype)) {
                    if (property_exists($this->widgetv2configAttr, 'notNull')) {
                        $this->uniqueValuesData['notNull'] = filter_var($this->widgetv2configAttr->notNull, FILTER_VALIDATE_BOOLEAN);
                    }
                    if (property_exists($this->widgetv2configAttr, 'Editable')) {
                        $this->uniqueValuesData['editable'] = filter_var($this->widgetv2configAttr->Editable, FILTER_VALIDATE_BOOLEAN);
                    }
                }

                break;

            // Value map
            case 3:
                foreach ($this->edittype->xpath('valuepair') as $valuepair) {
                    $k = (string) $valuepair->attributes()->key;
                    $v = (string) $valuepair->attributes()->value;
                    $data[$v] = $k;
                }

                break;
            case 'ValueMap':
                if ($this->edittype instanceof SimpleXMLElement) {
                    foreach ($this->edittype->widgetv2config->xpath('value') as $value) {
                        $k = (string) $value->attributes()->key;
                        $v = (string) $value->attributes()->value;
                        $data[$v] = $k;
                    }
                } else if (is_object($this->edittype)) {
                    foreach ($this->widgetv2configAttr->map as $value) {
                        $k = (string) $value->key;
                        $v = (string) $value->value;
                        $data[$v] = $k;
                    }
                }

                break;

            // Classification
            case 4:
            case 'Classification':
                foreach ($this->rendererCategories as $category) {
                    $k = (string) $category->attributes()->label;
                    $v = (string) $category->attributes()->value;
                    $data[$v] = $k;
                }

                break;

            // Range
            case 5:
                // Get range of data
                if ($this->fieldDataType == 'float') {
                    $min = (float) $this->edittype->attributes()->min;
                    $max = (float) $this->edittype->attributes()->max;
                    $step = (float) $this->edittype->attributes()->step;
                } else {
                    $min = (int) $this->edittype->attributes()->min;
                    $max = (int) $this->edittype->attributes()->max;
                    $step = (int) $this->edittype->attributes()->step;
                }
                $data[(string) $min] = $min;
                for ($i = $min; $i <= $max; $i += $step) {
                    $data[(string) $i] = $i;
                }
                $data[(string) $max] = $max;

                break;

            case 'Range':
            case 'EditRange':
            case 'SliderRange':
            case 'DialRange':
                // Get range of data
                if ($this->fieldDataType == 'float') {
                    $min = (float) $this->widgetv2configAttr->Min;
                    $max = (float) $this->widgetv2configAttr->Max;
                    $step = (float) $this->widgetv2configAttr->Step;
                } else {
                    $min = (int) $this->widgetv2configAttr->Min;
                    $max = (int) $this->widgetv2configAttr->Max;
                    $step = (int) $this->widgetv2configAttr->Step;
                }
                $data[(string) $min] = $min;
                for ($i = $min; $i <= $max; $i += $step) {
                    $data[(string) $i] = $i;
                }
                $data[(string) $max] = $max;

                break;

            // Value relation
            case 15:
                $allowNull = filter_var($this->edittype->attributes()->allowNull, FILTER_VALIDATE_BOOLEAN);
                $orderByValue = (string) $this->edittype->attributes()->orderByValue;
                $layer = (string) $this->edittype->attributes()->layer;
                $key = (string) $this->edittype->attributes()->key;
                $value = (string) $this->edittype->attributes()->value;
                $allowMulti = filter_var($this->edittype->attributes()->allowMulti, FILTER_VALIDATE_BOOLEAN);
                $filterExpression = (string) $this->edittype->attributes()->filterExpression;
                $this->valueRelationData = array(
                    'allowNull' => $allowNull,
                    'orderByValue' => $orderByValue,
                    'layer' => $layer,
                    'key' => $key,
                    'value' => $value,
                    'allowMulti' => $allowMulti,
                    'filterExpression' => $filterExpression,
                );

                break;

            case 'ValueRelation':
                $allowNull = filter_var($this->widgetv2configAttr->AllowNull, FILTER_VALIDATE_BOOLEAN);
                $orderByValue = (string) $this->widgetv2configAttr->OrderByValue;
                $layer = (string) $this->widgetv2configAttr->Layer;
                $key = (string) $this->widgetv2configAttr->Key;
                $value = (string) $this->widgetv2configAttr->Value;
                $allowMulti = filter_var($this->widgetv2configAttr->AllowMulti, FILTER_VALIDATE_BOOLEAN);
                $filterExpression = (string) $this->widgetv2configAttr->FilterExpression;
                $useCompleter = filter_var($this->widgetv2configAttr->UseCompleter, FILTER_VALIDATE_BOOLEAN);
                $fieldEditable = True;
                if (($this->edittype instanceof SimpleXMLElement) && property_exists($this->widgetv2configAttr, 'fieldEditable')) {
                    $fieldEditable = filter_var($this->widgetv2configAttr->fieldEditable, FILTER_VALIDATE_BOOLEAN);
                } else if (is_object($this->edittype) && property_exists($this->edittype, 'editable')) {
                    $fieldEditable = filter_var($this->edittype->editable, FILTER_VALIDATE_BOOLEAN);
                }

                $this->valueRelationData = array(
                    'allowNull' => $allowNull,
                    'orderByValue' => $orderByValue,
                    'layer' => $layer,
                    'key' => $key,
                    'value' => $value,
                    'allowMulti' => $allowMulti,
                    'filterExpression' => $filterExpression,
                    'useCompleter' => $useCompleter,
                    'fieldEditable' => $fieldEditable,
                );

                break;

            case 'RelationReference':
                $allowNull = filter_var($this->widgetv2configAttr->AllowNULL, FILTER_VALIDATE_BOOLEAN);
                $orderByValue = filter_var($this->widgetv2configAttr->OrderByValue, FILTER_VALIDATE_BOOLEAN);
                $Relation = (string) $this->widgetv2configAttr->Relation;
                $MapIdentification = filter_var($this->widgetv2configAttr->MapIdentification, FILTER_VALIDATE_BOOLEAN);
                $chainFilters = False;
                $filters = array();
                if (($this->edittype instanceof SimpleXMLElement)) {
                    if (property_exists($this->edittype->widgetv2config, 'FilterFields')) {
                        foreach ($this->edittype->widgetv2config->FilterFields->children('field') as $f) {
                            $filters[] = (string) $f->attributes()->name;
                        }
                        $chainFilters = filter_var($this->edittype->widgetv2config->FilterFields->attributes()->ChainFilters, FILTER_VALIDATE_BOOLEAN);
                    }
                } else if (is_object($this->edittype)) {
                    if (property_exists($this->widgetv2configAttr, 'FilterFields')) {
                        $filters = $this->widgetv2configAttr->FilterFields;
                    }
                    if (property_exists($this->widgetv2configAttr, 'ChainFilters')) {
                        $chainFilters = filter_var($this->widgetv2configAttr->ChainFilters, FILTER_VALIDATE_BOOLEAN);
                    }
                }
                $this->relationReferenceData = array(
                    'allowNull' => $allowNull,
                    'orderByValue' => $orderByValue,
                    'relation' => $Relation,
                    'mapIdentification' => $MapIdentification,
                    'filters' => $filters,
                    'chainFilters' => $chainFilters,
                );

                break;

        }

        asort($data);
        $dataSource->data = $data;
        $this->ctrl->datasource = $dataSource;
    }

    public function isUniqueValue()
    {
        return $this->fieldEditType === 2 ||
           $this->fieldEditType === 'UniqueValues' ||
           $this->fieldEditType === 'UniqueValuesEditable';
    }

    public function isValueRelation()
    {
        return ($this->fieldEditType === 15 ||
            $this->fieldEditType === 'ValueRelation') &&
            $this->valueRelationData;
    }

    public function isRelationReference()
    {
        return $this->fieldEditType === 'RelationReference' &&
           $this->relationReferenceData;
    }

    public function isUploadControl()
    {
        return $this->fieldEditType === 8 ||
            $this->fieldEditType === 'FileName' ||
            $this->fieldEditType === 'Photo' ||
            $this->fieldEditType === 'ExternalResource';
    }

    public function getControlName()
    {
        // Change field name to choice for files upload control
        return $this->isUploadControl() ? $this->ref.'_choice' : $this->ref;
    }
}
