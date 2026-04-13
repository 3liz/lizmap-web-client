<?php

/**
 * @author    3liz
 * @copyright 2019-2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Users;

use Lizmap\App\AbstractMigratorFromSqlite;

class MigratorFromSqlite extends AbstractMigratorFromSqlite
{
    public function migrateUsersAndRights($resetBefore = false, $forceMigration = false)
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
        } elseif (!$forceMigration && $daoUsersNew->countAll() > 0 || $daoGeoBkmNew->countAll() > 0) {
            return self::MIGRATE_RES_ALREADY_MIGRATED;
        }

        $this->prepareTablesCopy('oldjauth', $profile, $resetBefore);
        $this->copyTable($daoUserSelector, true, array('create_date'), true);
        $this->copyTable('jacl2db~jacl2group', false);
        $this->copyTable('jacl2db~jacl2subjectgroup', false);
        $this->copyTable('jacl2db~jacl2subject', false);

        if (!$resetBefore) {
            $this->deleteExistingRightsForImportedGroups();
        }
        $this->copyTable('jacl2db~jacl2usergroup', false);
        $this->copyTable('jacl2db~jacl2rights', false);
        $this->copyTable('lizmap~geobookmark', true);

        return self::MIGRATE_RES_OK;
    }

    protected function deleteExistingRightsForImportedGroups()
    {
        $oldDb = \jDb::getConnection($this->oldProfile);
        $newDb = \jDb::getConnection($this->newProfile);

        $rs = $oldDb->query('SELECT distinct(id_aclgrp) as id_aclgrp2 FROM '.$oldDb->prefixTable('jacl2_rights'));
        foreach ($rs as $rec) {
            $newDb->exec('DELETE FROM '.$newDb->prefixTable('jacl2_rights').' WHERE id_aclgrp = '.$newDb->quote($rec->id_aclgrp2));
        }

        $rs = $oldDb->query('SELECT distinct(login) as login2 FROM '.$oldDb->prefixTable('jacl2_user_group'));
        foreach ($rs as $rec) {
            $newDb->exec('DELETE FROM '.$newDb->prefixTable('jacl2_user_group').' WHERE login = '.$newDb->quote($rec->login2));
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
            throw new \UnexpectedValueException("No {$profileName} profile defined into profiles.ini.php", 1);
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

        // the table does not exist, let's create it
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
