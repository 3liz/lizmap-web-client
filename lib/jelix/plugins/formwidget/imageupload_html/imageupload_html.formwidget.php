<?php
/**
 * @package     jelix
 * @subpackage  forms_widget_plugin
 * @author      Laurent Jouanneau
 * @copyright   2020 Laurent Jouanneau
 * @link        https://jelix.org
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */


require_once(__DIR__.'/../upload2_html/upload2_html.formwidget.php');


/**
 * HTML form builder
 * @package     jelix
 * @subpackage  forms_widget_plugin
 * @link http://developer.jelix.org/wiki/rfc/jforms-controls-plugins
 */
class imageupload_htmlFormWidget extends upload2_htmlFormWidget {

    protected $dialogWidth = 1024;
    protected $dialogHeight = 768;

    protected $newImgMaxWidth = 0;
    protected $newImgMaxHeight = 0;

    public function setAttributes($attr) {

        foreach(array('dialogWidth', 'dialogHeight', 'newImgMaxWidth', 'newImgMaxHeight') as $parameter) {
            if (isset($attr[$parameter])) {
                $this->$parameter = $attr[$parameter];
                unset($attr[$parameter]);
            }
        }

        parent::setAttributes($attr);
    }

    public function outputMetaContent($resp) {
        $confUrlEngine = &jApp::config()->urlengine;
        $www = $confUrlEngine['jelixWWWPath'];
        $resp->addJSLink($www.'js/cropper.min.js');
        $resp->addJSLink($www.'js/jforms/choice.js');
        $resp->addJSLink($www.'js/jforms/imageSelector.js');
        $resp->addCSSLink($www.'js/cropper.min.css');
    }

