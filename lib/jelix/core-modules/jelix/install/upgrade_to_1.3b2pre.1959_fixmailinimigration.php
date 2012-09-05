<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2011 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jelixModuleUpgrader_fixmailinimigration extends jInstallerModule {

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
        if ($ini->isSection('mailLogger')) {
            // in a previous update (newerrormanager), emailHeaders was
            // moved with the value of email, so we should delete it
            // except if it has been changed since..
            $logEmail = $ini->getValue('email', 'mailLogger');
            $logEmailHeaders = $ini->getValue('emailHeaders', 'mailLogger');
            if ($logEmail == $logEmailHeaders) {
                $ini->removeValue('emailHeaders', 'mailLogger');
            }
        }
    }
}