<?php
/**
 * @package     jelix
 * @subpackage  acl
 * @author      Laurent Jouanneau
 * @contributor Adrien Lagroy de Croutte
 * @copyright   2006-2021 Laurent Jouanneau, 2020 Adrien Lagroy de Croutte
 * @link        http://www.jelix.org
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 * @since 1.1
 */


/**
 * This class is used to manage rights. Works only with db driver of jAcl2.
 * @package     jelix
 * @subpackage  acl
 * @static
 */
class jAcl2DbManager {

    static $ACL_ADMIN_RIGHTS = array(
        'acl.group.view',
        'acl.group.modify',
        'acl.group.delete',
        'acl.user.view',
        'acl.user.modify'
    );

    /**
     * @internal The constructor is private, because all methods are static
     */
    private function __construct (){ }

    /**
     * add a right on the given subject/group/resource
     * @param string    $group the group id.
     * @param string $subject the key of the subject
     * @param string $resource the id of a resource
     * @return boolean  true if the right is set
     */
    public static function addRight($group, $subject, $resource='-'){
        $sbj = jDao::get('jacl2db~jacl2subject', 'jacl2_profile')->get($subject);
        if (!$sbj) {
            return false;
        }

        if(empty($resource)) {
            $resource = '-';
        }

        //  add the new value
        $daoright = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
        $right = $daoright->get($subject,$group,$resource);
        if (!$right) {
            $right = jDao::createRecord('jacl2db~jacl2rights', 'jacl2_profile');
            $right->id_aclsbj = $subject;
            $right->id_aclgrp = $group;
            $right->id_aclres = $resource;
            $right->canceled = 0;
            $daoright->insert($right);
        }
        else if ($right->canceled) {
            $right->canceled = false;
            $daoright->update($right);
        }
        jAcl2::clearCache();
        return true;
    }

    /**
     * remove a right on the given subject/group/resource. The given right for this group will then
     * inherit from other groups if the user is in multiple groups of users.
     * @param string    $group the group id.
     * @param string $subject the key of the subject
     * @param string $resource the id of a resource
     * @param boolean $canceled true if the removing is to cancel a right, instead of an inheritance
     */
    public static function removeRight($group, $subject, $resource='-', $canceled = false){
        if(empty($resource))
            $resource = '-';

        $daoright = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');
        if ($canceled) {
            $right = $daoright->get($subject,$group,$resource);
            if(!$right){
                $right = jDao::createRecord('jacl2db~jacl2rights', 'jacl2_profile');
                $right->id_aclsbj = $subject;
                $right->id_aclgrp = $group;
                $right->id_aclres = $resource;
                $right->canceled = $canceled;
                $daoright->insert($right);
            }
            else if ($right->canceled != $canceled) {
                $right->canceled = $canceled;
                $daoright->update($right);
            }
        }
        else {
            $daoright->delete($subject,$group,$resource);
        }
        jAcl2::clearCache();
    }

    /**
     * Set all rights on the given group.
     *
     * Only rights on given subjects are changed.
     * Existing rights not given in parameters are deleted from the group (i.e: marked as inherited).
     *
     * Rights with resources are not changed.
     * @param string    $group the group id.
     * @param array  $rights list of rights key=subject, value=false(inherit)/''(inherit)/true(add)/'y'(add)/'n'(remove)
     */
    public static function setRightsOnGroup($group, $rights){
        $dao = jDao::get('jacl2db~jacl2rights', 'jacl2_profile');

        // retrieve old rights.
        $oldrights = array();
        $rs = $dao->getRightsByGroup($group);
        foreach($rs as $rec){
            $oldrights [$rec->id_aclsbj] = ($rec->canceled?'n':'y');
        }

        // set new rights.  we modify $oldrights in order to have
        // only deprecated rights in $oldrights
        foreach($rights as $sbj=>$val) {
            if ($val === '' || $val == false) {
                // remove
            }
            else if ($val === true || $val == 'y') {
                self::addRight($group, $sbj);
                unset($oldrights[$sbj]);
            }
            else if ($val == 'n') {
                // cancel
                if (isset($oldrights[$sbj]))
                    unset($oldrights[$sbj]);
                self::removeRight($group, $sbj, '', true);
            }
        }

        if (count($oldrights)) {
            // $oldrights contains now rights to remove
            $dao->deleteByGroupAndSubjects($group, array_keys($oldrights));
        }

        jAcl2::clearCache();
    }

    /**
     * remove the right on the given subject/resource, for all groups
     * @param string  $subject the key of the subject
     * @param string $resource the id of a resource
     */
    public static function removeResourceRight($subject, $resource){
        if(empty($resource))
            $resource = '-';
        jDao::get('jacl2db~jacl2rights', 'jacl2_profile')->deleteBySubjRes($subject, $resource);
        jAcl2::clearCache();
    }

    /**
     * create a new subject
     * @param string  $subject the key of the subject
     * @param string $label_key the key of a locale which represents the label of the subject
     * @param string $subjectGroup the id of the group where the subject is attached to
     */
    public static function addSubject($subject, $label_key, $subjectGroup=null){
        $dao = jDao::get('jacl2db~jacl2subject','jacl2_profile');
        if ($dao->get($subject)) {
            return;
        }
        $subj = jDao::createRecord('jacl2db~jacl2subject','jacl2_profile');
        $subj->id_aclsbj = $subject;
        $subj->label_key = $label_key;
        $subj->id_aclsbjgrp = $subjectGroup;
        $dao->insert($subj);
        jAcl2::clearCache();
    }

