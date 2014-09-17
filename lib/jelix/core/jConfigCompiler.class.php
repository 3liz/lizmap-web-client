<?php
/**
* @package      jelix
* @subpackage   core
* @author       Laurent Jouanneau
* @contributor  Thibault Piront (nuKs), Christophe Thiriot, Philippe Schelté
* @copyright    2006-2012 Laurent Jouanneau
* @copyright    2007 Thibault Piront, 2008 Christophe Thiriot, 2008 Philippe Schelté
* @link         http://www.jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * jConfigCompiler merge two ini file in a single array and store it in a temporary file
 * This is a static class
 * @package  jelix
 * @subpackage core
 * @static
 */
class jConfigCompiler {

    static protected $commonConfig;

    private function __construct (){ }

    /**
     * read the given ini file, for the current entry point, or for the entrypoint given
     * in $pseudoScriptName. Merge it with the content of defaultconfig.ini.php
     * It also calculates some options.
     * If you are in a CLI script but you want to load a configuration file for a web entry point
     * or vice-versa, you need to indicate the $pseudoScriptName parameter with the name of the entry point
     * @param string $configFile the config file name
     * @param boolean $allModuleInfo may be true for the installer, which needs all informations
     *                               else should be false, these extra informations are
     *                               not needed to run the application
     * @param boolean $isCli  indicate if the configuration to read is for a CLI script or no
     * @param string $pseudoScriptName the name of the entry point, relative to the base path,
     *              corresponding to the readed configuration
     * @return object an object which contains configuration values
     */
    static public function read($configFile, $allModuleInfo = false, $isCli = false, $pseudoScriptName=''){

        $tempPath = jApp::tempBasePath();
        $configPath = jApp::configPath();

        if($tempPath=='/'){
            // if it equals to '/', this is because realpath has returned false in the application.init.php
            // so this is because the path doesn't exist.
            throw new Exception('Application temp directory doesn\'t exist !', 3);
        }

        if(!is_writable($tempPath)){
            throw new Exception('Application temp base directory is not writable -- ('.$tempPath.')', 4);
        }

        if(!is_writable(jApp::logPath())) {
            throw new Exception('Application log directory is not writable -- ('.jApp::logPath().')', 4);
        }

        $config = jelix_read_ini(JELIX_LIB_CORE_PATH.'defaultconfig.ini.php');
        self::$commonConfig = clone $config;

        @jelix_read_ini($configPath.'defaultconfig.ini.php', $config);

        if($configFile != 'defaultconfig.ini.php'){
            if(!file_exists($configPath.$configFile))
                throw new Exception("Configuration file is missing -- $configFile", 5);
            if( false === @jelix_read_ini($configPath.$configFile, $config))
                throw new Exception("Syntax error in the configuration file -- $configFile", 6);
        }

        self::prepareConfig($config, $allModuleInfo, $isCli, $pseudoScriptName);
        self::$commonConfig = null;
        return $config;
    }

    /**
     * Identical to read(), but also stores the result in a temporary file
     * @param string $configFile the config file name
     * @param boolean $isCli
     * @param string $pseudoScriptName
     * @return object an object which contains configuration values
     */
    static public function readAndCache($configFile, $isCli = null, $pseudoScriptName = '') {

        if ($isCli === null)
            $isCli = jServer::isCLI();

        $config = self::read($configFile, false, $isCli, $pseudoScriptName);
        $tempPath = jApp::tempPath();
        jFile::createDir($tempPath);
        $filename = $tempPath.str_replace('/','~',$configFile);

        if(BYTECODE_CACHE_EXISTS){
            $filename .= '.conf.php';
            if ($f = @fopen($filename, 'wb')) {
                fwrite($f, '<?php $config = '.var_export(get_object_vars($config),true).";\n?>");
                fclose($f);
            } else {
                throw new Exception('Error while writing configuration cache file -- '.$filename);
            }
        }else{
            jIniFile::write(get_object_vars($config), $filename.'.resultini.php', ";<?php die('');?>\n");
        }
        return $config;
    }

