<?php
/**
* check a jelix installation
*
* @package  jelix
* @subpackage core
* @author   Laurent Jouanneau
* @contributor Bastien Jaillot
* @contributor Olivier Demah, Brice Tence, Julien Issler
* @copyright 2007-2011 Laurent Jouanneau, 2008 Bastien Jaillot, 2009 Olivier Demah, 2010 Brice Tence, 2011 Julien Issler
* @link     http://www.jelix.org
* @licence  GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
* @since 1.0b2
*/

/**
 * check an installation of a jelix application
 * @package  jelix
 * @subpackage core
 * @since 1.0b2
 */
class jInstallCheck {

    /**
     * the object responsible of the results output
     * @var jIInstallReporter
     */
    protected $reporter;

    /**
     * @var jInstallerMessageProvider
     */
    public $messages;

    public $nbError = 0;
    public $nbOk = 0;
    public $nbWarning = 0;
    public $nbNotice = 0;

    protected $buildProperties;

    public $verbose = false;

    public $checkForInstallation = false;

    function __construct ($reporter, $lang=''){
        $this->reporter = $reporter;
        $this->messages = new jInstallerMessageProvider($lang);
    }

    protected $otherExtensions = array();

    function addExtensionCheck($extension, $required) {
        $this->otherExtensions[$extension] = $required;
    }

    protected $otherPaths = array();

    /**
     * @since 1.2.5
     */
    function addWritablePathCheck($pathOrFileName) {
        if (is_array($pathOrFileName))
            $this->otherPaths = array_merge($this->otherPaths, $pathOrFileName);
        else
            $this->otherPaths[] = $pathOrFileName;
    }

    protected $databases = array();
    protected $dbRequired = false;

    function addDatabaseCheck($databases, $required) {
        $this->databases = $databases;
        $this->dbRequired = $required;
    }

    /**
     * run the ckecking
     */
    function run(){
        $this->nbError = 0;
        $this->nbOk = 0;
        $this->nbWarning = 0;
        $this->nbNotice = 0;
        $this->reporter->start();
        try {
            $this->checkAppPaths();
            $this->loadBuildFile();
            $this->checkPhpExtensions();
            $this->checkPhpSettings();
        }catch(Exception $e){
            $this->error('cannot.continue',$e->getMessage());
        }
        $results = array('error'=>$this->nbError, 'warning'=>$this->nbWarning, 'ok'=>$this->nbOk,'notice'=>$this->nbNotice);
        $this->reporter->end($results);
    }

    protected function error($msg, $msgparams=array(), $extraMsg=''){
        if($this->reporter)
            $this->reporter->message($this->messages->get($msg, $msgparams).$extraMsg, 'error');
        $this->nbError ++;
    }

    protected function ok($msg, $msgparams=array()){
        if($this->reporter)
            $this->reporter->message($this->messages->get($msg, $msgparams), 'ok');
        $this->nbOk ++;
    }
    /**
     * generate a warning
     * @param string $msg  the key of the message to display
     */
    protected function warning($msg, $msgparams=array()){
        if($this->reporter)
            $this->reporter->message($this->messages->get($msg, $msgparams), 'warning');
        $this->nbWarning ++;
    }

    protected function notice($msg, $msgparams=array()){
        if($this->reporter) {
            $this->reporter->message($this->messages->get($msg, $msgparams), 'notice');
        }
        $this->nbNotice ++;
    }

