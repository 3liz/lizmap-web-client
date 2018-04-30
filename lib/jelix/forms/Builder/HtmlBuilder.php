<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Julien Issler, Dominique Papin, Claudio Bernardes
* @copyright   2006-2018 Laurent Jouanneau
* @copyright   2008-2016 Julien Issler, 2008 Dominique Papin, 2012 Claudio Bernardes
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

namespace jelix\forms\Builder;

use \jelix\forms\HtmlWidget\ParentWidgetInterface;

/**
 * Main HTML form builder
 */
class HtmlBuilder extends BuilderBase {
    protected $formType = 'html';

    protected $formConfig = 'jforms_builder_html';

    protected $jFormsJsVarName = 'jForms';

    /**
     * @var array containing the formwidget for the current builder
     */
    protected $pluginsConf = array();

    /**
     * @var \jelix\forms\HtmlWidget\RootWidget
     */
    protected $rootWidget;

    public function __construct($form){
        parent::__construct($form);
        $config = \jApp::config()->{$this->formConfig};
        if (isset($this->pluginsConf['root'])) { //first the builder conf
           $pluginName = $this->pluginsConf['root'];
        } elseif (isset($config['root'])) { //then the ini conf
           $pluginName = $config['root'];
        } else { //finaly the control type
           $pluginName = $this->formType;
        }
        $className = $pluginName . 'FormWidget';
        $this->rootWidget = \jApp::loadPlugin($pluginName, 'formwidget', '.formwidget.php', $className);
        if (!$this->rootWidget)
            throw new \Exception('Unknown root widget plugin '.$pluginName);
    }


    /**
     * set options
     * @param array $options some parameters <ul>
     *      <li>"errDecorator"=>"name of your javascript object for error listener"</li>
     *      <li>"method" => "post" or "get". default is "post"</li>
     *      </ul>
     */
    public function setOptions($options) {
        if (\jApp::config()->tplplugins['defaultJformsErrorDecorator']) {
            $errorDecorator = \jApp::config()->tplplugins['defaultJformsErrorDecorator'];
        }
        else {
            $errorDecorator = $this->jFormsJsVarName.'ErrorDecoratorHtml';
        }
        $this->options = array_merge(
            array(
                'errorDecorator'=>$errorDecorator,
                'method'=>'post'
            ),
            $options);
         if (isset($this->options['plugins'])) {
            $this->pluginsConf = $this->options['plugins'];
            unset($this->options['plugins']);
        }
    }

    public function getjFormsJsVarName() {
        return $this->jFormsJsVarName;
    }

    public function outputAllControls() {

        echo '<table class="jforms-table" border="0">';
        foreach( $this->_form->getRootControls() as $ctrlref=>$ctrl){
            if($ctrl->type == 'submit' || $ctrl->type == 'reset' || $ctrl->type == 'hidden') continue;
            if(!$this->_form->isActivated($ctrlref)) continue;
            if($ctrl->type == 'group') {
                echo '<tr><td colspan="2">';
                $this->outputControl($ctrl);
                echo '</td></tr>';
            }else{
                echo '<tr><th scope="row">';
                $this->outputControlLabel($ctrl);
                echo '</th><td>';
                $this->outputControl($ctrl);
                echo "</td></tr>\n";
            }
        }
        echo '</table> <div class="jforms-submit-buttons">';
        if ( $ctrl = $this->_form->getReset() ) {
            if($this->_form->isActivated($ctrl->ref)) {
                $this->outputControl($ctrl);
                echo ' ';
            }
        }
        foreach( $this->_form->getSubmits() as $ctrlref=>$ctrl){
            if(!$this->_form->isActivated($ctrlref)) continue;
            $this->outputControl($ctrl);
            echo ' ';
        }
        echo "</div>\n";
    }

    public function outputMetaContent($t) {
        $resp= \jApp::coord()->response;
        if($resp === null || $resp->getType() !='html'){
            return;
        }

        $www = \jApp::config()->urlengine['jelixWWWPath'];
        $resp->addJSLink($www.'js/jforms_light.js');
        $resp->addCSSLink($www.'design/jform.css');

        //we loop on root control has they fill call the outputMetaContent recursively
        foreach( $this->_form->getRootControls() as $ctrlref=>$ctrl) {
            if($ctrl->type == 'hidden') continue;
            if(!$this->_form->isActivated($ctrlref)) continue;

            $widget = $this->getWidget($ctrl, $this->rootWidget);
            $widget->outputMetaContent($resp);
        }
    }

    /**
     * output the header content of the form
     */
    public function outputHeader(){

        if (isset($this->options['attributes']))
            $attrs = $this->options['attributes'];
        else
            $attrs = array();

        echo '<form';
        if (preg_match('#^https?://#',$this->_action)) {
            $urlParams = $this->_actionParams;
            $attrs['action'] = $this->_action;
        } else {
            $url = \jUrl::get($this->_action, $this->_actionParams, 2); // returns the corresponding jurl
            $urlParams = $url->params;
            $attrs['action'] = $url->getPath();
        }
        $attrs['method'] = $this->options['method'];
        $attrs['id'] = $this->_name;

        if($this->_form->hasUpload())
            $attrs['enctype'] = "multipart/form-data";

        $this->_outputAttr($attrs);
        echo '>';

        $this->rootWidget->outputHeader($this);

        $hiddens = '';
        foreach ($urlParams as $p_name => $p_value) {
            $hiddens .= '<input type="hidden" name="'. $p_name .'" value="'. htmlspecialchars($p_value). '"'.$this->_endt. "\n";
        }

        foreach ($this->_form->getHiddens() as $ctrl) {
            if(!$this->_form->isActivated($ctrl->ref)) continue;
            $hiddens .= '<input type="hidden" name="'. $ctrl->ref.'" id="'.$this->_name.'_'.$ctrl->ref.'" value="'. htmlspecialchars($this->_form->getData($ctrl->ref)). '"'.$this->_endt. "\n";
        }

        if($this->_form->securityLevel){
            $tok = $this->_form->createNewToken();
            $hiddens .= '<input type="hidden" name="__JFORMS_TOKEN__" value="'.$tok.'"'.$this->_endt. "\n";
        }

        if($hiddens){
            echo '<div class="jforms-hiddens">',$hiddens,'</div>';
        }
        $this->outputErrors();
    }

