<?php

namespace Lizmap\Commands;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class WMTSCacheClean extends \Jelix\Scripts\ModuleCommandAbstract
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

        $fakeServer = new \Jelix\FakeServerConf\ApacheMod(\jApp::wwwPath(), '/index.php');
        $fakeServer->setHttpRequest($req->getServerURI());

        $WMTSCache = new \Lizmap\CliHelpers\WMTSCache(function ($str) use ($output) {$output->writeln($str); });
        $WMTSCache->clean(
            $input->getArgument('repository'),
            $input->getArgument('project'),
            $input->getArgument('layer'),
        );

        return 0;
    }
}
