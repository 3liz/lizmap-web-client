<?php
/**
 * @package     jelix_modules
 * @subpackage  jacl2db
 * @author      Laurent Jouanneau
 * @contributor Julien Issler, Olivier Demah, Adrien Lagroy de Croutte
 * @copyright   2008-2021 Laurent Jouanneau
 * @copyright   2009 Julien Issler, 2010 Olivier Demah, 2020 Adrien Lagroy de Croutte
 * @link        http://jelix.org
 * @licence     http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU General Public Licence, see LICENCE file
 */

class jAcl2DbAdminUIManager {

    const FILTER_GROUP_ALL_USERS = -2;
    const FILTER_USERS_NO_IN_GROUP = -1;
    const FILTER_BY_GROUP = 0;


    protected function getLabel($id, $labelKey) {
        if ($labelKey) {
            try {
                return jLocale::get($labelKey);
            }
            catch(Exception $e) { }
        }
        return $id;
    }

    /**
     * @return array
     *      'groups' : list of jacl2group objects (id_aclgrp, name, grouptype, ownerlogin)
     *      'rights' : array( <subject> => array( <id_aclgrp> => 'y' or 'n' or ''))
     *      'sbjgroups_localized' : list of labels of each subject groups
     *      'subjects' : array( <subject> => array( 'grp' => <id_aclsbjgrp>, 'label' => <label>))
     *      'rightsWithResources':  array(<subject> => array( <id_aclgrp> => <number of rights>))
     */
    public function getGroupRights() {
        $gid = array('__anonymous');
        $o = new StdClass;
        $o->id_aclgrp = '__anonymous';
        try {
            $o->name = jLocale::get('jacl2db_admin~acl2.anonymous.group.name');
        }
        catch(Exception $e) {
            $o->name = 'Anonymous';
        }
        $o->grouptype = jAcl2DbUserGroup::GROUPTYPE_NORMAL;
        $o->ownerlogin = NULL;

        $daorights = jDao::get('jacl2db~jacl2rights','jacl2_profile');
        $rightsWithResources = array();

        // retrieve the list of groups and the number of existing rights with
        // resource for each groups
        $groups=array($o);
        $grouprights=array('__anonymous'=>false);
        foreach(jAcl2DbUserGroup::getGroupList() as $grp) {
            $gid[]=$grp->id_aclgrp;
            $groups[]=$grp;
            $grouprights[$grp->id_aclgrp]='';

            $rs = $daorights->getRightsHavingRes($grp->id_aclgrp);
            foreach($rs as $rec){
                if (!isset($rightsWithResources[$rec->id_aclsbj]))
                    $rightsWithResources[$rec->id_aclsbj] = array();
                if (!isset($rightsWithResources[$rec->id_aclsbj][$grp->id_aclgrp]))
                    $rightsWithResources[$rec->id_aclsbj][$grp->id_aclgrp] = 0;
                $rightsWithResources[$rec->id_aclsbj][$grp->id_aclgrp] ++;
            }
        }

        // retrieve the number of existing rights with
        // resource for the anonymous group
        $rs = $daorights->getRightsHavingRes('__anonymous');
        foreach($rs as $rec){
            if (!isset($rightsWithResources[$rec->id_aclsbj]))
                $rightsWithResources[$rec->id_aclsbj] = array();
            if (!isset($rightsWithResources[$rec->id_aclsbj]['__anonymous']))
                $rightsWithResources[$rec->id_aclsbj]['__anonymous'] = 0;
            $rightsWithResources[$rec->id_aclsbj]['__anonymous'] ++;
        }

        // create the list of subjects and their labels
        $rights=array();
        $sbjgroups_localized = array();
        $subjects = array();
        $rs = jDao::get('jacl2db~jacl2subject','jacl2_profile')->findAllSubject();
        foreach($rs as $rec){
            $rights[$rec->id_aclsbj] = $grouprights;
            $subjects[$rec->id_aclsbj] = array(
                'grp'=>$rec->id_aclsbjgrp,
                'label'=>$this->getLabel($rec->id_aclsbj, $rec->label_key)
            );
            if ($rec->id_aclsbjgrp && !isset($sbjgroups_localized[$rec->id_aclsbjgrp])) {
                $sbjgroups_localized[$rec->id_aclsbjgrp] = $this->getLabel($rec->id_aclsbjgrp, $rec->label_group_key);
            }
            if (!isset($rightsWithResources[$rec->id_aclsbj]))
                $rightsWithResources[$rec->id_aclsbj] = array();
        }

        // retrieve existing rights
        $rs = jDao::get('jacl2db~jacl2rights','jacl2_profile')->getRightsByGroups($gid);
        foreach ($rs as $rec) {
            $rights[$rec->id_aclsbj][$rec->id_aclgrp] = ($rec->canceled ? 'n' : 'y');
        }

        return compact('groups', 'rights', 'sbjgroups_localized', 'subjects', 'rightsWithResources');
    }

