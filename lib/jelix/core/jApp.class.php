<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2011-2012 Laurent Jouanneau
* @link       http://jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
*
* @package    jelix
* @subpackage core
*/
class jApp {

    protected static $tempBasePath = '';

    protected static $appPath = '';

    protected static $varPath = '';

    protected static $logPath = '';

    protected static $configPath = '';

    protected static $wwwPath = '';

    protected static $scriptPath = '';

    protected static $_isInit = false;

    protected static $env = 'www/';

    protected static $configAutoloader = null;

    /**
     * initialize the application paths
     *
     * Warning: given paths should be ended by a directory separator.
     * @param string $appPath  application directory
     * @param string $wwwPath  www directory
     * @param string $varPath  var directory
     * @param string $logPath log directory
     * @param string $configPath config directory
     * @param string $scriptPath scripts directory
     */
    public static function initPaths ($appPath,
                                 $wwwPath = null,
                                 $varPath = null,
                                 $logPath = null,
                                 $configPath = null,
                                 $scriptPath = null
                                 ) {
        self::$appPath = $appPath;
        self::$wwwPath = (is_null($wwwPath)?$appPath.'www/':$wwwPath);
        self::$varPath = (is_null($varPath)?$appPath.'var/':$varPath);
        self::$logPath = (is_null($logPath)?self::$varPath.'log/':$logPath);
        self::$configPath = (is_null($configPath)?self::$varPath.'config/':$configPath);
        self::$scriptPath = (is_null($scriptPath)?$appPath.'scripts/':$scriptPath);
        self::$_isInit = true;
    }

    /**
     * indicate if path have been set
     * @return boolean  true if it is ok
     */
    public static function isInit() { return self::$_isInit; }

    /**
     * init path from JELIX_APP_* defines or define JELIX_APP_*,
     * depending of how the bootstrap has been initialized.
     * The goal of this method is to support the transition
     * between the old way of defining path, and the new way
     * in jelix 1.3.
     * @deprecated
     */
    public static function initLegacy() {
        if (self::$_isInit) {
            if (!defined('JELIX_APP_PATH')) {
                define ('JELIX_APP_PATH',         self::$appPath);
                define ('JELIX_APP_TEMP_PATH',    self::tempPath());
                define ('JELIX_APP_VAR_PATH',     self::$varPath);
                define ('JELIX_APP_LOG_PATH',     self::$logPath);
                define ('JELIX_APP_CONFIG_PATH',  self::$configPath);
                define ('JELIX_APP_WWW_PATH',     self::$wwwPath);
                define ('JELIX_APP_CMD_PATH',     self::$scriptPath);
            }
        }
        else if (defined('JELIX_APP_PATH')) {
            self::initPaths(JELIX_APP_PATH,
                            JELIX_APP_WWW_PATH,
                            JELIX_APP_VAR_PATH,
                            JELIX_APP_LOG_PATH,
                            JELIX_APP_CONFIG_PATH,
                            JELIX_APP_CMD_PATH);
            self::setTempBasePath(JELIX_APP_TEMP_PATH);
        }

        global $gJConfig;
        if (!$gJConfig)
            $gJConfig = self::$_config;
        global $gJCoord;
        if (!$gJCoord)
            $gJCoord = self::$_coord;
    }

    public static function appPath($file='') { return self::$appPath.$file; }
    public static function varPath($file='') { return self::$varPath.$file; }
    public static function logPath($file='') { return self::$logPath.$file; }
    public static function configPath($file='') { return self::$configPath.$file; }
    public static function wwwPath($file='') { return self::$wwwPath.$file; }
    public static function scriptsPath($file='') { return self::$scriptPath.$file; }
    public static function tempPath($file='') { return self::$tempBasePath.self::$env.$file; }
    public static function tempBasePath() { return self::$tempBasePath; }

    public static function setTempBasePath($path) {
        self::$tempBasePath = $path;
    }

    public static function setEnv($env) {
        if (substr($env,-1) != '/')
            $env.='/';
        self::$env = $env;
    }

    /**
     * @var object  object containing all configuration options of the application
     */
    protected static $_config = null;

    /**
     * @return object object containing all configuration options of the application
     */
    public static function config() {
        return self::$_config;
    }

