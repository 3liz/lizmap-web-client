<?php
/**
* @package     jelix
* @subpackage  events
* @author      Gérald Croes, Patrice Ferlet
* @contributor Laurent Jouanneau, Dominique Papin, Steven Jehannet
* @copyright 2001-2005 CopixTeam, 2005-2020 Laurent Jouanneau, 2009 Dominique Papin
* This classes were get originally from the Copix project
* (CopixEvent*, CopixListener* from Copix 2.3dev20050901, http://www.copix.org)
* Some lines of code are copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix classes are Gerald Croes and  Patrice Ferlet,
* and this classes were adapted/improved for Jelix by Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 */
require(JELIX_LIB_PATH.'events/jEventListener.class.php');


/**
* Class which represents an event in the event system
* @package     jelix
* @subpackage  events
*/
class jEvent {
    /**
    * The name of the event.
    * @var string name
    */
    protected $_name = null;

    /**
    * the event parameters
    */
    protected $_params = null;

    /**
    * @var mixed[][]
    */
    protected $_responses = array ();

    /**
    * New event.
    * @param string $name  the event name
    * @param array $params an associative array which contains parameters for the listeners
    */
    function __construct ($name, $params=array()){
        $this->_name   = $name;
        $this->_params = & $params;
    }

    /**
     * get a user param
     * @param string $name the parameter name
     * @return mixed
     */
    function __get($name) {
        return $this->getParam($name);
    }

    /**
     * set a user param
     * @param string $name the parameter name
     * @param mixed $value the value
     * @return mixed
     */
    function __set($name, $value) {
        return $this->_params[$name] = $value;
    }

    /**
    * gets the name of the event
    *    will be used internally for optimisations
    */
    public function getName (){
        return $this->_name;
    }

    /**
    * gets the given param
    * @param string $name the param name
    * @return string|null the value or null if the parameter does not exist
    * @deprecated since Jelix 1.6
    */
    public function getParam ($name){
        if (isset ($this->_params[$name])){
            $ret = $this->_params[$name];
        }else{
            $ret = null;
        }
        return $ret;
    }

    /**
     * return all parameters
     *
     * @return array parameters
     * @since 1.6.30
     */
    public function getParameters()
    {
        return $this->_params;
    }

    /**
     * Adds data in the responses list
     *
     * if it is an array, specific items can be retrieved with getResponseByKey()
     * getBoolResponseByKey(), or inResponse()
    * @param mixed $response a single response
    */
    public function add ($response) {
        $this->_responses[] = & $response;
    }

    /**
     * look in all the responses if we have a parameter having value as its answer
     *
     * eg, we want to know if we have failed = true in some responses, we call
     * inResponse('failed', true, $results), and we have into $results all
     * responses that have an item 'failed' equals to true.
     *
     * @param string $responseKey the response item we're looking for
     * @param mixed $value the value we're looking for
     * @param mixed[] $response returned array : all full responses arrays that have
     *   the given value
     * @return boolean whether or not we have founded the response value
     */
    public function inResponse ($responseKey, $value, & $response){
        $founded  = false;
        $response = array ();

        foreach ($this->_responses as $key=>$listenerResponse){
            if (is_array($listenerResponse) &&
                isset ($listenerResponse[$responseKey]) &&
                $listenerResponse[$responseKey] == $value
            ) {
                $founded = true;
                $response[] = & $this->_responses[$key];
            }
        }

        return $founded;
    }

    /**
     * get all responses value for the given key
     *
     * @param string $responseKey
     * @return array|null list of values or null if no responses for the given item
     * @since 1.6.22
     */
    public function getResponseByKey($responseKey){
        $response = array ();

        foreach ($this->_responses as $key=>$listenerResponse){
            if (is_array($listenerResponse) &&
                isset ($listenerResponse[$responseKey])
            ) {
                $response[] = & $listenerResponse[$responseKey];
            }
        }
        if (count($response))
            return $response;
        return null;
    }

    const RESPONSE_AND_OPERATOR = 0;

    const RESPONSE_OR_OPERATOR = 1;

