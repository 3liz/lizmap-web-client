<?php
/**
 */

/**
 * LDAP authentification driver for authentification information stored in LDAP server
 * and manage user locally with a dao
 *
 *
 *
 * @package    jelix
 * @subpackage auth_driver
 *
 * @internal see https://tools.ietf.org/html/rfc4510
 */
class ldapdaoAuthDriver extends jAuthDriverBase implements jIAuthDriver
{

    /**
     * default user attributes list
     * @var array
     */
    protected $_default_attributes = array(
        "cn"=>"lastname",
        "name"=>"firstname"
    );

    protected $uriConnect = '';

    public function __construct($params)
    {
        if (!extension_loaded('ldap')) {
            throw new jException('ldapdao~errors.extension.unloaded');
        }

        parent::__construct($params);

        if (!isset($this->_params['ldapprofile']) || $this->_params['ldapprofile'] == '') {
            throw new jException('ldapdao~errors.ldap.profile.missing');
        }

        $profile = jProfiles::get('ldap', $this->_params['ldapprofile']);
        $this->_params = array_merge($this->_params, $profile);

        // default ldap parameters
        $_default_params = array(
            'hostname'      =>  'localhost',
            'tlsMode'       => '',
            'port'          =>  389,
            'adminUserDn'      =>  null,
            'adminPassword'      =>  null,
            'protocolVersion'   =>  3,
            'searchUserBaseDN' => '',
            'searchGroupFilter' => '',
            'searchGroupKeepUserInDefaultGroups' => true,
            'searchGroupProperty' => '',
            'searchGroupBaseDN' => ''
        );

        // iterate each default parameter and apply it to actual params if missing in $params.
        foreach ($_default_params as $name => $value) {
            if (!isset($this->_params[$name]) || $this->_params[$name] == '') {
                $this->_params[$name] = $value;
            }
        }

        if ($this->_params['searchUserBaseDN'] == '') {
            throw new jException('ldapdao~errors.search.base.missing');
        }

        if (!isset($this->_params['searchAttributes']) || $this->_params['searchAttributes'] == '') {
            $this->_params['searchAttributes'] = $this->_default_attributes;
        } else {
            $attrs = explode(",", $this->_params['searchAttributes']);
            $this->_params['searchAttributes'] = array();
            foreach ($attrs as $attr) {
                if (strpos($attr, ':') === false) {
                    $attr = trim($attr);
                    $this->_params['searchAttributes'][$attr] = $attr;
                } else {
                    $attr = explode(':', $attr);
                    $this->_params['searchAttributes'][trim($attr[0])] = trim($attr[1]);
                }
            }
        }

        if (!isset($this->_params['searchUserFilter']) || $this->_params['searchUserFilter'] == '') {
            throw new jException('ldapdao~errors.searchUserFilter.missing');
        }
        if (!is_array($this->_params['searchUserFilter'])) {
            $this->_params['searchUserFilter'] = array($this->_params['searchUserFilter']);
        }

        if (!isset($this->_params['bindUserDN']) || $this->_params['bindUserDN'] == '') {
            throw new jException('ldapdao~errors.bindUserDN.missing');
        }
        if (!is_array($this->_params['bindUserDN'])) {
            $this->_params['bindUserDN'] = array($this->_params['bindUserDN']);
        }

        $uri = $this->_params['hostname'];

        if (preg_match('!^ldap(s?)://!', $uri, $m)) { // old way to specify ldaps protocol
            $predefinedPort = '';
            if (preg_match('!:(\d+)/?!', $uri, $mp)) {
                $predefinedPort = $mp[1];
            }
            if (isset($m[1]) && $m[1] == 's') {
                $this->_params['tlsMode'] = 'ldaps';
            }
            elseif ($this->_params['tlsMode'] == 'ldaps') {
                $this->_params['tlsMode'] = 'starttls';
            }
            if ($predefinedPort == '') {
                $uri .= ':'.$this->_params['port'];
            }
            else {
                $this->_params['port'] = $predefinedPort;
            }
            $this->uriConnect = $uri;
        }
        else {
            $uri .= ':'.$this->_params['port'];
            if ($this->_params['tlsMode'] == 'ldaps' || $this->_params['port'] == 636 ) {
                $this->uriConnect = 'ldaps://'.$uri;
                $this->_params['tlsMode'] = 'ldaps';
            }
            else {
                $this->uriConnect = 'ldap://'.$uri;
            }
        }
    }

    public function saveNewUser($user)
    {
        throw new jException("ldapdao~errors.unsupported.user.creation");
    }

    public function removeUser($login)
    {
        $dao = jDao::get($this->_params['dao'], $this->_params['profile']);
        $dao->deleteByLogin($login);
        return true;
    }

