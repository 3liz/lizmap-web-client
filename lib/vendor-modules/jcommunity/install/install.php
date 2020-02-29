<?php

/**
 * @package     jcommunity
 * @author      Laurent Jouanneau
 * @contributor
 * @copyright   2010-2018 Laurent Jouanneau
 * @link      https://github.com/laurentj/jcommunity
 * @license  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

use Jelix\IniFile\IniModifierInterface;
use Jelix\IniFile\IniModifier;
use Jelix\Installer\Module\API\DatabaseHelpers;
use Jelix\Installer\Module\API\InstallHelpers;
use Jelix\Installer\EntryPoint;


class jcommunityModuleInstaller extends \Jelix\Installer\Module\Installer {

    protected function getAuthConf(IniModifierInterface $configIni) {
        $authconfig = $configIni->getValue('auth','coordplugins');
        $confPath = jApp::appSystemPath($authconfig);
        $conf = new IniModifier($confPath);
        return $conf;
    }

    protected $daoProcessed = array();

    function install(InstallHelpers $helpers)
    {
        // create random key for persistant authentication
        $configIni = $helpers->getLiveConfigIni();
        $currentKey = $configIni->getValue('persistant_crypt_key', 'coordplugin_auth');
        if ($currentKey === 'exampleOfCryptKey' || $currentKey == '') {
            $cryptokey = \Defuse\Crypto\Key::createNewRandomKey();
            $key = $cryptokey->saveToAsciiSafeString();
            $configIni->setValue('persistant_crypt_key', $key, 'coordplugin_auth');
        }

        foreach ($this->getParameter('eps') as $epId) {
            $entryPoint = $helpers->getEntryPointsById($epId);
            $configIni = $entryPoint->getConfigIni();
            $conf = $this->getAuthConf($configIni);
            $daoSelector = $conf->getValue('dao', 'Db');
            if (!isset($this->daoProcessed[$daoSelector])) {
                $this->daoProcessed[$daoSelector] = true;
                $this->_installForEntrypoint($helpers, $entryPoint, $conf);
            }
        }

        if ($this->getParameter('usejpref')) {
            if (class_exists('jAcl2DbManager')) {
                jAcl2DbManager::addSubjectGroup('jcommunity.admin', 'jcommunity~prefs.admin.jcommunity');
                jAcl2DbManager::addSubject('jcommunity.prefs.change', 'jcommunity~prefs.admin.prefs.change', 'jprefs.prefs.management');
                jAcl2DbManager::addRight('admins', 'jcommunity.prefs.change'); // for admin group
            }
        }
    }

    protected function _installForEntrypoint(InstallHelpers $helpers, EntryPoint $entryPoint, IniModifier $authConf) {

        $dbProfile = $authConf->getValue('profile', 'Db');
        $database = $helpers->database();
        $database->useDbProfile($dbProfile);

        $daoSelector = $authConf->getValue('dao', 'Db');

        // if the dao from jcommunity is used, lets use our own sql script
        // because we need to create a unique constraint, that is not
        // handle by jDaoMapper. Then we can use jDaoMapper to create
        // missing fields indicated into the dao (if overloaded)
        if ($daoSelector == 'jcommunity~user') {
            $helpers->database()->execSQLScript('sql/install');
        }

        $mapper = new jDaoDbMapper($dbProfile);
        $mapper->createTableFromDao($daoSelector);

        if ($this->getParameter('migratejauthdbusers')) {
            $this->migrateUsers($database, $daoSelector);
        }
        else {
            $this->fillDefaultValues($database, $daoSelector);

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
                $confIni = parse_ini_file($authConf->getFileName(), true);
                $authConfig = jAuth::loadConfig($confIni);
                $driverConfig = $authConfig[$authConfig['driver']];
                if ($authConfig['driver'] == 'Db' ||
                    (isset($driverConfig['compatiblewithdb']) &&
                        $driverConfig['compatiblewithdb'])
                ) {
                    require_once(JELIX_LIB_PATH.'plugins/auth/db/db.auth.php');
                    $driver = new dbAuthDriver($driverConfig);
                    $this->insertUsers($helpers, $entryPoint, $driver, $daoSelector, $dbProfile, $sourceUserDataModule, $sourceUserDataFile);
                }
            }
        }

    }

    /**
     * Migrate users from the jlx_user table to the jcommunity user table
     * @param string $daoSelectorStr dao selector of the jcommunity table
     * @throws jException
     */
    protected function migrateUsers(DatabaseHelpers $database, $daoSelectorStr) {
        $dao = jDao::get($daoSelectorStr);
        $tableProp = $dao->getTables()[$dao->getPrimaryTable()];
        $cn = $database->dbConnection();

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

    protected function fillDefaultValues(DatabaseHelpers $helpers, $daoSelector) {
        $dao = jDao::get($daoSelector);

        $daoProperties = $dao->getProperties();
        $tableProp = $dao->getTables()[$dao->getPrimaryTable()];
        $cn = $helpers->dbConnection();

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
     * @param InstallHelpers $helpers
     * @param EntryPoint $entryPoint
     * @param dbAuthDriver $driver
     * @param string $daoSelector
     * @param string $dbProfile
     * @param string $module
     * @param string $relativeSourcePath
     * @throws Exception
     */
    protected function insertUsers(InstallHelpers $helpers, EntryPoint $entryPoint, $driver, $daoSelector, $dbProfile, $module, $relativeSourcePath) {

        if ($module) {
            $conf = $entryPoint->getConfigObj()->_modulesPathList;
            if (!isset($conf[$module])) {
                throw new Exception('insertUsers : invalid module name');
            }
            $path = $conf[$module];
        }
        else {
            $path = $this->getPath();
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