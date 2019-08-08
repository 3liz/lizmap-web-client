<?php
/**
 * @author       Laurent Jouanneau <laurent@xulfr.org>
 * @contributor
 *
 * @copyright    2007-2019 Laurent Jouanneau
 *
 * @link         http://jelix.org
 * @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
 */

/**
 * controller for the password reset process, initiated by an admin
 */
class password_reset_adminCtrl extends \Jelix\JCommunity\AbstractController
{

    public $pluginParams = array(
        '*' => array('auth.required' => true)
    );

    protected function _checkadmin()
    {
        if (!$this->config->isResetAdminPasswordEnabledForAdmin()) {
            return $this->notavailable();
        }
        return null;
    }


    /**
     * form to confirm the password reset
     */
    public function index()
    {
        $repError = $this->_checkadmin();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('password.form.title');

        $login = $this->param('login');
        $user = \jAuth::getUser($login);
        if (!$user || $user->email == '') {
            return $this->showError($rep, 'no_access_wronguser');
        }

        $tpl = new jTpl();
        $tpl->assign('login', $login);
        $rep->body->assign('MAIN', $tpl->fetch('password_reset_admin'));

        return $rep;
    }

    /**
     * send an email to reset the password.
     */
    public function send()
    {
        $repError = $this->_checkadmin();
        if ($repError) {
            return $repError;
        }

        $login = $this->param('pass_login');
        $user = \jAuth::getUser($login);
        if (!$user || $user->email == '') {
            $rep = $this->_getjCommunityResponse();
            $rep->title = jLocale::get('password.form.title');
            return $this->showError($rep, 'no_access_wronguser');
        }

        $rep = $this->getResponse('redirect');
        $rep->action = 'password_reset_admin:index';

        if ($user->status == \Jelix\JCommunity\Account::STATUS_VALID ||
            $user->status == \Jelix\JCommunity\Account::STATUS_PWD_CHANGED
        ) {
            $passReset = new \Jelix\JCommunity\PasswordReset(true, true);
            $result = $passReset->sendEmail($login, $user->email);
        }
        else {
            $result = \Jelix\JCommunity\PasswordReset::RESET_BAD_STATUS;
        }

        if ($result != \Jelix\JCommunity\PasswordReset::RESET_OK) {
            $rep = $this->_getjCommunityResponse();
            $rep->title = jLocale::get('password.form.title');

            $tpl = new \jTpl();
            $tpl->assign('login', $login);
            $tpl->assign('error', jLocale::get('jcommunity~password.form.change.error.admin.'.$result));
            $rep->body->assign('MAIN', $tpl->fetch('jcommunity~password_reset_admin_error'));
            return $rep;
        }

        $rep->action = 'password_reset_admin:sent';
        $rep->params = array('login'=>$login);

        return $rep;
    }

    /**
     * Display the message that confirms the email sending
     *
     * @return jResponse|jResponseHtml|jResponseJson|jResponseRedirect|void
     * @throws Exception
     * @throws jExceptionSelector
     */
    public function sent() {
        $repError = $this->_checkadmin();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('password.form.title');
        $tpl = new jTpl();
        $tpl->assign('login', $this->param('login'));
        $rep->body->assign('MAIN', $tpl->fetch('password_reset_admin_waiting'));

        return $rep;
    }
}
