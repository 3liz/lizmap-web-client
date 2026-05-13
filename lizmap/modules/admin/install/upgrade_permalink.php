<?php

class adminModuleUpgrader_permalink extends jInstallerModule
{
    public $targetVersions = array(
        '3.10',
    );
    public $date = '2026-05-13'; // original:'2023-01-06'

    public function install()
    {
        if ($this->firstExec('acl2')) {
            $this->useDbProfile('auth');

            // Add permalink rights
            jAcl2DbManager::createRight('lizmap.admin.permalink.manage', 'admin~jacl2.lizmap.admin.permalink.manage', 'lizmap.admin.grp');

            // New rights for admins
            if (jAcl2DbUserGroup::getGroup('admins')) {
                jAcl2DbManager::addRight('admins', 'lizmap.admin.permalink.manage');
            }
        }
    }
}
