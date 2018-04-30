<?php

/**
* @package     jcommunity
* @author      Laurent Jouanneau
* @copyright   2015 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jcommunityModuleUpgrader_useprefandconf extends jInstallerModule {

    public $targetVersions = array('1.1b1');
    public $date = '2015-06-24 09:51';

    function install() {
        if ($this->getParameter('masteradmin')) {
            $this->config->setValue('loginResponse', 'htmlauth', 'jcommunity');
        }

        if ($this->firstExec('preferences') && $this->getParameter('usejpref')) {
            if ($this->firstExec('acl2') && class_exists('jAcl2DbManager')) {
                jAcl2DbManager::addSubjectGroup('jcommunity.admin', 'jcommunity~prefs.admin.jcommunity');
                jAcl2DbManager::addSubject('jcommunity.prefs.change', 'jcommunity~prefs.admin.prefs.change', 'jprefs.prefs.management');
                jAcl2DbManager::addRight('admins', 'jcommunity.prefs.change'); // for admin group
            }
            $prefIni = new jIniFileModifier(__DIR__.'/prefs.ini');
            $prefFile = jApp::configPath('preferences.ini.php');
            if (file_exists($prefFile)) {
                $mainPref = new jIniFileModifier($prefFile);
                //import this way to not erase changed value.
                $prefIni->import($mainPref);
            }
            $prefIni->saveAs($prefFile);
        }
    }
}
