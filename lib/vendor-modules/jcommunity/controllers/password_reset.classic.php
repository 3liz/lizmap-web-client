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
 * controller for the password reset process, when a user has forgotten his
 * password, and want to change it
 */
class password_resetCtrl extends \Jelix\JCommunity\AbstractPasswordController
{

    /**
     * form to request a password reset.
     */
    public function index()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('password.form.title');
        $rep->body->assignZone('MAIN', 'passwordReset');

        return $rep;
    }

    /**
     * send an email to reset the password.
     */
    public function send()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->getResponse('redirect');
        $rep->action = 'password_reset:index';

        $form = jForms::fill('password_reset');
        if (!$form) {
            return $this->badParameters();
        }
        if (!$form->check()) {
            return $rep;
        }

        $login = $form->getData('pass_login');
        $email = $form->getData('pass_email');

        $passReset = new \Jelix\JCommunity\PasswordReset();
        $result = $passReset->sendEmail($login, $email);
        if ($result != $passReset::RESET_OK && $result != $passReset::RESET_BAD_LOGIN_EMAIL) {
            $form->setErrorOn('pass_login', jLocale::get('password.form.change.error.'.$result));
            return $rep;
        }

        jForms::destroy('password_reset');
        $rep->action = 'password_reset:sent';

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
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('password.form.title');
        $tpl = new jTpl();
        $rep->body->assign('MAIN', $tpl->fetch('password_reset_waiting'));

        return $rep;
    }


    // see other actions into AbstractPasswordController

}
