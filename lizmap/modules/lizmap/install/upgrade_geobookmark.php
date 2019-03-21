<?php

class lizmapModuleUpgrader_geobookmark extends jInstallerModule
{
    public $targetVersions = array(
        '2.10.0',
        '2.10.1',
        '2.10.2',
        '2.10.3',
        '2.11beta1',
        '2.11beta2',
        '2.11beta3',
        '2.11beta4',
        '2.11beta5',
        '2.11.0',
        '2.11.1',
        '2.11.2',
        '2.11.3',
        '2.12.0',
        '2.12.1',
        '2.12.2',
        '2.12.3',
        '2.12.4',
        '2.12.5',
        '2.12.6',
        '3.0pre',
        '3.0beta1',
    );
    public $date = '2015-09-16';

    public function install()
    {
        // Ajout de la table geobookmark
        if ($this->firstDbExec()) {
            // Add geobookmark table
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/lizgeobookmark');
        }
    }
}
