<?php
/**
* @package     jelix
* @subpackage  acl
* @author      Laurent Jouanneau
* @copyright   2006-2009 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
* @since 1.1
*/


/**
 * Utility class for all classes used for the db driver of jAcl2
 * @package     jelix
 * @subpackage  acl
 * @static
 */
class jAcl2Db {

    /**
     * @internal The constructor is private, because all methods are static
     */
    private function __construct (){ }

    /**
     * return the profile name used for jacl connection
     * @return string  'jacl_profile'
     * @deprecated 1.2
     */
    public static function getProfile(){
        return 'jacl2_profile';
    }
}
