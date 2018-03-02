<?php
/**
* @package      jcommunity
* @subpackage   
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
* @copyright    2008-2018 Laurent Jouanneau
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/


class loginZone extends jZone {

    protected $_tplname='login';

    protected function _prepareTpl() {
        $config = new \Jelix\JCommunity\Config();
        $this->_tpl->assign('canRegister', $config->isRegistrationEnabled());
        $this->_tpl->assign('canResetPassword', $config->isResetPasswordEnabled());

        if (jAuth::isConnected()) {
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
                // if there is a parameter indicating to go back to an url
                // let's insert it into the form
                if ($req->getParam('auth_url_return')) {
                    $this->_tpl->assign('url_return', $req->getParam('auth_url_return'));
                }
                // if the zone is used as main content, do not
                // assign url return
                else if ($this->param('as_main_content')) {
                    // do nothing
                }
                // here we are in a case where the zone is used as secondary
                // content (sidebar, menu...). url return is the current url.
                else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
                    $this->_tpl->assign('url_return', jUrl::getCurrentUrl(false, true));
                }
            }
        }
    }

}
