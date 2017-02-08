<?php
/**
* @package     jelix
* @subpackage  installer
* @author      Laurent Jouanneau
* @copyright   2009-2012 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* base class for installers
* @package     jelix
* @subpackage  installer
* @since 1.2
*/
abstract class jInstallerBase {

    /**
     * @var string name of the component
     */
    public $componentName;

    /**
     * @var string name of the installer
     */
    public $name;


    /**
     * the versions for which the installer should be called.
     * Useful for an upgrade which target multiple branches of a project.
     * Put the version for multiple branches. The installer will be called
     * only once, for the needed version.
     * If you don't fill it, the name of the class file should contain the
     * target version (deprecated behavior though)
     * @var array $targetVersions list of version by asc order
     * @since 1.2.6
     */
    public $targetVersions = array();

    /**
     * @var string the date of the release of the update. format: yyyy-mm-dd hh:ii
     * @since 1.2.6
     */
    public $date = '';

    /**
     * @var string the version for which the installer is called
     */
    public $version = '0';

    /**
     * combination between mainconfig.ini.php (master) and entrypoint config (overrider)
     * @var jIniMultiFilesModifier
     */
    public $config;
    
    /**
     * the entry point property on which the installer is called
     * @var jInstallerEntryPoint
     */
    public $entryPoint;
    
    /**
     * The path of the module
     * @var string
     */
    protected $path;

    /**
     * @var string the jDb profile for the component
     */
    protected $dbProfile = '';

    /**
     * @var string the default profile name for the component, if it exist. keep it to '' if not
     */
    protected $defaultDbProfile = '';

    /**
     * @var boolean true if this is an installation for the whole application.
     *              false if this is an installation in an
     *              already installed application. Always False for upgraders.
     */
    protected $installWholeApp = false;

    /**
     * parameters for the installer, indicated in the configuration file or
     * dynamically, by a launcher in a command line for instance.
     * @var array
     */
    protected $parameters = array();

    /**
     * @param string $componentName name of the component
     * @param string $name name of the installer
     * @param string $path the component path
     * @param string $version version of the component
     * @param boolean $installWholeApp true if the installation is during the whole app installation
     *                                 false if it is only few modules and this module
     */
    function __construct ($componentName, $name, $path, $version, $installWholeApp = false) {
        $this->path = $path;
        $this->version = $version;
        $this->name = $name;
        $this->componentName = $componentName;
        $this->installWholeApp = $installWholeApp;
    }

    function setParameters($parameters) {
        $this->parameters = $parameters;
    }

    function getParameter($name) {
        if (isset($this->parameters[$name]))
            return $this->parameters[$name];
        else
            return null;
    }

    /**
     * @var jDbConnection
     */
    private $_dbConn = null;

    /**
     * is called to indicate that the installer will be called for the given
     * configuration, entry point and db profile.
     * @param jInstallerEntryPoint $ep the entry point
     * @param jIniMultiFilesModifier $config the configuration of the entry point
     * @param string $dbProfile the name of the current jdb profile. It will be replaced by $defaultDbProfile if it exists
     * @param array $contexts  list of contexts already executed
     */
    public function setEntryPoint($ep, $config, $dbProfile, $contexts) {
        $this->config = $config;
        $this->entryPoint = $ep;
        $this->contextId = $contexts;
        $this->newContextId = array();

        if ($this->defaultDbProfile != '') {
            $this->useDbProfile($this->defaultDbProfile);
        }
        else
            $this->useDbProfile($dbProfile);
    }

    /**
     * use the given database profile. check if this is an alias and use the
     * real db profiel if this is the case.
     * @param string $dbProfile the profile name
     */
    protected function useDbProfile($dbProfile) {

        if ($dbProfile == '')
            $dbProfile = 'default';

        $this->dbProfile = $dbProfile;

        // we check if it is an alias
        if (file_exists(jApp::configPath('profiles.ini.php'))) {
            $dbprofiles = parse_ini_file(jApp::configPath('profiles.ini.php'));
            if (isset($dbprofiles['jdb'][$dbProfile]))
                $this->dbProfile = $dbprofiles['jdb'][$dbProfile];
        }

        $this->_dbConn = null; // we force to retrieve a db connection
    }

    protected $contextId = array();

    protected $newContextId = array();

