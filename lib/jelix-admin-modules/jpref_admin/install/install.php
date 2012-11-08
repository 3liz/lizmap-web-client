<?php
/**
* @package     jelix_admin_modules
* @subpackage  jpref_admin
* @author    Florian Lonqueu-Brochard
* @copyright 2011 Florian Lonqueu-Brochard
* @link        http://jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


class jpref_adminModuleInstaller extends jInstallerModule {

    function install() {
        if ($this->firstExec('acl2')) {
            jAcl2DbManager::addSubjectGroup('jprefs.prefs.management', 'jpref_admin~admin.acl.grp.prefs.management');
            jAcl2DbManager::addSubject('jprefs.prefs.list', 'jpref_admin~admin.acl.prefs.list', 'jprefs.prefs.management');
            jAcl2DbManager::addRight('admins', 'jprefs.prefs.list'); // for admin group
        }
    }
}