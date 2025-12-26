<?php

/**
 * @author    3liz
 * @copyright 2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once __DIR__.'/../checkboxes_htmlbootstrap/checkboxes_htmlbootstrap.formwidget.php';

class radiobuttons_htmlbootstrapFormWidget extends checkboxes_htmlbootstrapFormWidget
{
    public function outputControl()
    {
        $attr = $this->getControlAttributes();
        $value = $this->getValue();

        $attr['name'] = $this->ctrl->ref;
        unset($attr['title']);
        if (is_array($value)) {
            if (isset($value[0])) {
                $value = $value[0];
            } else {
                $value = '';
            }
        }
        $value = (string) $value;
        $span = '<div class="form-check">'
        .'<label class="radio form-check-label jforms-radio jforms-ctl-'.$this->ctrl->ref.'">'
        .'<input type="radio"';
        echo '<div class="col-9">';
        $this->showRadioCheck($attr, $value, $span);
        echo '</div>';
        $this->outputJs($this->ctrl->ref);
    }
}
