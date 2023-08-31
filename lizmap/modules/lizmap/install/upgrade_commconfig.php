<?php

class lizmapModuleUpgrader_commconfig extends jInstallerModule
{
    public $targetVersions = array(
        '3.7.0-alpha.3',
        '3.6.6',
    );

    public $date = '2023-08-31';

    public function install()
    {
        // copy the value of adminContactEmail into the config parameter notificationReceiverEmail
        // for jCommunity 1.4+
        $liveIni = new \Jelix\IniFile\IniModifier(jApp::varConfigPath('liveconfig.ini.php'));
        $currentValue = $liveIni->getValue('notificationReceiverEmail', 'jcommunity');
        if (!$currentValue) {
            $lizmapConfFile = jApp::varConfigPath('lizmapConfig.ini.php');
            $ini = new \Jelix\IniFile\IniModifier($lizmapConfFile);
            $contact = $ini->getValue('adminContactEmail', 'services');
            $liveIni->setValue('notificationReceiverEmail', $contact, 'jcommunity');
            $liveIni->save();
        }
    }
}
