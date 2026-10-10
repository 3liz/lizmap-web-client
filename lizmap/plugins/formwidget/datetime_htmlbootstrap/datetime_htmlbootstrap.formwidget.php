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
require_once JELIX_LIB_PATH.'plugins/formwidget/datetime_html/datetime_html.formwidget.php';

class datetime_htmlbootstrapFormWidget extends datetime_htmlFormWidget
{
    use WidgetTrait;

    protected function getControlAttributes()
    {
        $attr = parent::getControlAttributes();
        // readonly has no effect on the day/month selects, and the datepicker only checks disabled
        if (array_key_exists('readonly', $attr)) {
            $attr['disabled'] = 'disabled';
        }

        return $attr;
    }

    public function outputControl()
    {
        echo '<div class="input-group">';
        parent::outputControl();
        echo '</div>';
    }
}
