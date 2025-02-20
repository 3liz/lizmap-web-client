<?php

use Lizmap\Form\WidgetTrait;

/**
 * @author    3liz
 * @copyright 2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once JELIX_LIB_PATH.'plugins/formwidget/checkbox_html/checkbox_html.formwidget.php';

class checkbox_htmlbootstrapFormWidget extends checkbox_htmlFormWidget
{
    use WidgetTrait;

    protected function outputJs()
    {
        $js = 'c = new '.$this->builder->getjFormsJsVarName()."ControlBoolean('".$this->ctrl->ref."', ".$this->escJsStr($this->ctrl->label).");\n";
        if ($this->ctrl->valueLabelOnCheck !== '' or $this->ctrl->valueLabelOnUncheck !== '') {
            $js = 'c = new '.$this->builder->getjFormsJsVarName()."ControlString('".$this->ctrl->ref."', ".$this->escJsStr($this->ctrl->label).");\n";
        }
        $this->parentWidget->addJs($js);
        $this->commonJs();
    }

    public function outputControl()
    {
        if ($this->ctrl->valueLabelOnCheck !== '' or $this->ctrl->valueLabelOnUncheck !== '') {
            $this->labelAttributes['class'] = 'radio jforms-radio';
        } else {
            $this->labelAttributes['class'] = 'checkbox';
        }
        $attrLabel = $this->getLabelAttributes(true);

        $attr = $this->getControlAttributes();

        if ($this->ctrl->valueLabelOnCheck !== '' or $this->ctrl->valueLabelOnUncheck !== '') {
            echo '<label class="',$attrLabel['class'],'" ',$attrLabel['hint'],'>';

            $attrid = ''.$attr['id'];

            $attr['type'] = 'radio';
            if ($this->ctrl->valueOnCheck == $this->getValue()) {
                $attr['checked'] = 'checked';
            }
            $attr['value'] = $this->ctrl->valueOnCheck;
            $attr['id'] = $attrid.'_'.$this->ctrl->valueOnCheck;

            // attribute readonly is not enough to make checkboxes readonly. Note that value won't be sent by submit but it is not a problem as it is readonly
            if (array_key_exists('readonly', $attr)) {
                $attr['disabled'] = 'disabled';
            }

            echo '<input';
            $this->_outputAttr($attr);
            echo '/>';
            echo htmlspecialchars($this->ctrl->valueLabelOnCheck);
            echo "</label>\n";

            echo '<label class="',$attrLabel['class'],'" ',$attrLabel['hint'],'>';

            if ($this->ctrl->valueOnCheck == $this->getValue()) {
                unset($attr['checked']);
            } elseif ($this->ctrl->valueOnUncheck == $this->getValue()) {
                $attr['checked'] = 'checked';
            }
            $attr['value'] = ''; // In the HTML form uncheck is equal to no value $this->ctrl->valueOnUncheck;
            $attr['id'] = $attrid.'_'.$this->ctrl->valueOnUncheck;

            echo '<input';
            $this->_outputAttr($attr);
            echo '/>';
            echo htmlspecialchars($this->ctrl->valueLabelOnUncheck);
            echo "</label>\n";
        } else {
            echo '<label class="',$attrLabel['class'],'" for="',$this->getId(),'"',$attrLabel['idLabel'],$attrLabel['hint'],'>';

            if ($this->ctrl->valueOnCheck == $this->getValue()) {
                $attr['checked'] = 'checked';
            }
            $attr['value'] = $this->ctrl->valueOnCheck;
            $attr['type'] = 'checkbox';
            // attribute readonly is not enough to make checkboxes readonly. Note that value won't be sent by submit but it is not a problem as it is readonly
            if (array_key_exists('readonly', $attr)) {
                $attr['disabled'] = 'disabled';
            }
            echo '<input';
            $this->_outputAttr($attr);
            echo '/>';
            echo htmlspecialchars($this->ctrl->label), $attrLabel['reqHtml'];
            echo "</label>\n";
        }
        $this->outputJs();
    }
}
