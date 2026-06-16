<?php

class adminModuleUpgrader_permalink extends jInstallerModule
{
    public $targetVersions = array(
        '3.10.0-rc.2',
    );
    public $date = '2026-05-13';

    public function install()
    {
        if ($this->firstExec('acl2')) {
            $this->useDbProfile('auth');

            // add permalink table
            $this->execSQLScript('sql/lizpermalink');

            // Add permalink rights
            jAcl2DbManager::createRight('lizmap.admin.permalink.manage', 'admin~jacl2.lizmap.admin.permalink.manage', 'lizmap.admin.grp');

            // New rights for admins
            if (jAcl2DbUserGroup::getGroup('admins')) {
                jAcl2DbManager::addRight('admins', 'lizmap.admin.permalink.manage');
            }
        }
    }
}
