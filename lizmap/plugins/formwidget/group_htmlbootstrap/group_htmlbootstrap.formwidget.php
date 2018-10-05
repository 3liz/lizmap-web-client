<?php
/**
 * @package   lizmap
 * @subpackage  forms_widget_plugin
 * @author    3liz
 * @copyright 2018 3liz
 * @link      http://3liz.com
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

require_once(JELIX_LIB_PATH.'plugins/formwidget/group_html/group_html.formwidget.php');


class group_htmlbootstrapFormWidget extends group_htmlFormWidget {
    use \Lizmap\Form\WidgetTrait;

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

        echo '<div class="jforms-table-group">',"\n";
        foreach( $this->ctrl->getChildControls() as $ctrlref=>$c){
            if ($c->type == 'submit' || $c->type == 'reset' || $c->type == 'hidden') {
                continue;
            }
            if (!$this->builder->getForm()->isActivated($ctrlref)) {
                continue;
            }
            $widget = $this->builder->getWidget($c, $this);
            echo '<div class="control-group">';
            $widget->outputLabel();
            echo "<div class=\"controls\">";
            $widget->outputControl();
            $widget->outputHelp();
            echo "</div>\n</div>\n";
            if ($this->ctrl->hasCheckbox) {
                $this->parentWidget->addJs("c2.addControl(c);\n");
            }
        }
        echo "</div></fieldset>\n";
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
            echo '<div class="jforms-table-group">',"\n";
            foreach( $this->ctrl->getChildControls() as $ctrlref=>$c){
                if($c->type == 'submit' || $c->type == 'reset' || $c->type == 'hidden') {
                    continue;
                }
                if(!$this->builder->getForm()->isActivated($ctrlref)) {
                    continue;
                }
                $widget = $this->builder->getWidget($c, $this);
                echo '<div class="control-group">';
                $widget->outputLabel('', false);
                echo "<div class=\"controls\">";
                $widget->outputControlValue();
                echo "</div>\n</div>\n";
            }
            echo "</div>";
        }
        echo "</fieldset>\n";
    }
}