    /**
     * fill some config properties with calculated values
     * @param object $config  the config object
     * @param boolean $allModuleInfo may be true for the installer, which needs all informations
     *                               else should be false, these extra informations are
     *                               not needed to run the application
     * @param boolean $isCli  indicate if the configuration to read is for a CLI script or no
     * @param string $pseudoScriptName the name of the entry point, relative to the base path,
     *              corresponding to the readed configuration
     */
    static protected function prepareConfig($config, $allModuleInfo, $isCli, $pseudoScriptName){

        self::checkMiscParameters($config);
        self::getPaths($config->urlengine, $pseudoScriptName, $isCli);
        self::_loadModuleInfo($config, $allModuleInfo);
        self::_loadPluginsPathList($config);
        self::checkCoordPluginsPath($config);
        self::runConfigCompilerPlugins($config);
    }

    static protected function checkMiscParameters($config) {
        $config->isWindows = (DIRECTORY_SEPARATOR === '\\');
        if(trim( $config->startAction) == '') {
            $config->startAction = ':';
        }

        if ($config->domainName == "" && isset($_SERVER['SERVER_NAME']))
            $config->domainName = $_SERVER['SERVER_NAME'];

        $config->_allBasePath = array();

        if ($config->urlengine['engine'] == 'simple')
            trigger_error("The 'simple' url engine is deprecated. use 'basic_significant' or 'significant' url engine", E_USER_NOTICE);
    }

    static protected function checkCoordPluginsPath($config) {
        $coordplugins = array();
        foreach ($config->coordplugins as $name=>$conf) {
            if (!isset($config->_pluginsPathList_coord[$name])) {
                throw new Exception("Error in the main configuration. A plugin doesn't exist -- The coord plugin $name is unknown.", 7);
            }
            if ($conf) {
                if ($conf != '1' && !file_exists(jApp::configPath($conf))) {
                    throw new Exception("Error in the main configuration. A plugin configuration file doesn't exist -- Configuration file for the coord plugin $name doesn't exist: '$conf'", 8);
                }
                $coordplugins[$name] = $conf;
            }
        }
        $config->coordplugins = $coordplugins;
    }

    static protected function runConfigCompilerPlugins($config) {
        if (!isset($config->_pluginsPathList_configcompiler)) {
            return;
        }

        // load plugins
        $plugins = array();
        foreach($config->_pluginsPathList_configcompiler as $pluginName => $path) {
            $file = $path.$pluginName.'.configcompiler.php';
            if (!file_exists($file) ){
                continue;
            }

            require_once($file);
            $classname = $pluginName.'ConfigCompilerPlugin';
            $plugins[] = new $classname();
        }
        if (!count($plugins))
            return;

        // sort plugins by priority
        usort($plugins, function($a, $b){ return $a->getPriority() < $b->getPriority();});

        // run plugins
        foreach($plugins as $plugin)
            $plugin->atStart($config);

        foreach($config->_modulesPathList as $moduleName=>$modulePath) {
            $moduleXml = simplexml_load_file($modulePath.'module.xml');
            foreach($plugins as $plugin) {
                $plugin->onModule($config, $moduleName, $modulePath, $moduleXml);
            }
        }

        foreach($plugins as $plugin)
            $plugin->atEnd($config);
    }
    