    /**
     *
     */
    protected function firstExec($contextId) {
        if (in_array($contextId, $this->contextId)) {
            return false;
        }

        if (!in_array($contextId, $this->newContextId)) {
            $this->newContextId[] = $contextId;
        }
        return true;
    }

    /**
     *
     */
    protected function firstDbExec($profile = '') {
        if ($profile == '')
            $profile = $this->dbProfile;
        return $this->firstExec('db:'.$profile);
    }

    /**
     *
     */
    protected function firstConfExec($config = '') {
        if ($config == '')
            $config = $this->entryPoint->configFile;
        return $this->firstExec('cf:'.$config);
    }

    /**
     *
     */
    public function getContexts() {
        return array_unique(array_merge($this->contextId, $this->newContextId));
    }

    /**
     * @return jDbTools  the tool class of jDb
     */
    protected function dbTool () {
        return $this->dbConnection()->tools();
    }

    /**
     * @return jDbConnection  the connection to the database used for the module
     */
    protected function dbConnection () {
        if (!$this->_dbConn)
            $this->_dbConn = jDb::getConnection($this->dbProfile);
        return $this->_dbConn;
    }

    /**
     * @param string $profile the db profile
     * @return string the name of the type of database
     */
    protected function getDbType($profile = null) {
        if (!$profile)
            $profile = $this->dbProfile;
        $conn = jDb::getConnection($profile);
        return $conn->dbms;
    }

    /**
     * import a sql script into the current profile.
     *
     * The name of the script should be store in install/$name.databasetype.sql
     * in the directory of the component. (replace databasetype by mysql, pgsql etc.)
     * You can however provide a script compatible with all databases, but then
     * you should indicate the full name of the script, with a .sql extension.
     *
     * @param string $name the name of the script
     * @param string $module the module from which we should take the sql file. null for the current module
     * @param boolean $inTransaction indicate if queries should be executed inside a transaction
     * @throws Exception
     */
    final protected function execSQLScript ($name, $module = null, $inTransaction = true) {

        $conn = $this->dbConnection();
        $tools = $this->dbTool();

        if ($module) {
            $conf = $this->entryPoint->config->_modulesPathList;
            if (!isset($conf[$module])) {
                throw new Exception('execSQLScript : invalid module name');
            }
            $path = $conf[$module];
        }
        else {
            $path = $this->path;
        }
        $file = $path.'install/'.$name;
        if (substr($name, -4) != '.sql')
            $file .= '.'.$conn->dbms.'.sql';

        if ($inTransaction)
            $conn->beginTransaction();
        try {
            $tools->execSQLScript($file);
            if ($inTransaction) {
                $conn->commit();
            }
        }
        catch(Exception $e) {
            if ($inTransaction)
                $conn->rollback();
            throw $e;
        }
    }

    /**
     * copy the whole content of a directory existing in the install/ directory
     * of the component, to the given directory
     * @param string $relativeSourcePath relative path to the install/ directory of the component
     * @param string $targetPath the full path where to copy the content
     */
    final protected function copyDirectoryContent($relativeSourcePath, $targetPath, $overwrite = false) {
        $targetPath = $this->expandPath($targetPath);
        $this->_copyDirectoryContent ($this->path.'install/'.$relativeSourcePath, $targetPath, $overwrite);
    }

    /**
     * private function which copy the content of a directory to an other
     *
     * @param string $sourcePath 
     * @param string $targetPath
     */
    private function _copyDirectoryContent($sourcePath, $targetPath, $overwrite) {
        jFile::createDir($targetPath);
        $dir = new DirectoryIterator($sourcePath);
        foreach ($dir as $dirContent) {
            if ($dirContent->isFile()) {
                $p = $targetPath.substr($dirContent->getPathName(), strlen($dirContent->getPath()));
                if ($overwrite || !file_exists($p))
                    copy($dirContent->getPathName(), $p);
            } else {
                if (!$dirContent->isDot() && $dirContent->isDir()) {
                    $newTarget = $targetPath.substr($dirContent->getPathName(), strlen($dirContent->getPath()));
                    $this->_copyDirectoryContent($dirContent->getPathName(),$newTarget, $overwrite);
                }
            }
        }
    }


