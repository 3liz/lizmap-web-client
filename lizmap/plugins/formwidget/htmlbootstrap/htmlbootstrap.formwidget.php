<?php
/**
 * @author      Laurent Jouanneau
 * @contributor Julien Issler, Dominique Papin
 *
 * @copyright   2006-2018 Laurent Jouanneau, 2008-2011 Julien Issler, 2008 Dominique Papin
 *
 * @see        http://www.jelix.org
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */
class htmlbootstrapFormWidget extends \jelix\forms\HtmlWidget\RootWidget
{
    /**
     * @var \jelix\forms\Builder\HtmlBuilder
     */
    protected $builder;

    public function outputHeader($builder)
    {
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
        if ($builder->getOption('modal')) {
            echo '<div class="modal-body">';
        }
        $this->builder = $builder;
    }

    public function outputFooter()
    {
        if ($this->builder->getOption('modal')) {
            echo '</div>';
        }
        parent::outputFooter();
    }
}
