<?php
/**
* @package     jelix
* @subpackage  forms
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
 *
 * @example generated JS code:
 * c = new jFormsJQControlChoice('choice2', 'Another choice');
 * c.errInvalid='"Another choice" field is invalid';
 * jFormsJQ.tForm.addControl(c);
 * c2 = c;
 * c2.items['choice1']=[];
 * c2.addControl(c, 'choice2');
 * c2.addControl(c, 'choice2');
 * c2.addControl(c, 'choice2');
 * c2.addControl(c, 'choice3');
 * c2.addControl(c, 'choice4');
 * c2.addControl(c, 'choice4');
 * c2.activate(''); 
 */
 
class choice_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase
                            implements \jelix\forms\HtmlWidget\ParentWidgetInterface {

    //------ ParentBuilderInterface

    function addJs($js) {
        $this->parentWidget->addJs($js);
    }

    function addFinalJs($js) {
        $this->parentWidget->addFinalJs($js);
    }

    function controlJsChild() {
        return true;
    }

    // -------- WidgetInterface

    public function outputMetaContent($resp) {
        foreach( $this->ctrl->getChildControls() as $ctrlref=>$c){
            if ($c->type == 'hidden') continue;
            $widget = $this->builder->getWidget($c, $this);
            $widget->outputMetaContent($resp);
        }
    }

    protected function jsChoiceInternal($ctrl) {
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        $this->parentWidget->addJs("c = new ".$jFormsJsVarName."ControlChoice('".$this->ctrl->ref."', ".$this->escJsStr($this->ctrl->label).");\n");
        $this->commonJs();
        $this->parentWidget->addJs("c2 = c;\n");
    }

    function outputControl() {
        $ctrl = $this->ctrl;
        $attr = $this->getControlAttributes();
        $value = $this->getValue();
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        echo '<ul class="jforms-choice jforms-ctl-'.$ctrl->ref.'" >',"\n";
        if(is_array($value)){
            if(isset($value[0]))
                $value = $value[0];
            else
                $value='';
        }

        $i=0;
        $attr['name'] = $ctrl->ref;
        $id = $this->builder->getName().'_'.$ctrl->ref.'_';
        $attr['type']='radio';
        unset($attr['class']);
        $readonly = (isset($attr['readonly']) && $attr['readonly']!=''); // FIXME: should be used?

        $this->jsChoiceInternal($ctrl);

        foreach( $ctrl->items as $itemName=>$listctrl){
            if (!$ctrl->isItemActivated($itemName))
                continue;
            echo '<li id="'.$id.$itemName.'_item"><label><input';
            $attr['id'] = $id.$i;
            $attr['value'] = $itemName;
            if ($itemName==$value)
                $attr['checked'] = 'checked';
            else
                unset($attr['checked']);
            $this->_outputAttr($attr);
            echo ' onclick="'.$jFormsJsVarName.'.getForm(\'',$this->builder->getName(),'\').getControl(\'',$ctrl->ref,'\').activate(\'',$itemName,'\')"', '/>';
            echo htmlspecialchars($ctrl->itemsNames[$itemName]),"</label>\n";

            $displayedControls = false;
            foreach($listctrl as $ref=>$c) {
                if(!$this->builder->getForm()->isActivated($ref) || $c->type == 'hidden') continue;
                $widget = $this->builder->getWidget($c, $this);
                $displayedControls = true;
                echo ' <span class="jforms-item-controls">';
                $widget->outputLabel();
                echo ' ';
                $widget->outputControl();
                $widget->outputHelp();
                echo "</span>\n";
                $this->parentWidget->addJs("c2.addControl(c, ".$this->escJsStr($itemName).");\n");
            }
            if(!$displayedControls) {
                $this->parentWidget->addJs("c2.items[".$this->escJsStr($itemName)."]=[];\n");
            }

            echo "</li>\n";
            $i++;
        }
        echo "</ul>\n\n";
        $this->parentWidget->addJs("c2.activate('".$value."');\n");
    }

    function outputControlValue() {
        $ctrl = $this->ctrl;
        $attr = $this->getValueAttributes();
        $value = $this->getValue();

        if(is_array($value)){
            if(isset($value[0]))
                $value = $value[0];
            else
                $value='';
        }

        $attr['name'] = $ctrl->ref;
        $id = $this->builder->getName().'_'.$ctrl->ref.'_'; // FIXME should be used?
        $attr['type']='radio';

        if (!isset($ctrl->items[$value])) {
            if (!$ctrl->isItemActivated($value) || $ctrl->emptyValueLabel === null)
                return;
            echo '<span ';
            $this->_outputAttr($attr);
            echo '>', htmlspecialchars($ctrl->emptyValueLabel), '</span>';
            return;
        }

        echo '<label>',htmlspecialchars($value),"</label>\n";
        $listctrl = $ctrl->items[$value];
        if (count($listctrl)) {
            echo "<ul>\n";
            foreach($listctrl as $ref=>$c) {
                if(!$this->builder->getForm()->isActivated($ref) || $c->type == 'hidden') continue;
                $widget = $this->builder->getWidget($c, $this);
                echo '<li class="jforms-item-controls">';
                $widget->outputLabel('', false);
                echo ':';
                $widget->outputControlValue();
                echo "</li>\n";
            }

            echo "</ul>\n";
        }
    }
}
