<?php
/**
* @author       Laurent Jouanneau <laurent@jelix.org>
* @contributor
*
* @copyright    2007-2018 Laurent Jouanneau
*
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

use \Jelix\JCommunity\Registration;

class registrationCtrl extends \Jelix\JCommunity\AbstractController
{
    public $pluginParams = array(
      '*' => array('auth.required' => false),
    );

    protected $configMethodCheck = 'isRegistrationEnabled';

    /**
     * registration form.
     */
    public function index()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('register.registration.title');
        $rep->body->assignZone('MAIN', 'registration');

        return $rep;
    }

    /**
     * save new user and send an email for a confirmation, with
     * a key to activate the account.
     */
    public function save()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->getResponse('redirect');
        $rep->action = 'registration:index';

        $form = jForms::get('registration');
        if (!$form) {
            return $rep;
        }

        jEvent::notify('jcommunity_registration_init_form', array('form' => $form));

        $form->initFromRequest();
        if (!$form->check()) {
            return $rep;
        }

        $login = $form->getData('reg_login');

        $registration = new Registration();

        try {
            $user = $registration->createUser(
                $form->getData('reg_login'),
                $form->getData('reg_email'),
                $form->getData('reg_password')
            );
        } catch (\LogicException $e) {
            $form->setErrorOn('reg_login', jLocale::get('register.form.login.exists'));

            return $rep;
        }

        $ev = jEvent::notify('jcommunity_registration_prepare_save', array('form' => $form, 'user' => $user));

        if (count($form->getErrors())) {
            return $rep;
        }

        $responses = $ev->getResponse();
        $hasErrors = false;
        foreach ($responses as $response) {
            if (isset($response['errorRegistration']) && $response['errorRegistration'] != '') {
                jMessage::add($response['errorRegistration'], 'error');
                $hasErrors = true;
            }
        }

        if ($hasErrors) {
            return $rep;
        }

        jEvent::notify('jcommunity_registration_after_save', array('form' => $form, 'user' => $user));

        $registration->createAccount($user);

        jForms::destroy('registration');

        $rep->action = 'registration:saved';
        return $rep;
    }

    public function saved()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->_getjCommunityResponse();
        $rep->title = jLocale::get('register.registration.waiting.title');
        $tpl = new jTpl();
        $rep->body->assign('MAIN', $tpl->fetch('registration_waiting'));

        return $rep;
    }

    /**
     * activate an account. the login and the key should be given as parameters.
     */
    public function confirm()
    {
        $repError = $this->_check();
        if ($repError) {
            return $repError;
        }

        $rep = $this->getResponse('html');

        $login = $this->param('login');
        $key = $this->param('key');
        $registration = new Registration();

        $result = $registration->confirm($login, $key);

        $tpl = new jTpl();
        $tpl->assign('status', $result);
        $rep->title = jLocale::get('register.registration.confirm.title');
        $rep->body->assign('MAIN', $tpl->fetch('registration_confirm'));
        return $rep;
    }
}
