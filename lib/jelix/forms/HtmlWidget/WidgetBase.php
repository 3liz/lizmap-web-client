<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Julien Issler, Dominique Papin, Claudio Bernardes
* @copyright   2006-2018 Laurent Jouanneau
* @copyright   2008-2011 Julien Issler, 2008 Dominique Papin
* @copyright   2012 Claudio Bernardes
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

namespace jelix\forms\HtmlWidget;

abstract class WidgetBase implements WidgetInterface {

    /**
     * The form builder
     * @var \jelix\forms\Builder\HtmlBuilder
     */
    protected $builder;

    /**
     * the parent widget
     * @var \jelix\forms\HtmlWidget\ParentWidgetInterface
     */
    protected $parentWidget;

    /**
     * The control
     * @var \jFormsControl
     */
    protected $ctrl;

    /**
     * attributes
     * @var array
     */
    protected $attributes = array();

    protected $valuesSeparator = ' ';

    protected $_endt = '/>';

    public function __construct($args) {
        $this->ctrl = $args[0];
        $this->builder = $args[1];
        $this->parentWidget = $args[2];
        $this->_endt = $this->builder->endOfTag();
    }
    
    /**
     * Get the control id
     */
    public function getId() {
        return $this->builder->getName().'_'.$this->ctrl->ref;
    }

    /**
     * Get the control name
     */
    public function getName() {
        return $this->ctrl->ref;
    }

    /**
     * Get the control class
     */
    protected function getCSSClass() {
        $ro = $this->ctrl->isReadOnly();

        if (isset($this->attributes['class']))
            $class = $this->attributes['class'].' ';
        else
            $class = '';

        $class .= 'jforms-ctrl-'.$this->ctrl->type;
        $class .= ($this->ctrl->required == false || $ro?'':' jforms-required');
        $class .= (isset($this->builder->getForm()->getContainer()->errors[$this->ctrl->ref]) ?' jforms-error':'');
        $class .= ($ro && $this->ctrl->type != 'captcha'?' jforms-readonly':'');

        return $class;
    }

    public function getValue() {
        return $this->builder->getForm()->getData($this->ctrl->ref);
    }
    
    public function setAttributes($attr) {
        if (isset($attr['separator'])) {
            $this->valuesSeparator = $attr['separator'];
            unset($attr['separator']);
        }
        $this->attributes = $attr;
    }


    public function outputMetaContent($resp) { /* do nothing */ }
    
    /**
     * Retrieve the label attributes
     */
    protected function getLabelAttributes($editMode) {
        $attr = array();
        
        $attr['hint'] = ($this->ctrl->hint == '' ? '' : ' title="'.htmlspecialchars($this->ctrl->hint).'"');
        $attr['idLabel'] = ' id="'.$this->getId().'_label"';
 
        if ($editMode) {
            $required = ($this->ctrl->required == false || $this->ctrl->isReadOnly()?'':' jforms-required');
            $attr['reqHtml'] = ($required?'<span class="jforms-required-star">*</span>':'');
        }
        else {
            $attr['reqHtml'] = '';
        }
        $attr['class'] = 'jforms-label';
        $attr['class'] .= (isset($this->builder->getForm()->getContainer()->errors[$this->ctrl->ref]) ?' jforms-error':'');
        if ($editMode) {
            $attr['class'] .= ($this->ctrl->required == false || $this->ctrl->isReadOnly()?'':' jforms-required');
        }
        return $attr;
    }

    /**
     * Returns an array containing all the control attributes
     */
    protected function getControlAttributes() {
        $attr = $this->attributes;
        $attr['name'] = $this->getName();
        $attr['id'] = $this->getId();
        if ($this->ctrl->isReadOnly())
            $attr['readonly'] = 'readonly';
        if ($this->ctrl->hint)
            $attr['title'] = $this->ctrl->hint;

        $attr['class'] = $this->getCSSClass();

        return $attr;
    }

    protected function getValueAttributes(){
        $attr = $this->attributes;
        $attr['id'] = $this->getId();
        $class = 'jforms-value jforms-value-'.$this->ctrl->type;
        if (isset($attr['class']))
            $attr['class'] .= ' '.$class;
        else
            $attr['class'] = $class;
        return $attr;
    }

    protected function commonJs() {
        $jsContent = '';

        if ($this->ctrl->isReadOnly()) {
            $jsContent .="c.readOnly = true;\n";
        }

        if($this->ctrl->required){
            $jsContent .= "c.required = true;\n";
            if($this->ctrl->alertRequired){
                $jsContent .= "c.errRequired=". $this->escJsStr($this->ctrl->alertRequired).";\n";
            }
            else {
                $jsContent .= "c.errRequired=".$this->escJsStr(\jLocale::get('jelix~formserr.js.err.required', $this->ctrl->label)).";\n";
            }
        }

        if($this->ctrl->alertInvalid){
            $jsContent .= "c.errInvalid=".$this->escJsStr($this->ctrl->alertInvalid).";\n";
        }
        else {
            $jsContent .= "c.errInvalid=".$this->escJsStr(\jLocale::get('jelix~formserr.js.err.invalid', $this->ctrl->label)).";\n";
        }

        if (!$this->parentWidget->controlJsChild()) {
            $jsContent .= $this->builder->getJFormsJsVarName().".tForm.addControl(c);\n";
        }

        $this->parentWidget->addJs($jsContent);
    }
    
