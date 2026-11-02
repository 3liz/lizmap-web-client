<?php

class lizmapModuleUpgrader_lizmaplogconfig extends jInstallerModule
{
    public $targetVersions = array(
        '3.8.22-pre',
        '3.9.13-pre',
        '3.10.0-rc.4-pre',
    );

    public $date = '2026-10-30';

    public function install()
    {
        // Create lizmapLogConfig.ini.php if it does not exist
        // Use a default file if it exists
        $lizmapLogConfFile = jApp::varConfigPath('lizmapLogConfig.ini.php');
        if (!file_exists($lizmapLogConfFile)) {
            $lizmapLogConfFileDist = jApp::varConfigPath('lizmapLogConfig.ini.php.dist');
            if (file_exists($lizmapLogConfFileDist)) {
                copy($lizmapLogConfFileDist, $lizmapLogConfFile);
            } else {
                $this->copyFile('config/lizmapLogConfig.ini.php', $lizmapLogConfFile);
            }
        }
    }
}
