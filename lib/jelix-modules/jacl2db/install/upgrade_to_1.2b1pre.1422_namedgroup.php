<?php

/**
* @package     jelix
* @subpackage  jacl2db module
* @author      Laurent Jouanneau
* @contributor Olivier Demah
* @copyright   2010 Laurent Jouanneau, Olivier Demah
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jacl2dbModuleUpgrader_namedgroup extends jInstallerModule {

    protected $defaultDbProfile = 'jacl2_profile';

    function install() {
        if (!$this->firstDbExec())
            return;
        $this->declareDbProfile('jacl2_profile', null, false);
        $cn = $this->dbConnection();
        try {
            $cn->exec("ALTER TABLE ".$cn->prefixTable('jacl2_group')." ADD COLUMN code varchar(30) default NULL");
            echo "debug: upgrade jacl2db\n";
        } catch(Exception $e) {
            echo "upgrade jacl2db failed\n";
        }
    }
}