<?php
/**
 * @package     jelix
 * @subpackage  acl
 *
 * @author      Laurent Jouanneau
 * @contributor Adrien Lagroy de Croutte
 *
 * @copyright   2006-2021 Laurent Jouanneau, 2020 Adrien Lagroy de Croutte
 *
 * @see        http://www.jelix.org
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 *
 * @since 1.6.31
 */

/**
 * Allow to verify admin rights when a change occurs in the authorizations.
 *
 * @package     jelix
 * @subpackage  acl
 */
class jAcl2DbAdminCheckAuthorizations
{
    public static $ACL_ADMIN_RIGHTS = array(
        'acl.group.view',
        'acl.group.modify',
        'acl.group.delete',
        'acl.user.view',
        'acl.user.modify',
    );

    /**
     * result of the checking : admin rights are ok to manage authorizations.
     *
     * There is at least one user having admin rights to manage authorizations
     *
     * @var int
     */
    const ACL_ADMIN_RIGHTS_STILL_USED = 0;

    /**
     * result of the checking : nobody have one of the admin rights.
     *
     * There is no user having all admin rights to manage authorizations
     *
     * @var int
     */
    const ACL_ADMIN_RIGHTS_NOT_ASSIGNED = 1;

    /**
     * result of the checking : the current user loose one of admin rights.
     *
     * The current user tries to remove some admin rights to manage authorizations,
     * although he is the only one user having them.
     *
     * @var int
     */
    const ACL_ADMIN_RIGHTS_SESSION_USER_LOOSE_THEM = 2;

    /**
     * @var null|string
     */
    protected $sessionUser;

    /**
     * @var array number of authorizations for each admin rights during a checking
     */
    protected $authorizationStats = array();

    /**
     * @var array number of authorizations for each admin rights during a checking
     *            of the user session
     */
    protected $sessionUserAuthorizationStats = array();

    /**
     * @var array list of rights that will be changed
     */
    protected $authorizationsChanges = array();

    /**
     * @param string $sessionUser the login of the user who initiates the change
     */
    public function __construct($sessionUser = null)
    {
        $this->sessionUser = $sessionUser;
    }

