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
            jAcl2DbManager::addSubjectGroup('lizmap.admin.grp', 'admin~jacl2.lizmap.admin.grp');
            jAcl2DbManager::addSubjectGroup('lizmap.grp', 'admin~jacl2.lizmap.grp');

            jAcl2DbManager::addSubject('lizmap.admin.access', 'admin~jacl2.lizmap.admin.access', 'lizmap.admin.grp');
            jAcl2DbManager::addSubject('lizmap.admin.services.update', 'admin~jacl2.lizmap.admin.services.update', 'lizmap.admin.grp');
            jAcl2DbManager::addSubject('lizmap.admin.repositories.create', 'admin~jacl2.lizmap.admin.repositories.create', 'lizmap.admin.grp');
            jAcl2DbManager::addSubject('lizmap.admin.repositories.update', 'admin~jacl2.lizmap.admin.repositories.update', 'lizmap.admin.grp');
            jAcl2DbManager::addSubject('lizmap.admin.repositories.delete', 'admin~jacl2.lizmap.admin.repositories.delete', 'lizmap.admin.grp');
            jAcl2DbManager::addSubject('lizmap.admin.repositories.view', 'admin~jacl2.lizmap.admin.repositories.view', 'lizmap.admin.grp');
            jAcl2DbManager::addSubject('lizmap.admin.services.view', 'admin~jacl2.lizmap.admin.services.view', 'lizmap.admin.grp');

            jAcl2DbManager::addSubject('lizmap.repositories.view', 'admin~jacl2.lizmap.repositories.view', 'lizmap.grp'); // the right code could be lizmap.view.repository.projects
            jAcl2DbManager::addSubject('lizmap.tools.edition.use', 'admin~jacl2.lizmap.tools.edition.use', 'lizmap.grp');
            jAcl2DbManager::addSubject('lizmap.tools.loginFilteredLayers.override', 'admin~jacl2.lizmap.tools.loginFilteredLayers.override', 'lizmap.grp');
            jAcl2DbManager::addSubject('lizmap.tools.displayGetCapabilitiesLinks', 'admin~jacl2.lizmap.tools.displayGetCapabilitiesLinks', 'lizmap.grp');
            jAcl2DbManager::addSubject('lizmap.tools.layer.export', 'admin~jacl2.lizmap.tools.layer.export', 'lizmap.grp');

            jAcl2DbManager::addRight('admins', 'lizmap.admin.repositories.view');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.services.view');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.access');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.repositories.create');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.repositories.delete');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.repositories.update');
            jAcl2DbManager::addRight('admins', 'lizmap.admin.services.update');
        }
    }
}
