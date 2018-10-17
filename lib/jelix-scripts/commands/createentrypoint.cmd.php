<?php

/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor
* @copyright   2008-2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class createentrypointCommand extends JelixScriptCommand {

    public  $name = 'createentrypoint';
    public  $allowed_options = array('-type'=>true, '-dont-copy-config'=>false);
    public  $allowed_parameters = array('name'=>true, 'config'=>false);

    public  $syntaxhelp = "[-type a_type] [-copy-config configfile] NAME [CONFIG]";
    public  $help = '';

    function __construct($config){
        $this->help= array(
            'fr'=>"
    Crée un nouveau point d'entrée dans le répertoire www de l'application, en
    utilisant le nom NAME donné en paramètre, et installe l'application
    pour ce point d'entrée. Le fichier de configuration CONFIG sera utilisé
    pour ce point d'entrée.
    il sera crée si il n'existe pas déjà. Lors de la création, le fichier
    de configuration indiqué dans le paramètre -copy-config sera utilisé comme
    modèle.

    L'option -type indique le type de point d'entrée : classic, jsonrpc,
    xmlrpc, soap, cmdline.

    Le nom du point d'entrée peut être un chemin sous-repertoire/foo.php.
    ",
            'en'=>"
    Create a new entry point in the www directory of the application, by using
    the name NAME given as a parameter. It will use the configuration file
    CONFIG. This file will be created if it doesn't exist, and in this case,
    the file indicated as the optional parameter --copy-config will be used as
    a model.

    The -type option indicates the type of the entry point: classic, jsonrpc,
    xmlrpc, soap, cmdline.

    The name of the entry point can contain a subdirectory.
    ",
    );
        parent::__construct($config);
    }

    public function run() {

        // retrieve the type of entry point we want to create
        $type = $this->getOption('-type');
        if (!$type)
            $type = 'classic';
        else if(!in_array($type, array('classic','jsonrpc','xmlrpc','soap','cmdline')))
            throw new Exception("invalid type");

        // retrieve the name of the entry point
        $name = $this->getParam('name');
        if (preg_match('/(.*)\.php$/', $name, $m)) {
            $name = $m[1];
        }

        // the full path of the entry point
        if ($type == 'cmdline') {
            $entryPointFullPath = jApp::scriptsPath($name.'.php');
            $entryPointTemplate = 'scripts/cmdline.php.tpl';
        }
        else {
            $entryPointFullPath = jApp::wwwPath($name.'.php');
            $entryPointTemplate = 'www/'.($type=='classic'?'index':$type).'.php.tpl';
        }

        if (file_exists($entryPointFullPath)) {
            throw new Exception("the entry point already exists");
        }

        $entryPointDir = dirname($entryPointFullPath).'/';

        $this->loadProjectXml();

        // retrieve the config file name
        $configFile = $this->getParam('config');

        if ($configFile == null) {
            if ($type == 'cmdline') {
                $configFile = 'cmdline/'.$name.'.ini.php';
            }
            else {
                $configFile = $name.'/config.ini.php';
            }
        }

        // let's create the config file if needed
        $configFilePath = jApp::configPath($configFile);
        if (!file_exists($configFilePath)) {
            $this->createDir(dirname($configFilePath));
            // the file doesn't exists
            // if there is a -copy-config parameter, we copy this file
            $originalConfig = $this->getOption('-copy-config');
            if ($originalConfig) {
                if (! file_exists(jApp::configPath($originalConfig))) {
                    throw new Exception ("unknown original configuration file");
                }
                file_put_contents($configFilePath,
                                  file_get_contents(jApp::configPath($originalConfig)));
                if ($this->verbose())
                    echo "Configuration file $configFile has been created from the config file $originalConfig.\n";
            }
            else {
                // else we create a new config file, with the startmodule of the default
                // config as a module name.
                $mainConfig = parse_ini_file(jApp::mainConfigFile(), true);

                $param = array();
                if (isset($mainConfig['startModule']))
                    $param['modulename'] = $mainConfig['startModule'];
                else
                    $param['modulename'] = 'jelix';

                $this->createFile($configFilePath,
                                  'var/config/index/config.ini.php.tpl',
                                  $param, "Configuration file");
            }
        }

        require_once (JELIX_LIB_PATH.'utils/jIniMultiFilesModifier.class.php');

        $inifile = new jIniMultiFilesModifier(jApp::mainConfigFile(), $configFilePath);

        $param = array();
        $param['modulename'] = $inifile->getValue('startModule');
        // creation of the entry point
        $this->createDir($entryPointDir);
        $param['rp_app']   = $this->getRelativePath($entryPointDir, jApp::appPath());
        $param['config_file'] = $configFile;

        $this->createFile($entryPointFullPath, $entryPointTemplate, $param, "Entry point");

        if ($type != 'cmdline') {
            if (null === $inifile->getValue($name, 'simple_urlengine_entrypoints', null, true)) {
                $inifile->setValue($name, '', 'simple_urlengine_entrypoints', null, true);
            }

            if (null === $inifile->getValue($name, 'basic_significant_urlengine_entrypoints', null, true)) {
                $inifile->setValue($name, '1', 'basic_significant_urlengine_entrypoints', null, true);
            }
            $inifile->save();
        }

        $this->updateProjectXml($name.".php", $configFile , $type);
        if ($this->verbose())
            echo "Project.xml has been updated.\n";

        require_once (JELIX_LIB_PATH.'installer/jInstaller.class.php');
        $installer = new jInstaller(new textInstallReporter('warning'));
        $installer->installEntryPoint($name.".php");
        if ($this->verbose())
            echo "All modules have been initialized for the new entry point.\n";
    }

    protected function updateProjectXml ($fileName, $configFileName, $type) {

        $elem = $this->projectXml->createElementNS(JELIX_NAMESPACE_BASE.'project/1.0', 'entry');
        $elem->setAttribute("file", $fileName);
        $elem->setAttribute("config", $configFileName);
        $elem->setAttribute("type", $type);

        $ep = $this->projectXml->documentElement->getElementsByTagName("entrypoints");

        if (!$ep->length) {
            $ep = $this->projectXml->createElementNS(JELIX_NAMESPACE_BASE.'project/1.0', 'entrypoints');
            $this->projectXml->documentElement->appendChild($ep);
            $ep->appendChild($elem);
        }
        else
            $ep->item(0)->appendChild($elem);

        $this->projectXml->save(jApp::appPath('project.xml'));
    }
}
