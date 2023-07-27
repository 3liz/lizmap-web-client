<?php

class lizmapModuleUpgrader_replyto extends jInstallerModule
{
    public $targetVersions = array(
        '3.7.0-alpha.2',
        '3.6.5',
        '3.5.14',
    );
    public $date = '2023-07-27';

    public function install()
    {
        if (isset($this->entryPoint->getConfigObj()->lizmap['setAdminContactEmailAsReplyTo'])
            && $this->entryPoint->getConfigObj()->lizmap['setAdminContactEmailAsReplyTo']
        ) {
            $lizmapConfFile = jApp::varConfigPath('lizmapConfig.ini.php');
            $ini = new \Jelix\IniFile\IniModifier($lizmapConfFile);
            $replyTo = $ini->getValue('adminContactEmail', 'services');

            $liveIni = new \Jelix\IniFile\IniModifier(jApp::varConfigPath('liveconfig.ini.php'));
            $liveIni->setValue('replyTo', $replyTo, 'mailer');
            $liveIni->save();
        }
    }
}
