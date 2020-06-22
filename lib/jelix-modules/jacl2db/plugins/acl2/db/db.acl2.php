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
class dbAcl2Driver implements jIAcl2Driver2 {

    /**
     *
     */
    function __construct (){ }


    protected static $aclres = array();
    protected static $acl =  array();
    protected static $anonaclres = array();
    protected static $anonacl = null;

    /**
     * return the value of the right on the given subject (and on the optional resource).
     *
     * The resource "-" (meaning 'all resources') has the priority over specific resources.
     * It means that if you give a specific resource, it will be ignored if there is a positive right
     * with "-". The right on the given resource will be checked if there is no rights for "-".
     * 
     * @param string $subject the key of the subject
     * @param string $resource the id of a resource
     * @return boolean true if the user has the right on the given subject
     */
    public function getRight($subject, $resource='-')
    {

        if (!jAuth::isConnected()) {
            return $this->getAnonymousRight($subject, $resource);
        }

        $user = jAuth::getUserSession();
        if ($user) {
            $login = $user->login;
        }
        else {
            $login = '';
        }
        return $this->getRightByUser($login, $subject, $resource);
    }

    /**
     * return the value of the right on the given subject for the given user (and on the optional resource).
     *
     * The resource "-" (meaning 'all resources') has the priority over specific resources.
     * It means that if you give a specific resource, it will be ignored if there is a positive right
     * with "-". The right on the given resource will be checked if there is no rights for "-".
     *
     * @param string $subject the key of the subject
     * @param string $resource the id of a resource
     * @return boolean true if the user has the right on the given subject
     */
    public function getRightByUser($login, $subject, $resource='-')
    {
        if (empty($resource))
            $resource = '-';

        if ($login === '' || $login === null) {
            return $this->getAnonymousRight($subject, $resource);
        }

        $groups = null;

        if (!isset(self::$acl[$login])) {
            // let's load all rights for the groups on which the current user is attached
            $groups = jAcl2DbUserGroup::getGroupsIdByUser($login);
            self::$acl[$login] = array();
            if (count($groups)) {
                $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
                foreach($dao->getRightsByGroups($groups) as $rec){
                    // if there is already a right on a same subject on an other group
                    // we should take care when this rights says "cancel"
                    if (isset(self::$acl[$login][$rec->id_aclsbj])) {
                        if ($rec->canceled) {
                            self::$acl[$login][$rec->id_aclsbj] = false;
                        }
                    }
                    else {
                        self::$acl[$login][$rec->id_aclsbj] = ($rec->canceled?false:true);
                    }
                }
            }
        }

        if (!isset(self::$acl[$login][$subject])) {
            self::$acl[$login][$subject] = false;
        }

        // no resource given, just return the global right for the given subject
        if ($resource == '-') {
            return self::$acl[$login][$subject];
        }

        // if we already have loaded the corresponding right, returns it
        if(isset(self::$aclres[$login][$subject][$resource])){
            return self::$aclres[$login][$subject][$resource];
        }

        // default right for the resource is the global right
        self::$aclres[$login][$subject][$resource] = self::$acl[$login][$subject];

        // if the general right is not given, check the specific right for the resource
        if (!self::$acl[$login][$subject]) {
            if ($groups === null) {
                $groups = jAcl2DbUserGroup::getGroupsIdByUser($login);
            }
            if (count($groups)) {
                $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
                $right = $dao->getRightWithRes($subject, $groups, $resource);
                self::$aclres[$login][$subject][$resource] = ($right != false ? ($right->canceled?false:true) : false);
            }
            return self::$aclres[$login][$subject][$resource];
        }
        else {
            return true;
        }
    }

    protected function getAnonymousRight($subject, $resource='-')
    {
        if (empty($resource))
            $resource = '-';

        if (self::$anonacl === null) {
            // let's load rights for anonymous group
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

        // no resource given, just return the global right for the given subject
        if ($resource === '-') {
            return self::$anonacl[$subject];
        }

        // if we already have loaded the corresponding right, returns it
        if(isset(self::$anonaclres[$subject][$resource])){
            return self::$anonaclres[$subject][$resource];
        }

        // default right for the resource is the global right
        self::$anonaclres[$subject][$resource] = self::$anonacl[$subject];
        // if the general right is not given, check the specific right for the resource
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
        self::$acl = array();
        self::$aclres = array();
        self::$anonacl = null;
        self::$anonaclres = array();
    }

}
