<?php

use Jelix\IniFile\IniModifier;

class lizmapModuleUpgrader_qgisprojectcache extends jInstallerModule
{
    public $targetVersions = array(
        '3.0beta4.1',
    );
    public $date = '2016-05-05';

    public function install()
    {
        if ($this->firstExec('cacheqgis')) {
            $profiles = new IniModifier(jApp::varConfigPath('profiles.ini.php'));
            if (!$profiles->isSection('jcache:qgisprojects')) {
                $profiles->setValues(array(
                    'enabled' => 1,
                    'driver' => 'file',
                    'ttl' => 0,
                ), 'jcache:qgisprojects');
                $profiles->save();
            }
        }
    }
}
