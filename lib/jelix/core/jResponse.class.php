<?php
/**
* @package     jelix
* @subpackage  core_request
* @author      Laurent Jouanneau
* @contributor Julien Issler, Brice Tence
* @contributor Florian Lonqueu-Brochard
* @copyright   2005-2012 Laurent Jouanneau
* @copyright   2010 Julien Issler, 2011 Brice Tence
* @copyright   2011 Florian Lonqueu-Brochard
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* base class for response object
* A response object is responsible to generate a content in a specific format.
* @package  jelix
* @subpackage core_request
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

    /**
     * @var boolean Should we output only the headers or the entire response
     */ 
    protected $_outputOnlyHeaders = false;
    
    
    public $httpVersion = '1.1';
    public $forcedHttpVersion = false;

    /**
    * constructor
    */
    function __construct() {

        if( jApp::config()->httpVersion != "" ) {
            $this->httpVersion = jApp::config()->httpVersion;
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
            require_once(JELIX_LIB_CORE_PATH.'response/jResponseBasicHtml.class.php');
            $response = new jResponseBasicHtml();
            $response->outputErrors();
        }
        else {
            // output text response
            header("HTTP/{$this->httpVersion} 500 Internal jelix error");
            header('Content-type: text/plain');
            echo jApp::coord()->getGenericErrorMessage();
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
     * @param integer $overwrite false or 0 if the value should be set only if it doesn't still exist
     *                           -1 to add the header with the existing values
     *                           true or 1 to replace the existing header
     */
    public function addHttpHeader($htype, $hcontent, $overwrite=true){
        if (isset($this->_httpHeaders[$htype])) {
            $val = $this->_httpHeaders[$htype];
            if ($overwrite === -1) {
                if (!is_array($val))
                    $this->_httpHeaders[$htype] = array($val, $hcontent);
                else
                    $this->_httpHeaders[$htype][] = $hcontent;
                return;
            }
            else if (!$overwrite) {
                return;
            }
        }
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
        foreach($this->_httpHeaders as $ht=>$hc) {
            if (is_array($hc)) {
                foreach ($hc as $val) {
                    header($ht.': '.$val);
                }
            }
            else
                header($ht.': '.$hc);
        }
        $this->_httpHeadersSent=true;
    }
    
    
    /**
     * Normalize a date into GMT format
     * @param mixed $date Can be a jDateTime object, a DateTime object or a string understandable by strtotime
     * @return string    a date in GMT format
     */
    protected function _normalizeDate($date){
        if($date instanceof jDateTime){
            return gmdate('D, d M Y H:i:s \G\M\T', $date->toString(jDateTime::TIMESTAMP_FORMAT));
        }
        elseif($date instanceof DateTime){
            return gmdate('D, d M Y H:i:s \G\M\T', $date->getTimestamp());
        }
        else{
            return gmdate('D, d M Y H:i:s \G\M\T', strtotime($date));
        }
    } 
    
    /**
     * check if the request is of type GET or HEAD
     */
    protected function _checkRequestType(){
        
        $allowedTypes = array('GET', 'HEAD');
        
        if(in_array($_SERVER['REQUEST_METHOD'], $allowedTypes)){
            return true;
        }
        else {
            trigger_error(jLocale::get('jelix~errors.rep.bad.request.method'), E_USER_WARNING);
            return false;
        }
    }
    
    
    
    /**
    * Clean the differents caches headers
    */  
    public function cleanCacheHeaders(){
        $toClean = array('Cache-Control', 'Expires', 'Pragma' );
        foreach($toClean as $h){
            unset($this->_httpHeaders[$h]);
            $this->addHttpHeader($h, '');
        }
    }
    
    
    /**
     * Set an expires header to the page/ressource.
     * 
     * @param mixed $dateLastModified Can be a jDateTime object, a DateTime object or a string understandable by strtotime
     * @param boolean $cleanCacheHeaderTrue for clean/delete other cache headers. Default : true. 
     *
     * @see _normalizeDate
     */
    public function setExpires($date, $cleanCacheHeader = true) {
        
        if(!$this->_checkRequestType())
            return;
        
        if($cleanCacheHeader)
            $this->cleanCacheHeaders();

        $date = $this->_normalizeDate($date);
        $this->addHttpHeader('Expires', $date);
    }
    


    /**
     * Set a life time for the page/ressource.
     * 
     * @param int $time             Time during which the page will be cached. Express in seconds.
     * @param boolean $sharedCache      True if the lifetime concern a public/shared cache. Default : false.
     * @param boolean $cleanCacheHeaderTrue for clean/delete other cache headers. Default : true. 
     */
    public function setLifetime($time, $sharedCache = false, $cleanCacheHeader = true) {
        
        if(!$this->_checkRequestType())
            return;
           
        if($cleanCacheHeader)
            $this->cleanCacheHeaders();
        
        $type = $sharedCache ? 'public' : 'private';

        $this->addHttpHeader('Cache-Control', $type.', '.($sharedCache ? 's-' : '').'maxage='.$time);
    }
    
    /**
     * Use the HTPP headers Last-Modified to see if the ressource in client cache is fresh
     * 
     * @param mixed $dateLastModified Can be a jDateTime object, a DateTime object or a string understandable by strtotime
     * @param boolean $cleanCacheHeader True for clean/delete other cache headers. Default : true. 
     * 
     * @return boolean    True if the client ressource version is fresh, false otherwise
     */
    public function isValidCache($dateLastModified = null, $etag = null, $cleanCacheHeader = true){
        
        if(!$this->_checkRequestType())
            return false;
        
        $notModified = false;
        
        if($cleanCacheHeader)
            $this->cleanCacheHeaders();
         
        if($dateLastModified != null){
            $dateLastModified = $this->_normalizeDate($dateLastModified);
            $lastModified = jApp::coord()->request->header('If-Modified-Since');
            if ($lastModified !== null && $lastModified == $dateLastModified) {
                $notModified = true;
            }
            else {
                $this->addHttpHeader('Last-Modified', $dateLastModified);
            }
        }
        
        if($etag != null){
            $headerEtag = jApp::coord()->request->header('If-None-Match');
            if ($headerEtag !== null && $etag == $headerEtag) {
                $notModified = true;
            }
            else {
                $this->addHttpHeader('Etag', $etag);
            }
            
        }

       if($notModified) {
            $this->_outputOnlyHeaders = true;
            $this->setHttpStatus(304, 'Not Modified');
            
            $toClean = array('Allow', 'Content-Encoding', 'Content-Language', 'Content-Length', 'Content-MD5', 'Content-Type', 'Last-Modified', 'Etag');
            foreach($toClean as $h)
                unset($this->_httpHeaders[$h]);
        }

        return $notModified;
    }

    
    
}
