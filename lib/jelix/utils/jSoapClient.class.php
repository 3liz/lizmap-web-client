<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @copyright   2011-2014 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
 * class that handles a dump of a php value, for a logger
 */
class  jLogSoapMessage extends jLogMessage {
    /**
     * @var string
     */
    protected $headers;
    /**
     * @var string
     */
    protected $request;
    /**
     * @var string
     */
    protected $response;
    /**
     * @var string
     */
    protected $duration;
    /**
     * @var string
     */
    protected $functionName;

    /**
     * jLogSoapMessage constructor.
     * @param $function_name
     * @param SoapClient $soapClient
     * @param string $category
     * @param int $duration
     */
    public function __construct($function_name, $soapClient, $category='default', $duration = 0) {
        $this->category = $category;
        $this->headers = $soapClient->__getLastRequestHeaders();
        $this->request = $soapClient->__getLastRequest ();
        $this->response = $soapClient->__getLastResponse();
        $this->functionName = $function_name;
        $this->duration = $duration;
        $this->message = 'Soap call: '.$function_name.'()';
    }

    public function getHeaders() {
        return $this->headers;
    }

    public function getResponse() {
        return $this->response;
    }

    public function getRequest() {
        return $this->request;
    }

    public function getDuration() {
        return $this->duration;
    }

    public function getFormatedMessage() {
        $message =  'Soap call: '.$this->functionName."()\n";
        $message .= "DURATION: ".$this->duration."s\n";
        $message .= "HEADERS:\n\t".str_replace("\n","\n\t",$this->headers)."\n";
        $message .= "REQUEST:\n\t".str_replace("\n","\n\t",$this->request)."\n";
        $message .= "RESPONSE:\n\t".str_replace("\n","\n\t",$this->response)."\n";
        return $message;
    }
}



class SoapClientDebug extends SoapClient {
    public function __call ( $function_name , $arguments) {
        $timeExecutionBegin = $this->_microtimeFloat();
        $ex = false;
        try {
            $result = parent::__call($function_name , $arguments);
        }
        catch(Exception $e) {
            $ex = $e;
        }
        $timeExecutionEnd = $this->_microtimeFloat();

        $log = new jLogSoapMessage($function_name, $this, 'soap', $timeExecutionEnd - $timeExecutionBegin);
        jLog::log($log,'soap');
        if ($ex)
            throw $ex;
        return $result;
    }

    public function __soapCall ( $function_name , $arguments, $options=array(), $input_headers=null,  &$output_headers=null) {
        $timeExecutionBegin = $this->_microtimeFloat();
        $ex = false;
        try {
            $result = parent::__soapCall($function_name , $arguments, $options, $input_headers,  $output_headers);
        }
        catch(Exception $e) {
            $ex = $e;
        }
        $timeExecutionEnd = $this->_microtimeFloat();
        $log = new jLogSoapMessage($function_name, $this, 'soap', $timeExecutionEnd - $timeExecutionBegin);
        jLog::log($log,'soap');
        if ($ex)
            throw $ex;
        return $result;
    }

    protected function _microtimeFloat() {
        list($usec, $sec) = explode(" ", microtime());
        return ((float)$usec + (float)$sec);
    }
}



/**
* provide a soap client where configuration information are stored in the profile file
* @package     jelix
* @subpackage  utils
*/
class jSoapClient {

    protected static $classmap = array();

    /**
     * @param string $profile  the profile name
     * @return object|null the profile data
     */
    public static function get($profile = '') {
        return jProfiles::getOrStoreInPool('jsoapclient', $profile, array('jSoapClient', '_getClient'));
    }

    /**
     * callback method for jProfiles. Internal use.
     * @param array $profile profile parameters
     * @return SoapClient
     * @see jProfiles
     */
    public static function _getClient($profile) {
        $wsdl = null;
        $client = 'SoapClient';
        if (isset($profile['wsdl'])) {
            $wsdl = $profile['wsdl'];
            if ($wsdl == '') {
                 $wsdl = null;
            }
            else if (!preg_match("!^https?\\://!", $wsdl)){
                $wsdl = jFile::parseJelixPath($wsdl);
            }
            unset ($profile['wsdl']);
        }
        if (isset($profile['trace'])) {
            $profile['trace'] = intval($profile['trace']); // SoapClient recognize only true integer
            if ($profile['trace'])
                $client = 'SoapClientDebug';
        }
        if (isset($profile['exceptions'])) {
            $profile['exceptions'] = intval($profile['exceptions']); // SoapClient recognize only true integer
        }
        if (isset($profile['connection_timeout'])) {
            $profile['connection_timeout'] = intval($profile['connection_timeout']); // SoapClient recognize only true integer
        }

        // deal with classmap
        $classMap = array();
        if (isset($profile['classmap_file']) && ($f = trim($profile['classmap_file'])) != '') {
            if (!isset(self::$classmap[$f])) {
                if (!file_exists(jApp::configPath($f))) {
                    trigger_error("jSoapClient: classmap file ".$f." does not exists.", E_USER_WARNING);
                    self::$classmap[$f] = array();
                }
                else {
                    self::$classmap[$f] = parse_ini_file(jApp::configPath($f), true);
                }
            }
            if (isset(self::$classmap[$f]['__common__'])) {
                $classMap = array_merge($classMap, self::$classmap[$f]['__common__']);
            }
            if (isset(self::$classmap[$f][$profile['_name']])) {
                $classMap = array_merge($classMap, self::$classmap[$f][$profile['_name']]);
            }
            unset($profile['classmap_file']);
        }

        if (isset($profile['classmap']) && is_string ($profile['classmap']) && $profile['classmap'] != '') {
            $map = (array)json_decode(str_replace("'", '"',$profile['classmap']));
            $classMap = array_merge($classMap, $map);
            unset($profile['classmap']);
        }

        if (count($classMap)) {
            $profile['classmap'] = $classMap;
        }

        //$context = stream_context_create( array('http' => array('max_redirects' => 3)));
        //$profile['stream_context'] = $context;
        unset ($profile['_name']);

        return new $client($wsdl, $profile);
    }
}