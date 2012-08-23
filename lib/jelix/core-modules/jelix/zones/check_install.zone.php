<?php
/**
* @package    jelix-modules
* @subpackage jelix
* @author     Bastien Jaillot
* @contributor Laurent Jouanneau, Julien Issler
* @copyright  2008 Bastien Jaillot
* @copyright  2009 Julien Issler
* @licence    http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

include (JELIX_LIB_PATH.'installer/jInstallChecker.class.php');
include (JELIX_LIB_PATH.'installer/jIInstallReporter.iface.php');

/**
 * an HTML reporter for jInstallChecker
 * @package jelix
 */
class checkZoneInstallReporter implements jIInstallReporter {
    public $trace = '';
    public $messageProvider = null;
    protected $list='';
    function start(){
    }
    function message($message, $type=''){
        if ($type == 'error' || $type == 'warning' || $type == 'notice')
            $this->list .= '<li class="'.$type.'">'.htmlspecialchars($message).'</li>';
    }

    function end($results){
        if($this->list !='')
            $this->trace = '<ul class="checkresults">'.$this->list.'</ul>';

        $nbError = $results['error'];
        $nbWarning = $results['warning'];
        $nbNotice = $results['notice'];

        $this->trace .= '<div class="results">';
        if($nbError){
            $this->trace .= ' '.$nbError. $this->messageProvider->get( ($nbError > 1?'number.errors':'number.error'));
        }
        if($nbWarning){
            $this->trace .= ' '.$nbWarning. $this->messageProvider->get(($nbWarning > 1?'number.warnings':'number.warning'));
        }
        if($nbNotice){
            $this->trace .= ' '.$nbNotice. $this->messageProvider->get(($nbNotice > 1?'number.notices':'number.notice'));
        }

        if($nbError){
           $this->trace .= '<p>'.$this->messageProvider->get(($nbError > 1?'conclusion.errors':'conclusion.error')).'</p>';
        }else  if($nbWarning){
            $this->trace .= '<p>'.$this->messageProvider->get(($nbWarning > 1?'conclusion.warnings':'conclusion.warning')).'</p>';
        }else  if($nbNotice){
            $this->trace .= '<p>'.$this->messageProvider->get(($nbNotice > 1?'conclusion.notices':'conclusion.notice')).'</p>';
        }else{
            $this->trace .= '<p>'.$this->messageProvider->get('conclusion.ok').'</p>';
        }
        $this->trace .= "</div>";
    }
}

/**
 * a zone to display a default start page with results of the installation check
 * @package jelix
 */
class check_installZone extends jZone {

    protected $_tplname='check_install';

    protected function _prepareTpl() {
        $lang = $GLOBALS['gJConfig']->locale;
        if(!$this->getParam('no_lang_check')) {
            $languages = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
            foreach($languages as $bl){
                if(preg_match("/^([a-zA-Z]{2})(?:[-_]([a-zA-Z]{2}))?(;q=[0-9]\\.[0-9])?$/",$bl,$match)){
                    if(isset($match[2]))
                        $lang = strtolower($match[1]).'_'.strtoupper($match[2]);
                    else
                        $lang = strtolower($match[1]).'_'.strtoupper($match[1]);
                    break;
                }
            }
            if($lang!='fr_FR' && $lang != 'en_EN' && $lang != 'en_US')
                $lang = 'en_EN';
            $GLOBALS['gJConfig']->locale = $lang;
        }

        $reporter = new checkZoneInstallReporter();
        $check = new jInstallCheck($reporter, $lang);
        $reporter->messageProvider = $check->messages;
        $check->run();

        $this->_tpl->assign('wwwpath', jApp::wwwPath());
        $this->_tpl->assign('configpath', jApp::configPath());
        $this->_tpl->assign('check',$reporter->trace);
   }
}
