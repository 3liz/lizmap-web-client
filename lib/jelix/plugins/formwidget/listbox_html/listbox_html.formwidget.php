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

class listbox_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase {
    protected function outputJs() {
        $js = '';
        $ctrl = $this->ctrl;
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        if($ctrl->multiple){
            $js .= "c = new ".$jFormsJsVarName."ControlString('".$ctrl->ref."[]', ".$this->escJsStr($ctrl->label).");\n";
            $js .= "c.multiple = true;\n";
        } else {
            $js .= "c = new ".$jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        }
        $this->parentWidget->addJs($js);
        if ($ctrl instanceof jFormsControlDatasource
            && $ctrl->datasource instanceof jIFormsDynamicDatasource) {
            $dependentControls = $ctrl->datasource->getCriteriaControls();
            if ($dependentControls) {
                $this->parentWidget->addJs("c.dependencies = ['".implode("','",$dependentControls)."'];\n");
                $this->parentWidget->addFinalJs("jFormsJQ.tForm.declareDynamicFill('".$ctrl->ref.($ctrl->multiple?'[]':'')."');\n");
            }
        }
        $this->commonJs();
    }

    function outputControl() {
        $ctrl = $this->ctrl;
        $attr = $this->getControlAttributes();
        $value = $this->getValue();

        if (isset($attr['readonly'])) {
            $attr['disabled'] = 'disabled';
            unset($attr['readonly']);
        }
        $attr['size'] = $ctrl->size;

        if($ctrl->multiple){
            $attr['name'] = $ctrl->ref.'[]';
            $attr['id'] = $this->getId();
            $attr['multiple'] = 'multiple';
            echo '<select';
            $this->_outputAttr($attr);
            echo ">\n";
            if($ctrl->emptyItemLabel !== null)
                echo '<option value=""',(in_array('',$value,true)?' selected="selected"':''),'>',htmlspecialchars($ctrl->emptyItemLabel),"</option>\n";
            if(is_array($value) && count($value) == 1)
                $value = $value[0];

            if(is_array($value)){
                $value = array_map(function($v){ return (string) $v;},$value);
                $this->fillSelect($ctrl, $value);
            }else{
                $this->fillSelect($ctrl, (string)$value);
            }
            echo "</select>\n";
        }else{
            if(is_array($value)){
                if(count($value) >= 1)
                    $value = $value[0];
                else
                    $value ='';
            }

            $value = (string) $value;
            echo '<select';
            $this->_outputAttr($attr);
            echo ">\n";
            if($ctrl->emptyItemLabel !== null)
                echo '<option value=""',($value===''?' selected="selected"':''),'>',htmlspecialchars($ctrl->emptyItemLabel),"</option>\n";
            $this->fillSelect($ctrl, $value);
            echo "</select>\n";
        }
        $this->outputJs();
    }
}
