<?php
/**
* @package     jelix
* @subpackage  formwidgets
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
 * @subpackage  jelix-plugins
 * @link http://developer.jelix.org/wiki/rfc/jforms-controls-plugins
 */

class checkbox_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase {
    protected function outputJs() {
        $js = "c = new ".$this->builder->getjFormsJsVarName()."ControlBoolean('".$this->ctrl->ref."', ".$this->escJsStr($this->ctrl->label).");\n";
        $this->parentWidget->addJs($js);
        $this->commonJs();
    }

    function outputControl() {
        $attr = $this->getControlAttributes();

        if($this->ctrl->valueOnCheck == $this->getValue()){
            $attr['checked'] = "checked";
        }
        $attr['value'] = $this->ctrl->valueOnCheck;
        $attr['type'] = 'checkbox';
        echo '<input';
        $this->_outputAttr($attr);
        echo "/>\n";
        $this->outputJs();
    }
}
