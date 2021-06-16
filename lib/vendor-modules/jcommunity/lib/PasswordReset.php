<?php
/**
 * @author       Laurent Jouanneau <laurent@jelix.org>
 * @copyright    2018-2019 Laurent Jouanneau
 *
 * @link         http://jelix.org
 * @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
 */

namespace Jelix\JCommunity;

class PasswordReset {

    protected $forRegistration = false;

    protected $byAdmin = false;

    protected $subjectLocaleId = '';

    protected $tplLocaleId = '';


    function __construct($forRegistration = false, $byAdmin = false) {
        $this->forRegistration = $forRegistration;
        $this->byAdmin = $byAdmin;

        if ($byAdmin) {
            $this->subjectLocaleId = 'jcommunity~mail.password.admin.reset.subject';
            $this->tplLocaleId = 'jcommunity~mail.password.admin.reset.body.html';
        }
        else {
            $this->subjectLocaleId = 'jcommunity~mail.password.reset.subject';
            $this->tplLocaleId = 'jcommunity~mail.password.reset.body.html';
        }
    }


    function sendEmail($login, $email)
    {
        $user = \jAuth::getUser($login);
        if (!$user || $user->email == '' || $user->email != $email) {
            \jLog::log('A password reset is attempted for unknown user "'.$login.'" and/or unknown email  "'.$email.'"', 'warning');
            return self::RESET_BAD_LOGIN_EMAIL;
        }

        if (!\jAuth::canChangePassword($login)) {
            return self::RESET_BAD_STATUS;
        }

        if ($user->status != Account::STATUS_VALID &&
            $user->status != Account::STATUS_PWD_CHANGED &&
            $user->status != Account::STATUS_NEW
        ) {
            return self::RESET_BAD_STATUS;
        }

        $key = sha1(password_hash($login.$email.microtime(),PASSWORD_DEFAULT));
        if ($user->status != Account::STATUS_NEW) {
            $user->status = Account::STATUS_PWD_CHANGED;
        }
        $user->request_date = date('Y-m-d H:i:s');
        $user->keyactivate = ($this->byAdmin?'A:':'U:').$key;

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
        $mail->Subject = \jLocale::get($this->subjectLocaleId, $domain);
        $mail->AddAddress($user->email);
        $mail->isHtml(true);

        $tpl = new \jTpl();
        $tpl->assign('user', $user);
        $tpl->assign('domain_name', $domain);
        $basePath = \jApp::urlBasePath();
        $tpl->assign('basePath', ($basePath == '/'?'':$basePath));
        $tpl->assign('website_uri', $websiteUri.($basePath == '/'?'':$basePath));
        $tpl->assign('confirmation_link', \jUrl::getFull(
            'jcommunity~password_reset:resetform@classic',
            array('login' => $user->login, 'key' => $key)
        ));
        $config = new Config();
        $tpl->assign('validationKeyTTL', $config->getValidationKeyTTLAsString());

        $body = $tpl->fetchFromString(\jLocale::get($this->tplLocaleId), 'html');
        $mail->msgHTML($body, '', array($mail, 'html2textKeepLinkSafe'));
        try {
            $mail->Send();
        }
        catch(\phpmailerException $e) {
            \jLog::logEx($e, 'error');
            return self::RESET_MAIL_SERVER_ERROR;
        }

        \jAuth::updateUser($user);

        return self::RESET_OK;
    }

    const RESET_BAD_LOGIN_EMAIL = "badloginemail";

    const RESET_ALREADY_DONE = "alreadydone";
    const RESET_OK = "ok";
    const RESET_BAD_KEY = "badkey";
    const RESET_EXPIRED_KEY = "expiredkey";
    const RESET_BAD_STATUS = "badstatus";
    const RESET_MAIL_SERVER_ERROR = "smtperror";

    /**
     * @param string $login
     * @param string $key
     * @return object|string
     * @throws \Exception
     */
    function checkKey($login, $key)
    {
        if ($login == '' || $key == '') {
            return self::RESET_BAD_KEY;
        }
        $user = \jAuth::getUser($login);
        if (!$user) {
            return self::RESET_BAD_KEY;
        }

        if ($user->keyactivate == '' ||
            $user->request_date == ''
        ) {
            return self::RESET_BAD_KEY;
        }
        $keyactivate = $user->keyactivate;

        if (preg_match('/^([AU]:)(.+)$/', $keyactivate , $m)) {
            $keyactivate = $m[2];
        }

        if ($keyactivate != $key) {
            return self::RESET_BAD_KEY;
        }

        $expectedStatus = ($this->forRegistration? Account::STATUS_NEW : Account::STATUS_PWD_CHANGED);
        if ($user->status != $expectedStatus) {
            if ($user->status == Account::STATUS_VALID) {
                return self::RESET_ALREADY_DONE;
            }
            return self::RESET_BAD_STATUS;
        }

        if (!\jAuth::canChangePassword($login)) {
            return self::RESET_BAD_STATUS;
        }

        $config = new Config();
        $dt = new \DateTime($user->request_date);
        $dtNow = new \DateTime();
        $dt->add($config->getValidationKeyTTL());
        if ($dt < $dtNow ) {
            return self::RESET_EXPIRED_KEY;
        }
        return $user;
    }

    function changePassword($user, $newPassword) {
        $user->status = Account::STATUS_VALID;
        $user->keyactivate = '';
        \jAuth::updateUser($user);
        \jAuth::changePassword($user->login, $newPassword);
    }

}
