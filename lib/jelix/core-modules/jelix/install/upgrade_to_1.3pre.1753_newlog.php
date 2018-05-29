<?php
/**
 * @package    jelix-modules
 * @subpackage jelix-module
* @author     Laurent Jouanneau
* @copyright  2010 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jelixModuleUpgrader_newlog extends jInstallerModule {

    function install() {
        if ($this->firstExec('defaultconfig'))
            $this->modifyIni($this->config->getMaster());

        $conf = $this->config->getOverrider();
        if ($this->firstExec($conf->getFileName()))
            $this->modifyIni($conf);
    }
    
    /**
     * @param jIniFileModifier $ini
     */
    protected function modifyIni($ini) {
        if ($ini->isSection('logfiles')) {
            $ini->renameSection('logfiles', 'fileLogger');
        }
    }
}