<?php
/**
 * @package     jcommunity
 * @author      Laurent Jouanneau
 * @copyright   2018 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

class jcommunityModuleUpgrader_newstatuses extends jInstallerModule {

    public $targetVersions = array('1.2.0rc4');
    public $date = '2018-02-14';

    function install() {

        $conf = $this->getAuthConf();

        $dbProfile = $conf->getValue('profile', 'Db');
        $this->useDbProfile($dbProfile);
        $daoSelector = $conf->getValue('dao', 'Db');
        if ($this->firstDbExec()) {
            $dao = jDao::get($daoSelector);
            $daoProperties = $dao->getProperties();
            if (isset($daoProperties['status'])) {
                $tableProp = $dao->getTables()[$dao->getPrimaryTable()];
                $cn = $this->dbConnection();
                $statusField = $cn->encloseName($daoProperties['status']['fieldName']);

                $sql = "UPDATE ".$cn->prefixTable($tableProp['realname']).
                    " SET ".$statusField." = ".$statusField." - 1".
                    " WHERE ".$statusField." < 0";
                $cn->exec($sql);
            }
        }
    }


    protected function getAuthConf() {
        $authconfig = $this->config->getValue('auth','coordplugins');
        if ($this->isJelix17()) {
            $confPath = jApp::appConfigPath($authconfig);
            $conf = new \Jelix\IniFile\IniModifier($confPath);
        }
        else {
            $confPath = jApp::configPath($authconfig);
            $conf = new jIniFileModifier($confPath);
        }
        return $conf;
    }

    protected function isJelix17() {
        return method_exists('jApp', 'appConfigPath');
    }
}
