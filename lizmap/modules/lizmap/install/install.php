<?php
/**
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


class lizmapModuleInstaller extends jInstallerModule {

    function install() {

        $lizmapConfFile = jApp::configPath('lizmapConfig.ini.php');
        if (!file_exists($lizmapConfFile)) {
            $lizmapConfFileDist = jApp::configPath('lizmapConfig.ini.php.dist');
            if (file_exists($lizmapConfFileDist)) {
                copy($lizmapConfFileDist, $lizmapConfFile);
            }
            else {
                $this->copyFile('config/lizmapConfig.ini.php', $lizmapConfFile);
            }
        }

        $localConfig = jApp::configPath('localconfig.ini.php');
        if (!file_exists($localConfig)) {
            $localConfigDist = jApp::configPath('localconfig.ini.php.dist');
            if (file_exists($localConfigDist)) {
                copy($localConfigDist, $localConfig);
            }
            else {
                file_put_contents($localConfig, ';<'.'?php die(\'\');?'.'>');
            }
        }
        $ini = new jIniFileModifier($localConfig);
        $ini->setValue('lizmap', 'lizmapConfig.ini.php', 'coordplugins');
        $ini->save();

        if ($this->firstDbExec()) {
            // Add log table
            $this->useDbProfile('lizlog');
            $this->execSQLScript('sql/lizlog');

            // Add geobookmark table
            $this->useDbProfile('jauth');
            $this->execSQLScript('sql/lizgeobookmark');
        }

        if ($this->firstExec('acl2') && $this->getParameter('demo')) {
            $this->useDbProfile('auth');

            // create group
            jAcl2DbUserGroup:: createGroup('lizadmins');
            jAcl2DbUserGroup:: createGroup('Intranet demos group', 'intranet');

            // create user in jAuth
            require_once(JELIX_LIB_PATH.'auth/jAuth.class.php');
            require_once(JELIX_LIB_PATH.'plugins/auth/db/db.auth.php');

            $authconfig = $this->config->getValue('auth','coordplugins');
            $confIni = parse_ini_file(jApp::configPath($authconfig), true);
            $authConfig = jAuth::loadConfig($confIni);
            $driver = new dbAuthDriver($authConfig['Db']);
            $passwordHash1 = $driver->cryptPassword('lizadmin');
            $passwordHash2 = $driver->cryptPassword('logintranet');
            $cn = $this->dbConnection();
            $cn->exec("INSERT INTO ".$cn->prefixTable('jlx_user')." (usr_login, usr_password, usr_email ) VALUES
                        ('lizadmin', ".$cn->quote($passwordHash1)." , 'lizadmin@nomail.nomail')");

            $cn->exec("INSERT INTO ".$cn->prefixTable('jlx_user')." (usr_login, usr_password, usr_email ) VALUES
                        ('logintranet', ".$cn->quote($passwordHash2)." , 'logintranet@nomail.nomail')");

            // declare users in jAcl2

            jAcl2DbUserGroup::createUser('lizadmin', true);
            jAcl2DbUserGroup::createUser('logintranet', true);

            jAcl2DbUserGroup::addUserToGroup('lizadmin', 'lizadmins');
            jAcl2DbUserGroup::addUserToGroup('logintranet', 'intranet');

            jAcl2DbManager::setRightsOnGroup('lizadmins', array(
                'lizmap.admin.access'=>true,
                'lizmap.admin.services.update'=>true,
                'lizmap.admin.repositories.create'=>true,
                'lizmap.admin.repositories.delete'=>true,
                'lizmap.admin.repositories.update'=>true,
                'lizmap.admin.repositories.view'=>true,
                'lizmap.admin.services.view'=>true
            ));

            // admins
            jAcl2DbManager::addRight('admins', 'lizmap.tools.edition.use', 'intranet');
            jAcl2DbManager::addRight('admins', 'lizmap.repositories.view', 'intranet');
            jAcl2DbManager::addRight('admins', 'lizmap.tools.loginFilteredLayers.override', 'intranet');
            jAcl2DbManager::addRight('admins', 'lizmap.tools.displayGetCapabilitiesLinks', 'intranet');

            jAcl2DbManager::addRight('admins', 'lizmap.tools.edition.use', 'montpellier');
            jAcl2DbManager::addRight('admins', 'lizmap.repositories.view', 'montpellier');
            jAcl2DbManager::addRight('admins', 'lizmap.tools.loginFilteredLayers.override', 'montpellier');
            jAcl2DbManager::addRight('admins', 'lizmap.tools.displayGetCapabilitiesLinks', 'montpellier');

            // lizadmins
            jAcl2DbManager::addRight('lizadmins', 'lizmap.tools.edition.use', 'intranet');
            jAcl2DbManager::addRight('lizadmins', 'lizmap.repositories.view', 'intranet');
            jAcl2DbManager::addRight('lizadmins', 'lizmap.tools.loginFilteredLayers.override', 'intranet');
            jAcl2DbManager::addRight('lizadmins', 'lizmap.tools.displayGetCapabilitiesLinks', 'intranet');

            jAcl2DbManager::addRight('lizadmins', 'lizmap.tools.edition.use', 'montpellier');
            jAcl2DbManager::addRight('lizadmins', 'lizmap.repositories.view', 'montpellier');
            jAcl2DbManager::addRight('lizadmins', 'lizmap.tools.loginFilteredLayers.override', 'montpellier');
            jAcl2DbManager::addRight('lizadmins', 'lizmap.tools.displayGetCapabilitiesLinks', 'montpellier');

            // intranet
            jAcl2DbManager::addRight('intranet', 'lizmap.tools.edition.use', 'intranet');
            jAcl2DbManager::addRight('intranet', 'lizmap.repositories.view', 'intranet');
            jAcl2DbManager::addRight('intranet', 'lizmap.tools.loginFilteredLayers.override', 'intranet');
            jAcl2DbManager::addRight('intranet', 'lizmap.tools.displayGetCapabilitiesLinks', 'intranet');

            jAcl2DbManager::addRight('intranet', 'lizmap.tools.edition.use', 'montpellier');
            jAcl2DbManager::addRight('intranet', 'lizmap.repositories.view', 'montpellier');
            jAcl2DbManager::addRight('intranet', 'lizmap.tools.loginFilteredLayers.override', 'montpellier');
            jAcl2DbManager::addRight('intranet', 'lizmap.tools.displayGetCapabilitiesLinks', 'montpellier');

            // anonymous
            jAcl2DbManager::addRight('__anonymous', 'lizmap.tools.edition.use', 'montpellier');
            jAcl2DbManager::addRight('__anonymous', 'lizmap.repositories.view', 'montpellier');
            jAcl2DbManager::addRight('__anonymous', 'lizmap.tools.loginFilteredLayers.override', 'montpellier');
            jAcl2DbManager::addRight('__anonymous', 'lizmap.tools.displayGetCapabilitiesLinks', 'montpellier');

            // declare the repositories of demo in the configuration
            $ini = new jIniFileModifier($lizmapConfFile);
            $ini->setValues(array(
                'label'=>'LizMap Demo',
                'path'=>'../install/qgis/',
                'allowUserDefinedThemes'=>1
                ), 'repository:montpellier');
            $ini->setValues(array(
                'label'=>'Lizmap Demo - Intranet',
                'path'=>'../install/qgis_intranet/',
                'allowUserDefinedThemes'=>''
                ), 'repository:intranet');
            $ini->setValue('defaultRepository', 'montpellier', 'services');
            $ini->save();
        }
    }
}
