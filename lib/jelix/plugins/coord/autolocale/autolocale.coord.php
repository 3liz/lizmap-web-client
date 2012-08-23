<?php
/**
* @package    jelix
* @subpackage coord_plugin
* @author   Laurent Jouanneau
* @copyright 2006-2007 Laurent Jouanneau
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

        global $gJCoord, $gJConfig;

        $langDetected=false;
        $lang='';

        $availableLang = explode(',',$this->config['availableLanguageCode']);

        if($this->config['enableUrlDetection']){
            $l = $gJCoord->request->getParam($this->config['urlParamNameLanguage']);
            if($l !==null){
                if(strpos('_',$l) ===false){
                    $lg = strtolower($l).'_'.strtoupper($l);
                    if(in_array($lg, $availableLang)){
                        $langDetected=true;
                        $lang=$lg;
                    }else{
                        foreach($availableLang as $alang){
                            if(strpos($alang, $l) === 0){
                                $lang = $alang;
                                $langDetected=true;
                                break;
                            }
                        }
                    }
                }elseif(in_array($l, $availableLang)){
                    $langDetected=true;
                    $lang=$l;
                }
            }
        }

        if(!$langDetected){
            if(isset($_SESSION['JX_LANG'])){
                $lang=$_SESSION['JX_LANG'];
            }else if($this->config['useDefaultLanguageBrowser'] && isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])){
                $languages = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
                foreach($languages as $bl){
                    // pour les user-agents qui livrent un code internationnal
                    if(preg_match("/^([a-zA-Z]{2})(?:[-_]([a-zA-Z]{2}))?(;q=[0-9]\\.[0-9])?$/",$bl,$match)){
                        $match[1] = strtolower($match[1]);
                        if(isset($match[2]))
                            $l=$match[1].'_'.strtoupper($match[2]);
                        else
                            $l=$match[1].'_'.strtoupper($match[1]);
                        if(in_array($l, $availableLang)){
                            $lang= $l;
                            break;
                        }else{
                            // try to find a similary supported language
                            foreach($availableLang as $alang){
                                if(strpos($alang, $match[1]) === 0){
                                    $lang = $alang;
                                    break;
                                }
                            }
                            if($lang !='')
                                break;
                        }
                    }
                }
            }
        }

        if($lang!=''){
            $_SESSION['JX_LANG']=$lang;
            $gJConfig->locale = $lang;
        }
        return null;
    }

    /**
     *
     */
    public function beforeOutput() {}

    public function afterProcess() {}

}
