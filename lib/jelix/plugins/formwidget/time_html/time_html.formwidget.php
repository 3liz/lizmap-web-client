<?php
/**
 *
 * @author      Adrien Lagroy de Croutte
 * @contributor
 * @copyright   2020 Adrien Lagroy de Croutte
 * @see         https://jelix.org
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

/**
 * HTML form builder.
 *
 * @see http://developer.jelix.org/wiki/rfc/jforms-controls-plugins
 */
class time_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase
{

    public function outputMetaContent($resp) {

        $confTime = &jApp::config()->timepickers;
        $datepicker_default_config = jApp::config()->forms['timepicker'];

        if (isset($this->ctrl->timepickerConfig)  && $this->ctrl->timepickerConfig) {
            $config = $this->ctrl->timepickerConfig;
        }
        else {
            $config = $datepicker_default_config;
        }

        if ($config == '') {
            return;
        }

        if (isset($confTime[$config.'.js'])) {
            $js = $confTime[$config.'.js'];
            foreach($js as $file) {
                $file = str_replace('$lang', jLocale::getCurrentLang(), $file);
                $resp->addJSLink($file);
            }
        }
        if (isset($confTime[$config])) {
            $resp->addJSLink($confTime[$config]);
        }

        if (isset($confTime[$config.'.css'])) {
            $css = $confTime[$config.'.css'];
            foreach($css as $file) {
                $resp->addCSSLink($file);
            }
        }
    }


    protected function outputJs()
    {
        $ctrl = $this->ctrl;
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();
        $js = 'c = new '.$jFormsJsVarName."ControlTime2('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        $js .= "c.multiFields = true;\n";
        $minTime = $ctrl->datatype->getFacet('minValue');
        $maxTime = $ctrl->datatype->getFacet('maxValue');
        if ($minTime) {
            $js .= "c.minTime = '".$minTime->toString(jDateTime::DB_TFORMAT)."';\n";
        }
        if ($maxTime) {
            $js .= "c.maxTime = '".$maxTime->toString(jDateTime::DB_TFORMAT)."';\n";
        }
        $this->parentWidget->addJs($js);
        $this->commonJs();

        if ($ctrl instanceof jFormsControlTime || get_class($ctrl->datatype) == 'jDatatypeTime' || get_class($ctrl->datatype) == 'jDatatypeLocaleTime') {
            $config = $ctrl->timepickerConfig != '' ? $ctrl->timepickerConfig : jApp::config()->forms['timepicker'];
            if ($config) {
                $this->parentWidget->addJs('jelix_timepicker_'.$config."(c, jFormsJQ.config);\n");
            }
        }
    }

    public function outputControl()
    {
        $formName = $this->builder->getName();
        $attr = $this->getControlAttributes();
        $value = $this->getValue();

        $attr['id'] = $formName.'_'.$this->ctrl->ref.'_';
        $v = array('hour' => '', 'minutes' => '', 'seconds' => '');
        if (preg_match('#(\d{2})?:(\d{2})?(:(\d{2})?)?(?:$|\\s|\\.)#', $value, $matches)) {
            if (isset($matches[1])) {
                $v['hour'] = $matches[1];
            }
            if (isset($matches[2])) {
                $v['minutes'] = $matches[2];
            }
            if (isset($matches[3])) {
                $v['seconds'] = $matches[4];
            }
        }
        $f = jLocale::get('jelix~format.time');
        for ($i = 0; $i < strlen($f); ++$i) {
            if ($f[$i] == 'H') {
                $this->_outputTimeControlHour($this->ctrl, $attr, $v['hour']);
            } elseif ($f[$i] == 'i') {
                $this->_outputTimeControlMinutes($this->ctrl, $attr, $v['minutes']);
            } elseif ($f[$i] == 's') {
                $this->_outputTimeControlSeconds($this->ctrl, $attr, $v['seconds']);
            } else {
                echo ' ';
            }
        }
        echo "\n";
        $this->outputJs();
    }

    protected function _outputTimeControlHour($ctrl, $attr, $value)
    {
        $attr['name'] = $ctrl->ref.'[hour]';
        $attr['id'] .= 'hour';
        if (jApp::config()->forms['controls.time.input'] == 'textboxes') {
            $attr['value'] = $value;
            echo '<input type="text" size="2" maxlength="2"';
            $this->_outputAttr($attr);
            echo $this->_endt;
        } else {
            echo '<select';
            $this->_outputAttr($attr);
            echo '><option value="">'.htmlspecialchars(jLocale::get('jelix~jforms.time.hour.label')).'</option>';
            for ($i = 0; $i < 24; ++$i) {
                $k = ($i < 10) ? '0'.$i : $i;
                echo '<option value="'.$k.'"'.((string) $k === $value ? ' selected="selected"' : '').'>'.$k.'</option>';
            }
            echo '</select>';
        }
    }

    protected function _outputTimeControlMinutes($ctrl, $attr, $value)
    {
        $attr['name'] = $ctrl->ref.'[minutes]';
        $attr['id'] .= 'minutes';
        if (jApp::config()->forms['controls.time.input'] == 'textboxes') {
            $attr['value'] = $value;
            echo '<input type="text" size="2" maxlength="2"';
            $this->_outputAttr($attr);
            echo $this->_endt;
        } else {
            echo '<select';
            $this->_outputAttr($attr);
            echo '><option value="">'.htmlspecialchars(jLocale::get('jelix~jforms.time.minutes.label')).'</option>';
            for ($i = 0; $i < 60; ++$i) {
                $k = ($i < 10) ? '0'.$i : $i;
                echo '<option value="'.$k.'"'.((string) $k === $value ? ' selected="selected"' : '').'>'.$k.'</option>';
            }
            echo '</select>';
        }
    }

    protected function _outputTimeControlSeconds($ctrl, $attr, $value)
    {
        $attr['name'] = $ctrl->ref.'[seconds]';
        $attr['id'] .= 'seconds';
        if (!$ctrl->enableSeconds) {
            echo '<input type="hidden" id="'.$attr['id'].'" name="'.$attr['name'].'" value="'.$value.'"/>';
        } elseif (jApp::config()->forms['controls.time.input'] == 'textboxes') {
            $attr['value'] = $value;
            echo '<input type="text"size="2" maxlength="2"';
            $this->_outputAttr($attr);
            echo $this->_endt;
        } else {
            echo '<select';
            $this->_outputAttr($attr);
            echo '><option value="">'.htmlspecialchars(jLocale::get('jelix~jforms.time.seconds.label')).'</option>';
            for ($i = 0; $i < 60; ++$i) {
                $k = ($i < 10) ? '0'.$i : $i;
                echo '<option value="'.$k.'"'.((string) $k === $value ? ' selected="selected"' : '').'>'.$k.'</option>';
            }
            echo '</select>';
        }
    }
}