    /**
     * Analyse and check the "lib:" and "app:" path.
     * @param object $config  the config object
     * @param boolean $allModuleInfo may be true for the installer, which needs all informations
     *                               else should be false, these extra informations are
     *                               not needed to run the application
     */
    static protected function _loadModuleInfo($config, $allModuleInfo) {

        $installerFile = jApp::configPath('installer.ini.php');

        if ($config->disableInstallers) {
            $installation = array ();
        }
        else if (!file_exists($installerFile)) {
            if ($allModuleInfo)
                $installation = array ();
            else
                throw new Exception("The application is not installed -- installer.ini.php doesn't exist!\n", 9);
        }
        else
            $installation = parse_ini_file($installerFile,true);

        $section = $config->urlengine['urlScriptId'];

        if (!isset($installation[$section]))
            $installation[$section] = array();

        $list = preg_split('/ *, */',$config->modulesPath);
        if (isset(self::$commonConfig->modulesPath))
            $list = array_merge($list, preg_split('/ *, */',self::$commonConfig->modulesPath));
        array_unshift($list, JELIX_LIB_PATH.'core-modules/');
        $pathChecked = array();

        foreach($list as $k=>$path){
            if(trim($path) == '') continue;
            $p = str_replace(array('lib:','app:'), array(LIB_PATH, jApp::appPath()), $path);
            if (!file_exists($p)) {
                throw new Exception('Error in the configuration file -- The path, '.$path.' given in the jelix config, doesn\'t exist', 10);
            }
            if (substr($p,-1) !='/')
                $p.='/';
            if (in_array($p, $pathChecked))
                continue;
            $pathChecked[] = $p;

             // don't include the core-modules into the list of base path. this list is to verify
             // if modules have been modified into repositories
            if ($k!=0 && $config->compilation['checkCacheFiletime'])
                $config->_allBasePath[]=$p;

            if ($handle = opendir($p)) {
                while (false !== ($f = readdir($handle))) {
                    if ($f[0] != '.' && is_dir($p.$f)) {

                        if ($config->disableInstallers)
                            $installation[$section][$f.'.installed'] = 1;
                        else if (!isset($installation[$section][$f.'.installed']))
                            $installation[$section][$f.'.installed'] = 0;

                        if ($f == 'jelix') {
                            $config->modules['jelix.access'] = 2; // the jelix module should always be public
                        }
                        else {
                            if ($config->enableAllModules) {
                                if ($config->disableInstallers
                                    || $installation[$section][$f.'.installed']
                                    || $allModuleInfo)
                                    $config->modules[$f.'.access'] = 2;
                                else
                                    $config->modules[$f.'.access'] = 0;
                            }
                            else if (!isset($config->modules[$f.'.access'])) {
                                // no given access in defaultconfig and ep config
                                $config->modules[$f.'.access'] = 0;
                            }
                            else if($config->modules[$f.'.access'] == 0){
                                // we want to activate the module if it is not activated
                                // for the entry point, but is declared activated
                                // in the default config file. In this case, it means
                                // that it is activated for an other entry point,
                                // and then we want the possibility to retrieve its
                                // urls, at least
                                if (isset(self::$commonConfig->modules[$f.'.access'])
                                    && self::$commonConfig->modules[$f.'.access'] > 0)
                                    $config->modules[$f.'.access'] = 3;
                            }
                            else if (!$installation[$section][$f.'.installed']) {
                                // module is not installed.
                                // outside installation mode, we force the access to 0
                                // so the module is unusable until it is installed
                                if (!$allModuleInfo)
                                    $config->modules[$f.'.access'] = 0;
                            }
                        }

                        if (!isset($installation[$section][$f.'.dbprofile']))
                            $config->modules[$f.'.dbprofile'] = 'default';
                        else
                            $config->modules[$f.'.dbprofile'] = $installation[$section][$f.'.dbprofile'];

                        if ($allModuleInfo) {
                            if (!isset($installation[$section][$f.'.version']))
                                $installation[$section][$f.'.version'] = '';

                            if (!isset($installation[$section][$f.'.dataversion']))
                                $installation[$section][$f.'.dataversion'] = '';

                            if (!isset($installation['__modules_data'][$f.'.contexts']))
                                $installation['__modules_data'][$f.'.contexts'] = '';

                            $config->modules[$f.'.version'] = $installation[$section][$f.'.version'];
                            $config->modules[$f.'.dataversion'] = $installation[$section][$f.'.dataversion'];
                            $config->modules[$f.'.installed'] = $installation[$section][$f.'.installed'];

                            $config->_allModulesPathList[$f]=$p.$f.'/';
                        }

                        if ($config->modules[$f.'.access'] == 3) {
                            $config->_externalModulesPathList[$f]=$p.$f.'/';
                        }
                        elseif ($config->modules[$f.'.access']) {
                            $config->_modulesPathList[$f]=$p.$f.'/';
                            if (file_exists( $p.$f.'/plugins')) {
                                $config->pluginsPath .= ',module:'.$f;
                            }
                        }
                    }
                }
                closedir($handle);
            }
        }
    }

