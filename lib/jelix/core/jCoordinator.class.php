<?php
/**
* @package      jelix
* @subpackage   core
* @author       Laurent Jouanneau
* @contributor  Thibault Piront (nuKs), Julien Issler, Dominique Papin
* @copyright    2005-2011 laurent Jouanneau
* @copyright    2007 Thibault Piront
* @copyright    2008 Julien Issler
* @copyright    2008-2010 Dominique Papin
* @link         http://www.jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * the main class of the jelix core
 *
 * this is the "chief orchestra" of the framework. Its goal is
 * to load the configuration, to get the request parameters
 * used to instancie the correspondant controllers and to run the right method.
 * @package  jelix
 * @subpackage core
 */
class jCoordinator {

    /**
     * plugin list
     * @var  array
     */
    public $plugins = array();

    /**
     * current response object
     * @var jResponse
     */
    public $response = null;

    /**
     * current request object
     * @var jRequest
     */
    public $request = null;

    /**
     * the selector of the current action
     * @var jSelectorAct
     */
    public $action = null;

    /**
     * the current module name
     * @var string
     */
    public $moduleName;

    /**
     * the current action name
     * @var string
     */
    public $actionName;

    /**
     * List of all errors appears during the initialisation
     * @var array array of jLogErrorMessage
     */
    protected $initErrorMessages=array();

    /**
     * the current error message
     * @var jLogErrorMessage
     */
    protected $errorMessage = null;

    /**
     * @param  string|object $config filename of the ini file to configure the framework, or the config object itself
     * @param  boolean $enableErrorHandler enable the error handler of jelix.
     *                 keep it to true, unless you have something to debug
     *                 and really have to use the default handler or an other handler
     */
    function __construct ($config, $enableErrorHandler=true) {
        global $gJCoord, $gJConfig;

        // temporary init. Remove this line when JELIX_APP_* support will be removed completely from Jelix
        jApp::initLegacy();

        $gJCoord =  $this;

        if ($enableErrorHandler) {
            set_error_handler('jErrorHandler');
            set_exception_handler('JExceptionHandler');
        }

        // load configuration data
        if (is_string($config))
            $gJConfig = jConfig::load($config);
        else
            $gJConfig = $config;

        date_default_timezone_set($gJConfig->timeZone);

        $this->_loadPlugins();
    }

    /**
     * load the plugins and their configuration file
     */
    private function _loadPlugins(){
        global $gJConfig;

        foreach ($gJConfig->coordplugins as $name=>$conf) {
            // the config compiler has removed all deactivated plugins
            // so we don't have to check if the value $conf is empty or not
            if ($conf == '1') {
                $confname = 'coordplugin_'.$name;
                if (isset($gJConfig->$confname))
                    $conf = $gJConfig->$confname;
                else
                    $conf = array();
            }
            else {
                $conff = jApp::configPath($conf);
                if (false === ($conf = parse_ini_file($conff,true)))
                    throw new Exception("Error in the configuration file of plugin $name ($conff)!", 13);
            }
            include( $gJConfig->_pluginsPathList_coord[$name].$name.'.coord.php');
            $class= $name.'CoordPlugin';
            $this->plugins[strtolower($name)] = new $class($conf);
        }
    }

