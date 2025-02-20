<?php

/**
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://www.3liz.com
 *
 * @license    Mozilla Public License - MPL
 */
class adminModuleInstaller extends jInstallerModule
{
    public function install()
    {
        if ($this->firstExec('acl2')) {
            $this->useDbProfile('auth');

            // create rights
            jAcl2DbManager::createRightGroup('lizmap.admin.grp', 'admin~jacl2.lizmap.admin.grp');
            jAcl2DbManager::createRightGroup('lizmap.grp', 'admin~jacl2.lizmap.grp');

            jAcl2DbManager::createRight('lizmap.admin.access', 'admin~jacl2.lizmap.admin.access', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.services.update', 'admin~jacl2.lizmap.admin.services.update', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.repositories.create', 'admin~jacl2.lizmap.admin.repositories.create', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.repositories.update', 'admin~jacl2.lizmap.admin.repositories.update', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.repositories.delete', 'admin~jacl2.lizmap.admin.repositories.delete', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.repositories.view', 'admin~jacl2.lizmap.admin.repositories.view', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.services.view', 'admin~jacl2.lizmap.admin.services.view', 'lizmap.admin.grp');

            jAcl2DbManager::createRight('lizmap.admin.project.list.view', 'admin~jacl2.lizmap.admin.project.list.view', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.home.page.update', 'admin~jacl2.lizmap.admin.home.page.update', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.theme.update', 'admin~jacl2.lizmap.admin.theme.update', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.theme.view', 'admin~jacl2.lizmap.admin.theme.view', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.server.information.view', 'admin~jacl2.lizmap.admin.server.information.view', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.lizmap.log.view', 'admin~jacl2.lizmap.admin.lizmap.log.view', 'lizmap.admin.grp');
            jAcl2DbManager::createRight('lizmap.admin.lizmap.log.delete', 'admin~jacl2.lizmap.admin.lizmap.log.delete', 'lizmap.admin.grp');

            jAcl2DbManager::createRight('lizmap.repositories.view', 'admin~jacl2.lizmap.repositories.view', 'lizmap.grp'); // the right code could be lizmap.view.repository.projects
            jAcl2DbManager::createRight('lizmap.tools.edition.use', 'admin~jacl2.lizmap.tools.edition.use', 'lizmap.grp');
            jAcl2DbManager::createRight('lizmap.tools.loginFilteredLayers.override', 'admin~jacl2.lizmap.tools.loginFilteredLayers.override', 'lizmap.grp');
            jAcl2DbManager::createRight('lizmap.tools.displayGetCapabilitiesLinks', 'admin~jacl2.lizmap.tools.displayGetCapabilitiesLinks', 'lizmap.grp');
            jAcl2DbManager::createRight('lizmap.tools.layer.export', 'admin~jacl2.lizmap.tools.layer.export', 'lizmap.grp');

            // Add the rights to the admins group
            jAcl2DbManager::addRight('admins', 'lizmap.admin.repositories.view');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.services.view');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.access');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.repositories.create');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.repositories.delete');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.repositories.update');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.services.update');

            jAcl2DbManager::addRight('admins', 'lizmap.admin.project.list.view');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.home.page.update');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.theme.view');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.theme.update');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.server.information.view');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.lizmap.log.view');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.lizmap.log.delete');

            // Create a new publishers group
            jAcl2DbUserGroup::createGroup('Publishers', 'publishers');

            // Add the rights the the publishers groupe
            jAcl2DbManager::addRight('publishers', 'lizmap.admin.project.list.view');
            jAcl2DbManager::addRight('publishers', 'lizmap.admin.server.information.view');
        }
    }
}
