<?php
/**
* @package     jelix
* @subpackage  jacl2db module
* @author      Laurent Jouanneau
* @copyright   2011 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jacl2dbModuleUpgrader_codegroup extends jInstallerModule {

    protected $defaultDbProfile = 'jacl2_profile';

    function install() {
        if (!$this->firstDbExec())
            return;
        $this->declareDbProfile('jacl2_profile', null, false);
        $cn = $this->dbConnection();
        try {
            $cn->beginTransaction();

            $this->execSQLScript('sql/upgrade_codegroup_1',null,false);

            $rs = $cn->query("SELECT code, g.id_aclgrp FROM ".$cn->prefixTable('jacl2_group')." g,"
                             .$cn->prefixTable('jacl2_user_group')." ug WHERE g.id_aclgrp = ug.id_aclgrp");
            foreach ($rs as $row) {
                $cn->exec("UPDATE ".$cn->prefixTable('jacl2_user_group')." SET code_grp = ".$cn->quote($row->code)." WHERE id_aclgrp=".$row->id_aclgrp);
            }

            $rs = $cn->query("SELECT code, g.id_aclgrp FROM ".$cn->prefixTable('jacl2_group')." g, ".$cn->prefixTable('jacl2_rights')." r WHERE g.id_aclgrp = r.id_aclgrp");
            foreach ($rs as $row) {
                $cn->exec("UPDATE ".$cn->prefixTable('jacl2_rights')." SET code_grp = ".$cn->quote($row->code)." WHERE id_aclgrp=".$row->id_aclgrp);
            }
            $this->execSQLScript('sql/upgrade_codegroup_2',null,false);
            $cn->commit();
        } catch(Exception $e) {
            $cn->rollback();
            throw $e;
        }
    }
}