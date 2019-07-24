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
        $key = sha1(password_hash($login.$password.microtime(),PASSWORD_DEFAULT));

        $user = \jAuth::createUserObject($login, $password);
        $user->email = $email;
        $user->status = Account::STATUS_NEW;
        $user->request_date = date('Y-m-d H:i:s');
        $user->keyactivate = $key;

        return $user;
    }

    /**
     * Create the user account and send an email.
     *
     * @param object $user the user created with createUser()
     */
    public function createAccount($user)
    {
        \jAuth::saveNewUser($user);

        $domain = \jApp::coord()->request->getDomainName();
        $mail = new \jMailer();
        $mail->From = \jApp::config()->mailer['webmasterEmail'];
        $mail->FromName = \jApp::config()->mailer['webmasterName'];
        $mail->Sender = \jApp::config()->mailer['webmasterEmail'];
        $mail->Subject = \jLocale::get('register.mail.new.subject', $domain);

        $tpl = $mail->Tpl('mail_registration', true);
        $tpl->assign('user', $user);
        $tpl->assign('domain_name', $domain);
        $tpl->assign('website_uri', \jApp::coord()->request->getServerURI());
        $tpl->assign('confirmation_link', \jUrl::getFull(
            'jcommunity~registration:confirm',
            array('login' => $user->login, 'key' => $user->keyactivate)
        ));

        $mail->AddAddress($user->email);
        $mail->Send();
    }


    const CONFIRMATION_ALREADY_DONE = "alreadydone";
    const CONFIRMATION_DONE = "ok";
    const CONFIRMATION_BAD_KEY = "badkey";
    const CONFIRMATION_BAD_STATUS = "badstatus";

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

        if ($user->keyactivate == '' || $key != $user->keyactivate) {
            return self::CONFIRMATION_BAD_KEY;
        }

        // FIXME verify the date of the request to not accept a confirmation after X days
        $user->keyactivate = '';
        $user->status = Account::STATUS_VALID;
        \jEvent::notify('jcommunity_registration_confirm', array('user' => $user));
        \jAuth::updateUser($user);
        return self::CONFIRMATION_DONE;
    }

}
