<?php
/**
* @package    jelix
* @subpackage ldap_driver
* @author     Tahina Ramaroson
* @contributor Sylvain de Vathaire
* @contributor Thibaud Fabre, Laurent Jouanneau
* @copyright  2009 Neov, 2010 Thibaud Fabre, 2011 Laurent Jouanneau
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
* LDAP authentification driver for authentification information stored in LDAP server
* @package    jelix
* @subpackage auth_driver
*/
class ldapAuthDriver extends jAuthDriverBase implements jIAuthDriver {

    /**
    * default user attributes list
    * @var array
    * @access protected
    */
    protected $_default_attributes = array("cn","distinguishedName","name");

    function __construct($params){

        if (!extension_loaded('ldap')) {
            throw new jException('jelix~auth.ldap.extension.unloaded');
        }

        parent::__construct($params);

        // default ldap parameters
        $_default_params = array(
            'hostname'      =>  'localhost',
            'port'          =>  389,
            'ldapUser'      =>  null,
            'ldapPassword'      =>  null,
            'protocolVersion'   =>  3,
            'uidProperty'       =>  'cn'
        );

        // iterate each default parameter and apply it to actual params if missing in $params.
        foreach($_default_params as $name => $value) {
            if (!isset($this->_params[$name]) || $this->_params[$name] == '') {
                $this->_params[$name] = $value;
            }
        }

        if (!isset($this->_params['searchBaseDN']) || $this->_params['searchBaseDN'] == '') {
            throw new jException('jelix~auth.ldap.search.base.missing');
        }

        if (!isset($this->_params['searchFilter']) || $this->_params['searchFilter'] == '') {
            throw new jException('jelix~auth.ldap.search.filter.missing');
        }

        if (!isset($this->_params['searchAttributes']) || $this->_params['searchAttributes'] == '') {
            $this->_params['searchAttributes'] = $this->_default_attributes;
        } else {
            $this->_params['searchAttributes'] = explode(",", $this->_params['searchAttributes']);
        }
    }

    public function saveNewUser($user){

        if (!is_object($user) || !($user instanceof jAuthUserLDAP)) {
            throw new jException('jelix~auth.ldap.object.user.unknown');
        }

        if (!($user->login != '')) {
            throw new jException('jelix~auth.ldap.user.login.unset');
        }

        $entries = $this->getAttributesLDAP($user);

        $connect = $this->_bindLdapUser();
        if ($connect === false) {
            return false;
        }
        $result = ldap_add($connect, $this->_buildUserDn($user->login), $entries);
        ldap_close($connect);
        return $result;

    }

    public function removeUser($login){

        $connect = $this->_bindLdapUser();
        if ($connect === false) {
            return false;
        }
        $result = ldap_delete($connect, $this->_buildUserDn($login));
        ldap_close($connect);
        return $result;
    }

    public function updateUser($user){

        if (!is_object($user) || !($user instanceof jAuthUserLDAP)) {
            throw new jException('jelix~auth.ldap.object.user.unknown');
        }

        if (!($user->login != '')) {
            throw new jException('jelix~auth.ldap.user.login.unset');
        }

        $entries = $this->getAttributesLDAP($user,true);

        $connect = $this->_bindLdapUser();
        if ($connect === false) {
            return false;
        }
        $result = ldap_modify($connect, $this->_buildUserDn($user->login), $entries);
        ldap_close($connect);

        return $result;
    }

    public function getUser($login){

        $connect = $this->_bindLdapUser();
        if ($connect === false) {
            return false;
        }

        if (($search = ldap_search($connect, $this->_params['searchBaseDN'], $this->_params['uidProperty'].'='.$login,$this->_params['searchAttributes']))) {
            if (($entry = ldap_first_entry($connect, $search))) {
                $attributes = ldap_get_attributes($connect, $entry);
                if($attributes['count']>0){
                    $user = new jAuthUserLDAP();
                    $this->setAttributesLDAP($user, $attributes);
                    $user->login = $login;
                    $user->password = '';
                    ldap_close($connect);
                    return $user;
                }
            }
        }
        ldap_close($connect);

        return false;
    }

    public function createUserObject($login,$password){

        $user = new jAuthUserLDAP();

        $user->login = $login;
        $user->password = $this->cryptPassword($password);
        foreach ($this->_params['searchAttributes'] as $property) {
            $user->$property = '';
        }

        return $user;
    }