    /**
     * @return array
     *      'subjects_localized' : list of labels of each subject
     *      'rightsWithResources':  array(<subject> => array( <jacl2rights objects (id_aclsbj, id_aclgrp, id_aclres, canceled>))
     *      'hasRightsOnResources' : true if there are some resources
     */
    public function getGroupRightsWithResources($groupid) {
        $rightsWithResources = array();
        $daorights = jDao::get('jacl2db~jacl2rights','jacl2_profile');

        $rs = $daorights->getRightsHavingRes($groupid);
        $hasRightsOnResources = false;
        foreach($rs as $rec){
            if (!isset($rightsWithResources[$rec->id_aclsbj])) {
                $rightsWithResources[$rec->id_aclsbj] = array();
            }
            $rightsWithResources[$rec->id_aclsbj][] = $rec;
            $hasRightsOnResources = true;
        }
        $subjects_localized = array();
        if(!empty($rightsWithResources)){
            $conditions = jDao::createConditions();
            $conditions->addCondition('id_aclsbj', 'in', array_keys($rightsWithResources));
            foreach(jDao::get('jacl2db~jacl2subject','jacl2_profile')->findBy($conditions) as $rec)
                $subjects_localized[$rec->id_aclsbj] = $this->getLabel($rec->id_aclsbj, $rec->label_key);
        }
        return compact('subjects_localized', 'rightsWithResources', 'hasRightsOnResources');
    }

    /**
     * Save authorizations for all groups
     *
     * Only authorizations on given subjects are changed.
     * Existing authorizations not given in parameters are deleted from the
     * corresponding group (i.e: marked as inherited).
     *
     * If authorizations of a group are missing, all authorizations for
     * this group are deleted.
     *
     * @param array  $rights
     *                array(<id_aclgrp> => array( <id_aclsbj> => (bool, 'y', 'n' or '')))
     * @param string $sessionUser the user login who initiates the change.
     *                            It is mandatory although null is accepted for
     *                            API compatibility. Null value is deprecated
     *
     * @see jAcl2DbManager::setRightsOnGroup()
     */
    public function saveGroupRights($rights, $sessionUser = null)
    {
        $checking = jAcl2DbManager::checkAclAdminAuthorizationsChanges($rights, $sessionUser, 1);
        if ($checking === jAcl2DbManager::ACL_ADMIN_RIGHTS_SESSION_USER_LOOSE_THEM) {
            throw new jAcl2DbAdminUIException("Changes cannot be applied else you won't be able to change some rights", 3);
        }
        if ($checking === jAcl2DbManager::ACL_ADMIN_RIGHTS_NOT_ASSIGNED) {
            throw new jAcl2DbAdminUIException('Changes cannot be applied else nobody will be able to change some rights', 2);
        }

        foreach(jAcl2DbUserGroup::getGroupList() as $grp) {
            $id = $grp->id_aclgrp;
            jAcl2DbManager::setRightsOnGroup($id, (isset($rights[$id])?$rights[$id]:array()));
        }

        jAcl2DbManager::setRightsOnGroup('__anonymous', (isset($rights['__anonymous'])?$rights['__anonymous']:array()));
    }

    /**
     * @param string $groupid
     * @param array $subjects array( <id_aclsbj> => (true (remove), 'on'(remove) or '' (not touch))
     *                          true or 'on' means 'to remove'
     */
    public function removeGroupRightsWithResources($groupid, $subjects) {
        $subjectsToRemove = array();

        foreach($subjects as $sbj=>$val) {
            if ($val != '' || $val == true) {
                $subjectsToRemove[] = $sbj;
            }
        }
        if (count($subjectsToRemove)) {
            jDao::get('jacl2db~jacl2rights', 'jacl2_profile')
                ->deleteRightsOnResource($groupid, $subjectsToRemove);
        }
    }

