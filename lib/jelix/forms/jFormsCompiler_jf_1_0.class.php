<?php
/**
* @package    jelix
* @subpackage forms
* @author     Laurent Jouanneau
* @contributor Loic Mathaud, Dominique Papin, Julien Issler
* @contributor Uriel Corfa (Emotic SARL), Thomas
* @copyright   2006-2012 Laurent Jouanneau
* @copyright   2007 Loic Mathaud, 2007 Dominique Papin
* @copyright   2007 Emotic SARL
* @copyright   2008 Julien Issler, 2009 Thomas
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * generates form class from an xml file describing the form
 * @package     jelix
 * @subpackage  forms
 */
class jFormsCompiler_jf_1_0  {

    const NS = 'http://jelix.org/ns/forms/1.0';

    protected $sourceFile;

    public function __construct($sourceFile) {
        $this->sourceFile = $sourceFile;
    }

    public function compile ($doc, &$source) {

        $xml = simplexml_import_dom($doc);

        if (count($xml->reset) > 1 )
            throw new jException('jelix~formserr.notunique.tag',array('reset',$this->sourceFile));

        foreach ($xml->children() as $controltype=>$control) {
            $source[] = $this->generatePHPControl($controltype, $control);
        }
        
        $this->_compile($xml, $source);
    }
    
    protected function _compile ($xml, &$source) {
        // nothing for the moment, can be overrided
    }

    protected function generatePHPControl($controltype, $control){
        $source = array();
        $twocontrols = $this->_generatePHPControl($source, $controltype, $control);

        $source[]='$this->addControl($ctrl);';
        if ($twocontrols)
            $source[]='$this->addControl($ctrl2);';
        return implode("\n", $source);
    }

    protected function _generatePHPControl(&$source, $controltype, $control){
        $class = 'jFormsControl'.$controltype;

        $attributes = array();
        foreach ($control->attributes() as $name=>$value){
            $attributes[$name]=(string)$value;
        }

        $method = 'generate'.$controltype;
        if(!class_exists($class,false) || !method_exists($this, $method)){
            throw new jException('jelix~formserr.unknown.tag',array($controltype,$this->sourceFile));
        }

        if(!isset($attributes['ref']) || $attributes['ref'] == ''){
            throw new jException('jelix~formserr.attribute.missing',array('ref',$controltype,$this->sourceFile));
        }

        // instancie the class
        $source[]='$ctrl= new '.$class.'(\''.$attributes['ref'].'\');';
        unset($attributes['ref']);

        $twocontrols = $this->$method($source, $control, $attributes);

        if(count($attributes)) {
            reset($attributes);
            throw new jException('jelix~formserr.attribute.not.allowed',array(key($attributes),$controltype,$this->sourceFile));
        }
        return $twocontrols;
    }

    protected $allowedType = array('string','boolean','decimal','integer','hexadecimal',
                                      'datetime','date','time','localedatetime','localedate','localetime',
                                      'url','email','ipv4','ipv6');

    protected function generateInput(&$source, $control, &$attributes) {
        $type = $this->attrType($source, $attributes);
        $this->attrRequired($source, $attributes);
        $this->attrDefaultvalue($source, $attributes);

        if(isset($attributes['minlength'])){
            if($type != 'string' && $type != 'html'  && $type != 'xhtml'){
                throw new jException('jelix~formserr.attribute.not.allowed',array('minlength','input',$this->sourceFile));
            }
            $source[]='$ctrl->datatype->addFacet(\'minLength\','.intval($attributes['minlength']).');';
            unset($attributes['minlength']);
        }
        if(isset($attributes['maxlength'])){
            if($type != 'string' && $type != 'html' && $type != 'xhtml'){
                throw new jException('jelix~formserr.attribute.not.allowed',array('maxlength','input',$this->sourceFile));
            }
            $source[]='$ctrl->datatype->addFacet(\'maxLength\','.intval($attributes['maxlength']).');';
            unset($attributes['maxlength']);
        }
        if(isset($attributes['minvalue'])){
            if($type != 'integer' && $type != 'decimal' && $type != 'html'  && $type != 'xhtml'){
                throw new jException('jelix~formserr.attribute.not.allowed',array('minvalue','input',$this->sourceFile));
            }
            // Make sure we don't alter the value if decimal
            if($type != 'decimal') {
                $source[]='$ctrl->datatype->addFacet(\'minValue\','.intval($attributes['minvalue']).');';
            } else {
                $source[]='$ctrl->datatype->addFacet(\'minValue\','.$attributes['minvalue'].');';
            }
            unset($attributes['minvalue']);
        }
        if(isset($attributes['maxvalue'])){
            if($type != 'integer' && $type != 'decimal' && $type != 'html' && $type != 'xhtml'){
                throw new jException('jelix~formserr.attribute.not.allowed',array('maxvalue','input',$this->sourceFile));
            }
            // Make sure we don't alter the value if decimal
            if($type != 'decimal') {
                $source[]='$ctrl->datatype->addFacet(\'maxValue\','.intval($attributes['maxvalue']).');';
            } else {
                $source[]='$ctrl->datatype->addFacet(\'maxValue\','.$attributes['maxvalue'].');';
            }
            unset($attributes['maxvalue']);
        }
        $this->readLabel($source, $control, 'input');
        $this->readEmptyValueLabel($source, $control);
        $this->readHelpHintAlert($source, $control);
        $this->attrSize($source, $attributes);
        $this->attrReadOnly($source, $attributes);
        return false;
    }