    function checkPhpExtensions(){
        $ok=true;
        if(!version_compare($this->buildProperties['PHP_VERSION_TARGET'], phpversion(), '<=')){
            $this->error('php.bad.version');
            $notice = $this->messages->get('php.version.required', $this->buildProperties['PHP_VERSION_TARGET']);
            $notice.= '. '.$this->messages->get('php.version.current',phpversion());
            $this->reporter->showNotice($notice);
            $ok=false;
        }
        else if ($this->verbose) {
            $this->ok('php.ok.version', phpversion());
        }

        $extensions = array( 'dom', 'SPL', 'SimpleXML', 'pcre', 'session',
            'tokenizer', 'iconv', 'filter', 'json');

        if($this->buildProperties['ENABLE_PHP_JELIX'] == '1')
            $extensions[] = 'jelix';

        foreach($extensions as $name){
            if(!extension_loaded($name)){
                $this->error('extension.required.not.installed', $name);
                $ok=false;
            }
            else if ($this->verbose) {
                $this->ok('extension.required.installed', $name);
            }
        }

        if($this->buildProperties['WITH_BYTECODE_CACHE'] != 'auto' &&
           $this->buildProperties['WITH_BYTECODE_CACHE'] != '') {
            if(!extension_loaded ('apc') && !extension_loaded ('eaccelerator') && !extension_loaded ('xcache')) {
                $this->error('extension.opcode.cache');
                $ok=false;
            }
        }

        if (count($this->databases)) {
            $req = ($this->dbRequired?'required':'optional');
            $okdb = false;
            if (class_exists('PDO'))
                $pdodrivers = PDO::getAvailableDrivers();
            else
                $pdodrivers = array();

            foreach($this->databases as $name){
                if(!extension_loaded($name) && !in_array($name, $pdodrivers)){
                    $this->notice('extension.not.installed', $name);
                }
                else {
                    $okdb = true;
                    if ($this->verbose)
                        $this->ok('extension.installed', $name);
                }
            }
            if ($this->dbRequired) {
                if ($okdb) {
                    $this->ok('extension.database.ok');
                }
                else {
                    $this->error('extension.database.missing');
                    $ok = false;
                }
            }
            else {
                if ($okdb) {
                    $this->ok('extension.database.ok2');
                }
                else {
                    $this->notice('extension.database.missing2');
                }
            }

        }

        foreach($this->otherExtensions as $name=>$required){
            $req = ($required?'required':'optional');
            if(!extension_loaded($name)){
                if ($required) {
                    $this->error('extension.'.$req.'.not.installed', $name);
                    $ok=false;
                }
                else {
                    $this->notice('extension.'.$req.'.not.installed', $name);
                }
            }
            else if ($this->verbose) {
                $this->ok('extension.'.$req.'.installed', $name);
            }
        }

        if($ok)
            $this->ok('extensions.required.ok');

        return $ok;
    }
    function checkAppPaths(){
        $ok = true;
        if(!defined('JELIX_LIB_PATH') || !jApp::isInit()){
            throw new Exception($this->messages->get('path.core'));
        }

        if(!file_exists(jApp::tempBasePath()) || !is_writable(jApp::tempBasePath())){
            $this->error('path.temp');
            $ok=false;
        }
        if(!file_exists(jApp::logPath()) || !is_writable(jApp::logPath())){
            $this->error('path.log');
            $ok=false;
        }
        if(!file_exists(jApp::varPath())){
            $this->error('path.var');
            $ok=false;
        }
        if(!file_exists(jApp::configPath())){
            $this->error('path.config');
            $ok=false;
        }
        elseif ($this->checkForInstallation) {
            if (!is_writable(jApp::configPath())) {
                $this->error('path.config.writable');
                $ok = false;
            }
            if (file_exists(jApp::configPath('profiles.ini.php'))
                && !is_writable(jApp::configPath('profiles.ini.php'))) {
                $this->error('path.profiles.writable');
                $ok = false;
            }
            if (file_exists(jApp::configPath('defaultconfig.ini.php'))
                && !is_writable(jApp::configPath('defaultconfig.ini.php'))) {
                $this->error('path.defaultconfig.writable');
                $ok = false;
            }
            if (file_exists(jApp::configPath('installer.ini.php'))
                && !is_writable(jApp::configPath('installer.ini.php'))) {
                $this->error('path.installer.writable');
                $ok = false;
            }
        }

        if(!file_exists(jApp::wwwPath())){
            $this->error('path.www');
            $ok=false;
        }

        foreach($this->otherPaths as $path) {
            $realPath = str_replace(array('app:','lib:','var:', 'www:'), array(jApp::appPath(), LIB_PATH, jApp::varPath(), jApp::wwwPath()), $path);
            if (!file_exists($realPath)) {
                $this->error('path.custom.not.exists', array($path));
                $ok = false;
            }
            else if(!is_writable($realPath)) {
                $this->error('path.custom.writable', array($path));
                $ok = false;
            }
            else
                $this->ok('path.custom.ok', array($path));
        }

        if($ok)
            $this->ok('paths.ok');
        else
            throw new Exception($this->messages->get('too.critical.error'));

        /*if(!isset($GLOBALS['config_file']) ||
           empty($GLOBALS['config_file']) ||
           !file_exists(jApp::configPath($GLOBALS['config_file']))){
            throw new Exception($this->messages->get('config.file'));
        }*/

        return $ok;
    }

    function loadBuildFile() {
        if (!file_exists(JELIX_LIB_PATH.'BUILD')){
            throw new Exception($this->messages->get('build.not.found'));
        } else {
            $this->buildProperties = parse_ini_file(JELIX_LIB_PATH.'BUILD');
        }
    }

    function checkPhpSettings(){
        $ok = true;
        if (file_exists(jApp::configPath("defaultconfig.ini.php")))
            $defaultconfig = parse_ini_file(jApp::configPath("defaultconfig.ini.php"), true);
        else
            $defaultconfig = array();
        if (file_exists(jApp::configPath("index/config.ini.php")))
            $indexconfig = parse_ini_file(jApp::configPath("index/config.ini.php"), true);
        else
            $indexconfig = array();

        if ((isset ($defaultconfig['coordplugins']['magicquotes']) && $defaultconfig['coordplugins']['magicquotes'] == 1) ||
            (isset ($indexconfig['coordplugins']['magicquotes']) && $indexconfig['coordplugins']['magicquotes'] == 1)) {
            if(ini_get('magic_quotes_gpc') == 1){
                $this->notice('ini.magic_quotes_gpc_with_plugin');
            }
            else {
                $this->error('ini.magicquotes_plugin_without_php');
                $ok=false;
            }
        }
        else {
            if(ini_get('magic_quotes_gpc') == 1){
                $this->warning('ini.magic_quotes_gpc');
                $ok=false;
            }
        }
        if(ini_get('magic_quotes_runtime') == 1){
            $this->error('ini.magic_quotes_runtime');
            $ok=false;
        }

        if(ini_get('session.auto_start') == 1){
            $this->error('ini.session.auto_start');
            $ok=false;
        }

        if(ini_get('safe_mode') == 1){
            $this->warning('safe_mode');
            $ok=false;
        }

        if(ini_get('register_globals') == 1){
            $this->warning('ini.register_globals');
            $ok=false;
        }

        if(ini_get('asp_tags') == 1){
            $this->notice('ini.asp_tags');
        }
        if($ok){
            $this->ok('ini.ok');
        }
        return $ok;
    }
}
