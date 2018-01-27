<?php
/**
* @package      jcommunity
* @subpackage
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
* @copyright    2007-2008 Laurent Jouanneau
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

include(dirname(__FILE__).'/../classes/defines.php');

class passwordCtrl extends \Jelix\JCommunity\AbstractController {

    public $pluginParams = array(
      '*'=>array('auth.required'=>false)
    );

    protected $configMethodCheck = 'isResetPasswordEnabled';

    /**
    * form to retrieve a lost password
    */
    function index() {
        $repError = $this->_check();
        if($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('password.forgotten.password');
        $rep->body->assignZone('MAIN','password');
        return $rep;
    }

    /**
    * send a new password 
    */
    function send() {
        $repError = $this->_check();
        if($repError) {
            return $repError;
        }

        $rep= $this->getResponse("redirect");
        $rep->action="password:index";

        $form = jForms::fill('password');
        if(!$form->check()){
            return $rep;
        }

        $login = $form->getData('pass_login');
        $user = jAuth::getUser($login);
        if(!$user){
            $form->setErrorOn('pass_login',jLocale::get('password.login.doesnt.exist'));
            return $rep;
        }

        if($user->email != $form->getData('pass_email')){
            $form->setErrorOn('pass_email',jLocale::get('password.email.unknown'));
            return $rep;
        }

        $pass = jAuth::getRandomPassword(8);
        $key = substr(md5($login.'-'.$pass),1,10);

        $user->status = JCOMMUNITY_STATUS_PWD_CHANGED;
        $user->request_date = date('Y-m-d H:i:s');
        $user->keyactivate = $key;
        jAuth::updateUser($user);

        $mail = new jMailer();
        $mail->From = jApp::config()->mailer['webmasterEmail'];
        $mail->FromName = jApp::config()->mailer['webmasterName'];
        $mail->Sender = jApp::config()->mailer['webmasterEmail'];
        $mail->Subject = jLocale::get('password.mail.pwd.change.subject');

        $tpl = new jTpl();
        $tpl->assign(compact('login','pass','key'));
        $tpl->assign('server',$_SERVER['SERVER_NAME']);
        $mail->Body = $tpl->fetch('mail_password_change', 'text');

        $mail->AddAddress($user->email);
        //$mail->SMTPDebug = true;
        $mail->Send();

        jForms::destroy('password');
        $rep->action="password:confirmform";
        return $rep;
    }

    /**
    * form to enter the confirmation key
    * to activate the new password
    */
    function confirmform() {
        $repError = $this->_check();
        if($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $form = jForms::get('confirmation');
        if($form == null){
            $form = jForms::create('confirmation');
        }
        $tpl = new jTpl();
        $tpl->assign('form',$form);
        $rep->body->assign('MAIN',$tpl->fetch('password_confirmation'));
        return $rep;
    }

    /**
    * activate a new password. the key should be given as a parameter
    */
    function confirm() {
        $repError = $this->_check();
        if($repError) {
            return $repError;
        }

        $rep= $this->getResponse("redirect");
        $rep->action="password:confirmform";

        if($_SERVER['REQUEST_METHOD'] != 'POST')
            return $rep;

        $form = jForms::fill('confirmation');
        if ($form == null) {
            return $rep;
        }

        if (!$form->check()) {
            return $rep;
        }

        $login = $form->getData('conf_login');
        $user = jAuth::getUser($login);
        if (!$user) {
            $form->setErrorOn('conf_login',jLocale::get('password.form.confirm.login.doesnt.exist'));
            return $rep;
        }

        if ($user->status != JCOMMUNITY_STATUS_PWD_CHANGED) {
            jForms::destroy('confirmation');
            $rep = $this->getResponse('html');
            $tpl = new jTpl();
            $tpl->assign('status',JCOMMUNITY_STATUS_VALID);
            $rep->body->assign('MAIN',$tpl->fetch('password_ok'));
            return $rep;
        }

        if ( strcmp($user->request_date , date('Y-m-d H:i:s', time()-(48*60*60))) < 0 ) {
            jForms::destroy('confirmation');
            $rep = $this->getResponse('html');
            $tpl = new jTpl();
            $tpl->assign('status',JCOMMUNITY_STATUS_MAIL_CHANGED);
            $rep->body->assign('MAIN',$tpl->fetch('password_ok'));
            return $rep;
        }

        if ($form->getData('conf_key') != $user->keyactivate) {
            $form->setErrorOn('conf_key',jLocale::get('password.form.confirm.bad.key'));
            return $rep;
        }

        $passwd = $form->getData('conf_password');
        $user->status = JCOMMUNITY_STATUS_VALID;
        jAuth::updateUser($user);
        jAuth::changePassword($login, $passwd);
        jAuth::login($login, $passwd);
        jForms::destroy('confirmation');
        $rep->action="password:confirmok";
        return $rep;
    }

    /**
    * Page which confirm that the account is activated
    */
    function confirmok() {
        // jcommunity response can be a single page without menu etc..
        // so we retrieve the standard response to be sure that the user have links
        // to navigate into the web site
        $rep = $this->getResponse('html');
        $tpl = new jTpl();
        $tpl->assign('status',JCOMMUNITY_STATUS_NEW);
        $rep->body->assign('MAIN',$tpl->fetch('password_ok'));
        return $rep;
    }
}
