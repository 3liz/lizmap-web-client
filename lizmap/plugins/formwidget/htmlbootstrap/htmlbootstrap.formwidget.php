<?php

use jelix\forms\Builder\HtmlBuilder;
use jelix\forms\HtmlWidget\RootWidget;

/**
 * @author      Laurent Jouanneau
 *
 * @contributor Julien Issler, Dominique Papin
 *
 * @copyright   2006-2018 Laurent Jouanneau, 2008-2011 Julien Issler, 2008 Dominique Papin
 *
 * @see        http://www.jelix.org
 *
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */
class htmlbootstrapFormWidget extends RootWidget
{
    public function outputHeader($builder)
    {
        $conf = jApp::config()->urlengine;
        $collection = jApp::config()->webassets['useCollection'];
        $jquery = jApp::config()->{'webassets_'.$collection}['jquery.js'];
        if (is_array($jquery)) {
            $jquery = $jquery[0];
        }

        $form = $builder->getForm();
        $privateData = $form->getContainer()->privateData;
        $groupDependencies = array();
        if (array_key_exists('qgis_groupDependencies', $privateData)) {
            $groupDependencies = $privateData['qgis_groupDependencies'];
        }

        // no scope into an anonymous js function, because jFormsJQ.tForm is used by other generated source code
        $js = "jFormsJQ.selectFillUrl='".jUrl::get('jelix~jforms:getListData')."';\n";
        $js .= 'jFormsJQ.groupVisibilitiesUrl=\''.jUrl::get('lizmap~edition:getGroupVisibilities')."';\n";
        $js .= 'jFormsJQ.config = {locale:'.$builder->escJsStr(jApp::config()->locale).
            ',basePath:'.$builder->escJsStr(jApp::urlBasePath()).
            ',jqueryPath:'.$builder->escJsStr($conf['jqueryPath']).
            ',jqueryFile:'.$builder->escJsStr($jquery).
            ',jelixWWWPath:'.$builder->escJsStr($conf['jelixWWWPath'])."};\n";
        $js .= "jFormsJQ.tForm = new jFormsJQForm('".$builder->getName()."','".
            $form->getSelector()."','".
            $form->getContainer()->formId."');\n";
        $js .= 'jFormsJQ.tForm.setErrorDecorator(new '.$builder->getOption('errorDecorator')."());\n";
        $js .= 'jFormsJQ.tForm.groupDependencies = '.json_encode($groupDependencies).";\n";
        $js .= "jFormsJQ.declareForm(jFormsJQ.tForm);\n";
        $this->addJs($js);

        if ($builder->getOption('modal')) {
            echo '<div class="modal-body">';
        }
    }

    /**
     * @param HtmlBuilder $builder
     */
    public function outputFooter($builder)
    {
        // Since jelix 1.8.7, we need to add `deprecatedDeclareFormBeforeControls` builder option
        // because in the `outputHeader` we defined `jFormsJQ.declareForm(jFormsJQ.tForm);`
        // and we use `parent::outputFooter($builder);`
        $builder->setOptions(
            array(
                'errorDecorator' => $builder->getOption('errorDecorator'),
                'modal' => $builder->getOption('modal'),
                'deprecatedDeclareFormBeforeControls' => true,
            )
        );
        if ($builder->getOption('modal')) {
            echo '</div>';
        }
        $js = "(function(){var c, c2;\n".$this->js.$this->finalJs.'})();';
        $container = $builder->getForm()->getContainer();
        $container->privateData['__jforms_js'] = $js;
        $formId = $container->formId;
        $formName = $builder->getForm()->getSelector();
        echo '<script type="text/javascript" defer src="'.jUrl::get(
            'jelix~jforms:js',
            array('__form' => $formName, '__fid' => $formId)
        ).'"></script>';
    }
}
