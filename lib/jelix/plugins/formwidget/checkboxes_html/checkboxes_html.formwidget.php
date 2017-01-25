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

class checkboxes_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase {

    protected function outputJs($refName) {
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        $this->parentWidget->addJs("c = new ".$jFormsJsVarName."ControlString('".$refName."', ".$this->escJsStr($this->ctrl->label).");\n");
        $this->commonJs();
    }
    
    function outputControl() {
        $attr = $this->getControlAttributes();
        $value = $this->getValue();

        $attr['name'] = $this->ctrl->ref.'[]';
        unset($attr['title']);
        if(is_array($value) && count($value) == 1)
            $value = $value[0];
        $span ='<span class="jforms-chkbox jforms-ctl-'.$this->ctrl->ref.'"><input type="checkbox"';

        if(is_array($value)){
            $value = array_map(function($v){ return (string) $v;},$value);
        }
        else {
            $value = (string) $value;
        }
        $this->showRadioCheck($attr, $value, $span);
        $this->outputJs($this->ctrl->ref."[]");
    }

    protected function showRadioCheck(&$attr, &$value, $span) {
        $id = $this->builder->getName().'_'.$this->ctrl->ref.'_';
        $i=0;
        $data = $this->ctrl->datasource->getData($this->builder->getForm());
        if ($this->ctrl->datasource instanceof \jIFormsDatasource2 && $this->ctrl->datasource->hasGroupedData()) {
            if (isset($data[''])) {
                $this->echoCheckboxes($span, $id, $data[''], $attr, $value, $i);
            }
            foreach($data as $group=>$values){
                if ($group === '')
                    continue;
                echo '<fieldset><legend>'.htmlspecialchars($group).'</legend>'."\n";
                $this->echoCheckboxes($span, $id, $values, $attr, $value, $i);
                echo "</fieldset>\n";
            }
            echo "\n";
        }else{
            $this->echoCheckboxes($span, $id, $data, $attr, $value, $i);
            echo "\n";
        }
    }

    protected function echoCheckboxes($span, $id, &$values, &$attr, &$value, &$i) {
        foreach($values as $v=>$label){
            $attr['id'] = $id.$i;
            $attr['value'] = $v;
            echo $span;
            $this->_outputAttr($attr);
            if((is_array($value) && in_array((string) $v,$value,true)) || ($value === (string) $v))
                echo ' checked="checked"';
            echo '/>','<label for="',$id,$i,'">',htmlspecialchars($label),"</label></span>\n";
            $i++;
        }
    }
}
