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
}
