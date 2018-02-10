<?php
/**
* @author       Laurent Jouanneau <laurent@xulfr.org>
* @contributor
*
* @copyright    2007-2018 Laurent Jouanneau
*
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/
class passwordCtrl extends \Jelix\JCommunity\AbstractController
{
    public $pluginParams = array(
      '*' => array('auth.required' => false),
    );

    protected $configMethodCheck = 'isResetPasswordEnabled';

    /**
     * form to reset a password.
     */
    public function index()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('password.form.title');
        $rep->body->assignZone('MAIN', 'password');

        return $rep;
    }

    /**
     * send an email to change the password.
     */
    public function send()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->getResponse('redirect');
        $rep->action = 'password:index';

        $form = jForms::fill('password');
        if (!$form->check()) {
            return $rep;
        }

        $login = $form->getData('pass_login');
        $email = $form->getData('pass_email');

        $passReset = new \Jelix\JCommunity\PasswordReset();
        $result = $passReset->sendEmail($login, $email);
        if ($result != $passReset::RESET_OK) {
            $form->setErrorOn('pass_login', jLocale::get('password.form.change.error.'.$result));
            return $rep;
        }

        jForms::destroy('password');
        $rep->action = 'password:sent';

        return $rep;
    }

    public function sent() {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('password.waiting.title');
        $tpl = new jTpl();
        $rep->body->assign('MAIN', $tpl->fetch('password_waiting'));

        return $rep;
    }


    /**
     * form to confirm and change the password
     */
    public function resetform()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('password.form.change.title');

        $passReset = new \Jelix\JCommunity\PasswordReset();
        $tpl = new jTpl();

        $form = jForms::get('password_change');
        if ($form == null) {
            $login = $this->param('login');
            $key = $this->param('key');

            $user = $passReset->checkKey($login, $key);
            if (is_string($user)) {
                $status = $user;
                $tpl->assign('error_status', $status);
                $rep->body->assign('MAIN', $tpl->fetch('password_change'));
                return $rep;
            }

            $form = jForms::create('password_change');
            $form->setData('pchg_login', $login);
            $form->setData('pchg_key', $key);
        }
        $tpl->assign('error_status', '');
        $tpl->assign('form', $form);

        $rep->body->assign('MAIN', $tpl->fetch('password_change'));

        return $rep;
    }

    /**
     * activate a new password.
     */
    public function save()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->getResponse('redirect');
        $rep->action = 'password:resetform';

        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return $rep;
        }

        $form = jForms::fill('password_change');
        if ($form == null) {
            return $rep;
        }

        if (!$form->check()) {
            return $rep;
        }

        $passReset = new \Jelix\JCommunity\PasswordReset();
        $login = $form->getData('pchg_login');
        $key = $form->getData('pchg_key');
        $passwd = $form->getData('pchg_password');
        jForms::destroy('password_change');

        $user = $passReset->checkKey($login, $key);
        if (is_string($user)) {
            $rep->params = array('login'=>$login, 'key'=>$key);
            return $rep;
        }
        $passReset->changePassword($user, $passwd);

        $rep->action = 'password:changed';
        return $rep;
    }

    /**
     * Page which confirm that the password has changed.
     */
    public function changed()
    {
        // jcommunity response can be a single page without menu etc..
        // so we retrieve the standard response to be sure that the user have links
        // to navigate into the web site
        $rep = $this->getResponse('html');
        $tpl = new jTpl();
        $rep->body->assign('MAIN', $tpl->fetch('password_ok'));

        return $rep;
    }
}
