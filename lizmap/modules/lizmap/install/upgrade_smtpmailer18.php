<?php

/**
 * Move smtp access parameters from localconfig to profiles.
 */
class lizmapModuleUpgrader_smtpmailer18 extends \Jelix\Installer\Module\Installer
{
    protected $targetVersions = array('3.6.0-rc.1');
    protected $date = '2022-09-16';

    public function install(Jelix\Installer\Module\API\InstallHelpers $helpers)
    {
        $mailerType = $helpers->getConfigIni()->getValue('mailerType', 'mailer');
        if ($mailerType != 'smtp') {
            return;
        }

        $profilesIni = $helpers->getProfilesIni();
        if ($profilesIni->getValue('host', 'smtp:mailer')) {
            // it seems a profile is already set, let's ignore
            return;
        }

        $this->migrateConfig($helpers->getLocalConfigIni(), $profilesIni);
        $this->migrateConfig($helpers->getLiveConfigIni(), $profilesIni);
    }

    /**
     * @param \Jelix\IniFile\IniReaderInterface $ini
     * @param mixed                             $profilesIni
     */
    protected function migrateConfig($ini, $profilesIni)
    {
        if (!$ini instanceof \Jelix\IniFile\IniModifierInterface) {
            echo 'ERROR '.$ini->getFileName()." not allowed to be writable by the Jelix installer\n";

            return;
        }

        if (!$ini->isSection('mailer') || $ini->getValue('smtpHost', 'mailer') === null) {
            return;
        }

        $mapping = array(
            'smtpHost' => 'host',
            'smtpPort' => 'port',
            'smtpHelo' => 'helo',
            'smtpAuth' => 'auth_enabled',
            'smtpSecure' => 'secure_protocol',
            'smtpUsername' => 'username',
            'smtpPassword' => 'password',
            'smtpTimeout' => 'timeout',
        );

        foreach ($mapping as $old => $new) {
            $oldVal = $ini->getValue($old, 'mailer');
            $profilesIni->setValue($new, $oldVal, 'smtp:mailer');
            $ini->removeValue($old, 'mailer');
        }
        $ini->setValue('mailerType', 'smtp', 'mailer');
    }
}
