<?php
/**
* @package   lizmap
* @subpackage admin_api
* @author    3liz.com
* @copyright 2011-2025 3Liz
* @link      https://3liz.com
* @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
*/


class admin_apiModuleInstaller extends \Jelix\Installer\Module\Installer {

    function install(\Jelix\Installer\Module\API\InstallHelpers $helpers) {
        //$helpers->database()->execSQLScript('sql/install');

        /*
        jAcl2DbManager::createRight('my.right', 'admin_api~acl.my.right', 'right.group.id');
        jAcl2DbManager::addRight('admins', 'my.right'); // for admin group
        */
    }
}
