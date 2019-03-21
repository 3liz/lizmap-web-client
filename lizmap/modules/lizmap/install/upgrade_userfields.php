<?php

class lizmapModuleUpgrader_userfields extends jInstallerModule
{
    public $targetVersions = array(
        '3.0pre',
        '3.0beta1',
        '3.0beta2',
    );
    public $date = '2015-11-23';

    public function install()
    {
        if ($this->firstDbExec()) {
            // modify jlx_user columns
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/lizModifyUserFields');
        }
    }
}