    /**
     * @param integer $groupFilter one of FILTER_* const
     * @param null|integer $groupId
     * @param string $userFilter
     * @param integer $offset
     * @param integer $listPageSize
     * @return array 'users': list of objects representing users ( login, and his groups in groups)
     *               'usersCount': total number of users
     */
    public function getUsersList($groupFilter, $groupId = null, $userFilter = '', $offset=0, $listPageSize=15) {
        $p = 'jacl2_profile';

        // get the number of users and the recordset to retrieve users
        if ($groupFilter == self::FILTER_GROUP_ALL_USERS) {
            //all users
            $dao = jDao::get('jacl2db~jacl2groupsofuser', $p);
            $cond = jDao::createConditions();
            $cond->addCondition('grouptype', '=', jAcl2DbUserGroup::GROUPTYPE_PRIVATE);
            if ($userFilter) {
                $cond->addCondition('login', 'LIKE', '%'.$userFilter.'%');
            }
            $cond->addItemOrder('login','asc');
            $rs = $dao->findBy($cond, $offset, $listPageSize);
            $usersCount = $dao->countBy($cond);

        } elseif ($groupFilter == self::FILTER_USERS_NO_IN_GROUP) {
            //only those who have no groups
            $cnx = jDb::getConnection($p);
            $sql = 'SELECT login, count(id_aclgrp) as nbgrp FROM '.$cnx->prefixTable('jacl2_user_group');
            if ($userFilter) {
                $sql .= " WHERE login LIKE ".$cnx->quote('%'.$userFilter.'%');
            }

            if ($cnx->dbms != 'pgsql') {
                // with MYSQL 4.0.12, you must use an alias with the count to use it with HAVING
                $sql .= ' GROUP BY login HAVING nbgrp < 2 ORDER BY login';
            } else {
                // But PgSQL doesn't support the HAVING structure with an alias.
                $sql .= ' GROUP BY login HAVING count(id_aclgrp) < 2 ORDER BY login';
            }

            $rs = $cnx->query($sql);
            $usersCount = $rs->rowCount();

        } else {
            //in a specific group
            $dao = jDao::get('jacl2db~jacl2usergroup', $p);
            if ($userFilter) {
                $rs = $dao->getUsersGroupLimitAndFilter($groupId, '%'.$userFilter.'%', $offset, $listPageSize);
                $usersCount = $dao->getUsersGroupCountAndFilter($groupId, '%'.$userFilter.'%');
            }
            else {
                $rs = $dao->getUsersGroupLimit($groupId, $offset, $listPageSize);
                $usersCount = $dao->getUsersGroupCount($groupId);
            }
        }

        $users = array();
        $dao2 = jDao::get('jacl2db~jacl2groupsofuser', $p);
        foreach($rs as $u){
            $u->groups = array();
            $gl = $dao2->getGroupsUser($u->login);
            foreach($gl as $g) {
                if ($g->grouptype != jAcl2DbUserGroup::GROUPTYPE_PRIVATE) {
                    $u->groups[] = $g;
                }
            }
            $users[] = $u;
        }

        return compact('users','usersCount');
    }


