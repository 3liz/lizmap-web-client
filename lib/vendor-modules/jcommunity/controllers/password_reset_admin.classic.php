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
 * controller for the reset password process, initiated by an admin
 */
class password_reset_adminCtrl extends \Jelix\JCommunity\AbstractPasswordController
{

    public $pluginParams = array(
        '*' => array('auth.required' => false),
        'index' => array('auth.required' => true),
        'send' => array('auth.required' => true),
        'sent' => array('auth.required' => true),
    );

    protected $configMethodCheck = 'isResetAdminPasswordEnabled';

    protected $formPasswordTitle = 'password.form.create.title';

    protected $formPasswordTpl = 'password_reset_create';

    protected $forRegistrationByAdmin = false;

    protected $actionController = 'password_reset_admin';

    protected function _checkadmin()
    {
        if (!$this->config->isResetAdminPasswordEnabledForAdmin()) {
            return $this->notavailable();
        }
        return null;
    }


    /**
     * form to request a reset password.
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

        $passReset = new \Jelix\JCommunity\PasswordReset();
        $result = $passReset->sendEmail($login, $user->email,
            \Jelix\JCommunity\Account::STATUS_NEW,
            'jcommunity~mail.password.admin.reset.body.html',
            'jcommunity~password_reset_admin:resetform');
        if ($result != $passReset::RESET_OK) {
            $rep = $this->_getjCommunityResponse();
            $rep->title = jLocale::get('password.form.title');

            $tpl = new \jTpl();
            $tpl->assign('login', $login);
            $tpl->assign('error', jLocale::get('password.form.change.error.'.$result));
            $rep->body->assign('MAIN', $tpl->fetch('password_reset_admin_error'));
            return $rep;
        }

        jForms::destroy('password_reset');
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


    // see other actions into AbstractPasswordController

}
