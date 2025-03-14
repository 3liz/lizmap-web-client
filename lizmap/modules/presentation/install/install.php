<?php

use Jelix\Installer\Module\API\InstallHelpers;
use Jelix\Installer\Module\Installer;

/**
 * @author    3liz
 * @copyright 2011-2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
class presentationModuleInstaller extends Installer
{
    public function install(InstallHelpers $helpers)
    {
        $helpers->database()->useDbProfile('auth');

        // TODO Check that the profile is using PostgreSQL driver

        // Get SQL template file
        $sql_file = $this->getPath().'install/sql/install.pgsql.sql';
        $sql = jFile::read($sql_file);
        $db = $helpers->database()->dbConnection();
        $db->exec($sql);

        // Add right subject
        jAcl2DbManager::createRightGroup('lizmap.presentation.rights.group', 'presentation~jacl2.lizmap.presentation.rights.group');
        jAcl2DbManager::createRight('lizmap.presentation.usage', 'presentation~jacl2.lizmap.presentation.usage', 'lizmap.presentation.rights.group');
        jAcl2DbManager::createRight('lizmap.presentation.edit', 'presentation~jacl2.lizmap.presentation.edit', 'lizmap.presentation.rights.group');

        // Add rights on existing groups
        // usage
        jAcl2DbManager::addRight('users', 'lizmap.presentation.usage');
        jAcl2DbManager::addRight('publishers', 'lizmap.presentation.usage');
        jAcl2DbManager::addRight('admins', 'lizmap.presentation.usage');
        // edit
        jAcl2DbManager::addRight('publishers', 'lizmap.presentation.edit');
        jAcl2DbManager::addRight('admins', 'lizmap.presentation.edit');
    }
}