    /**
     * initialize some properties and do a query on rights.
     *
     * @return bool|jDbResultSet the resultset of the SQL query
     */
    protected function initChecks()
    {
        // number of user for each admin  rights
        $this->authorizationStats = array_combine(
            self::$ACL_ADMIN_RIGHTS,
            array_fill(0, count(self::$ACL_ADMIN_RIGHTS), 0)
        );
        $this->sessionUserAuthorizationStats = $this->authorizationStats;

        $db = jDb::getConnection('jacl2_profile');

        $sql = 'SELECT u.login, g.id_aclgrp, r.id_aclsbj, canceled, g.grouptype, g.ownerlogin
            FROM '.$db->prefixTable('jacl2_user_group').' u
            INNER JOIN '.$db->prefixTable('jacl2_group').' g
                ON (u.id_aclgrp = g.id_aclgrp)                 
            LEFT OUTER JOIN '.$db->prefixTable('jacl2_rights').' r
                ON (r.id_aclgrp = g.id_aclgrp AND r.id_aclsbj IN ('.
               implode(',', array_map(function ($role) use ($db) {
                   return $db->quote($role);
               }, self::$ACL_ADMIN_RIGHTS)).'))
            ORDER BY u.login, g.id_aclgrp';

        return $db->query($sql);
    }

    /**
     * @param int $changeType
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constants
     */
    protected function finalChecking($changeType)
    {
        if ($this->sessionUser) {
            // depending of what the session user changed, we should check
            // rights that were allowed to do these changes
            $sessionRights = array();
            if ($changeType & 1) {
                $sessionRights[] = 'acl.group.view';
                $sessionRights[] = 'acl.group.modify';
            }

            if ($changeType & 4) {
                $sessionRights[] = 'acl.group.view';
                $sessionRights[] = 'acl.group.delete';
            }

            if ($changeType & 2) {
                $sessionRights[] = 'acl.user.view';
                $sessionRights[] = 'acl.user.modify';
            }

            foreach ($sessionRights as $right) {
                if ($this->sessionUserAuthorizationStats[$right] == 0) {
                    return self::ACL_ADMIN_RIGHTS_SESSION_USER_LOOSE_THEM;
                }
            }
        }

        // if there was right that anybody owns, these is an issue.
        foreach ($this->authorizationStats as $count) {
            if ($count == 0) {
                return self::ACL_ADMIN_RIGHTS_NOT_ASSIGNED;
            }
        }

        return self::ACL_ADMIN_RIGHTS_STILL_USED;
    }

    /**
     * Gives the authorization of the given right on the given group
     * among the authorizations changes.
     *
     * @param $groupId
     * @param $right
     *
     * @return null|bool|string
     */
    protected function getAuthorizationChange($groupId, $right)
    {
        if (isset($this->authorizationsChanges[$groupId][$right])) {
            $authorization = $this->authorizationsChanges[$groupId][$right];
            if (is_string($authorization)) {
                // if we've got a string, let's change it to a bool
                // to avoid to compare again with the next user
                if ($authorization == 'y' || $authorization === true) {
                    $authorization = true;
                } elseif ($authorization == 'n' || $authorization === false) {
                    $authorization = false;
                } else {
                    $authorization = null;
                }
                $this->authorizationsChanges[$groupId][$right] = $authorization;
            }
        } else {
            $authorization = null;
        }

        return $authorization;
    }

    /**
     * Checks if given authorizations changes still allow to administrate rights
     * for at least one user.
     *
     * For each groups, only authorizations on given rights are considered changed.
     * Other existing authorizations are considered as deleted.
     *
     * Authorizations with resources are not changed.
     *
     * @param array $authorizationsChanges array(<id_aclgrp> => array( <id_aclsbj> => false(inherit)/''(inherit)/true(add)/'y'(add)/'n'(remove)))
     * @param int   $changeType            1 for group rights change, 2 for user rights change, 3 for both
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constant
     */
    public function checkAclAdminAuthorizationsChanges($authorizationsChanges, $changeType)
    {
        $rs = $this->initChecks();
        $this->authorizationsChanges = &$authorizationsChanges;

        // 'subject'=>true/false
        $currentUserItemAuthorizations = array();
        $currentGroupItemAuthorizations = array();
        $currentUserItem = '';
        $currentGroupItem = '';

        foreach ($rs as $rec) {
            if ($rec->id_aclgrp != $currentGroupItem) {

                // check if there are changes to apply for this group
                if (isset($this->authorizationsChanges[$currentGroupItem])) {
                    foreach (self::$ACL_ADMIN_RIGHTS as $right) {
                        $authorization = $this->getAuthorizationChange(
                            $currentGroupItem,
                            $right
                        );

                        $currentGroupItemAuthorizations[$right] = $authorization;
                    }
                }

                foreach ($currentGroupItemAuthorizations as $right => $authorization) {
                    if ($authorization !== null
                        && (!isset($currentUserItemAuthorizations[$right])
                            || $currentUserItemAuthorizations[$right] !== false)) {
                        $currentUserItemAuthorizations[$right] = $authorization;
                    }
                }

                $currentGroupItemAuthorizations = array();
                $currentGroupItem = $rec->id_aclgrp;
            }

            if ($rec->login != $currentUserItem) {

                // new user in the list, we process data of the previous user
                foreach ($currentUserItemAuthorizations as $right => $authorization) {
                    if ($authorization === true) {
                        ++$this->authorizationStats[$right];

                        if ($currentUserItem == $this->sessionUser) {
                            ++$this->sessionUserAuthorizationStats[$right];
                        }
                    }
                }
                $currentUserItemAuthorizations = array();
                $currentUserItem = $rec->login;
            }

            if ($rec->id_aclsbj) {
                $authorization = ($rec->canceled == '0');
                $currentGroupItemAuthorizations[$rec->id_aclsbj] = $authorization;
            }
        }
        // final process of the last record
        if ($currentUserItem != '') {
            if ($currentGroupItem) {
                // check if there are changes to apply for this group
                if (isset($this->authorizationsChanges[$currentGroupItem])) {
                    foreach (self::$ACL_ADMIN_RIGHTS as $right) {
                        $authorization = $this->getAuthorizationChange(
                            $currentGroupItem,
                            $right
                        );

                        $currentGroupItemAuthorizations[$right] = $authorization;
                    }
                }

                foreach ($currentGroupItemAuthorizations as $right => $authorization) {
                    if ($authorization !== null
                        && (!isset($currentUserItemAuthorizations[$right])
                            || $currentUserItemAuthorizations[$right] !== false)) {
                        $currentUserItemAuthorizations[$right] = $authorization;
                    }
                }
            }

            foreach ($currentUserItemAuthorizations as $right => $authorization) {
                if ($authorization === true) {
                    ++$this->authorizationStats[$right];
                    if ($currentUserItem == $this->sessionUser) {
                        ++$this->sessionUserAuthorizationStats[$right];
                    }
                }
            }
        }

        return $this->finalChecking($changeType);
    }

    /**
     * check if the removing of the given user still allow to administrate authorizations
     * for at least one user.
     *
     * @param string $userToRemove
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constant
     */
    public function checkAclAdminRightsToRemoveUser($userToRemove)
    {
        $rs = $this->initChecks();
        // 'subject'=>true/false
        $currentUserItemAuthorizations = array();
        $currentUserItem = '';

        foreach ($rs as $rec) {
            if ($rec->login != $currentUserItem) {
                // new user in the list, we process data of the previous user

                // we ignore any authorization from the user to remove and from his private group
                if ($currentUserItem != $userToRemove) {
                    foreach ($currentUserItemAuthorizations as $right => $authorization) {
                        if ($authorization === true) {
                            ++$this->authorizationStats[$right];
                            if ($currentUserItem == $this->sessionUser) {
                                ++$this->sessionUserAuthorizationStats[$right];
                            }
                        }
                    }
                }
                $currentUserItemAuthorizations = array();
                $currentUserItem = $rec->login;
            }

            if ($currentUserItem != $userToRemove && $rec->id_aclsbj) {
                // we ignore any authorization from the user to remove and from his private group

                $authorization = ($rec->canceled == '0');

                // we should record the authorization only if the new authorization
                // is not "inherited" (null) and if the current authorization
                // for this user/right is not false (forbidden)
                if ($authorization !== null
                    && (!isset($currentUserItemAuthorizations[$rec->id_aclsbj])
                        || $currentUserItemAuthorizations[$rec->id_aclsbj] !== false)) {
                    $currentUserItemAuthorizations[$rec->id_aclsbj] = $authorization;
                }
            }
        }
        // final process of the last record
        if ($currentUserItem != '' && $currentUserItem != $userToRemove) {
            foreach ($currentUserItemAuthorizations as $right => $authorization) {
                if ($authorization === true) {
                    ++$this->authorizationStats[$right];
                    if ($currentUserItem == $this->sessionUser) {
                        ++$this->sessionUserAuthorizationStats[$right];
                    }
                }
            }
        }

        return $this->finalChecking(1);
    }

    /**
     * check if the removing of the given user from a the given group still
     * allows to administrate rights for at least one user.
     *
     * @param string $userToRemoveFromTheGroup
     * @param string $groupFromWhichToRemoveTheUser
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constant
     */
    public function checkAclAdminRightsToRemoveUserFromGroup(
        $userToRemoveFromTheGroup,
        $groupFromWhichToRemoveTheUser
    ) {
        $rs = $this->initChecks();
        // 'subject'=>true/false
        $currentUserItemAuthorizations = array();
        $currentUserItem = '';

        foreach ($rs as $rec) {
            if ($rec->login != $currentUserItem) {
                // new user in the list, we process data of the previous user
                foreach ($currentUserItemAuthorizations as $right => $authorization) {
                    if ($authorization === true) {
                        ++$this->authorizationStats[$right];
                        if ($currentUserItem == $this->sessionUser) {
                            ++$this->sessionUserAuthorizationStats[$right];
                        }
                    }
                }
                $currentUserItemAuthorizations = array();
                $currentUserItem = $rec->login;
            }

            $processRecord = !($currentUserItem == $userToRemoveFromTheGroup &&
                               $rec->id_aclgrp == $groupFromWhichToRemoveTheUser);
            if ($processRecord && $rec->id_aclsbj) {
                // we ignore any authorization from the user to remove from the given group

                $authorization = ($rec->canceled == '0');

                // we should record the authorization only if the new authorization
                // is not "inherited" (null) and if the current authorization
                // for this user/right is not false (forbidden)
                if ($authorization !== null
                    && (!isset($currentUserItemAuthorizations[$rec->id_aclsbj])
                        || $currentUserItemAuthorizations[$rec->id_aclsbj] !== false)) {
                    $currentUserItemAuthorizations[$rec->id_aclsbj] = $authorization;
                }
            }
        }

        // final process of the last record
        if ($currentUserItem != '') {
            foreach ($currentUserItemAuthorizations as $right => $authorization) {
                if ($authorization === true) {
                    ++$this->authorizationStats[$right];
                    if ($currentUserItem == $this->sessionUser) {
                        ++$this->sessionUserAuthorizationStats[$right];
                    }
                }
            }
        }

        return $this->finalChecking(1);
    }

    protected function loadGroupAuthorizations($group)
    {
        $authorizations = array_combine(
            self::$ACL_ADMIN_RIGHTS,
            array_fill(0, count(self::$ACL_ADMIN_RIGHTS), null)
        );

        $db = jDb::getConnection('jacl2_profile');

        $sql = 'SELECT id_aclsbj, canceled
            FROM '.$db->prefixTable('jacl2_rights').'
            WHERE id_aclsbj IN ('.
               implode(',', array_map(function ($role) use ($db) {
                   return $db->quote($role);
               }, self::$ACL_ADMIN_RIGHTS)).')
            AND id_aclgrp ='.$db->quote($group);

        $rs = $db->query($sql);
        foreach ($rs as $rec) {
            $authorizations[$rec->id_aclsbj] = ($rec->canceled == '0');
        }

        return $authorizations;
    }

    /**
     * check if the adding of the given user to the the given group still
     * allows to administrate rights for at least one user.
     *
     * (because the group may forbid to administrate rights.)
     *
     * @param string $userToAdd              the user login
     * @param string $groupInWhichToAddAUser the group id
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constant
     */
    public function checkAclAdminRightsToAddUserIntoGroup(
        $userToAdd,
        $groupInWhichToAddAUser
    ) {
        $rs = $this->initChecks();
        // 'subject'=>true/false
        $currentUserItemAuthorizations = array();
        $currentUserItem = '';
        $authorizationsOfGroup = $this->loadGroupAuthorizations($groupInWhichToAddAUser);

        foreach ($rs as $rec) {
            if ($rec->login != $currentUserItem) {
                // new user in the list, we process data of the previous user

                if ($currentUserItem == $userToAdd) {
                    // we add authorizations of the group in which the user should be added

                    foreach ($authorizationsOfGroup as $right => $authorization) {
                        // we should record the authorization only if the new authorization
                        // is not "inherited" (null) and if the current authorization
                        // for this user/right is not false (forbidden)
                        if ($authorization !== null
                            && (!isset($currentUserItemAuthorizations[$right])
                                || $currentUserItemAuthorizations[$right] !== false)) {
                            $currentUserItemAuthorizations[$right] = $authorization;
                        }
                    }
                }

                foreach ($currentUserItemAuthorizations as $right => $authorization) {
                    if ($authorization === true) {
                        ++$this->authorizationStats[$right];
                        if ($currentUserItem == $this->sessionUser) {
                            ++$this->sessionUserAuthorizationStats[$right];
                        }
                    }
                }

                $currentUserItemAuthorizations = array();
                $currentUserItem = $rec->login;
            }

            if ($rec->id_aclsbj) {
                $authorization = ($rec->canceled == '0');

                // we should record the authorization only if the new authorization
                // is not "inherited" (null) and if the current authorization
                // for this user/right is not false (forbidden)
                if ($authorization !== null
                    && (!isset($currentUserItemAuthorizations[$rec->id_aclsbj])
                        || $currentUserItemAuthorizations[$rec->id_aclsbj] !== false)) {
                    $currentUserItemAuthorizations[$rec->id_aclsbj] = $authorization;
                }
            }
        }
        // final process of the last record
        if ($currentUserItem != '') {
            if ($currentUserItem == $userToAdd) {
                // we add authorizations of the group in which the user should be added
                foreach ($authorizationsOfGroup as $right => $authorization) {

                    // we should record the authorization only if the new authorization
                    // is not "inherited" (null) and if the current authorization
                    // for this user/right is not false (forbidden)
                    if ($authorization !== null
                        && (!isset($currentUserItemAuthorizations[$right])
                            || $currentUserItemAuthorizations[$right] !== false)) {
                        $currentUserItemAuthorizations[$right] = $authorization;
                    }
                }
            }

            foreach ($currentUserItemAuthorizations as $right => $authorization) {
                if ($authorization === true) {
                    ++$this->authorizationStats[$right];
                    if ($currentUserItem == $this->sessionUser) {
                        ++$this->sessionUserAuthorizationStats[$right];
                    }
                }
            }
        }

        return $this->finalChecking(1);
    }

    /**
     * check if the removing of the given group still
     * allows to administrate rights for at least one user.
     *
     *
     * @param string $groupToRemove the group id to remove
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constant
     */
    public function checkAclAdminRightsToRemoveGroup($groupToRemove)
    {
        $rs = $this->initChecks();

        // 'subject'=>true/false
        $currentUserItemAuthorizations = array();
        $currentUserItem = '';
        $currentGroupItem = '';

        foreach ($rs as $rec) {
            if ($rec->login != $currentUserItem) {
                // new user in the list, we process data of the previous user

                // we ignore any authorization from the group we want to remove
                if ($currentGroupItem != $groupToRemove) {
                    foreach ($currentUserItemAuthorizations as $right => $authorization) {
                        if ($authorization === true) {
                            ++$this->authorizationStats[$right];
                            if ($currentUserItem == $this->sessionUser) {
                                ++$this->sessionUserAuthorizationStats[$right];
                            }
                        }
                    }
                }

                $currentUserItemAuthorizations = array();
                $currentUserItem = $rec->login;
            }

            $currentGroupItem = $rec->id_aclgrp;
            if ($rec->id_aclgrp != $groupToRemove && $rec->id_aclsbj) {
                // we ignore any authorization from the group to remove

                $authorization = ($rec->canceled == '0');

                // we should record the authorization only if the new authorization
                // is not "inherited" (null) and if the current authorization
                // for this user/right is not false (forbidden)
                if ($authorization !== null
                    && (!isset($currentUserItemAuthorizations[$rec->id_aclsbj])
                        || $currentUserItemAuthorizations[$rec->id_aclsbj] !== false)) {
                    $currentUserItemAuthorizations[$rec->id_aclsbj] = $authorization;
                }
            }
        }
        // final process of the last record
        if ($currentUserItem != '' && $currentGroupItem != $groupToRemove) {
            foreach ($currentUserItemAuthorizations as $right => $authorization) {
                if ($authorization === true) {
                    ++$this->authorizationStats[$right];
                    if ($currentUserItem == $this->sessionUser) {
                        ++$this->sessionUserAuthorizationStats[$right];
                    }
                }
            }
        }

        return $this->finalChecking(4);
    }
}
