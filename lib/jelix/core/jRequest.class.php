<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @contributor Yannick Le Guédart, Julien Issler
* @copyright  2005-2013 Laurent Jouanneau, 2010 Yannick Le Guédart, 2016 Julien Issler
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
 * base class for object which retrieve all parameters of an http request. The
 * process depends on the type of request (ex: xmlrpc..)
 *
 * @package  jelix
 * @subpackage core
 */
abstract class jRequest {

   /**
    * request parameters
    * could set from $_GET, $_POST, or from data processing of $HTTP_RAW_POST_DATA
    * @var array
    */
    public $params = array();

    /**
     * the request type code
     * @var string
     */
    public $type;

    /**
     * the type of the default response
     * @var string
     */
    public $defaultResponseType = '';

    /**
     * @var string the name of the base class for an allowed response for the current request
     */
    public $authorizedResponseClass = '';

    /**
     * the path of the entry point in the url (basePath included)
     * if the url is /foo/index.php/bar, its value is /foo/
     * @var string
     */
    public $urlScriptPath;

    /**
     * the name of the entry point
     * if the url is /foo/index.php/bar, its value is index.php
     * @var string
     */
    public $urlScriptName;

    /**
     * the path to the entry point in the url
     * if the url is /foo/index.php/bar, its value is /foo/index.php.
     * Warning: if the app is behind a proxy, the path includes the backendBasePath,
     * not the basePath. Use urlScriptPath and urlScriptName to have the
     * "public" url, as needed for the frontend HTTP server
     * @var string
     */
    public $urlScript;

    /**
     * the pathinfo part of the url
     * if the url is /foo/index.php/bar, its value is /bar
     * @var string
     */
    public $urlPathInfo;

    /**
     * the module name
     * @var string
     */
    public $module = '';

    /**
     * the action name ("controller:method")
     * @var string
     */
    public $action = '';

    function __construct(){  }

    /**
     * initialize the request : analyse of http request etc..
     */
    public function init(){
        $this->_initUrlData();
        $this->_initParams();
    }

    /**
     * analyse the http request and sets the params property
     */
    abstract protected function _initParams();

    /**
     * init the url* properties
     */
    protected function _initUrlData(){
        $conf = &jApp::config()->urlengine;

        $this->urlScript = $conf['urlScript'];
        $this->urlScriptPath = $conf['urlScriptPath'];
        $this->urlScriptName = $conf['urlScriptName'];

        $piiqp = $conf['pathInfoInQueryParameter'];
        if ($piiqp) {
            if (isset($_GET[$piiqp])) {
                $pathinfo = $_GET[$piiqp];
                unset($_GET[$piiqp]);
            } else
                $pathinfo = '';
        } else if(isset($_SERVER['PATH_INFO'])){
            $pathinfo = $_SERVER['PATH_INFO'];
        } else if(isset($_SERVER['ORIG_PATH_INFO'])){
            $pathinfo = $_SERVER['ORIG_PATH_INFO'];
        } else
            $pathinfo = '';

        if($pathinfo == $this->urlScript) {
            //when php is used as cgi and if there isn't pathinfo in the url
            $pathinfo = '';
        }

        if (jApp::config()->isWindows && $pathinfo && strpos($pathinfo, $this->urlScript) !== false){
            //under IIS, we may get  /subdir/index.php/mypath/myaction as PATH_INFO, so we fix it
            $pathinfo = substr ($pathinfo, strlen ($this->urlScript));
        }

        $this->urlPathInfo = $pathinfo;
    }

    /**
     * retrieve module and action
     * fills also $module and $action properties
     */
    public function getModuleAction() {
        $conf = jApp::config();

        if (isset($this->params['module']) && trim($this->params['module']) != '') {
            $this->module = $this->params['module'];
        }
        else {
            $this->module = $conf->startModule;
        }

        if (isset($this->params['action']) && trim($this->params['action']) != '') {
            $this->action = $this->params['action'];
        }
        else {
            if($this->module == $conf->startModule)
                $this->action = $conf->startAction;
            else {
                $this->action = 'default:index';
            }
        }
        return array($this->module, $this->action);
    }

    /**
    * Gets the value of a request parameter. If not defined, gets its default value.
    * @param string  $name           the name of the request parameter
    * @param mixed   $defaultValue   the default returned value if the parameter doesn't exists
    * @param boolean $useDefaultIfEmpty true: says to return the default value if the parameter value is ""
    * @return mixed the request parameter value
    */
    public function getParam($name, $defaultValue=null, $useDefaultIfEmpty=false){

        if(isset($this->params[$name])){
            if($useDefaultIfEmpty && trim($this->params[$name]) == ''){
                return $defaultValue;
            }else{
                return $this->params[$name];
            }
        }else{
            return $defaultValue;
        }
    }

