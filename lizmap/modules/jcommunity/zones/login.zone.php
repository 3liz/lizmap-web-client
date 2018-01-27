<?php
/**
* @package      jcommunity
* @subpackage   
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
* @copyright    2008 Laurent Jouanneau
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/


class loginZone extends jZone {

    protected $_tplname='login';

    protected function _prepareTpl(){
        $config = new \Jelix\JCommunity\Config();
        $this->_tpl->assign('canRegister', $config->isRegistrationEnabled());
        $this->_tpl->assign('canResetPassword', $config->isResetPasswordEnabled());

        if(jAuth::isConnected()) {
            $this->_tpl->assign('login',jAuth::getUserSession ()->login);
        }
        else {
            $conf = jAuth::loadConfig();
            $this->_tpl->assign('persistance_ok', jAuth::isPersistant());
            $form = jForms::get("jcommunity~login");
            if (!$form) {
                $form = jForms::create("jcommunity~login");
            }
            $this->_tpl->assign('form',$form);
            $this->_tpl->assign('url_return','');
            
            if ($conf['enable_after_login_override']) {
                $req = jApp::coord()->request;
                if ($req->getParam('auth_url_return')) {
                    $this->_tpl->assign('url_return', $req->getParam('auth_url_return'));
                }
                else if($this->param('as_main_content')) {
                    if (isset($_SERVER['HTTP_REFERER']) &&
                        $_SERVER['HTTP_REFERER'] &&
                        $_SERVER['HTTP_REFERER'] != jUrl::getCurrentUrl(false, true)) {
                        $this->_tpl->assign('url_return',$_SERVER['HTTP_REFERER']);
                    }
                }
                else if ($_SERVER['REQUEST_METHOD'] == 'GET' || $_SERVER['REQUEST_METHOD'] == 'HEAD') {
                    $this->_tpl->assign('url_return', jUrl::getCurrentUrl(false, true));
                }
            }
        }
    }
}

?>