<?php
/**
* @package     jelix
* @subpackage  events
* @author      Gérald Croes, Patrice Ferlet
* @contributor Laurent Jouanneau, Dominique Papin, Steven Jehannet
* @copyright 2001-2005 CopixTeam, 2005-2012 Laurent Jouanneau, 2009 Dominique Papin
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
    * @var array of array
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
    * adds data in the responses list
    * @param array $response a single response
    */
    public function add ($response) {
        $this->_responses[] = & $response;
    }

    /**
    * look in all the responses if we have a parameter having value as its answer
    * eg, we want to know if we have failed = true, we do
    * @param string $responseName the param we're looking for
    * @param mixed $value the value we're looking for
    * @param mixed[] $response the response that have this value
    * @return boolean whether or not we have founded the response value
    */
    public function inResponse ($responseName, $value, & $response){
        $founded  = false;
        $response = array ();

        foreach ($this->_responses as $key=>$listenerResponse){
            if (isset ($listenerResponse[$responseName]) && $listenerResponse[$responseName] == $value){
                $founded = true;
                $response[] = & $this->_responses[$key];
            }
        }

        return $founded;
    }

    /**
    * gets all the responses
    * @return array of associative array
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
    * @var array of jEventListener
    */
    protected static $listenersSingleton = array ();

    /**
    * hash table for event listened.
    * $_hash['eventName'] = array of events (by reference)
    * @var associative array of object
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
