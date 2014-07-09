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
class group_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase
                            implements \jelix\forms\HtmlWidget\ParentWidgetInterface {

    //------ ParentBuilderInterface

    function addJs($js) {
        $this->parentWidget->addJs($js);
    }

    function addFinalJs($js) {
        $this->parentWidget->addFinalJs($js);
    }

    function controlJsChild() {
        return false;
    }

    //------- WidgetInterface

    public function outputMetaContent($resp) {
        foreach( $this->ctrl->getChildControls() as $ctrlref=>$c){
            if ($c->type == 'hidden') continue;
            $widget = $this->builder->getWidget($c, $this);
            $widget->outputMetaContent($resp);
        }
    }

    function outputControl() {
        $attr = $this->getControlAttributes();

        echo '<fieldset id="',$attr['id'],'"><legend>',htmlspecialchars($this->ctrl->label),"</legend>\n";
        echo '<table class="jforms-table-group" border="0">',"\n";
        foreach( $this->ctrl->getChildControls() as $ctrlref=>$c){
            if($c->type == 'submit' || $c->type == 'reset' || $c->type == 'hidden') continue;
            if(!$this->builder->getForm()->isActivated($ctrlref)) continue;
            $widget = $this->builder->getWidget($c, $this);
            echo '<tr><th scope="row">';
            $widget->outputLabel();
            echo "</th>\n<td>";
            $widget->outputControl();
            $widget->outputHelp();
            echo "</td></tr>\n";
        }
        echo "</table></fieldset>\n";
    }
}
