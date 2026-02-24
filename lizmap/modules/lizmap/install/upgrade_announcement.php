<?php

class lizmapModuleUpgrader_announcement extends jInstallerModule
{
    public $targetVersions = array(
        '3.11.0-pre', '3.11.0',
    );
    public $date = '2026-02-22';

    public function install()
    {
        if ($this->firstExec('announcement')) {
            $this->useDbProfile('lizlog');
            $this->execSQLScript('sql/lizannouncement');
        }
    }
}
