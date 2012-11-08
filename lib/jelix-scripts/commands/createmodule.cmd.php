<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @contributor Bastien Jaillot
* @copyright   2005-2012 Laurent Jouanneau, 2007 Loic Mathaud, 2008 Bastien Jaillot
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/


class createmoduleCommand extends JelixScriptCommand {

    public  $name = 'createmodule';
    public  $allowed_options=array('-nosubdir'=>false,
                                   '-nocontroller'=>false,
                                   '-cmdline'=>false,
                                   '-addinstallzone'=>false,
                                   '-defaultmodule'=>false,
                                   '-admin'=>false,
                                   '-ver'=>true);
    public  $allowed_parameters=array('module'=>true, 'repository'=>false);

    public  $syntaxhelp = "[-nosubdir] [-nocontroller] [-cmdline] [-addinstallzone] [-defaultmodule] [-admin] MODULE [REPOSITORY]";
    public  $help=array(
        'fr'=>"
    Crée un nouveau module, avec son fichier module.xml, et un contrôleur
    par défaut, ainsi que tous les sous-répertoires courants
    (zones, templates, daos, locales, classes...).

    -nosubdir (facultatif) : ne crée pas tous les sous-repertoires courants
    -nocontroller (facultatif) : ne crée pas de fichier contrôleur par défaut
    -cmdline (facultatif) : crée le module avec un contrôleur pour la ligne de commande
    -addinstallzone (facultatif) : ajoute la zone check_install pour une nouvelle application
    -defaultmodule (facultatif) : le module devient le module par defaut de l'application
    -admin (facultatif) : le module doit être utilisé avec master_admin, création de fichiers
                        supplémentaires et ajout de configuration adéquates (droits..)
    -ver {version} (facultatif) : indique le numéro de version initial du module

    MODULE : le nom du module à créer.
    REPOSITORY: le depot de modules où créer le module. même syntaxe que pour modulesPath
                dans la configuration. Le dépôt par défaut est app:module/",
        'en'=>"
    Create a new module, with all necessary files and sub-directories.

    -nosubdir (optional): don't create sub-directories.
    -nocontroller (optional): don't create a default controller.
    -cmdline (optional): create a controller for command line (jControllerCmdLine)
    -addinstallzone (optional) : add the check_install zone for new application
    -defaultmodule (optional) : the new module become the default module
    -admin (optional) : the new module should be used with master_admin. install
                        additionnal file and set additionnal configuration stuff
    -ver {version} (optional) : indicates the initial version of the module
    MODULE: name of the new module.
    REPOSITORY: the path of the directory where to create the module. same syntax as modulesPath
                in the configuration. default repository is app:module/"
    );


