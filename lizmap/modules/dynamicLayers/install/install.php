<?php
/**
 * @author    your name
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    All rights reserved
 */
class dynamicLayersModuleInstaller extends jInstallerModule
{
    public function install()
    {
        // if ($this->firstDbExec())
        //    $this->execSQLScript('sql/install');

        /*if ($this->firstExec('acl2')) {
            jAcl2DbManager::addSubject('my.subject', 'dynamicLayers~acl.my.subject', 'subject.group.id');
            jAcl2DbManager::addRight('admins', 'my.subject'); // for admin group
        }
        */
    }
}