    public function updateUser($user)
    {
        if (!is_object($user)) {
            throw new jException('ldapdao~errors.object.user.unknown');
        }

        if ($user->login == '') {
            throw new jException('ldapdao~errors.user.login.unset');
        }

        $dao = jDao::get($this->_params['dao'], $this->_params['profile']);
        $dao->update($user);
        return true;
    }

    public function getUser($login)
    {
        $dao = jDao::get($this->_params['dao'], $this->_params['profile']);
        $user = $dao->getByLogin($login);
        if ($user) {
            return $user;
        }

        $connect = $this->_bindLdapAdminUser();
        if ($connect === false) {
            return false;
        }
        $user = $this->createUserObject($login, '');
        $found = $this->searchLdapUserAttributes($connect, $login, $user);
        ldap_close($connect);
        if (!$found) {
            return false;
        }
        $dao->insert($user);
        return $user;
    }

    public function createUserObject($login, $password)
    {
        $user = jDao::createRecord($this->_params['dao'], $this->_params['profile']);
        $user->login = $login;
        // should not be empty because of a jauth listener that prevent
        // user not having password to login.
        $user->password = '!!ldapdao password!!';
        return $user;
    }

    public function getUserList($pattern)
    {
        $dao = jDao::get($this->_params['dao'], $this->_params['profile']);
        if ($pattern == '%' || $pattern == '') {
            return $dao->findAll();
        } else {
            return $dao->findByLogin($pattern);
        }
    }

    public function changePassword($login, $newpassword)
    {
        if ($login == $this->_params['jelixAdminLogin']) {
            $dao = jDao::get($this->_params['dao'], $this->_params['profile']);
            return $dao->updatePassword($login, $this->cryptPassword($newpassword));
        }

        throw new jException('ldapdao~errors.unsupported.password.change');
    }

    public function verifyPassword($login, $password)
    {
        $dao = jDao::get($this->_params['dao'], $this->_params['profile']);

        if ($login == $this->_params['jelixAdminLogin']) {
            $user = $dao->getByLogin($login);
            return $this->checkAdminLogin($user, $dao, $password);
        }

        if (trim($password) == '' || trim($login) == '') {
            // we don't want Unauthenticated Authentication
            // and Anonymous Authentication
            // https://tools.ietf.org/html/rfc4513#section-5.1
            return false;
        }

        $connectAdmin = $this->_bindLdapAdminUser();
        if (!$connectAdmin) {
            return false;
        }

        // see if the user exists into the ldap directory
        $user = $this->createUserObject($login, '');
        $userLdapAttributes = $this->searchLdapUserAttributes($connectAdmin, $login, $user);
        if ($userLdapAttributes === false) {
            return false;
        }

        $connect = $this->_getLinkId();
        if (!$connect) {
            return false;
        }
        // authenticate user. let's try with all configured DN
        $userDn = $this->bindUser($connect, $userLdapAttributes, $user->login, $password);
        ldap_close($connect);

        if ($userDn === false) {
            jLog::log('ldapdao error: cannot authenticate to ldap with given bindUserDN for the login "' . $login. '". Wrong DN or password', 'auth');
            foreach ($this->bindUserDnTries as $dn) {
                jLog::log('ldapdao: tried to connect with bindUserDN=' . $dn, 'auth');
            }
            return false;
        }

        // check if he is in our database
        $userDb = $dao->getByLogin($user->login);
        if (!$userDb) {
            if (jApp::isModuleEnabled('jcommunity')) {
                $user->status = 1; // STATUS_VALID
            }
            $dao->insert($user);
            $eventResp = jEvent::notify('AuthNewUser', array('user' => $user));
            $allResponses = array();
            if ($eventResp->inResponse('doUpdate', true, $allResponses)) {
                $dao->update($user);
            }
        }
        else {
            $user = $userDb;
        }

        // retrieve the user group (if relevant)
        $userGroups = $this->searchUserGroups($connectAdmin, $userDn, $userLdapAttributes, $user->login);
        ldap_close($connectAdmin);
        if ($userGroups !== false) {
            // the user is at least in a ldap group, so we synchronize ldap groups
            // with jAcl2 groups
            $this->synchronizeAclGroups($user->login, $userGroups);
        }
        return $user;
    }

