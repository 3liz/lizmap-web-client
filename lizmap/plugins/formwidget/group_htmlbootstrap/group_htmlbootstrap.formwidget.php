<?php
/**
 * @author    3liz
 * @copyright 2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once JELIX_LIB_PATH.'plugins/formwidget/group_html/group_html.formwidget.php';

class group_htmlbootstrapFormWidget extends group_htmlFormWidget
{
    use \Lizmap\Form\WidgetTrait;

    public function outputLabel($format = '', $editMode = true)
    {
        if ($editMode || !$this->ctrl->hasCheckbox) {
            return;
        }

        $attr = $this->getLabelAttributes($editMode);
        if ($format) {
            $label = sprintf($format, $this->ctrl->label);
        } else {
            $label = $this->ctrl->label;
        }
        $this->outputLabelAsTitle($label, $attr);
    }

    public function outputControl()
    {
        $attr = $this->getControlAttributes();
        $value = $this->getValue();
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        if ($this->ctrl->hasCheckbox) {
            echo '<fieldset id="',$attr['id'],'" class="jforms-ctrl-group"><legend>',
            '<input ';
            $chkattr = $attr;
            $chkattr['class'] = str_replace('jforms-ctrl-group', '', $chkattr['class']);
            $chkattr['type'] = 'checkbox';
            $chkattr['id'] = $attr['id'].'_checkbox';
            $chkattr['value'] = $this->ctrl->valueOnCheck;
            $chkattr['onclick'] = $jFormsJsVarName.'.getForm(\''.$this->builder->getName().'\').getControl(\''.$this->ctrl->ref.'\').showActivate()';
            if ($value == $this->ctrl->valueOnCheck) {
                $chkattr['checked'] = 'true';
            }
            $this->_outputAttr($chkattr);
            echo '> <label for="'.$attr['id'].'_checkbox'.'">',htmlspecialchars($this->ctrl->label),"</label></legend>\n";
            $this->jsGroupInternal($this->ctrl);
        } else {
            echo '<fieldset id="',$attr['id'],'" class="jforms-ctrl-group"><legend>',htmlspecialchars($this->ctrl->label),"</legend>\n";
        }

        echo '<div class="jforms-table-group">',"\n";
        foreach ($this->ctrl->getChildControls() as $ctrlref => $c) {
            if ($c->type == 'submit' || $c->type == 'reset' || $c->type == 'hidden') {
                continue;
            }
            if (!$this->builder->getForm()->isActivated($ctrlref)) {
                continue;
            }
            $widget = $this->builder->getWidget($c, $this);
            $widget->setLabelAttributes(array('class' => 'control-label'));
            echo '<div class="control-group">';
            $widget->outputLabel();
            echo '<div class="controls">';
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

    public function outputControlValue()
    {
        $attr = $this->getValueAttributes();
        $value = $this->getValue();

        if ($this->ctrl->hasCheckbox && $this->getValue() != $this->ctrl->valueOnCheck) {
            echo '<span ';
            $this->_outputAttr($attr);
            echo '>';
            echo htmlspecialchars($this->ctrl->getDisplayValue($value));
            echo '</span>';

            return;
        }

        echo '<fieldset id="',$attr['id'],'"><legend>',htmlspecialchars($this->ctrl->label),"</legend>\n";
        echo '<table class="table">',"\n";
        foreach ($this->ctrl->getChildControls() as $ctrlref => $c) {
            if ($c->type == 'submit' || $c->type == 'reset' || $c->type == 'hidden') {
                continue;
            }
            if (!$this->builder->getForm()->isActivated($ctrlref)) {
                continue;
            }
            $widget = $this->builder->getWidget($c, $this);
            $widget->setLabelAttributes(array('class' => 'control-label'));
            echo '<tr><th>';
            $widget->outputLabel('', false);
            echo '</th><td>';
            $widget->outputControlValue();
            echo "</td></tr>\n";
        }
        echo '</table>';
        echo "</fieldset>\n";
    }
}