    public static function setConfig($config) {
        if (self::$configAutoloader) {
            spl_autoload_unregister(array(self::$configAutoloader, 'loadClass'));
            self::$configAutoloader = null;
        }

        self::$_config = $config;
        if ($config) {
            date_default_timezone_set(self::$_config->timeZone);
            self::$configAutoloader = new jConfigAutoloader($config);
            spl_autoload_register(array(self::$configAutoloader, 'loadClass'));
            foreach(self::$_config->_autoload_autoloader as $autoloader)
                require_once($autoloader);
        }
    }

    /**
     * Load the configuration from the given file.
     *
     * Call it after initPaths
     * @param  string|object $configFile name of the ini file to configure the framework or a configuration object
     * @param  boolean $enableErrorHandler enable the error handler of jelix.
     *                 keep it to true, unless you have something to debug
     *                 and really have to use the default handler or an other handler
     */
    public static function loadConfig ($configFile, $enableErrorHandler=true) {
        if ($enableErrorHandler) {
            jBasicErrorHandler::register();
        }
        if (is_object($configFile))
            self::setConfig($configFile);
        else
            self::setConfig(jConfig::load($configFile));
        self::$_config->enableErrorHandler = $enableErrorHandler;
    }

    protected static $_coord = null;
    
    public static function coord() {
        return self::$_coord;
    }

    public static function setCoord($coord) {
        self::$_coord = $coord;
    }

    protected static $contextBackup = array();

    /**
     * save all path and others variables relatives to the application, so you can
     * temporary change the context to an other application
     */
    public static function saveContext() {
        if (self::$_config)
            $conf = clone self::$_config;
        else
            $conf = null;
        if (self::$_coord)
            $coord = clone self::$_coord;
        else
            $coord = null;
        self::$contextBackup[] = array(self::$appPath, self::$varPath, self::$logPath, self::$configPath,
                                       self::$wwwPath, self::$scriptPath, self::$tempBasePath, self::$env, $conf, $coord);
    }

    /**
     * restore the previous context of the application
     */
    public static function restoreContext() {
        if (!count(self::$contextBackup))
            return;
        list(self::$appPath, self::$varPath, self::$logPath, self::$configPath,
             self::$wwwPath, self::$scriptPath, self::$tempBasePath, self::$env,
             $conf, self::$_coord) = array_pop(self::$contextBackup);
        self::setConfig($conf);
    }

    /**
     * load a plugin from a plugin directory (any type of plugins)
     * @param string $name the name of the plugin
     * @param string $type the type of the plugin
     * @param string $suffix the suffix of the filename
     * @param string $classname the name of the class to instancy
     * @param mixed $args  the argument for the constructor of the class. null = no argument.
     * @return null|object  null if the plugin doesn't exists
     */
    public static function loadPlugin($name, $type, $suffix, $classname, $args = null) {

        if (!class_exists($classname,false)) {
            $optname = '_pluginsPathList_'.$type;
            if (!isset(jApp::config()->$optname))
                return null;
            $opt = & jApp::config()->$optname;
            if (!isset($opt[$name])
                || !file_exists($opt[$name].$name.$suffix) ){
                return null;
            }
            require_once($opt[$name].$name.$suffix);
        }
        if (!is_null($args))
            return new $classname($args);
        else
            return new $classname();
    }

    /**
    * Says if the given module $name is enabled
    * @param string $moduleName
    * @param boolean $includingExternal  true if we want to know if the module
    *               is also an external module, e.g. in an other entry point
    * @return boolean true : module is ok
    */
    public static function isModuleEnabled ($moduleName, $includingExternal = false) {
        if (!self::$_config)
            throw new Exception ('Configuration is not loaded');
        if ($includingExternal && isset(self::$_config->_externalModulesPathList[$moduleName])) {
            return true;
        }
        return isset(self::$_config->_modulesPathList[$moduleName]);
    }

    /**
     * return the real path of a module
     * @param string $module a module name
     * @param boolean $includingExternal  true if we want to know if the module
     *               is also an external module, e.g. in an other entry point
     * @return string the corresponding path
     */
    public static function getModulePath($module, $includingExternal = false){
        if (!self::$_config)
            throw new Exception ('Configuration is not loaded');

        if (!isset(self::$_config->_modulesPathList[$module])) {
            if ($includingExternal && isset(self::$_config->_externalModulesPathList[$module])) {
                return self::$_config->_externalModulesPathList[$module];
            }
            throw new Exception('getModulePath : invalid module name');
        }
        return self::$_config->_modulesPathList[$module];
    }
}
