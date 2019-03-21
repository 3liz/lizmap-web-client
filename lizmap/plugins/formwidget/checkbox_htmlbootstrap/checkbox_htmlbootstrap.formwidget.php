<?php
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
    use \Lizmap\Form\WidgetTrait;

    public function outputControl()
    {
        $this->labelAttributes['class'] = 'checkbox';
        $attrLabel = $this->getLabelAttributes(true);
        echo '<label class="',$attrLabel['class'],'" for="',$this->getId(),'"',$attrLabel['idLabel'],$attrLabel['hint'],'>';

        $attr = $this->getControlAttributes();

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
        $this->outputJs();
    }
}
