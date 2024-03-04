<?php

class lizmapModuleUpgrader_userfields extends jInstallerModule
{
    public $targetVersions = array(
        '3.8pre',
        '3.8beta1',
        '3.8beta2',
        '3.8.0',
    );
    public $date = '2024-02-19';

    public function install()
    {
        if ($this->firstDbExec()) {
            // modify jlx_user columns
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/presentation');
        }
    }
}
