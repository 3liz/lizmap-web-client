<?php

class adminModuleUpgrader_newAclRights extends jInstallerModule
{
    public $targetVersions = array(
        // '3.6.1-beta.1',
        '3.6.14-rc.1',
        '3.7.9-rc.1',
        '3.8.0-rc.3',
    );
    public $date = '2024-07-03'; // original:'2023-01-06'

    public function install()
    {
        if ($this->firstExec('acl2')) {
            $this->useDbProfile('auth');

            // New right subjects
            jAcl2DbManager::createRight('lizmap.admin.project.list.view', 'admin~jacl2.lizmap.admin.project.list.view', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.home.page.update', 'admin~jacl2.lizmap.admin.home.page.update', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.theme.view', 'admin~jacl2.lizmap.admin.theme.view', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.theme.update', 'admin~jacl2.lizmap.admin.theme.update', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.server.information.view', 'admin~jacl2.lizmap.admin.server.information.view', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.lizmap.log.view', 'admin~jacl2.lizmap.admin.lizmap.log.view', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.lizmap.log.delete', 'admin~jacl2.lizmap.admin.lizmap.log.delete', 'lizmap.admin.grp');

            // New rights for admins
            if (jAcl2DbUserGroup::getGroup('admins')) {
                jAcl2DbManager::addRight('admins', 'lizmap.admin.project.list.view');
                jAcl2DbManager::addRight('admins', 'lizmap.admin.home.page.update');
                jAcl2DbManager::addRight('admins', 'lizmap.admin.theme.view');
                jAcl2DbManager::addRight('admins', 'lizmap.admin.theme.update');
                jAcl2DbManager::addRight('admins', 'lizmap.admin.server.information.view');
                jAcl2DbManager::addRight('admins', 'lizmap.admin.lizmap.log.view');
                jAcl2DbManager::addRight('admins', 'lizmap.admin.lizmap.log.delete');
            }

            // Create a new publishers group
            jAcl2DbUserGroup::createGroup('Publishers', 'publishers');

            // Add the rights the publishers groupe
            jAcl2DbManager::addRight('publishers', 'lizmap.admin.project.list.view');
            jAcl2DbManager::addRight('publishers', 'lizmap.admin.server.information.view');
        }
    }
}
