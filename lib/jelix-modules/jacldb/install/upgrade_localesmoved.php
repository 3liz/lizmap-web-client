<?php

/**
* @package     jelix
* @subpackage  jacldb module
* @author      Laurent Jouanneau
* @copyright   2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jacldbModuleUpgrader_localesmoved extends jInstallerModule {

    public $targetVersions = array('1.5');
    public $date = '2012-09-21 09:37';

    function install() {
        if (!$this->firstDbExec())
            return;
        $db = $this->dbConnection();

        if ($db->dbms == 'mysql') {
            $db->exec('UPDATE '.$db->prefixTable('jacl_right_values_group').
                      " SET label_key=CONCAT('jacldb~acldb.', SUBSTRING(label_key FROM 13))
                      WHERE label_key LIKE 'jelix~acldb.%'");

            $db->exec('UPDATE '.$db->prefixTable('jacl_right_values').
                      " SET label_key=CONCAT('jacldb~acldb.', SUBSTRING(label_key FROM 13))
                      WHERE label_key LIKE 'jelix~acldb.%'");

            $db->exec('UPDATE '.$db->prefixTable('jacl_subject').
                      " SET label_key=CONCAT('jacldb~acldb.', SUBSTRING(label_key FROM 13))
                      WHERE label_key LIKE 'jelix~acldb.%'");
        }
        else {
            $db->exec('UPDATE '.$db->prefixTable('jacl_right_values_group').
                      " SET label_key= ('jacldb~acldb.' || SUBSTR(label_key, 13))
                      WHERE label_key LIKE 'jelix~acldb.%'");

            $db->exec('UPDATE '.$db->prefixTable('jacl_right_values').
                      " SET label_key= ('jacldb~acldb.' || SUBSTR(label_key, 13))
                      WHERE label_key LIKE 'jelix~acldb.%'");

            $db->exec('UPDATE '.$db->prefixTable('jacl_subject').
                      " SET label_key= ('jacldb~acldb.' || SUBSTR(label_key, 13))
                      WHERE label_key LIKE 'jelix~acldb.%'");
        }
    }
}