    protected function escJsStr($str) {
        return '\''.str_replace(array("'","\n"),array("\\'", "\\n"), $str).'\'';
    }
    
    protected function _outputAttr(&$attributes) {
        foreach($attributes as $name=>$val) {
            echo ' '.$name.'="'.htmlspecialchars($val).'"';
        }
    }

    /**
     * This function displays the blue question mark near the form field
     */
    public function outputHelp() {
        if (method_exists($this->builder, 'outputControlHelp')) {
            $this->builder->outputControlHelp($this->ctrl);
        }
        // deprecated. only for compatibility of plugins for jelix 1.6
        else if ($this->ctrl->help) {
            // additionnal &nbsp, else background icon is not shown in webkit
            echo '<span class="jforms-help" id="'.$this->getId().'-help">&nbsp;<span>'.htmlspecialchars($this->ctrl->help).'</span></span>';
        }
    }
    /**
     * This function displays the form field label.
     */
    public function outputLabel($format='', $editMode=true) {
        $ctrl = $this->ctrl;
        $attr = $this->getLabelAttributes($editMode);
        if ($format)
            $label = sprintf($format, $this->ctrl->label);
        else
            $label = $this->ctrl->label;

        if ($ctrl->type == 'output' || $ctrl->type == 'checkboxes' ||
            $ctrl->type == 'radiobuttons' || $ctrl->type == 'date' ||
            $ctrl->type == 'datetime' || $ctrl->type == 'choice'){
            $this->outputLabelAsTitle($label, $attr);
        }
        else if($ctrl->type != 'submit' && $ctrl->type != 'reset'){
            $this->outputLabelAsFormLabel($label, $attr);
        }
    }

    protected function outputLabelAsFormLabel($label, $attr) {
        echo '<label class="',$attr['class'],'" for="',$this->getId(),'"',$attr['idLabel'],$attr['hint'],'>';
        echo htmlspecialchars($label), $attr['reqHtml'];
        echo "</label>\n";
    }

    protected function outputLabelAsTitle($label, $attr) {
        echo '<span class="',$attr['class'],'"',$attr['idLabel'],$attr['hint'],'>';
        echo htmlspecialchars($label), $attr['reqHtml'];
        echo "</span>\n";
    }
    
    
    // if this method is abstract, fatal error with PHP 5.3.3 (debian squeeze)
    // FIXME PHP54 : this function can be abstracted
    public function outputControl(){}


    public function outputControlValue(){
        $attr = $this->getValueAttributes();
        echo '<span ';
        $this->_outputAttr($attr);
        echo '>';
        $value = $this->getValue();
        $value = $this->ctrl->getDisplayValue($value);
        if(is_array($value)){
            $s ='';
            foreach($value as $v){
                $s .= $this->valuesSeparator.htmlspecialchars($v);
            }
            echo substr($s, strlen($this->valuesSeparator));
        }else if ($this->ctrl->isHtmlContent())
            echo $value;
        else
            echo htmlspecialchars($value);
        echo '</span>';
    }

    protected function fillSelect($ctrl, $value) {
        $data = $ctrl->datasource->getData($this->builder->getForm());
        if ($ctrl->datasource instanceof \jIFormsDatasource2 && $ctrl->datasource->hasGroupedData()) {
            if (isset($data[''])) {
                foreach($data[''] as $v=>$label){
                    if(is_array($value))
                        $selected = in_array((string) $v,$value,true);
                    else
                        $selected = ((string) $v===$value);
                    echo '<option value="',htmlspecialchars($v),'"',($selected?' selected="selected"':''),'>',htmlspecialchars($label),"</option>\n";
                }
            }
            foreach($data as $group=>$values) {
                if ($group === '')
                    continue;
                echo '<optgroup label="'.htmlspecialchars($group).'">';
                foreach($values as $v=>$label){
                    if(is_array($value))
                        $selected = in_array((string) $v,$value,true);
                    else
                        $selected = ((string) $v===$value);
                    echo '<option value="',htmlspecialchars($v),'"',($selected?' selected="selected"':''),'>',htmlspecialchars($label),"</option>\n";
                }
                echo '</optgroup>';
            }
        }
        else {
            foreach($data as $v=>$label){
                    if(is_array($value))
                        $selected = in_array((string) $v,$value,true);
                    else
                        $selected = ((string) $v===$value);
                echo '<option value="',htmlspecialchars($v),'"',($selected?' selected="selected"':''),'>',htmlspecialchars($label),"</option>\n";
            }
        }
    }
}

