<?php
/**
* @package     jelix
* @subpackage  forms_legacybuilder_plugin
* @author      Laurent Jouanneau
* @contributor Julien Issler, Dominique Papin, Olivier Demah
* @copyright   2006-2015 Laurent Jouanneau
* @copyright   2008 Julien Issler, 2008 Dominique Papin
* @copyright   2009 Olivier Demah
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
* @deprecated
*/

include_once(JELIX_LIB_PATH.'forms/legacy/jFormsBuilderHtml.class.php');

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  forms_legacybuilder_plugin
 * @deprecated
 */
class htmlJformsBuilder extends jFormsBuilderHtml {

    protected $jFormsJsVarName = 'jFormsJQ';

    public function outputMetaContent($t) {

        $resp= jApp::coord()->response;
        if($resp === null || $resp->getType() !='html'){
            return;
        }
        $confUrlEngine = &jApp::config()->urlengine;
        $confHtmlEditor = &jApp::config()->htmleditors;
        $confDate = &jApp::config()->datepickers;
        $confWikiEditor = &jApp::config()->wikieditors;
        $www = $confUrlEngine['jelixWWWPath'];

        $resp->addJSLink(jApp::config()->jquery['jquery']);
        $resp->addJSLink($www.'jquery/include/jquery.include.js');
        $resp->addJSLink($www.'js/jforms_jquery.js');
        $resp->addCSSLink($www.'design/jform.css');
        foreach($t->_vars as $k=>$v){
            if(!$v instanceof jFormsBase)
                continue;
            foreach($v->getHtmlEditors() as $ed) {
                if (isset($confHtmlEditor[$ed->config.'.engine.file'])) {
                    $lang = jLocale::getCurrentLang();
                    $urls = $confHtmlEditor[$ed->config.'.engine.file'];
                    if (!is_array($urls)) {
                        $urls =array($urls);
                    }

                    foreach($urls as $url) {
                        $url = str_replace('$lang', $lang, $url);
                        $resp->addJSLink($url);
                    }
                }

                if (isset($confHtmlEditor[$ed->config.'.config'])) {
                    $resp->addJSLink($confHtmlEditor[$ed->config.'.config']);
                }

                $skin = $ed->config.'.skin.'.$ed->skin;

                if (isset($confHtmlEditor[$skin]) && $confHtmlEditor[$skin] != '') {
                    $resp->addCSSLink($confHtmlEditor[$skin]);
                }
            }

            $datepicker_default_config = jApp::config()->forms['datepicker'];

            foreach($v->getControls() as $ctrl){
                if($ctrl instanceof jFormsControlDate || get_class($ctrl->datatype) == 'jDatatypeDate' || get_class($ctrl->datatype) == 'jDatatypeLocaleDate'){
                    $config = isset($ctrl->datepickerConfig)?$ctrl->datepickerConfig:$datepicker_default_config;
                    $resp->addJSLink($confDate[$config]);
                }
            }

            foreach($v->getWikiEditors() as $ed) {
                if(isset($confWikiEditor[$ed->config.'.engine.file']))
                    $resp->addJSLink($confWikiEditor[$ed->config.'.engine.file']);
                if(isset($confWikiEditor[$ed->config.'.config.path'])) {
                    $p = $confWikiEditor[$ed->config.'.config.path'];
                    $resp->addJSLink($p.jApp::config()->locale.'.js');
                    $resp->addCSSLink($p.'style.css');
                }
                if(isset($confWikiEditor[$ed->config.'.skin']))
                    $resp->addCSSLink($confWikiEditor[$ed->config.'.skin']);
            }
        }
    }

