<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2005-2010 Laurent Jouanneau
* @copyright   2007 Loic Mathaud
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* Response for jsonrpc protocol
* @package  jelix
* @subpackage core_response
* @see jResponse
* @see http://json-rpc.org/wiki/specification
*/

final class jResponseJsonRpc extends jResponse {
    /**
    * @var string
    */
    protected $_type = 'jsonrpc';

    /**
     * PHP data you want to return
     * @var mixed
     */
    public $response = null;


    public function output(){
        
        if($this->_outputOnlyHeaders){
            $this->sendHttpHeaders();
            return true;
        }
        
        $this->_httpHeaders['Content-Type'] = "application/json";
        $req = jApp::coord()->request;
        if($req->jsonRequestId !== null){
            $content = jJsonRpc::encodeResponse($this->response, $req->jsonRequestId);
            $this->_httpHeaders['Content-length'] = strlen($content);
            $this->sendHttpHeaders();
            echo $content;
        }
        else {
            $this->_httpHeaders['Content-length'] = '0';
            $this->sendHttpHeaders();
        }
        return true;
    }

    public function outputErrors(){
        $coord = jApp::coord();
        $e = $coord->getErrorMessage();
        if ($e) {
            $errorCode = $e->getCode();
            if ($errorCode > 5000)
                $errorMessage = $e->getMessage();
            else
                $errorMessage = $coord->getGenericErrorMessage();
        }
        else {
            $errorCode = -1;
            $errorMessage = $coord->getGenericErrorMessage();
        }
        $this->clearHttpHeaders();
        $this->_httpStatusCode ='500';
        $this->_httpStatusMsg ='Internal Server Error';
        $this->_httpHeaders['Content-Type'] = "application/json";
        $content = jJsonRpc::encodeFaultResponse($errorCode, $errorMessage, $coord->request->jsonRequestId);
        $this->_httpHeaders['Content-length'] = strlen($content);
        $this->sendHttpHeaders();
        echo $content;
    }
}

