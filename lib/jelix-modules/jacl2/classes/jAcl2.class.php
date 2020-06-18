<?php
/**
* @package     jelix
* @subpackage  acl2
* @author      Laurent Jouanneau
* @copyright   2006-2020 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
* @since 1.1
*/

require(__DIR__.'/jIAcl2Driver.iface.php');
require(__DIR__.'/jIAcl2Driver2.iface.php');

/**
 * Main class to query the acl system, and to know value of a right
 *
 * you should call this class (all method are static) when you want to know if
 * the current user have a right
 * @package jelix
 * @subpackage acl
 * @static
 */
class jAcl2 {

    /**
     * @var null|jIAcl2Driver|jIAcl2Driver2
     */
    static protected $driver = null;

    /**
     * @internal The constructor is private, because all methods are static
     */
    private function __construct (){ }

    /**
     * load the acl2 driver
     * @return jIAcl2Driver|jIAcl2Driver2
     */
    protected static function _getDriver(){
        if (self::$driver == null) {
            $config = jApp::config();
            $db = strtolower($config->acl2['driver']);
            if ($db == '') {
                throw new jException('jacl2~errors.driver.notfound',$db);
            }

            /** @var jIAcl2Driver|jIAcl2Driver2 */
            self::$driver = jApp::loadPlugin($db, 'acl2', '.acl2.php', $config->acl2['driver'].'Acl2Driver', $config->acl2);
            if (is_null(self::$driver)) {
                throw new jException('jacl2~errors.driver.notfound',$db);
            }
        }
        return self::$driver;
    }

    /**
     * call this method to know if the current user has the right with the given value
     * @param string $subject the key of the subject to check
     * @param string $resource the id of a resource
     * @return boolean true if yes
     */
    public static function check($subject, $resource=null){
        $dr = self::_getDriver();
        return $dr->getRight($subject, $resource);
    }


    /**
     * call this method to know if the given user has the right with the given value
     *
     * @param string $login the user login. Can be empty/null if anonymous
     * @param string $subject the key of the subject to check
     * @param string $resource the id of a resource
     * @return boolean true if yes
     * @since 1.6.29
     */
    public static function checkByUser($login, $subject, $resource=null){
        $dr = self::_getDriver();
        if (!($dr instanceof jIAcl2Driver2)) {
            throw new Exception("the jacl2 driver does not implement the jIAcl2Driver2 interface");
        }
        return $dr->getRightByUser($login, $subject, $resource);
    }

    /**
     * clear right cache
     * @since 1.0b2
     */
    public static function clearCache(){
        $dr = self::_getDriver();
        $dr->clearCache();
    }

    /**
     * for tests...
     */
    public static function unloadDriver(){
        self::$driver = null;
    }
}

