<?php
/**
* @package   admin
* @subpackage jauthdb_admin
* @author    Laurent Jouanneau
* @copyright 2009-2013 Laurent Jouanneau
* @link      http://jelix.org
* @license   http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GNU Public Licence
*/

class passwordCtrl extends jController {

    public $sensitiveParameters = array('pwd', 'pwd_confirm');

    public $pluginParams=array(
        '*'   =>array('jacl2.rights.or'=>array('auth.users.change.password','auth.user.change.password')),
    );

    protected function isPersonalView() {
        return  !jAcl2::check('auth.users.change.password');
    }

    function index(){
        $login = $this->param('j_user_login');
        if($login === null){
            $rep = $this->getResponse('redirect');
            $rep->action = 'master_admin~default:index';
            return $rep;
        }

        $personalView = $this->isPersonalView();
        if ($personalView && $login != jAuth::getUserSession()->login) {
            jMessage::add(jLocale::get('jacl2~errors.action.right.needed'), 'error');
            $rep = $this->getResponse('redirect');
            $rep->action = 'master_admin~default:index';
            return $rep;
        }
        
        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('id', $login);
        $tpl->assign('randomPwd', jAuth::getRandomPassword());
        $tpl->assign('personalview', $personalView);
        if ($personalView)
            $tpl->assign('viewaction', 'user:index');
        else
            $tpl->assign('viewaction', 'default:view');
        $rep->body->assign('MAIN', $tpl->fetch('password_change'));
        return $rep;
    }

    /**
     * 
     */
    function update(){
        $login = $this->param('j_user_login');
        $pwd = $this->param('pwd');
        $pwdconf = $this->param('pwd_confirm');
        $rep = $this->getResponse('redirect');

        $personalView = $this->isPersonalView();
        if ($personalView && $login != jAuth::getUserSession()->login) {
            jMessage::add(jLocale::get('jacl2~errors.action.right.needed'), 'error');
            $rep->action = 'master_admin~default:index';
            return $rep;
        }

        if (trim($pwd) == '' || $pwd != $pwdconf) {
            jMessage::add(jLocale::get('crud.message.bad.password'), 'error');
            $rep->action = 'password:index';
            $rep->params['j_user_login'] = $login;
            return $rep;
        }

        if(jAuth::changePassword($login, $pwd)) {
            jMessage::add(jLocale::get('crud.message.change.password.ok', $login), 'notice');
            if ($personalView)
                $rep->action = 'user:index';
            else
                $rep->action = 'default:view';
            $rep->params['j_user_login'] = $login;
            return $rep;
        }
        else{
            jMessage::add(jLocale::get('crud.message.change.password.notok'), 'error');
            $rep->action = 'password:index';
            $rep->params['j_user_login'] = $login;
        }
        return $rep;
    }
}

