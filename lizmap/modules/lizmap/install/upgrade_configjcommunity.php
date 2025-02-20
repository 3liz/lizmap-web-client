<?php

use Jelix\IniFile\IniModifier;

class lizmapModuleUpgrader_configjcommunity extends jInstallerModule
{
    public $targetVersions = array(
        '3.2pre.180212',
    );
    public $date = '2018-02-12';

    public function install()
    {
        if ($this->firstExec('configchange')) {
            $lzmIni = new IniModifier(jApp::varConfigPath('lizmapConfig.ini.php'));

            $liveIni = $this->entryPoint->liveConfigIni;

            $val = $lzmIni->getValue('allowUserAccountRequests', 'services');
            if ($val === null) {
                $val = false;
            } else {
                $lzmIni->removeValue('allowUserAccountRequests', 'services');
            }
            $liveIni->setValue('registrationEnabled', $val ? 'on' : 'off', 'jcommunity');

            $adminSenderEmail = $this->entryPoint->config->mailer['webmasterEmail'];
            if ($adminSenderEmail == 'root@localhost' || $adminSenderEmail == 'root@localhost.localdomain') {
                $adminSenderEmail = '';
            }

            $val = $lzmIni->getValue('adminContactEmail', 'services');
            if ($val !== null && $adminSenderEmail == '') {
                $liveIni->setValue('webmasterEmail', $val, 'mailer');
            }
            $lzmIni->save();
            $liveIni->save();
        }
    }
}
