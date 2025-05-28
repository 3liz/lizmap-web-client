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
require_once JELIX_LIB_PATH.'plugins/formwidget/password_html/password_html.formwidget.php';

class password_htmlbootstrapFormWidget extends password_htmlFormWidget
{
    use WidgetTrait;

    public function outputMetaContent($resp)
    {
        $JelixWWWPath = jApp::urlJelixWWWPath();
        $resp->addJSLink($JelixWWWPath.'js/jforms/password-editor.js', array('defer' => ''));
    }
}
