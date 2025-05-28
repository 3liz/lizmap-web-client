<?php

/**
 * @author    3liz
 * @copyright 2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Users;

class MigratorFromSqlite
{
    public function __construct() {}

    public const MIGRATE_RES_OK = 1;
    public const MIGRATE_RES_ALREADY_MIGRATED = 2;

    public function migrateUsersAndRights($resetBefore = false)
    {
        $sqliteFile = \jApp::varPath('db/jauth.db');
        if (!file_exists($sqliteFile)) {
            throw new \UnexpectedValueException('No jauth.db file containing users to migrate', 3);
        }

        list($daoUserSelector, $profile) = $this->createUsersTables();
        $this->createAclTables($profile);

        $jdbParams = array(
            'driver' => 'sqlite3',
            'database' => 'var:db/jauth.db',
        );

        // Create the virtual jdb profile
        \jProfiles::createVirtualProfile('jdb', 'oldjauth', $jdbParams);

        $daoUsersNew = \jDao::create($daoUserSelector, $profile);
        $daoGeoBkmNew = \jDao::get('lizmap~geobookmark', $profile);

        if ($resetBefore) {
            $db = \jDb::getConnection($profile);
            $table = $daoGeoBkmNew->getTables()[$daoGeoBkmNew->getPrimaryTable()]['realname'];
            $db->exec('DELETE FROM '.$db->prefixTable($table));
            $db->exec('DELETE FROM '.$db->prefixTable('jacl2_rights'));
            $db->exec('DELETE FROM '.$db->prefixTable('jacl2_user_group'));
            $db->exec('DELETE FROM '.$db->prefixTable('jacl2_subject'));
            $db->exec('DELETE FROM '.$db->prefixTable('jacl2_subject_group'));
            $db->exec('DELETE FROM '.$db->prefixTable('jacl2_group'));
            $table = $daoUsersNew->getTables()[$daoUsersNew->getPrimaryTable()]['realname'];
            $db->exec('DELETE FROM '.$db->prefixTable($table));
        } elseif ($daoUsersNew->countAll() > 0 || $daoGeoBkmNew->countAll() > 0) {
            return self::MIGRATE_RES_ALREADY_MIGRATED;
        }

        $this->copyTable($daoUserSelector, 'oldjauth', $profile);
        $this->copyTable('jacl2db~jacl2group', 'oldjauth', $profile, false);
        $this->copyTable('jacl2db~jacl2subjectgroup', 'oldjauth', $profile, false);
        $this->copyTable('jacl2db~jacl2subject', 'oldjauth', $profile, false);
        $this->copyTable('jacl2db~jacl2usergroup', 'oldjauth', $profile, false);
        $this->copyTable('jacl2db~jacl2rights', 'oldjauth', $profile, false);
        $this->copyTable('lizmap~geobookmark', 'oldjauth', $profile, true);

        return self::MIGRATE_RES_OK;
    }

    protected function copyTable($daoSelector, $oldProfile, $newProfile, $updateSequence = true)
    {
        $daoNew = \jDao::get($daoSelector, $newProfile);
        $daoSqlite = \jDao::create($daoSelector, $oldProfile);
        $properties = array_keys($daoSqlite->getProperties());
        foreach ($daoSqlite->findAll() as $rec) {
            $daoRec = \jDao::createRecord($daoSelector, $newProfile);
            foreach ($properties as $prop) {
                $daoRec->{$prop} = $rec->{$prop};
            }

            try {
                $daoNew->insert($daoRec);
            } catch (\Exception $e) {
                echo '*** Insert ERROR for the record ';
                var_export($rec->getPk());
                echo "\nError is: ".$e->getMessage()."\n";
            }
        }

        if ($updateSequence) {
            $idField = $daoNew->getProperties()[$daoNew->getPrimaryKeyNames()[0]]['fieldName'];
            $table = $daoNew->getTables()[$daoNew->getPrimaryTable()]['realname'];

            $conn = \jDb::getConnection($newProfile);
            $rs = $conn->query('SELECT pg_get_serial_sequence('.$conn->quote($table).','.$conn->quote($idField).') as sequence_name');
            if ($rs && ($rec = $rs->fetch())) {
                $sequence = $rec->sequence_name;
                if ($sequence) {
                    $conn->query('SELECT setval('.$conn->quote($sequence).',
                    (SELECT max('.$conn->encloseName($idField).')
                    FROM '.$conn->encloseName($table).'))');
                }
            }
        }
    }

    protected function createUsersTables()
    {
        // retrieve the configuration of jauth
        $config = \jIniFile::read(\jApp::appSystemPath('admin/auth.coord.ini.php'));

        // retrieve the driver used from the global configuration if exists
        if (isset(\jApp::config()->coordplugin_auth, \jApp::config()->coordplugin_auth['driver'])) {
            $config['driver'] = trim(\jApp::config()->coordplugin_auth['driver']);
        }

        // retrieve the dao selector from the driver configuration
        $daoSelector = $config[$config['driver']]['dao'];
        $profileName = $config[$config['driver']]['profile'];

        $profile = \jProfiles::get('jdb', $profileName);
        if (!$profile) {
            throw new \UnexpectedValueException("No {$profile} profile defined into profiles.ini.php", 1);
        }

        if ($profile['driver'] == 'sqlite3') {
            throw new \UnexpectedValueException('Database for jAuth is still sqlite3. Configure the jauth profile ontop an other database type into profiles.ini.php', 2);
        }

        // verify that the table already exists or not
        $db = \jDb::getConnection($profileName);
        $schema = $db->schema();
        $table = $schema->getTable('jlx_user');
        if ($table) {
            return array($daoSelector, $profileName);
        }

        // the table does not exists, let's create it
        $mapper = new \jDaoDbMapper($profileName);
        $mapper->createTableFromDao($daoSelector);

        $tools = $db->tools();
        $file = \jApp::getModulePath('lizmap').'/install/sql/lizgeobookmark.'.$db->dbms.'.sql';
        $db->beginTransaction();

        try {
            $tools->execSQLScript($file);
            $db->commit();
        } catch (\Exception $e) {
            $db->rollback();

            throw $e;
        }

        return array($daoSelector, $profileName);
    }

    protected function createAclTables($profile)
    {
        $db = \jDb::getConnection($profile);
        $tools = $db->tools();
        $file = \jApp::getModulePath('jacl2db').'/install/install_jacl2.schema.'.$db->dbms.'.sql';
        $db->beginTransaction();

        try {
            $tools->execSQLScript($file);
            $db->commit();
        } catch (\Exception $e) {
            $db->rollback();

            throw $e;
        }
    }
}