    protected function _outputInputFile($attr, $idChoiceItem = '', $existingFile = '') {
        echo '<div id="'.$attr['id'].'_image_form">';
        if ($existingFile) {
            echo '<button class="jforms-image-modify-btn" type="button" 
            data-current-image="#'.$idChoiceItem. 'keep_item img" 
            data-current-file-name="'.htmlspecialchars(basename($this->ctrl->getOriginalFile())).'">'.jLocale::get('jelix~jforms.upload.picture.choice.modify').'</button>'."\n";
        }
        echo '<button class="jforms-image-select-btn" type="button">'.jLocale::get('jelix~jforms.upload.picture.choice.new.file').'</button>'."\n";
        if ($this->newImgMaxWidth) {
            $attr['data-img-max-width'] = $this->newImgMaxWidth;
        }
        if ($this->newImgMaxHeight) {
            $attr['data-img-max-height'] = $this->newImgMaxHeight;
        }
        echo '<input';
        $this->_outputAttr($attr);
        echo "/>\n";

        $style = 'display:none;';
        if ($this->imgMaxHeight) {
            $style .= 'max-height:'.$this->imgMaxHeight.'px;';
        }
        if ($this->imgMaxWidth) {
            $style .= 'max-width:'.$this->imgMaxWidth.'px;';
        }

        echo '<br/><img class="jforms-image-preview" style="'.$style.'"/>';
        echo '<div class="jforms-image-dialog" style="display: none"
        data-dialog-width="'.$this->dialogWidth.'" data-dialog-height="'.$this->dialogHeight.'"
        data-dialog-title="'.jLocale::get('jelix~jforms.upload.picture.dialog.title').'" 
        data-dialog-ok-label="'.jLocale::get('jelix~ui.buttons.ok').'"
        data-dialog-ok-cancel="'.jLocale::get('jelix~ui.buttons.ok').'">
    <div class="jforms-image-dialog-toolbar">
        <button class="rotateleft" type="button">'.jLocale::get('jelix~jforms.upload.picture.edit.rotateleft').'</button>
        <button class="rotateright" type="button">'.jLocale::get('jelix~jforms.upload.picture.edit.rotateRight').'</button>
        <button class="cropreset" type="button">'.jLocale::get('jelix~jforms.upload.picture.edit.reset').'</button>
    </div>
    <div class="jforms-image-dialog-img-container" style="border:2px solid black;">
        <canvas class="jforms-image-dialog-editor" style="max-width:100%"></canvas>
    </div>
</div></div>';

        $this->parentWidget->addJs("jFormsInitImageControl('".$attr['id']."_image_form');\n");
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
        else {
            $attr['accept'] = "image/png, image/jpeg";
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
        $attr['class'] .= " jforms-image-input";
        $attr['style'] = 'display:none';

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
        $jformsVarName = $this->builder->getjFormsJsVarName();

        if (count($choices) > 1) {
            $idItem = $this->builder->getName() . '_' . $this->ctrl->ref . '_jf_action_';
            $idChoice = $this->builder->getName() . '_' . $this->ctrl->ref;
            $choiceProp = array(
                'jformsName' => $this->builder->getName(),
                'radioName' => $this->ctrl->ref . '_jf_action',
                'itemIdPrefix'=>$idItem,
                'radioIdPrefix'=>$idChoice,
                'readOnly' => $this->ctrl->isReadOnly(),
                'label' => $this->ctrl->label,
                'ref' => $this->ctrl->ref,
                'required' => $this->ctrl->required,
                'currentAction'=>$action,
                'alertRequired' => ($this->ctrl->alertRequired?:\jLocale::get('jelix~formserr.js.err.required', $this->ctrl->label)),
                'alertInvalid' => ($this->ctrl->alertInvalid?:\jLocale::get('jelix~formserr.js.err.invalid', $this->ctrl->label)),
            );

            echo '<ul class="jforms-choice" id="'.$attr['id'].'_choice_list"
                data-jforms-choice-props="'.htmlspecialchars(json_encode($choiceProp)).'"
                >', "\n";

            $attrRadio = ' type="radio" name="' . $this->ctrl->ref . '_jf_action"';

            if ($this->ctrl->isReadOnly()) {
                $attrRadio .= ' readonly';
            }
        }

        if (isset($choices['keep'])) {
            echo '<li id="' . $idItem . 'keep_item">',
                '<label>
                    <input ' . $attrRadio . ' id="' . $idChoice . '_jf_action_keep" value="keep" ' .
                ($action == 'keep' ? 'checked' : '') . '/> ';
            if ($choices['keep'] === '') {
                echo jLocale::get('jelix~jforms.upload.picture.choice.keep.empty').
                    '</label> ';
            }
            else {
                echo jLocale::get('jelix~jforms.upload.choice.keep').
                    '</label> ';
                $this->_outputControlValue($choices['keep'], 'original');
            }
            echo "</li>\n";
        }

        if (isset($choices['keepnew'])) {
            echo '<li id="' . $idItem . 'keepnew_item">',
                '<label>
                    <input ' . $attrRadio . ' id="' . $idChoice . '_jf_action_keepnew" value="keepnew" ' .
                ($action == 'keepnew' ? 'checked' : '') .
                '/> '.
                jLocale::get("jelix~jforms.upload.picture.choice.keepnew").
                '</label> ';
            $this->_outputControlValue($choices['keepnew'], 'new');
            echo "</li>\n";
        }

        if (count($choices) > 1) {
            echo '<li id="' . $idItem . 'new_item">',
                '<label><input ' . $attrRadio . ' id="' . $idChoice . '_jf_action_new" value="new"/> '.
                jLocale::get("jelix~jforms.upload.picture.choice.new").
                '</label> ';
            $this->_outputInputFile($attr, $idItem, $choices['keep']);
            echo "</li>\n";
            $this->parentWidget->addJs('jFormsInitChoiceControl("#'.$attr['id'].'_choice_list", '.$jformsVarName.', function(actionId) { jFormsImageSelectorBtnEnable("#'.$attr['id'].'_choice_list", actionId == "new");});');
        } else {
            echo '<input type="hidden" name="' . $this->ctrl->ref . '_jf_action" value="new" />';
            $this->_outputInputFile($attr);
            $this->parentWidget->addJs('jFormsInitChoiceControlSingleItem("#'.$attr['id'].'", '.$jformsVarName.');');
        }

        if (isset($choices['del'])) {
            echo '<li id="' . $idItem . 'del_item">',
                '<label>
                    <input ' . $attrRadio . '  id="' . $idChoice . '_jf_action_del" value="del" ' .
                ($action == 'del' ? 'checked' : '') . '/> '.
                jLocale::get("jelix~jforms.upload.choice.del").
                '</label>';
            echo "</li>\n";
        }
    }
}
