<?php
/**
* @author    Laurent Jouanneau
*/

/**
 * Installer for Jelix 1.7
 */
class ldapdaoModuleInstaller extends \Jelix\Installer\Module\Installer {

    function install(\Jelix\Installer\Module\API\InstallHelpers $helpers) {
        
        // we should disable some rights
        $daoright = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
        $daoright->deleteByRole('auth.users.create');
        $daoright->deleteByRole('auth.users.change.password');
        $daoright->deleteByRole('auth.user.change.password');
        //$daoright->deleteByRole('auth.users.delete');

        // allow the admin user to change his right
        $authconfig = $helpers->getConfigIni()->getValue('auth','coordplugins');
        $confIni = parse_ini_file(jApp::appSystemPath($authconfig), true);
        $authConfig = jAuth::loadConfig($confIni);

        if (isset($authConfig['ldapdao'])) {
            // authldap.coord.ini.php was already installed, we can take
            // the admin user indicated into it
            $jelixAdminUser = $authConfig['ldapdao']['jelixAdminLogin'];
        }
        else {
            $jelixAdminUser = 'admin';
        }
        $userGroup = jDao::get('jacl2db~jacl2group', 'jacl2_profile')->getPrivateGroup($jelixAdminUser);
        if ($userGroup) {
            jAcl2DbManager::addRight($userGroup->id_aclgrp, 'auth.user.change.password');
        }

    }
}
