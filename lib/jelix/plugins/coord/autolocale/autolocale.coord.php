<?php
/**
* @package    jelix
* @subpackage coord_plugin
* @author   Laurent Jouanneau
* @copyright 2006-2012 Laurent Jouanneau
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * plugin for language auto detection
 * @package    jelix
 * @subpackage coord_plugin
 */
class AutoLocaleCoordPlugin implements jICoordPlugin {

    public $config;

    /**
    * @param    array  $config  list of configuration parameters
    */
    public function __construct($config){
        $this->config = $config;
    }

    /**
     * @param    array  $params   plugin parameters for the current action
     * @return null or jSelectorAct  if action should change
     */
    public function beforeAction($params){

        $langDetected = false;
        $lang = '';

        if ($this->config['enableUrlDetection']) {
            $l = jApp::coord()->request->getParam($this->config['urlParamNameLanguage']);
            if ($l !== null) {
                $lang = jLocale::getCorrespondingLocale($l);
                if ($lang != '')
                    $langDetected = true;
            }
        }

        if (!$langDetected) {
            if (isset($_SESSION['JX_LANG'])) {
                $lang = $_SESSION['JX_LANG'];
            }
            else if ($this->config['useDefaultLanguageBrowser']) {
                $lang = jLocale::getPreferedLocaleFromRequest();
            }
        }

        if ($lang != '') {
            $_SESSION['JX_LANG'] = $lang;
            jApp::config()->locale = $lang;
        }
        return null;
    }

    /**
     *
     */
    public function beforeOutput() {}

    public function afterProcess() {}

}
