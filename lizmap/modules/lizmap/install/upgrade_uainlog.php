<?php

use Jelix\Installer\Module\API\InstallHelpers;
use Jelix\Installer\Module\Installer;

class lizmapModuleUpgrader_uainlog extends Installer
{
    public $targetVersions = array(
        '3.10.0-pre.1', '3.9.0-rc.4'
    );
    public $date = '2025-06-17';

    public function install(InstallHelpers $helpers)
    {
        // Add user agent colum to lizlog table
        $helpers->database()->useDbProfile('lizlog');
        $helpers->database()->execSQLScript('sql/adduseragent');
    }
}
