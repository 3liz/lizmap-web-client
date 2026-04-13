<?php

/**
 * @author    3liz
 * @copyright 2019-2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Logger;

use Lizmap\App\AbstractMigratorFromSqlite;

class MigratorFromSqlite extends AbstractMigratorFromSqlite
{
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
        $this->copyTable('lizmap~logDetail', 'oldlizlog', $profileName, true, array('log_timestamp'));

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
