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
require_once JELIX_LIB_PATH.'plugins/formwidget/imageupload_html/imageupload_html.formwidget.php';

class imageupload_htmlbootstrapFormWidget extends imageupload_htmlFormWidget
{
    use WidgetTrait;

    protected function displaySelectButton()
    {
        echo '<button class="jforms-image-select-btn btn" type="button">'.jLocale::get('jelix~jforms.upload.picture.choice.new.file').'</button>'."\n";
    }

    protected function displayModifyButton($imageSelector, $currentFileName)
    {
        echo '<button class="jforms-image-modify-btn btn" type="button"
            data-current-image="'.$imageSelector.'"
            data-current-file-name="'.htmlspecialchars($currentFileName).'">'.
            jLocale::get('jelix~jforms.upload.picture.choice.modify').
            '</button>'."\n";
    }
}
