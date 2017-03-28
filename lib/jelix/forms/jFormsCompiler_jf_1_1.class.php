<?php
/**
* @package    jelix
* @subpackage forms
* @author     Laurent Jouanneau
* @contributor Loic Mathaud, Dominique Papin, Julien Issler
* @contributor Uriel Corfa (Emotic SARL), Thomas, Olivier Demah
* @copyright   2006-2012 Laurent Jouanneau
* @copyright   2007 Loic Mathaud, 2007-2008 Dominique Papin
* @copyright   2007 Emotic SARL
* @copyright   2008-2015 Julien Issler, 2009 Thomas, 2009 Olivier Demah
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/
require_once(JELIX_LIB_PATH.'forms/jFormsCompiler_jf_1_0.class.php');
/**
 * generates form class from an xml file describing the form
 * @package     jelix
 * @subpackage  forms
 */
class jFormsCompiler_jf_1_1 extends jFormsCompiler_jf_1_0 {

    const NS = 'http://jelix.org/ns/forms/1.1';

    protected $allowedType = array('string','boolean','decimal','integer','hexadecimal',
                                      'datetime','date','time','localetimeshort','localedatetime','localedate','localetime',
                                      'url','email','ipv4','ipv6','html','xhtml');

    protected function _compile ($xml, &$source) {
        if(isset($xml['allowAnyOrigin']) && $xml['allowAnyOrigin'] == 'true') {
            $source[]='$this->securityLevel=0;';
        }
    }

    protected function generateInput(&$source, $control, &$attributes) {
        if(isset($attributes['pattern'])){
            if(isset($attributes['type']) && $attributes['type'] != 'string'){
                throw new jException('jelix~formserr.attribute.not.allowed',array('pattern','input',$this->sourceFile));
            }
            $source[]='$ctrl->datatype->addFacet(\'pattern\',\''.str_replace("'","\\'", $attributes['pattern']).'\');';
            unset($attributes['pattern']);
        }
        return parent::generateInput($source, $control, $attributes);
    }

    protected function generateCheckbox(&$source, $control, &$attributes) {
        $ret = parent::generateCheckbox($source, $control, $attributes);
        $this->readOnCheckValue($source, $control);
        return $ret;
    }

    protected function readOnCheckValue(&$source, $control) {
        if(isset($control->oncheckvalue)){
            $check = $control->oncheckvalue;
            if(isset($check['locale'])) {
                $source[]='$ctrl->valueLabelOnCheck=jLocale::get(\''.$check['locale'].'\');';
            }elseif (isset($check['label'])) {
                $source[]='$ctrl->valueLabelOnCheck=\''.str_replace("'","\\'",(string)$check['label']).'\';';
            }
            if(isset($check['value'])){
                $source[]='$ctrl->valueOnCheck=\''.str_replace("'","\\'", $check['value']) ."';";
            }
        }
        if(isset($control->onuncheckvalue)){
            $check = $control->onuncheckvalue;
            if(isset($check['locale'])) {
                $source[]='$ctrl->valueLabelOnUncheck=jLocale::get(\''.$check['locale'].'\');';
            }elseif (isset($check['label'])) {
                $source[]='$ctrl->valueLabelOnUncheck=\''.str_replace("'","\\'",(string)$check['label']).'\';';
            }
            if(isset($check['value'])){
                $source[]='$ctrl->valueOnUncheck=\''.str_replace("'","\\'", $check['value']) ."';";
            }
        }
    }

