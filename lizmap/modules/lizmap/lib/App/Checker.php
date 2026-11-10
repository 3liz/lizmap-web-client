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
        if (isset($serverVars['PHP_AUTH_USER'])) {
            return \jAuth::login($serverVars['PHP_AUTH_USER'], $serverVars['PHP_AUTH_PW']);
        }

        return true;
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
}
