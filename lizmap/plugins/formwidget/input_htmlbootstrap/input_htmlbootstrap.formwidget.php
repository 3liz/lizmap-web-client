<?php

/**
 * @author    3liz
 * @copyright 2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once JELIX_LIB_PATH . 'plugins/formwidget/input_html/input_html.formwidget.php';

class input_htmlbootstrapFormWidget extends input_htmlFormWidget {
    use \Lizmap\Form\WidgetTrait;

    public function outputControl() {
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
        if ( $this->ctrl->datatype instanceof jDatatypeInteger) {
            $attr['type'] = 'number';
        } else {
            $attr['type'] = 'text';
        }
        echo '<input';
        $this->_outputAttr($attr);
        echo "/>\n";
        $this->outputJs();
    }
}
