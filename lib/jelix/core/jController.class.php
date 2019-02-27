<?php
/**
* @package    jelix
* @subpackage core
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2005-2014 Laurent Jouanneau, 2006 Loic Mathaud
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*
*/

/**
 * interface for controllers used for RESTFull request/response
 * @package  jelix
 * @subpackage core
 */
interface jIRestController{
    public function get();
    public function post();
    public function put();
    public function delete();
}

/**
 * class base for controllers
 *
 * A controller is used to implement one or many actions, one method for each action.
 * @package  jelix
 * @subpackage core
 */
abstract class jController{

    /**
     * parameters for plugins of the coordinator
     *
     * this array should contains all parameters needed by installed plugins for
     * each action, see the documentation of each plugins to know this parameters.
     * keys : name of an action or * for parameters to all action
     * values : array that contains all plugin parameters
     * @var array
     */
    public $pluginParams=array();

    /**
     * sensitive parameters
     *
     * List of names of parameters that can have sensitive values like password etc.
     * This list is used by the logger for example, to replace values by a dummy value.
     * See also sensitiveParameters into error_handling section of the configuration.
     * @var string[]
     * @since 1.6.16
     */
    public $sensitiveParameters = array();

    /**
     * the request object
     * @var jRequest
     */
    protected $request;

    /**
     *
     * @param jRequest $request the current request object
     */
    function __construct ( $request){
        $this->request = $request;
    }

    /**
    * Gets the value of a request parameter. If not defined, gets its default value.
    * @param string  $parName           the name of the request parameter
    * @param mixed   $parDefaultValue   the default returned value if the parameter doesn't exists
    * @param boolean $useDefaultIfEmpty true: says to return the default value if the parameter value is ""
    * @return mixed the request parameter value
    */
    protected function param ($parName, $parDefaultValue=null, $useDefaultIfEmpty=false){
       return $this->request->getParam($parName, $parDefaultValue, $useDefaultIfEmpty);
    }

    /**
    * same as param(), but convert the value to an integer value. If it isn't
    * a numerical value, return null.
    * @param string  $parName           the name of the request parameter
    * @param mixed   $parDefaultValue   the default returned value if the parameter doesn't exists
    * @param boolean $useDefaultIfEmpty true: says to return the default value the value is ""
    * @return integer the request parameter value
    */
    protected function intParam ($parName, $parDefaultValue=null, $useDefaultIfEmpty=false){
        $value = $this->request->getParam($parName, $parDefaultValue, $useDefaultIfEmpty);
        if(is_numeric($value))
            return intval($value);
        else
            return null;
    }

    /**
    * same as param(), but convert the value to a float value. If it isn't
    * a numerical value, return null.
    * @param string  $parName           the name of the request parameter
    * @param mixed   $parDefaultValue   the default returned value if the parameter doesn't exists
    * @param boolean $useDefaultIfEmpty true: says to return the default value the value is ""
    * @return float the request parameter value
    */
    protected function floatParam ($parName, $parDefaultValue=null, $useDefaultIfEmpty=false){
        $value = $this->request->getParam($parName, $parDefaultValue, $useDefaultIfEmpty);
        if(is_numeric($value))
            return floatval($value);
        else
            return null;
    }

    /**
    * same as param(), but convert the value to a boolean value. If it isn't
    * a numerical value, return null.
    * @param string  $parName           the name of the request parameter
    * @param mixed   $parDefaultValue   the default returned value if the parameter doesn't exists
    * @param boolean $useDefaultIfEmpty true: says to return the default value the value is ""
    * @return boolean the request parameter value
    */
    protected function boolParam ($parName, $parDefaultValue=null, $useDefaultIfEmpty=false){
        $value = $this->request->getParam($parName, $parDefaultValue, $useDefaultIfEmpty);
        if($value=="true" || $value == "1" || $value=="on" || $value=="yes")
            return true;
        elseif($value=="false" || $value == "0" || $value=="off" || $value=="no")
            return false;
        else
            return null;
    }

    /**
     * @return array all request parameters
     */
    protected function params(){ return $this->request->params; }

    /**
     * get a response object.
     * @param string $name the name of the response type (ex: "html")
     * @param boolean $useOriginal true:don't use the response object redefined by the application
     * @return jResponse|jResponseHtml|jResponseRedirect|jResponseJson the response object
     */
    protected function getResponse($name='', $useOriginal=false){
        return $this->request->getResponse($name, $useOriginal);
    }

}
