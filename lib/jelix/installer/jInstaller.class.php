<?php
/**
* @package     jelix
* @subpackage  installer
* @author      Laurent Jouanneau
* @copyright   2008-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require_once(JELIX_LIB_PATH.'installer/jIInstallReporter.iface.php');
require_once(JELIX_LIB_PATH.'installer/jIInstallerComponent.iface.php');
require_once(JELIX_LIB_PATH.'installer/jInstallerException.class.php');
require_once(JELIX_LIB_PATH.'installer/jInstallerBase.class.php');
require_once(JELIX_LIB_PATH.'installer/jInstallerModule.class.php');
require_once(JELIX_LIB_PATH.'installer/jInstallerModuleInfos.class.php');
require_once(JELIX_LIB_PATH.'installer/jInstallerComponentBase.class.php');
require_once(JELIX_LIB_PATH.'installer/jInstallerComponentModule.class.php');
require_once(JELIX_LIB_PATH.'installer/jInstallerEntryPoint.class.php');
require_once(JELIX_LIB_PATH.'core/jConfigCompiler.class.php');
require_once(JELIX_LIB_PATH.'utils/jIniFile.class.php');
require_once(JELIX_LIB_PATH.'utils/jIniFileModifier.class.php');
require_once(JELIX_LIB_PATH.'utils/jIniMultiFilesModifier.class.php');
require(JELIX_LIB_PATH.'installer/jInstallerMessageProvider.class.php');


/**
 * simple text reporter
 */
class textInstallReporter implements jIInstallReporter {
    /**
     * @var string error, notice or warning
     */
    protected $level;
    
    function __construct($level= 'notice') {
       $this->level = $level; 
    }
    
    function start() {
        if ($this->level == 'notice')
            echo "Installation start..\n";
    }

    /**
     * displays a message
     * @param string $message the message to display
     * @param string $type the type of the message : 'error', 'notice', 'warning', ''
     */
    function message($message, $type='') {
        if (($type == 'error' && $this->level != '')
            || ($type == 'warning' && $this->level != 'notice' && $this->level != '')
            || (($type == 'notice' || $type =='') && $this->level == 'notice'))
        echo ($type != ''?'['.$type.'] ':'').$message."\n";
    }

    /**
     * called when the installation is finished
     * @param array $results an array which contains, for each type of message,
     * the number of messages
     */
    function end($results) {
        if ($this->level == 'notice')
            echo "Installation ended.\n";
    }
}

/**
 * a reporter which reports... nothing
 */
class ghostInstallReporter implements jIInstallReporter {

    function start() {
    }

    /**
     * displays a message
     * @param string $message the message to display
     * @param string $type the type of the message : 'error', 'notice', 'warning', ''
     */
    function message($message, $type='') {
    }

    /**
     * called when the installation is finished
     * @param array $results an array which contains, for each type of message,
     * the number of messages
     */
    function end($results) {
    }
}




/**
 * main class for the installation
 *
 * It load all entry points configurations. Each configurations has its own
 * activated modules. jInstaller then construct a tree dependencies for these
 * activated modules, and launch their installation and the installation
 * of their dependencies.
 * An installation can be an initial installation, or just an upgrade
 * if the module is already installed.
 * @internal The object which drives the installation of a component
 * (module, plugin...) is an object which inherits from jInstallerComponentBase.
 * This object calls load a file from the directory of the component. this
 * file should contain a class which should inherits from jInstallerModule
 * or jInstallerPlugin. this class should implements processes to install
 * the component.
 */
class jInstaller {

    /** value for the installation status of a component: "uninstalled" status */
    const STATUS_UNINSTALLED = 0;

    /** value for the installation status of a component: "installed" status */
    const STATUS_INSTALLED = 1;

    /**
     * value for the access level of a component: "forbidden" level.
     * a module which have this level won't be installed
     */
    const ACCESS_FORBIDDEN = 0;

    /**
     * value for the access level of a component: "private" level.
     * a module which have this level won't be accessible directly
     * from the web, but only from other modules
     */
    const ACCESS_PRIVATE = 1;

