<?php
/**
* @package     jelix
* @subpackage  acl_driver
* @author      Laurent Jouanneau
* @copyright   2006-2011 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * driver for jAcl2 based on a database
 * @package jelix
 * @subpackage acl_driver
 */
class dbAcl2Driver implements jIAcl2Driver {

    /**
     *
     */
    function __construct (){ }


    protected static $aclres = array();
    protected static $acl = null;
    protected static $anonaclres = array();
    protected static $anonacl = null;

    /**
     * return the value of the right on the given subject (and on the optional resource)
     * @param string $subject the key of the subject
     * @param string $resource the id of a resource
     * @return boolean true if the right is ok
     */
    public function getRight($subject, $resource=null){

        if(!jAuth::isConnected()) {
            return self::getAnonymousRight($subject, $resource);
        }

        $groups = null;

        if (self::$acl === null) {
            $groups = jAcl2DbUserGroup::getGroups();
            self::$acl=array();
            if (count($groups)) {
                $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
                foreach($dao->getRightsByGroups($groups) as $rec){
                    // if there is already a right on a same subject on an other group
                    // we should take care when this rights says "cancel"
                    if (isset(self::$acl[$rec->id_aclsbj])) {
                        if ($rec->canceled) {
                            self::$acl[$rec->id_aclsbj] = false;
                        }
                    }
                    else {
                        self::$acl[$rec->id_aclsbj] = ($rec->canceled?false:true);
                    }
                }
            }
        }

        if(!isset(self::$acl[$subject])){
            self::$acl[$subject] = false;
        }

        if($resource === null){
            return self::$acl[$subject];
        }

        if(isset(self::$aclres[$subject][$resource])){
            return self::$aclres[$subject][$resource];
        }

        self::$aclres[$subject][$resource] = self::$acl[$subject];
        // if the general right is not set, check the specific right for the resource
        if (!self::$acl[$subject]) {
            if($groups===null)
                $groups = jAcl2DbUserGroup::getGroups();
            if (count($groups)) {
                $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
                $right = $dao->getRightWithRes($subject, $groups, $resource);
                self::$aclres[$subject][$resource] = ($right != false ? ($right->canceled?false:true) : false);
            }
            return self::$aclres[$subject][$resource];
        }
        else
            return true;
    }

    protected function getAnonymousRight($subject, $resource=null) {

        if (self::$anonacl === null) {
            $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
            self::$anonacl=array();
            foreach($dao->getAllAnonymousRights() as $rec){
                if (isset(self::$anonacl[$rec->id_aclsbj])) {
                    if ($rec->canceled)
                        self::$anonacl[$rec->id_aclsbj] = false;
                }
                else
                    self::$anonacl[$rec->id_aclsbj] = ($rec->canceled?false:true);
            }
        }

        if(!isset(self::$anonacl[$subject])){
            self::$anonacl[$subject] = false;
        }

        if($resource === null){
            return self::$anonacl[$subject];
        }

        if(isset(self::$anonaclres[$subject][$resource])){
            return self::$anonaclres[$subject][$resource];
        }

        self::$anonaclres[$subject][$resource] = self::$anonacl[$subject];
        if (!self::$anonacl[$subject]) {
            $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
            $right = $dao->getAnonymousRightWithRes($subject, $resource);
            return self::$anonaclres[$subject][$resource] = ($right != false ? ($right->canceled?false:true) : false);
        }
        else
            return true;
    }


    /**
     * clear right cache
     */
    public function clearCache(){
        self::$acl = null;
        self::$aclres = array();
        self::$anonacl = null;
        self::$anonaclres = array();
    }

}
