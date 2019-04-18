<?php
/**
* @author    Laurent Jouanneau
*/


class ldapdaoModuleInstaller extends jInstallerModule {

    function install() {
        if (!$this->getParameter('noconfigfile')) {
            $this->copyFile('authldap.coord.ini.php', 'config:authldap.coord.ini.php', false);
        }

        if ($this->firstExec('acl2')) {
            // we should disable some rights
            $daoright = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
            $daoright->deleteBySubject('auth.users.create');
            $daoright->deleteBySubject('auth.users.change.password');
            $daoright->deleteBySubject('auth.user.change.password');
            //$daoright->deleteBySubject('auth.users.delete');

            // allow the admin user to change his right
            $confIni = parse_ini_file($this->getAuthConfFile(), true);
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

    protected function isJelix17() {
        return method_exists('jApp', 'appConfigPath');
    }

    protected function getAuthConfFile() {
        $authconfig = $this->config->getValue('auth','coordplugins');
        if ($this->isJelix17()) {
            $confPath = jApp::appConfigPath($authconfig);
        }
        else {
            $confPath = jApp::configPath($authconfig);
        }
        return $confPath;
    }
}
