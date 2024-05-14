<?php

use Jelix\Scripts\SingleCommandApplication;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

require(__DIR__.'/../../vendor/autoload.php');

/**
 *
 */
class ComposerVersionUpdaterCommand extends Command
{
    protected function configure()
    {
        $this
            ->setName('composer:updater')
            ->setDescription('Update version of some packages into composer.json')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'path to the composer.json file'
            )
            ->addArgument(
                'lizmap-modules',
                InputArgument::OPTIONAL,
                'path to the lizmap-modules directory'
            )
        ;
    }

    protected static $packagesVersions = array(
        'arno974/lizmap-altiprofil' => '^0.3.0',
        'jelix/composer-module-setup' => '^1.1.0',
        'jelix/multiauth-module' => '^1.2.1',
        'jelix/saml-module' => '^2.1.0',
        'lizmap/lizmap-adresse-module' => '^1.1.0',
        'lizmap/lizmap-cadastre-module' => '^2.0.0',
        'lizmap/lizmap-gobsapi-module' => '^0.5.0',
        'lizmap/lizmap-mapbuilder-module' => '^2.1.0',
        'lizmap/lizmap-openads-module' => '^1.1.0',
        'lizmap/lizmap-pgmetadata-module' => '^1.0.0',
        'lizmap/lizmap-pgrouting-module' => '^0.3.0',
        'lizmap/lizmap-wps-web-client' => '^0.2.0',
        'lizmap/naturaliz-modules' => '^2.13.0',
    );

    protected static $moduleDirPackages = array(
        'altiProfil' => 'arno974/lizmap-altiprofil',
        'altiProfilAdmin' => 'arno974/lizmap-altiprofil',
        'multiauth' => 'jelix/multiauth-module',
        'saml' => 'jelix/saml-module',
        'samladmin' => 'jelix/saml-module',
        'adresse' => 'lizmap/lizmap-adresse-module',
        'cadastre' => 'lizmap/lizmap-cadastre-module',
        'gobsapi' => 'lizmap/lizmap-gobsapi-module',
        'mapBuilder' => 'lizmap/lizmap-mapbuilder-module',
        'mapBuilderAdmin' => 'lizmap/lizmap-mapbuilder-module',
        'openads' => 'lizmap/lizmap-openads-module',
        'pgmetadata' => 'lizmap/lizmap-pgmetadata-module',
        'pgmetadataAdmin' => 'lizmap/lizmap-pgmetadata-module',
        'pgrouting' => 'lizmap/lizmap-pgrouting-module',
        'wps' => 'lizmap/lizmap-wps-web-client',
    );

    protected function execute(InputInterface $input, OutputInterface $output)
    {

        $file = $input->getArgument('file');
        if (!file_exists($file)) {
            throw new \Exception('Unknown file');
        }

        $lizmapModulesDir = $input->getArgument('lizmap-modules');
        if ($lizmapModulesDir && !file_exists($lizmapModulesDir)) {
            throw new \Exception('Unknown lizmap-modules directory');
        }

        $composerJson = json_decode(file_get_contents($file), true);
        if (!is_array($composerJson)) {
            throw new \Exception('Bad JSON content into the given file');
        }

        if (!isset($composerJson['require']) || !is_array($composerJson['require'])) {
            return 0;
        }

        foreach($composerJson['require'] as $packageName => $packageVersion)
        {
            if (isset(self::$packagesVersions[$packageName])) {
                $composerJson['require'][$packageName] = self::$packagesVersions[$packageName];
            }
        }

        if ($lizmapModulesDir) {
            $this->updateLizmapModules($composerJson, $lizmapModulesDir);
        }

        file_put_contents($file, json_encode($composerJson, JSON_PRETTY_PRINT));

        return 0;
    }

    protected function updateLizmapModules(array &$composerJson, string $lizmapModulesDir)
    {
        $dir = new \DirectoryIterator($lizmapModulesDir);
        foreach ($dir as $dirContent) {
            if (!$dirContent->isDot() && $dirContent->isDir()) {
                $moduleName = $dirContent->getFilename();
                if (isset(self::$moduleDirPackages[$moduleName])) {
                    $package = self::$moduleDirPackages[$moduleName];
                    $composerJson['require'][$package] =  self::$packagesVersions[$package];
                    \Jelix\FileUtilities\Directory::remove($dirContent->getPathname());
                }
            }
        }
        unset($dir);
        unset($dirContent);
    }
}

$application = new Application('composer.json updater');

$application = new SingleCommandApplication(
    new ComposerVersionUpdaterCommand(),
    'composerversion'
);

$application->run();