    protected function outputErrors() {
        $errors = $this->_form->getContainer()->errors;
        if(count($errors)) {
            $ctrls = $this->_form->getControls();
            echo '<ul id="' . $this->_name . '_errors" class="jforms-error-list">';
            foreach ($errors as $cname => $err) {
                if (!$this->_form->isActivated($ctrls[$cname]->ref)) continue;
                if ($err === \jForms::ERRDATA_REQUIRED) {
                    if ($ctrls[$cname]->alertRequired) {
                        echo '<li>', $ctrls[$cname]->alertRequired, '</li>';
                    } else {
                        echo '<li>', \jLocale::get('jelix~formserr.js.err.required', $ctrls[$cname]->label), '</li>';
                    }
                } else if ($err === \jForms::ERRDATA_INVALID) {
                    if ($ctrls[$cname]->alertInvalid) {
                        echo '<li>', $ctrls[$cname]->alertInvalid, '</li>';
                    } else {
                        echo '<li>', \jLocale::get('jelix~formserr.js.err.invalid', $ctrls[$cname]->label), '</li>';
                    }
                } elseif ($err === \jForms::ERRDATA_INVALID_FILE_SIZE) {
                    echo '<li>', \jLocale::get('jelix~formserr.js.err.invalid.file.size', $ctrls[$cname]->label), '</li>';
                } elseif ($err === \jForms::ERRDATA_INVALID_FILE_TYPE) {
                    echo '<li>', \jLocale::get('jelix~formserr.js.err.invalid.file.type', $ctrls[$cname]->label), '</li>';
                } elseif ($err === \jForms::ERRDATA_FILE_UPLOAD_ERROR) {
                    echo '<li>', \jLocale::get('jelix~formserr.js.err.file.upload', $ctrls[$cname]->label), '</li>';
                } elseif ($err != '') {
                    echo '<li>', $err, '</li>';
                }
            }
            echo '</ul>';
        }
    }

    public function outputFooter(){
        $this->rootWidget->outputFooter();
        echo '</form>';
    }

    protected $widgets = array();

    public function getWidget($ctrl, ParentWidgetInterface $parentWidget = null) {
        if (isset($this->widgets[$ctrl->ref])) {
            return $this->widgets[$ctrl->ref];
        }

        // we have to retrieve the plugin name corresponding to the widget

        $config = \jApp::config()->{$this->formConfig};
        // check the builder conf
        if (isset($this->pluginsConf[$ctrl->ref])) {
            $pluginName = $this->pluginsConf[$ctrl->ref];
        }
        // else check the ini conf
        elseif (isset($config[$ctrl->type])) {
            $pluginName = $config[$ctrl->type];
        }
        // else get the plugin name from the control
        else {
            $pluginName = $ctrl->getWidgetType(). '_'. $this->formType;
        }

        // now we have its name, let's create the widget instance
        $className = $pluginName . 'FormWidget';
        $plugin = \jApp::loadPlugin($pluginName, 'formwidget', '.formwidget.php', $className, array($ctrl, $this, $parentWidget));
        if (!$plugin)
            throw new \Exception('Widget '.$pluginName.' not found');
        $this->widgets[$ctrl->ref] = $plugin;
        return $plugin;
    }

    public function outputControlLabel($ctrl, $format='', $editMode=true){
        if($ctrl->type == 'hidden' || $ctrl->type == 'button') return;
        $widget = $this->getWidget($ctrl, $this->rootWidget);
        $widget->outputLabel($format, $editMode);
    }

    public function outputControl($ctrl, $attributes=array()){
        if($ctrl->type == 'hidden') return;
        $widget = $this->getWidget($ctrl, $this->rootWidget);
        $widget->setAttributes($attributes);
        $widget->outputControl();
        $widget->outputHelp();
    }

    public function outputControlValue($ctrl, $attributes=array()){
        if($ctrl->type == 'hidden') return;
        $widget = $this->getWidget($ctrl, $this->rootWidget);
        $widget->setAttributes($attributes);
        $widget->outputControlValue();
    }

    /**
     * @param \jFormsControl $ctrl
     * @throws \Exception
     * @since 1.6.17
     */
    public function outputControlHelp($ctrl) {
        if (!$ctrl->help) {
            return;
        }
        $widget = $this->getWidget($ctrl, $this->rootWidget);
        // additionnal &nbsp, else background icon is not shown in webkit
        echo '<span class="jforms-help" id="'.$widget->getId().'-help">&nbsp;<span>'.htmlspecialchars($ctrl->help).'</span></span>';
    }

    protected function _outputAttr(&$attributes) {
        foreach($attributes as $name=>$val) {
            echo ' '.$name.'="'.htmlspecialchars($val).'"';
        }
    }

    public function escJsStr($str) {
        return '\''.str_replace(array("'","\n"),array("\\'", "\\n"), $str).'\'';
    }
}
