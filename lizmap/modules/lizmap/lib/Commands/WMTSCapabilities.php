<?php

namespace Lizmap\Commands;

use Jelix\FakeServerConf\ApacheMod;
use Jelix\Scripts\ModuleCommandAbstract;
use Lizmap\CliHelpers\WMTSCache;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class WMTSCapabilities extends ModuleCommandAbstract
{
    protected function configure()
    {
        // verbose option is provided by default, using setHelp to describe behaviour
        $this
            ->setName('wmts:capabilities')
            ->setDescription('Get seeding capabilities')
            ->setHelp('verbose option will provide tiles count for each TileMatrix')
            ->addArgument('repository', InputArgument::REQUIRED, 'The repository ID')
            ->addArgument('project', InputArgument::REQUIRED, 'The project name')
            ->addArgument('layer', InputArgument::OPTIONAL, 'The layer name for which you want to know capabilities')
            ->addArgument('TileMatrixSet', InputArgument::OPTIONAL, 'the TileMatrixSet (CRS) for which you want to know capabilites')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $req = new \jClassicRequest();

        $fakeServer = new ApacheMod(\jApp::wwwPath(), '/index.php');
        $fakeServer->setHttpRequest($req->getServerURI());

        $WMTSCache = new WMTSCache(function ($str) use ($output): void {$output->writeln($str); });

        return $WMTSCache->capabilities(
            $input->getArgument('repository'),
            $input->getArgument('project'),
            $input->getArgument('layer'),
            $input->getArgument('TileMatrixSet'),
            $input->getOption('verbose')
        );
    }
}
