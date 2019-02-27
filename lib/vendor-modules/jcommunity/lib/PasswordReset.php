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

    function sendEmail($login, $email) {
        $user = \jAuth::getUser($login);
        if (!$user || $user->email == '' || $user->email != $email) {
            return self::RESET_BAD_LOGIN_EMAIL;
        }

        if (!\jAuth::canChangePassword($login)) {
            return self::RESET_BAD_STATUS;
        }

        if ($user->status != Account::STATUS_VALID && $user->status != Account::STATUS_PWD_CHANGED) {
            return self::RESET_BAD_STATUS;
        }

        $key = sha1(crypt($login.'/'.$email, microtime()));
        $user->status = Account::STATUS_PWD_CHANGED;
        $user->request_date = date('Y-m-d H:i:s');
        $user->keyactivate = $key;
        \jAuth::updateUser($user);

        $domain = \jApp::coord()->request->getDomainName();
        $mail = new \jMailer();
        $mail->From = \jApp::config()->mailer['webmasterEmail'];
        $mail->FromName = \jApp::config()->mailer['webmasterName'];
        $mail->Sender = \jApp::config()->mailer['webmasterEmail'];
        $mail->Subject = \jLocale::get('password.mail.pwd.change.subject', $domain);

        $tpl = $mail->Tpl('mail_password_change', true);
        $tpl->assign('user', $user);
        $tpl->assign('domain_name', $domain);
        $tpl->assign('website_uri', \jApp::coord()->request->getServerURI());
        $tpl->assign('confirmation_link', \jUrl::getFull(
            'jcommunity~password_reset:resetform',
            array('login' => $user->login, 'key' => $user->keyactivate)
        ));

        $mail->AddAddress($user->email);
        $mail->Send();

        return self::RESET_OK;
    }

    const RESET_BAD_LOGIN_EMAIL = "badloginemail";

    const RESET_ALREADY_DONE = "alreadydone";
    const RESET_OK = "ok";
    const RESET_BAD_KEY = "badkey";
    const RESET_EXPIRED_KEY = "expiredkey";
    const RESET_BAD_STATUS = "badstatus";

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
        if ($user->status != Account::STATUS_PWD_CHANGED) {
            if ($user->status != Account::STATUS_VALID) {
                return self::RESET_ALREADY_DONE;
            }
            return self::RESET_BAD_STATUS;
        }

        if (!\jAuth::canChangePassword($login)) {
            return self::RESET_BAD_STATUS;
        }

        if ($user->keyactivate == '' ||
            $user->request_date == '' ||
            $user->keyactivate != $key
        ) {
            return self::RESET_BAD_KEY;
        }

        $dt = new \DateTime($user->request_date);
        $dtNow = new \DateTime();
        $dt->add(new \DateInterval('P2D')); // 48h
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