<?php
/**
* @package     jelix
* @subpackage  jauth module
* @author      Laurent Jouanneau
* @contributor Julien Issler
* @copyright   2009-2016 Laurent Jouanneau
* @copyright   2011 Julien Issler
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jauthModuleInstaller extends jInstallerModule {


    protected static $key = null;

    function install() {

        if (self::$key === null) {
            self::$key = jAuth::getRandomPassword(30, true);
        }

        $authconfig = $this->config->getValue('auth','coordplugins');
        $authconfigMaster = $this->config->getValue('auth','coordplugins', null, true);
        $forWS = (in_array($this->entryPoint->type, array('json', 'jsonrpc', 'soap', 'xmlrpc')));

        if (!$authconfig || ($forWS && $authconfig == $authconfigMaster)) {

            if ($forWS) {
                $pluginIni = 'authsw.coord.ini.php';
            }
            else {
                $pluginIni = 'auth.coord.ini.php';
            }

            $authconfig = dirname($this->entryPoint->configFile).'/'.$pluginIni;

            if ($this->firstExec('auth:'.$authconfig)) {
                // no configuration, let's install the plugin for the entry point
                $this->config->setValue('auth', $authconfig, 'coordplugins');
                if (!file_exists(jApp::configPath($authconfig))) {
                    $this->copyFile('var/config/'.$pluginIni, jApp::configPath($authconfig));
                }
            }
        }

        $liveConfigIni = $this->entryPoint->liveConfigIni;
        $key = $liveConfigIni->getValue('persistant_crypt_key', 'coordplugin_auth');
        if ($key === 'exampleOfCryptKey' || $key == '') {
            $liveConfigIni->setValue('persistant_crypt_key', self::$key, 'coordplugin_auth');
        }
    }
}