<?php
/**
* @package     jelix
* @subpackage  jauthdb_admin module
* @author      Laurent Jouanneau
* @contributor
* @copyright   2010-2018 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


class jauthdb_adminModuleInstaller extends jInstallerModule {

    function install() {
        $authconfig = $this->config->getValue('auth','coordplugins');

        if ($authconfig && $this->entryPoint->type != 'cmdline' && $this->firstExec($authconfig)) {

            $conf = new jIniFileModifier(jApp::configPath($authconfig));
            $daoName = $conf->getValue('dao', 'Db');
            $formName = $conf->getValue('form', 'Db');
            if ($daoName == 'jauthdb~jelixuser' && $formName == '') {
                $conf->setValue('form','jauthdb_admin~jelixuser', 'Db');
                $conf->save();
            }
        }
    }
}