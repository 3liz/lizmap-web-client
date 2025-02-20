<?php

/**
 * @author    3liz
 * @copyright 2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Logger;

class MigratorFromSqlite
{
    public function __construct() {}

    public const MIGRATE_RES_OK = 1;
    public const MIGRATE_RES_ALREADY_MIGRATED = 2;

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

    public function migrateLog($profileName = 'lizlog', $resetBefore = false)
    {
        $profile = \jProfiles::get('jdb', $profileName);
        if (!$profile) {
            throw new \UnexpectedValueException('No lizlog profile defined into profiles.ini.php', 1);
        }

        if ($profile['driver'] == 'sqlite3') {
            throw new \UnexpectedValueException('Database for lizlog is still sqlite3. Configure the lizlog profile onto an other database type into profiles.ini.php', 2);
        }

        $sqliteFile = \jApp::varPath('db/logs.db');
        if (!file_exists($sqliteFile)) {
            throw new \UnexpectedValueException('No logs.db file containing logs to migrate', 3);
        }

        $jdbParams = array(
            'driver' => 'sqlite3',
            'database' => 'var:db/logs.db',
        );

        // Create the virtual jdb profile
        \jProfiles::createVirtualProfile('jdb', 'oldlizlog', $jdbParams);
        $this->createLogTables($profileName);

        $daoCounterNew = \jDao::create('lizmap~logCounter', $profileName);
        $daoDetailsNew = \jDao::get('lizmap~logDetail', $profileName);

        if ($resetBefore) {
            $db = \jDb::getConnection($profileName);
            $table = $daoCounterNew->getTables()[$daoCounterNew->getPrimaryTable()]['realname'];
            $db->exec('DELETE FROM '.$db->prefixTable($table));
            $table = $daoDetailsNew->getTables()[$daoDetailsNew->getPrimaryTable()]['realname'];
            $db->exec('DELETE FROM '.$db->prefixTable($table));
        } elseif ($daoCounterNew->countAll() > 0 || $daoDetailsNew->countAll() > 0) {
            return self::MIGRATE_RES_ALREADY_MIGRATED;
        }

        $this->copyTable('lizmap~logCounter', 'oldlizlog', $profileName);
        $this->copyTable('lizmap~logDetail', 'oldlizlog', $profileName);

        return self::MIGRATE_RES_OK;
    }

    protected function createLogTables($profile)
    {
        $db = \jDb::getConnection($profile);
        $tools = $db->tools();
        $file = \jApp::getModulePath('lizmap').'/install/sql/lizlog.'.$db->dbms.'.sql';
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