    protected function generateMenulist(&$source, $control, &$attributes) {
        parent::generateMenulist($source, $control, $attributes);
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

    protected function generateDate(&$source, $control, &$attributes) {
        $this->attrDefaultvalue($source, $attributes);
        $this->attrReadOnly($source, $attributes);
        $this->attrRequired($source, $attributes);
        $this->readLabel($source, $control, 'date');
        $this->readEmptyValueLabel($source, $control);
        $this->readHelpHintAlert($source, $control);
        if(isset($attributes['mindate'])){
            $source[]='$ctrl->datatype->addFacet(\'minValue\',\''.$attributes['mindate'].'\');';
            unset($attributes['mindate']);
        }
        if(isset($attributes['maxdate'])){
            $source[]='$ctrl->datatype->addFacet(\'maxValue\',\''.$attributes['maxdate'].'\');';
            unset($attributes['maxdate']);
        }
        if(isset($attributes['datepicker'])){
            $source[]='$ctrl->datepickerConfig = \''.$attributes['datepicker'].'\';';
            unset($attributes['datepicker']);
        }
        return false;
    }

    protected function generateDatetime(&$source, $control, &$attributes) {
        $this->attrDefaultvalue($source, $attributes);
        $this->attrReadOnly($source, $attributes);
        $this->attrRequired($source, $attributes);
        $this->readLabel($source, $control, 'datetime');
        $this->readEmptyValueLabel($source, $control);
        $this->readHelpHintAlert($source, $control);
        if(isset($attributes['mindate'])){
            $source[]='$ctrl->datatype->addFacet(\'minValue\',\''.$attributes['mindate'].'\');';
            unset($attributes['mindate']);
        }
        if(isset($attributes['maxdate'])){
            $source[]='$ctrl->datatype->addFacet(\'maxValue\',\''.$attributes['maxdate'].'\');';
            unset($attributes['maxdate']);
        }
        if(isset($attributes['seconds'])){
            if($attributes['seconds'] == "true")
                $source[]='$ctrl->enableSeconds = true;';
            unset($attributes['seconds']);
        }
        if(isset($attributes['datepicker'])){
            $source[]='$ctrl->datepickerConfig = \''.$attributes['datepicker'].'\';';
            unset($attributes['datepicker']);
        }
        return false;
    }

    protected function generateTextarea(&$source, $control, &$attributes) {
        if(isset($attributes['type'])){
            if ($attributes['type'] != 'html' && $attributes['type'] != 'xhtml') {
                throw new jException('jelix~formserr.datatype.unknown',
                                     array($attributes['type'], 'textarea', $this->sourceFile));
            }
            $source[] = '$ctrl->datatype= new jDatatypeHtml('.($attributes['type'] == 'xhtml'?'true':'').');';
            unset($attributes['type']);
        }
        return $this->_generateTextareaHtmlEditor($source, $control, $attributes);
    }

    protected function _generateTextareaHtmlEditor(&$source, $control, &$attributes) {
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

    protected function generateSecret(&$source, $control, &$attributes) {
        if(isset($attributes['minlength'])){
            $source[]='$ctrl->datatype->addFacet(\'minLength\','.intval($attributes['minlength']).');';
            unset($attributes['minlength']);
        }
        if(isset($attributes['maxlength'])){
            $source[]='$ctrl->datatype->addFacet(\'maxLength\','.intval($attributes['maxlength']).');';
            unset($attributes['maxlength']);
        }
        if(isset($attributes['pattern'])){
            $source[]='$ctrl->datatype->addFacet(\'pattern\',\''.str_replace("'","\\'", $attributes['pattern']).'\');';
            unset($attributes['pattern']);
        }
        return parent::generateSecret($source, $control, $attributes);
    }

    protected function generateHtmleditor(&$source, $control, &$attributes) {
        if (isset($attributes['xhtml'])) {
            $source[] = '$ctrl->datatype= new jDatatypeHtml('.($attributes['xhtml'] == 'true'?'true':'false').', true);';
            unset($attributes['xhtml']);
        }

        $this->_generateTextareaHtmlEditor($source, $control, $attributes);

        if (isset($attributes['config'])) {
            $source[]='$ctrl->config=\''.str_replace("'","\\'",$attributes['config']).'\';';
            unset($attributes['config']);
        }
        if (isset($attributes['skin'])) {
            $source[]='$ctrl->skin=\''.str_replace("'","\\'",$attributes['skin']).'\';';
            unset($attributes['skin']);
        }
        return false;
    }

    protected function generateWikieditor(&$source, $control, &$attributes) {
        $this->_generateTextareaHtmlEditor($source, $control, $attributes);

        if (isset($attributes['config'])) {
            $source[]='$ctrl->config=\''.str_replace("'","\\'",$attributes['config']).'\';';
            unset($attributes['config']);
        }
        return false;
    }

    protected function generateHidden(&$source, $control, &$attributes) {
        $this->attrDefaultvalue($source, $attributes);
        return false;
    }

    protected function generateCaptcha(&$source, $control, &$attributes) {
        $this->readLabel($source, $control, 'captcha');
        $this->readHelpHintAlert($source, $control);
        if (isset($attributes['validator'])) {
            $source[] = '$ctrl->setValidator(\'' . str_replace("'", "\\'", $attributes['validator']) . '\');';
        }
        return false;
    }

    protected function generateButton(&$source, $control, &$attributes) {
        $this->attrDefaultvalue($source, $attributes);
        $this->readLabel($source, $control, 'button');
        //$this->readHelpHintAlert($source, $control);
        return false;
    }

    protected function generateGroup(&$source, $control, &$attributes) {
        $this->readLabel($source, $control, 'group');
        $this->attrReadOnly($source, $attributes);
        $hasCheckbox = false;
        if(isset($attributes['withcheckbox'])){
            if('true' == $attributes['withcheckbox']) {
                $hasCheckbox = true;
                $source[]='$ctrl->hasCheckbox=true;';
            }
            unset($attributes['withcheckbox']);
        }
        if (!$hasCheckbox) {
            $tagtoIgnore = array('label');
            if(isset($control->oncheckvalue)) {
                throw new jException('jelix~formserr.control.not.allowed',array('oncheckvalue', 'group' , $this->sourceFile));
            }
            if(isset($control->onuncheckvalue)) {
                throw new jException('jelix~formserr.control.not.allowed',array('onuncheckvalue', 'group' , $this->sourceFile));
            }
        }
        else {
            $tagtoIgnore = array('label', 'oncheckvalue', 'onuncheckvalue');
            $this->readOnCheckValue($source, $control);
            $this->attrDefaultvalue($source, $attributes);
        }

        $source[]='$topctrl = $ctrl;';
        $this->readChildControls($source, 'group', $control, $tagtoIgnore);
        /*if ($ctrlcount == 0) {
             throw new jException('jelix~formserr.no.child.control',array('group',$this->sourceFile));
        }*/
        $source[]='$ctrl = $topctrl;';
        return false;
    }

    protected function generateChoice(&$source, $control, &$attributes) {
        $this->attrRequired($source, $attributes);
        $this->readLabel($source, $control, 'choice');
        $this->readEmptyValueLabel($source, $control);

        $this->attrReadOnly($source, $attributes);
        $this->readHelpHintAlert($source, $control);
        $source[]='$topctrl = $ctrl;';
        $hasSelected = false;
        $selectedvalue = null;

        if(isset($attributes['selectedvalue'])){
            $selectedvalue= (string)$control['selectedvalue'];
            $hasSelected = true;
            unset($attributes['selectedvalue']);
        }

        //$itemCount = 0;
        foreach($control->item as $item){
            if(!isset($item['value'])){
                throw new jException('jelix~formserr.attribute.missing',array('value','item of choice',$this->sourceFile));
            }
            $value = (string)$item['value'];

            if(isset($item['selected'])){
                if($hasSelected){
                    throw new jException('jelix~formserr.selected.attribute.not.allowed',$this->sourceFile);
                }
                if((string)$item['selected']== 'true'){
                    $hasSelected = true;
                    $selectedvalue=$value;
                }
            }
            if(!isset($item->label)){
                throw new jException('jelix~formserr.tag.missing',array('label','item of choice',$this->sourceFile));
            }

            if(isset($item->label['locale'])){
                $labellocale=(string)$item->label['locale'];
                $source[]='$topctrl->createItem(\''.str_replace("'","\\'",$value).'\', jLocale::get(\''.$labellocale.'\'));';
            }else{
                $label=(string)$item->label;
                $source[]='$topctrl->createItem(\''.str_replace("'","\\'",$value).'\', \''.str_replace("'","\\'",$label).'\');';
            }

            $this->readChildControls($source, 'choice', $item, array('label'), str_replace("'","\\'",$value));
        }

        $source[]='$topctrl->defaultValue=\''.str_replace('\'','\\\'',$selectedvalue).'\';';
        $source[]='$ctrl = $topctrl;';
        return false;
    }

    /**
     * @param array $source
     * @param string $controltype
     * @param SimpleXMLElement $xml
     * @param array $ignore
     * @param string $itemname
     * @return int
     * @throws jException
     */
    protected function readChildControls(&$source, $controltype, $xml, $ignore, $itemname='') {
        if($itemname != '')
            $itemname = ",'$itemname'";
        $ctrlcount = 0;

        foreach($xml->children() as $ctrltype=>$control){
            if(in_array($ctrltype, $ignore))
                continue;
            if(!in_array($ctrltype, array('input','textarea', 'output','checkbox','checkboxes','radiobuttons','button',
                        'menulist','listbox','secret', 'upload', 'hidden','htmleditor','date','datetime','wikieditor'))) {
                throw new jException('jelix~formserr.control.not.allowed',array($ctrltype, $controltype,$this->sourceFile));
            }
            $ctrlcount++;
            $src = array();
            $twocontrols = $this->_generatePHPControl($src, $ctrltype, $control);

            $src[]='$topctrl->addChildControl($ctrl'.$itemname.');';
            if ($twocontrols)
                $src[]='$topctrl->addChildControl($ctrl2'.$itemname.');';
            $source[]= implode("\n", $src);
        }
        return $ctrlcount;
    }

    protected function readDatasource(&$source, $control, $controltype, &$attributes, $hasSelectedValues=false) {

        if(isset($control->datasource)) {
            $attrs = array();
            foreach ($control->datasource->attributes() as $name=>$value){
                $attrs[$name]=(string)$value;
            }

            if(isset($attrs['dao'])) {
                if (isset($attrs['profile']))
                    $profile = ',\''.$attrs['profile'].'\'';
                else
                    $profile = ',\'\'';
                if (isset($attrs['valueproperty'])) {
                    $daovalue = $attrs['valueproperty'];
                } else
                    $daovalue = '';
                if(!isset($attrs['method']))
                    throw new jException('jelix~formserr.attribute.missing',array('method', 'datasource',$this->sourceFile));
                if(!isset($attrs['labelproperty']))
                    throw new jException('jelix~formserr.attribute.missing',array('labelproperty', 'datasource',$this->sourceFile));

                if(isset($attrs['criteria']))
                    $criteria=',\''.$attrs['criteria'].'\',null';
                elseif(isset($attrs['criteriafrom']))
                    $criteria=',null,\''.$attrs['criteriafrom'].'\'';
                else
                    $criteria=',null,null';
                if (isset($attrs['labelseparator']))
                    $labelSeparator = ',\''.$attrs['labelseparator'].'\'';
                else
                    $labelSeparator = '';

                $source[]='$ctrl->datasource = new jFormsDaoDatasource(\''.$attrs['dao'].'\',\''.
                                $attrs['method'].'\',\''.$attrs['labelproperty'].'\',\''.$daovalue.'\''.$profile.$criteria.$labelSeparator.');';
                if(isset($attrs['labelmethod'])) {
                    $source[]='$ctrl->datasource->labelMethod=\''.$attrs['labelmethod'].'\';';
                }

                if($controltype == 'submit'){
                    $source[]='$ctrl->standalone=false;';
                }
                if (isset($attrs['groupby']) && trim($attrs['groupby']) != '') {
                    $source[]='$ctrl->datasource->setGroupBy(\''.trim($attrs['groupby']).'\');';
                }
            }else if(isset($attrs['class'])) {
                $class = new jSelectorClass($attrs['class']);
                $source[]='jClasses::inc(\''.$attrs['class'].'\');';
                $source[]='$datasource = new '.$class->className.'($this->id());';
                $source[]='if ($datasource instanceof jIFormsDatasource){$ctrl->datasource=$datasource;';
                if (isset($attrs['criteriafrom'])) {
                    $source[] = 'if($datasource instanceof jIFormsDynamicDatasource) $datasource->setCriteriaControls(array(\''.join('\',\'',preg_split('/[\s,]+/',$attrs['criteriafrom'])).'\'));';
                }
                $source[]='}';
                $source[]='else{$ctrl->datasource=new jFormsStaticDatasource();}';
                if($controltype == 'submit'){
                    $source[]='$ctrl->standalone=false;';
                }
                if (isset($attrs['groupby']) && trim($attrs['groupby']) != '') {
                    $source[]='$ctrl->datasource->setGroupBy(\''.trim($attrs['groupby']).'\');';
                }
            } else {
                throw new jException('jelix~formserr.attribute.missing',array('class/dao', 'datasource',$this->sourceFile));
            }
        }else{
            // get all <items> and their label|labellocale attributes + their values
            $source[]='$ctrl->datasource= new jFormsStaticDatasource();';
            //$source[]='$ctrl->datasource->data = ';
            $nogroup = '';
            $groups = array();
            $selectedvalues = array();
            foreach($control->children() as $tag=>$elem){
                if($tag !='item' && $tag !='itemsgroup')
                    continue;
                if ($tag == 'item') {
                    $nogroup .= $this->readItem($elem, $hasSelectedValues, $controltype, $selectedvalues);
                }
                else {
                    $group = '$ctrl->datasource->data[';
                    if (isset($elem['locale'])) {
                       $group.="jLocale::get('".(string)$elem['locale']."')]=array(";
                    } elseif(isset($elem['label'])) {
                        $group.="'".str_replace("'","\\'",(string)$elem['label'])."']=array(";
                    } else {
                        throw new jException('jelix~formserr.attribute.missing',array('locale/label', 'itemsgroup',$this->sourceFile));
                    }
                    foreach($elem->item as $item) {
                        $group.=$this->readItem($item, $hasSelectedValues, $controltype, $selectedvalues);
                    }
                    $group .= ');';
                    $groups[] = $group;
                }
            }
            if (count($groups)) {
                $source[] = '$ctrl->datasource->data[\'\'] = array('.$nogroup.');';
                $source[] = implode("\n", $groups);
                $source[] = '$ctrl->datasource->setGroupBy(true);';
            }
            elseif ($nogroup) {
                $source[]='$ctrl->datasource->data = array('.$nogroup.');';
            }

            if($controltype == 'submit' && (count($groups) || $nogroup)){
                $source[]='$ctrl->standalone=false;';
            }

            if(count($selectedvalues)){
                if(count($selectedvalues)>1 &&
                        (($controltype == 'listbox' && isset($control['multiple']) && 'true' != (string)$control['multiple'])
                        || $controltype == 'radiobuttons' || $controltype == 'menulist')  ){
                    throw new jException('jelix~formserr.multiple.selected.not.allowed',$this->sourceFile);
                }
                $source[]='$ctrl->defaultValue='.var_export($selectedvalues,true).';';
            }
        }
    }

    protected function readItem($item, $hasSelectedValues, $controltype, &$selectedvalues) {
        $value ="'".str_replace("'","\\'",(string)$item['value'])."'=>";
        if(isset($item['locale'])){
            $value.="jLocale::get('".(string)$item['locale']."'),";
        }elseif( "" != (string)$item){
            $value.="'".str_replace("'","\\'",(string)$item)."',";
        }else{
            $value.="'".str_replace("'","\\'",(string)$item['value'])."',";
        }

        if(isset($item['selected'])){
            if($hasSelectedValues || $controltype == 'submit'){
                throw new jException('jelix~formserr.selected.attribute.not.allowed',$this->sourceFile);
            }
            if((string)$item['selected']== 'true'){
                $selectedvalues[]=(string)$item['value'];
            }
        }
        return $value;
    }
}
