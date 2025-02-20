<?php

use Jelix\IniFile\IniModifier;

class lizmapModuleUpgrader_requestscache extends jInstallerModule
{
    public $targetVersions = array(
        '3.9.0-pre',
    );
    public $date = '2025-01-29';

    public function install()
    {
        if ($this->firstExec('cacherequests')) {
            $profiles = new IniModifier(jApp::varConfigPath('profiles.ini.php'));
            if (!$profiles->isSection('jcache:requests')) {
                $profiles->setValues(array(
                    'enabled' => 1,
                    'driver' => 'file',
                    'ttl' => 0,
                ), 'jcache:requests');
                $profiles->save();
            }
        }
    }
}
