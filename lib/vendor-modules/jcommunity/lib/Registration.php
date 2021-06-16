<?php
/**
 * @author       Laurent Jouanneau <laurent@jelix.org>
 * @copyright    2018 Laurent Jouanneau
 *
 * @link         http://jelix.org
 * @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
 */

namespace Jelix\JCommunity;

class Registration
{
    /**
     * Create a user object.
     *
     * @param string $login
     * @param string $email
     * @param string $password
     *
     * @return object
     */
    public function createUser($login, $email, $password)
    {
        if (\jAuth::getUser($login)) {
            throw new \LogicException("User $login already exists");
        }
        $key = sha1(password_hash($login.$password.microtime(), PASSWORD_DEFAULT));

        $user = \jAuth::createUserObject($login, $password);
        $user->email = $email;
        $user->status = Account::STATUS_NEW;
        $user->request_date = date('Y-m-d H:i:s');
        $user->keyactivate = 'U:'.$key;

        return $user;
    }

    /**
     * @param \jFormsBase $form
     */
    public function createUserByAdmin($user) {
        $config = new \Jelix\JCommunity\Config();
        if ($config->isResetAdminPasswordEnabledForAdmin()) {
            $key = sha1(password_hash($user->login.$user->password.microtime(), PASSWORD_DEFAULT));
            $user->status = Account::STATUS_NEW;
            $user->request_date = date('Y-m-d H:i:s');
            $user->keyactivate = 'A:'.$key;
            $this->sendRegistrationMail($user,
                'jcommunity~mail.registration.admin.body.html',
                'jcommunity~password_confirm_registration:resetform');
            \jAuth::updateUser($user);
        }
    }


    /**
     * Create the user account and send an email.
     *
     * @param object $user the user created with createUser()
     */
    public function createAccount($user)
    {
        $this->sendRegistrationMail($user,
            'jcommunity~mail.registration.body.html',
            'jcommunity~registration:confirm');
        \jAuth::saveNewUser($user);
    }

    public function resendRegistrationMail($user)
    {
        $key = sha1(password_hash($user->login.$user->password.microtime(), PASSWORD_DEFAULT));
        $user->status = Account::STATUS_NEW;
        $user->request_date = date('Y-m-d H:i:s');
        if (preg_match('/^([AU]):/', $user->keyactivate , $m) && $m[1] == 'A') {
            $user->keyactivate = 'A:'.$key;
            $this->sendRegistrationMail($user,
                'jcommunity~mail.registration.admin.body.html',
                'jcommunity~password_confirm_registration:resetform');
        }
        else {
            $user->keyactivate = 'U:'.$key;
            $this->sendRegistrationMail($user,
                'jcommunity~mail.registration.body.html',
                'jcommunity~registration:confirm');
        }
        \jAuth::updateUser($user);
    }


    protected function sendRegistrationMail($user, $tplLocaleId, $mailLinkAction)
    {
        if (method_exists('jServer', 'getDomainName')) {
            $domain = \jServer::getDomainName();
            $websiteUri =  \jServer::getServerURI();
        }
        else {
            // old version of jelix < 1.7.5 && < 1.6.30
            $domain = \jApp::coord()->request->getDomainName();
            $websiteUri = \jApp::coord()->request->getServerURI();
        }

        $mail = new \jMailer();
        $mail->From = \jApp::config()->mailer['webmasterEmail'];
        $mail->FromName = \jApp::config()->mailer['webmasterName'];
        $mail->Sender = \jApp::config()->mailer['webmasterEmail'];
        $mail->Subject = \jLocale::get('jcommunity~mail.registration.subject', $domain);
        $mail->AddAddress($user->email);
        $mail->isHtml(true);

        $config = new Config();
        $tpl = new \jTpl();
        $tpl->assign('user', $user);
        $tpl->assign('domain_name', $domain);
        $basePath = \jApp::urlBasePath();
        $tpl->assign('basePath', ($basePath == '/'?'':$basePath));
        $tpl->assign('website_uri', $websiteUri.($basePath == '/'?'':$basePath));
        $tpl->assign('confirmation_link', \jUrl::getFull(
            $mailLinkAction,
            array('login' => $user->login, 'key' => substr($user->keyactivate, 2))
        ));
        $tpl->assign('validationKeyTTL', $config->getValidationKeyTTLAsString());

        $body = $tpl->fetchFromString(\jLocale::get($tplLocaleId), 'html');
        $mail->msgHTML($body, '', array($mail, 'html2textKeepLinkSafe'));
        $mail->Send();
    }


    const CONFIRMATION_ALREADY_DONE = "alreadydone";
    const CONFIRMATION_DONE = "ok";
    const CONFIRMATION_BAD_KEY = "badkey";
    const CONFIRMATION_BAD_STATUS = "badstatus";
    const CONFIRMATION_EXPIRED_KEY = "expiredkey";

    /**
     * @return string one of CONFIRMATION_* const
     */
    public function confirm($login, $key) {
        $user = \jAuth::getUser($login);
        if (!$user) {
            return self::CONFIRMATION_BAD_KEY;
        }

        if ($user->status != Account::STATUS_NEW) {
            if ($user->status == Account::STATUS_VALID) {
                return self::CONFIRMATION_ALREADY_DONE;
            }
            return self::CONFIRMATION_BAD_STATUS;
        }

        if ($user->keyactivate == '') {
            return self::CONFIRMATION_BAD_KEY;
        }

        $keyactivate = $user->keyactivate;
        if (preg_match('/^([AU]:)(.+)$/', $keyactivate , $m)) {
            $keyactivate = $m[2];
        }

        if ($keyactivate != $key) {
            return self::CONFIRMATION_BAD_KEY;
        }

        $config = new Config();
        $dtNow = new \DateTime();
        $dt = new \DateTime($user->request_date);
        $dt->add($config->getValidationKeyTTL()); // 48h
        if ($dt < $dtNow ) {
            return self::CONFIRMATION_EXPIRED_KEY;
        }

        $user->keyactivate = '';
        $user->status = Account::STATUS_VALID;
        \jEvent::notify('jcommunity_registration_confirm', array('user' => $user));
        \jAuth::updateUser($user);
        return self::CONFIRMATION_DONE;
    }

}
