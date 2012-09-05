<?php
/**
* @package     jelix
* @subpackage  acl_driver
* @author      Laurent Jouanneau
* @copyright   2006-2009 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * driver for jAcl based on a database
 * @package jelix
 * @subpackage acl_driver
 */
class dbAclDriver implements jIAclDriver {

    /**
     * 
     */
    function __construct (){ }


    protected static $aclres = array();
    protected static $acl = array();

    /**
     * return the value of the right on the given subject (and on the optional resource)
     * @param string $subject the key of the subject
     * @param string $resource the id of a resource
     * @return array list of values corresponding to the right
     */
    public function getRight($subject, $resource=null){

        if($resource === null && isset(self::$acl[$subject])){
            return self::$acl[$subject];
        }elseif(isset(self::$aclres[$subject][$resource])){
            return self::$aclres[$subject][$resource];
        }

        if(!jAuth::isConnected()) // not authificated = no rights
            return array();

        $groups = jAclDbUserGroup::getGroups();

        if (count($groups) == 0) {
            self::$acl[$subject] = array();
            self::$aclres[$subject][$resource] = array();
            return array();
        }

        // get all the values corresponding to the groups which the user has access to,
        //  with the subject and resource indicated
        $values= array();
        $dao = jDao::get('jacldb~jaclrights', 'jacl_profile');
        $list = $dao->getAllGroupRights($subject, $groups);
        foreach($list as $right){
            $values [] = $right->value;
        }
        self::$acl[$subject] = $values;

        if($resource !== null){
            $list = $dao->getAllGroupRightsWithRes($subject, $groups, $resource);
            foreach($list as $right){
                $values [] = $right->value;
            }
            self::$aclres[$subject][$resource] = $values = array_unique($values);
        }

        return $values;
    }

    /**
     * clear right cache
     * @since 1.0b2
     */
    public function clearCache(){
        self::$acl = array();
        self::$aclres = array();
    }

}

