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
require_once JELIX_LIB_PATH.'plugins/formwidget/checkboxes_html/checkboxes_html.formwidget.php';

class checkboxes_htmlbootstrapFormWidget extends checkboxes_htmlFormWidget
{
    use WidgetTrait;

    protected function outputLabelAsTitle($label, $attr)
    {
        echo '<div class="col-3">';
        echo '<label class="',$attr['class'],'"',$attr['idLabel'],$attr['hint'],'>';
        echo htmlspecialchars($label, ENT_COMPAT | ENT_SUBSTITUTE), $attr['reqHtml'];
        echo "</label>\n";
        echo '</div>';
    }

    public function outputControl()
    {
        $attr = $this->getControlAttributes();
        $value = $this->getValue();

        $attr['name'] = $this->ctrl->ref.'[]';
        unset($attr['title']);
        if (is_array($value) && count($value) == 1) {
            $value = $value[0];
        }
        $class = 'jforms-ctrl-checkboxes form-check-input';
        $class .= ($this->ctrl->required == false || $ro ? '' : ' jforms-required');
        $class .= (isset($this->builder->getForm()->getContainer()->errors[$this->ctrl->ref]) ? ' jforms-error is-invalid' : '');
        $class .= ($ro && $this->ctrl->type != 'captcha' ? ' jforms-readonly' : '');
        $span = '<div class="form-check">'
        .'<label class="checkbox form-check-label jforms-chkbox jforms-ctl-'.$this->ctrl->ref.'">'
        .'<input type="checkbox" class="'.$class.'"';

        if (is_array($value)) {
            $value = array_map(function ($v) { return (string) $v; }, $value);
        } else {
            $value = (string) $value;
        }
        echo '<div class="col-9">';
        $this->showRadioCheck($attr, $value, $span);
        echo '</div>';
        $this->outputJs($this->ctrl->ref.'[]');
    }

    protected function echoCheckboxes($span, $id, &$values, &$attr, &$value, &$i)
    {
        foreach ($values as $v => $label) {
            $attr['id'] = $id.$i;
            $attr['value'] = $v;
            echo $span;
            $this->_outputAttr($attr);
            if ((is_array($value) && in_array((string) $v, $value, true)) || ($value === (string) $v)) {
                echo ' checked="checked"';
            }
            echo '/>',htmlspecialchars($label),"</label>\n";
            echo '</div>';
            ++$i;
        }
    }
}
