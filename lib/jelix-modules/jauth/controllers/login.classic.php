<?php
/**
* @package     jelix-modules
* @subpackage  jauth
* @author      Laurent Jouanneau
* @contributor Antoine Detante, Bastien Jaillot, Loic Mathaud, Vincent Viaud, Julien Issler
* @copyright   2005-2007 Laurent Jouanneau, 2007 Antoine Detante, 2008 Bastien Jaillot
* @copyright   2008 Loic Mathaud, 2011 Vincent Viaud, 2015 Julien Issler
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


class loginCtrl extends jController {

    public $sensitiveParameters = array('password');

    public $pluginParams = array(
      '*'=>array('auth.required'=>false)
    );

    /**
    *
    */
    function in (){
        $conf = jApp::coord()->getPlugin('auth')->config;

        // both after_login and after_logout config fields are required
        if ($conf['after_login'] == '') {
            throw new jException ('jauth~autherror.no.after_login');
        }

        if ($conf['after_logout'] == '') {
            throw new jException ('jauth~autherror.no.after_logout');
        }

        $rep = $this->getResponse('redirectUrl');
        if (!jAuth::login($this->param('login'),
                          $this->param('password'),
                          $this->param('rememberMe'))) {
            // auth fails
            sleep (intval($conf['on_error_sleep']));
            $params = array ('login'=>$this->param('login'), 'failed'=>1);
            if($conf['enable_after_login_override']) {
                $params['auth_url_return'] = $this->param('auth_url_return');
            }
            $rep->url = jUrl::get($conf['after_logout'], $params);
        }
        else {
            if ($conf['enable_after_login_override']) {
                $url_return = $this->param('auth_url_return');
                if ($url_return) {
                    $rep->url = $url_return;
                }
                else {
                    $rep->url =  jUrl::get($conf['after_login']);
                }
            }
            else {
                $rep->url =  jUrl::get($conf['after_login']);
            }
        }

        return $rep;
    }

    /**
    *
    */
    function out(){
        $rep = $this->getResponse('redirectUrl');
        jAuth::logout();
        $conf = jApp::coord()->getPlugin ('auth')->config;

        if ($conf['after_logout'] == '')
            throw new jException ('jauth~autherror.no.after_logout');

        if (jApp::coord()->execOriginalAction()) {
            if ($conf['enable_after_logout_override'] && ($url_return = $this->param('auth_url_return'))) {
                $rep->url = $url_return;
            }
            else {
                $rep->url =  jUrl::get($conf['after_logout']);
            }
        }
        else {
            // we are here because of an internal redirection (authentication missing)
            // if we can indicate the url to go after the login, let's pass this url
            // to the next action (which is in most of case a login form)
            if ($conf['enable_after_login_override'] && $_SERVER['REQUEST_METHOD'] == 'GET') {
                $rep->url = jUrl::get($conf['after_logout'],
                                      array('auth_url_return'=> jUrl::getCurrentUrl()));
            }
            else {
                $rep->url = jUrl::get($conf['after_logout']);
            }
        }

        return $rep;
    }

    /**
    * Shows the login form
    */
    function form() {
        $conf = jApp::coord()->getPlugin('auth')->config;
        if (jAuth::isConnected()) {
            if ($conf['after_login'] != '') {
                if (!($conf['enable_after_login_override'] &&
                      $url_return= $this->param('auth_url_return'))){
                    $url_return =  jUrl::get($conf['after_login']);
                }
                $rep = $this->getResponse('redirectUrl');
                $rep->url = $url_return;
                return $rep;
            }
        }

        $rep = $this->getResponse('htmlauth');
        $rep->title =  jLocale::get ('auth.titlePage.login');
        $rep->bodyTpl = 'jauth~index';

        $zp = array ('login'=>$this->param('login'),
                     'failed'=>$this->param('failed'),
                     'showRememberMe'=>jAuth::isPersistant());

        if ($conf['enable_after_login_override']) {
            $zp['auth_url_return'] = $this->param('auth_url_return');
        }

        $rep->body->assignZone ('MAIN', 'jauth~loginform', $zp);
        return $rep;
    }
}
