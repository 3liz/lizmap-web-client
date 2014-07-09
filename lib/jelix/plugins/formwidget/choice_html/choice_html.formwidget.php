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
 */

/*
c = new jFormsJQControlChoice('task', 'Task status');
c.errInvalid='"Task status" field is invalid';
jFormsJQ.tForm.addControl(c);
c2 = c;
c2.items['new']=[];
c = new jFormsJQControlString('assignee', 'assignee name');
c.required = true;
c.errRequired='"assignee name" field is required';
c.errInvalid='"assignee name" field is invalid';
c2.addControl(c, 'assigned');
c = new jFormsJQControlString('task-done', 'Status');
c.errInvalid='"Status" field is invalid';
c2.addControl(c, 'closed');
c2.activate('');
c = new jFormsJQControlChoice('choice2', 'Another choice');
c.errInvalid='"Another choice" field is invalid';
jFormsJQ.tForm.addControl(c);
c2 = c;
c2.items['choice1']=[];
c = new jFormsJQControlString('choice2readonly', 'readonly field');
c.errInvalid='"readonly field" field is invalid';
c2.addControl(c, 'choice2');
c = new jFormsJQControlDatetime('choice2datettime', 'Datetime');
c.multiFields = true;
jelix_datepicker_default(c, jFormsJQ.config);
c.errInvalid='"Datetime" field is invalid';
c2.addControl(c, 'choice2');
c = new jFormsJQControlDate('choice2datesimplefield', 'another date');
c.required = true;
c.errRequired='"another date" field is required';
c.errInvalid='"another date" field is invalid';
c2.addControl(c, 'choice2');
c = new jFormsJQControlDatetime('choice2datettimerequired', 'Datetime required');
c.multiFields = true;
jelix_datepicker_default(c, jFormsJQ.config);
c.required = true;
c.errRequired='"Datetime required" field is required';
c.errInvalid='"Datetime required" field is invalid';
c2.addControl(c, 'choice3');
c = new jFormsJQControlString('listdep2', 'Departments list');
c.errInvalid='"Departments list" field is invalid';
c2.addControl(c, 'choice4');
c = new jFormsJQControlString('listtown2', 'Towns list, updated when department is selected');
c.dependencies = ['listdep2'];
c.errInvalid='"Towns list, updated when department is selected" field is invalid';
c2.addControl(c, 'choice4');
c2.activate(''); 
*/

/*
c = new jFormsJQControlChoice('choice2', 'Another choice');
c.errInvalid='"Another choice" field is invalid';
jFormsJQ.tForm.addControl(c);
c2 = c;
c2.items['choice1']=[];
c2.addControl(c, 'choice2');
c2.addControl(c, 'choice2');
c2.addControl(c, 'choice2');
c2.addControl(c, 'choice3');
c2.addControl(c, 'choice4');
c2.addControl(c, 'choice4');
c2.activate(''); 
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
        $value = $this->getValue($ctrl);
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
        $readonly = (isset($attr['readonly']) && $attr['readonly']!='');

        $this->jsChoiceInternal($ctrl);

        foreach( $ctrl->items as $itemName=>$listctrl){
            if (!$ctrl->isItemActivated($itemName))
                continue;
            echo '<li><label><input';
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

}
