<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @copyright   2006-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/
namespace jelix\forms\HtmlWidget;

class RootWidget implements ParentWidgetInterface {

    //------ ParentBuilderInterface

    protected $js = '';
    function addJs($js) {
        $this->js .= $js;
    }

    protected $finalJs = '';
    function addFinalJs($js) {
        $this->finalJs .= $js;
    }

    function controlJsChild() {
        return false;
    }

    //------ Other methods

    /**
     * @param \jelix\forms\Builder\HtmlBuilder $builder
     */
    public function outputHeader($builder) {
        $jsVarName = $builder->getjFormsJsVarName();
        echo '<script type="text/javascript">
//<![CDATA[
'.$jsVarName.'.tForm = new jFormsForm(\''.$builder->getName().'\');
'.$jsVarName.'.tForm.setErrorDecorator(new '.$builder->getOption('errorDecorator').'());
'.$jsVarName.'.declareForm(jForms.tForm);
//]]>
</script>';
    }

    public function outputFooter() {
        echo '<script type="text/javascript">
//<![CDATA[
(function(){var c, c2;
'.$this->js.$this->finalJs.'
})();
//]]>
</script>';
    }
}

