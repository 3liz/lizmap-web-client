<?php

/**
* @package     jelix
* @subpackage  core
* @author      Laurent Jouanneau
* @copyright   2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jelixModuleUpgrader_modulejacl2 extends jInstallerModule {

    public $targetVersions = array('1.5a1.2504');
    public $date = '2012-09-19 11:05';

    function install() {
        $this->_upgradeconf('jacl2');
        $this->_upgradeconf('jacl');
    }
    
    protected function _upgradeconf($module) {
        $isMaster = false;
        $jacl2File = $this->config->getOverrider()->getValue($module, 'coordplugins');
        if ($jacl2File == '') {
            $jacl2File = $this->config->getMaster()->getValue($module, 'coordplugins');
            $isMaster = true;
        }

        if ($jacl2File == '' || $jacl2File == '1')
            return;

        $jacl2File = jApp::configPath($jacl2File);
        if (!file_exists($jacl2File)) {
            $message = $module."~errors.action.right.needed";
            if ($this->entryPoint->type != 'classic')
                $onerror = 1;
            else
                $onerror = 2;
            $on_error_action = "jelix~error:badright";
        }
        else {
            $ini = new jIniFileModifier($jacl2File);
            $message = $ini->getValue('error_message'); // = ');
            if ($message == "jelix~errors.acl.action.right.needed") {
                $message = $module."~errors.action.right.needed";
            }
            $onerror = $ini->getValue('on_error');
            $on_error_action = $ini->getValue('on_error_action');
        }

        if ($isMaster)
            $conf = $this->config->getMaster();
        else
            $conf = $this->config->getOverrider();

        $conf->setValue($module, '1', 'coordplugins');
        $conf->setValue('on_error', $onerror, 'coordplugin_'.$module);
        $conf->setValue('error_message', $message, 'coordplugin_'.$module);
        $conf->setValue('on_error_action', $on_error_action, 'coordplugin_'.$module);
        $conf->save();
    }
}