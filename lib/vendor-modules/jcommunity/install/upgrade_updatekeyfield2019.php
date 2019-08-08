<?php
/**
 * @package     jcommunity
 * @author      Laurent Jouanneau
 * @copyright   2018 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

class jcommunityModuleUpgrader_updatekeyfield2019 extends jInstallerModule {

    public $targetVersions = array('1.3.0-beta.1');
    public $date = '2019-07-17 17:00';

    function install() {

        $conf = $this->getAuthConf();

        $dbProfile = $conf->getValue('profile', 'Db');
        $daoSelector = $conf->getValue('dao', 'Db');
        if ($daoSelector == 'jcommunity~user') {
            $this->useDbProfile($dbProfile);
            $this->execSQLScript('sql/upgrade_keys');
        }
    }


    protected function getAuthConf() {
        $authconfig = $this->config->getValue('auth','coordplugins');
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
