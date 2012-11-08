<?php
/**
* @package     jelix
* @subpackage  acl
* @author      Laurent Jouanneau
* @copyright   2006-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
* @since 1.1
*/

require(JELIX_LIB_PATH.'acl/jIAcl2Driver.iface.php');

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
     * @internal The constructor is private, because all methods are static
     */
    private function __construct (){ }

    /**
     * load the acl2 driver
     * @return jIAcl2Driver
     */
    protected static function _getDriver(){
        static $driver = null;
        if($driver == null){
            $config = jApp::config();
            $db = strtolower($config->acl2['driver']);
            if ($db == '')
                throw new jException('jelix~errors.acl.driver.notfound',$db);

            $driver = jApp::loadPlugin($db, 'acl2', '.acl2.php', $config->acl2['driver'].'Acl2Driver', $config->acl2);
            if (is_null($driver)) {
                throw new jException('jelix~errors.acl.driver.notfound',$db);
            }
        }
        return $driver;
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
     * clear right cache
     * @since 1.0b2
     */
    public static function clearCache(){
        $dr = self::_getDriver();
        $dr->clearCache();
    }
}

