<?php
/**
* @package     jelix
* @subpackage  formwidgets
* @author      Claudio Bernardes
* @contributor Laurent Jouanneau, Julien Issler, Dominique Papin
* @copyright   2012 Claudio Bernardes
* @copyright   2006-2015 Laurent Jouanneau, 2008-2015 Julien Issler, 2008 Dominique Papin
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  jelix-plugins
 * @link http://developer.jelix.org/wiki/rfc/jforms-controls-plugins
 */

class menulist_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase {
    protected function outputJs() {
        $ctrl = $this->ctrl;
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        $this->parentWidget->addJs("c = new ".$jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n");
        if ($ctrl instanceof jFormsControlDatasource
            && $ctrl->datasource instanceof jIFormsDynamicDatasource) {
            $dependentControls = $ctrl->datasource->getCriteriaControls();
            if ($dependentControls) {
                $this->parentWidget->addJs("c.dependencies = ['".implode("','",$dependentControls)."'];\n");
                $this->parentWidget->addFinalJs("jFormsJQ.tForm.declareDynamicFill('".$ctrl->ref."');\n");
            }
        }
        $this->commonJs();
    }

    function outputControl() {
        $attr = $this->getControlAttributes();
        $value = $this->getValue();

        if (isset($attr['readonly'])) {
            $attr['disabled'] = 'disabled';
            unset($attr['readonly']);
        }

        $attr['size'] = '1';
        echo '<select';
        $this->_outputAttr($attr);
        echo ">\n";

        if(is_array($value)){
            if(isset($value[0]))
                $value = $value[0];
            else
                $value='';
        }
        $value = (string) $value;
        if ($this->ctrl->emptyItemLabel !== null || !$this->ctrl->required)
            echo '<option value=""',($value===''?' selected="selected"':''),'>',htmlspecialchars($this->ctrl->emptyItemLabel),"</option>\n";
        $this->fillSelect($this->ctrl, $value);
        echo "</select>\n";
        $this->outputJs();
    }
}
