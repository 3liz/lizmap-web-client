<?php
/**
 * @package     jelix
 * @subpackage  forms_widget_plugin
 * @author      Claudio Bernardes
 * @contributor Laurent Jouanneau, Julien Issler, Dominique Papin
 * @copyright   2012 Claudio Bernardes
 * @copyright   2006-2018 Laurent Jouanneau, 2008-2011 Julien Issler, 2008 Dominique Papin
 * @link        http://www.jelix.org
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  forms_widget_plugin
 * @link http://developer.jelix.org/wiki/rfc/jforms-controls-plugins
 */

/**
 * Widget to display the selection of a file to upload
 *
 * For images upload, some attributes can be set to indicate
 * the url of the image. The url can be forged from a selector or from a base URI.
 * From a selector : action, parameters, and the parameter name that will
 * contain the filename, should be given in attributes  uriAction, uriActionParameters, uriActionFileParameter
 * From a base URI : a baseURI attribute should be given, with the URL on which
 * the filename will be append.
 */
class upload2_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase
    implements \jelix\forms\HtmlWidget\ParentWidgetInterface
{
    /**
     * @var string the jUrl action selector used to get the URL of the image
     */
    protected $uriAction = '';

    /**
     * @var array parameters for the jUrl object used to get the URL of the image
     */
    protected $uriActionParameters = array();

    /**
     * @var string parameter name containing the control value, for the jUrl object used to get the URL of the image
     */
    protected $uriActionFileParameter = '';

    /**
     * @var string base URI of the image
     */
    protected $baseURI = '';

    protected $imgMaxWidth = 0;

    protected $imgMaxHeight = 0;

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

    public function setAttributes($attr) {

        foreach(array('uriAction', 'uriActionParameters', 'uriActionFileParameter',
                    'baseURI', 'imgMaxWidth', 'imgMaxHeight') as $parameter) {
            if (isset($attr[$parameter])) {
                $this->$parameter = $attr[$parameter];
                unset($attr[$parameter]);
            }
        }

        parent::setAttributes($attr);
    }

    protected function jsChoiceInternal() {
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        $this->parentWidget->addJs("c = new ".$jFormsJsVarName."ControlChoice('".$this->ctrl->ref."_jf_action', ".$this->escJsStr($this->ctrl->label).");\n");
        if ($this->ctrl->isReadOnly()) {
            $this->parentWidget->addJs("c.readOnly = true;\n");
        }
        $this->parentWidget->addJs("c.required = true;\n");
        $this->parentWidget->addJs($jFormsJsVarName.".tForm.addControl(c);\n");
        $this->parentWidget->addJs("c2 = c;\n");
    }

    protected function outputJs() {
        $ctrl = $this->ctrl;
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        $this->parentWidget->addJs("c = new ".$jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n");
        $this->commonJs();
    }

    function outputControl()
    {
        $attr = $this->getControlAttributes();

        /*if($this->ctrl->maxsize){
            echo '<input type="hidden" name="MAX_FILE_SIZE" value="',$this->ctrl->maxsize,'"','/>';
        }*/
        $attr['type'] = 'file';
        $attr['value'] = '';
        if (property_exists($this->ctrl, 'accept') && $this->ctrl->accept != '') {
            $attr['accept'] = $this->ctrl->accept;
        }
        if (property_exists($this->ctrl, 'capture') && $this->ctrl->capture) {
            if (is_bool($this->ctrl->capture)) {
                if ($this->ctrl->capture) {
                    $attr['capture'] = 'true';
                }
            } else {
                $attr['capture'] = $this->ctrl->capture;
            }
        }

        $required = $this->ctrl->required;

        $container = $this->builder->getForm()->getContainer()->privateData[$this->ctrl->ref];
        $originalFile = $container['originalfile'];
        $newFile = $container['newfile'];
        $choices = array();

        $action = 'new';

        if ($originalFile) {
            $choices['keep'] = $originalFile;
            $action = 'keep';
        } else {
            if (!$required) {
                $choices['keep'] = '';
                $action = 'keep';
            }
        }

        if ($newFile) {
            $choices['keepnew'] = $newFile;
            $action = 'keepnew';
        }

        $choices['new'] = true;

        if (!$this->ctrl->isReadOnly()) {
            if (!$required && $originalFile) {
                $choices['del'] = true;
            }
        }

        if (count($choices) > 1) {
            echo '<ul class="jforms-choice" >', "\n";
            $idItem = $this->builder->getName() . '_' . $this->ctrl->ref . '_jf_action_';
            $idChoice = $this->builder->getName() . '_' . $this->ctrl->ref;
            $jFormsJsVarName = $this->builder->getjFormsJsVarName();
            $attrRadio = ' type="radio" name="' . $this->ctrl->ref . '_jf_action"' .
                ' onclick="' . $jFormsJsVarName . '.getForm(\'' . $this->builder->getName() .
                '\').getControl(\'' . $this->ctrl->ref . '_jf_action\').activate(\'';
            $attrRadioSuffix = '\')"';

            if ($this->ctrl->isReadOnly()) {
                $attrRadio .= ' readonly';
            }
            $this->jsChoiceInternal();
        } else {
            $this->outputJs();
        }

        if (isset($choices['keep'])) {
            echo '<li id="' . $idItem . 'keep_item">',
                '<label>
                    <input ' . $attrRadio . 'keep' . $attrRadioSuffix . '  id="' . $idChoice . '_jf_action_keep" value="keep" ' .
                ($action == 'keep' ? 'checked' : '') . '/> ';
            if ($choices['keep'] === '') {
                echo jLocale::get('jelix~jforms.upload.choice.keep.empty').
                    '</label> ';
            }
            else {
                echo jLocale::get('jelix~jforms.upload.choice.keep').
                    '</label> ';
                $this->_outputControlValue($choices['keep'], 'original');
            }
            echo "</li>\n";
            $this->parentWidget->addJs("c2.items['keep']=[];\n");
        }

        if (isset($choices['keepnew'])) {
            echo '<li id="' . $idItem . 'keepnew_item">',
                '<label>
                    <input ' . $attrRadio . 'keepnew' . $attrRadioSuffix . ' id="' . $idChoice . '_jf_action_keepnew" value="keepnew" ' .
                ($action == 'keepnew' ? 'checked' : '') .
                '/> '.
                jLocale::get("jelix~jforms.upload.choice.keepnew").
                '</label> ';
            $this->_outputControlValue($choices['keepnew'], 'new');
            echo "</li>\n";
            $this->parentWidget->addJs("c2.items['keepnew']=[];\n");
        }

        if (count($choices) > 1) {
            echo '<li id="' . $idItem . 'new_item">',
                '<label><input ' . $attrRadio . 'new' . $attrRadioSuffix . '  id="' . $idChoice . '_jf_action_new" value="new"/> '.
                jLocale::get("jelix~jforms.upload.choice.new").
                '</label> ';
            echo '<input';
            $this->_outputAttr($attr);
            echo "/>",
            "</li>\n";
            $this->parentWidget->addJs("c = new " . $jFormsJsVarName . "ControlString('" . $this->ctrl->ref . "', " . $this->escJsStr($this->ctrl->label) . ");\n");
            $this->parentWidget->addJs($this->commonGetJsConstraints());
            $this->parentWidget->addJs("c2.addControl(c, 'new');\n");
        } else {
            echo '<input type="hidden" name="' . $this->ctrl->ref . '_jf_action" value="new" />';
            echo '<input';
            $this->_outputAttr($attr);
            echo "/>";
        }

        if (isset($choices['del'])) {
            echo '<li id="' . $idItem . 'del_item">',
                '<label>
                    <input ' . $attrRadio . 'del' . $attrRadioSuffix . '  id="' . $idChoice . '_jf_action_del" value="del" ' .
                ($action == 'del' ? 'checked' : '') . '/> '.
                jLocale::get("jelix~jforms.upload.choice.del").
                '</label>';
            echo "</li>\n";
            $this->parentWidget->addJs("c2.items['del']=[];\n");
        }

        if (count($choices) > 1) {
            $this->parentWidget->addJs("c2.activate('" . $action . "');\n");
        }
    }

    public function outputControlValue(){
        $value = $this->getValue();
        $this->_outputControlValue($value);
    }


    protected function _outputControlValue($fileName, $suffixId = ''){
        $value = $this->ctrl->getDisplayValue($fileName);
        $attr = $this->getValueAttributes();
        if ($suffixId) {
            $attr['id'] .= $suffixId;
        }
        echo '<span ';
        $this->_outputAttr($attr);
        echo '>';
        $mimeType = jFile::getMimeTypeFromFilename($value);
        if ($suffixId != 'new' && strpos($mimeType, 'image/') === 0 &&
            ($this->uriAction || $this->baseURI)
        ) {
            if ($this->baseURI) {
                $url = $this->baseURI.$value;
            }
            else {
                $params = $this->uriActionParameters;
                if ($this->uriActionFileParameter) {
                    $params[$this->uriActionFileParameter] = $value;
                }
                $url = jUrl::get($this->uriAction, $params);
            }
            $style = '';
            if ($this->imgMaxHeight) {
                $style .= 'max-height:'.$this->imgMaxHeight.'px;';
            }
            if ($this->imgMaxWidth) {
                $style .= 'max-width:'.$this->imgMaxWidth.'px;';
            }
            echo '<a href="'.$url.'"><img src="'.$url.'" alt="'.$value.($style?'" style="'.$style.'"':'"').' /></a>';
        }
        else {
            echo htmlspecialchars($value);
        }
        echo '</span>';
    }
}
