<?php
/**
* @package     jelix
* @subpackage  jauth module
* @author      Laurent Jouanneau
* @copyright   2016 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jauthModuleUpgrader_changepersistantkey extends jInstallerModule {

    public $targetVersions = array('1.3.0');
    public $date = '2016-05-21 23:55';

    protected static $key = null;

    function install() {

        if (self::$key === null) {
            self::$key = jAuth::getRandomPassword(30, true);
        }

        $conf = $this->config->getValue('auth', 'coordplugins');
        if ($conf != '1') {
            $conff = jApp::configPath($conf);
            if (file_exists($conff)) {
                $ini = new jIniFileModifier($conff);
                $ini->removeValue('persistant_crypt_key');
                $ini->save();
            }
        }

        $localConfigIni = $this->entryPoint->localConfigIni;
        $localConfigIni->getMaster()->setValue('persistant_crypt_key', self::$key, 'coordplugin_auth');
    }
}
