<?php
/**
* @package     jelix
* @subpackage  core
* @author      Laurent Jouanneau
* @contributor Julien Issler, Brice Tence
* @copyright   2005-2010 Laurent Jouanneau
* @copyright   2010 Julien Issler, 2011 Brice Tence
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* base class for response object
* A response object is responsible to generate a content in a specific format.
* @package  jelix
* @subpackage core
*/
abstract class jResponse {

    /**
    * @var string ident of the response type
    */
    protected  $_type = null;

    /**
     * @var array list of http headers that will be send to the client
     */
    protected $_httpHeaders = array();

    /**
     * @var boolean indicates if http headers have already been sent to the client
     */
    protected $_httpHeadersSent = false;

    /**
     * @var string  the http status code to send
     */
    protected $_httpStatusCode ='200';
    /**
     * @var string  the http status message to send
     */
    protected $_httpStatusMsg ='OK';

    public $httpVersion = '1.1';
    public $forcedHttpVersion = false;

    /**
    * constructor
    */
    function __construct() {

        if( $GLOBALS['gJConfig']->httpVersion != "" ) {
            $this->httpVersion = $GLOBALS['gJConfig']->httpVersion;
            $this->forcedHttpVersion = true;
        }
    }

    /**
     * Send the response in the correct format. If errors or exceptions appears
     * during this method, outputErrors will be called. So the
     * the content should be generated using the output buffer if errors can
     * be appeared during this generation. Be care of http headers.
     *
     * @return boolean    true if the output is ok
     * @internal should take care about errors
     */
    abstract public function output();

    /**
     * Send a response with a generic error message.
     */
    public function outputErrors() {
        // if accept text/html
        if (isset($_SERVER['HTTP_ACCEPT']) && strstr($_SERVER['HTTP_ACCEPT'],'text/html')) {
            require_once(JELIX_LIB_CORE_PATH.'responses/jResponseBasicHtml.class.php');
            $response = new jResponseBasicHtml();
            $response->outputErrors();
        }
        else {
            // output text response
            header("HTTP/{$this->httpVersion} 500 Internal jelix error");
            header('Content-type: text/plain');
            echo $GLOBALS['gJCoord']->getGenericErrorMessage();
        }
    }

    /**
     * return the response type name
     * @return string the name
     */
    public final function getType(){ return $this->_type;}

    /**
     * return the format type name (eg the family type name)
     * @return string the name
     */
    public function getFormatType(){ return $this->_type;}

    /**
     * add an http header to the response.
     * will be send during the output of the response
     * @param string $htype the header type ("Content-Type", "Date-modified"...)
     * @param string $hcontent value of the header type
     * @param boolean $overwrite false if the value should be set only if it doesn't still exist
     */
    public function addHttpHeader($htype, $hcontent, $overwrite=true){
        if(!$overwrite && isset($this->_httpHeaders[$htype]))
            return;
        $this->_httpHeaders[$htype]=$hcontent;
    }

    /**
     * delete all http headers
     */
    public function clearHttpHeaders(){
        $this->_httpHeaders = array();
        $this->_httpStatusCode ='200';
        $this->_httpStatusMsg ='OK';
    }

    /**
     * set the http status code for the http header
     * @param string $code  the status code (200, 404...)
     * @param string $msg the message following the status code ("OK", "Not Found"..)
     */
    public function setHttpStatus($code, $msg){ $this->_httpStatusCode=$code; $this->_httpStatusMsg=$msg;}

    /**
     * send http headers
     */
    protected function sendHttpHeaders(){
        header( ( isset($_SERVER['SERVER_PROTOCOL']) && !$this->forcedHttpVersion ?
                        $_SERVER['SERVER_PROTOCOL'] :
                        'HTTP/'.$this->httpVersion ) .
                ' '.$this->_httpStatusCode.' '.$this->_httpStatusMsg );
        foreach($this->_httpHeaders as $ht=>$hc)
            header($ht.': '.$hc);
        $this->_httpHeadersSent=true;
        /*
        header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
        header("Cache-Control: no-store, no-cache, must-revalidate");
        header("Cache-Control: post-check=0, pre-check=0", false);
        header("Pragma: no-cache");
        */
    }
}
