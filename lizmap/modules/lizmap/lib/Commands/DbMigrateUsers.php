<?php

namespace Lizmap\Commands;

use Jelix\Scripts\ModuleCommandAbstract;
use Lizmap\Users\MigratorFromSqlite;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

// See controllers/database.cmdline.php
class DbMigrateUsers extends ModuleCommandAbstract
{
    protected function configure()
    {
        $this
            ->setName('database:migrateusers')
            ->setDescription('Migrate users data from a sqlite database to the current database (experimental)')
            ->setHelp('')
            ->addOption('resetbefore', null, InputOption::VALUE_NONE, 'Delete target db before migrating')
            ->addOption('force', null, InputOption::VALUE_NONE, 'Force migration if there are already some data')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $usersMigrator = new MigratorFromSqlite();

        try {
            $res = $usersMigrator->migrateUsersAndRights($input->getOption('resetbefore'), $input->getOption('force'));
        } catch (\UnexpectedValueException $e) {
            $output->writeln('Error during the migration: '.$e->getMessage());

            return 1;
        }

        switch ($res) {
            case $usersMigrator::MIGRATE_RES_ALREADY_MIGRATED:
                $output->writeln('It seems already migrated, there are some data into existing users tables');

                break;

            case $usersMigrator::MIGRATE_RES_OK:
                $output->writeln('Migration done');

                break;

            case 0:
                $output->writeln('Unknown error');

                break;

            default:
                $output->writeln('Unknown result');
        }

        return 0;
    }
}
