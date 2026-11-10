<?php

namespace Lizmap\App;

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

        return \jAuth::login($login, $serverVars['PHP_AUTH_PW']);
    }
}
