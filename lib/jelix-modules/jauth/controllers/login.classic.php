<?php
/**
* @package     jelix-modules
* @subpackage  jauth
* @author      Laurent Jouanneau
* @contributor Antoine Detante, Bastien Jaillot, Loic Mathaud, Vincent Viaud
* @copyright   2005-2007 Laurent Jouanneau, 2007 Antoine Detante, 2008 Bastien Jaillot
* @copyright   2008 Loic Mathaud, 2011 Vincent Viaud
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


class loginCtrl extends jController {

    public $pluginParams = array(
      '*'=>array('auth.required'=>false)
    );

    /**
    *
    */
    function in (){
        $conf = jApp::coord()->getPlugin('auth')->config;
        $url_return = '/';

        // both after_login and after_logout config fields are required
        if ($conf['after_login'] == '')
            throw new jException ('jauth~autherror.no.after_login');

        if ($conf['after_logout'] == '')
            throw new jException ('jauth~autherror.no.after_logout');

        // if after_login_override = off or url_return doesnt exists, set url_return to after_login
        // if auth_url_return exists, redirect to it
        if (!($conf['enable_after_login_override'] && $url_return= $this->param('auth_url_return'))){
            $url_return =  jUrl::get($conf['after_login']);
        }

        if (!jAuth::login($this->param('login'), $this->param('password'), $this->param('rememberMe'))){
            // auth fails
            sleep (intval($conf['on_error_sleep']));
            $params = array ('login'=>$this->param('login'), 'failed'=>1);
            if($conf['enable_after_login_override'])
                $params['auth_url_return'] = $this->param('auth_url_return');
            $url_return = jUrl::get($conf['after_logout'],$params);
        }

        $rep = $this->getResponse('redirectUrl');
        $rep->url = $url_return;
        return $rep;
    }

    /**
    *
    */
    function out(){
        jAuth::logout();
        $conf = jApp::coord()->getPlugin ('auth')->config;

        if ($conf['after_logout'] == '')
            throw new jException ('jauth~autherror.no.after_logout');

        $url_return = $this->param('auth_url_return');
        if (!$conf['enable_after_logout_override'] || $url_return == null
              || $url_return == jUrl::getCurrentUrl()) { // we don't want to return to the current page if authentification is missing for this page
            $url_return =  jUrl::get($conf['after_logout'], array('auth_url_return'=>$url_return));
        }

        $rep = $this->getResponse('redirectUrl');
        $rep->url = $url_return;
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
