<?php

/**
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License
 */
class filterModuleInstaller extends jInstallerModule
{
    public function install()
    {

        // Copy CSS and JS assets
        // $this->copyDirectoryContent('www', jApp::wwwPath());

        // if ($this->firstDbExec())
        //    $this->execSQLScript('sql/install');

        /*if ($this->firstExec('acl2')) {
            jAcl2DbManager::addSubject('my.subject', 'filter~acl.my.subject', 'subject.group.id');
            jAcl2DbManager::addRight('admins', 'my.subject'); // for admin group
        }
        */
    }
}
