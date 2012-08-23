<?php
/**
* @package    jelix
* @subpackage utils
* @author     Loic Mathaud
* @copyright  2008 Loic Mathaud
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* Utility class to log some message in session in order to be displayed in a template
* @package    jelix
* @subpackage utils
* @static
*/
class jMessage {

    protected static $session_name = 'JELIX_MESSAGE';
    
    
    /**
    * Add a message
    * @param string $message the message
    * @param string $type the message type ('default' by default)
    */
    public static function add($message, $type = 'default') {
        $_SESSION[self::$session_name][$type][] = $message;
    }
    
    /**
    * Clear messages for the given type
    * @param string $type the message type ('default' by default)
    */
    public static function clear($type = 'default') {
        $_SESSION[self::$session_name][$type] = array();
    }
    
    /**
    * Clear all messages
    */
    public static function clearAll() {
        $_SESSION[self::$session_name] = array();
    }
    
    /**
    * Get messages for the given type
    * @param string $type the message type ('default' by default)
    * @return mixed array/null
    */
    public static function get($type = 'default') {
        if (isset($_SESSION[self::$session_name][$type])) {
            return $_SESSION[self::$session_name][$type];
        }
        
        return null;
    }
    
    /**
    * Get all messages
    * @return mixed array/null
    */
    public static function getAll() {
        if (isset($_SESSION[self::$session_name])) {
            return $_SESSION[self::$session_name];
        }
        
        return null;
    }
}
