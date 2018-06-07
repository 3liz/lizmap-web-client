<?php
/**
* @author    Laurent Jouanneau
*/


class ldapdaoModuleInstaller extends jInstallerModule {

    function install() {
        if ($this->firstExec('acl2')) {
            // we should disable some rights

            $daoright = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
            $daoright->deleteBySubject('auth.users.create');
            $daoright->deleteBySubject('auth.users.change.password');
            $daoright->deleteBySubject('auth.user.change.password');
            //$daoright->deleteBySubject('auth.users.delete');
        }
        if (!$this->getParameter('noconfigfile')) {
            $this->copyFile('authldap.coord.ini.php', 'config:authldap.coord.ini.php', false);
        }
    }
}
