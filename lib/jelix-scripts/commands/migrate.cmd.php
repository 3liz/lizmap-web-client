<?php

/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor
* @copyright   2010-2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class migrateModule {
    public $path;
    public $name;
    public $access;
}


class migrateCommand extends JelixScriptCommand {

    public  $name = 'migrate';
    public  $allowed_options = array();
    public  $allowed_parameters = array();

    public  $syntaxhelp = "";
    public  $help = '';

    function __construct($config){
        $this->help= array(
            'fr'=>"
    migre une application jelix 1.1  vers jelix 1.2
    ",
            'en'=>"
    Migrate a jelix 1.1 application to jelix 1.2
    ",
    );
        parent::__construct($config);
    }

    public function run(){
        $this->loadStep();

        $this->loadProjectXml();

        // verify version
        $this->checkVersion();

        // update configuration file of entry points
        $this->updateConfig();

        // update project.xml
        $this->updateProjectXml();

        // launch jInstaller
        if ($this->checkStep("Install virtually all modules")) {
            require_once (JELIX_LIB_PATH.'installer/jInstaller.class.php');
            $reporter = new textInstallReporter();
            $install = new jInstaller($reporter);
            $install->forceModuleVersion('jacl2db', '1.1');
            $install->forceModuleVersion('jauthdb', '1.1');
            $result = $install->installApplication(jInstaller::FLAG_MIGRATION_11X);
            if (!$result) {
                throw new Exception ("Installation of modules failed. Fix and retry.");
            }
        }

        if ($this->checkStep("Create the install/installer.php script")) {
            if (!file_exists(jApp::appPath('install/installer.php'))) {
                $this->createDir(jApp::appPath('install/'));
                $this->createFile(jApp::appPath('install/installer.php'),'installer/installer.php.tpl',array());
            }
        }
        $this->finalStep("Migration done");
    }

    /**
     * check the compatibility version of the app with jelix
     */
    protected function checkVersion() {
        list($minversion, $maxversion) = $this->getSupportedJelixVersion();

        if ($this->checkStep("Check jelix version of your application")) {
            if($minversion == '' || $maxversion == '')
                throw new Exception('Minimum and max jelix version of your project is not indicated in project.xml');
        }

        if ($this->checkStep("Check application compatibility")) {
            if (jVersionComparator::compareVersion($maxversion, "1.2") > -1)
                throw new Exception("Because of maxversion in project.xml, it seems that your application is already compatible with jelix 1.2");
            if (file_exists(jApp::configPath('installer.ini.php')))
                throw new Exception("installer.ini.php already exists !");
        }
    }

