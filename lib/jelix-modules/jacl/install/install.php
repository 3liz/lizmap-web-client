<?php
/**
* @package     jacl
* @author      Laurent Jouanneau
* @contributor
* @copyright   2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jaclModuleInstaller extends jInstallerModule {
    function install() {
        if ($this->firstConfExec()) {
            if (null == $this->config->getValue('jacl', 'coordplugins')) {
                $this->config->setValue('jacl', '1', 'coordplugins');
                if ($this->entryPoint->type != 'classic')
                    $onerror = 1;
                else
                    $onerror = 2;
                $this->config->setValue('on_error', $onerror, 'coordplugin_jacl');
                $this->config->setValue('error_message', "jacl~errors.action.right.needed", 'coordplugin_jacl');
                $this->config->setValue('on_error_action', "jelix~error:badright", 'coordplugin_jacl');
            }
        }
    }
}
