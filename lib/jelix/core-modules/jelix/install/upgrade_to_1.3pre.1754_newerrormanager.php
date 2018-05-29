<?php
/**
 * @package    jelix-modules
 * @subpackage jelix-module
* @author     Laurent Jouanneau
* @copyright  2010 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jelixModuleUpgrader_newerrormanager extends jInstallerModule {

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
        $trueIni = parse_ini_file($ini->getFileName(),true);
        if (isset($trueIni['fileLogger'])) {
            foreach($trueIni['fileLogger'] as $opt=>$val) {
                if ($val[0] != '!')
                    continue;
                if ($val == '!response') {
                    $this->addValue($ini, $opt, 'logger', 'htmlbar');
                }
                else if ($val == '!firebug') {
                    $this->addValue($ini, $opt, 'logger', 'firebug');
                }
                $ini->removeValue($opt, 'fileLogger');
            }
        }

        if ($ini->isSection('error_handling')) {
            $errorlog = $ini->getValue('logFile', 'error_handling');

            $ini->removeValue('logFile', 'error_handling');

            if ($ini->getValue('showInFirebug', 'error_handling')) {
                $this->addValue($ini, 'error', 'logger', 'firebug');
            }
            $ini->removeValue('showInFirebug', 'error_handling');

            $ini->renameValue('quietMessage', 'errorMessage', 'error_handling');

            foreach(array('default', 'error', 'warning', 'notice', 'strict', 'deprecated', 'exception') as $typerr) {
                $toDo = $ini->getValue($typerr, 'error_handling');
                $ini->removeValue($typerr, 'error_handling');
                if (is_null($toDo))
                    continue;
                if ($typerr == 'exception')
                    $typerr = 'error';

                if(strpos($toDo , 'LOGFILE') !== false && $errorlog){
                    $ini->setValue($typerr, $errorlog,'fileLogger');
                    $this->addValue($ini, $typerr, 'logger', 'file');
                }
                if(strpos($toDo , 'MAIL') !== false && jApp::config()){
                    $this->addValue($ini, $typerr, 'logger', 'mail');
                }
                if(strpos($toDo , 'SYSLOG') !== false){
                    $this->addValue($ini, $typerr, 'logger', 'syslog');
                }
            }
            $logEmail = $ini->getValue('email', 'error_handling');
            $logEmailHeaders = $ini->getValue('emailHeaders', 'error_handling');
            if ($logEmail) {
                $ini->removeValue('email', 'error_handling');
                $ini->setValue('email',$logEmail,'mailLogger');
            }
            if ($logEmailHeaders) {
                $ini->removeValue('emailHeaders', 'error_handling');
                $ini->setValue('emailHeaders',$logEmailHeaders,'mailLogger');
            }

        }
    }

    /**
     * @param jIniFileModifier $ini
     */
    protected function addValue($ini, $name, $section, $val) {
        $oldval = $ini->getValue($name, $section);
        if (!is_null($oldval)) {
            $list = preg_split('/ *, */', $oldval);
            if (!in_array($val, $list)) {
                $val = $oldval.','.$val;
            }
        }
        $ini->setValue($name, $val, $section);
    }
}