    protected function generateTextarea(&$source, $control, &$attributes) {

        $this->attrRequired($source, $attributes);
        $this->attrDefaultvalue($source, $attributes);
        $this->attrReadOnly($source, $attributes);

        if(isset($attributes['minlength'])){
            $source[]='$ctrl->datatype->addFacet(\'minLength\','.intval($attributes['minlength']).');';
            unset($attributes['minlength']);
        }
        if(isset($attributes['maxlength'])){
            $source[]='$ctrl->datatype->addFacet(\'maxLength\','.intval($attributes['maxlength']).');';
            unset($attributes['maxlength']);
        }
        $this->readLabel($source, $control, 'textarea');
        $this->readEmptyValueLabel($source, $control);
        $this->readHelpHintAlert($source, $control);
        if (isset($attributes['rows'])) {
            $rows = intval($attributes['rows']);
            if($rows < 2) $rows = 2;
            $source[]='$ctrl->rows='.$rows.';';
            unset($attributes['rows']);
        }

        if (isset($attributes['cols'])) {
            $cols = intval($attributes['cols']);
            if($cols < 2) $cols = 2;
            $source[]='$ctrl->cols='.$cols.';';
            unset($attributes['cols']);
        }
        return false;
    }

    protected function generateOutput(&$source, $control, &$attributes) {
        $this->attrType($source, $attributes);
        $this->attrDefaultvalue($source, $attributes);
        $this->readLabel($source, $control, 'output');
        $this->readEmptyValueLabel($source, $control);
        //$this->readHelpHintAlert($source, $control);
        return false;
    }

    protected function generateSubmit(&$source, $control, &$attributes) {
        $this->readLabel($source, $control, 'submit');
        $this->readHelpHintAlert($source, $control);
        $this->readDatasource($source, $control, 'submit', $attributes);
        return false;
    }

    protected function generateReset(&$source, $control, &$attributes) {
        $this->readLabel($source, $control, 'reset');
        $this->readHelpHintAlert($source, $control);
        return false;
    }

    protected function generateCheckbox(&$source, $control, &$attributes) {
        $this->attrDefaultvalue($source, $attributes);
        $this->readLabel($source, $control, 'checkbox');
        $this->readHelpHintAlert($source, $control);
        $this->attrReadOnly($source, $attributes);
        if(isset($attributes['valueoncheck'])){
            $source[]='$ctrl->valueOnCheck=\''.str_replace("'","\\'", $attributes['valueoncheck']) ."';";
            unset($attributes['valueoncheck']);
        }
        if(isset($attributes['valueonuncheck'])){
            $source[]='$ctrl->valueOnUncheck=\''.str_replace("'","\\'", $attributes['valueonuncheck']) ."';";
            unset($attributes['valueonuncheck']);
        }
        $this->attrRequired($source, $attributes);
        return false;
    }

    protected function generateCheckboxes(&$source, $control, &$attributes) {
        $this->attrRequired($source, $attributes);
        $this->readLabel($source, $control, 'checkboxes');
        $this->readEmptyValueLabel($source, $control);
        $this->readHelpHintAlert($source, $control);
        $this->attrReadOnly($source, $attributes);
        $hasSelectedValues = $this->readSelectedValue($source, $control, 'checkboxes', $attributes);
        $this->readDatasource($source, $control, 'checkboxes', $attributes, $hasSelectedValues);
        return false;
    }

