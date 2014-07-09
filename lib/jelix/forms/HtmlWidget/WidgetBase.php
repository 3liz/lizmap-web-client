<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Julien Issler, Dominique Papin, Claudio Bernardes
* @copyright   2006-2012 Laurent Jouanneau
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
     * @var jControl
     */
    protected $ctrl;

    /**
     * attributes
     * @var array
     */
    protected $attributes = array();

    public function __construct($args) {
        $this->ctrl = $args[0];
        $this->builder = $args[1];
        $this->parentWidget = $args[2];
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
        $this->attributes = $attr;
    }

    public function outputMetaContent($resp) { /* do nothing */ }
    
    /**
     * Retrieve the label attributes
     */
    protected function getLabelAttributes() {
        $attr = array();
        
        $attr['hint'] = ($this->ctrl->hint == '' ? '' : ' title="'.htmlspecialchars($this->ctrl->hint).'"');
        $attr['idLabel'] = ' id="'.$this->getId().'_label"';
 
        $required = ($this->ctrl->required == false || $this->ctrl->isReadOnly()?'':' jforms-required');
        $attr['reqHtml'] = ($required?'<span class="jforms-required-star">*</span>':'');
        $attr['class'] = 'jforms-label';
        $attr['class'] .= (isset($this->builder->getForm()->getContainer()->errors[$this->ctrl->ref]) ?' jforms-error':'');
        $attr['class'] .= ($this->ctrl->required == false || $this->ctrl->isReadOnly()?'':' jforms-required');        
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

        if (!$this->parentWidget->controlJsChild())
            $jsContent .= $this->builder->getJFormsJsVarName().".tForm.addControl(c);\n";

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
         if ($this->ctrl->help) {
            if($this->ctrl->type == 'checkboxes' || ($this->ctrl->type == 'listbox' && $this->ctrl->multiple)){
                $name=$this->ctrl->ref.'[]';
            }else{
                $name=$this->ctrl->ref;
            }
            // additionnal &nbsp, else background icon is not shown in webkit
            echo '<span class="jforms-help" id="'.$this->getId().'-help">&nbsp;<span>'.htmlspecialchars($this->ctrl->help).'</span></span>';
        }
    }

    /**
     * This function displays the form field label.
     */
    public function outputLabel() {
        $ctrl = $this->ctrl;
        $attr = $this->getLabelAttributes();

        if($ctrl->type == 'output' || $ctrl->type == 'checkboxes' || $ctrl->type == 'radiobuttons' || $ctrl->type == 'date' || $ctrl->type == 'datetime' || $ctrl->type == 'choice'){
            echo '<span class="',$attr['class'],'"',$attr['idLabel'],$attr['hint'],'>';
            echo htmlspecialchars($this->ctrl->label), $attr['reqHtml'];
            echo "</span>\n";
        }else if($ctrl->type != 'submit' && $ctrl->type != 'reset'){
            echo '<label class="',$attr['class'],'" for="',$this->getId(),'"',$attr['idLabel'],$attr['hint'],'>';
            echo htmlspecialchars($this->ctrl->label), $attr['reqHtml'];
            echo "</label>\n";
        }
    }

    // if this method is abstract, fatal error with PHP 5.3.3 (debian squeeze)
    // FIXME PHP54 : this function can be abstracted
    public function outputControl(){}

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

