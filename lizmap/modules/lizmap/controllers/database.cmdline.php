<?php

use Lizmap\Logger\MigratorFromSqlite;

/**
 * @copyright 2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license   MPL-2.0
 */
class databaseCtrl extends jControllerCmdLine
{
    /**
     * Options to the command line
     *  'method_name' => array('-option_name' => true/false)
     * true means that a value should be provided for the option on the command line.
     */
    protected $allowed_options = array(
        'migratelog' => array(
            '-resetbefore' => false,
        ),
        'migrateusers' => array(
            '-resetbefore' => false,
        ),
    );

    /**
     * Parameters for the command line
     * 'method_name' => array('parameter_name' => true/false)
     * false means that the parameter is optional. All parameters which follow an optional parameter
     * is optional.
     */
    protected $allowed_parameters = array(
        'migratelog' => array(
        ),
        'migrateusers' => array(
        ),
    );

    /**
     * Help.
     */
    public $help = array(

        'migratelog' => 'Migrate log data from a sqlite database to the current database

        Use :
        php lizmap/scripts/script.php lizmap~database:migratelog

        ',
        'migrateusers' => 'Migrate users data from a sqlite database to the current database (experimental)

        Use :
        php lizmap/scripts/script.php lizmap~database:migrateusers

        ',
    );

    /**
     * Migrate log data from a sqlite database to the current database.
     */
    public function migratelog()
    {
        /** @var jResponseCmdline $rep */
        $rep = $this->getResponse();
        $logMigrator = new MigratorFromSqlite();
        $rep->addContent("Using this command is deprecated, all commands are now unified in console.php
        In lizmap folder, use 'php console.php database:migratelog'\n\n");

        try {
            $res = $logMigrator->migrateLog('lizlog', $this->option('-resetbefore'));
        } catch (UnexpectedValueException $e) {
            $rep->addContent('Error during the migration: '.$e->getMessage()."\n");
            $rep->setExitCode(1);

            return $rep;
        }

        switch ($res) {
            case $logMigrator::MIGRATE_RES_ALREADY_MIGRATED:
                $rep->addContent("It seems already migrated, there are some data into logCounter or logDetail table\n");

                break;

            case $logMigrator::MIGRATE_RES_OK:
                $rep->addContent("Migration done\n");

                break;

            case 0:
                $rep->addContent("Unknown error\n");

                break;

            default:
                $rep->addContent("Unknown result\n");
        }

        return $rep;
    }

    /**
     * Migrate users data from a sqlite database to the current database.
     */
    public function migrateusers()
    {
        /** @var jResponseCmdline $rep */
        $rep = $this->getResponse();
        $logMigrator = new Lizmap\Users\MigratorFromSqlite();
        $rep->addContent("Using this command is deprecated, all commands are now unified in console.php
        In lizmap folder, use 'php console.php database:migrateusers'\n\n");

        try {
            $res = $logMigrator->migrateUsersAndRights($this->option('-resetbefore'));
        } catch (UnexpectedValueException $e) {
            $rep->addContent('Error during the migration: '.$e->getMessage()."\n");
            $rep->setExitCode(1);

            return $rep;
        }

        switch ($res) {
            case $logMigrator::MIGRATE_RES_ALREADY_MIGRATED:
                $rep->addContent("It seems already migrated, there are some data into existing users tables\n");

                break;

            case $logMigrator::MIGRATE_RES_OK:
                $rep->addContent("Migration done\n");

                break;

            case 0:
                $rep->addContent("Unknown error\n");

                break;

            default:
                $rep->addContent("Unknown result\n");
        }

        return $rep;
    }
}
