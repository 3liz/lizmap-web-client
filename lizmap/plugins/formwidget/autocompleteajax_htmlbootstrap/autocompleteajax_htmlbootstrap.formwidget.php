<?php

use Lizmap\Form\WidgetTrait;

/**
 * @author    3liz
 * @copyright 2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once JELIX_LIB_PATH.'plugins/formwidget/autocomplete_html/autocompleteajax_html.formwidget.php';

class autocompleteajax_htmlbootstrapFormWidget extends autocompleteajax_htmlFormWidget
{
    use WidgetTrait;
}
