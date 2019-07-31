<?php
/**
 * @author       Laurent Jouanneau <laurent@jelix.org>
 * @contributor
 *
 * @copyright    2019 Laurent Jouanneau
 *
 * @link         http://jelix.org
 * @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
 */

/**
 * controller for an admin to resend the email + new validation key, when the user has
 * created an account
 */
class registration_admin_resendCtrl extends \Jelix\JCommunity\AbstractController
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
     * form to confirm to resend the email + new validation key
     */
    public function index()
    {
        $repError = $this->_checkadmin();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('register.admin.resend.email.title');

        $login = $this->param('login');
        $user = \jAuth::getUser($login);
        if (!$user || $user->email == '') {
            return $this->showError($rep, 'no_access_wronguser');
        }

        if ($user->status != \Jelix\JCommunity\Account::STATUS_NEW) {
            return $this->showError($rep, 'no_access_badstatus');
        }

        $tpl = new jTpl();
        $tpl->assign('login', $login);
        $rep->body->assign('MAIN', $tpl->fetch('registration_admin_resend'));

        return $rep;
    }

    /**
     * send an email with a new validation key
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
            $rep->title = jLocale::get('register.admin.resend.email.title');
            return $this->showError($rep, 'no_access_wronguser');
        }

        if ($user->status != \Jelix\JCommunity\Account::STATUS_NEW) {
            $rep = $this->_getjCommunityResponse();
            $rep->title = jLocale::get('register.admin.resend.email.title');
            return $this->showError($rep, 'no_access_badstatus');
        }


        $rep = $this->getResponse('redirect');
        $rep->action = 'registration_admin_resend:index';

        $registration = new \Jelix\JCommunity\Registration();
        $registration->resendRegistrationMail($user);

        $rep->action = 'registration_admin_resend:sent';
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
        $rep->title = jLocale::get('register.admin.resend.email.title');
        $tpl = new jTpl();
        $tpl->assign('login', $this->param('login'));
        $rep->body->assign('MAIN', $tpl->fetch('registration_admin_resend_done'));

        return $rep;
    }
}
