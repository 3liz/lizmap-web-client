<?php
/**
* @package     jelix
* @subpackage  acl_driver
* @author      Laurent Jouanneau
* @copyright   2006-2016 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * driver for jAcl2 based on a database, and using a cache
 * @package jelix
 * @subpackage acl_driver
 */
class dbcacheAcl2Driver implements jIAcl2Driver {

    /**
     *
     */
    function __construct (){}

    protected $aclres = array();
    protected $acl = null;
    protected $anonaclres = array();
    protected $anonacl = null;

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
    public function getRight($subject, $resource='-'){

        if (!jAuth::isConnected()) {
            return $this->getAnonymousRight($subject, $resource);
        }

        if (empty($resource)) {
            $resource = '-';
        }

        $login = jCache::normalizeKey(jAuth::getUserSession()->login);
        $rightkey = 'acl2db/'.$login.'/rights';
        $groups = null;

        if ($this->acl === null) {
            $rights = jCache::get($rightkey, 'acl2db');

            if ($rights === false) {
                $this->acl = array();
                // let's load all rights for the groups on which the current user is attached
                $groups = jAcl2DbUserGroup::getGroups();

                if (count($groups)) {
                    $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
                    foreach ($dao->getRightsByGroups($groups) as $rec) {
                        // if there is already a right on a same subject on an other group
                        // we should take care when this rights says "cancel"
                        if (isset($this->acl[$rec->id_aclsbj])) {
                            if ($rec->canceled) {
                                $this->acl[$rec->id_aclsbj] = false;
                            }
                        }
                        else {
                            $this->acl[$rec->id_aclsbj] = ($rec->canceled?false:true);
                        }
                    }
                }
                jCache::set($rightkey, $this->acl, null, 'acl2db');
            }
            else {
                $this->acl = $rights;
            }
        }

        if (!isset($this->acl[$subject])) {
            $this->acl[$subject] = false;
            jCache::set($rightkey, $this->acl, null, 'acl2db');
        }

        // no resource given, just return the global right for the given subject
        if ($resource == '-') {
            return $this->acl[$subject];
        }

        $rightreskey = 'acl2db/'.$login.'/rightsres/'.$subject;

        if (!isset($this->aclres[$subject])) {
            $rights = jCache::get($rightreskey, 'acl2db');
            if ($rights !== false) {
                $this->aclres[$subject] = $rights;
            }
        }

        // if we already have loaded the corresponding right, returns it
        if (isset($this->aclres[$subject][$resource])) {
            return $this->aclres[$subject][$resource];
        }

        // default right for the resource is the global right
        $this->aclres[$subject][$resource] = $this->acl[$subject];

        // if the general right is not given, check the specific right for the resource
        if (!$this->acl[$subject]) {
            if ($groups === null) {
                $groups = jAcl2DbUserGroup::getGroups();
            }
            if (count($groups)) {
                $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
                $right = $dao->getRightWithRes($subject, $groups, $resource);
                $this->aclres[$subject][$resource] = ($right != false ? ($right->canceled?false:true) : false);
            }
            jCache::set($rightreskey, $this->aclres[$subject], null, 'acl2db');
            return $this->aclres[$subject][$resource];
        }
        else {
            jCache::set($rightreskey, $this->aclres[$subject], null, 'acl2db');
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
        $this->acl = null;
        $this->aclres = array();
        $this->anonacl = null;
        $this->anonaclres = array();
        jCache::flush('acl2db');
    }
}
