<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Julien Issler, Dominique Papin, Olivier Demah
* @copyright   2006-2010 Laurent Jouanneau
* @copyright   2008 Julien Issler, 2008 Dominique Papin
* @copyright   2009 Olivier Demah
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

include_once(JELIX_LIB_PATH.'forms/jFormsBuilderHtml.class.php');

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  jelix-plugins
 */
class htmlJformsBuilder extends jFormsBuilderHtml {

    protected $jFormsJsVarName = 'jFormsJQ';

    public function outputMetaContent($t) {
        global $gJCoord, $gJConfig;
        $resp= $gJCoord->response;
        if($resp === null || $resp->getType() !='html'){
            return;
        }
        $www = $gJConfig->urlengine['jelixWWWPath'];
        $jq = $gJConfig->urlengine['jqueryPath'];
        $bp = $gJConfig->urlengine['basePath'];
        $resp->addJSLink($jq.'jquery.js');
        $resp->addJSLink($jq.'include/jquery.include.js');
        $resp->addJSLink($www.'js/jforms_jquery.js');
        $resp->addCSSLink($www.'design/jform.css');
        foreach($t->_vars as $k=>$v){
            if(!$v instanceof jFormsBase)
                continue;
            foreach($v->getHtmlEditors() as $ed) {
                if(isset($gJConfig->htmleditors[$ed->config.'.engine.file'])){
                    if(is_array($gJConfig->htmleditors[$ed->config.'.engine.file'])){
                        foreach($gJConfig->htmleditors[$ed->config.'.engine.file'] as $url) {
                            $resp->addJSLink($bp.$url);
                        }
                    }else
                        $resp->addJSLink($bp.$gJConfig->htmleditors[$ed->config.'.engine.file']);
                }
                if(isset($gJConfig->htmleditors[$ed->config.'.config']))
                    $resp->addJSLink($bp.$gJConfig->htmleditors[$ed->config.'.config']);
                $skin = $ed->config.'.skin.'.$ed->skin;
                if(isset($gJConfig->htmleditors[$skin]) && $gJConfig->htmleditors[$skin] != '')
                    $resp->addCSSLink($bp.$gJConfig->htmleditors[$skin]);
            }
            $datepicker_default_config = $gJConfig->forms['datepicker'];
            foreach($v->getControls() as $ctrl){
                if($ctrl instanceof jFormsControlDate || get_class($ctrl->datatype) == 'jDatatypeDate' || get_class($ctrl->datatype) == 'jDatatypeLocaleDate'){
                    $config = isset($ctrl->datepickerConfig)?$ctrl->datepickerConfig:$datepicker_default_config;
                    $resp->addJSLink($bp.$gJConfig->datepickers[$config]);
                }
            }

            foreach($v->getWikiEditors() as $ed) {
                if(isset($gJConfig->wikieditors[$ed->config.'.engine.file']))
                    $resp->addJSLink($bp.$gJConfig->wikieditors[$ed->config.'.engine.file']);
                if(isset($gJConfig->wikieditors[$ed->config.'.config.path'])) {
                    $p = $bp.$gJConfig->wikieditors[$ed->config.'.config.path'];
                    $resp->addJSLink($p.$GLOBALS['gJConfig']->locale.'.js');
                    $resp->addCSSLink($p.'style.css');
                }
                if(isset($gJConfig->wikieditors[$ed->config.'.skin']))
                    $resp->addCSSLink($bp.$gJConfig->wikieditors[$ed->config.'.skin']);
            }
        }
    }

    protected function outputHeaderScript(){
        global $gJConfig;
        // no scope into an anonymous js function, because jFormsJQ.tForm is used by other generated source code
        echo '<script type="text/javascript">
//<![CDATA[
jFormsJQ.selectFillUrl=\''.jUrl::get('jelix~jforms:getListData').'\';
jFormsJQ.config = {locale:'.$this->escJsStr($gJConfig->locale).
    ',basePath:'.$this->escJsStr($gJConfig->urlengine['basePath']).
    ',jqueryPath:'.$this->escJsStr($gJConfig->urlengine['jqueryPath']).
    ',jelixWWWPath:'.$this->escJsStr($gJConfig->urlengine['jelixWWWPath']).'};
jFormsJQ.tForm = new jFormsJQForm(\''.$this->_name.'\',\''.$this->_form->getSelector().'\',\''.$this->_form->getContainer()->formId.'\');
jFormsJQ.tForm.setErrorDecorator(new '.$this->options['errorDecorator'].'());
jFormsJQ.declareForm(jFormsJQ.tForm);
//]]>
</script>';
    }

    protected function commonJs($ctrl) {

        if($ctrl->required){
            $this->jsContent .="c.required = true;\n";
            if($ctrl->alertRequired){
                $this->jsContent .="c.errRequired=".$this->escJsStr($ctrl->alertRequired).";\n";
            }
            else {
                $this->jsContent .="c.errRequired=".$this->escJsStr(jLocale::get('jelix~formserr.js.err.required', $ctrl->label)).";\n";
            }
        }

        if($ctrl->alertInvalid){
            $this->jsContent .="c.errInvalid=".$this->escJsStr($ctrl->alertInvalid).";\n";
        }
        else {
            $this->jsContent .="c.errInvalid=".$this->escJsStr(jLocale::get('jelix~formserr.js.err.invalid', $ctrl->label)).";\n";
        }

        if($ctrl instanceof jFormsControlDate || get_class($ctrl->datatype) == 'jDatatypeDate' || get_class($ctrl->datatype) == 'jDatatypeLocaleDate'){
            $config = isset($ctrl->datepickerConfig)?$ctrl->datepickerConfig:$GLOBALS['gJConfig']->forms['datepicker'];
            $this->jsContent .= 'jelix_datepicker_'.$config."(c, jFormsJQ.config);\n";
        }

        if ($this->isRootControl) $this->jsContent .="jFormsJQ.tForm.addControl(c);\n";
    }

    protected function jsMenulist($ctrl) {

        $this->jsContent .="c = new jFormsJQControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        if ($ctrl instanceof jFormsControlDatasource
            && $ctrl->datasource instanceof jFormsDaoDatasource) {
            $dependentControls = $ctrl->datasource->getDependentControls();
            if ($dependentControls) {
                $this->jsContent .="c.dependencies = ['".implode("','",$dependentControls)."'];\n";
                $this->lastJsContent .= "jFormsJQ.tForm.declareDynamicFill('".$ctrl->ref."');\n";
            }
        }

        $this->commonJs($ctrl);
    }

    protected function jsWikieditor($ctrl) {
        $this->jsTextarea($ctrl);
        $engine = $GLOBALS['gJConfig']->wikieditors[$ctrl->config.'.engine.name'];
        $this->jsContent .= '$("#'.$this->_name.'_'.$ctrl->ref.'").markItUp(markitup_'.$engine.'_settings);'."\n";
    }

}
