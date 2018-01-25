<?php
/**
* @package     jelix
* @subpackage  acl
* @author      Laurent Jouanneau
* @copyright   2006-2017 Laurent Jouanneau
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
     * Only rights on given subjects are considered changed.
     * Existing rights not given in parameters are considered as deleted.
     *
     * Rights with resources are not changed.
     * @param array $rightsChanges array(<id_aclgrp> => array( <id_aclsbj> => false(inherit)/''(inherit)/true(add)/'y'(add)/'n'(remove)))
     * @return int one of the ACL_ADMIN_RIGHTS_* const
     */
    public static function checkAclAdminRightsChanges($rightsChanges,
                                                      $sessionUser=null,
                                                      $setForAllPublicGroups = true,
                                                      $setAllRightsInGroups = true,
                                                      $ignoredUser = null,
                                                      $ignoreUserInGroup = null) {

        $canceledRoles = array();
        $assignedRoles = array();
        $sessionUserGroups = array();
        $sessionCanceledRoles = array();
        $sessionAssignedRoles = array();

        $db = jDb::getConnection('jacl2_profile');
        if ($sessionUser) {
            $gp = jDao::get('jacl2db~jacl2usergroup', 'jacl2_profile')
                ->getGroupsUser($sessionUser);
            foreach($gp as $g){
                $sessionUserGroups[$g->id_aclgrp] = true;
            }
        }

        // get all acl admin rights, even all those in private groups
        $sql = "SELECT id_aclsbj, r.id_aclgrp, canceled, g.grouptype
            FROM ".$db->prefixTable('jacl2_rights'). " r 
            INNER JOIN ".$db->prefixTable('jacl2_group'). " g 
            ON (r.id_aclgrp = g.id_aclgrp)
            WHERE id_aclsbj IN (".implode(',', array_map(function($role) use ($db) {
                return $db->quote($role);
            }, self::$ACL_ADMIN_RIGHTS)).") ";
        $rs = $db->query($sql);
        foreach($rs as $rec) {
            if ($sessionUser && isset($sessionUserGroups[$rec->id_aclgrp])) {
                if ($rec->canceled != '0') {
                    $sessionCanceledRoles[$rec->id_aclsbj] = true;
                } else {
                    $sessionAssignedRoles[$rec->id_aclsbj] = true;
                }
            }
            if ($setForAllPublicGroups &&
                !isset($rightsChanges[$rec->id_aclgrp]) &&
                $rec->grouptype != jAcl2DbUserGroup::GROUPTYPE_PRIVATE
            ) {
                continue;
            }
            if ($rec->canceled != '0') {
                $canceledRoles[$rec->id_aclgrp][$rec->id_aclsbj] = true;
            } else {
                $assignedRoles[$rec->id_aclgrp][$rec->id_aclsbj] = true;
            }
        }

        $rolesStats = array_combine(self::$ACL_ADMIN_RIGHTS, array_fill(0, count(self::$ACL_ADMIN_RIGHTS), 0));

        // now apply changes
        foreach($rightsChanges as $groupId => $changes) {
            if (!isset($assignedRoles[$groupId])) {
                $assignedRoles[$groupId] = array();
            }
            if (!isset($canceledRoles[$groupId])) {
                $canceledRoles[$groupId] = array();
            }
            $unassignedRoles = array_combine(self::$ACL_ADMIN_RIGHTS, array_fill(0, count(self::$ACL_ADMIN_RIGHTS), true));
            foreach ($changes as $role => $roleAssignation) {
                if (!isset($rolesStats[$role])) {
                    continue;
                }
                unset($unassignedRoles[$role]);
                if ($roleAssignation === false || $roleAssignation === '') {
                    // inherited
                    if (isset($assignedRoles[$groupId][$role])) {
                        unset($assignedRoles[$groupId][$role]);
                    }
                    if (isset($canceledRoles[$groupId][$role])) {
                        unset($canceledRoles[$groupId][$role]);
                    }
                } else if ($roleAssignation == 'y' || $roleAssignation === true) {
                    if (isset($canceledRoles[$groupId][$role])) {
                        unset($canceledRoles[$groupId][$role]);
                    }
                    $assignedRoles[$groupId][$role] = true;
                } else if ($roleAssignation == 'n') {
                    if (isset($assignedRoles[$groupId][$role])) {
                        unset($assignedRoles[$groupId][$role]);
                    }
                    $canceledRoles[$groupId][$role] = true;
                }
            }
            if ($setAllRightsInGroups) {
                foreach ($unassignedRoles as $role => $ok) {
                    if (isset($assignedRoles[$groupId][$role])) {
                        unset($assignedRoles[$groupId][$role]);
                    }
                    if (isset($canceledRoles[$groupId][$role])) {
                        unset($canceledRoles[$groupId][$role]);
                    }
                }
            }
            if (count($assignedRoles[$groupId]) == 0 && count($canceledRoles[$groupId]) == 0) {
                unset($assignedRoles[$groupId]);
                unset($canceledRoles[$groupId]);
            }
        }

        // get all users that are in groups having new acl admin rights
        $allGroups = array_unique(array_merge(array_keys($assignedRoles), array_keys($canceledRoles)));
        if (count($allGroups) === 0) {
            return self::ACL_ADMIN_RIGHTS_NOT_ASSIGNED;
        }

        $sql = "SELECT login, id_aclgrp FROM ".$db->prefixTable('jacl2_user_group'). "
            WHERE id_aclgrp IN (".implode(',', array_map(function($grp) use ($db) {
                return $db->quote($grp);
            }, $allGroups)).") ";

        $rs = $db->query($sql);
        $users = array();
        foreach($rs as $rec) {
            if ($rec->login === $ignoredUser &&
                ($ignoreUserInGroup === null || $ignoreUserInGroup === $rec->id_aclgrp)) {
                continue;
            }
            if (!isset($users[$rec->login])) {
                $users[$rec->login] = array('canceled' => array(), 'roles' => array());
            }
            if (isset($assignedRoles[$rec->id_aclgrp])) {
                $users[$rec->login]['roles'] = array_merge($users[$rec->login]['roles'], $assignedRoles[$rec->id_aclgrp]);
            }
            if (isset($canceledRoles[$rec->id_aclgrp])) {
                $users[$rec->login]['canceled'] = array_merge($users[$rec->login]['canceled'], $canceledRoles[$rec->id_aclgrp]);
            }
        }

        // gets statistics
        $newSessionUserRoles = array();
        foreach($users as $login => $data) {
            if (count($data['canceled'])) {
                $data['roles'] = array_diff_key($data['roles'], $data['canceled']);
            }
            if ($login === $sessionUser) {
                $newSessionUserRoles =  $data['roles'];
            }
            foreach($data['roles'] as $role => $ok) {
                $rolesStats[$role]++;
            }
        }

        if ($sessionUser) {
            foreach($sessionAssignedRoles as $role=>$ok) {
                if(isset($sessionCanceledRoles[$role])) {
                    continue;
                }
                if (!isset($newSessionUserRoles[$role])) {
                    return self::ACL_ADMIN_RIGHTS_SESSION_USER_LOOSE_THEM;
                }
            }
        }

        foreach($rolesStats as $count) {
            if ($count == 0) {
                return self::ACL_ADMIN_RIGHTS_NOT_ASSIGNED;
            }
        }
        return self::ACL_ADMIN_RIGHTS_STILL_USED;
    }
}
