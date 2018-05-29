<?php

/**
 * @package    jelix-modules
 * @subpackage jelix-module
* @author      Laurent Jouanneau
* @copyright   2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jelixModuleUpgrader_availablelocales extends jInstallerModule {

    public $targetVersions = array('1.4b2pre.2346');
    public $date = '2012-06-12 09:42';

    function install() {
        $isMaster = false;
        $autoLocaleFile = $this->config->getOverrider()->getValue('autolocale', 'coordplugins');
        if ($autoLocaleFile == '') {
            $autoLocaleFile = $this->config->getMaster()->getValue('autolocale', 'coordplugins');
            $isMaster = true;
        }

        if ($autoLocaleFile == '' || !$this->firstExec('autolocale:'.$autoLocaleFile))
            return;
        $ini = new jIniFileModifier(jApp::configPath($autoLocaleFile));
        $availableLocales = $ini->getValue('availableLanguageCode');
        if ($isMaster)
            $this->config->getMaster()->setValue('availableLocales', $availableLocales);
        else
            $this->config->getOverrider()->setValue('availableLocales', $availableLocales);
        $ini->removeValue('availableLanguageCode');
        $ini->save();
    }
}