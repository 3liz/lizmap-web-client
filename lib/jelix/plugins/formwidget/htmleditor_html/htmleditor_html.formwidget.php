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

class htmleditor_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase {
    public function outputMetaContent($resp) {
        $bp = jApp::urlBasePath();
        $confHtmlEditor = &jApp::config()->htmleditors;

        if(isset($confHtmlEditor[$this->ctrl->config.'.engine.file'])){
            if(is_array($confHtmlEditor[$this->ctrl->config.'.engine.file'])){
                foreach($confHtmlEditor[$this->ctrl->config.'.engine.file'] as $url) {
                    $resp->addJSLink($bp.$url);
                }
            }else
                $resp->addJSLink($bp.$confHtmlEditor[$this->ctrl->config.'.engine.file']);
        }
        
        if(isset($confHtmlEditor[$this->ctrl->config.'.config']))
            $resp->addJSLink($bp.$confHtmlEditor[$this->ctrl->config.'.config']);

        $skin = $this->ctrl->config.'.skin.'.$this->ctrl->skin;

        if(isset($confHtmlEditor[$skin]) && $confHtmlEditor[$skin] != '')
            $resp->addCSSLink($bp.$confHtmlEditor[$skin]);
    }

    protected function outputJs() {
        $ctrl = $this->ctrl;
        $formName = $this->builder->getName();
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();
        
        $js ="c = new ".$jFormsJsVarName."ControlHtml('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";

        $maxl= $ctrl->datatype->getFacet('maxLength');
        if($maxl !== null)
            $js .="c.maxLength = '$maxl';\n";

        $minl= $ctrl->datatype->getFacet('minLength');
        if($minl !== null)
            $js .="c.minLength = '$minl';\n";

        $this->parentWidget->addJs($js);
        $this->commonJs();

        $engine = jApp::config()->htmleditors[$ctrl->config.'.engine.name'];
        $this->parentWidget->addJs('jelix_'.$engine.'_'.$ctrl->config.'("'.$formName.'_'.$ctrl->ref.'","'.$formName.'","'.$ctrl->skin."\",".$jFormsJsVarName.".config);\n");
    }

    function outputControl() {
        $attr = $this->getControlAttributes();
        $value = $this->getValue();

        if (!isset($attr['rows']))
            $attr['rows'] = $this->ctrl->rows;
        if (!isset($attr['cols']))
            $attr['cols'] = $this->ctrl->cols;

        echo '<textarea';
        $this->_outputAttr($attr);
        echo '>',htmlspecialchars($value),"</textarea>\n";
        $this->outputJs();
    }

    public function outputControlValue(){
        $attr = $this->getValueAttributes();
        echo '<div ';
        $this->_outputAttr($attr);
        echo '>';
        $value = $this->getValue();
        $value = $this->ctrl->getDisplayValue($value);
        echo $value,'</div>';
    }
}