    /**
     * @param string $user
     * @return array
     * @throws jAcl2DbAdminUIException
     */
    public function getUserRights($user) {

        // retrieve user
        $dao = jDao::get('jacl2db~jacl2groupsofuser','jacl2_profile');
        $cond = jDao::createConditions();
        $cond->addCondition('login', '=', $user);
        $cond->addCondition('grouptype', '=', jAcl2DbUserGroup::GROUPTYPE_PRIVATE);
        if ($dao->countBy($cond)==0) {
            throw new jAcl2DbAdminUIException('Invalid user', 1);
        }

        // retrieve groups of the user
        $hisgroup = null;
        $groupsuser = array();
        foreach(jAcl2DbUserGroup::getGroupList($user) as $grp) {
            if ($grp->grouptype == jAcl2DbUserGroup::GROUPTYPE_PRIVATE) {
                $hisgroup = $grp;
            }
            else {
                $groupsuser[$grp->id_aclgrp] = $grp;
            }
        }

        // retrieve all groups
        $gid = array($hisgroup->id_aclgrp);
        $groups = array();
        $grouprights = array($hisgroup->id_aclgrp => false);
        foreach (jAcl2DbUserGroup::getGroupList() as $grp) {
            $gid[] = $grp->id_aclgrp;
            $groups[] = $grp;
            $grouprights[$grp->id_aclgrp] = '';
        }

        // create the list of subjects and their labels
        $rights = array();
        $subjects = array();
        $sbjgroups_localized = array();
        $rs = jDao::get('jacl2db~jacl2subject','jacl2_profile')->findAllSubject();
        foreach ($rs as $rec) {
            $rights[$rec->id_aclsbj] = $grouprights;
            $subjects[$rec->id_aclsbj] = array(
                'grp'=> $rec->id_aclsbjgrp,
                'label'=> $this->getLabel($rec->id_aclsbj, $rec->label_key));
            if ($rec->id_aclsbjgrp && !isset($sbjgroups_localized[$rec->id_aclsbjgrp])) {
                $sbjgroups_localized[$rec->id_aclsbjgrp] =
                    $this->getLabel($rec->id_aclsbjgrp, $rec->label_group_key);
            }
        }

        $rightsWithResources = array_fill_keys(array_keys($rights),0);
        $daorights = jDao::get('jacl2db~jacl2rights','jacl2_profile');

        $rs = $daorights->getRightsHavingRes($hisgroup->id_aclgrp);
        $hasRightsOnResources = false;
        foreach ($rs as $rec) {
            $rightsWithResources[$rec->id_aclsbj]++;
            $hasRightsOnResources = true;
        }

        $rs = $daorights->getRightsByGroups($gid);
        foreach ($rs as $rec) {
            $rights[$rec->id_aclsbj][$rec->id_aclgrp] = ($rec->canceled?'n':'y');
        }

        return compact('hisgroup', 'groupsuser', 'groups', 'rights', 'user',
            'subjects', 'sbjgroups_localized',
            'rightsWithResources', 'hasRightsOnResources');
    }


    /**
     * Save rights of the given user
     *
     * Only rights on given subjects are changed.
     * Existing rights not given in parameters are deleted from the
     * private group of the user (i.e: marked as inherited).
     *
     * Rights with resources are not changed.
     *
     * @param string $login     the login of the user on who rights will be changed
     * @param array $userRights list of rights key=subject, value=false(inherit)/''(inherit)/true(add)/'y'(add)/'n'(remove)
     * @param null|string  $sessionUser the login name of the user who initiate the change
     *                            It is mandatory although null is accepted for
     *                            API compatibility. Null value is deprecated.
     *
     * @throws jAcl2DbAdminUIException
     */
    public function saveUserRights($login, $userRights, $sessionUser = null)
    {
        $dao = jDao::get('jacl2db~jacl2groupsofuser', 'jacl2_profile');
        $grp = $dao->getPrivateGroup($login);

        $rights = array($grp->id_aclgrp => $userRights);

        $checking = jAcl2DbManager::checkAclAdminAuthorizationsChanges($rights, $sessionUser, 2);
        if ($checking === jAcl2DbManager::ACL_ADMIN_RIGHTS_SESSION_USER_LOOSE_THEM) {
            throw new jAcl2DbAdminUIException("Changes cannot be applied else you won't be able to change some rights", 3);
        }
        if ($checking === jAcl2DbManager::ACL_ADMIN_RIGHTS_NOT_ASSIGNED) {
            throw new jAcl2DbAdminUIException('Changes cannot be applied else nobody will be able to change some rights', 2);
        }

        jAcl2DbManager::setRightsOnGroup($grp->id_aclgrp, $userRights);

    }

    public function getUserRessourceRights($user) {
        $daogroup = jDao::get('jacl2db~jacl2group','jacl2_profile');

        $group = $daogroup->getPrivateGroup($user);

        $rightsWithResources = array();
        $daorights = jDao::get('jacl2db~jacl2rights','jacl2_profile');

        $rs = $daorights->getRightsHavingRes($group->id_aclgrp);
        $hasRightsOnResources = false;
        foreach($rs as $rec){
            if (!isset($rightsWithResources[$rec->id_aclsbj])) {
                $rightsWithResources[$rec->id_aclsbj] = array();
            }
            $rightsWithResources[$rec->id_aclsbj][] = $rec;
            $hasRightsOnResources = true;
        }
        $subjects_localized = array();
        if (!empty($rightsWithResources)) {
            $conditions = jDao::createConditions();
            $conditions->addCondition('id_aclsbj', 'in', array_keys($rightsWithResources));
            foreach(jDao::get('jacl2db~jacl2subject','jacl2_profile')->findBy($conditions) as $rec) {
                $subjects_localized[$rec->id_aclsbj] = $this->getLabel($rec->id_aclsbj, $rec->label_key);
            }
        }
        return compact('user', 'subjects_localized', 'rightsWithResources', 'hasRightsOnResources');
    }