    /**
    * main method : launch the execution of the action.
    *
    * This method should be called in a entry point.
    * @param  jRequest  $request the request object
    */
    public function process ($request){
        global $gJConfig;

        $this->request = $request;

        // let's log messages appeared during init
        foreach($this->initErrorMessages as $msg) {
            jLog::log($msg, $msg->getCategory());
        }

        $this->request->init();
        jSession::start();

        $this->moduleName = $request->getParam('module');
        $this->actionName = $request->getParam('action');

        if(empty($this->moduleName)){
            $this->moduleName = $gJConfig->startModule;
        }
        if(empty($this->actionName)){
            if($this->moduleName == $gJConfig->startModule)
                $this->actionName = $gJConfig->startAction;
            else {
                $this->actionName = 'default:index';
            }
        }

        jContext::push ($this->moduleName);
        try{
            $this->action = new jSelectorActFast($this->request->type, $this->moduleName, $this->actionName);

            if($gJConfig->modules[$this->moduleName.'.access'] < 2){
                throw new jException('jelix~errors.module.untrusted',$this->moduleName);
            }

            $ctrl = $this->getController($this->action);
        }catch(jException $e){
            if ($gJConfig->urlengine['notfoundAct'] =='') {
                throw $e;
            }
            try {
                $this->action = new jSelectorAct($gJConfig->urlengine['notfoundAct']);
                $ctrl = $this->getController($this->action);
            }catch(jException $e2){
                throw $e;
            }
        }

        if (count($this->plugins)) {
            $pluginparams = array();
            if(isset($ctrl->pluginParams['*'])){
                $pluginparams = $ctrl->pluginParams['*'];
            }

            if(isset($ctrl->pluginParams[$this->action->method])){
                $pluginparams = array_merge($pluginparams, $ctrl->pluginParams[$this->action->method]);
            }

            foreach ($this->plugins as $name => $obj){
                $result = $this->plugins[$name]->beforeAction ($pluginparams);
                if($result){
                    $this->action = $result;
                    jContext::pop();
                    jContext::push($result->module);
                    $this->moduleName = $result->module;
                    $this->actionName = $result->resource;
                    $ctrl = $this->getController($this->action);
                    break;
                }
            }
        }
        $this->response = $ctrl->{$this->action->method}();
        if($this->response == null){
            throw new jException('jelix~errors.response.missing',$this->action->toString());
        }

        foreach ($this->plugins as $name => $obj){
            $this->plugins[$name]->beforeOutput ();
        }

        $this->response->output();

        foreach ($this->plugins as $name => $obj){
            $this->plugins[$name]->afterProcess ();
        }

        jContext::pop();
        jSession::end();
    }

    /**
     * get the controller corresponding to the selector
     * @param jSelectorAct $selector
     */
    private function getController($selector){

        $ctrlpath = $selector->getPath();
        if(!file_exists($ctrlpath)){
            throw new jException('jelix~errors.ad.controller.file.unknown',array($this->actionName,$ctrlpath));
        }
        require_once($ctrlpath);
        $class = $selector->getClass();
        if(!class_exists($class,false)){
            throw new jException('jelix~errors.ad.controller.class.unknown',array($this->actionName,$class, $ctrlpath));
        }
        $ctrl = new $class($this->request);
        if($ctrl instanceof jIRestController){
            $method = $selector->method = strtolower($_SERVER['REQUEST_METHOD']);
        }elseif(!method_exists($ctrl, $selector->method)){
            throw new jException('jelix~errors.ad.controller.method.unknown',array($this->actionName, $selector->method, $class, $ctrlpath));
        }
        return $ctrl;
    }


    /**
     * instancy a response object corresponding to the default response type
     * of the current resquest.
     * Deprecated. use $request->getResponse() instead.
     * @param boolean $originalResponse TRUE to get the original, non overloaded response
     * @deprecated since 1.3
     */
    public function initDefaultResponseOfRequest($originalResponse = false){
        try {
            $this->request->getResponse('', $originalResponse);
        }
        catch (Exception $e) {
            if (!$originalResponse)
                $this->initDefaultResponseOfRequest(true);
            else
                throw $e;
        }
    }

