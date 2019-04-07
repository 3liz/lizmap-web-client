<?php
/**
* @package     jelix
* @subpackage  forms_widget_plugin
* @author      Claudio Bernardes
* @contributor Laurent Jouanneau, Julien Issler, Dominique Papin
* @copyright   2012 Claudio Bernardes
* @copyright   2006-2012 Laurent Jouanneau, 2008-2011 Julien Issler, 2008 Dominique Papin
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  forms_widget_plugin
 * @link http://developer.jelix.org/wiki/rfc/jforms-controls-plugins
 */

class color_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase {
    protected function outputJs() {
        $ctrl = $this->ctrl;

        $jFormsJsVarName = $this->builder->getjFormsJsVarName();
        $js = "c = new ".$jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        $js .="c.regexp = /^#[a-fA-F0-9]{6}$/ \n";

        $this->parentWidget->addJs($js);
        $this->commonJs();
    }

    function outputControl() {
        $attr = $this->getControlAttributes();
        $attr['value'] = $this->getValue();
        $attr['type'] = 'color';
        $attr['style'] = 'width:5em;height:25px;';
        echo '<input';
        $this->_outputAttr($attr);
        echo "/>\n";
        $this->outputJs();
    }
    public function outputControlValue(){
        $attr = $this->getValueAttributes();
        $value = $this->getValue();
        $value = $this->ctrl->getDisplayValue($value);
        $attr['style'] = 'display:inline-block;width:20px;height:20px;background-color:'.$value;
        echo '<span ';
        $this->_outputAttr($attr);
        echo '> </span>';
    }
}