    /**
     * update configuration files
     */
    protected function updateConfig() {
        // retrieve the default config
        $defaultconfig = new jIniFileModifier(jApp::configPath('defaultconfig.ini.php'));

        $this->defaultModulesPath = $defaultconfig->getValue('modulesPath');
        if (!$this->defaultModulesPath) {
            $this->defaultModulesPath = 'lib:jelix-modules/,app:modules/';
        }

        if ($this->checkStep("Update configuration files")) {

            $configList = array();

            $this->defaultCheckTrustedModules = $defaultconfig->getValue('checkTrustedModules');
            if ($this->defaultCheckTrustedModules === null)
                $this->defaultCheckTrustedModules = false;

            $this->defaultTrustedModules = $defaultconfig->getValue('trustedModules');
            if ($this->defaultTrustedModules === null)
                $this->defaultTrustedModules = '';

            $allModulePath = $this->getModulesPath($this->defaultModulesPath, ($this->defaultCheckTrustedModules?1:2));

            if ($this->defaultCheckTrustedModules) {
                $list = preg_split('/ *, */', $this->defaultTrustedModules);
                foreach ($list as $module) {
                    if (isset($allModulePath[$module]))
                        $allModulePath[$module]->access = 2;
                }
            }

            $this->defaultUnusedModules = $defaultconfig->getValue('unusedModules');
            if ($this->defaultUnusedModules) {
                $list = preg_split('/ *, */', $this->defaultUnusedModules);
                foreach ($list as $module) {
                    if (isset($allModulePath[$module]))
                        $allModulePath[$module]->access = 0;
                }
            }

            foreach ($allModulePath as $name=>$module) {
                $defaultconfig->setValue($name.'.access', $module->access, 'modules');
            }

            $defaultconfig->removeValue('checkTrustedModules');
            $defaultconfig->removeValue('trustedModules');
            $defaultconfig->removeValue('unusedModules');
            $defaultconfig->removeValue('hiddenModules');

            $configList['defaultconfig.ini.php'] = $defaultconfig;

            // read each entry point configuration
            $eplist = $this->getEntryPointsList();

            $help = "In each config files of your entry points, fill this parameters:\n".
                   "* checkTrustedModules=on\n".
                   "* trustedModules: list of modules accessible from the web\n".
                   "* unusedModules: those you don't use at all\n".
                   "For other modules you use but which should not be accessible from the web, nothing to do.\n";

            // list of modules which are not declared into the default config
            $otherModulePath = array();

            foreach($eplist as $ep) {
                if (isset($configList[$ep['config']]))
                    continue;

                $config = new jIniFileModifier(jApp::configPath($ep['config']));

                $modulesPath = $config->getValue('modulesPath');
                if (!$modulesPath) {
                    $modulesPath = $this->defaultModulesPath;
                }

                $checkTrustedModules = $config->getValue('checkTrustedModules');
                if ($checkTrustedModules === null)
                    $checkTrustedModules = $this->defaultCheckTrustedModules;

                if (!$checkTrustedModules) {
                    throw new Exception("checkTrustedModules should be set to 'on' in config files.\n$help");
                }

                $trustedModules = $config->getValue('trustedModules');
                if (!$trustedModules)
                    $trustedModules = $this->defaultTrustedModules;

                if ($trustedModules == '') {
                    throw new Exception("trustedModules should be filled in config files.\n$help");
                }

                $unusedModules = $config->getValue('unusedModules');
                if (!$unusedModules)
                    $unusedModules = $this->defaultUnusedModules;

                $epModulePath = $this->getModulesPath($modulesPath, 1);

                $list = preg_split('/ *, */', $trustedModules);
                foreach ($list as $module) {
                    if (isset($epModulePath[$module]))
                        $epModulePath[$module]->access = 2;
                }

                if ($unusedModules) {
                    $list = preg_split('/ *, */', $unusedModules);
                    foreach ($list as $module) {
                        if (isset($epModulePath[$module]))
                            $epModulePath[$module]->access = 0;
                    }
                }

                foreach ($epModulePath as $name=>$module) {
                    if (!isset($allModulePath[$name]) || $allModulePath[$name]->access != $module->access) {
                        $config->setValue($name.'.access', $module->access, 'modules');
                    }
                    if (!isset($allModulePath[$name]) && !isset($otherModulePath[$name]))
                        $otherModulePath[$name] = $module;
                }

                $config->removeValue('checkTrustedModules');
                $config->removeValue('trustedModules');
                $config->removeValue('unusedModules');
                $config->removeValue('hiddenModules');
                $configList[$ep['config']] = $config;
            }

            // we save at the end, because an error could appear during the previous loop
            // and we don't want to save change if there are errors
            $defaultconfig->save();
            foreach($configList as $config) {
                $config->save();
            }
        }
        else {
            // load list of modules for the next step
            $allModulePath = $this->getModulesPath($this->defaultModulesPath, 2);
            $eplist = $this->getEntryPointsList();
            // list of modules which are not declared into the default config
            $otherModulePath = array();

            foreach($eplist as $ep) {
                if (isset($configList[$ep['config']]))
                    continue;
                $config = new jIniFileModifier(jApp::configPath($ep['config']));

                $modulesPath = $config->getValue('modulesPath');
                if (!$modulesPath) {
                    $modulesPath = $this->defaultModulesPath;
                }
                $epModulePath = $this->getModulesPath($modulesPath, 1);
                foreach ($epModulePath as $name=>$module) {
                    if (!isset($allModulePath[$name]) && !isset($otherModulePath[$name]))
                        $otherModulePath[$name] = $module;
                }
            }
        }

        if ($this->checkStep("Update module.xml files")) {
            foreach ($allModulePath as $name=>$module) {
                $this->updateModuleXml($module);
            }
            foreach ($otherModulePath as $name=>$module) {
                $this->updateModuleXml($module);
            }
        }
    }

    protected $moduleRepositories = array();

    /**
     * retrieve all modules specifications
     */
    protected function getModulesPath($modulesPath, $defaultAccess) {

        $list = preg_split('/ *, */', $modulesPath);
        array_unshift($list, JELIX_LIB_PATH.'core-modules/');
        $modulesPathList = array();

        foreach ($list as $k=>$path) {
            if (trim($path) == '') continue;
            $p = str_replace(array('lib:','app:'), array(LIB_PATH, jApp::appPath()), $path);
            if (!file_exists($p)) {
                throw new Exception('The path, '.$path.' given in the jelix config, doesn\'t exists !',E_USER_ERROR);
            }

            if (substr($p,-1) !='/')
                $p.='/';

            $this->moduleRepositories[$p] = array();

            if ($handle = opendir($p)) {
                while (false !== ($f = readdir($handle))) {
                    if ($f[0] != '.' && is_dir($p.$f)) {
                        $m = new migrateModule();
                        $m->path = $p.$f.'/';
                        $m->name = $f;
                        $m->access = ($f == 'jelix'?2:$defaultAccess);
                        $m->repository = $p;
                        $modulesPathList[$f] = $m;
                        $this->moduleRepositories[$p][$f] = $m;
                    }
                }
                closedir($handle);
            }
        }
        return $modulesPathList;
    }

