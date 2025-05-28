<?php

use Jelix\IniFile\IniModifier;

class lizmapModuleUpgrader_replyto extends jInstallerModule
{
    public $targetVersions = array(
        // '3.7.0-alpha.2',
        // '3.6.5',
        '3.5.14',
        '3.6.14-rc.1',
        '3.7.9-rc.1',
        '3.8.0-rc.3',
    );
    public $date = '2024-07-03'; // original : '2023-07-27'

    public function install()
    {
        if (isset($this->entryPoint->getConfigObj()->lizmap['setAdminContactEmailAsReplyTo'])
            && $this->entryPoint->getConfigObj()->lizmap['setAdminContactEmailAsReplyTo']
        ) {
            $liveIni = new IniModifier(jApp::varConfigPath('liveconfig.ini.php'));
            if ($liveIni->getValue('replyTo', 'mailer') == '') {
                $lizmapConfFile = jApp::varConfigPath('lizmapConfig.ini.php');
                $ini = new IniModifier($lizmapConfFile);
                $replyTo = $ini->getValue('adminContactEmail', 'services');

                $liveIni->setValue('replyTo', $replyTo, 'mailer');
                $liveIni->save();
            }
        }
    }
}
