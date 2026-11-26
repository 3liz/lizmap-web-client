<?php

use Jelix\FileUtilities\Directory;
use Jelix\Scripts\SingleCommandApplication;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

require __DIR__.'/../../vendor/autoload.php';

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
                'path to the lizmap-modules directory of the previous Lizmap installation'
            )
        ;
    }

    protected static $packagesVersions = array (
        'arno974/lizmap-altiprofil' => '^0.3.0',
        'jelix/composer-module-setup' => '^1.1.0',
        'jelix/multiauth-module' => '^2.0.0',
        'jelix/saml-module' => '^2.11.0',
        'lizmap/lizmap-adresse-module' => '^1.4.0',
        'lizmap/lizmap-cadastre-module' => '^2.3.0',
        'lizmap/lizmap-gobsapi-module' => '^0.5.0',
        'lizmap/lizmap-import-module' => '^1.5.0',
        'lizmap/lizmap-mapbuilder-module' => '^2.4.0',
        'lizmap/lizmap-multiedit-module ' => '^1.3.0',
        'lizmap/lizmap-netads-module' => '^1.0.0',
        'lizmap/lizmap-openads-module' => '^1.1.0',
        'lizmap/lizmap-pgmetadata-module' => '^1.0.0',
        'lizmap/lizmap-pgrouting-module' => '^1.1.0',
        'lizmap/lizmap-presentation-module' => '^1.4.0',
        'lizmap/lizmap-wps-web-client' => '^0.5.0',
        'lizmap/lizmap-webdav-module' => '^1.2.0',
        'lizmap/naturaliz-modules' => '^2.18.0',
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
        'import' => 'lizmap/lizmap-import-module',
        'mapBuilder' => 'lizmap/lizmap-mapbuilder-module',
        'mapBuilderAdmin' => 'lizmap/lizmap-mapbuilder-module',
        'multiedit' => 'lizmap/lizmap-multiedit-module',
        'openads' => 'lizmap/lizmap-openads-module',
        'pgmetadata' => 'lizmap/lizmap-pgmetadata-module',
        'pgmetadataAdmin' => 'lizmap/lizmap-pgmetadata-module',
        'pgrouting' => 'lizmap/lizmap-pgrouting-module',
        'presentation' => 'lizmap/lizmap-presentation-module',
        'webdav' => 'lizmap/lizmap-webdav-module',
        'wps' => 'lizmap/lizmap-wps-web-client',
    );

    /** @var string[] packages to remove or to replace because there are deprecated or there is a better alternative to */
    protected static $packagesToReplace = array(
        'jelix/ldapdao-module' => 'jelix/multiauth-module'
    );

    protected function execute(InputInterface $input, OutputInterface $output)
    {

        $file = $input->getArgument('file');
        if (!file_exists($file)) {
            throw new Exception('Unknown file');
        }

        $lizmapModulesDir = $input->getArgument('lizmap-modules');
        if ($lizmapModulesDir && !file_exists($lizmapModulesDir)) {
            throw new Exception('Unknown lizmap-modules directory');
        }

        $composerJson = json_decode(file_get_contents($file), true);
        if (!is_array($composerJson)) {
            throw new Exception('Bad JSON content into the given file');
        }

        if (!isset($composerJson['require']) || !is_array($composerJson['require'])) {
            return 0;
        }

        $packagesToRemove = [];
        foreach ($composerJson['require'] as $packageName => $packageVersion) {
            if (isset(self::$packagesVersions[$packageName])) {
                $composerJson['require'][$packageName] = self::$packagesVersions[$packageName];
            }
            else if (isset(self::$packagesToReplace[$packageName])) {
                $newPackage = self::$packagesToReplace[$packageName];
                if ($newPackage) {
                    $composerJson['require'][$newPackage] = self::$packagesVersions[$newPackage];
                }
                $packagesToRemove[] = $packageName;
            }
        }

        if (count($packagesToRemove) > 0) {
            foreach ($packagesToRemove as $packageName) {
                unset($composerJson['require'][$packageName]);
            }
        }

        if ($lizmapModulesDir) {
            $this->updateLizmapModules($composerJson, $lizmapModulesDir);
        }


        $oldInstallerFile = realpath($lizmapModulesDir.'/../var/config/installer.ini.php');
        if (file_exists($oldInstallerFile)) {
            $ini = parse_ini_file($oldInstallerFile, true);
            if (isset($ini['modules']['ldapdao.installed']) && $ini['modules']['ldapdao.installed']) {
                $composerJson['require']['jelix/multiauth-module'] = self::$packagesVersions['jelix/multiauth-module'];
            }
        }

        file_put_contents($file, json_encode($composerJson, JSON_PRETTY_PRINT));

        return 0;
    }

    protected function updateLizmapModules(array &$composerJson, string $lizmapModulesDir)
    {
        $dir = new DirectoryIterator($lizmapModulesDir);
        foreach ($dir as $dirContent) {
            if (!$dirContent->isDot() && $dirContent->isDir()) {
                $moduleName = $dirContent->getFilename();
                if (isset(self::$moduleDirPackages[$moduleName])) {
                    $package = self::$moduleDirPackages[$moduleName];
                    $composerJson['require'][$package] = self::$packagesVersions[$package];
                    Directory::remove($dirContent->getPathname());
                }
            }
        }
        unset($dir, $dirContent);

    }
}

$application = new Application('composer.json updater');

$application = new SingleCommandApplication(
    new ComposerVersionUpdaterCommand(),
    'composerversion'
);

$application->run();
