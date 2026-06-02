<?php

class lizmapModuleUpgrader_permalink extends jInstallerModule
{
    public $targetVersions = array(
        '3.10.0-rc.1',
        '3.10.0',
    );
    public $date = '2026-05-26';

    public function install()
    {
        // Adding permalink table
        if ($this->firstDbExec()) {
            // Add permalink table
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/lizpermalink');
        }
    }
}
