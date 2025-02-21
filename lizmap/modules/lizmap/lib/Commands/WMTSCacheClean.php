<?php

namespace Lizmap\Commands;

use Jelix\FakeServerConf\ApacheMod;
use Jelix\Scripts\ModuleCommandAbstract;
use Lizmap\CliHelpers\WMTSCache;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class WMTSCacheClean extends ModuleCommandAbstract
{
    protected function configure()
    {
        $this
            ->setName('wmts:cache:clean')
            ->setDescription('Clear cache for a layer or a whole project')
            ->setHelp('')
            ->addArgument('repository', InputArgument::REQUIRED, 'The repository ID')
            ->addArgument('project', InputArgument::REQUIRED, 'The project name')
            ->addArgument('layer', InputArgument::OPTIONAL, 'The layer name for which you want to clear cache')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $req = new \jClassicRequest();

        $fakeServer = new ApacheMod(\jApp::wwwPath(), '/index.php');
        $fakeServer->setHttpRequest($req->getServerURI());

        $WMTSCache = new WMTSCache(function ($str) use ($output): void {$output->writeln($str); });
        $WMTSCache->clean(
            $input->getArgument('repository'),
            $input->getArgument('project'),
            $input->getArgument('layer'),
        );

        return 0;
    }
}
