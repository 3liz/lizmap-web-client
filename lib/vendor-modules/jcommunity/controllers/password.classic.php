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
 * controller allowing the authenticated user to change his own password
 */
class passwordCtrl extends \Jelix\JCommunity\AbstractController
{
    public $pluginParams = array(
        '*' => array('auth.required' => true),
    );

    protected $configMethodCheck = 'isPasswordChangeEnabled';
    protected $checkIsConnected = false;
    protected $responseId = 'html';

    protected function _check()
    {
        $rep = parent::_check();
        if ($rep !== null) {
            return $rep;
        }
        $user = jAuth::getUserSession();

        if ($this->param('user') != $user->login) {
            return $this->noaccess('no_access_wronguser');
        }

        if (!jAuth::canChangePassword($user->login)) {
            return $this->notavailable();
        }
        return null;
    }


    /**
     * form to change a password.
     */
    public function index()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->getResponse('html');
        $rep->title = jLocale::get('password.form.change.title');

        $tpl = new jTpl();

        $form = jForms::get('password_change');
        if ($form == null) {
            $form = jForms::create('password_change');
        }

        if (jAuth::getUserSession()->status < \Jelix\JCommunity\Account::STATUS_VALID) {
            $tpl->assign('error_status', 'badstatus');
        }
        else {
            $tpl->assign('error_status', '');
        }

        $tpl->assign('form', $form);
        $tpl->assign('login', jAuth::getUserSession()->login);
        $rep->body->assign('MAIN', $tpl->fetch('password_change'));

        return $rep;
    }

    /**
     * Save a new password after a reset request
     */
    public function save()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }
        $user = jAuth::getUserSession();

        $rep = $this->getResponse('redirect');
        $rep->action = 'password:index';
        $rep->params = array('user'=> $user->login);

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

        if (!jAuth::verifyPassword($user->login, $form->getData('pchg_current_password'))) {
            $form->setErrorOn('pchg_current_password',
                jLocale::get('jcommunity~password.form.change.error.badcurrentpwd'));
            return $rep;
        }


        $newPassword = $form->getData('pchg_password');
        jForms::destroy('password_change');
        \jAuth::changePassword($user->login, $newPassword);

        $rep->action = 'password:changed';
        return $rep;
    }

    /**
     * Page which confirm that the password has changed.
     */
    public function changed()
    {
        $rep = $this->getResponse('html');
        $rep->title = jLocale::get('password.form.change.title');
        $tpl = new jTpl();
        $tpl->assign('login', jAuth::getUserSession()->login);
        $rep->body->assign('MAIN', $tpl->fetch('password_change_ok'));

        return $rep;
    }
}