    /**
     * @param $user
     * @param array $subjects <id_aclsbj> => (true (remove), 'on'(remove) or '' (not touch)
     */
    public function removeUserRessourceRights($user, $subjects) {

        $daogroup = jDao::get('jacl2db~jacl2group', 'jacl2_profile');
        $grp = $daogroup->getPrivateGroup($user);

        $subjectsToRemove = array();

        foreach($subjects as $sbj=>$val) {
            if ($val != '' || $val == true) {
                $subjectsToRemove[] = $sbj;
            }
        }

        if (count($subjectsToRemove)) {
            jDao::get('jacl2db~jacl2rights', 'jacl2_profile')
                ->deleteRightsOnResource($grp->id_aclgrp, $subjectsToRemove);
        }
    }

    /**
     * delete a group of user
     *
     * @param string $groupId the id of the group to remove
     * @param null|string  $sessionUser the login name of the user who initiate the change
     *                            It is mandatory although null is accepted for
     *                            API compatibility. Null value is deprecated.
     *
     * @throws jAcl2DbAdminUIException
     */
    public function removeGroup($groupId, $sessionUser = null)
    {
        $checking = jAcl2DbManager::checkAclAdminRightsToRemoveGroup($groupId, $sessionUser);

        if ($checking == jAcl2DbManager::ACL_ADMIN_RIGHTS_SESSION_USER_LOOSE_THEM) {
            throw new jAcl2DbAdminUIException("Group cannot be removed, else you wouldn't manage acl anymore", 3);
        }
        if ($checking == jAcl2DbManager::ACL_ADMIN_RIGHTS_NOT_ASSIGNED) {
            throw new jAcl2DbAdminUIException("Group cannot be removed, else acl management is not possible anymore", 2);
        }
        jAcl2DbUserGroup::removeGroup($groupId);
    }

    /**
     * @param string $login the login of the user to remove from the given group
     * @param string $groupId the group name from which the user should be removed
     * @param null|string  $sessionUser the login name of the user who initiates the change
     *                            It is mandatory although null is accepted for
     *                            API compatibility. Null value is deprecated.
     * @throws jAcl2DbAdminUIException
     */
    public function removeUserFromGroup($login, $groupId, $sessionUser = null)
    {
        $checking = jAcl2DbManager::checkAclAdminRightsToRemoveUserFromGroup($login, $groupId, $sessionUser);

        if ($checking == jAcl2DbManager::ACL_ADMIN_RIGHTS_SESSION_USER_LOOSE_THEM) {
            throw new jAcl2DbAdminUIException("User cannot be removed from group, else you wouldn't manage acl anymore", 3);
        }
        if ($checking == jAcl2DbManager::ACL_ADMIN_RIGHTS_NOT_ASSIGNED) {
            throw new jAcl2DbAdminUIException("User cannot be removed from group, else acl management is not possible anymore", 2);
        }
        jAcl2DbUserGroup::removeUserFromGroup($login, $groupId);
    }

    /**
     * @param string $login
     * @param string $groupId
     * @param null|string  $sessionUser the login name of the user who initiates the change
     *                            It is mandatory although null is accepted for
     *                            API compatibility. Null value is deprecated.
     *
     * @throws jAcl2DbAdminUIException
     */
    public function addUserToGroup($login, $groupId, $sessionUser = null)
    {
        $checking = jAcl2DbManager::checkAclAdminRightsToAddUserIntoGroup($login, $groupId, $sessionUser);

        if ($checking == jAcl2DbManager::ACL_ADMIN_RIGHTS_SESSION_USER_LOOSE_THEM) {
            throw new jAcl2DbAdminUIException("User cannot be add to group, else you wouldn't manage acl anymore", 3);
        }
        if ($checking == jAcl2DbManager::ACL_ADMIN_RIGHTS_NOT_ASSIGNED) {
            throw new jAcl2DbAdminUIException('User cannot be add to group, else acl management is not possible anymore', 2);
        }
        jAcl2DbUserGroup::addUserToGroup($login, $groupId);
    }

    /**
     * @param string $login
     *
     * @return bool true if is safe to remove the user
     */
    public function canRemoveUser($login)
    {
        $checking = jAcl2DbManager::checkAclAdminRightsToRemoveUser($login, null);
        return ($checking === jAcl2DbManager::ACL_ADMIN_RIGHTS_STILL_USED);
    }

}