    /**
     * copy a file from the install/ directory to an other
     * @param string $relativeSourcePath relative path to the install/ directory of the file to copy
     * @param string $targetPath the full path where to copy the file
     */
    final protected function copyFile($relativeSourcePath, $targetPath, $overwrite = false) {
        $targetPath = $this->expandPath($targetPath);
        if (!$overwrite && file_exists($targetPath))
            return;
        $dir = dirname($targetPath);
        jFile::createDir($dir);
        copy ($this->path.'install/'.$relativeSourcePath, $targetPath);
    }

    protected function expandPath($path) {
         if (strpos($path, 'www:') === 0)
            $path = str_replace('www:', jApp::wwwPath(), $path);
        elseif (strpos($path, 'jelixwww:') === 0) {
            $p = $this->config->getValue('jelixWWWPath','urlengine');
            if (substr($p, -1) != '/')
                $p.='/';
            $path = str_replace('jelixwww:', jApp::wwwPath($p), $path);
        }
        elseif (strpos($path, 'config:') === 0) {
            $path = str_replace('config:', jApp::configPath(), $path);
        }
        elseif (strpos($path, 'epconfig:') === 0) {
            $p = dirname(jApp::configPath($this->entryPoint->configFile));
            $path = str_replace('epconfig:', $p.'/', $path);
        }
        return $path;
    }

    /**
     * declare a new db profile. if the content of the section is not given,
     * it will declare an alias to the default profile
     * @param string $name  the name of the new section/alias
     * @param null|string|array  $sectionContent the content of the new section, or null
     *     to create an alias.
     * @param boolean $force true:erase the existing profile
     * @return boolean true if the ini file has been changed
     */
    protected function declareDbProfile($name, $sectionContent = null, $force = true ) {
        $profiles = new jIniFileModifier(jApp::configPath('profiles.ini.php'));
        if ($sectionContent == null) {
            if (!$profiles->isSection('jdb:'.$name)) {
                // no section
                if ($profiles->getValue($name, 'jdb') && !$force) {
                    // already a name
                    return false;
                }
            }
            else if ($force) {
                // existing section, and no content provided : we erase the section
                // and add an alias
                $profiles->removeValue('', 'jdb:'.$name);
            }
            else {
                return false;
            }
            $default = $profiles->getValue('default', 'jdb');
            if($default) {
                $profiles->setValue($name, $default, 'jdb');
            }
            else // default is a section
                $profiles->setValue($name, 'default', 'jdb');
        }
        else {
            if ($profiles->getValue($name, 'jdb') !== null) {
                if (!$force)
                    return false;
                $profiles->removeValue($name, 'jdb');
            }
            if (is_array($sectionContent)) {
                foreach($sectionContent as $k=>$v) {
                    if ($force || !$profiles->getValue($k, 'jdb:'.$name)) {
                        $profiles->setValue($k,$v, 'jdb:'.$name);
                    }
                }
            }
            else {
                $profile = $profiles->getValue($sectionContent, 'jdb');
                if ($profile !== null) {
                    $profiles->setValue($name, $profile, 'jdb');
                }
                else
                    $profiles->setValue($name, $sectionContent, 'jdb');
            }
        }
        $profiles->save();
        jProfiles::clear();
        return true;
    }

    /**
     * declare a plugins directory
     * @param string $path a path. it could contains aliases like 'app:', 'lib:' or 'module:'
     * @since 1.4
     */
    function declarePluginsPath($path) {
        if (preg_match('@^module:([^/]+)(/.*)?$@', $path, $m)) {
            if (!isset($m[2]))
                $path.= '/plugins';
            else  if (strlen($m[2]) == 1)
                $path.= 'plugins';
        }
        $pluginsPath = $this->config->getValue('pluginsPath');
        $list = preg_split('/ *, */',$pluginsPath);
        $path = rtrim($path, '/');
        foreach($list as $p) {
            if (preg_match('@^module:([^/]+)(/.*)?$@', $p, $m)) {
                if (!isset($m[2]))
                    $p.= '/plugins';
                else  if (strlen($m[2]) == 1)
                    $p.= 'plugins';
            }

            if (rtrim($p, '/') == $path)
                return;
        }
        $pluginsPath .= ','.$path;
        $this->config->setValue('pluginsPath', $pluginsPath);
    }
}