    protected function synchronizeAclGroups($login, $userGroups)
    {
        if ($this->_params['searchGroupKeepUserInDefaultGroups']) {
            // Add default groups
            $gplist = jDao::get('jacl2db~jacl2group', 'jacl2_profile')
                ->getDefaultGroups();
            foreach ($gplist as $group) {
                $idx = array_search($group->name, $userGroups);
                if ($idx === false) {
                    $userGroups[] = $group->name;
                }
            }
        }

        // we know the user group: we should be sure it is the same in jAcl2
        $gplist = jDao::get('jacl2db~jacl2groupsofuser', 'jacl2_profile')
            ->getGroupsUser($login);
        $groupsToRemove = array();
        foreach ($gplist as $group) {
            if ($group->grouptype == 2) { // private group
                continue;
            }
            $idx = array_search($group->name, $userGroups);
            if ($idx !== false) {
                unset($userGroups[$idx]);
            } else {
                $groupsToRemove[] = $group->name;
            }
        }
        foreach ($groupsToRemove as $group) {
            jAcl2DbUserGroup::removeUserFromGroup($login, $group);
        }
        foreach ($userGroups as $newGroup) {
            if (jAcl2DbUserGroup::getGroup($newGroup)) {
                jAcl2DbUserGroup::addUserToGroup($login, $newGroup);
            }
        }
    }

    /**
     * @return string[]|false  ldap attributes or false if not found
     */
    protected function searchLdapUserAttributes($connect, $login, $user)
    {
        $searchAttributes = array_keys($this->_params['searchAttributes']);
        $filters = array();
        foreach ($this->_params['searchUserFilter'] as $searchUserFilter) {
            $filter = str_replace(
                array('%%LOGIN%%', '%%USERNAME%%'), // USERNAME deprecated
                $login,
                $searchUserFilter
            );
            $search = @ldap_search(
                $connect,
                $this->_params['searchUserBaseDN'],
                $filter,
                $searchAttributes
            );
            if (!$search) {
                $this->logLdapError($connect, 'ldap error during search of the user "'.$login.'" with the filter "'.$filter.'"');
            }
            else if (($entry = @ldap_first_entry($connect, $search))) {
                $attributes = ldap_get_attributes($connect, $entry);
                return $this->readLdapAttributes($attributes, $user);
            }
            else {
                $filters[] = $filter;
            }
        }
        jLog::log('ldapdao error: ldap user "'.$login.'" not found with the filters :"'.implode('", "', $filters).'"', 'auth');
        return false;
    }

    protected $bindUserDnTries = array();

    protected function bindUser($connect, $userAttributes, $login, $password)
    {
        $bind = false;
        $this->bindUserDnTries = array();
        foreach ($this->_params['bindUserDN'] as $dn) {
            if (preg_match('/^\\$\w+$/', trim($dn))) {
                $dnAttribute = substr($dn, 1);
                if (isset($userAttributes[$dnAttribute])) {
                    $realDn = $userAttributes[$dnAttribute];
                } else {
                    continue;
                }
            } elseif (preg_match_all('/(\w+)=%\?%/', $dn, $m)) {
                $realDn = $dn;
                foreach ($m[1] as $k => $attr) {
                    if (isset($userAttributes[$attr])) {
                        $realDn = str_replace($m[0][$k], $attr.'='.$userAttributes[$attr], $realDn);
                    } else {
                        continue 2;
                    }
                }
            } else {
                $realDn = str_replace(
                    array('%%LOGIN%%', '%%USERNAME%%'), // USERNAME deprecated
                    $login,
                    $dn
                );
            }
            $bind = @ldap_bind($connect, $realDn, $password);
            if ($bind) {
                break;
            } else {
                $this->bindUserDnTries[] = $this->getLdapError($connect, 'tried to connect with "'.$realDn.'"');
            }
        }
        return ($bind ? $realDn : false);
    }

    protected function checkAdminLogin($user, $dao, $password)
    {
        if (!$user) {
            return false;
        }

        $result = $this->checkPassword($password, $user->password);

        if ($result === false) {
            jLog::log('ldapdao: given admin user password is wrong', 'auth');
            return false;
        }

        if ($result !== true) {
            // it is a new hash for the password, let's update it persistently
            $user->password = $result;
            $dao->updatePassword($this->_params['jelixAdminLogin'], $result);
        }
        return $user;
    }

    protected function readLdapAttributes($attributes, $user)
    {
        $mapping = $this->_params['searchAttributes'];
        $ldapAttributes = array();
        foreach ($attributes as $ldapAttr => $attr) {
            if (isset($attr['count']) && $attr['count'] > 0) {
                if ($attr['count'] > 1) {
                    $val = array_shift($attr);
                } else {
                    $val = $attr[0];
                }
                $ldapAttributes[$ldapAttr] = $val;
                if (isset($mapping[$ldapAttr])) {
                    $objAttr = $mapping[$ldapAttr];
                    unset($mapping[$ldapAttr]);
                    if ($objAttr != '') {
                        $user->$objAttr = $val;
                    }
                }
            }
        }

        foreach ($mapping as $ldapAttr => $objAttr) {
            if ($objAttr != '' && !isset($user->$objAttr)) {
                $user->$objAttr = '';
            }
        }
        return $ldapAttributes;
    }

