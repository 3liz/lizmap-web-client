<?php
/**
* Create and set jForms controls based on QGIS form edit type.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


class qgisFormControl{

    public $ref = '';

    // JForm control object
    public $ctrl = '';

    // Qgis edittype as a simpleXml object
    public $edittype = '';

    // Qgis field name
    public $fieldName = '';

    // Qgis field type
    public $fieldEditType = '';

    // Qgis field alias
    public $fieldAlias = '';

    // Qgis rendererCategories
    public $rendererCategories = '';

    // Qgis data type (text, float, integer, etc.)
    public $fieldDataType = '';

    // Read-only
    public $isReadOnly = False;

    // required
    public $required = False;

    // Value relation : one of the edittypes. We store information in an array
    public $valueRelationData = Null;

    // Table mapping QGIS and jelix forms
    public $qgisEdittypeMap = array(
      0 => array (
            'qgis'=>array('name'=>'Line edit', 'description'=>'Simple edit box'),
            'jform'=>array('markup'=>'input')
      ),
      4 => array (
            'qgis'=>array('name'=>'Classification', 'description'=>'Display combobox containing values of attribute used for classification'),
            'jform'=>array('markup'=>'menulist')
      ),
      5 => array (
            'qgis'=>array('name'=>'Range', 'description'=>'Allow one to set numeric values from a specified range. the edit widget can be either a slider or a spin box'),
            'jform'=>array('markup'=>'menulist')
      ),
      2 => array (
            'qgis'=>array('name'=>'Unique values', 'description'=>'the user can select one of the values already used in the attribute. If editable, a line edit is shown with autocompletion support, otherwise a combo box is used'),
            'jform'=>array('markup'=>'input')
      ),
      8 => array (
            'qgis'=>array('name'=>'File name', 'description'=>'Simplifies file selection by adding a file chooser dialog.'),
            'jform'=>array('markup'=>'upload')
      ),
      3 => array (
            'qgis'=>array('name'=>'Value map', 'description'=>'Combo box with predefined items. Value is stored in the attribute, description is shown in the combobox'),
            'jform'=>array('markup'=>'menulist')
      ),
      -1 => array (
            'qgis'=>array('name'=>'Enumeration', 'description'=>'Combo box with values that can be used within the column s type. Must be supported by the provider.'),
            'jform'=>array('markup'=>'input')
      ),
      10 => array (
            'qgis'=>array('name'=>'Immutable', 'description'=>'An immutable attribute is read-only- the user is not able to modify the contents.'),
            'jform'=>array('markup'=>'input', 'readonly'=>true)
      ),
      11 => array (
            'qgis'=>array('name'=>'Hidden', 'description'=>'A hidden attribute will be invisible- the user is not able to see its contents'),
            'jform'=>array('markup'=>'hidden')
      ),
      7 => array (
            'qgis'=>array('name'=>'Checkbox', 'description'=>'A checkbox with a value for checked state and a value for unchecked state'),
            'jform'=>array('markup'=>'checkbox')
      ),
      12 => array (
            'qgis'=>array('name'=>'Text edit', 'description'=>'A text edit field that accepts multiple lines will be used'),
            'jform'=>array('markup'=>'textarea')
      ),
      13 => array (
            'qgis'=>array('name'=>'Calendar', 'description'=>'A calendar widget to enter a date'),
            'jform'=>array('markup'=>'date')
      ),
      15 => array (
            'qgis'=>array('name'=>'Value relation', 'description'=>'Select layer, key column and value column'),
            'jform'=>array('markup'=>array('menulist','checkboxes'))
      ),
      16 => array (
            'qgis'=>array('name'=>'UUID generator', 'description'=>'Read-only field that generates a UUID if empty'),
            'jform'=>array('markup'=>'input', 'readonly'=>true)
      )
    );

    // Table to map arbitrary data types to expected ones
    public $castDataType = array(
      'float'=>'float',
      'real'=>'float',
      'double'=>'float',
      'double decimal'=>'float',
      'numeric'=>'float',
      'int'=>'integer',
      'integer'=>'integer',
      'int4'=>'integer',
      'int8'=>'integer',
      'bigint'=>'integer',
      'smallint'=>'integer',
      'text'=>'text',
      'string'=>'text',
      'varchar'=>'text',
      'bpchar'=>'text',
      'char'=>'text',
      'blob'=>'blob',
      'bytea'=>'blob',
      'geometry'=>'geometry',
      'geometrycollection'=>'geometry',
      'point'=>'geometry',
      'multipoint'=>'geometry',
      'line'=>'geometry',
      'linestring'=>'geometry',
      'multilinestring'=>'geometry',
      'polygon'=>'geometry',
      'multipolygon'=>'geometry',
      'bool'=>'boolean',
      'boolean'=>'boolean',
      'date'=>'date',
      'datetime'=>'datetime',
      'timestamp'=>'datetime',
      'time'=>'time'
    );




  /**
  * Create an jForms control object based on a qgis edit widget.
  * And add it to the passed form.
  * @param string $ref Name of the control.
  * @param object $edittype simplexml object corresponding to the QGIS edittype for this field.
  * @param object $aliasXml simplexml object corresponding to the QGIS alias for this field.
  * @param object $rendererCategories simplexml object corresponding to the QGIS categories of the renderer.
  * @param object $prop Jelix object with field properties (datatype, required, etc.)
  */
  public function __construct ($ref, $edittype, $aliasXml=Null, $rendererCategories=Null, $prop){

    // Add new editTypes naming convention since QGIS 2.4
    $this->qgisEdittypeMap['LineEdit'] = $this->qgisEdittypeMap[0];
    $this->qgisEdittypeMap['UniqueValues'] = $this->qgisEdittypeMap[2];
    $this->qgisEdittypeMap['UniqueValuesEditable'] = $this->qgisEdittypeMap[2];
    $this->qgisEdittypeMap['ValueMap'] = $this->qgisEdittypeMap[3];
    $this->qgisEdittypeMap['Classification'] = $this->qgisEdittypeMap[4];
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

    // Set class attributes
    $this->ref = $ref;
    $this->fieldName = $ref;
    if ( $aliasXml and count( $aliasXml ) != 0 )
      $this->fieldAlias = (string)$aliasXml[0]->attributes()->name;
    $this->fieldDataType = $this->castDataType[strtolower($prop->type)];

    if($prop->notNull && !$prop->autoIncrement)
      $this->required = True;

    if($this->fieldDataType != 'geometry'){
      $this->edittype = $edittype;
      $this->rendererCategories = $rendererCategories;

      // Get qgis edittype data
      if($this->edittype){
        // New QGIS 2.4 edittypes : use widgetv2type property
        if( property_exists($this->edittype[0]->attributes(), 'widgetv2type') ){
          $this->fieldEditType = (string)$this->edittype[0]->attributes()->widgetv2type;

          // no more line edit. Since 2.4, textedit with multiline attribute = 0
          if ( (string)$this->edittype[0]->widgetv2config->attributes()->IsMultiline == '0'){
            $this->fieldEditType = 0;
          }
        }
        // Before QGIS 2.4
        else {
          $this->fieldEditType = (integer)$this->edittype[0]->attributes()->type;
        }
      }
      else
        $this->fieldEditType = 0;

      // Get jform control type
      if($this->fieldEditType == 15){
        $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'][(int)$this->edittype[0]->attributes()->allowMulti];
      }
      else if($this->fieldEditType === 'ValueRelation'){
        $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'][(int)$this->edittype[0]->widgetv2config->attributes()->AllowMulti];
      }
      else if($this->fieldEditType === 'DateTime'){
        $markup = 'date';
        $display_format = $this->edittype[0]->widgetv2config->attributes()->display_format;
        // Use date AND time widget id type is DateTime and we find HH
        if( preg_match('#HH#i', $display_format) ){
          $markup = 'datetime';
        }
        // Use only time if field is only time
        if( preg_match('#HH#i', $display_format) and !preg_match('#YY#i', $display_format)){
          $markup = 'time';
        }

      }
      else{
        $markup = $this->qgisEdittypeMap[$this->fieldEditType]['jform']['markup'];
      }
    }else{
      $markup='hidden';
    }

    // Create the control
    switch($markup){
      case 'input':
        $this->ctrl = new jFormsControlInput($this->ref);
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
        $choice->createItem('keep','keep');
        $choice->createItem('update','update');
        $upload = new jFormsControlUpload($this->ref);
        if( $this->fieldEditType == 'Photo' ) {
          $upload->mimetype = array('image/jpg','image/jpeg','image/pjpeg','image/png','image/gif');
          $upload->accept = 'image/*';
          $upload->capture = 'camera';
        }
        $choice->addChildControl($upload, 'update');
        $choice->createItem('delete','delete');
        $choice->defaultValue = 'keep';
        $this->ctrl = $choice;
        break;

      default:
        $this->ctrl = new jFormsControlInput($this->ref);
        break;
    }

    // Set control main properties
    $this->setControlMainProperties();

  }



  /*
  * Create an jForms control object based on a qgis edit widget.
  * @return object Jforms control object
  */
  public function setControlMainProperties(){

    // Label
    if($this->fieldAlias)
      $this->ctrl->label = $this->fieldAlias;
    else
      $this->ctrl->label = $this->fieldName;

    // Data type
    if(property_exists($this->ctrl, 'datatype')){

      switch($this->fieldDataType){

        case 'text':
          $datatype = new jDatatypeString();
          break;

        case 'integer':
          $datatype = new jDatatypeInteger();
          break;

        case 'float':
          $datatype = new jDatatypeDecimal();
          break;

        case 'date':
          $datatype = new jDatatypeDate();
          break;

        case 'datetime':
          $datatype = new jDatatypeDateTime();
          break;

        case 'time':
          $datatype = new jDatatypeTime();
          break;

        default:
          $datatype = new jDatatypeString();
      }
      $this->ctrl->datatype = $datatype;
    }

    // Read-only
    if($this->fieldDataType != 'geometry'){
      if( array_key_exists('readonly', $this->qgisEdittypeMap[$this->fieldEditType]['jform'] ) ){
        $this->isReadOnly = True;
      }
      // Also use "editable" property
      if( $this->edittype and property_exists($this->edittype[0]->attributes(), 'editable') ) {
        $editable = (integer)$this->edittype[0]->attributes()->editable;
        if ( $editable == 0 ) {
          $this->isReadOnly = True;
        }
      }
      // Also use "fieldEditable" property
      else if( $this->edittype and property_exists($this->edittype[0]->attributes(), 'widgetv2type')
       and property_exists($this->edittype[0]->widgetv2config->attributes(), 'fieldEditable') ) {
        $editable = (integer)$this->edittype[0]->widgetv2config->attributes()->fieldEditable;
        if ( $editable == 0 ) {
          $this->isReadOnly = True;
        }
      }
    }

    // Required
    if( $this->required )
      $this->ctrl->required = True;

  }


  /*
  * Define checked and unchecked values for a jForms control checkbox, based on Qgis edittype
  * @return object Modified jForms control.
  */
  public function fillCheckboxValues(){
    $checked = null;
    $unchecked = null;
    if ( $this->fieldEditType == 'CheckBox'){
      $checked = (string)$this->edittype[0]->widgetv2config->attributes()->CheckedState;
      $unchecked = (string)$this->edittype[0]->widgetv2config->attributes()->UncheckedState;
    } else {
      $checked = (string)$this->edittype[0]->attributes()->checked;
      $unchecked = (string)$this->edittype[0]->attributes()->unchecked;
    }
    $this->ctrl->valueOnCheck = $checked;
    $this->ctrl->valueOnUncheck = $unchecked;
    $this->required = False; // As there is only a value, even if the checkbox is unchecked
  }

  /*
  * Create and populate a datasource for a jForms control based on Qgis edittype
  * @return object Modified jForms control.
  */
  public function fillControlDatasource(){

    // Create a datasource for some types : menulist
    $dataSource = new jFormsStaticDatasource();

    // Create an array of data specific for the qgis edittype
    $data = array();

    // Add default empty value for required fields
    // Jelix does not do it, but we think it is better this way to avoid unwanted set values
    if( $this->required )
      $data[''] = '';

    switch($this->fieldEditType){

      // Enumeration
      case -1:
      case 'Enumeration':
        $data[0] = '--qgis edit type not supported yet--';
        break;

      // Value map
      case 3:
        foreach($this->edittype[0]->xpath('valuepair') as $valuepair){
          $k = (string)$valuepair->attributes()->key;
          $v = (string)$valuepair->attributes()->value;
          $data[$v] = $k;
        }
        break;
      case 'ValueMap':
        foreach($this->edittype[0]->widgetv2config->xpath('value') as $value){
          $k = (string)$value->attributes()->key;
          $v = (string)$value->attributes()->value;
          $data[$v] = $k;
        }
        break;

      // Classification
      case 4:
      case 'Classification':
        foreach($this->rendererCategories as $category){
          $k = (string)$category->attributes()->label;
          $v = (string)$category->attributes()->value;
          $data[$v] = $k;
        }

        break;

      // Range
      case 5:
        // Get range of data
        if($this->fieldDataType == 'float'){
          $min = (float)$this->edittype[0]->attributes()->min;
          $max = (float)$this->edittype[0]->attributes()->max;
          $step = (float)$this->edittype[0]->attributes()->step;
        }else{
          $min = (integer)$this->edittype[0]->attributes()->min;
          $max = (integer)$this->edittype[0]->attributes()->max;
          $step = (integer)$this->edittype[0]->attributes()->step;
        }
        $data[(string)$min] = $min;
        for($i = $min; $i <= $max; $i+=$step){
          $data[(string)$i] = $i;
        }
        $data[(string)$max] = $max;
        break;

      case 'EditRange':
      case 'SliderRange':
      case 'DialRange':
        // Get range of data
        if($this->fieldDataType == 'float'){
          $min = (float)$this->edittype[0]->widgetv2config->attributes()->Min;
          $max = (float)$this->edittype[0]->widgetv2config->attributes()->Max;
          $step = (float)$this->edittype[0]->widgetv2config->attributes()->Step;
        }else{
          $min = (integer)$this->edittype[0]->widgetv2config->attributes()->Min;
          $max = (integer)$this->edittype[0]->widgetv2config->attributes()->Max;
          $step = (integer)$this->edittype[0]->widgetv2config->attributes()->Step;
        }
        $data[(string)$min] = $min;
        for($i = $min; $i <= $max; $i+=$step){
          $data[(string)$i] = $i;
        }
        $data[(string)$max] = $max;
        break;


      // Value relation
      case 15:
        $allowNull = (string)$this->edittype[0]->attributes()->allowNull;
        $orderByValue = (string)$this->edittype[0]->attributes()->orderByValue;
        $layer = (string)$this->edittype[0]->attributes()->layer;
        $key = (string)$this->edittype[0]->attributes()->key;
        $value = (string)$this->edittype[0]->attributes()->value;
        $allowMulti = (string)$this->edittype[0]->attributes()->allowMulti;
        $filterExpression = (string)$this->edittype[0]->attributes()->filterExpression;
        $this->valueRelationData = array(
          "allowNull" => $allowNull,
          "orderByValue" => $orderByValue,
          "layer" => $layer,
          "key" => $key,
          "value" => $value,
          "allowMulti" => $allowMulti,
          "filterExpression" => $filterExpression
        );
        break;

      case 'ValueRelation':
        $allowNull = (string)$this->edittype[0]->widgetv2config->attributes()->AllowNull;
        $orderByValue = (string)$this->edittype[0]->widgetv2config->attributes()->OrderByValue;
        $layer = (string)$this->edittype[0]->widgetv2config->attributes()->Layer;
        $key = (string)$this->edittype[0]->widgetv2config->attributes()->Key;
        $value = (string)$this->edittype[0]->widgetv2config->attributes()->Value;
        $allowMulti = (string)$this->edittype[0]->widgetv2config->attributes()->AllowMulti;
        $filterExpression = (string)$this->edittype[0]->widgetv2config->attributes()->FilterExpression;
        $this->valueRelationData = array(
          "allowNull" => $allowNull,
          "orderByValue" => $orderByValue,
          "layer" => $layer,
          "key" => $key,
          "value" => $value,
          "allowMulti" => $allowMulti,
          "filterExpression" => $filterExpression
        );

        break;

    }

    asort($data);
    $dataSource->data = $data;
    $this->ctrl->datasource = $dataSource;
  }

}
