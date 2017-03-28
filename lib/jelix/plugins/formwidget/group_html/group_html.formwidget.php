<?php
/**
* @package     jelix
* @subpackage  formwidgets
* @author      Claudio Bernardes
* @contributor Laurent Jouanneau, Julien Issler, Dominique Papin
* @copyright   2012 Claudio Bernardes
* @copyright   2006-2014 Laurent Jouanneau, 2008-2011 Julien Issler, 2008 Dominique Papin
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  jelix-plugins
 * @link http://developer.jelix.org/wiki/rfc/jforms-controls-plugins
 */
class group_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase
                            implements \jelix\forms\HtmlWidget\ParentWidgetInterface {

    //------ ParentBuilderInterface

    function addJs($js) {
        $this->parentWidget->addJs($js);
    }

    function addFinalJs($js) {
        $this->parentWidget->addFinalJs($js);
    }

    function controlJsChild() {
        return $this->ctrl->hasCheckbox;
    }

    //------- WidgetInterface

    public function outputMetaContent($resp) {
        foreach ($this->ctrl->getChildControls() as $ctrlref=>$c) {
            if ($c->type == 'hidden') continue;
            $widget = $this->builder->getWidget($c, $this);
            $widget->outputMetaContent($resp);
        }
    }

    protected function jsGroupInternal($ctrl) {
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        $this->parentWidget->addJs("c = new ".$jFormsJsVarName."ControlGroup('".$this->ctrl->ref."', ".$this->escJsStr($this->ctrl->label).");\n");
        $this->commonJs();
        if ($this->ctrl->hasCheckbox) {
            $this->parentWidget->addJs("c.hasCheckbox = true;\n");
        }
        $this->parentWidget->addJs("c2 = c;\n");
    }

    public function outputLabel($format='', $editMode=true) {
        /*if ($editMode || !$this->ctrl->hasCheckbox) {
            return;
        }
        if ($this->getValue($this->ctrl) == $this->ctrl->valueOnCheck) {
            return;
        }

        $ctrl = $this->ctrl;
        $attr = $this->getLabelAttributes($editMode);
        if ($format)
            $label = sprintf($format, $this->ctrl->label);
        else
            $label = $this->ctrl->label;
        $this->outputLabelAsTitle($label, $attr);*/
    }

    function outputControl() {
        $attr = $this->getControlAttributes();
        $value = $this->getValue();
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();
        
        if ($this->ctrl->hasCheckbox) {
            echo '<fieldset id="',$attr['id'],'" class="jforms-ctrl-group"><legend>',
                '<input ';
            $chkattr = $attr;
            $chkattr['class'] = str_replace('jforms-ctrl-group', '', $chkattr['class']);
            $chkattr['type'] = "checkbox";
            $chkattr['id'] = $attr['id'].'_checkbox';
            $chkattr['value'] = $this->ctrl->valueOnCheck;
            $chkattr['onclick']= $jFormsJsVarName.'.getForm(\''.$this->builder->getName().'\').getControl(\''.$this->ctrl->ref.'\').showActivate()';
            if ($value == $this->ctrl->valueOnCheck) {
                $chkattr['checked'] = 'true';
            }
            $this->_outputAttr($chkattr);
            echo '> <label for="'.$attr['id'].'_checkbox'.'">',htmlspecialchars($this->ctrl->label),"</label></legend>\n";
            $this->jsGroupInternal($this->ctrl);
        }
        else {
            echo '<fieldset id="',$attr['id'],'" class="jforms-ctrl-group"><legend>',htmlspecialchars($this->ctrl->label),"</legend>\n";
        }

        echo '<table class="jforms-table-group" border="0">',"\n";
        foreach( $this->ctrl->getChildControls() as $ctrlref=>$c){
            if ($c->type == 'submit' || $c->type == 'reset' || $c->type == 'hidden') {
                continue;
            }
            if (!$this->builder->getForm()->isActivated($ctrlref)) {
                continue;
            }
            $widget = $this->builder->getWidget($c, $this);
            echo '<tr><th scope="row">';
            $widget->outputLabel();
            echo "</th>\n<td>";
            $widget->outputControl();
            $widget->outputHelp();
            echo "</td></tr>\n";
            if ($this->ctrl->hasCheckbox) {
                $this->parentWidget->addJs("c2.addControl(c);\n");
            }
        }
        echo "</table></fieldset>\n";
        if ($this->ctrl->hasCheckbox) {
            $this->parentWidget->addJs("c2.showActivate();\n");
        }
    }

    public function outputControlValue(){

        $attr = $this->getValueAttributes();

        echo '<fieldset id="',$attr['id'],'"><legend>',htmlspecialchars($this->ctrl->label),"</legend>\n";
        if ($this->ctrl->hasCheckbox && $this->getValue() != $this->ctrl->valueOnCheck) {
            parent::outputControlValue();
        }
        else {
            echo '<table class="jforms-table-group" border="0">',"\n";
            foreach( $this->ctrl->getChildControls() as $ctrlref=>$c){
                if($c->type == 'submit' || $c->type == 'reset' || $c->type == 'hidden') {
                    continue;
                }
                if(!$this->builder->getForm()->isActivated($ctrlref)) {
                    continue;
                }
                $widget = $this->builder->getWidget($c, $this);
                echo '<tr><th scope="row">';
                $widget->outputLabel('', false);
                echo "</th>\n<td>";
                $widget->outputControlValue();
                echo "</td></tr>\n";
            }
            echo "</table>";
        }
        echo "</fieldset>\n";
    }
}
