<?php
/**
* @package     jelix
* @subpackage  forms_widget_plugin
* @author      Laurent Jouanneau
* @contributor Julien Issler, Dominique Papin
* @copyright   2006-2012 Laurent Jouanneau, 2008-2011 Julien Issler, 2008 Dominique Papin
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

class htmlFormWidget extends \jelix\forms\HtmlWidget\RootWidget {
    
    public function outputHeader($builder) {
        $conf = jApp::config()->urlengine;
        // no scope into an anonymous js function, because jFormsJQ.tForm is used by other generated source code
        echo '<script type="text/javascript">
//<![CDATA[
jFormsJQ.selectFillUrl=\''.jUrl::get('jelix~jforms:getListData').'\';
jFormsJQ.config = {locale:'.$builder->escJsStr(jApp::config()->locale).
    ',basePath:'.$builder->escJsStr($conf['basePath']).
    ',jqueryPath:'.$builder->escJsStr($conf['jqueryPath']).
    ',jqueryFile:'.$builder->escJsStr(jApp::config()->jquery['jquery']).
    ',jelixWWWPath:'.$builder->escJsStr($conf['jelixWWWPath']).'};
jFormsJQ.tForm = new jFormsJQForm(\''.$builder->getName().'\',\''.$builder->getForm()->getSelector().'\',\''.$builder->getForm()->getContainer()->formId.'\');
jFormsJQ.tForm.setErrorDecorator(new '.$builder->getOption('errorDecorator').'());
jFormsJQ.declareForm(jFormsJQ.tForm);
//]]>
</script>';
    }
}