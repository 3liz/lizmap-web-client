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
        global $gJCoord;

        $this->_httpHeaders['Content-Type'] = "application/json";
        if($gJCoord->request->jsonRequestId !== null){
            $content = jJsonRpc::encodeResponse($this->response, $gJCoord->request->jsonRequestId);
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
        global $gJCoord;
        $e = $gJCoord->getErrorMessage();
        if ($e) {
            $errorCode = $e->getCode();
            if ($errorCode > 5000)
                $errorMessage = $e->getMessage();
            else
                $errorMessage = $gJCoord->getGenericErrorMessage();
        }
        else {
            $errorCode = -1;
            $errorMessage = $gJCoord->getGenericErrorMessage();
        }
        $this->clearHttpHeaders();
        $this->_httpStatusCode ='500';
        $this->_httpStatusMsg ='Internal Server Error';
        $this->_httpHeaders['Content-Type'] = "application/json";
        $content = jJsonRpc::encodeFaultResponse($errorCode, $errorMessage, $gJCoord->request->jsonRequestId);
        $this->_httpHeaders['Content-length'] = strlen($content);
        $this->sendHttpHeaders();
        echo $content;
    }
}