    /**
     * @param jResponse $response the response
     * @return boolean true if the given class is allowed for the current request
     */
    public function isAllowedResponse($response){
        return ( ($response instanceof $this->authorizedResponseClass)
                || ($c = get_class($response)) == 'jResponseRedirect'
                || $c == 'jResponseRedirectUrl'
                );
    }

    /**
     * get a response object.
     * @param string $type
     * @param boolean $useOriginal true:don't use the response object redefined by the application
     * @return jResponse the response object
     * @throws jException
     * @internal param string $name the name of the response type (ex: "html")
     */
    public function getResponse($type='', $useOriginal = false){

        if($type == ''){
            $type = $this->defaultResponseType;
        }

        if ($useOriginal)
            $responses = &jApp::config()->_coreResponses;
        else
            $responses = &jApp::config()->responses;

        $coord = jApp::coord();
        if(!isset($responses[$type])){
            if ($coord->action) {
               $action = $coord->action->resource;
               $path = $coord->action->getPath();
            }
            else {
               $action = $coord->moduleName.'~'.$coord->actionName;
               $path = '';
            }
            if ($type == $this->defaultResponseType)
               throw new jException('jelix~errors.default.response.type.unknown',array($action,$type));
            else
               throw new jException('jelix~errors.ad.response.type.unknown',array($action, $type, $path));
        }

        $respclass = $responses[$type];
        $path = $responses[$type.'.path'];

        if(!class_exists($respclass,false))
            require($path);
        $response = new $respclass();

        if (!$this->isAllowedResponse($response)){
            throw new jException('jelix~errors.ad.response.type.notallowed',array($coord->action->resource, $type, $coord->action->getPath()));
        }

        $coord->response = $response;

        return $response;
    }

    /**
     * @return jResponse
     */
    public function getErrorResponse($currentResponse) {
      try {
         return $this->getResponse('', true);
      }
      catch(Exception $e) {
         require_once(JELIX_LIB_CORE_PATH.'response/jResponseText.class.php');
         return new jResponseText();
      }
    }

    /**
     * return the ip address of the user
     * @return string the ip
     */
    function getIP() {
        if (isset ($_SERVER['HTTP_X_FORWARDED_FOR']) && $_SERVER['HTTP_X_FORWARDED_FOR']){
            // it may content ips of all traversed proxies.
            $list = preg_split('/[\s,]+/', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $list = array_reverse($list);
            $lastIp = '';
            foreach($list as $ip) {
                $ip = trim($ip);
                if(preg_match('/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/',$ip,$m)) {
                    if ($m[1] == '10' || $m[1] == '010'
                        || ($m[1] == '172' && (intval($m[2]) & 240 == 16))
                        || ($m[1] == '192' && $m[2] == '168'))
                        break; // stop at first private address. we just want the last public address
                    $lastIp = $ip;
                }
                elseif (preg_match('/^(?:[a-f0-9]{1,4})(?::(?:[a-f0-9]{1,4})){7}$/i',$ip)) {
                    $lastIp = $ip;
                }
            }
            if ($lastIp)
                return $lastIp;
        }

        if (isset ($_SERVER['HTTP_CLIENT_IP']) && $_SERVER['HTTP_CLIENT_IP']){
            return  $_SERVER['HTTP_CLIENT_IP'];
        }else{
            return $_SERVER['REMOTE_ADDR'];
        }
    }

    /**
     * return the protocol
     * @return string  http:// or https://
     * @since 1.2
     */
   function getProtocol() {
      return ($this->isHttps() ? 'https://':'http://');
   }


    /**
     *
     * @return bool true if the request is made with HTTPS
     * @todo support Forwarded and X-Forwared-Proto headers
     */
   function isHttps() {
       if (jApp::config()->urlengine['forceProxyProtocol'] == 'https') {
           return true;
       }

       return (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] && $_SERVER['HTTPS'] != 'off');
   }

   /**
    * says if this is an ajax request
    * @return boolean true if it is an ajax request
    * @since 1.3a1
    */
   function isAjax() {
      if (isset($_SERVER['HTTP_X_REQUESTED_WITH']))
         return ($_SERVER['HTTP_X_REQUESTED_WITH'] === "XMLHttpRequest");
      else
         return false;
   }

    /**
     * Says if the request method is POST
     * @return bool
     * @since 1.6.17
     */
    function isPostMethod() {
        if (isset($_SERVER['REQUEST_METHOD'])) {
            return ($_SERVER['REQUEST_METHOD'] === "POST");
        } else {
            return false;
        }
    }

