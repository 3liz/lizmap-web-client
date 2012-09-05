<?php
/**
* @package     jelix
* @subpackage  acl
* @author      Laurent Jouanneau
* @copyright   2006-2007 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
* @since 1.0b3
*/


/**
 * Utility class for all classes used for the db driver of jAcl
 * @package     jelix
 * @subpackage  acl
 * @static
 */
class jAclDb {

    /**
     * @internal The constructor is private, because all methods are static
     */
    private function __construct (){ }

    /**
     * return the profile name used for jacl connection
     * @return string profile name
     * @deprecated 1.2
     */
    public static function getProfile(){
        return 'jacl_profile';
    }

    /**
     * DEPRECATED. same as getProfile
     * @deprecated 1.1
     */
    public static function getProfil (){
        trigger_error("jAclDb::getProfil() is deprecated, you should use jAclDb::getProfile()", E_USER_DEPRECATED);
        return 'jacl_profile';
    }
}

