<?php

class adminModuleUpgrader_announcement_acl extends jInstallerModule
{
    public $targetVersions = array(
        '3.11.0-pre', '3.11.0',
    );
    public $date = '2026-02-22';

    public function install()
    {
        if ($this->firstExec('acl2_announcement')) {
            $this->useDbProfile('auth');

            // Create announcement management right
            jAcl2DbManager::createRight('lizmap.admin.announcement.manage', 'admin~jacl2.lizmap.admin.announcement.manage', 'lizmap.admin.grp');

            // Assign to admins group
            if (jAcl2DbUserGroup::getGroup('admins')) {
                jAcl2DbManager::addRight('admins', 'lizmap.admin.announcement.manage');
            }
        }
    }
}
