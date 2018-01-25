<?php
/**
* @package     jelix_admin_modules
* @subpackage  jacl2db_admin
* @author      Laurent Jouanneau
* @contributor Julien Issler
* @copyright   2008-2017 Laurent Jouanneau
* @copyright   2009 Julien Issler
* @link        http://jelix.org
* @licence     http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU General Public Licence, see LICENCE file
*/


class usersCtrl extends jController {

    public $pluginParams=array(
        'index'=>array('jacl2.rights.and'=>array('acl.user.view')),
        'rights'=>array('jacl2.rights.and'=>array('acl.user.view')),
        'saverights'=>array('jacl2.rights.and'=>array('acl.user.view','acl.user.modify')),
        'removegroup'=>array('jacl2.rights.and'=>array('acl.user.view','acl.user.modify')),
        'addgroup'=>array('jacl2.rights.and'=>array('acl.user.view','acl.user.modify')),
    );

    protected function checkException(jAcl2DbAdminUIException $e, $category) {
        if ($e->getCode() == 1) {
            jMessage::add(jLocale::get('acl2.error.invalid.user'), 'error');
        }
        else if ($e->getCode() == 2) {
            jMessage::add(jLocale::get('acl2.message.'.$category.'.error.noacl.anybody'), 'error');
        }
        else if ($e->getCode() == 3) {
            jMessage::add(jLocale::get('acl2.message.'.$category.'.error.noacl.yourself'), 'error');
        }
    }

    /**
    *
    */
    function index() {
        $rep = $this->getResponse('html');

        $groups=array();

        $o = new StdClass;
        $o->id_aclgrp ='-2';
        $o->name=jLocale::get('jacl2db_admin~acl2.all.users.option');
        $o->grouptype = jAcl2DbUserGroup::GROUPTYPE_NORMAL;
        $groups[]=$o;

        $o = new StdClass;
        $o->id_aclgrp ='-1';
        $o->name=jLocale::get('jacl2db_admin~acl2.without.groups.option');
        $o->grouptype = jAcl2DbUserGroup::GROUPTYPE_NORMAL;
        $groups[]=$o;

        foreach(jAcl2DbUserGroup::getGroupList() as $grp) {
            $groups[]=$grp;
        }

        $manager = new jAcl2DbAdminUIManager();
        $listPageSize = 15;
        $offset = $this->param('idx', 0, true);
        $grpid = $this->param('grpid', jAcl2DbAdminUIManager::FILTER_GROUP_ALL_USERS, true);
        $filter = trim($this->param('filter'));
        $tpl = new jTpl();

        if (is_numeric($grpid) && intval($grpid) < 0 ) {
            $tpl->assign($manager->getUsersList($grpid, null, $filter, $offset, $listPageSize));
        }
        else {
            $tpl->assign($manager->getUsersList(jAcl2DbAdminUIManager::FILTER_BY_GROUP, $grpid, $filter, $offset, $listPageSize));
        }

        $tpl->assign(compact('offset', 'grpid', 'listPageSize', 'groups', 'filter'));
        $rep->body->assign('MAIN', $tpl->fetch('users_list'));
        $rep->body->assign('selectedMenuItem','usersrights');

        return $rep;
    }

    protected function getLabel($id, $labelKey) {
        if ($labelKey) {
            try {
                return jLocale::get($labelKey);
            }
            catch(Exception $e) { }
        }
        return $id;
    }

    function rights(){
        $rep = $this->getResponse('html');

        $user = $this->param('user');
        if (!$user) {
            $rep->body->assign('MAIN', '<p>invalid user</p>');
            return $rep;
        }

        try {
            $manager = new jAcl2DbAdminUIManager();
            $data = $manager->getUserRights($user);
        }
        catch (jAcl2DbAdminUIException $e) {
            $rep->body->assign('MAIN', '<p>'.$e->getMessage().'</p>');
            return $rep;
        }

        $tpl = new jTpl();
        $tpl->assign($data);
        $tpl->assign('nbgrp', count($data['groups']));

        if (jAcl2::check('acl.user.modify')) {
            $rep->body->assign('MAIN', $tpl->fetch('user_rights'));
        }
        else {
            $rep->body->assign('MAIN', $tpl->fetch('user_rights_view'));
        }
        $rep->body->assign('selectedMenuItem', 'usersrights');
        return $rep;
    }

    function saverights(){
        $rep = $this->getResponse('redirect');
        $login = $this->param('user');
        $rights = $this->param('rights',array());

        if($login == '') {
            $rep->action = 'jacl2db_admin~users:index';
            return $rep;
        }

        $rep->action = 'jacl2db_admin~users:rights';
        $rep->params = array('user'=>$login);
        try {
            $manager = new jAcl2DbAdminUIManager();
            $manager->saveUserRights($login, $rights, jAuth::getUserSession()->login);
            jMessage::add(jLocale::get('acl2.message.user.rights.ok'), 'ok');
        }
        catch (jAcl2DbAdminUIException $e) {
            $this->checkException($e, 'saveuserrights');
        }

        return $rep;
    }

    function rightres(){
        $rep = $this->getResponse('html');

        $user = $this->param('user');
        if (!$user) {
            $rep->body->assign('MAIN', '<p>invalid user</p>');
            return $rep;
        }

        $manager = new jAcl2DbAdminUIManager();
        $data = $manager->getUserRessourceRights($user);

        $tpl = new jTpl();
        $tpl->assign($data);

        if (jAcl2::check('acl.user.modify')) {
            $rep->body->assign('MAIN', $tpl->fetch('user_rights_res'));
        }
        else {
            $rep->body->assign('MAIN', $tpl->fetch('user_rights_res_view'));
        }
        $rep->body->assign('selectedMenuItem','usersrights');
        return $rep;
    }

    function saverightres(){
        $rep = $this->getResponse('redirect');
        $login = $this->param('user');
        $subjects = $this->param('subjects',array());

        if ($login == '') {
            $rep->action = 'jacl2db_admin~users:index';
            return $rep;
        }

        $rep->action = 'jacl2db_admin~users:rightres';
        $rep->params = array('user'=>$login);

        $manager = new jAcl2DbAdminUIManager();
        $manager->removeUserRessourceRights($login, $subjects);

        jMessage::add(jLocale::get('acl2.message.user.rights.ok'), 'ok');
        return $rep;
    }

    function removegroup(){
        $rep = $this->getResponse('redirect');

        $login = $this->param('user');
        if ($login != '') {
            $rep->action = 'jacl2db_admin~users:rights';
            $rep->params = array('user'=>$login);
            try {
                $manager = new jAcl2DbAdminUIManager();
                $manager->removeUserFromGroup($login, $this->param('grpid'));
            }
            catch (jAcl2DbAdminUIException $e) {
                $this->checkException($e, 'removeuserfromgroup');
            }
        }
        else {
            $rep->action = 'jacl2db_admin~users:index';
        }

        return $rep;
    }

    function addgroup() {
        $rep = $this->getResponse('redirect');

        $login = $this->param('user');
        if ($login != '') {
            $rep->action = 'jacl2db_admin~users:rights';
            $rep->params=array('user'=>$login);
            jAcl2DbUserGroup::addUserToGroup($login, $this->param('grpid') );
        }
        else {
            $rep->action = 'jacl2db_admin~users:index';
        }
        return $rep;
    }

}