    public function getUserList($pattern){

        $users = array();

        $connect = $this->_bindLdapUser();
        if ($connect === false) {
            return $users;
        }
        $filter = ($pattern != '' && $pattern != '%') ? "(&".$this->_params['searchFilter'] . "({$this->_params['uidProperty']}={$pattern}))" : $this->_params['searchFilter'] ;

        if (($search = ldap_search($connect, $this->_params['searchBaseDN'], $filter, $this->_params['searchAttributes']))) {
            ldap_sort($connect, $search, $this->params['uidProperty']);
            $entry = ldap_first_entry($connect, $search);
            while ($entry) {
                $attributes = ldap_get_attributes($connect, $entry);
                if ($attributes['count']>0) {
                    $user = new jAuthUserLDAP();
                    $this->setAttributesLDAP($user, $attributes);
                    $user->password = '';
                    $users[] = $user;
                }
                $entry = ldap_next_entry($connect, $entry);
            }
        }
        ldap_close($connect);

        return $users;
    }

    public function changePassword($login, $newpassword) {

        $entries = array();
        $entries["userpassword"][0] = $this->cryptPassword($newpassword);

        $connect = $this->_bindLdapUser();
        if ($connect === false) {
            return false;
        }
        $result = ldap_mod_replace($connect, $this->_buildUserDn($login), $entries);
        ldap_close($connect);
        return $result;
    }

    public function verifyPassword($login, $password) {

        $connect = $this->_getLinkId();

        if ($connect) {
            //authenticate user
            $bind = @ldap_bind($connect, $this->_buildUserDn($login), $this->cryptPassword($password));

            if ($bind) {
                //get connected user infos
                if ($this->_params['ldapUser'] == '') {
                    $bind = ldap_bind($connect);
                }
                else {
                    $bind = ldap_bind($connect,$this->_params['ldapUser'], $this->_params['ldapPassword']);
                }
                if ($bind) {
                    if (($search = ldap_search($connect, $this->_params['searchBaseDN'], $this->_params['uidProperty'].'='.$login,$this->_params['searchAttributes']))) {
                        if (($entry = ldap_first_entry($connect,$search))) {
                            $attributes = ldap_get_attributes($connect,$entry);
                            if($attributes['count']>0){
                                $user = new jAuthUserLDAP();
                                $this->setAttributesLDAP($user, $attributes);
                                $user->login = $login;
                                $user->password = '';
                                ldap_close($connect);
                                return $user;
                            }
                        }
                    }
                }
            }
            ldap_close($connect);
        }
        return false;
    }

    protected function getAttributesLDAP($user, $update=false) {

        $entries = array();
        $entries["objectclass"][0] = "user";
        $properties = get_object_vars($user);
        foreach ($properties as $property=>$value) {
            switch(strtolower($property)) {
                case 'login':
                    if (!$update) {
                        $entries[$this->_params['uidProperty']][0] = $value;
                        $entries["name"][0] = $value;
                    }
                    break;
                case 'password':
                    if ($value != '') {
                        $entries["userpassword"][0] = $value;
                    }
                    break;
                case 'email':
                    if ($value != '') {
                        $entries["mail"][0] = $value;
                    }
                    break;
                default:
                    if ($value != '') {
                        $entries[$property][0] = $value;
                    }
                    break;
            }
        }
        return $entries;
    }

    protected function setAttributesLDAP(&$user, $attributes) {

        foreach($this->_params['searchAttributes'] as $attribute) {
            if (isset($attributes[$attribute])) {
                array_shift($attributes[$attribute]);
                switch(strtolower($attribute)) {
                    case 'mail':
                        $user->email = $attributes[$attribute];
                        break;
                    case $this->_params['uidProperty']:
                        $user->login = $attributes[$attribute];
                        break;
                    default:
                        $user->$attribute = $attributes[$attribute];
                        break;
                }
            }
        }
    }

    protected function _buildUserDn($login) {
        if ($login) {
            return $this->_params['uidProperty'].'='.$login.",".$this->_params['searchBaseDN'];
        }
        return '';
    }

    protected function _getLinkId() {
        if ($connect = ldap_connect($this->_params['hostname'], $this->_params['port'])) {
            ldap_set_option($connect, LDAP_OPT_PROTOCOL_VERSION, $this->_params['protocolVersion']);
            ldap_set_option($connect, LDAP_OPT_REFERRALS, 0);
            return $connect;
        }
        return false;
    }

    protected function _bindLdapUser() {
        $connect = $this->_getLinkId();
        if (!$connect)
            return false;
        if ($this->_params['ldapUser'] == '') {
            $bind = ldap_bind($connect);
        }
        else {
            $bind = ldap_bind($connect, $this->_params['ldapUser'], $this->_params['ldapPassword']);
        }
        if (!$bind) {
            ldap_close($connect);
            return false;
        }
        return $connect;
    }
}
