<?php

class adminModuleUpgrader_layerexport extends jInstallerModule
{
    public $targetVersions = array(
        '2.12.0',
        '2.12.1',
        '2.12.2',
        '2.12.3',
        '2.12.4',
        '2.12.5',
        '2.12.6',
        '3.0pre',
        '3.0beta1',
        '3.0beta2',
        '3.0beta3',
    );
    public $date = '2016-01-10';

    public function install()
    {
        if ($this->firstDbExec()) {
            $this->useDbProfile('jauth');
            jAcl2DbManager::addSubject('lizmap.tools.layer.export', 'admin~jacl2.lizmap.tools.layer.export', 'lizmap.grp');
        }
    }
}
