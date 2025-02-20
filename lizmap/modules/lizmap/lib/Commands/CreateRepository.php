<?php

namespace Lizmap\Commands;

use Jelix\Scripts\ModuleCommandAbstract;
use Lizmap\CliHelpers\RepositoryCreator;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateRepository extends ModuleCommandAbstract
{
    protected function configure()
    {
        $this
            ->setName('repository:create')
            ->setDescription('Create repository with provided params')
            ->setHelp('')
            ->addArgument(
                'key',
                InputArgument::REQUIRED,
                'the repository Id '
            )
            ->addArgument(
                'label',
                InputArgument::REQUIRED,
                'the repository label'
            )
            ->addArgument(
                'path',
                InputArgument::REQUIRED,
                'the repository path (absolute or relative to root repositories path)'
            )
            ->addArgument(
                'allowUserDefinedThemes',
                InputArgument::OPTIONAL,
                'boolean to activate the theme capabilities directly in repository'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        try {
            $cli = new RepositoryCreator();
            $cli->create(
                $input->getArgument('key'),
                $input->getArgument('label'),
                $input->getArgument('path'),
                $input->getArgument('allowUserDefinedThemes')
            );
        } catch (\Exception $e) {
            $output->writeln("The repository can't be created ! : ");
            $output->writeln($e->getMessage());

            return 1;
        }
        $output->writeln('The repository has been created!');

        return 0;
    }
}