   /**
    * return the application domain name
    * @return string
    * @since 1.2.3
    */
   function getDomainName() {
      if (jApp::config()->domainName != '') {
         return jApp::config()->domainName;
      }
      elseif (isset($_SERVER['HTTP_HOST'])) {
         if (($pos = strpos($_SERVER['HTTP_HOST'], ':')) !== false)
            return substr($_SERVER['HTTP_HOST'],0, $pos);
         return $_SERVER['HTTP_HOST'];
      }
      elseif (isset($_SERVER['SERVER_NAME'])) {
         return $_SERVER['SERVER_NAME'];
      }
      return '';
   }

   /**
    * return the server URI of the application (protocol + server name + port)
    * @return string the serveur uri
    * @since 1.2.4
    */
   function getServerURI($forceHttps = null) {

      if ( ($forceHttps === null && $this->isHttps()) || $forceHttps) {
         $uri = 'https://';
      }
      else {
         $uri = 'http://';
      }

      $uri .= $this->getDomainName();
      $uri .= $this->getPort($forceHttps);
      return $uri;
   }

   /**
    * return the server port of the application
    * @return string the ":port" or empty string
    * @since 1.2.4
    */
   function getPort($forceHttps = null) {
      $isHttps = $this->isHttps();

      if ($forceHttps === null)
         $https = $isHttps;
      else
         $https = $forceHttps;

      $forcePort = ($https ? jApp::config()->forceHTTPSPort : jApp::config()->forceHTTPPort);
      if ($forcePort === true) {
         return '';
      }
      else if ($forcePort) { // a number
         $port = $forcePort;
      }
      else if($isHttps != $https || !isset($_SERVER['SERVER_PORT'])) {
         // the asked protocol is different from the current protocol
         // we use the standard port for the asked protocol
         return '';
      } else {
         $port = $_SERVER['SERVER_PORT'];
      }
      if (($port === NULL) || ($port == '') || ($https && $port == '443' ) || (!$https && $port == '80' ))
         return '';
      return ':'.$port;
   }

   /**
     * call it when you want to read the content of the body of a request
     * when the method is not GET or POST
     * @return mixed    array of parameters or a single string when the content-type is unknown
     * @since 1.2
     */
    public function readHttpBody() {
        $input = file_get_contents('php://input');

        if (!isset($_SERVER['CONTENT_TYPE'])) {
            return $input;
        }
        $contentType = $_SERVER['CONTENT_TYPE'];

        $values = array();
        if (strpos($contentType, 'application/x-www-form-urlencoded') === 0) {
            parse_str($input, $values);
            return $values;
        }

        if (strpos($contentType, 'multipart/form-data') === 0) {
            // XXX it seems php://input is empty for this content-type, as
            // indicated into the php doc. Only for POST method?
            return self::parseMultipartBody($contentType, $input);
        }

        if (jApp::config()->enableRequestBodyJSONParsing && strpos($contentType, 'application/json') === 0) {
            return json_decode($input, true);
        }

        return $input;
    }

    public static function parseMultipartBody($contentType, $input) {
        $values = array();
        if (!preg_match('/boundary=([^\\s]+)/', $contentType, $m)) {
            return $values;
        }

        $parts = preg_split("/\r\n--" . preg_quote($m[1])."/", $input);
        foreach ($parts as $part) {
            if (trim($part) == '' || $part == '--')
                continue;
            list($header, $value) = explode("\r\n\r\n", $part, 2);
            $value = rtrim($value);
            if (preg_match('/content-disposition\:\\s*form-data\;\\s*name="([^"]+)"(\;\\s*filename="([^"]+)")?/i', $header, $m)) {
                $name = $m[1];
                if (isset($m[2]) && $m[3] != '') {
                    $values = array($m[3], $value);
                }
                if (preg_match("/^([^\\[]+)\\[([^\\]]*)\\]$/", $name, $nm)) {
                    $name = $nm[1];
                    $index = $nm[2];
                    if (!isset($values[$name]) || !is_array($values[$name])) {
                        $values[$name] = array();
                    }
                    if ($index === "") {
                        $values[$name][] = $value;
                    }
                    else {
                        $values[$name][$index] = $value;
                    }
                }
                else {
                    $values[$name] = $value;
                }
            }
        }
        return $values;
    }

   private $_headers = null;

   private function _generateHeaders() {
      if (is_null($this->_headers)) {
         if (function_exists('apache_response_headers')) {
            $this->_headers = apache_request_headers();
         }
         else {
            $this->_headers = array();

            foreach($_SERVER as $key => $value) {
               if (substr($key,0,5) == "HTTP_") {
                  $key = str_replace(" ", "-",
                          ucwords(strtolower(str_replace('_', ' ', substr($key,5)))));
                  $this->_headers[$key] = $value;
               }
            }
         }
      }
   }

   public function header($name) {
      $this->_generateHeaders();
      if (isset($this->_headers[$name])) {
         return $this->_headers[$name];
      }
      return null;
   }

   public function headers() {
      $this->_generateHeaders();
      return $this->_headers;
   }


}
