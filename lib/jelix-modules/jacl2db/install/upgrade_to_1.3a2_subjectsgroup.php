<?php
/**
* @package     jelix
* @subpackage  jacl2db module
* @author      Laurent Jouanneau
* @copyright   2011 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jacl2dbModuleUpgrader_subjectsgroup extends jInstallerModule {

    protected $defaultDbProfile = 'jacl2_profile';

    function install() {
        if (!$this->firstDbExec())
            return;
        $this->declareDbProfile('jacl2_profile', null, false);
        $cn = $this->dbConnection();
        try {
            $cn->beginTransaction();

            $cn->exec("CREATE TABLE ".$cn->prefixTable('jacl2_subject_group')." (
                id_aclsbjgrp VARCHAR(50) NOT NULL,
                label_key VARCHAR(60) NOT NULL,
                PRIMARY KEY (id_aclsbjgrp) )");

            $cn->exec("ALTER TABLE ".$cn->prefixTable('jacl2_subject')." ADD id_aclsbjgrp VARCHAR(50) DEFAULT NULL");

            $this->execSQLScript('sql/upgrade_subjectgroup_data.sql',null,false);

            $cn->commit();
        } catch(Exception $e) {
            $cn->rollback();
            throw $e;
        }
    }
}