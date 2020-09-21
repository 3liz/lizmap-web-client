<?php

class lizmapModuleUpgrader_logip extends jInstallerModule
{
    public $targetVersions = array(
        '3.2.9b1', '3.3.3b1', '3.4.0a1',
    );
    public $date = '2019-11-28';

    public function install()
    {
        if ($this->firstExec('logip')) {
            // increase log_ip to be able to store ipv6
            $cnx = jDb::getConnection('lizlog');
            if ($cnx->dbms == 'pgsql') {
                $cnx->exec('ALTER TABLE log_detail ALTER COLUMN log_ip TYPE character varying(40)');
            } elseif ($cnx->dbms == 'mysql') {
                $cnx->exec('ALTER TABLE log_detail MODIFY COLUMN log_ip VARCHAR(40)');
            }
        }
    }
}
