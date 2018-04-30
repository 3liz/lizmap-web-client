<?php
/**
 * @package     jcommunity
 * @author      Laurent Jouanneau
 * @contributor
 * @copyright   2010-2018 Laurent Jouanneau
 * @link      https://github.com/laurentj/jcommunity
 * @license  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */


class jcommunityModuleInstaller extends jInstallerModule {

    protected static $key = null;


    function setupFramework() {
        $authconfig = $this->config->getValue('auth','coordplugins');
        $authconfigMaster = $this->config->getValue('auth','coordplugins', null, true);
        $forWS = (in_array($this->entryPoint->type, array('json', 'jsonrpc', 'soap', 'xmlrpc')));
        if (!$authconfig || ($forWS && $authconfig == $authconfigMaster)) {
            //if ($this->entryPoint->type == 'cmdline') {
            //    return;
            //}

            if ($forWS) {
                $pluginIni = 'authsw.coord.ini.php';
            }
            else {
                $pluginIni = 'auth.coord.ini.php';
            }

            $authconfig = dirname($this->entryPoint->configFile).'/'.$pluginIni;
            if ($this->firstExec($authconfig)) {
                // no configuration, let's install the plugin for the entry point
                $this->config->setValue('auth', $authconfig, 'coordplugins');
                $this->copyFile('var/config/'.$pluginIni, 'epconfig:'.$pluginIni);
            }
        }
        else if ($this->firstExec($authconfig)) {
            $conf = $this->getAuthConf();

            if (!$this->getParameter('manualconfig')) {
                $conf->setValue('driver', 'Db');
                $conf->setValue('dao','jcommunity~user', 'Db');
                $conf->setValue('form','jcommunity~account_admin', 'Db');
                $conf->setValue('error_message', 'jcommunity~login.error.notlogged');
                $conf->setValue('on_error_action', 'jcommunity~login:out');
                $conf->setValue('bad_ip_action', 'jcommunity~login:out');
                $conf->setValue('after_logout', 'jcommunity~login:index');
                $conf->setValue('enable_after_login_override', 'on');
                $conf->setValue('enable_after_logout_override', 'on');
                $conf->setValue('after_login', 'jcommunity~account:show');
                $conf->save();
            }
            else {
                $daoSelector = $conf->getValue('dao', 'Db');
                if (!$daoSelector) {
                    $daoSelector = 'jcommunity~user';
                    $conf->setValue('dao', $daoSelector, 'Db');
                }

                if ($daoSelector == 'jcommunity~user') {
                    $conf->setValue('form','jcommunity~account_admin', 'Db');
                }
                $conf->save();
            }
        }

        if ($this->getParameter('masteradmin')) {
            $conf = $this->getAuthConf();
            $conf->setValue('after_login', 'master_admin~default:index');
            $conf->save();
            $this->config->setValue('loginResponse', 'htmlauth', 'jcommunity');
        }
    }

    protected function isJelix17() {
        return method_exists('jApp', 'appConfigPath');
    }

    protected function getAuthConf() {
        $authconfig = $this->config->getValue('auth','coordplugins');
        if ($this->isJelix17()) {
            $confPath = jApp::appConfigPath($authconfig);
            $conf = new \Jelix\IniFile\IniModifier($confPath);
        }
        else {
            $confPath = jApp::configPath($authconfig);
            $conf = new jIniFileModifier($confPath);
        }
        return $conf;
    }

    function install() {

        if (self::$key === null) {
            self::$key = jAuth::getRandomPassword(30, true);
        }

        $this->setupFramework();

        $localConfigIni = $this->entryPoint->localConfigIni;
        $key = $localConfigIni->getValue('persistant_crypt_key', 'coordplugin_auth');
        if ($key === 'exampleOfCryptKey' || $key == '') {
            $localConfigIni->getMaster()->setValue('persistant_crypt_key', self::$key, 'coordplugin_auth');
        }

        $conf = $this->getAuthConf();

        $dbProfile = $conf->getValue('profile', 'Db');
        $this->useDbProfile($dbProfile);

        if ($this->firstDbExec()) {
            $daoSelector = $conf->getValue('dao', 'Db');

            $mapper = new jDaoDbMapper($dbProfile);
            $table = $mapper->createTableFromDao($daoSelector);

            if ($this->getParameter('migratejauthdbusers')) {
                $this->migrateUsers($daoSelector);
            }
            else {
                $this->fillDefaultValues($daoSelector);

                $sourceUserDataModule = null;
                $sourceUserDataFile = '';
                $defaultUsers = $this->getParameter('defaultusers');

                if ($defaultUsers &&
                    is_string($defaultUsers) &&
                    preg_match("/^([a-zA-Z0-9_\.]+)~([a-zA-Z0-9_\.]+)$/", $defaultUsers, $m)
                ) {
                    list(,$sourceUserDataModule,$sourceUserDataFile) = $m;
                }
                else if ($this->getParameter('defaultuser')) {
                    $sourceUserDataFile = 'defaultuser.json';
                }

                if ($sourceUserDataFile) {
                    require_once(JELIX_LIB_PATH.'auth/jAuth.class.php');
                    $confIni = parse_ini_file($conf->getFileName(), true);
                    $authConfig = jAuth::loadConfig($confIni);
                    $driverConfig = $authConfig[$authConfig['driver']];
                    if ($authConfig['driver'] == 'Db' ||
                        (isset($driverConfig['compatiblewithdb']) &&
                            $driverConfig['compatiblewithdb'])
                    ) {
                        require_once(JELIX_LIB_PATH.'plugins/auth/db/db.auth.php');
                        $driver = new dbAuthDriver($driverConfig);
                        $this->insertUsers($driver, $daoSelector, $dbProfile, $sourceUserDataModule, $sourceUserDataFile);
                    }
                }
            }
        }


        if ($this->firstExec('preferences') && $this->getParameter('usejpref')) {
            if ($this->firstExec('acl2') && class_exists('jAcl2DbManager')) {
                jAcl2DbManager::addSubjectGroup('jcommunity.admin', 'jcommunity~prefs.admin.jcommunity');
                jAcl2DbManager::addSubject('jcommunity.prefs.change', 'jcommunity~prefs.admin.prefs.change', 'jprefs.prefs.management');
                jAcl2DbManager::addRight('admins', 'jcommunity.prefs.change'); // for admin group
            }
            if (!$this->config->getValue('disableJPref', 'jcommunity')) {
                if ($this->isJelix17()) {
                    $prefIni = new \Jelix\IniFile\IniModifier(__DIR__.'/prefs.ini');
                    $prefFile = jApp::appConfigPath('preferences.ini.php');
                    if (file_exists($prefFile)) {
                        $mainPref = new \Jelix\IniFile\IniModifier($prefFile);
                        //import this way to not erase changed value.
                        $prefIni->import($mainPref);
                    }
                }
                else {
                    $prefIni = new jIniFileModifier(__DIR__.'/prefs.ini');
                    $prefFile = jApp::configPath('preferences.ini.php');
                    if (file_exists($prefFile)) {
                        $mainPref = new jIniFileModifier($prefFile);
                        //import this way to not erase changed value.
                        $prefIni->import($mainPref);
                    }
                }
                $prefIni->saveAs($prefFile);
            }
        }
    }


