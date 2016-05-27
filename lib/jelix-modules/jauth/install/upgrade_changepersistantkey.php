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
    public $date = '2016-05-20 23:55';

    protected static $key = null;

    function install() {

        if (self::$key === null) {
            self::$key = jAuth::getRandomPassword(30, true);
        }
        $conf = $this->config->getValue('auth', 'coordplugins');
        if ($conf == '1') {
            $key = $this->config->getValue('persistant_crypt_key', 'coordplugin_auth');
            if ($key === 'exampleOfCryptKey' || $key == '') {
                $this->config->setValue('persistant_crypt_key', self::$key, 'coordplugin_auth');
            }
        }
        else if ($conf) {
            $conff = jApp::configPath($conf);
            if (file_exists($conff)) {
                $ini = new jIniFileModifier($conff);
                $key = $ini->getValue('persistant_crypt_key');
                if ($key === 'exampleOfCryptKey' || $key == '') {
                    $ini->setValue('persistant_crypt_key', self::$key);
                    $ini->save();
                }
            }
        }
    }
}
