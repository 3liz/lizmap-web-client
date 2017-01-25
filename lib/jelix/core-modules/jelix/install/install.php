<?php
/**
* @package     jelix
* @subpackage  jelix module
* @author      Laurent Jouanneau
* @copyright   2009 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jelixModuleInstaller extends jInstallerModule {

    function install() {

        if (!$this->firstDbExec())
            return;

        // ---  install table for session storage if needed
        $sessionStorage = $this->config->getValue("storage", "sessions");
        $sessionDao = $this->config->getValue("dao_selector", "sessions");
        //$sessionProfile = $this->config->getValue("dao_db_profile", "sessions");

        if ($sessionStorage == "dao" &&
            $sessionDao == "jelix~jsession" /*&&
            $sessionProfile == $this->dbProfile*/) {
            $this->execSQLScript('sql/install_jsession.schema');
        }

        // --- install table for jCache if needed
        $cachefile = jApp::configPath('profiles.ini.php');

        if (file_exists($cachefile)) {
            $ini = new jIniFileModifier($cachefile);

            foreach ($ini->getSectionList() as $section) {
                if (substr($section,0,7) != 'jcache:')
                    continue;
                $driver = $ini->getValue('driver', $section);
                $dao = $ini->getValue('dao', $section);
                $this->useDbProfile($ini->getValue('dbprofile', $section));

                if ($driver == 'db' &&
                    $dao == 'jelix~jcache' &&
                    $this->firstExec('cachedb:'.$this->dbProfile)) {
                        $this->execSQLScript('sql/install_jcache.schema');
                }
            }
        }
    }
}