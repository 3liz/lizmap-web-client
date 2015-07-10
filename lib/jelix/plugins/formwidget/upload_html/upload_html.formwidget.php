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

class upload_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase {
    protected function outputJs() {
        $ctrl = $this->ctrl;
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();
        
        $this->parentWidget->addJs("c = new ".$jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n");
        $this->commonJs();
    }

    function outputControl() {
        $attr = $this->getControlAttributes();

        /*if($this->ctrl->maxsize){
            echo '<input type="hidden" name="MAX_FILE_SIZE" value="',$this->ctrl->maxsize,'"','/>';
        }*/
        $attr['type'] = 'file';
        $attr['value'] = '';
        echo '<input';
        $this->_outputAttr($attr);
        echo "/>\n";
        $this->outputJs();
    }
}