    public function run(){
        $this->loadAppConfig();

        $module = $this->getParam('module');
        $initialVersion = $this->getOption('-ver');
        if ($initialVersion === false)
            $initialVersion = '0.1pre';

        // note: since module name are used for name of generated name,
        // only this characters are allowed
        if ($module == null || preg_match('/([^a-zA-Z_0-9])/', $module)) {
            throw new Exception("'".$module."' is not a valid name for a module");
        }

        // check if the module already exist or not
        $path = '';
        try {
            $path = $this->getModulePath($module);
        }
        catch (Exception $e) {}

        if ($path != '') {
            throw new Exception("module '".$module."' already exists");
        }

        // verify the given repository
        $repository = $this->getParam('repository', 'app:modules/');
        if (substr($repository,-1) != '/')
            $repository .= '/';
        $repositoryPath = str_replace(array('lib:','app:'), array(LIB_PATH, jApp::appPath()), $repository);

        $iniDefault = new jIniFileModifier(jApp::configPath('defaultconfig.ini.php'));
        $this->updateModulePath($iniDefault, $iniDefault->getValue('modulesPath'), $repository, $repositoryPath);
        if ($this->verbose())
            echo "modulePath updated in the main configuration\n";

        if (!$this->allEntryPoint) {
            $list = $this->getEntryPointsList();
            foreach ($list as $k => $entryPoint) {
                if ($entryPoint['file'] == $this->entryPointName) {
                    $ini = new jIniFileModifier(jApp::configPath($entryPoint['config']));
                    break;
                }
            }
            if (!$ini) {
                throw new Exception("entry point is unknown");
            }
            $this->updateModulePath($ini, jApp::config()->modulesPath, $repository, $repositoryPath);
            if ($this->verbose())
                echo "modulePath updated in the configuration ".$entryPoint['config']."\n";
        }

        $path = $repositoryPath.$module.'/';
        $this->createDir($path);

        jApp::setConfig(null);

        if ($this->getOption('-admin')) {
            $this->removeOption('-nosubdir');
            $this->removeOption('-addinstallzone');
        }

        $param = array();
        $param['module'] = $module;
        $param['default_id'] = $module.$this->config->infoIDSuffix;
        $param['version'] = $initialVersion;

        $this->createFile($path.'module.xml', 'module/module.xml.tpl', $param);

        // create all sub directories of a module
        if (!$this->getOption('-nosubdir')) {
            $this->createDir($path.'classes/');
            $this->createDir($path.'zones/');
            $this->createDir($path.'controllers/');
            $this->createDir($path.'templates/');
            $this->createDir($path.'classes/');
            $this->createDir($path.'daos/');
            $this->createDir($path.'forms/');
            $this->createDir($path.'locales/');
            $this->createDir($path.'locales/en_US/');
            $this->createDir($path.'locales/fr_FR/');
            $this->createDir($path.'install/');
            if ($this->verbose())
                echo "Sub directories have been created in the new module $module.\n";
            $this->createFile($path.'install/install.php','module/install.tpl',$param);
            $this->createFile($path.'urls.xml', 'module/urls.xml.tpl', array());
        }

        $isdefault = $this->getOption('-defaultmodule');

        // activate the module in the application
        if ($isdefault) {
            $iniDefault->setValue('startModule', $module);
            $iniDefault->setValue('startAction', 'default:index');
            if ($this->verbose())
                echo "The new module $module becomes the default module\n";
        }

        $iniDefault->setValue($module.'.access', ($this->allEntryPoint?2:1) , 'modules');
        $iniDefault->save();

        $list = $this->getEntryPointsList();
        $install = new jIniFileModifier(jApp::configPath('installer.ini.php'));

        // install the module for all needed entry points
        foreach ($list as $k => $entryPoint) {

            $configFile = jApp::configPath($entryPoint['config']);
            $epconfig = new jIniFileModifier($configFile);

            if ($this->allEntryPoint)
                $access = 2;
            else
                $access = ($entryPoint['file'] == $this->entryPointName?2:0);

            $epconfig->setValue($module.'.access', $access, 'modules');
            $epconfig->save();

            if ($this->allEntryPoint || $entryPoint['file'] == $this->entryPointName) {
                $install->setValue($module.'.installed', 1, $entryPoint['id']);
                $install->setValue($module.'.version', $initialVersion, $entryPoint['id']);
            }

            if ($isdefault) {
                // we set the module as default module for one or all entry points.
                // we set the startModule option for all entry points except
                // if an entry point is indicated on the command line
                if ($this->allEntryPoint || $entryPoint['file'] == $this->entryPointName) {
                    if ($epconfig->getValue('startModule') != '') {
                        $epconfig->setValue('startModule', $module);
                        $epconfig->setValue('startAction', 'default:index');
                        $epconfig->save();
                    }
                }
            }
            if ($this->verbose())
                echo "The module is initialized for the entry point ".$entryPoint['file'].".\n";
        }

        $install->save();

        // create a default controller
        if(!$this->getOption('-nocontroller')){
            $agcommand = JelixScript::getCommand('createctrl', $this->config);
            $options = array();
            if ($this->getOption('-cmdline')) {
               $options = array('-cmdline'=>true);
            }
            if ($this->getOption('-addinstallzone')) {
                $options = array('-addinstallzone'=>true);
            }
            $agcommand->initOptParam($options,array('module'=>$module, 'name'=>'default','method'=>'index'));
            $agcommand->run();
        }

        if ($this->getOption('-admin')) {
            $this->createFile($path.'classes/admin'.$module.'.listener.php', 'module/admin.listener.php.tpl', $param, "Listener");
            $this->createFile($path.'events.xml', 'module/events.xml.tpl', $param);
            file_put_contents($path.'locales/en_US/interface.UTF-8.properties', 'menu.item='.$module);
            file_put_contents($path.'locales/fr_FR/interface.UTF-8.properties', 'menu.item='.$module);
        }
    }

    protected function updateModulePath($ini, $currentModulesPath, $repository, $repositoryPath) {
        $listRepos = preg_split('/ *, */',$currentModulesPath);
        $repositoryFound = false;
        foreach($listRepos as $path){
            if(trim($path) == '') continue;
            $p = str_replace(array('lib:','app:'), array(LIB_PATH, jApp::appPath()), $path);
            if (substr($p,-1) != '/')
                $p .= '/';
            if ($p == $repositoryPath) {
                $repositoryFound = true;
                break;
            }
        }

        // the repository doesn't exist in the configuration
        // let's add it into the configuration
        if (!$repositoryFound) {

            $ini->setValue('modulesPath', $currentModulesPath.','.$repository);
            $ini->save();

            $this->createDir($repositoryPath);
        }
    }
}