    protected function generateRadiobuttons(&$source, $control, &$attributes) {
        $this->attrRequired($source, $attributes);
        $this->readLabel($source, $control, 'radiobuttons');
        $this->readEmptyValueLabel($source, $control);
        $this->readHelpHintAlert($source, $control);
        $this->attrReadOnly($source, $attributes);
        $hasSelectedValues = $this->readSelectedValue($source, $control, 'radiobuttons', $attributes);
        $this->readDatasource($source, $control, 'radiobuttons', $attributes, $hasSelectedValues);
        return false;
    }

    protected function generateMenulist(&$source, $control, &$attributes) {
        $this->attrRequired($source, $attributes);
        $this->readLabel($source, $control, 'menulist');
        $this->readEmptyValueLabel($source, $control);
        $this->readHelpHintAlert($source, $control);
        $this->attrReadOnly($source, $attributes);
        $hasSelectedValues = $this->readSelectedValue($source, $control, 'menulist', $attributes);
        $this->readDatasource($source, $control, 'menulist', $attributes, $hasSelectedValues);
        return false;
    }

    protected function generateListbox(&$source, $control, &$attributes) {
        $this->attrRequired($source, $attributes);
        $this->readLabel($source, $control, 'listbox');
        $this->readEmptyValueLabel($source, $control);
        $this->readHelpHintAlert($source, $control);
        $this->attrReadOnly($source, $attributes);
        $this->attrSize($source, $attributes);
        $hasSelectedValues = $this->readSelectedValue($source, $control, 'listbox', $attributes);
        $this->readDatasource($source, $control, 'listbox', $attributes, $hasSelectedValues);
        if(isset($attributes['multiple'])){
            if('true' == $attributes['multiple'])
                $source[]='$ctrl->multiple=true;';
            unset($attributes['multiple']);
        }
        if(isset($control->emptyitem)) {
            if(isset($control->emptyitem['locale'])){
                $labellocale=(string)$control->emptyitem['locale'];
                $source[]='$ctrl->emptyItemLabel=jLocale::get(\''.$labellocale.'\');';
            }else{
                $label= (string)$control->emptyitem;
                $source[]='$ctrl->emptyItemLabel=\''.str_replace("'","\\'",$label).'\';';
            }
        }
        return false;
    }

    protected function generateSecret(&$source, $control, &$attributes) {
        $this->attrRequired($source, $attributes);
        $this->readLabel($source, $control, 'secret');
        $this->readEmptyValueLabel($source, $control);
        list($alertInvalid, $alertRequired)=$this->readHelpHintAlert($source, $control);
        $this->attrSize($source, $attributes);
        $hasRo = (isset($attributes['readonly']) && 'true' == $attributes['readonly']);
        $this->attrReadOnly($source, $attributes);

        if(isset($control->confirm)) {
            if(isset($control->confirm['locale'])){
                $label = "jLocale::get('".(string)$control->confirm['locale']."');";
            }elseif( "" != (string)$control->confirm) {
                $label = "'".str_replace("'","\\'",(string)$control->confirm)."';";
            }else{
                throw new jException('jelix~formserr.content.missing',array('confirm',$this->sourceFile));
            }
            $source[]='$ctrl2 = new jFormsControlSecretConfirm(\''.(string)$control['ref'].'_confirm\');';
            $source[]='$ctrl2->primarySecret = \''.(string)$control['ref'].'\';';
            $source[]='$ctrl2->label='.$label;
            $source[]='$ctrl2->required = $ctrl->required;';
            if($alertInvalid!='')
                $source[]='$ctrl2->alertInvalid = $ctrl->alertInvalid;';
            if($alertRequired!='')
                $source[]='$ctrl2->alertRequired = $ctrl->alertRequired;';

            if(isset($control->help)){
                $source[]='$ctrl2->help=$ctrl->help;';
            }
            if(isset($control->hint)){
                $source[]='$ctrl2->hint=$ctrl->hint;';
            }
            if (isset($control['size'])) {
                $source[]='$ctrl2->size=$ctrl->size;';
            }

            if($hasRo)
                $source[]='$ctrl2->initialReadOnly = true;';
            return true;
        }
        return false;
    }

    protected function generateUpload(&$source, $control, &$attributes) {
        $this->attrRequired($source, $attributes);
        $this->readLabel($source, $control, 'input');
        $this->readEmptyValueLabel($source, $control);
        $this->readHelpHintAlert($source, $control);
        $this->attrReadOnly($source, $attributes);

        if(isset($attributes['maxsize'])){
            $source[]='$ctrl->maxsize='.intval($attributes['maxsize']).';';
            unset($attributes['maxsize']);
        }

        if(isset($attributes['mimetype'])){
            $mime = preg_split('/[,; ]/',$attributes['mimetype']);
            $mime = array_diff($mime, array('')); // we remove all ''
            $source[]='$ctrl->mimetype='.var_export($mime,true).';';
            unset($attributes['mimetype']);
        }
        return false;
    }

