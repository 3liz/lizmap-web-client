<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @contributor Julien ISSLER
* @copyright   2005-2011 Laurent Jouanneau
* @copyright   2007 Julien Issler
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * object which encode and decode a jsonrpc request and response
 * @package    jelix
 * @subpackage utils
 * @link http://json-rpc.org/index.xhtml
 */
class jJsonRpc {

    private function __construct(){}

    /**
     * decode a request of json xmlrpc
     * @param string $content
     * @return mixed
     */
    public static function decodeRequest($content){
        // {"method":.. , "params":.. , "id":.. }
        $obj = json_decode($content,true);
        return $obj;
    }

    /**
     * create a request content for a jsonrpc call
     * @param string $methodname method of the jsonrcp web service
     * @param array $params parameters for the methods
     * @return string jsonrcp request content
     */
    public static function encodeRequest($methodname, $params, $id=1){
        return '{"method":"'.$methodname.'","params":'.json_encode($params).',"id":'.json_encode($id).'}';
    }

    /**
     * decode a jsonrpc response
     * @param string $content
     * @return mixed decoded content
     */
    public static function decodeResponse($content){
        // {result:.. , error:.. , id:.. }
        return json_decode($content,true);
    }

    /**
     * encode a jsonrpc response
     * @param array $params  returned value
     * @return string encoded response
     */
    public static function encodeResponse($params, $id=1){
        return '{"result":'.json_encode($params).',"error":null,"id":'.json_encode($id).'}';
    }

    /**
     * encode a jsonrpc error response
     * @param int $code code error
     * @param string $message error message
     * @return string encoded response
     */
    public static function encodeFaultResponse($code, $message, $id=1){
        return '{"result":null,"error":{"code": '.json_encode($code).', "string":'.json_encode($message).' },"id":'.json_encode($id).'}';
    }
}

