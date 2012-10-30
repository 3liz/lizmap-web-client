<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @copyright   2011 Laurent Jouanneau
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

    /**
     * @param string $profile  the profile name
     */
    public static function get($profile = '') {
        return jProfiles::getOrStoreInPool('jsoapclient', $profile, array('jSoapClient', '_getClient'));
    }

    /**
     * callback method for jprofiles. Internal use.
     */
    public static function _getClient($profile) {
        $wsdl = null;
        $client = 'SoapClient';
        if (isset($profile['wsdl'])) {
            $wsdl = $profile['wsdl'];
            if ($wsdl == '')
                $wsdl = null;
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
        unset ($profile['_name']);
        if (isset($profile['classmap']) && is_string ($profile['classmap']) && $profile['classmap'] != '') {
            $profile['classmap'] = (array)json_decode(str_replace("'", '"',$profile['classmap']));
        }

        //$context = stream_context_create( array('http' => array('max_redirects' => 3)));
        //$profile['stream_context'] = $context;

        return new $client($wsdl, $profile);
    }
}