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
require_once JELIX_LIB_PATH.'plugins/formwidget/passwordeditor_html/passwordeditor_html.formwidget.php';

class passwordeditor_htmlbootstrapFormWidget extends passwordeditor_htmlFormWidget
{
    use WidgetTrait;

    public function outputMetaContent($resp)
    {
        $JelixWWWPath = jApp::urlJelixWWWPath();
        $resp->addJSLink($JelixWWWPath.'js/jforms/password-editor.js', array('defer' => ''));
        $resp->addJSLink($JelixWWWPath.'js/jforms/password-list.js', array('defer' => ''));
    }
}