    /**
     * Analyse plugin paths
     * @param object $config the config container
     */
    static protected function _loadPluginsPathList($config) {
        $list = preg_split('/ *, */',$config->pluginsPath);
        array_unshift($list, JELIX_LIB_PATH.'plugins/');
        foreach($list as $k=>$path){
            if(trim($path) == '') continue;
            if (preg_match('@^module:([^/]+)(/.*)?$@', $path, $m)) {
                $mod = $m[1];
                if (isset($config->_modulesPathList[$mod])) {
                    $p = $config->_modulesPathList[$mod];
                    if (isset($m[2]) && strlen($m[2]) > 1)
                        $p.=$m[2];
                    else
                        $p.= '/plugins/';
                }
                else {
                    trigger_error('Error in main configuration on pluginsPath -- Path given in pluginsPath for the module '.$mod.' is ignored, since this module is unknown or deactivated', E_USER_NOTICE);
                    continue;
                }
            }
            else {
                $p = str_replace(array('lib:','app:'), array(LIB_PATH, jApp::appPath()), $path);
            }
            if(!file_exists($p)){
                trigger_error('Error in main configuration on pluginsPath -- The path, '.$path.' given in the jelix config, doesn\'t exists !',E_USER_ERROR);
                exit;
            }
            if(substr($p,-1) !='/')
                $p.='/';

            if ($handle = opendir($p)) {
                while (false !== ($f = readdir($handle))) {
                    if ($f[0] != '.' && is_dir($p.$f)) {
                        if($subdir = opendir($p.$f)){
                            if($k!=0 && $config->compilation['checkCacheFiletime'])
                               $config->_allBasePath[]=$p.$f.'/';
                            while (false !== ($subf = readdir($subdir))) {
                                if ($subf[0] != '.' && is_dir($p.$f.'/'.$subf)) {
                                    if($f == 'tpl'){
                                        $prop = '_tplpluginsPathList_'.$subf;
                                        $config->{$prop}[] = $p.$f.'/'.$subf.'/';
                                    }else{
                                        $prop = '_pluginsPathList_'.$f;
                                        $config->{$prop}[$subf] = $p.$f.'/'.$subf.'/';
                                    }
                                }
                            }
                            closedir($subdir);
                        }
                    }
                }
                closedir($handle);
            }
        }
    }