    protected function outputHeaderScript(){
        $conf = jApp::config()->urlengine;
        // no scope into an anonymous js function, because jFormsJQ.tForm is used by other generated source code
        echo '<script type="text/javascript">
//<![CDATA[
jFormsJQ.selectFillUrl=\''.jUrl::get('jelix~jforms:getListData').'\';
jFormsJQ.config = {locale:'.$this->escJsStr(jApp::config()->locale).
    ',basePath:'.$this->escJsStr($conf['basePath']).
    ',jqueryPath:'.$this->escJsStr($conf['jqueryPath']).
    ',jqueryFile:'.$this->escJsStr(jApp::config()->jquery['jquery']).
    ',jelixWWWPath:'.$this->escJsStr($conf['jelixWWWPath']).'};
jFormsJQ.tForm = new jFormsJQForm(\''.$this->_name.'\',\''.$this->_form->getSelector().'\',\''.$this->_form->getContainer()->formId.'\');
jFormsJQ.tForm.setErrorDecorator(new '.$this->options['errorDecorator'].'());
jFormsJQ.declareForm(jFormsJQ.tForm);
//]]>
</script>';
    }

    protected function commonJs($ctrl) {
        if ($ctrl->isReadOnly()) {
            $this->jsContent .="c.readOnly = true;\n";
        }

        if($ctrl->required) {
            $this->jsContent .= "c.required = true;\n";
        }

        if($ctrl->alertRequired){
            $this->jsContent .="c.errRequired=".$this->escJsStr($ctrl->alertRequired).";\n";
        }
        else {
            $this->jsContent .="c.errRequired=".$this->escJsStr(jLocale::get('jelix~formserr.js.err.required', $ctrl->label)).";\n";
        }

        if($ctrl->alertInvalid){
            $this->jsContent .="c.errInvalid=".$this->escJsStr($ctrl->alertInvalid).";\n";
        }
        else {
            $this->jsContent .="c.errInvalid=".$this->escJsStr(jLocale::get('jelix~formserr.js.err.invalid', $ctrl->label)).";\n";
        }

        if ($this->isRootControl) $this->jsContent .="jFormsJQ.tForm.addControl(c);\n";

        if($ctrl instanceof jFormsControlDate || get_class($ctrl->datatype) == 'jDatatypeDate' || get_class($ctrl->datatype) == 'jDatatypeLocaleDate'){
            $config = isset($ctrl->datepickerConfig)?$ctrl->datepickerConfig:jApp::config()->forms['datepicker'];
            $this->jsContent .= 'jelix_datepicker_'.$config."(c, jFormsJQ.config);\n";
        }
    }

    protected function jsMenulist($ctrl) {

        $this->jsContent .="c = new jFormsJQControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        if ($ctrl instanceof jFormsControlDatasource
            && $ctrl->datasource instanceof jIFormsDynamicDatasource) {
            $dependentControls = $ctrl->datasource->getCriteriaControls();
            if ($dependentControls) {
                $this->jsContent .="c.dependencies = ['".implode("','",$dependentControls)."'];\n";
                $this->lastJsContent .= "jFormsJQ.tForm.declareDynamicFill('".$ctrl->ref."');\n";
            }
        }

        $this->commonJs($ctrl);
    }

    protected function jsListbox($ctrl) {
        if($ctrl->multiple){
            $this->jsContent .= "c = new jFormsJQControlString('".$ctrl->ref."[]', ".$this->escJsStr($ctrl->label).");\n";
            $this->jsContent .= "c.multiple = true;\n";
        } else {
            $this->jsContent .= "c = new jFormsJQControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        }

        if ($ctrl instanceof jFormsControlDatasource
            && $ctrl->datasource instanceof jIFormsDynamicDatasource) {
            $dependentControls = $ctrl->datasource->getCriteriaControls();
            if ($dependentControls) {
                $this->jsContent .="c.dependencies = ['".implode("','",$dependentControls)."'];\n";
                $this->lastJsContent .= "jFormsJQ.tForm.declareDynamicFill('".$ctrl->ref."');\n";
            }
        }
        $this->commonJs($ctrl);
    }

    protected function jsWikieditor($ctrl) {
        $this->jsTextarea($ctrl);
        $engine = jApp::config()->wikieditors[$ctrl->config.'.engine.name'];
        $this->jsContent .= '$("#'.$this->_name.'_'.$ctrl->ref.'").markItUp(markitup_'.$engine.'_settings);'."\n";
    }

}