    /**
     * get a response value as boolean
     *
     * if there are multiple response for the same key, a OR or a AND operation
     * is made between all of response values.
     *
     * @param string $responseKey
     * @param int $operator const RESPONSE_AND_OPERATOR or RESPONSE_OR_OPERATOR
     * @return null|boolean
     * @since 1.6.22
     */
    protected function getBoolResponseByKey($responseKey, $operator = 0){
        $response = null;

        foreach ($this->_responses as $key=>$listenerResponse){
            if (is_array($listenerResponse) &&
                isset ($listenerResponse[$responseKey])
            ) {
                $value = (bool) $listenerResponse[$responseKey];
                if ($response === null) {
                    $response = $value;
                }
                else if ($operator === self::RESPONSE_AND_OPERATOR) {
                    $response = $response && $value;
                }
                else if ($operator === self::RESPONSE_OR_OPERATOR) {
                    $response = $response || $value;
                }
            }
        }

        return $response;
    }

    /**
     * says if all responses items for the given key, are equals to true
     *
     * @param string $responseKey
     * @return null|boolean  null if there are no responses
     * @since 1.6.22
     */
    public function allResponsesByKeyAreTrue($responseKey) {
        return $this->getBoolResponseByKey($responseKey, self::RESPONSE_AND_OPERATOR);
    }

    /**
     * says if all responses items for the given key, are equals to false
     *
     * @param string $responseKey
     * @return null|boolean  null if there are no responses
     * @since 1.6.22
     */
    public function allResponsesByKeyAreFalse($responseKey) {
        $res = $this->getBoolResponseByKey($responseKey, self::RESPONSE_OR_OPERATOR);
        if ($res === null) {
            return $res;
        }
        return !$res;
    }

    /**
    * gets all the responses
    * @return mixed[][]  associative array
    */
    public function getResponse () {
        return $this->_responses;
    }


   //------------------------------------- static methods


    /**
    * send a notification to all modules
    * @param string $event the event name
    * @return jEvent
    */
    public static function notify ($eventname, $params=array()) {

        $event = new jEvent($eventname, $params);

        if(!isset(self::$hashListened[$eventname])){
            self::loadListenersFor ($eventname);
        }

        $list = & self::$hashListened[$eventname];
        foreach (array_keys ($list) as $key) {
            $list[$key]->performEvent ($event);
        }

        return $event;
   }

    protected static $compilerData = array('jEventCompiler',
                    'events/jEventCompiler.class.php',
                    'events.xml',
                    'events.php'
                    );

    /**
    * because a listener can listen several events, we should
    * create only one instancy of a listener for performance, and
    * $hashListened will contains only reference to this listener.
    * @var jEventListener[][]
    */
    protected static $listenersSingleton = array ();

    /**
    * hash table for event listened.
    * $hashListened['eventName'] = array of events (by reference)
    * @var jEventListener[][]
    */
    protected static $hashListened = array ();

    /**
    * construct the list of all listeners corresponding to an event
    * @param string $eventName the event name we wants the listeners for.
    */
    protected static function loadListenersFor ($eventName) {
        if (!isset($GLOBALS['JELIX_EVENTS'])) {
            $compilerData = self::$compilerData;
            $compilerData[3] = jApp::config()->urlengine['urlScriptId'].'.'.$compilerData[3];
            jIncluder::incAll($compilerData, true);
        }

        $inf = & $GLOBALS['JELIX_EVENTS'];
        self::$hashListened[$eventName] = array();
        if(isset($inf[$eventName])){
            $modules = & jApp::config()->_modulesPathList;
            foreach ($inf[$eventName] as $listener){
                list($module,$listenerName) = $listener;
                if (! isset($modules[$module]))  // some modules could be unused
                    continue;
                if (! isset (self::$listenersSingleton[$module][$listenerName])){
                    require_once ($modules[$module].'classes/'.$listenerName.'.listener.php');
                    $className = $listenerName.'Listener';
                    self::$listenersSingleton[$module][$listenerName] =  new $className ();
                }
                self::$hashListened[$eventName][] = self::$listenersSingleton[$module][$listenerName];
            }
        }
    }

    /**
     * for tests
     * @since 1.5
     */
    public static function clearCache() {
        self::$hashListened = array();
        self::$listenersSingleton = array ();
        unset($GLOBALS['JELIX_EVENTS']);
    }
}
