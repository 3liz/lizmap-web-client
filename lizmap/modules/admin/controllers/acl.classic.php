<?php
/**
 * Lizmap administration
 * @package   lizmap
 * @subpackage admin
 * @author    3liz
 * @copyright 2018 3liz
 * @link      http://3liz.com
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */


class aclCtrl extends jController
{

    public $pluginParams = array(
        'removegroup' => array('jacl2.rights.and' => array('acl.user.view', 'acl.user.modify')),
        'addgroup' => array('jacl2.rights.and' => array('acl.user.view', 'acl.user.modify')),
    );


    protected function checkException(jAcl2DbAdminUIException $e, $category) {
        if ($e->getCode() == 1) {
            jMessage::add(jLocale::get('jacl2db_admin~acl2.error.invalid.user'), 'error');
        }
        else if ($e->getCode() == 2) {
            jMessage::add(jLocale::get('jacl2db_admin~acl2.message.'.$category.'.error.noacl.anybody'), 'error');
        }
        else if ($e->getCode() == 3) {
            jMessage::add(jLocale::get('jacl2db_admin~acl2.message.'.$category.'.error.noacl.yourself'), 'error');
        }
    }

    function removegroup(){
        $rep = $this->getResponse('redirect');

        $login = $this->param('user');
        if ($login != '') {
            $rep->action = 'jauthdb_admin~default:view';
            $rep->params = array('j_user_login'=>$login);
            try {
                $manager = new jAcl2DbAdminUIManager();
                $manager->removeUserFromGroup($login, $this->param('grpid'));
            }
            catch (jAcl2DbAdminUIException $e) {
                $this->checkException($e, 'removeuserfromgroup');
            }
        }
        else {
            $rep->action = 'jauthdb_admin~default:index';
        }

        return $rep;
    }

    function addgroup() {
        $rep = $this->getResponse('redirect');

        $login = $this->param('user');
        $grpid = $this->param('grpid');
        if ($login != '') {
            $rep->action = 'jauthdb_admin~default:view';
            $rep->params = array('j_user_login'=>$login);
            if ($grpid) {
                jAcl2DbUserGroup::addUserToGroup($login, $grpid);
            }
        }
        else {
            $rep->action = 'jauthdb_admin~default:index';
        }
        return $rep;
    }
}
