<?php

namespace Lizmap\App;

class Checker
{
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
            \jLog::log('Basic authentication: Empty login sent by client', 'error');

            return false;
        }

        // Empty password: wrong credentials
        if (!isset($serverVars['PHP_AUTH_PW'])) {
            \jLog::log('Basic authentication for user: `'.$serverVars['PHP_AUTH_USER'].'` is missing password', 'error');

            return false;
        }

        return \jAuth::login($serverVars['PHP_AUTH_USER'], $serverVars['PHP_AUTH_PW']);
    }
}