    protected function migrateUsers($daoSelectorStr) {
        $dao = jDao::get($daoSelectorStr);
        $tableProp = $dao->getTables()[$dao->getPrimaryTable()];

        if ($tableProp['realname'] == 'jlx_user') {
            return;
        }

        $cn = $this->dbConnection();
        $targetFields = array();
        $properties = array('login', 'password', 'status', 'email', 'create_date');
        $daoProperties = $dao->getProperties();
        foreach($properties as $name) {
            if (!isset($daoProperties[$name])) {
                throw new Exception("Users migration: columns for property $name not found");
            }
            $targetFields[] = $cn->encloseName($daoProperties[$name]['fieldName']);
        }

        $sourceFields = array(
            $cn->encloseName('usr_login'),
            $cn->encloseName('usr_password'),
            '1',
            $cn->encloseName('usr_email')
        );

        if (isset($daoProperties['nickname'])) {
            $sourceFields[] = $cn->encloseName('usr_login');
            $targetFields[] = $cn->encloseName($daoProperties['nickname']['fieldName']);
        }

        $oldTable = $cn->schema()->getTable('jlx_user');
        $colCreateDate = $oldTable->getColumn('create_date');
        if ($colCreateDate) {
            $sourceFields[] = $cn->encloseName('create_date');
        }
        else {
            $sourceFields[] = "'".date('Y-m-d H:i:s')."'";
        }

        $sql = "INSERT INTO ".$cn->prefixTable($tableProp['realname']);
        $sql .= '('.implode(',', $targetFields).')';
        $sql .= ' SELECT '.implode(',', $sourceFields) . ' FROM '.$cn->prefixTable('jlx_user');
        $cn->exec($sql);
    }

    protected function fillDefaultValues($daoSelector) {
        $dao = jDao::get($daoSelector);

        $daoProperties = $dao->getProperties();
        $tableProp = $dao->getTables()[$dao->getPrimaryTable()];
        $cn = $this->dbConnection();

        if (isset($daoProperties['status'])) {
            $statusField = $cn->encloseName($daoProperties['status']['fieldName']);

            $sql = "UPDATE ".$cn->prefixTable($tableProp['realname']).
                " SET ".$statusField." = ".\Jelix\JCommunity\Account::STATUS_VALID.
                " WHERE ".$statusField." IS NULL";
            $cn->exec($sql);
        }

        if (isset($daoProperties['nickname'])) {
            $loginField = $cn->encloseName($daoProperties['login']['fieldName']);
            $nicknameField = $cn->encloseName($daoProperties['nickname']['fieldName']);

            $sql = "UPDATE ".$cn->prefixTable($tableProp['realname']).
                " SET ".$nicknameField." = ".$loginField.
                " WHERE ".$nicknameField." IS NULL or ".$nicknameField." = ''";
            $cn->exec($sql);
        }
    }

    protected function insertUsers($driver, $daoSelector, $dbProfile, $module, $relativeSourcePath) {

        if ($module) {
            $conf = $this->entryPoint->config->_modulesPathList;
            if (!isset($conf[$module])) {
                throw new Exception('insertUsers : invalid module name');
            }
            $path = $conf[$module];
        }
        else {
            $path = $this->path;
        }

        $file = $path.'install/'.$relativeSourcePath;
        $usersToInsert = json_decode(file_get_contents($file), true);
        if (!$usersToInsert) {
            throw new Exception("jCommunity install: Bad format for users data file $relativeSourcePath.");
        }
        if (is_object($usersToInsert)) {
            $usersToInsert = array($usersToInsert);
        }

        $dao = jDao::get($daoSelector, $dbProfile);
        foreach($usersToInsert as $userData) {
            $user = $dao->getByLogin($userData['login']);
            if (!$user) {
                if (isset($userData['_clear_password_to_be_encrypted'])) {
                    if (!isset($userData['password'])) {
                        $userData['password'] = $driver->cryptPassword($userData['_clear_password_to_be_encrypted']);
                    }
                    unset($userData['_clear_password_to_be_encrypted']);
                }
                $user = jDao::createRecord($daoSelector, $dbProfile);
                foreach ($userData as $property => $value) {
                    $user->$property = $value;
                }
                $dao->insert($user);
            }
        }
    }
}