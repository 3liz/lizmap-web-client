<?php
/**
* @package     jelix
* @subpackage  installer
* @author      Laurent Jouanneau
* @copyright   2009-2020 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * container for entry points properties
 */
class jInstallerEntryPoint {

    /** @var StdObj   configuration parameters. compiled content of config files
      *  result of the merge of entry point config, liveconfig.ini.php, localconfig.ini.php,
      *  mainconfig.ini.php and defaultconfig.ini.php
      *  @deprecated as public property
      */
    public $config;

    /** @var string the filename of the configuration file dedicated to the entry point
     *       ex: <apppath>/var/config/index/config.ini.php
     *  @deprecated as public property
     */
    public $configFile;

    /**
     * combination between mainconfig.ini.php (master) and entrypoint config (overrider)
     * @var jIniMultiFilesModifier
     *  @deprecated as public property
     */
    public $configIni;

    /**
     * combination between mainconfig.ini.php, localconfig.ini.php (master)
     *  and entrypoint config (overrider)
     *
     * @var jIniMultiFilesModifier
     * @deprecated as public property
     */
    public $localConfigIni;

    /**
     * liveconfig.ini.php
     *
     * @var jIniFileModifier
     * @deprecated as public property
     */
    public $liveConfigIni;

    /**
     * entrypoint config
     * @var jIniFileModifier
     */
    protected $epConfigIni;

    /**
     * @var boolean true if the script corresponding to the configuration
     *                is a script for CLI
     */
    public $isCliScript;

    /**
     * @var string the url path of the entry point
     */
    public $scriptName;

    /**
     * @var string the filename of the entry point
     */
    public $file;

    /**
     * @var string the type of entry point
     */
    public $type;

    /**
     * @param jIniFileModifier    $mainConfig   the mainconfig.ini.php file
     * @param string $configFile the path of the configuration file, relative
     *                           to the var/config directory
     * @param string $file the filename of the entry point
     * @param string $type type of the entry point ('classic', 'cli', 'xmlrpc'....)
     */
    function __construct($mainConfig, $configFile, $file, $type) {
        $this->type = $type;
        $this->isCliScript = ($type == 'cmdline');
        $this->configFile = $configFile;
        $this->scriptName =  ($this->isCliScript?$file:'/'.$file);
        $this->file = $file;
        $this->epConfigIni = new jIniFileModifier(jApp::configPath($configFile));
        $this->configIni = new jIniMultiFilesModifier($mainConfig, $this->epConfigIni);
        $this->config = jConfigCompiler::read($configFile, true,
                                              $this->isCliScript,
                                              $this->scriptName);
    }

    /**
     * @return string the entry point id
     */
    function getEpId() {
        return $this->config->urlengine['urlScriptId'];
    }

    /**
     * @return array the list of modules and their path, as stored in the
     * compiled configuration file
     */
    function getModulesList() {
        return $this->config->_allModulesPathList;
    }

    /**
     * @return jInstallerModuleInfos informations about a specific module used
     * by the entry point
     */
    function getModule($moduleName) {
        return new jInstallerModuleInfos($moduleName, $this->config->modules);
    }

    /**
     * the entry point config
     * @return jIniFilesModifier
     * @since 1.6.8
     */
    function getEpConfigIni() {
        return $this->epConfigIni;
    }

    /**
     * @return string the config file name of the entry point
     */
    function getConfigFile() {
        return $this->configFile;
    }

    /**
     * @return stdObj the config content of the entry point, as seen when
     * calling jApp::config()
     */
    function getConfigObj() {
        return $this->config;
    }

    function setConfigObj($config) {
        $this->config = $config;
    }

    /**
     * Give only the content of mainconfig.ini.php
     * @return jIniFileModifier
     */
    function getSingleMainConfigIni() {
        return $this->localConfigIni->getMaster()->getMaster();
    }

    /**
     * Give only the content of localconfig.ini.php
     * @return jIniFileModifier
     */
    function getSingleLocalConfigIni() {
        return $this->localConfigIni->getMaster();
    }
}
