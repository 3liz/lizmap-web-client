<?php

/**
* page for Installation wizard
*
* @package     InstallWizard
* @subpackage  pages
* @author      Laurent Jouanneau
* @copyright   2010-2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

$lib_jelix = __DIR__.'/../../../jelix/';
include $lib_jelix.'/installer/jIInstallReporter.iface.php';
include $lib_jelix.'/installer/jInstallerMessageProvider.class.php';
include $lib_jelix.'/installer/jInstallChecker.class.php';

/**
 * page for a wizard, to check a jelix installation
 */
class checkjelixWizPage extends installWizardPage  implements jIInstallReporter {
    
    protected $tpl;
    protected $messages;

    /**
     * action to display the page
     * @param jTpl $tpl the template container
     */
    function show ($tpl) {
        $this->tpl = $tpl;
        $check = new jInstallCheck($this);
        if (isset($this->config['verbose'])) {
            $check->verbose = (!!$this->config['verbose']);
        }

        if (isset($this->config['databases'])) {
            $db = explode(',', trim($this->config['databases']));
            $check->addDatabaseCheck($db, true);
        }
        if (isset($this->config['pathcheck'])) {
            if(is_string($this->config['pathcheck']))
                $files = explode(',', trim($this->config['pathcheck']));
            else
                $files = $this->config['pathcheck'];
            $check->addWritablePathCheck($files);
        }

        $check->checkForInstallation = true;
        $check->run();

        return ($check->nbError == 0);
    }

    //----- jIInstallReporter implementation

    function start() {}

    function message($message, $type=''){
        $this->messages[] = array($type, $message);
    }
    
    function end($results){
        $this->tpl->assign('messages', $this->messages);
        $this->tpl->assign('nbError', $results['error']);
        $this->tpl->assign('nbWarning', $results['warning']);
        $this->tpl->assign('nbNotice', $results['notice']);
    }
}
