<?php

namespace Lizmap\App;

class Checker
{
    /**
     * Check if credentials of the user are correct.
     *
     * @param array $serverVars Server variables, including authentication details
     *
     * @return bool True if login is successful, false otherwise
     */
    public static function checkCredentials($serverVars)
    {
        if (isset($serverVars['PHP_AUTH_USER'])) {
            return \jAuth::login($serverVars['PHP_AUTH_USER'], $serverVars['PHP_AUTH_PW']);
            // FIXME we don't return an error if login fails?
        }

        return false;
    }
}
