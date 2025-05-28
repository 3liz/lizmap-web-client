<?php

use Jelix\Forms\HtmlWidget\WidgetInterface;
use Lizmap\Form\WidgetTrait;

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
    use WidgetTrait;

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

    protected function displayStartGroup($groupId, $label, $checkBoxAttr = array())
    {
        if (count($checkBoxAttr) == 0) {
            echo '<fieldset id="',$groupId,'" class="jforms-ctrl-group"><legend>',htmlspecialchars($label),"</legend>\n";
        } else {
            echo '<fieldset id="',$groupId,'" class="jforms-ctrl-group"><legend>',
            '<input ';
            $this->_outputAttr($checkBoxAttr);
            echo '> <label for="'.$checkBoxAttr['id'].'">',htmlspecialchars($label),"</label></legend>\n";
        }
        echo '<div class="jforms-table-group">',"\n";
    }

    /**
     * @param WidgetInterface $widget
     */
    protected function displayChildControl($widget)
    {
        $widget->setLabelAttributes(array('class' => 'control-label'));
        echo '<div class="control-group">';
        $widget->outputLabel();
        echo '<div class="controls">';
        $widget->outputControl();
        $widget->outputHelp();
        echo "</div>\n</div>\n";
    }

    protected function displayEndGroup()
    {
        echo "</div></fieldset>\n";
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
