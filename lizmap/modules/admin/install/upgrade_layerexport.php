<?php
class adminModuleUpgrader_layerexport extends jInstallerModule {

    public $targetVersions = array(
        '3.0pre',
        '3.0beta1',
        '3.0beta2'
    );
    public $date = '2016-01-10';

    function install() {
        if ($this->firstDbExec()) {
            $this->useDbProfile('jauth');
            jAcl2DbManager::addSubject("lizmap.tools.layer.export","admin~jacl2.lizmap.tools.layer.export","lizmap.grp");
        }
    }

}
