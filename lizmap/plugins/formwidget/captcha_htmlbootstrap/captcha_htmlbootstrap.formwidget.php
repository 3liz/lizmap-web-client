<?php

/**
 * @author    3liz
 * @copyright 2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once JELIX_LIB_PATH.'plugins/formwidget/captcha_html/captcha_html.formwidget.php';

class captcha_htmlbootstrapFormWidget extends captcha_htmlFormWidget
{
    use \Lizmap\Form\WidgetTrait;
}
