<?php
/**
* @package     jelix
* @subpackage  jauth module
* @author      Laurent Jouanneau
* @copyright   2018 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jauthModuleUpgrader_movepersistantkey extends jInstallerModule {

    public $targetVersions = array('1.3.1');
    public $date = '2018-05-28 22:20';

    function install() {
        $liveConfigIni = $this->entryPoint->liveConfigIni;
        $localConfigIni = $this->entryPoint->localConfigIni;
        $key = $localConfigIni->getValue('persistant_crypt_key', 'coordplugin_auth');
        if ($key != 'exampleOfCryptKey' && $key != '') {
            $liveConfigIni->setValue('persistant_crypt_key', $key, 'coordplugin_auth');
            $localConfigIni->getMaster()->getOverrider()->removeValue('persistant_crypt_key', 'coordplugin_auth');
        }
    }
}