    protected function searchUserGroups($connect, $userDn, $userLdapAttributes, $login)
    {
        // Do not search for groups if no group filter passed
        // Usefull to forbid the driver to sync groups from LDAP and loose all related groups for the user
        if ($this->_params['searchGroupFilter'] == '') {
            return false;
        }

        $searchStr = array_keys($userLdapAttributes);
        $searchStr[] = 'USERDN';
        $searchStr[] = 'LOGIN';
        $searchStr[] = 'USERNAME'; // USERNAME deprecated
        $searchStr = array_map(function ($val) {
            return '%%'.$val.'%%';
        }, $searchStr);
        $values = array_values($userLdapAttributes);
        // escape parenthesis
        $values = array_map(function ($val) {
            return str_replace(
                array('(', ')'),
                array('\\(', '\\)'),
                $val
            );
         }, $values);
        $values[] = $userDn;
        $values[] = $login;
        $values[] = $login;

        $filter = str_replace(
            $searchStr,
            $values,
            $this->_params['searchGroupFilter']
        );
        $grpProp = $this->_params['searchGroupProperty'];

        $groups = array();
        $search = @ldap_search (
            $connect,
            $this->_params['searchGroupBaseDN'],
            $filter,
            array($grpProp)
        );
        if ($search) {
            $entry = @ldap_first_entry($connect, $search);
            if ($entry) {
                do {
                    $attributes = ldap_get_attributes($connect, $entry);
                    if (isset($attributes[$grpProp]) && $attributes[$grpProp]['count'] > 0) {
                        $groups[] = $attributes[$grpProp][0];
                    }
                } while ($entry = ldap_next_entry($connect, $entry));
            }
            else {
                jLog::log('ldapdao: no groups found for the user  "'.$login.'", with the searchGroupFilter query "'.$filter.'"', 'auth');
            }
        }
        else {
            $this->logLdapError($connect, 'ldap error during group search for "'.$login.'", with the searchGroupFilter query "'.$filter.'"');
        }
        return $groups;
    }

    /**
     * open the connection to the ldap server
     */
    protected function _getLinkId()
    {
        if ($connect = @ldap_connect($this->uriConnect)) {
            //ldap_set_option(NULL, LDAP_OPT_DEBUG_LEVEL, 7);
            ldap_set_option($connect, LDAP_OPT_PROTOCOL_VERSION, $this->_params['protocolVersion']);
            ldap_set_option($connect, LDAP_OPT_REFERRALS, 0);

            if ($this->_params['tlsMode'] == 'starttls') {
                if (!@ldap_start_tls($connect)) {
                    $this->logLdapError($connect, 'connection error: impossible to start TLS connection');
                    return false;
                }
            }
            return $connect;
        }
        jLog::log('ldapdao error: ldap error, bad syntax in the given uri "'.$this->uriConnect.'"', 'auth');
        return false;
    }

    /**
     * open the connection to the ldap server
     * and bind to the admin user
     * @return resource|false the ldap connection
     */
    protected function _bindLdapAdminUser()
    {
        $connect = $this->_getLinkId();
        if (!$connect) {
            return false;
        }

        if ($this->_params['adminUserDn'] == '') {
            $bind = @ldap_bind($connect);
        } else {
            $bind = @ldap_bind($connect, $this->_params['adminUserDn'], $this->_params['adminPassword']);
        }
        if (!$bind) {
            if ($this->_params['adminUserDn'] == '') {
                jLog::log('ldapdao error: authenticating to the ldap with an anonymous admin user is not supported', 'auth');
            } else {
                jLog::log('ldapdao error: impossible to authenticate to ldap with the admin user '.$this->_params['adminUserDn'], 'auth');
            }
            ldap_close($connect);
            return false;
        }
        return $connect;
    }

    protected function getLdapError($connect, $contextMessage)
    {
        $message = "ldapdao error: $contextMessage \n";
        $message .= "\tldap error " . ldap_errno($connect) . ':' . ldap_error($connect);
        if (@ldap_get_option($connect, LDAP_OPT_DIAGNOSTIC_MESSAGE, $diagnostic)) {
            $message .= "\n\t" . $diagnostic;
        }
        return $message;
    }

    protected function logLdapError($connect, $contextMessage)
    {
        jLog::log($this->getLdapError($connect, $contextMessage), 'auth');
    }

}
