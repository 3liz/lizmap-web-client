<?php

use jelix\forms\Builder\HtmlBuilder;

/**
 * @author    3liz
 * @copyright 2014-2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license  Mozilla Public License : http://www.mozilla.org/MPL/
 */
class htmlbootstrapFormBuilder extends HtmlBuilder
{
    protected $formType = 'htmlbootstrap';

    protected $jFormsJsVarName = 'jFormsJQ';

    protected $htmlFormAttributes = array('class' => 'form-horizontal');

    protected $defaultPluginsConf = array();

    protected $htmlWidgetsAttributes = array(
        'submit' => array('class' => 'btn'),
        'reset' => array('class' => 'btn'),
        'choice' => array('class' => 'form-inline', 'itemLabelClass' => 'radio'),
    );

    public function outputMetaContent($t)
    {
        /** @var jResponseHtml $resp */
        $resp = jApp::coord()->response;
        if ($resp === null || $resp->getType() != 'html') {
            return;
        }

        $confUrlEngine = &jApp::config()->urlengine;
        $www = $confUrlEngine['jelixWWWPath'];

        $resp->addAssets('jforms_html');
        $resp->addJSLink($www.'jquery/include/jquery.include.js', array('defer' => ''));
        $resp->addAssets('jforms_imageupload');

        // we loop on root control has they fill call the outputMetaContent recursively
        foreach ($this->_form->getRootControls() as $ctrlref => $ctrl) {
            if ($ctrl->type == 'hidden') {
                continue;
            }
            if (!$this->_form->isActivated($ctrlref)) {
                continue;
            }

            $widget = $this->getWidget($ctrl, $this->rootWidget);
            $widget->outputMetaContent($resp);
        }
    }

    public function outputAllControls()
    {
        $modal = $this->getOption('local');
        echo '<div class="jforms-table">';
        foreach ($this->_form->getRootControls() as $ctrlref => $ctrl) {
            if ($ctrl->type == 'submit' || $ctrl->type == 'reset' || $ctrl->type == 'hidden') {
                continue;
            }
            if (!$this->_form->isActivated($ctrlref)) {
                continue;
            }
            echo '<div class="control-group">';
            if ($ctrl->type == 'group') {
                $this->outputControl($ctrl);
            } else {
                $this->outputControlLabel($ctrl);
                echo '<div class="controls">';
                $this->outputControl($ctrl);
                echo "</div>\n";
            }
            echo "</div>\n";
        }
        echo "</div>\n";

        if ($modal) {
            echo "</div>\n".'<div class="modal-footer"><div class="jforms-submit-buttons">';
        } else {
            echo '<div class="jforms-submit-buttons form-actions">';
        }
        if ($ctrl = $this->_form->getReset()) {
            if ($this->_form->isActivated($ctrl->ref)) {
                $this->outputControl($ctrl);
                echo ' ';
            }
        }
        foreach ($this->_form->getSubmits() as $ctrlref => $ctrl) {
            if (!$this->_form->isActivated($ctrlref)) {
                continue;
            }
            $this->outputControl($ctrl);
            echo ' ';
        }
        if ($this->getOption('cancel')) {
            if (isset($this->options['cancelLocale'])) {
                echo '<button class="btn" data-dismiss="modal" aria-hidden="true">', jLocale::get($this->options['cancelLocale']), '</button>';
            } else {
                echo '<button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>';
            }
        }
        echo "</div>\n";
        if ($modal) {
            echo "</div>\n";
        }
    }

    protected function outputErrors()
    {
        $errors = $this->_form->getContainer()->errors;
        if (count($errors)) {
            $ctrls = $this->_form->getControls();
            echo '<div id="'.$this->_name.'_errors" class="alert alert-danger jforms-error-list">';
            foreach ($errors as $cname => $err) {
                if (!array_key_exists($cname, $ctrls) || !$this->_form->isActivated($ctrls[$cname]->ref)) {
                    continue;
                }
                if ($err === jForms::ERRDATA_REQUIRED) {
                    if ($ctrls[$cname]->alertRequired) {
                        echo '<p>', $ctrls[$cname]->alertRequired,'</p>';
                    } else {
                        echo '<p>', jLocale::get('jelix~formserr.js.err.required', $ctrls[$cname]->label),'</p>';
                    }
                } elseif ($err === jForms::ERRDATA_INVALID) {
                    if ($ctrls[$cname]->alertInvalid) {
                        echo '<p>', $ctrls[$cname]->alertInvalid,'</p>';
                    } else {
                        echo '<p>', jLocale::get('jelix~formserr.js.err.invalid', $ctrls[$cname]->label),'</p>';
                    }
                } elseif ($err === jForms::ERRDATA_INVALID_FILE_SIZE) {
                    echo '<p>', jLocale::get('jelix~formserr.js.err.invalid.file.size', $ctrls[$cname]->label),'</p>';
                } elseif ($err === jForms::ERRDATA_INVALID_FILE_TYPE) {
                    echo '<p>', jLocale::get('jelix~formserr.js.err.invalid.file.type', $ctrls[$cname]->label),'</p>';
                } elseif ($err === jForms::ERRDATA_FILE_UPLOAD_ERROR) {
                    echo '<p>', jLocale::get('jelix~formserr.js.err.file.upload', $ctrls[$cname]->label),'</p>';
                } elseif ($err != '') {
                    echo '<p>', $err,'</p>';
                }
            }
            echo '</div>';
        }
    }

    /**
     * @param jFormsControl $ctrl
     * @param string        $format
     * @param bool          $editMode
     */
    public function outputControlLabel($ctrl, $format = '', $editMode = true)
    {
        if ($ctrl->type == 'hidden' || $ctrl->type == 'button') {
            return;
        }
        if ($ctrl->type == 'checkbox'
            && $ctrl->valueLabelOnCheck === ''
            && $ctrl->valueLabelOnUncheck === '') {
            return;
        }
        $widget = $this->getWidget($ctrl, $this->rootWidget);
        $widget->setLabelAttributes(array('class' => 'control-label'));
        $widget->outputLabel($format, $editMode);
    }
}
