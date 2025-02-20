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
require_once JELIX_LIB_PATH.'plugins/formwidget/input_html/input_html.formwidget.php';

class input_htmlbootstrapFormWidget extends input_htmlFormWidget
{
    use WidgetTrait;

    public function outputControl()
    {
        // same code as input_htmlFormWidget
        $attr = $this->getControlAttributes();

        if ($this->ctrl->size != 0) {
            $attr['size'] = $this->ctrl->size;
        }
        $maxl = $this->ctrl->datatype->getFacet('maxLength');
        if ($maxl !== null) {
            $attr['maxlength'] = $maxl;
        }
        $attr['value'] = $this->getValue();
        // new code : check datatype to provide a better input type
        if ($this->ctrl->datatype instanceof jDatatypeInteger || $this->ctrl->datatype instanceof jDatatypeDecimal) {
            $attr['type'] = 'number';
            // min, max and step attributes supported with input type number
            $minValue = $this->ctrl->datatype->getFacet('minValue');
            if ($minValue !== null) {
                $attr['min'] = $minValue;
            }
            $maxValue = $this->ctrl->datatype->getFacet('maxValue');
            if ($maxValue !== null) {
                $attr['max'] = $maxValue;
            }
            $stepValue = $this->ctrl->getAttribute('stepValue');
            if ($stepValue !== null) {
                $attr['step'] = $stepValue;
            } else {
                // undefined step value : 'any'  will allow users to use decimal
                $attr['step'] = 'any';
            }
        } else {
            $attr['type'] = 'text';
        }

        echo '<input';
        $this->_outputAttr($attr);
        echo "/>\n";
        $this->outputJs();
    }
}
