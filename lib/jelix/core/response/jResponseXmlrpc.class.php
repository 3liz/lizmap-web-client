<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Laurent Jouanneau
* @copyright   2005-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
* xmlrpc response
* @package  jelix
* @subpackage core_response
* @see jResponse
*/
final class jResponseXmlRpc extends jResponse {
    /**
    * @var string
    */
    protected $_type = 'xmlrpc';

    /**
     * PHP Data to send into the response
     */
    public $response = null;

    public function output(){

        $content = jXmlRpc::encodeResponse($this->response, $GLOBALS['gJConfig']->charset);

        $this->_httpHeaders["Content-Type"]="text/xml;charset=".$GLOBALS['gJConfig']->charset;
        $this->_httpHeaders["Content-length"]=strlen($content);
        $this->sendHttpHeaders();
        echo $content;
        return true;
    }

    public function outputErrors(){
        global $gJCoord, $gJConfig;

        $errorMessage = $gJCoord->getGenericErrorMessage();
        $e = $gJCoord->getErrorMessage();
        if ($e) {
            $errorCode = $e->getCode();
        }
        else {
            $errorCode = -1;
        }

        $this->clearHttpHeaders();
        $content = jXmlRpc::encodeFaultResponse($errorCode, $errorMessage, $gJConfig->charset);

        header("HTTP/1.0 500 Internal Server Error");
        header("Content-Type: text/xml;charset=".$gJConfig->charset);
        header("Content-length: ".strlen($content));
        echo $content;
    }
}
