<?php

namespace Lizmap\Commands;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class WMTSSeed extends \Jelix\Scripts\ModuleCommandAbstract
{
    protected function configure()
    {
        // verbose option is provided by default, using setHelp to describe behaviour
        $this
            ->setName('wmts:cache:seed')
            ->setDescription('Generate cache for a layer')
            ->setHelp('verbose option will provide more info')
            ->addArgument('repository', InputArgument::REQUIRED, 'The repository ID')
            ->addArgument('project', InputArgument::REQUIRED, 'The project name')
            ->addArgument('layers', InputArgument::REQUIRED, 'Comma separated layers list or \'*\' ')
            ->addArgument('TileMatrixSet', InputArgument::REQUIRED, 'the TileMatrixSet (CRS) for which you want to generate cache')
            ->addArgument('TileMatrixMin', InputArgument::REQUIRED, 'the min zoom level to generate')
            ->addArgument('TileMatrixMax', InputArgument::REQUIRED, 'the max zoom level to generate')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'will not generate the cache, only output statistics')
            ->addOption('bbox', null, InputOption::VALUE_REQUIRED, 'bounding box to restrict generation (4 comma separated values)')
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'force cache generation even if cache exists')

        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $req = new \jClassicRequest();

        $fakeServer = new \Jelix\FakeServerConf\ApacheMod(\jApp::wwwPath(), '/index.php');
        $fakeServer->setHttpRequest($req->getServerURI());
        $tileMatrixMin = $input->getArgument('TileMatrixMin');
        $tileMatrixMax = $input->getArgument('TileMatrixMax');
        if (!(filter_var($tileMatrixMin, FILTER_VALIDATE_INT) && filter_var($tileMatrixMax, FILTER_VALIDATE_INT))) {
            $output->writeln('<error>TileMatrixMin and TileMatrixMax must be of type int</error>');

            return 1;
        }
        if ($tileMatrixMax < $tileMatrixMin) {
            $output->writeln('<error>TileMatrixMax must be greater or equal to TileMatrixMin</error>');

            return 1;
        }
        $WMTSCache = new \Lizmap\CliHelpers\WMTSCache(function ($str) use ($output) {$output->writeln($str); });

        return $WMTSCache->seed(
            $input->getArgument('repository'),
            $input->getArgument('project'),
            $input->getArgument('layers'),
            $input->getArgument('TileMatrixSet'),
            $tileMatrixMin,
            $tileMatrixMax,
            $input->getOption('bbox'),
            $input->getOption('verbose'),
            $input->getOption('dry-run'),
            $input->getOption('force')
        );
    }
}
