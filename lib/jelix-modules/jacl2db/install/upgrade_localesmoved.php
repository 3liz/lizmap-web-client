<?php

/**
* @package     jelix
* @subpackage  jacl2db module
* @author      Laurent Jouanneau
* @copyright   2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jacl2dbModuleUpgrader_localesmoved extends jInstallerModule {

    public $targetVersions = array('1.5.1');
    public $date = '2012-09-21 09:37';

    function install() {
        if (!$this->firstDbExec())
            return;
        $db = $this->dbConnection();

        if ($db->dbms == 'mysql') {
            $db->exec('UPDATE '.$db->prefixTable('jacl2_subject_group').
                      " SET label_key=CONCAT('jacl2db~acl2db.', SUBSTRING(label_key FROM 14))
                      WHERE label_key LIKE 'jelix~acl2db.%'");

            $db->exec('UPDATE '.$db->prefixTable('jacl2_subject').
                      " SET label_key=CONCAT('jacl2db~acl2db.', SUBSTRING(label_key FROM 14))
                      WHERE label_key LIKE 'jelix~acl2db.%'");
        }
        else {
            $db->exec('UPDATE '.$db->prefixTable('jacl2_subject_group').
                      " SET label_key= ('jacl2db~acl2db.' || SUBSTR(label_key, 14))
                      WHERE label_key LIKE 'jelix~acl2db.%'");

            $db->exec('UPDATE '.$db->prefixTable('jacl2_subject').
                      " SET label_key= ('jacl2db~acl2db.' || SUBSTR(label_key, 14))
                      WHERE label_key LIKE 'jelix~acl2db.%'");
        }
    }
}