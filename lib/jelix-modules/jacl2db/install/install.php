<?php
/**
* @package     jelix
* @subpackage  jacl2db module
* @author      Laurent Jouanneau
* @contributor
* @copyright   2009-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * parameters for this installer
 *    - defaultgroups    add default groups admin, users, anonymous
 *    - defaultuser      add a default user, admin and add default groups
 */
class jacl2dbModuleInstaller extends jInstallerModule {


    protected $defaultDbProfile = 'jacl2_profile';

    function install() {
        if ($this->entryPoint->type == 'cmdline')
            return;

        if (!$this->firstDbExec())
            return;

        $this->declareDbProfile('jacl2_profile', null, false);
        $driver = $this->config->getValue('driver','acl2');
        if ($driver != 'db')
            $this->config->setValue('driver','db','acl2');

        /*
        $mapper = new jDaoDbMapper('jacl2_profile');
        $mapper->createTableFromDao("jacl2db~jacl2group");
        $mapper->createTableFromDao("jacl2db~jacl2usergroup");
        $mapper->createTableFromDao("jacl2db~jacl2subjectgroup");
        $mapper->createTableFromDao("jacl2db~jacl2subject");
        $mapper->createTableFromDao("jacl2db~jacl2rights");
        */

        $this->execSQLScript('install_jacl2.schema');

        $this->insertDaoData('data.json', jDbTools::IBD_INSERT_ONLY_IF_TABLE_IS_EMPTY);

        if ($this->getParameter('defaultuser') || $this->getParameter('defaultgroups')) {
            // declare some groups
            $this->insertDaoData('groups.json', jDbTools::IBD_INSERT_ONLY_IF_TABLE_IS_EMPTY);
        }

        if ($this->getParameter('defaultuser')) {
            $this->insertDaoData('users.groups.json', jDbTools::IBD_IGNORE_IF_EXIST);
            $this->insertDaoData('users.json', jDbTools::IBD_INSERT_ONLY_IF_TABLE_IS_EMPTY);
        }
    }
}