    /**
     * Delete the given subject
     * @param string  $subject the key of the subject
     */
    public static function removeSubject($subject){
        jDao::get('jacl2db~jacl2rights','jacl2_profile')->deleteBySubject($subject);
        jDao::get('jacl2db~jacl2subject','jacl2_profile')->delete($subject);
        jAcl2::clearCache();
    }

    /**
     * Create a new subject group
     * @param string  $subjectGroup the key of the subject group
     * @param string $label_key the key of a locale which represents the label of the subject group
     * @since 1.3
     */
    public static function addSubjectGroup($subjectGroup, $label_key){
        $dao = jDao::get('jacl2db~jacl2subjectgroup','jacl2_profile');
        if ($dao->get($subjectGroup)) {
            return;
        }
        $subj = jDao::createRecord('jacl2db~jacl2subjectgroup','jacl2_profile');
        $subj->id_aclsbjgrp = $subjectGroup;
        $subj->label_key = $label_key;
        $dao->insert($subj);
        jAcl2::clearCache();
    }

    /**
     * Delete the given subject
     * @param string  $subjectGroup the key of the subject group
     * @since 1.3
     */
    public static function removeSubjectGroup($subjectGroup){
        jDao::get('jacl2db~jacl2subject','jacl2_profile')->removeSubjectFromGroup($subjectGroup);
        jDao::get('jacl2db~jacl2subjectgroup','jacl2_profile')->delete($subjectGroup);
        jAcl2::clearCache();
    }


    const ACL_ADMIN_RIGHTS_STILL_USED = 0;
    const ACL_ADMIN_RIGHTS_NOT_ASSIGNED = 1;
    const ACL_ADMIN_RIGHTS_SESSION_USER_LOOSE_THEM = 2;

    /**
     * Checks if given authorizations changes still allow to administrate rights
     * for at least one user.
     *
     * For each groups, only authorizations on given rights are considered changed.
     * Other existing authorizations are considered as deleted.
     *
     * Authorizations with resources are not changed.
     *
     * @param array  $authorizationsChanges         array(<id_aclgrp> => array( <id_aclsbj> => false(inherit)/''(inherit)/true(add)/'y'(add)/'n'(remove)))
     * @param string $sessionUser the login name of the user who initiate the change
     * @param integer $changeType  1 for group rights change, 2 for user rights change
     *
     * @return int one of the jAcl2DbAdminCheckAuthorizations::ACL_ADMIN_RIGHTS_* const
     */
    public static function checkAclAdminAuthorizationsChanges($authorizationsChanges,
                                                      $sessionUser,
                                                      $changeType
    ) {

        $checker = new jAcl2DbAdminCheckAuthorizations($sessionUser);
        return $checker->checkAclAdminAuthorizationsChanges($authorizationsChanges, $changeType);
    }

    /**
     * check if the removing of the given user still allow to administrate authorizations
     * for at least one user.
     *
     * @param string $userToRemove
     * @param string $sessionUser the login name of the user who initiate the change
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constant
     */
    public static function checkAclAdminRightsToRemoveUser(
        $userToRemove,
        $sessionUser=null
    ) {
        $checker = new jAcl2DbAdminCheckAuthorizations($sessionUser);
        return $checker->checkAclAdminRightsToRemoveUser($userToRemove);
    }

    /**
     * check if the removing of the given user from a the given group still
     * allows to administrate rights for at least one user.
     *
     * @param string $userToRemoveFromTheGroup
     * @param string $groupFromWhichToRemoveTheUser
     * @param string $sessionUser the login name of the user who initiate the change
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constant
     */
    public static function checkAclAdminRightsToRemoveUserFromGroup(
        $userToRemoveFromTheGroup,
        $groupFromWhichToRemoveTheUser,
        $sessionUser)
    {
        $checker = new jAcl2DbAdminCheckAuthorizations($sessionUser);
        return $checker->checkAclAdminRightsToRemoveUserFromGroup($userToRemoveFromTheGroup, $groupFromWhichToRemoveTheUser);
    }

    /**
     * check if the removing of the given group still
     * allows to administrate rights for at least one user.
     *
     *
     * @param string $groupToRemove the group id to remove
     * @param string $sessionUser the login name of the user who initiate the change
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constant
     */
    public static function checkAclAdminRightsToRemoveGroup(
        $groupToRemove,
        $sessionUser
    )
    {
        $checker = new jAcl2DbAdminCheckAuthorizations($sessionUser);
        return $checker->checkAclAdminRightsToRemoveGroup($groupToRemove);
    }

    /**
     * check if the adding of the given user to the the given group still
     * allows to administrate rights for at least one user.
     *
     * (because the group may forbid to administrate rights.)
     *
     * @param string $userToAdd              the user login
     * @param string $groupInWhichToAddAUser the group id
     * @param string $sessionUser the login name of the user who initiate the change
     *
     * @return int one of ACL_ADMIN_RIGHTS_* constant
     */
    public static function checkAclAdminRightsToAddUserIntoGroup(
        $userToAdd,
        $groupInWhichToAddAUser,
        $sessionUser
    )
    {
        $checker = new jAcl2DbAdminCheckAuthorizations($sessionUser);
        return $checker->checkAclAdminRightsToAddUserIntoGroup($userToAdd,
                                                               $groupInWhichToAddAUser);
    }

}
