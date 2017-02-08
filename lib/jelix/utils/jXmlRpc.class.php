<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @contributor Gildas Givaja
* @contributor Vincent Bonnard
* @copyright   2001-2005 CopixTeam, 2005-2006 Laurent Jouanneau
*
* This class was get originally from the Copix project (CopixXmlRpc, Copix 2.3dev20050901, http://www.copix.org)
* Some lines of code are copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial author of this Copix class is Laurent Jouanneau,
* and this class was adapted/improved for Jelix by Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * object to encode decode some XMl-RPC request and XMl-RPC response
 * @package    jelix
 * @subpackage utils
 * @see http://www.xmlrpc.com/spec
 */
class jXmlRpc {

     private function __construct(){}

    /**
     * decode an xmlrpc request
     * @param string $xmlcontent the content of the request, in xmlrpc format
     * @return array first element content the method name to execute
     *               second element content parameters
     */
    public static function decodeRequest($xmlcontent){
        $xml = simplexml_load_string($xmlcontent);
        if($xml == false){

        }
        $methodname = (string)$xml->methodName;
        $params = array();
        if(isset($xml->params)){
            if(isset($xml->params->param)){
                foreach($xml->params->param as $param){
                    if(isset($param->value)){
                        $params[] = self::_decodeValue($param->value);
                    }
                }
            }
        }

        return array($methodname, $params);
    }

    /**
     * encode an xmlrpc request
     * @param string $methodname
     * @param array $params method parameters
     * @param string $charset
     * @return string xmlrpc request
     */
    public static function encodeRequest($methodname, $params, $charset=''){
        $request =  '<?xml version="1.0" '.($charset?'encoding="'.$charset.'"':'').'?>
<methodCall><methodName>'.htmlspecialchars($methodname).'</methodName><params>';
        foreach($params as $param){
            $request.= '<param>'.self::_encodeValue($param).'</param>';
        }
        $request.='</params></methodCall>';
        return $request;
    }

    /**
     * decode an xmlrpc response
     * @param string $xmlcontent the content of the response, in xmlrpc format
     * @return mixed data stored into the response
     */
    public static function decodeResponse($xmlcontent){
        $xml = simplexml_load_string($xmlcontent);
        if($xml == false){

        }
        $response=array();
        if(isset($xml->params)){
            if(isset($xml->params->param)){
                $params = array();
                foreach($xml->params->param as $param){
                    if(isset($param->value)){
                        $params[] = self::_decodeValue($param->value);
                    }
                }
                $response[0] = true;
                $response[1]=$params;
            }
        }else if(isset($xml->fault)){
            $response[0] = false;
            if(isset($xml->fault->value))
                $response[1] = self::_decodeValue($xml->fault->value);
            else
                $response[1] = null;
        }

        return $response;
    }

    /**
     * encode an xmlrpc response
     * @param mixed $params the value to stored into the response
     * @param string $charset the charset to use
     * @return string the xmlrpc response
     */
    public static function encodeResponse($params, $charset=''){
        return '<?xml version="1.0" '.($charset?'encoding="'.$charset.'"':'').'?>
<methodResponse><params><param>'.self::_encodeValue($params).'</param></params></methodResponse>';
    }

    /**
     * encode an xmlrpc error response
     * @param string $code the error code
     * @param string $message
     * @param string $charset the charset to use
     * @return string the xmlrpc response
     */
    public static function encodeFaultResponse($code, $message, $charset=''){
        return '<?xml version="1.0" '.($charset?'encoding="'.$charset.'"':'').'?>
<methodResponse><fault><value><struct>
<member><name>faultCode</name><value><int>'.intval($code).'</int></value></member>
<member><name>faultString</name><value><string>'.htmlspecialchars($message).'</string></value></member>
</struct></value></fault></methodResponse>';
    }

    /**
     * deserialize a xmlrpc content to a php value
     * @param SimpleXMLElement $valuetag xmlrpc content
     * @return mixed the php value
     */
    private static function _decodeValue($valuetag){
        $children = $valuetag->children();
        $value = null;
        if($children->count()){
            if(isset($valuetag->i4)){
                $value= intval((string) $valuetag->i4);
            }else if(isset($valuetag->int)){
                $value= intval((string) $valuetag->int);
            }else if(isset($valuetag->double)){
                $value= doubleval((string)$valuetag->double);
            }else if(isset($valuetag->string)){
                $value= html_entity_decode((string)$valuetag->string);
            }else if(isset($valuetag->boolean)){
                $value= intval((string)$valuetag->boolean)?true:false;
            }else if(isset($valuetag->array)){
                $value=array();
                if(isset($valuetag->array->data->value)){
                    foreach($valuetag->array->data->value as $val){
                        $value[] = self::_decodeValue($val);
                    }
                }
            }else if(isset($valuetag->struct)){
                $value=array();
                if(isset($children[0]->member)){
                    foreach($children[0]->member as $val){
                        if(isset($val->name) && isset($val->value)){
                            $value[(string)$val->name] = self::_decodeValue($val->value);
                        }
                    }
                }
            }else if(isset($valuetag->{'dateTime.iso8601'})){
                $value = new jDateTime();
                $value->setFromString((string)$valuetag->{'dateTime.iso8601'}, jDateTime::ISO8601_FORMAT);
            }else if(isset($valuetag->base64)){
                $value = new jBinaryData();
                $value->setFromBase64String((string)$valuetag->base64);
            }

        }else{
            $value = (string) $valuetag;
        }
        return $value;
    }

    /**
     * serialize a php value into xmlrpc format
     * @param mixed $value a value
     * @return string xmlrpc content
     */
    private static function _encodeValue($value){
        $response='<value>';
        if(is_array($value)){

            $isArray = true;
            $data = array();
            $structkeys = array();
            foreach($value as $key => $val){
                if(!is_numeric($key))
                    $isArray=false;

                $structkeys[]='<name>'.$key.'</name>';
                $data[]=self::_encodeValue($val);
            }

            if($isArray){
                $response .= '<array><data>'.implode(' ',$data).'</data></array>';
            }else{
                $response .= '<struct>';
                foreach($data as $k=>$v){
                    $response.='<member>'.$structkeys[$k].$v.'</member>';
                }
                $response .= '</struct>';
            }
        }else if(is_bool($value)){
            $response .= '<boolean>'.($value?1:0).'</boolean>';
        }else if(is_int($value)){
            $response .= '<int>'.intval($value).'</int>';
        }else if(is_string($value)){
            $response .= '<string>'.htmlspecialchars($value).'</string>';
        }else if(is_float($value) ){
            $response .= '<double>'.doubleval($value).'</double>';
        }else if(is_object($value)){
            switch(get_class($value)){
                case 'jdatetime':
                    $response .= '<dateTime.iso8601>'.$value->toString(jDateTime::ISO8601_FORMAT).'</dateTime.iso8601>';
                    break;
                case 'jbinarydata':
                    $response .= '<base64>'.$value->toBase64String().'</base64>';
                    break;
            }
        }
        return $response.'</value>';
    }
}

/**
 *
 * @package    jelix
 * @subpackage utils
 */
class jBinaryData  {
    public $data;

    public function toBase64String(){
        return base64_encode($this->data);
    }

    public function setFromBase64String($string){
        $this->data = base64_decode($string);
    }
}
