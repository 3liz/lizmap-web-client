<?php

namespace Lizmap\App;

use Lizmap\Project\Project;

class Checker
{
    /**
     * Check if the login is valid.
     *
     * @param string $login the login to check
     *
     * @return bool True if the login is valid
     */
    public static function isValidLogin($login)
    {
        if ($login === '') {
            \jLog::log('Checker::isValidLogin: empty login', 'warning');

            return false;
        }

        if (trim($login) !== $login) {
            \jLog::log('Checker::isValidLogin: trimmed login is not the same as login', 'warning');

            return false;
        }

        // control characters (NUL, line feed...) are not allowed
        return !preg_match('/[\x00-\x1F\x7F]/', $login);
    }

    /**
     * Check if credentials of the user are correct.
     *
     * The BASIC authentication is stateless: the session is closed without being written,
     * and the authenticated user is only available for the current request.
     * Nothing done during a request sent with BASIC credentials is stored in the session,
     * so no logout is needed, even if the request ends early or with an error.
     *
     * @param array $serverVars Server variables, including authentication details
     *
     * @return bool True if
     *              * no BASIC authentication is needed
     *              * authentication is OK with login & password from $_SERVER variable
     *              False otherwise if $_SERVER login & password are incorrect
     */
    public static function checkCredentials($serverVars)
    {
        // No BASIC authentication
        if (!isset($serverVars['PHP_AUTH_USER'])) {
            return true;
        }

        // BASIC authentication: nothing from this request must be stored in the session
        static::closeSessionWithoutWriting();

        // Empty login (e.g. "Authorization: Basic Og==" sent by some clients): wrong credentials
        if ($serverVars['PHP_AUTH_USER'] === '') {
            \jLog::log('Basic authentication: Empty login sent by client', 'warning');

            return false;
        }

        // Checking the login
        $login = $serverVars['PHP_AUTH_USER'];
        if (!self::isValidLogin($login)) {
            \jLog::log('Basic authentication: Invalid login sent by client', 'warning');

            return false;
        }

        // Empty password: wrong credentials
        if (!isset($serverVars['PHP_AUTH_PW'])) {
            // The login has been valited and not matched /[\x00-\x1F\x7F]/, but the password is missing
            \jLog::log('Basic authentication for user: `'.$login.'` is missing password', 'warning');

            return false;
        }

        return static::loginForRequest($login, $serverVars['PHP_AUTH_PW']);
    }

    /**
     * Authenticate the user for the current request only.
     *
     * Same checks as jAuth::login(), with the same events (AuthBeforeLogin, AuthCanLogin,
     * AuthErrorLogin), but the session id is not regenerated and AuthLogin is not notified:
     * no session is opened, the user is only stored in memory for the current request.
     *
     * @param string $login    The login sent by the client
     * @param string $password The password sent by the client
     *
     * @return bool True if the user is authenticated
     */
    protected static function loginForRequest($login, $password)
    {
        // Listeners can forbid the login
        foreach (static::notifyAuthEvent('AuthBeforeLogin', array('login' => $login)) as $rep) {
            if (isset($rep['processlogin']) && $rep['processlogin'] === false) {
                return false;
            }
        }

        // Check the password
        $user = static::verifyPassword($login, $password);
        if (!$user) {
            static::notifyAuthEvent('AuthErrorLogin', array('login' => $login));

            return false;
        }

        // The account must be allowed to log in (e.g. not disabled)
        // The given login may be another property like the email, so use the real login
        $params = array('login' => $user->login, 'user' => $user);
        foreach (static::notifyAuthEvent('AuthCanLogin', $params) as $rep) {
            if (!isset($rep['canlogin']) || $rep['canlogin'] === false) {
                return false;
            }
        }

        static::setRequestUser($user);

        return true;
    }

    /**
     * Check the password of the user with the authentication driver.
     *
     * @param string $login    The login sent by the client
     * @param string $password The password sent by the client
     *
     * @return false|object The user, or false if the login or the password is wrong
     */
    protected static function verifyPassword($login, $password)
    {
        return \jAuth::getDriver()->verifyPassword($login, $password);
    }

    /**
     * Notify an authentication event.
     *
     * @param string $name   The event name
     * @param array  $params The event parameters
     *
     * @return array The responses of the listeners
     */
    protected static function notifyAuthEvent($name, $params)
    {
        return \jEvent::notify($name, $params)->getResponse();
    }

    /**
     * Set the authenticated user for the current request.
     *
     * The user is put where jAuth reads it, in $_SESSION, but the session has already been
     * closed without being written (see closeSessionWithoutWriting()): it is never stored.
     *
     * @param object $user The authenticated user
     */
    protected static function setRequestUser($user)
    {
        $config = \jAuth::loadConfig();
        $_SESSION[$config['session_name']] = $user;
    }

    /**
     * Close the session without writing it.
     *
     * $_SESSION stays readable and writable in memory for the current request,
     * but the changes are not stored, and the session lock is released.
     */
    protected static function closeSessionWithoutWriting()
    {
        if (session_status() == \PHP_SESSION_ACTIVE) {
            session_abort();
        }
    }

    /**
     * Logout the user authenticated by BASIC HTTP authentication.
     *
     * The BASIC authentication is stateless (see checkCredentials()): the user is only removed
     * from memory for the rest of the request, nothing has been stored in the session.
     *
     * @deprecated Not needed anymore, the BASIC authentication does not store anything in the session
     *
     * @param array $serverVars Server variables, including authentication details
     *
     * @return bool True if the user was logged out, false otherwise
     */
    public static function logoutCredentials($serverVars)
    {
        // No BASIC authentication
        if (!isset($serverVars['PHP_AUTH_USER'])) {
            return false;
        }

        // Check that it's the same user as the one authenticated for the request
        $config = \jAuth::loadConfig();
        $sessionName = $config['session_name'];
        if (!isset($_SESSION[$sessionName])
            || $_SESSION[$sessionName]->login === ''
            || $serverVars['PHP_AUTH_USER'] != $_SESSION[$sessionName]->login) {
            return false;
        }

        // Remove the user from memory only, without session change nor event
        $_SESSION[$sessionName] = new \jAuthDummyUser();

        return true;
    }

    /**
     * Check if the user has access to the WFS service.
     *
     * @param Project $project The Lizmap project
     *
     * @return bool true if the user has access to the WFS service
     */
    public static function checkWfsAccessAcl($project)
    {
        $appContext = $project->getAppContext();
        if (!$appContext->aclCheck('lizmap.tools.layer.export', $project->getRepository()->getKey())) {
            $requestHeaders = \jApp::coord()->request->headers();
            if (!isset($_SESSION['html_map_token'])
                || $_SESSION['html_map_token'] !== $appContext->buildMapToken()) {
                return false;
            }
        }

        return true;
    }
}
