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
        $localConfig = $this->entryPoint->localConfigIni;
        $authconfig = $localConfig->getValue('auth','coordplugins');
        $authconfigMaster = $localConfig->getValue('auth','coordplugins', null, true);
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
            if ($localConfig->getValue('loginResponse', 'jcommunity') != 'htmlauth') {
                $this->config->setValue('loginResponse', 'htmlauth', 'jcommunity');
            }
        }
    }

    protected function getAuthConf() {
        $authconfig = $this->entryPoint->localConfigIni->getValue('auth','coordplugins');
        $confPath = jApp::configPath($authconfig);
        $conf = new jIniFileModifier($confPath);
        return $conf;
    }

    function install() {

        if (self::$key === null) {
            self::$key = jAuth::getRandomPassword(30, true);
        }

        $this->setupFramework();

        $configIni = isset($this->entryPoint->liveConfigIni)?$this->entryPoint->liveConfigIni : $this->entryPoint->localConfigIni;
        $key = $configIni->getValue('persistant_crypt_key', 'coordplugin_auth');
        if ($key === 'exampleOfCryptKey' || $key == '') {
            if (isset($this->entryPoint->liveConfigIni)) {
                $configIni->setValue('persistant_crypt_key', self::$key, 'coordplugin_auth');
            }
            else {
                $configIni->getMaster()->setValue('persistant_crypt_key', self::$key, 'coordplugin_auth');
            }
        }

        $conf = $this->getAuthConf();

        $dbProfile = $conf->getValue('profile', 'Db');
        $this->useDbProfile($dbProfile);

        if ($this->firstDbExec()) {
            $daoSelector = $conf->getValue('dao', 'Db');

            // if the dao from jcommunity is used, lets use our own sql script
            // because we need to create a unique constraint, that is not
            // handle by jDaoMapper. Then we can use jDaoMapper to create
            // missing fields indicated into the dao (if overloaded)
            if ($daoSelector == 'jcommunity~user') {
                $this->execSQLScript('sql/install');
            }

            $mapper = new jDaoDbMapper($dbProfile);
            $mapper->createTableFromDao($daoSelector);

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
                    $sourceUserDataFile = 'defaultusers.json';
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
            if (!$this->entryPoint->localConfigIni->getValue('disableJPref', 'jcommunity')) {
                $prefIni = new jIniFileModifier(__DIR__.'/prefs.ini');
                $prefFile = jApp::configPath('preferences.ini.php');
                if (file_exists($prefFile)) {
                    $mainPref = new jIniFileModifier($prefFile);
                    //import this way to not erase changed value.
                    $prefIni->import($mainPref);
                }
                $prefIni->saveAs($prefFile);
            }
        }
    }


    protected function migrateUsers($daoSelectorStr) {
        $dao = jDao::get($daoSelectorStr);
        $tableProp = $dao->getTables()[$dao->getPrimaryTable()];
        $cn = $this->dbConnection();

        if ($tableProp['realname'] == $cn->prefixTable('jlx_user')) {
            return;
        }

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

        $sql = "INSERT INTO ".$tableProp['realname'];
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

            $sql = "UPDATE ".$tableProp['realname'].
                " SET ".$statusField." = ".\Jelix\JCommunity\Account::STATUS_VALID.
                " WHERE ".$statusField." IS NULL";
            $cn->exec($sql);
        }

        if (isset($daoProperties['nickname'])) {
            $loginField = $cn->encloseName($daoProperties['login']['fieldName']);
            $nicknameField = $cn->encloseName($daoProperties['nickname']['fieldName']);

            $sql = "UPDATE ".$tableProp['realname'].
                " SET ".$nicknameField." = ".$loginField.
                " WHERE ".$nicknameField." IS NULL or ".$nicknameField." = ''";
            $cn->exec($sql);
        }
    }

    /**
     * @param dbAuthDriver $driver
     * @param string $daoSelector
     * @param string $dbProfile
     * @param string $module
     * @param string $relativeSourcePath
     * @throws Exception
     */
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
        if ($usersToInsert === null) {
            throw new Exception("jCommunity install: Bad format for users data file $relativeSourcePath.");
        }
        if (is_object($usersToInsert)) {
            $usersToInsert = array($usersToInsert);
        }

        if (empty($usersToInsert)) {
            return ;
        }

        $dao = jDao::get($daoSelector, $dbProfile);
        foreach($usersToInsert as $userData) {
            $user = $dao->getByLogin($userData['login']);
            if (!$user) {
                if (isset($userData['password'])) {
                    $userData['password'] = $this->parsePassword($userData['password'], $userData['login'], $driver);
                }
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

    
    /**
     * Parse the password field value.
     * 
     * @param string $password The password field value ('__empty', '__to_encrypt:`password`', '__random' or the encrypted password)
     * @param string $login The login of the user being configured
     * @param dbAuthDriver $driver The database driver
     * 
     * @return string The password value to put in the db
     */
    protected function parsePassword($password, $login, $driver)
    {
        if (strncmp('__', $password, 2)) {
            return $password;
        }

        if ($password === '__empty') {
            return '';
        }

        if ($password === '__random') {
            $randomPass = \jAuth::getRandomPassword();
            echo 'Password for user '.$login.': '.$randomPass.PHP_EOL;
            return $driver->cryptPassword($randomPass);
        }

        $matches = array();
        if (preg_match('/__to_encrypt:(.*)/', $password, $matches)) {
            return $driver->cryptPassword($matches[1]);
        }

        return null;
    }
}