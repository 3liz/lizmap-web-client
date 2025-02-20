<?php

namespace Lizmap\Commands;

use Jelix\FakeServerConf\ApacheMod;
use Jelix\Scripts\ModuleCommandAbstract;
use Lizmap\CliHelpers\RepositoryWMSChecker;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

require JELIX_LIB_CORE_PATH.'request/jClassicRequest.class.php';

class ProjectLoad extends ModuleCommandAbstract
{
    protected function configure()
    {
        $this
            ->setName('project:load')
            ->setDescription('Test each projets by sending WMS Capabilities')
            ->setHelp('')
            ->addArgument('nb', InputArgument::OPTIONAL, 'number of iteration on each project', 1)
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $req = new \jClassicRequest();

        $fakeServer = new ApacheMod(\jApp::wwwPath(), '/index.php');
        $fakeServer->setHttpRequest($req->getServerURI());

        $nb = $input->getArgument('nb');
        if ((!filter_var($nb, FILTER_VALIDATE_INT)) || $nb <= 0) {
            $output->writeln('<error>nb must be a number > 0 </error>'.$nb);

            return 1;
        }
        $checker = new RepositoryWMSChecker();
        $checker->checkAllRepository($nb, function ($str) use ($output): void {$output->writeln($str); });

        return 0;
    }
}
