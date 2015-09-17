<?php
class lizmapModuleUpgrader_geobookmark extends jInstallerModule {

    public $targetVersions = array(
        '2.10.0',
        '2.10.1',
        '2.10.2',
        '2.10.3',
        '2.11.0',
        '2.11.1',
        '3.0pre'
    );
    public $date = '2015-09-16';

    function install() {

        // Ajout de la table geobookmark
        if( $this->firstDbExec() ) {

            // Add geobookmark table
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/lizgeobookmark');
        }
    }

}