    /**
     * value for the access level of a component: "public" level.
     * the module is accessible from the web
     */
    const ACCESS_PUBLIC = 2;

    /**
     * error code stored in a component: impossible to install
     * the module because dependencies are missing
     */
    const INSTALL_ERROR_MISSING_DEPENDENCIES = 1;

    /**
     * error code stored in a component: impossible to install
     * the module because of circular dependencies
     */
    const INSTALL_ERROR_CIRCULAR_DEPENDENCY = 2;

    const FLAG_INSTALL_MODULE = 1;

    const FLAG_UPGRADE_MODULE = 2;

    const FLAG_ALL = 3;

    const FLAG_MIGRATION_11X = 66; // 64 (migration) + 2 (FLAG_UPGRADE_MODULE)

    /**
     *  @var jIniFileModifier it represents the installer.ini.php file.
     */
    public $installerIni = null;
    
    /**
     * list of entry point and their properties
     * @var array of jInstallerEntryPoint. keys are entry point id.
     */
    protected $entryPoints = array();

    /**
     * list of entry point identifiant (provided by the configuration compiler).
     * identifiant of the entry point is the path+filename of the entry point
     * without the php extension
     * @var array   key=entry point name, value=url id
     */
    protected $epId = array();

    /**
     * list of modules for each entry point
     * @var jInstallerComponentModule[][] first key: entry point id, second key: module name, value = jInstallerComponentModule
     */
    protected $modules = array();
    
    /**
     * list of all modules of the application
     * @var array key=path of the module, value = jInstallerComponentModule
     */
    protected $allModules = array();

    /**
     * the object responsible of the results output
     * @var jIInstallReporter
     */
    public $reporter;

    /**
     * @var JInstallerMessageProvider
     */
    public $messages;

    /** @var integer the number of errors appeared during the installation */
    public $nbError = 0;

    /** @var integer the number of ok messages appeared during the installation */
    public $nbOk = 0;

    /** @var integer the number of warnings appeared during the installation */
    public $nbWarning = 0;

    /** @var integer the number of notices appeared during the installation */
    public $nbNotice = 0;

    /**
     * the mainconfig.ini.php content
     * @var jIniFileModifier
     */
    public $mainConfig;

    /**
     * combination between mainconfig.ini.php (master) and localconfig.ini.php (overrider)
     * @var jIniMultiFilesModifier
     */
    public $localConfig;

    /**
     * initialize the installation
     *
     * it reads configurations files of all entry points, and prepare object for
     * each module, needed to install/upgrade modules.
     * @param jIInstallReporter $reporter  object which is responsible to process messages (display, storage or other..)
     * @param string $lang  the language code for messages
     */
    function __construct ($reporter, $lang='') {
        $this->reporter = $reporter;
        $this->messages = new jInstallerMessageProvider($lang);
        $this->mainConfig = new jIniFileModifier(jApp::mainConfigFile());

        $localConfig = jApp::configPath('localconfig.ini.php');
        if (!file_exists($localConfig)) {
           $localConfigDist = jApp::configPath('localconfig.ini.php.dist');
           if (file_exists($localConfigDist)) {
              copy($localConfigDist, $localConfig);
           }
           else {
              file_put_contents($localConfig, ';<'.'?php die(\'\');?'.'>');
           }
        }
        $this->localConfig = new jIniMultiFilesModifier($this->mainConfig, $localConfig);
        $this->installerIni = $this->getInstallerIni();
        $this->readEntryPointData(simplexml_load_file(jApp::appPath('project.xml')));
        $this->installerIni->save();
    }

