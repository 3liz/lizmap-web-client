<?php
/**
 * @package     jcommunity
 * @author      Laurent Jouanneau
 * @copyright   2017 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

class jcommunityModuleUpgrader_changepersistantkey extends jInstallerModule {

    public $targetVersions = array('1.2.0a1');
    public $date = '2017-11-29 15:50';

    protected static $key = null;

    function install() {

        if (self::$key === null) {
            self::$key = jAuth::getRandomPassword(30, true);
        }

        $conf = $this->config->getValue('auth', 'coordplugins');
        if ($conf != '1'&& $conf != '') {
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
