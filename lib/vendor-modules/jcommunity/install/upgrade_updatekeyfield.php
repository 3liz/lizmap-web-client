<?php
/**
 * @package     jcommunity
 * @author      Laurent Jouanneau
 * @copyright   2018 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

class jcommunityModuleUpgrader_updatekeyfield extends jInstallerModule {

    public $targetVersions = array('1.2.0a2');
    public $date = '2018-01-08 10:00';

    function install() {

        $conf = $this->getAuthConf();
        if ($conf) {
            $dbProfile = $conf->getValue('profile', 'Db');
            $daoSelector = $conf->getValue('dao', 'Db');
            $mapper = new jDaoDbMapper($dbProfile);
            $mapper->createTableFromDao($daoSelector);
        }
    }


    protected function getAuthConf() {
        $authconfig = $this->config->getValue('auth','coordplugins');
        if ($authconfig == '') {
            return null;
        }
        if ($this->isJelix17()) {
            $confPath = jApp::appSystemPath($authconfig);
            $conf = new \Jelix\IniFile\IniModifier($confPath);
        }
        else {
            $confPath = jApp::configPath($authconfig);
            $conf = new jIniFileModifier($confPath);
        }
        return $conf;
    }

    protected function isJelix17() {
        return method_exists('jApp', 'appSystemPath');
    }
}
