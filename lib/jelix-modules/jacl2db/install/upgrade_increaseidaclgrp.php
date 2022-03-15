<?php

/**
 * @package     jelix
 * @subpackage  jacl2db module
 * @author      Laurent Jouanneau
 * @copyright   2022 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

class jacl2dbModuleUpgrader_increaseidaclgrp extends jInstallerModule {

    public $targetVersions = array('1.6.36-rc.1', '1.7.11-rc.1');
    public $date = '2022-01-17 15:30';

    function install() {
        if (!$this->firstDbExec())
            return;
        $db = $this->dbConnection();

        if ($db->dbms == 'pgsql' || $db->dbms == 'mysql') {
            $this->execSQLScript('sql/upgrade_increaseidaclgrp');
        }
    }
}