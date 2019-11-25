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


class MigratorFromSqlite {

    function __construct()
    {

    }

    const MIGRATE_RES_OK = 1;
    const MIGRATE_RES_ALREADY_MIGRATED = 2;

    protected function copyTable($daoSelector, $oldProfile, $newProfile)
    {
        $daoNew = \jDao::get($daoSelector, $newProfile);
        $daoSqlite = \jDao::create($daoSelector, $oldProfile);
        $properties = array_keys($daoSqlite->getProperties());
        foreach($daoSqlite->findAll() as $rec) {
            $daoRec = \jDao::createRecord($daoSelector, $newProfile);
            foreach($properties as $prop) {
                $daoRec->$prop = $rec->$prop;
            }
            $daoNew->insert($daoRec);
        }
    }

    function migrateLog($profileName = 'lizlog') {

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

        if ($daoCounterNew->countAll() > 0 || $daoDetailsNew->countAll() > 0) {
            return self::MIGRATE_RES_ALREADY_MIGRATED;
        }

        $this->copyTable('lizmap~logCounter', 'oldlizlog', $profileName);
        $this->copyTable('lizmap~logDetail', 'oldlizlog', $profileName);

        return self::MIGRATE_RES_OK;
    }


    protected function createLogTables($profile) {

        $db = \jDb::getConnection($profile);
        $tools = $db->tools();
        $file = \jApp::getModulePath('lizmap').'/install/sql/lizlog.'.$db->dbms.'.sql';
        $db->beginTransaction();
        try {
            $tools->execSQLScript($file);
            $db->commit();
        }
        catch(\Exception $e) {
            $db->rollback();
            throw $e;
        }
    }
}
