<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Sylvain de Vathaire
* @contributor Laurent Jouanneau
* @copyright   2008 Sylvain de Vathaire, 2009-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


require_once(__DIR__.'/wshelper/WSDLStruct.class.php');
require_once(__DIR__.'/wshelper/WSDLException.class.php');
require_once(__DIR__.'/wshelper/WSException.class.php');
require_once(__DIR__.'/wshelper/IPXMLSchema.class.php');
require_once(__DIR__.'/wshelper/IPPhpDoc.class.php');
require_once(__DIR__.'/wshelper/IPReflectionClass.class.php');
require_once(__DIR__.'/wshelper/IPReflectionCommentParser.class.php');
require_once(__DIR__.'/wshelper/IPReflectionMethod.class.php');
require_once(__DIR__.'/wshelper/IPReflectionProperty.class.php');



/**
 * object to generate WSDL files and web services documentation
 * we have 1 WSDL file for each soap web service, each service is implemented by 1 Jelix controller
 * @package    jelix
 * @subpackage utils
 */
class jWSDL {

    /**
    * module name
    */
    public $module;

    /**
    * controller name
    */
    public $controller;

    /**
    * controller class name
    */
    private $controllerClassName;

    /**
    * WSDL file path (cached file)
    */
    public $WSDLfilePath;


    private $_ctrlpath;

    private $_dirname = 'WSDL';
    private $_cacheSuffix = '.wsdl';


    public function __construct($module, $controller){

        $this->module = $module;
        $this->controller = $controller;

        $this->_createPath();
        $this->_createCachePath();
     }

    /**
     * create the path for the cache file
     */
    private function _createPath(){
        $config = jApp::config();

        //Check module availability
        if(!isset($config->_modulesPathList[$this->module])){
            throw new jExceptionSelector('jelix~errors.module.unknown', $this->module);
        }

        //Build controller path
        $this->_ctrlpath = $config->_modulesPathList[$this->module].'controllers/'.$this->controller.'.soap.php';

        //Check controller availability
        if(!file_exists($this->_ctrlpath)){
            throw new jException('jelix~errors.action.unknown',$this->controller);
        }

        //Check controller declaration
        require_once($this->_ctrlpath);
        $this->controllerClassName = $this->controller.'Ctrl';
        if(!class_exists($this->controllerClassName,false)){
            throw new jException('jelix~errors.ad.controller.class.unknown', array('jWSDL', $this->controllerClassName, $this->_ctrlpath));
        }

        //Check eAccelerator configuration in order to Reflexion API work
        if (extension_loaded('eAccelerator')) {
            $reflect = new ReflectionClass('jWSDL');
            if($reflect->getDocComment() == NULL) {
                throw new jException('jsoap~errors.eaccelerator.configuration');
            }
            unset($reflect);
        }

    }

    /**
     * Build the WSDL cache file path
     */
    private function _createCachePath(){
        $this->_cachePath = jApp::tempPath('compiled/'.$this->_dirname.'/'.$this->module.'~'.$this->controller.$this->_cacheSuffix);
    }

    /**
     * Return the WSDL cache file path (WSDL is updated if necessary)
     */
    public function getWSDLFilePath(){
        $this->_updateWSDL();
        return $this->_cachePath;
    }

    /**
     * Return the WSDL file content (WSDL is updated if necessary)
     */
    public function getWSDLFile(){
        $this->_updateWSDL();
        return file_get_contents($this->_cachePath);
    }

    /**
     * Return array of params object for the operation $operationName
     * @param string $operationName Name of the operation (controller method)
     * @return array list params object (empty if no params)
     */
    public function getOperationParams($operationName){

       $IPReflectionMethod = new IPReflectionMethod($this->controllerClassName, $operationName);
       return $IPReflectionMethod->parameters;
    }

    /**
     * Update the WSDL cache file
     */
    private function _updateWSDL(){

        static $updated = FALSE;

        if($updated){
            return;
        }

        $mustCompile = jApp::config()->compilation['force'] || !file_exists($this->_cachePath);
        if(jApp::config()->compilation['checkCacheFiletime'] && !$mustCompile){
            if( filemtime($this->_ctrlpath) > filemtime($this->_cachePath)){
                $mustCompile = true;
            }
        }

        if($mustCompile){
            jFile::write($this->_cachePath, $this->_compile());
        }
        $updated = TRUE;
    }

    /**
     * Generate the WSDL content
     */
    private function _compile(){

        $url = jUrl::get($this->module.'~'.$this->controller.':index@soap',array(),jUrl::JURL);
        $url->clearParam ();
        $url->setParam('service',$this->module.'~'.$this->controller );

        $serverUri = jUrl::getRootUrlRessourceValue('soap');
        if ($serverUri === null) {
            $serverUri = jUrl::getRootUrlRessourceValue('soap-'.$this->module);
        }
        if ($serverUri === null) {
            $serverUri = jUrl::getRootUrlRessourceValue('soap-'.$this->module.'-'.$this->controller);
        }
        if ($serverUri === null) {
            $serverUri = jApp::coord()->request->getServerURI();
        }

        $serviceURL = $serverUri .$url->toString();
        $serviceNameSpace = $serverUri . jApp::urlBasePath();

        $wsdl = new WSDLStruct($serviceNameSpace, $serviceURL, SOAP_RPC, SOAP_ENCODED);
        $wsdl->setService(new IPReflectionClass($this->controllerClassName));

        try {
            $gendoc = $wsdl->generateDocument();
        } catch (WSDLException $exception) {
            throw new JException('jsoap~errors.wsdl.generation', $exception->msg);
        }

        return $gendoc;
    }

    /**
     * Load the class or service definition for doc purpose
     * @param string $classname Name of the class for witch we want the doc, default doc is the service one (controller)
     */
    public function doc($className=""){

        if($className != ""){
            if(!class_exists($className,false)){
                throw new jException('jelix~errors.ad.controller.class.unknown', array('WSDL generation', $className, $this->_ctrlpath));
            }
            $classObject = new IPReflectionClass($className);
        }else{
            $classObject = new IPReflectionClass($this->controllerClassName);
        }

        $documentation = Array();
        $documentation['menu'] = Array();

        if($classObject){
            $classObject->properties = $classObject->getProperties(false, false, false);
            $classObject->methods = $classObject->getMethods(false, false, false);
            foreach((array)$classObject->methods as $method) {
                $method->params = $method->getParameters();
            }

            $documentation['class'] = $classObject;
            $documentation['service'] = $this->module.'~'.$this->controller;
        }
        return $documentation;
    }

    /**
     * Return an array of all the soap controllers class available in the application
     * @return array Classname of controllers
     */
    public static function getSoapControllers(){

        $modules = jApp::config()->_modulesPathList;
        $controllers = array();

        foreach($modules as $module){
            if(is_dir($module.'controllers')){
                if ($handle = opendir($module.'controllers')) {
                    $moduleName = basename($module);
                    while (false !== ($file = readdir($handle))) {
                        if (substr($file, strlen($file) - strlen('.soap.php')) == '.soap.php') {
                            $controller = array();
                            $controller['class'] = substr($file, 0, strlen($file) - strlen('.soap.php'));
                            $controller['module'] = $moduleName;
                            $controller['service'] = $moduleName.'~'.$controller['class'];
                            array_push($controllers, $controller);
                        }
                    }
                    closedir($handle);
                }
            }
        }
        return $controllers;
    }
}