    /**
     * calculate miscelaneous path, depending of the server configuration and other informations
     * in the given array : script path, script name, documentRoot ..
     * @param array $urlconf  urlengine configuration. scriptNameServerVariable, basePath,
     * jelixWWWPath and jqueryPath should be present
     */
    static public function getPaths(&$urlconf, $pseudoScriptName ='', $isCli = false) {
        // retrieve the script path+name.
        // for cli, it will be the path from the directory were we execute the script (given to the php exec).
        // for web, it is the path from the root of the url

        if ($pseudoScriptName) {
            $urlconf['urlScript'] = $pseudoScriptName;
        }
        else {
            if($urlconf['scriptNameServerVariable'] == '') {
                $urlconf['scriptNameServerVariable'] = self::findServerName('.php', $isCli);
            }
            $urlconf['urlScript'] = $_SERVER[$urlconf['scriptNameServerVariable']];
        }
        $lastslash = strrpos ($urlconf['urlScript'], '/');

        // now we separate the path and the name of the script, and then the basePath
        if ($isCli) {
            if ($lastslash === false) {
                $urlconf['urlScriptPath'] = ($pseudoScriptName? jApp::appPath('/scripts/'): getcwd().'/');
                $urlconf['urlScriptName'] = $urlconf['urlScript'];
            }
            else {
                $urlconf['urlScriptPath'] = getcwd().'/'.substr ($urlconf['urlScript'], 0, $lastslash ).'/';
                $urlconf['urlScriptName'] = substr ($urlconf['urlScript'], $lastslash+1);
            }
            $basepath = $urlconf['urlScriptPath'];
            $snp = $urlconf['urlScriptName'];
            $urlconf['urlScript'] = $basepath.$snp;
        }
        else {
            $urlconf['urlScriptPath'] = substr ($urlconf['urlScript'], 0, $lastslash ).'/';
            $urlconf['urlScriptName'] = substr ($urlconf['urlScript'], $lastslash+1);

            $basepath = $urlconf['basePath'];
            if ($basepath == '') {
                // for beginners or simple site, we "guess" the base path
                $basepath = $localBasePath = $urlconf['urlScriptPath'];
            }
            else {
                if ($basepath != '/') {
                    if($basepath[0] != '/') $basepath='/'.$basepath;
                    if(substr($basepath,-1) != '/') $basepath.='/';
                }

                if ($pseudoScriptName) {
                    // with pseudoScriptName, we aren't in a true context, we could be in a cli context
                    // (the installer), and we want the path like when we are in a web context.
                    // $pseudoScriptName is supposed to be relative to the basePath
                    $urlconf['urlScriptPath'] = substr($basepath,0,-1).$urlconf['urlScriptPath'];
                    $urlconf['urlScript'] = $urlconf['urlScriptPath'].$urlconf['urlScriptName'];
                }
                $localBasePath = $basepath;
                if ($urlconf['backendBasePath']) {
                    $localBasePath = $urlconf['backendBasePath'];
                    // we have to change urlScriptPath. it may contains the base path of the backend server
                    // we should replace this base path by the basePath of the frontend server
                    if (strpos($urlconf['urlScriptPath'], $urlconf['backendBasePath']) === 0) {
                        $urlconf['urlScriptPath'] = $basepath.substr( $urlconf['urlScriptPath'], strlen($urlconf['backendBasePath']));
                    }
                    else  {
                        $urlconf['urlScriptPath'] = $basepath.substr($urlconf['urlScriptPath'], 1);
                    }

                }elseif(strpos($urlconf['urlScriptPath'], $basepath) !== 0) {
                    throw new Exception('Error in main configuration on basePath -- basePath ('.$basepath.') in config file doesn\'t correspond to current base path. You should setup it to '.$urlconf['urlScriptPath']);
                }
            }

            $urlconf['basePath'] = $basepath;

            if($urlconf['jelixWWWPath'][0] != '/')
                $urlconf['jelixWWWPath'] = $basepath.$urlconf['jelixWWWPath'];
            if($urlconf['jqueryPath'][0] != '/')
                $urlconf['jqueryPath'] = $basepath.$urlconf['jqueryPath'];
            $snp = substr($urlconf['urlScript'],strlen($localBasePath));

            if ($localBasePath == '/')
                $urlconf['documentRoot'] = jApp::wwwPath();
            else if(strpos(jApp::wwwPath(), $localBasePath) === false) {
                if (isset($_SERVER['DOCUMENT_ROOT']))
                    $urlconf['documentRoot'] = $_SERVER['DOCUMENT_ROOT'];
                else
                    $urlconf['documentRoot'] = jApp::wwwPath();
            }
            else
                $urlconf['documentRoot'] = substr(jApp::wwwPath(), 0, - (strlen($localBasePath)));
        }

        $pos = strrpos($snp, '.php');
        if($pos !== false){
            $snp = substr($snp,0,$pos);
        }
        $urlconf['urlScriptId'] = $snp;
        $urlconf['urlScriptIdenc'] = rawurlencode($snp);
    }

    static public function findServerName($ext = '.php', $isCli = false) {
        $varname = '';
        $extlen = strlen($ext);

        if(strrpos($_SERVER['SCRIPT_NAME'], $ext) === (strlen($_SERVER['SCRIPT_NAME']) - $extlen)
           || $isCli) {
            return 'SCRIPT_NAME';
        }else if (isset($_SERVER['REDIRECT_URL'])
                  && strrpos( $_SERVER['REDIRECT_URL'], $ext) === (strlen( $_SERVER['REDIRECT_URL']) -$extlen)) {
            return 'REDIRECT_URL';
        }else if (isset($_SERVER['ORIG_SCRIPT_NAME'])
                  && strrpos( $_SERVER['ORIG_SCRIPT_NAME'], $ext) === (strlen( $_SERVER['ORIG_SCRIPT_NAME']) - $extlen)) {
            return 'ORIG_SCRIPT_NAME';
        }
        throw new Exception('Error in main configuration on URL engine parameters -- In config file the parameter urlengine:scriptNameServerVariable is empty and Jelix doesn\'t find
            the variable in $_SERVER which contains the script name. You must see phpinfo and setup this parameter in your config file.', 11);
    }


}
