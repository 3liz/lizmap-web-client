<?php

/**
 * @author    3liz
 * @copyright 2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Form;

trait WidgetTrait
{
    protected function outputLabelAsTitle($label, $attr)
    {
        echo '<label class="',$attr['class'],'"',$attr['idLabel'],$attr['hint'],'>';
        echo htmlspecialchars($label, ENT_COMPAT | ENT_SUBSTITUTE), $attr['reqHtml'];
        echo "</label>\n";
    }
}