    /**
     * Handle an error event. Called by error handler and exception handler.
     * @param string  $type    error type : 'error', 'warning', 'notice'
     * @param integer $code    error code
     * @param string  $message error message
     * @param string  $file    the file name where the error appear
     * @param integer $line    the line number where the error appear
     * @param array   $trace   the stack trace
     * @since 1.1
     */
    public function handleError($type, $code, $message, $file, $line, $trace){
        global $gJConfig;

        $errorLog = new jLogErrorMessage($type, $code, $message, $file, $line, $trace);

        if ($this->request) {
            // we have config, so we can process "normally"
            $errorLog->setFormat($gJConfig->error_handling['messageLogFormat']);
            jLog::log($errorLog, $type);

            // if non fatal error, it is finished
            if ($type != 'error')
                return;

            $this->errorMessage = $errorLog;

            while (ob_get_level() && @ob_end_clean());

            $resp = $this->request->getErrorResponse($this->response);
            $resp->outputErrors();
            jSession::end();
        }
        // for non fatal error appeared during init, let's just store it for loggers later
        elseif ($type != 'error') {
            $this->initErrorMessages[] = $errorLog;
            return;
        }
        else {
            // fatal error appeared during init, let's display an HTML page
            // since we don't know the request, we cannot return a response
            // corresponding to the expected protocol

            while (ob_get_level() && @ob_end_clean());

            // log into file
            @error_log($errorLog->getFormatedMessage()."\n",3, jApp::logPath('errors.log'));
            // if accept text/html
            if (isset($_SERVER['HTTP_ACCEPT']) && strstr($_SERVER['HTTP_ACCEPT'],'text/html')) {
                if (file_exists(jApp::appPath('responses/error.en_US.php')))
                    $file = jApp::appPath('responses/error.en_US.php');
                else
                    $file = JELIX_LIB_CORE_PATH.'response/error.en_US.php';
                $HEADBOTTOM = '';
                $BODYTOP = '';
                $BODYBOTTOM = '';
                $basePath = '';
                header("HTTP/1.1 500 Internal jelix error");
                header('Content-type: text/html');
                include($file);
            }
            else {
                // output text response
                header("HTTP/1.1 500 Internal jelix error");
                header('Content-type: text/plain');
                echo 'Error during initialization.';
            }
        }
        exit(1);
    }

    /**
     * return the generic error message (errorMessage in the configuration).
     * Replaced the %code% pattern in the message by the current error code
     * @return string
     */
    public function getGenericErrorMessage() {
        $msg = $GLOBALS['gJConfig']->error_handling['errorMessage'];
        if ($this->errorMessage)
            $code = $this->errorMessage->getCode();
        else $code = '';
        return str_replace('%code%', $code, $msg);
    }

    /**
     * @return jLogErrorMessage  the current error
     * @since 1.3a1
     */
    public function getErrorMessage() {
        return $this->errorMessage;
    }

    /**
    * gets a given coordinator plugin if registered
    * @param string   $pluginName   the name of the plugin
    * @param boolean  $required  says if the plugin is required or not. If true, will generate an exception if the plugin is not registered.
    * @return jICoordPlugin
    */
    public function getPlugin ($pluginName, $required = true){
        $pluginName = strtolower ($pluginName);
        if (isset ($this->plugins[$pluginName])){
            $plugin = $this->plugins[$pluginName];
        }else{
            if ($required){
                throw new jException('jelix~errors.plugin.unregister', $pluginName);
            }
            $plugin = null;
        }
        return $plugin;
    }

    /**
    * Says if the given coordinator plugin $name is enabled
    * @param string $pluginName
    * @return boolean true : plugin is ok
    */
    public function isPluginEnabled ($pluginName){
        return isset ($this->plugins[strtolower ($pluginName)]);
    }

    /**
    * Says if the given module $name is enabled
    * @param string $moduleName
    * @param boolean $includingExternal  true if we want to know if the module
    *               is also an external module, e.g. in an other entry point
    * @return boolean true : module is ok
    */
    public function isModuleEnabled ($moduleName, $includingExternal = false) {
        if ($includingExternal && isset($GLOBALS['gJConfig']->_externalModulesPathList[$moduleName])) {
            return true;
        }
        return isset($GLOBALS['gJConfig']->_modulesPathList[$moduleName]);
    }

    /**
     * return the real path of a module
     * @param string $module a module name
     * @param boolean $includingExternal  true if we want to know if the module
     *               is also an external module, e.g. in an other entry point
     * @return string the corresponding path
     */
    public function getModulePath($module, $includingExternal = false){
        global $gJConfig;
        if (!isset($gJConfig->_modulesPathList[$module])) {
            if ($includingExternal && isset($gJConfig->_externalModulesPathList[$module])) {
                return $gJConfig->_externalModulesPathList[$module];
            }
            throw new Exception('getModulePath : invalid module name');
        }
        return $gJConfig->_modulesPathList[$module];
    }
}
