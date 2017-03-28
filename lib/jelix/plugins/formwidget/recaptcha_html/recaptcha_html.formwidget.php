<?php
/**
* @package     jelix
* @subpackage  formwidgets
* @author      Laurent Jouanneau
* @copyright   2017 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * jForms widget that shows reCaptcha
 *
 * in the configuration, sets:
 *
 * ```
 * [forms]
 * captcha.recaptcha.validator = \jelix\forms\Captcha\ReCaptchaValidator
 * captcha.recaptcha.widgettype = recaptcha
 *
 * [recaptcha]
 * ;see https://developers.google.com/recaptcha/docs/display to know the meaning
 * ; of these configuration parameters.
 * theme=..
 * type=..
 * size=..
 * tabindex=..
 * ```
 *
 * in the localconfig.ini.php, set the site key and the secret (see your google recpatcha account to retrieve them)
 *
 * ```
 * [recaptcha]
 * sitekey= your recaptcha key
 * secret= your secret value
 * ```
 *
 * then indicate to use recaptcha, in the <captcha> element or in the configuration
 *
 * ```
 * <captcha validator="recaptcha"/>
 * ```
 *
 * ```
 * [forms]
 * captcha=recpatcha
 * ```
 *
 *
 * @package     jelix
 * @subpackage  jelix-plugins
 */
class recaptcha_htmlFormWidget extends  \jelix\forms\HtmlWidget\WidgetBase {
    public function outputMetaContent($resp) {
        $resp->addJSLink("https://www.google.com/recaptcha/api.js", array("async"=>"async", "defer"=>"defer"));
    }

    protected function outputJs() {
    }

    function outputControl() {
        $attr = $this->getControlAttributes();
        $config = jApp::config()->recaptcha;
        unset($attr['readonly']);

        if (isset($attr['class'])) {
            $attr['class'] .= ' g-recaptcha';
        }
        else {
            $attr['class'] = 'g-recaptcha';
        }
        if (isset($config['sitekey']) && $config['sitekey'] != '') {
            $attr['data-sitekey']= $config['sitekey'];
        }
        else {
            jLog::log("sitekey for recaptcha is missing from the configuration", "warning");
        }

        foreach(array('theme', 'type', 'size', 'tabindex') as $param) {
            if ((!isset($attr['data-'.$param]) || $attr['data-'.$param] == '') &&
                isset($config[$param]) && $config[$param] != '') {
                $attr['data-'.$param] = $config[$param];
            }
        }

        echo '<div ';
        $this->_outputAttr($attr);
        echo "></div>\n";
        $this->outputJs();
    }
}