    /**
     * @internal mainly for tests
     * @return jIniFileModifier the modifier for the installer.ini.php file
     * @throws Exception
     */
    protected function getInstallerIni() {
        if (!file_exists(jApp::configPath('installer.ini.php')))
            if (false === @file_put_contents(jApp::configPath('installer.ini.php'), ";<?php die(''); ?>
; for security reasons , don't remove or modify the first line
; don't modify this file if you don't know what you do. it is generated automatically by jInstaller

"))
                throw new Exception('impossible to create var/config/installer.ini.php');
        return new jIniFileModifier(jApp::configPath('installer.ini.php'));
    }

    /**
     * read the list of entrypoint from the project.xml file
     * and read all modules data used by each entry point
     * @param SimpleXmlElement $xml
     */
    protected function readEntryPointData($xml) {

        $configFileList = array();

        // read all entry points data
        foreach ($xml->entrypoints->entry as $entrypoint) {

            $file = (string)$entrypoint['file'];
            $configFile = (string)$entrypoint['config'];
            if (isset($entrypoint['type'])) {
                $type = (string)$entrypoint['type'];
            }
            else
                $type = "classic";

            // ignore entry point which have the same config file of an other one
            // FIXME: what about installer.ini ?
            if (isset($configFileList[$configFile]))
                continue;

            $configFileList[$configFile] = true;

            // we create an object corresponding to the entry point
            $ep = $this->getEntryPointObject($configFile, $file, $type);
            // not to the constructor, to no break API. FIXME
            $ep->localConfigIni =  new jIniMultiFilesModifier($this->localConfig, $ep->getEpConfigIni());
            $epId = $ep->getEpId();

            $this->epId[$file] = $epId;
            $this->entryPoints[$epId] = $ep;
            $this->modules[$epId] = array();

            // now let's read all modules properties
            $modulesList = $ep->getModulesList();
            foreach ($modulesList as $name=>$path) {
                $module = $ep->getModule($name);

                $this->installerIni->setValue($name.'.installed', $module->isInstalled, $epId);
                $this->installerIni->setValue($name.'.version', $module->version, $epId);

                if (!isset($this->allModules[$path])) {
                    $this->allModules[$path] = $this->getComponentModule($name, $path, $this);
                }

                $m = $this->allModules[$path];
                $m->addModuleInfos($epId, $module);
                $this->modules[$epId][$name] = $m;
            }
            // remove informations about modules that don't exist anymore
            $modules = $this->installerIni->getValues($epId);
            foreach($modules as $key=>$value) {
                $l = explode('.', $key);
                if (count($l)<=1) {
                    continue;
                }
                if (!isset($modulesList[$l[0]])) {
                    $this->installerIni->removeValue($key, $epId);
                }
            }
        }
    }
    
    /**
     * @internal for tests
     */
    protected function getEntryPointObject($configFile, $file, $type) {
        return new jInstallerEntryPoint($this->mainConfig, $configFile, $file, $type);
    }

    /**
     * @internal for tests
     * @return jInstallerComponentModule
     */
    protected function getComponentModule($name, $path, $installer) {
        return new jInstallerComponentModule($name, $path, $installer);
    }

    /**
     * @param string $epId an entry point id
     * @return jInstallerEntryPoint the corresponding entry point object
     */
    public function getEntryPoint($epId) {
        return $this->entryPoints[$epId];
    }

    /**
     * change the module version in readed informations, to simulate an update
     * when we call installApplication or an other method.
     * internal use !!
     * @param string $moduleName the name of the module
     * @param string $version the new version
     */
    public function forceModuleVersion($moduleName, $version) {
        foreach(array_keys($this->entryPoints) as $epId) {
            if (isset($this->modules[$epId][$moduleName])) {
                $this->modules[$epId][$moduleName]->setInstalledVersion($epId, $version);
            }
        }
    }

    /**
     * set parameters for the installer of a module
     * @param string $moduleName the name of the module
     * @param array $parameters  parameters
     * @param string $entrypoint  the entry point for which parameters will be applied when installing the module.
     *                     if null, parameters are valid for all entry points
     */
    public function setModuleParameters($moduleName, $parameters, $entrypoint = null) {
        if ($entrypoint !== null) {
            if (!isset($this->epId[$entrypoint]))
                return;
            $epId = $this->epId[$entrypoint];
            if (isset($this->entryPoints[$epId]) && isset($this->modules[$epId][$moduleName])) {
                $this->modules[$epId][$moduleName]->setInstallParameters($epId, $parameters);
            }
        }
        else {
            foreach(array_keys($this->entryPoints) as $epId) {
                if (isset($this->modules[$epId][$moduleName])) {
                    $this->modules[$epId][$moduleName]->setInstallParameters($epId, $parameters);
                }
            }
        }
    }

    /**
     * install and upgrade if needed, all modules for each
     * entry point. Only modules which have an access property > 0
     * are installed. Errors appeared during the installation are passed
     * to the reporter.
     * @param int $flags flags indicating if we should install, and/or upgrade
     *                   modules or only modify config files. internal use.
     *                   see FLAG_* constants
     * @return boolean true if succeed, false if there are some errors
     */
    public function installApplication($flags = false) {

        if ($flags === false) {
            $flags = self::FLAG_ALL;
        }

        $this->startMessage();
        $result = true;

        foreach(array_keys($this->entryPoints) as $epId) {
            $result = $result & $this->installEntryPointModules($epId, $flags);
            if (!$result) {
                break;
            }
        }

        $this->installerIni->save();
        $this->endMessage();
        return $result;
    }

    /**
     * install and upgrade if needed, all modules for the given
     * entry point. Only modules which have an access property > 0
     * are installed. Errors appeared during the installation are passed
     * to the reporter.
     * @param string $entrypoint the entrypoint name as it appears in project.xml
     * @return bool true if succeed, false if there are some errors
     * @throws Exception
     */
    public function installEntryPoint($entrypoint) {

        $this->startMessage();

        if (!isset($this->epId[$entrypoint])) {
            throw new Exception("unknown entry point");
        }

        $epId = $this->epId[$entrypoint];
        $result = $this->installEntryPointModules($epId);

        $this->installerIni->save();
        $this->endMessage();
        return $result;
    }

    /**
     *
     * @param string $epId  the entrypoint id
     * @return boolean true if succeed, false if there are some errors
     */
    protected function installEntryPointModules($epId, $flags=3) {
        $modules = array();
        foreach($this->modules[$epId] as $name => $module) {
            $access = $module->getAccessLevel($epId);
            if ($access != 1 && $access != 2) {
                if ($module->isInstalled($epId)) {
                    $this->installerIni->removeValue($name.'.installed', $epId);
                    $this->installerIni->removeValue($name.'.version', $epId);
                    $this->installerIni->removeValue($name.'.version.date', $epId);
                    $this->installerIni->removeValue($name.'.firstversion', $epId);
                    $this->installerIni->removeValue($name.'.firstversion.date', $epId);
                }
            }
            else {
                $modules[$name] = $module;
            }
        }
        if (count($modules)) {
            $result = $this->_installModules($modules, $epId, true, $flags);
            if (!$result) {
                return false;
            }
        }
        return true;
    }


    /**
     * install given modules even if they don't have an access property > 0
     * @param array $modulesList array of module names
     * @param string $entrypoint the entrypoint name as it appears in project.xml
     *               or null if modules should be installed for all entry points
     * @return bool true if the installation is ok
     * @throws Exception
     */
    public function installModules($modulesList, $entrypoint = null) {

        $this->startMessage();

        if ($entrypoint == null) {
            $entryPointList = array_keys($this->entryPoints);
        }
        else if (isset($this->epId[$entrypoint])) {
            $entryPointList = array($this->epId[$entrypoint]);
        }
        else {
            throw new Exception("unknown entry point");
        }

        $result = true;
        foreach ($entryPointList as $epId) {

            $allModules = &$this->modules[$epId];

            $modules = array();
            // always install jelix
            array_unshift($modulesList, 'jelix');
            foreach ($modulesList as $name) {
                if (!isset($allModules[$name])) {
                    $this->error('module.unknown', $name);
                }
                else
                    $modules[] = $allModules[$name];
            }

            $result = $this->_installModules($modules, $epId, false);
            if (!$result)
                break;
            $this->installerIni->save();
        }

        $this->endMessage();
        return $result;
    }

    /**
     * core of the installation
     * @param array $modules list of jInstallerComponentModule
     * @param string $epId  the entrypoint id
     * @param boolean $installWholeApp true if the installation is done during app installation
     * @param integer $flags to know what to do
     * @return boolean true if the installation is ok
     */
    protected function _installModules(&$modules, $epId, $installWholeApp, $flags=3) {

        $this->notice('install.entrypoint.start', $epId);
        $ep = $this->entryPoints[$epId];
        jApp::setConfig($ep->config);

        if ($ep->config->disableInstallers)
            $this->notice('install.entrypoint.installers.disabled');

        // first, check dependencies of the component, to have the list of component
        // we should really install. It fills $this->_componentsToInstall, in the right
        // order
        $result = $this->checkDependencies($modules, $epId);

        if (!$result) {
            $this->error('install.bad.dependencies');
            $this->ok('install.entrypoint.bad.end', $epId);
            return false;
        }

        $this->ok('install.dependencies.ok');

        // ----------- pre install
        // put also available installers into $componentsToInstall for
        // the next step
        $componentsToInstall = array();

        foreach($this->_componentsToInstall as $item) {
            list($component, $toInstall) = $item;
            try {
                if ($flags == self::FLAG_MIGRATION_11X) {
                    $this->installerIni->setValue($component->getName().'.installed',
                                                   1, $epId);
                    $this->installerIni->setValue($component->getName().'.version',
                                                   $component->getSourceVersion(), $epId);

                    if ($ep->config->disableInstallers) {
                        $upgraders = array();
                    }
                    else {
                        $upgraders = $component->getUpgraders($ep);
                        foreach($upgraders as $upgrader) {
                            $upgrader->preInstall();
                        }
                    }

                    $componentsToInstall[] = array($upgraders, $component, false);

                }
                else if ($toInstall) {
                    if ($ep->config->disableInstallers)
                        $installer = null;
                    else
                        $installer = $component->getInstaller($ep, $installWholeApp);
                    $componentsToInstall[] = array($installer, $component, $toInstall);
                    if ($flags & self::FLAG_INSTALL_MODULE && $installer)
                        $installer->preInstall();
                }
                else {
                    if ($ep->config->disableInstallers) {
                        $upgraders = array();
                    }
                    else {
                        $upgraders = $component->getUpgraders($ep);
                    }

                    if ($flags & self::FLAG_UPGRADE_MODULE && count($upgraders)) {
                        foreach($upgraders as $upgrader) {
                            $upgrader->preInstall();
                        }
                    }
                    $componentsToInstall[] = array($upgraders, $component, $toInstall);
                }
            } catch (jInstallerException $e) {
                $result = false;
                $this->error ($e->getLocaleKey(), $e->getLocaleParameters());
            } catch (Exception $e) {
                $result = false;
                $this->error ('install.module.error', array($component->getName(), $e->getMessage()));
            }
        }

        if (!$result) {
            $this->warning('install.entrypoint.bad.end', $epId);
            return false;
        }

        $installedModules = array();

        // -----  installation process
        try {
            foreach($componentsToInstall as $item) {
                list($installer, $component, $toInstall) = $item;
                if ($toInstall) {
                    if ($installer && ($flags & self::FLAG_INSTALL_MODULE))
                        $installer->install();
                    $this->installerIni->setValue($component->getName().'.installed',
                                                   1, $epId);
                    $this->installerIni->setValue($component->getName().'.version',
                                                   $component->getSourceVersion(), $epId);
                    $this->installerIni->setValue($component->getName().'.version.date',
                                                   $component->getSourceDate(), $epId);
                    $this->installerIni->setValue($component->getName().'.firstversion',
                                                   $component->getSourceVersion(), $epId);
                    $this->installerIni->setValue($component->getName().'.firstversion.date',
                                                   $component->getSourceDate(), $epId);
                    $this->ok('install.module.installed', $component->getName());
                    $installedModules[] = array($installer, $component, true);
                }
                else {
                    $lastversion = '';
                    foreach($installer as $upgrader) {
                        if ($flags & self::FLAG_UPGRADE_MODULE)
                            $upgrader->install();
                        // we set the version of the upgrade, so if an error occurs in
                        // the next upgrader, we won't have to re-run this current upgrader
                        // during a future update
                        $this->installerIni->setValue($component->getName().'.version',
                                                      $upgrader->version, $epId);
                        $this->installerIni->setValue($component->getName().'.version.date',
                                                      $upgrader->date, $epId);
                        $this->ok('install.module.upgraded',
                                  array($component->getName(), $upgrader->version));
                        $lastversion = $upgrader->version;
                    }
                    // we set the version to the component version, because the version
                    // of the last upgrader could not correspond to the component version.
                    if ($lastversion != $component->getSourceVersion()) {
                        $this->installerIni->setValue($component->getName().'.version',
                                                      $component->getSourceVersion(), $epId);
                        $this->installerIni->setValue($component->getName().'.version.date',
                                                      $component->getSourceDate(), $epId);
                        $this->ok('install.module.upgraded',
                                  array($component->getName(), $component->getSourceVersion()));
                    }
                    $installedModules[] = array($installer, $component, false);
                }
                // we always save the configuration, so it invalidates the cache
                $ep->configIni->save();
                $ep->localConfigIni->save();

                // we re-load configuration file for each module because
                // previous module installer could have modify it.
                $ep->config =
                    jConfigCompiler::read($ep->configFile, true,
                                          $ep->isCliScript,
                                          $ep->scriptName);
                jApp::setConfig($ep->config);
            }
        } catch (jInstallerException $e) {
            $result = false;
            $this->error ($e->getLocaleKey(), $e->getLocaleParameters());
        } catch (Exception $e) {
            $result = false;
            $this->error ('install.module.error', array($component->getName(), $e->getMessage()));
        }

        if (!$result) {
            $this->warning('install.entrypoint.bad.end', $epId);
            return false;
        }

        // post install
        foreach($installedModules as $item) {
            try {
                list($installer, $component, $toInstall) = $item;

                if ($toInstall) {
                    if ($installer && ($flags & self::FLAG_INSTALL_MODULE)) {
                        $installer->postInstall();
                        $component->installFinished($ep);
                    }
                }
                else if ($flags & self::FLAG_UPGRADE_MODULE){
                    foreach($installer as $upgrader) {
                        $upgrader->postInstall();
                        $component->upgradeFinished($ep, $upgrader);
                    }
                }

                // we always save the configuration, so it invalidates the cache
                $ep->configIni->save();
                $ep->localConfigIni->save();

                // we re-load configuration file for each module because
                // previous module installer could have modify it.
                $ep->config =
                    jConfigCompiler::read($ep->configFile, true,
                                          $ep->isCliScript,
                                          $ep->scriptName);
                jApp::setConfig($ep->config);
            } catch (jInstallerException $e) {
                $result = false;
                $this->error ($e->getLocaleKey(), $e->getLocaleParameters());
            } catch (Exception $e) {
                $result = false;
                $this->error ('install.module.error', array($component->getName(), $e->getMessage()));
            }
        }

        $this->ok('install.entrypoint.end', $epId);

        return $result;
    }

    protected $_componentsToInstall = array();
    protected $_checkedComponents = array();
    protected $_checkedCircularDependency = array();

    /**
     * check dependencies of given modules and plugins
     *
     * @param array $list  list of jInstallerComponentModule/jInstallerComponentPlugin objects
     * @return boolean true if the dependencies are ok
     * @throw jException if the install has failed
     */
    protected function checkDependencies ($list, $epId) {

        $this->_checkedComponents = array();
        $this->_componentsToInstall = array();
        $result = true;
        foreach($list as $component) {
            $this->_checkedCircularDependency = array();
            if (!isset($this->_checkedComponents[$component->getName()])) {
                try {
                    $component->init();

                    $this->_checkDependencies($component, $epId);

                    if ($this->entryPoints[$epId]->config->disableInstallers
                        || !$component->isInstalled($epId)) {
                        $this->_componentsToInstall[] = array($component, true);
                    }
                    else if (!$component->isUpgraded($epId)) {
                        $this->_componentsToInstall[] = array($component, false);
                    }
                } catch (jInstallerException $e) {
                    $result = false;
                    $this->error ($e->getLocaleKey(), $e->getLocaleParameters());
                } catch (Exception $e) {
                    $result = false;
                    $this->error ($e->getMessage(). " comp=".$component->getName(), null, true);
                }
            }
        }
        return $result;
    }

    /**
     * check dependencies of a module
     * @param jInstallerComponentBase $component
     * @param string $epId
     * @throws jInstallerException
     */
    protected function _checkDependencies($component, $epId) {

        if (isset($this->_checkedCircularDependency[$component->getName()])) {
            $component->inError = self::INSTALL_ERROR_CIRCULAR_DEPENDENCY;
            throw new jInstallerException ('module.circular.dependency',$component->getName());
        }

        //$this->ok('install.module.check.dependency', $component->getName());

        $this->_checkedCircularDependency[$component->getName()] = true;

        $compNeeded = '';
        foreach ($component->dependencies as $compInfo) {
            // TODO : supports others type of components
            if ($compInfo['type'] != 'module')
                continue;
            $name = $compInfo['name'];
            $comp = null;
            if (isset($this->modules[$epId][$name]))
                $comp = $this->modules[$epId][$name];
            if (!$comp)
                $compNeeded .= $name.', ';
            else {
                if (!isset($this->_checkedComponents[$comp->getName()])) {
                    $comp->init();
                }

                if (!$comp->checkVersion($compInfo['minversion'], $compInfo['maxversion'])) {
                    if ($name == 'jelix') {
                        $args = $component->getJelixVersion();
                        array_unshift($args, $component->getName());
                        throw new jInstallerException ('module.bad.jelix.version', $args);
                    }
                    else
                        throw new jInstallerException ('module.bad.dependency.version',array($component->getName(), $comp->getName(), $compInfo['minversion'], $compInfo['maxversion']));
                }

                if (!isset($this->_checkedComponents[$comp->getName()])) {
                    $this->_checkDependencies($comp, $epId);
                    if ($this->entryPoints[$epId]->config->disableInstallers
                        || !$comp->isInstalled($epId)) {
                        $this->_componentsToInstall[] = array($comp, true);
                    }
                    else if(!$comp->isUpgraded($epId)) {
                        $this->_componentsToInstall[] = array($comp, false);
                    }
                }
            }
        }

        $this->_checkedComponents[$component->getName()] = true;
        unset($this->_checkedCircularDependency[$component->getName()]);

        if ($compNeeded) {
            $component->inError = self::INSTALL_ERROR_MISSING_DEPENDENCIES;
            throw new jInstallerException ('module.needed', array($component->getName(), $compNeeded));
        }
    }
    
    protected function startMessage () {
        $this->nbError = 0;
        $this->nbOk = 0;
        $this->nbWarning = 0;
        $this->nbNotice = 0;
        $this->reporter->start();
    }
    
    protected function endMessage() {
        $this->reporter->end(array('error'=>$this->nbError, 'warning'=>$this->nbWarning, 'ok'=>$this->nbOk,'notice'=>$this->nbNotice));
    }

    protected function error($msg, $params=null, $fullString=false){
        if($this->reporter) {
            if (!$fullString)
                $msg = $this->messages->get($msg,$params);
            $this->reporter->message($msg, 'error');
        }
        $this->nbError ++;
    }

    protected function ok($msg, $params=null, $fullString=false){
        if($this->reporter) {
            if (!$fullString)
                $msg = $this->messages->get($msg,$params);
            $this->reporter->message($msg, '');
        }
        $this->nbOk ++;
    }

    protected function warning($msg, $params=null, $fullString=false){
        if($this->reporter) {
            if (!$fullString)
                $msg = $this->messages->get($msg,$params);
            $this->reporter->message($msg, 'warning');
        }
        $this->nbWarning ++;
    }

    protected function notice($msg, $params=null, $fullString=false){
        if($this->reporter) {
            if (!$fullString)
                $msg = $this->messages->get($msg,$params);
            $this->reporter->message($msg, 'notice');
        }
        $this->nbNotice ++;
    }

}

