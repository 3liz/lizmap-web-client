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

        return self::loginWithVerificationCache($login, $serverVars['PHP_AUTH_PW']);
    }

    /**
     * @var int Time to live in seconds of a successful BASIC authentication in the verification cache
     */
    public static $basicAuthCacheTtl = 300;

    /**
     * @var string Name of the file, in the var/config directory, storing the secret key of the verification cache
     */
    public const BASIC_AUTH_SECRET_FILE = 'basicAuthCacheSecret.ini.php';

    /**
     * Log in the user, using a cache of the successful password verifications.
     *
     * The password check (bcrypt) is costly, and BASIC authentication clients send the credentials
     * with every request. After a successful check, a fingerprint of the credentials is stored in the cache
     * for a short time, so the next requests skip the bcrypt check. See basicAuthCacheKey() for the fingerprint.
     *
     * Without secret key (see getBasicAuthCacheSecret()), the cache is not used.
     * The session is still logged in for the request only: logoutCredentials() logs it out at the end.
     *
     * @param string $login    The login sent by the client
     * @param string $password The password sent by the client
     *
     * @return bool True if the user is logged in
     */
    protected static function loginWithVerificationCache($login, $password)
    {
        // Without secret key, the cache is not used: standard login
        $secret = self::getBasicAuthCacheSecret();
        if ($secret === null) {
            return \jAuth::login($login, $password);
        }

        // Get the stored password hash, part of the fingerprint
        $user = \jAuth::getUser($login);
        // isset() also handles an unknown user (null), despite the jAuth::getUser() PHPDoc
        $storedHash = isset($user->password) ? (string) $user->password : '';
        if (!self::isCacheablePasswordHash($storedHash)) {
            // No real password hash (unknown user, LDAP...): standard login
            return \jAuth::login($login, $password);
        }
        $cacheKey = self::basicAuthCacheKey($login, $password, $storedHash, $secret);

        // Credentials not verified recently: standard login, then store the fingerprint
        if (!\jCache::get($cacheKey)) {
            $ok = \jAuth::login($login, $password);
            if ($ok) {
                \jCache::set($cacheKey, 1, self::$basicAuthCacheTtl);
            }

            return $ok;
        }

        // Credentials already verified: same steps as jAuth::login(), except the password check
        $eventResp = \jEvent::notify('AuthBeforeLogin', array('login' => $user->login));
        foreach ($eventResp->getResponse() as $rep) {
            if (isset($rep['processlogin']) && $rep['processlogin'] === false) {
                return false;
            }
        }

        // Regenerate the session id to avoid session fixation, as jAuth::login() does
        if (session_status() == \PHP_SESSION_ACTIVE) {
            \jSession::regenerateId(true);
        }

        // The account must still be allowed to log in (e.g. not disabled)
        $eventResp = \jEvent::notify('AuthCanLogin', array('login' => $user->login, 'user' => $user));
        foreach ($eventResp->getResponse() as $rep) {
            if (!isset($rep['canlogin']) || $rep['canlogin'] === false) {
                return false;
            }
        }

        // Store the user in the session, for the current request only
        $config = \jAuth::loadConfig();
        $_SESSION[$config['session_name']] = $user;
        \jEvent::notify('AuthLogin', array('login' => $user->login, 'persistence' => 0));

        return true;
    }

    /**
     * Check if the stored password can be used in the verification cache.
     *
     * Only real password hashes (bcrypt, argon2...) are accepted: the password is then verified locally
     * and the cache entry is invalidated as soon as it changes. Other values are refused, for example the
     * constant placeholder stored by the LDAP module (ldapdao) for the users verified by the LDAP server,
     * whose password or account can change on the LDAP side without any change in the database.
     *
     * @param string $storedHash The password stored for the user
     *
     * @return bool True if the stored password is a password hash
     */
    protected static function isCacheablePasswordHash($storedHash)
    {
        return $storedHash !== '' && password_get_info($storedHash)['algo'] !== null;
    }

    /**
     * Build the cache key storing a successful BASIC authentication check.
     *
     * The key is an HMAC of the login, the password and the password hash stored for the user,
     * keyed with a secret stored in the var/config directory. Reading the cache, even with the user
     * database, does not allow to test passwords quickly or to forge an entry without this secret.
     * The key changes as soon as the password is changed.
     *
     * @param string $login      The login sent by the client
     * @param string $password   The password sent by the client
     * @param string $storedHash The password hash stored for the user
     * @param string $secret     The secret key of the verification cache
     *
     * @return string The cache key
     */
    protected static function basicAuthCacheKey($login, $password, $storedHash, $secret)
    {
        return 'lizmap_basic_auth_'.hash_hmac('sha256', $login."\0".$password."\0".$storedHash, $secret);
    }

    /**
     * Get the secret key of the BASIC authentication verification cache.
     *
     * The secret is 32 random bytes (random_bytes(), hexadecimal encoded), generated at the first use
     * and stored in var/config/basicAuthCacheSecret.ini.php, outside of the cache and of the database.
     * Deleting the file generates a new secret, which only invalidates the cache.
     *
     * @param null|string $file The secret file path, the one in var/config by default
     *
     * @return null|string The secret, or null if it cannot be read nor generated (the cache is then not used)
     */
    protected static function getBasicAuthCacheSecret($file = null)
    {
        if ($file === null) {
            $file = \jApp::varConfigPath(self::BASIC_AUTH_SECRET_FILE);
        }

        // Read the existing secret
        if (is_file($file)) {
            $content = @file_get_contents($file);
            if ($content !== false && preg_match('/^([0-9a-f]{64})$/m', $content, $matches)) {
                return $matches[1];
            }

            // Unreadable or invalid file: do not overwrite it, the cache is not used
            return null;
        }

        // Generate a new secret
        $dir = dirname($file);
        if (!is_dir($dir) || !is_writable($dir)) {
            return null;
        }
        $secret = bin2hex(random_bytes(32));
        $content = ";<?php die(''); ?>\n"
            ."; Secret key of the BASIC authentication verification cache, generated automatically.\n"
            ."; Deleting this file generates a new key, which only invalidates the cache.\n"
            .$secret."\n";

        // Write it in a temporary file (created with 0600 rights) then rename it, so that
        // a concurrent request never reads a partial file
        $tmpFile = @tempnam($dir, 'basicauth');
        if ($tmpFile === false) {
            return null;
        }
        if (@file_put_contents($tmpFile, $content) === false || !@rename($tmpFile, $file)) {
            @unlink($tmpFile);

            return null;
        }

        return $secret;
    }

    /**
     * Logout the user authenticated by BASIC HTTP authentication.
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

        $appContext = \lizmap::getAppContext();
        // No user connected
        if (!$appContext->UserIsConnected()) {
            return false;
        }

        // Check that it's the same user as the one connected to Lizmap Service
        $juser = $appContext->getUserSession();
        if ($serverVars['PHP_AUTH_USER'] == $juser->login) {
            \jAuth::logout();

            return true;
        }

        return false;
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
