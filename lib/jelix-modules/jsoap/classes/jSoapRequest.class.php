<?php
/**
* @package     jelix
* @subpackage  core_request
* @author      Sylvain de Vathaire
* @contributor Laurent Jouanneau
* @copyright   2008 Sylvain de Vathaire, 2011 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* handle a soap call. The response has to be a soap response.
* @package  jelix
* @subpackage core_request
*/
class jSoapRequest extends jRequest {

    public $type = 'soap';

    public $defaultResponseType = 'soap';

    public $authorizedResponseClass = 'jResponseSoap';

    public $soapMsg;

    function __construct(){  }

    /**
     * Paramameters initalisation prior to request handling
     */
    function initService(){

       if(isset($_GET["service"]) && $_GET['service'] != ''){
            list($module, $action) =  explode('~',$_GET["service"]);
        }else{
            throw new jException('jsoap~errors.service.param.required');
        }

        $this->params['module'] = $module;
        $this->params['action'] = $action;

        if(isset($HTTP_RAW_POST_DATA) && ($HTTP_RAW_POST_DATA!='')){
            $this->soapMsg = $HTTP_RAW_POST_DATA;
        }else{
            $this->soapMsg = file("php://input");
            $this->soapMsg = implode(" ", $this->soapMsg);
        }

        $this->_initUrlData(); //Need to be called manually before coordinator call of init because needed for the WSDL generation 
    }


    /**
     * Overload of the init method to prevent calling twice _initUrlData
     */
    function init(){}

    protected function _initParams(){}

    /**
    * Gets the value of a request parameter. If not defined, gets its default value.
    * @param string  $name           the name of the request parameter
    * @param mixed   $defaultValue   the default returned value if the parameter doesn't exists
    * @param boolean $useDefaultIfEmpty true: says to return the default value if the parameter value is ""
    * @return mixed the request parameter value
    */
    public function getParam($name, $defaultValue=null, $useDefaultIfEmpty=false){
        if (!isset($this->params[$name])) {
            return $defaultValue;
        }
        // we cannot use the empty() function because 0 returns true. And maybe we want 0
        // as a normal value...
        if (is_scalar($this->params[$name])) {
            if ($useDefaultIfEmpty && trim($this->params[$name]) == '' ) {
                return $defaultValue;
            }
            else {
                return $this->params[$name];
            }
        }
        else{
            // array or object
            if ( $useDefaultIfEmpty && empty($this->params[$name]) ) {
                return $defaultValue;
            }
            else {
                return $this->params[$name];
            }
        }
    }
}
