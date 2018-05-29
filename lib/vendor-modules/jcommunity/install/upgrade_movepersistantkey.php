<?php
/**
 * @package     jcommunity
 * @author      Laurent Jouanneau
 * @copyright   2017 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

class jcommunityModuleUpgrader_movepersistantkey extends jInstallerModule {

    public $targetVersions = array('1.2.1a1');
    public $date = '2018-05-29 17:27';

    protected static $key = null;

    function install() {

        if (isset($this->entryPoint->liveConfigIni)) { // Jelix 1.6.18pre+
            $liveConfigIni = $this->entryPoint->liveConfigIni;
            $localConfigIni = $this->entryPoint->localConfigIni;
            $key = $localConfigIni->getValue('persistant_crypt_key', 'coordplugin_auth');
            if ($key != 'exampleOfCryptKey' && $key != '') {
                $liveConfigIni->setValue('persistant_crypt_key', $key, 'coordplugin_auth');
                $localConfigIni->getMaster()->getOverrider()->removeValue('persistant_crypt_key', 'coordplugin_auth');
            }
        }
    }
}