    /**
     * update the project.xml file
     */
    protected function updateProjectXml() {
        if (!$this->checkStep("Update the project.xml file"))
            return;
        $doc = $this->projectXml;

        $this->updateInfo($doc, '', '');

        $this->updateJelixDependency($doc);

        $dep = $this->nextElementSibling($this->firstElementChild($doc->documentElement));
        $dir = $this->nextElementSibling($dep, 'directories');

        $this->projectXml->save(jApp::appPath('project.xml'));
    }

    /**
     * update or create the module.xml file of a module
     */
    protected function updateModuleXml(migrateModule $module) {

        $modulexml = $module->path.'module.xml';
        if (!file_exists($modulexml)) {
            $param = array();
            $param['module'] = $module->name;
            $param['default_id'] = $module->name.$this->config->infoIDSuffix;
            $param['version'] = '1.0';
            $this->createFile($modulexml, 'module/module.xml.tpl', $param);
            return;
        }

        $doc = new DOMDocument();

        if (!$doc->load($modulexml)){
           throw new Exception("cannot load $modulexml");
        }

        $this->updateInfo($doc, $module->name.$this->config->infoIDSuffix, $module->name);

        $this->updateJelixDependency($doc);

        $doc->save($modulexml);
    }

    /**
     * update identity of a module or a project, in a module.xml or project.xml file
     */
    protected function updateInfo($doc, $id, $name) {
        $info = $this->firstElementChild($doc->documentElement, 'info');

        if ($info->getAttribute('id') == '')
            $info->setAttribute('id',$id);
        if ($info->getAttribute('name') == '')
            $info->setAttribute('name', $name);

        $version = $this->firstElementChild($info, 'version');

        $version->removeAttribute('stability');
        if ($version->getAttribute('date') == '')
            $version->removeAttribute('date');
        if (trim($version->textContent) == '')
            $version->textContent = '1.0';

        return $info;
    }

    /**
     * update informations about jelix version in a module.xml or project.xml file
     */
    protected function updateJelixDependency($doc) {

        $info = $this->firstElementChild($doc->documentElement);
        $dep = $this->nextElementSibling($info, 'dependencies');
        $jelix = $this->firstElementChild($dep, 'jelix');

        if (!$jelix->hasAttribute('minversion')) {
            $jelix->setAttribute('minversion', JELIX_VERSION);
        }

        if (!$jelix->hasAttribute('maxversion') || jVersionComparator::compareVersion($jelix->getAttribute('maxversion'), JELIX_VERSION) == -1) {
            $jelix->setAttribute('maxversion', jVersionComparator::getBranchVersion(JELIX_VERSION).'.*');
        }
    }

    protected function firstElementChild($elt, $name = '') {
        $child = $elt->firstChild;
        while ($child && $child->nodeType != 1)
            $child = $child->nextSibling;

        if ($name != '' && (!$child || $child->localName != $name)) {
            $doc = $elt->ownerDocument;
            $new = $doc->createElement($name);
            $cr = $doc->createTextNode("\n");
            $cr2 = $doc->createTextNode("\n");
            if ($child) {
                $elt->insertBefore($cr, $child);
                $newcr2 = $elt->insertBefore($cr, $child);
                $child = $elt->insertBefore($new, $newcr2);
            }
            else{
                $elt->appendChild($cr);
                $child = $elt->appendChild($new);
                $elt->appendChild($cr2);
            }
        }
        return $child;
    }

    protected function nextElementSibling($elt, $name = '') {
        $child = $elt->nextSibling;
        while ($child && $child->nodeType != 1)
            $child = $child->nextSibling;

        if ($name != '' && (!$child || $child->localName != $name)) {
            $doc = $elt->ownerDocument;
            $new = $doc->createElement($name);
            $cr = $doc->createTextNode("\n");
            $cr2 = $doc->createTextNode("\n");
            if ($child) {
                $elt->parentNode->insertBefore($cr, $child);
                $newcr2 = $elt->parentNode->insertBefore($cr2, $child);
                $child = $elt->parentNode->insertBefore($new, $newcr2);
            }
            else{
                $elt->parentNode->appendChild($cr);
                $child = $elt->parentNode->appendChild($new);
                $elt->parentNode->appendChild($cr2);
            }
        }

        return $child;
    }

    protected $currentStep = 0;

    protected function loadStep() {
        if (!file_exists(jApp::configPath('MIGRATION'))) {
            file_put_contents(jApp::configPath('MIGRATION'), 0);
        }
    }

    /**
     * @return boolean true if the step did not executed, false if already executed
     */
    protected function checkStep($message) {
        $this->currentStep ++;
        $step = intval(file_get_contents(jApp::configPath('MIGRATION')));
        if ($this->currentStep < $step) {
            echo $message." (already done)\n";
            return false;
        }
        else {
            file_put_contents(jApp::configPath('MIGRATION'), $this->currentStep);
            echo $message."\n";
            return true;
        }
    }

    protected function finalStep($message) {
        unlink(jApp::configPath('MIGRATION'));
        echo $message ."\n";
    }
}