    protected function attrReadOnly(&$source, &$attributes) {
        if(isset($attributes['readonly'])){
            if('true' == $attributes['readonly'])
                $source[]='$ctrl->initialReadOnly=true;';
            unset($attributes['readonly']);
        }
    }

    protected function attrRequired(&$source, &$attributes) {
        if(isset($attributes['required'])){
            if('true' == $attributes['required'])
                $source[]='$ctrl->required=true;';
            unset($attributes['required']);
        }
    }

    protected function attrDefaultvalue(&$source, &$attributes) {
        if(isset($attributes['defaultvalue'])){
            $source[]='$ctrl->defaultValue=\''.str_replace('\'','\\\'',$attributes['defaultvalue']).'\';';
            unset($attributes['defaultvalue']);
        }
    }

    protected function attrSize(&$source, &$attributes) {
        if(isset($attributes['size'])){
            $size = intval($attributes['size']);
            if($size < 2) $size = 2;
            $source[]='$ctrl->size='.$size.';';
            unset($attributes['size']);
        }
    }

    protected function attrType(&$source, &$attributes) {
        $type = 'string';
        if(isset($attributes['type'])){
            $type = strtolower($attributes['type']);
            if(!in_array($type, $this->allowedType)){
                throw new jException('jelix~formserr.datatype.unknown',array($type,'input',$this->sourceFile));
            }
            
            if($type == 'xhtml')
                $source[]='$ctrl->datatype= new jDatatypeHtml(true);';
            else if($type != 'string')
                $source[]='$ctrl->datatype= new jDatatype'.$type.'();';
            unset($attributes['type']);
        }
        return $type;
    }

    protected function readLabel(&$source, $control, $controltype) {
        if(!isset($control->label)){
            throw new jException('jelix~formserr.tag.missing',array('label',$controltype,$this->sourceFile));
        }
        if(isset($control->label['locale'])){
            $labellocale=(string)$control->label['locale'];
            $source[]='$ctrl->label=jLocale::get(\''.$labellocale.'\');';
        }else{
            $label=(string)$control->label;
            $source[]='$ctrl->label=\''.str_replace("'","\\'",$label).'\';';
        }
    }

    protected function readEmptyValueLabel(&$source, $control) {
        if (!isset($control->emptyvaluelabel)){
            return;
        }
        if(isset($control->emptyvaluelabel['locale'])){
            $labellocale=(string)$control->emptyvaluelabel['locale'];
            $source[]='$ctrl->emptyValueLabel=jLocale::get(\''.$labellocale.'\');';
        }else{
            $label=(string)$control->emptyvaluelabel;
            $source[]='$ctrl->emptyValueLabel=\''.str_replace("'","\\'",$label).'\';';
        }
    }

    protected function readHelpHintAlert(&$source, $control) {
        if(isset($control->help)){ // help value is readed in the html compiler
            if(isset($control->help['locale'])){
                $source[]='$ctrl->help=jLocale::get(\''.(string)$control->help['locale'].'\');';
            }else{
                $source[]='$ctrl->help=\''.str_replace("'","\\'",(string)$control->help).'\';';
            }
        }
        if(isset($control->hint)){
            if(isset($control->hint['locale'])){
                $source[]='$ctrl->hint=jLocale::get(\''.(string)$control->hint['locale'].'\');';
            }else{
                $source[]='$ctrl->hint=\''.str_replace("'","\\'",(string)$control->hint).'\';';
            }
        }
        $alertInvalid='';
        $alertRequired='';
        if(isset($control->alert)){
            foreach($control->alert as $alert){
                if(isset($alert['locale'])){
                    $msg='jLocale::get(\''.(string)$alert['locale'].'\');';
                }else{
                    $msg='\''.str_replace("'","\\'",(string)$alert).'\';';
                }

                if(isset($alert['type'])){
                    if((string)$alert['type'] == 'required')
                        $alertRequired = '$ctrl->alertRequired='.$msg;
                    else
                        $alertInvalid = '$ctrl->alertInvalid='.$msg;
                } else {
                    $alertInvalid = '$ctrl->alertInvalid='.$msg;
                }
            }
            if($alertRequired !='') $source[]=$alertRequired;
            if($alertInvalid !='') $source[]=$alertInvalid;
        }
        return array($alertInvalid, $alertRequired);
    }

