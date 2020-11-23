<?php
/**
* @package     jelix
* @subpackage  acl_driver
* @author      Laurent Jouanneau
* @copyright   2006-2020 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * driver for jAcl2 based on a database, and using a cache
 * @package jelix
 * @subpackage acl_driver
 */
class dbcacheAcl2Driver implements jIAcl2Driver2 {

    /**
     *
     */
    function __construct (){}

    protected $aclres = array();
    protected $acl = array();
    protected $anonaclres = array();
    protected $anonacl = null;

    /**
     * return the value of the right on the given subject for the current user(and on the optional resource).
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
        if ($login === '' || $login === null) {
            return $this->getAnonymousRight($subject, $resource);
        }

        if (empty($resource)) {
            $resource = '-';
        }
        $escapedLogin = jCache::normalizeKey($login);
        $rightkey = 'acl2db/'.$escapedLogin.'/rights';
        $groups = null;

        if (!isset($this->acl[$login])) {
            $rights = jCache::get($rightkey, 'acl2db');

            if ($rights === false) {
                $this->acl[$login] = array();
                // let's load all rights for the groups on which the current user is attached
                $groups = jAcl2DbUserGroup::getGroupsIdByUser($login);

                if (count($groups)) {
                    $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
                    foreach ($dao->getRightsByGroups($groups) as $rec) {
                        // if there is already a right on a same subject on an other group
                        // we should take care when this rights says "cancel"
                        if (isset($this->acl[$login][$rec->id_aclsbj])) {
                            if ($rec->canceled) {
                                $this->acl[$login][$rec->id_aclsbj] = false;
                            }
                        }
                        else {
                            $this->acl[$login][$rec->id_aclsbj] = ($rec->canceled?false:true);
                        }
                    }
                }
                jCache::set($rightkey, $this->acl[$login], null, 'acl2db');
            }
            else {
                $this->acl[$login] = $rights;
            }
        }

        if (!isset($this->acl[$login][$subject])) {
            $this->acl[$login][$subject] = false;
            jCache::set($rightkey, $this->acl[$login], null, 'acl2db');
        }

        // no resource given, just return the global right for the given subject
        if ($resource == '-') {
            return $this->acl[$login][$subject];
        }

        $rightreskey = 'acl2db/'.$escapedLogin.'/rightsres/'.$subject;

        if (!isset($this->aclres[$login][$subject])) {
            $rights = jCache::get($rightreskey, 'acl2db');
            if ($rights !== false) {
                $this->aclres[$login][$subject] = $rights;
            }
        }

        // if we already have loaded the corresponding right, returns it
        if (isset($this->aclres[$login][$subject][$resource])) {
            return $this->aclres[$login][$subject][$resource];
        }

        // default right for the resource is the global right
        $this->aclres[$login][$subject][$resource] = $this->acl[$login][$subject];

        // if the general right is not given, check the specific right for the resource
        if (!$this->acl[$login][$subject]) {
            if ($groups === null) {
                $groups = jAcl2DbUserGroup::getGroupsIdByUser($login);
            }
            if (count($groups)) {
                $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
                $right = $dao->getRightWithRes($subject, $groups, $resource);
                $this->aclres[$login][$subject][$resource] = ($right != false ? ($right->canceled?false:true) : false);
            }
            jCache::set($rightreskey, $this->aclres[$login][$subject], null, 'acl2db');
            return $this->aclres[$login][$subject][$resource];
        }
        else {
            jCache::set($rightreskey, $this->aclres[$login][$subject], null, 'acl2db');
            return true;
        }
    }

    protected function getAnonymousRight($subject, $resource='-') {
        if (empty($resource)) {
            $resource = '-';
        }

        if ($this->anonacl === null) {

            $rights = jCache::get('acl2dbanon/rights', 'acl2db');

            if ($rights === false) {
                // let's load rights for anonymous group
                $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
                $this->anonacl = array();
                foreach($dao->getAllAnonymousRights() as $rec){
                    if (isset($this->anonacl[$rec->id_aclsbj])) {
                        if ($rec->canceled) {
                            $this->anonacl[$rec->id_aclsbj] = false;
                        }
                    }
                    else {
                        $this->anonacl[$rec->id_aclsbj] = ($rec->canceled?false:true);
                    }
                }
                jCache::set('acl2dbanon/rights', $this->anonacl, null, 'acl2db');
            }
            else {
                $this->anonacl = $rights;
            }
        }

        if (!isset($this->anonacl[$subject])) {
            $this->anonacl[$subject] = false;
            jCache::set('acl2dbanon/rights', $this->anonacl, null, 'acl2db');
        }

        // no resource given, just return the global right for the given subject
        if ($resource === '-') {
            return $this->anonacl[$subject];
        }

        if (!isset($this->anonaclres[$subject])) {
            $rights = jCache::get('acl2dbanon/rightsres/'.$subject, 'acl2db');
            if ($rights !== false) {
                $this->anonaclres[$subject] = $rights;
            }
        }

        // if we already have loaded the corresponding right, returns it
        if(isset($this->anonaclres[$subject][$resource])){
            return $this->anonaclres[$subject][$resource];
        }

        // default right for the resource is the global right
        $this->anonaclres[$subject][$resource] = $this->anonacl[$subject];
        // if the general right is not given, check the specific right for the resource
        if (!$this->anonacl[$subject]) {
            $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
            $right = $dao->getAnonymousRightWithRes($subject, $resource);
            $this->anonaclres[$subject][$resource] = ($right != false ? ($right->canceled?false:true) : false);
            jCache::set('acl2dbanon/rightsres/'.$subject,  $this->anonaclres[$subject], null ,'acl2db');
            return $this->anonaclres[$subject][$resource];
        }
        else {
            jCache::set('acl2dbanon/rightsres/'.$subject,  $this->anonaclres[$subject], null ,'acl2db');
            return true;
        }
    }

    /**
     * clear right cache
     */
    public function clearCache(){
        $this->acl = array();
        $this->aclres = array();
        $this->anonacl = null;
        $this->anonaclres = array();
        jCache::flush('acl2db');
    }
}