    protected function readSelectedValue(&$source, $control, $controltype, &$attributes) {
        // support of static data or daos
        if(isset($attributes['selectedvalue']) && isset($control->selectedvalues)){
            throw new jException('jelix~formserr.attribute.not.allowed',array('selectedvalue',$controltype,$this->sourceFile));
        }
        $hasSelectedValues = false;
        if(isset($control->selectedvalues) && isset($control->selectedvalues->value)){
            if( ($controltype == 'listbox' && isset($control['multiple']) && 'true' != (string)$control['multiple'])
                || $controltype == 'radiobuttons' || $controltype == 'menulist'
                ){
                throw new jException('jelix~formserr.defaultvalues.not.allowed',$this->sourceFile);
            }
            $str =' array(';
            foreach($control->selectedvalues->value as $value){
                $str.="'". str_replace("'","\\'", (string)$value) ."',";
            }
            $source[]='$ctrl->defaultValue='.$str.');';
            $hasSelectedValues = true;
        }elseif(isset($attributes['selectedvalue'])){
            if ($controltype == 'menulist' ||  $controltype == 'radiobuttons') {
                $source[]='$ctrl->defaultValue=\''. str_replace("'","\\'", (string)$control['selectedvalue']) .'\';';
            } else {
                $source[]='$ctrl->defaultValue=array(\''. str_replace("'","\\'", (string)$control['selectedvalue']) .'\');';
            }
            $hasSelectedValues = true;
            unset($attributes['selectedvalue']);
        }
        return $hasSelectedValues;
    }

    protected function readDatasource(&$source, $control, $controltype, &$attributes, $hasSelectedValues=false) {

        if(isset($attributes['dao'])){
            if(isset($attributes['daovalueproperty'])) {
                $daovalue = $attributes['daovalueproperty'];
                unset($attributes['daovalueproperty']);
            } else
                $daovalue = '';
            $source[]='$ctrl->datasource = new jFormsDaoDatasource(\''.$attributes['dao'].'\',\''.
                            $attributes['daomethod'].'\',\''.$attributes['daolabelproperty'].'\',\''.$daovalue.'\');';
            unset($attributes['dao']);
            unset($attributes['daomethod']);
            unset($attributes['daolabelproperty']);
            if($controltype == 'submit'){
                $source[]='$ctrl->standalone=false;';
            }
        }elseif(isset($attributes['dsclass'])){ // read deprecated dsclass attribute
            $dsclass = $attributes['dsclass'];
            unset($attributes['dsclass']);
            $class = new jSelectorClass($dsclass);
            $source[]='jClasses::inc(\''.$dsclass.'\');';
            $source[]='$datasource = new '.$class->className.'($this->id());';
            $source[]='if ($datasource instanceof jIFormsDatasource){$ctrl->datasource=$datasource;}';
            $source[]='else{$ctrl->datasource=new jFormsStaticDatasource();}';
            if($controltype == 'submit'){
                $source[]='$ctrl->standalone=false;';
            }
        }elseif(isset($control->item)){
            // get all <items> and their label|labellocale attributes + their values
            if($controltype == 'submit'){
                $source[]='$ctrl->standalone=false;';
            }
            $source[]='$ctrl->datasource= new jFormsStaticDatasource();';
            $source[]='$ctrl->datasource->data = array(';
            $selectedvalues=array();
            foreach($control->item as $item){
                $value ="'".str_replace("'","\\'",(string)$item['value'])."'=>";
                if(isset($item['locale'])){
                    $source[] = $value."jLocale::get('".(string)$item['locale']."'),";
                }elseif( "" != (string)$item){
                    $source[] = $value."'".str_replace("'","\\'",(string)$item)."',";
                }else{
                    $source[] = $value."'".str_replace("'","\\'",(string)$item['value'])."',";
                }

                if(isset($item['selected'])){
                    if($hasSelectedValues || $controltype == 'submit'){
                        throw new jException('jelix~formserr.selected.attribute.not.allowed',$this->sourceFile);
                    }
                    if((string)$item['selected']== 'true'){
                        $selectedvalues[]=(string)$item['value'];
                    }
                }
            }
            $source[]=");";
            if(count($selectedvalues)){
                if(count($selectedvalues)>1 &&
                        (($controltype == 'listbox' && isset($control['multiple']) && 'true' != (string)$control['multiple'])
                        || $controltype == 'radiobuttons' || $controltype == 'menulist')  ){
                    throw new jException('jelix~formserr.multiple.selected.not.allowed',$this->sourceFile);
                }
                $source[]='$ctrl->defaultValue='.var_export($selectedvalues,true).';';
            }
        }else{
            $source[]='$ctrl->datasource= new jFormsStaticDatasource();';
        }
    }
}
