<?php

namespace LizmapApi;

use Lizmap\App\Checker;

class Credentials
{
    /**
     * Validates the user's credentials and updates the response object in case of failure.
     *
     * @return bool true if the credentials are valid, false otherwise
     */
    public static function handle(): bool
    {
        // Authenticate with BASIC authentication, for the current request only
        // Wrong credentials are refused, even with a session already logged in
        if (!Checker::checkCredentials($_SERVER)) {
            return false;
        }

        // If no user is connected, do not authorize access
        return \jAuth::isConnected();
    }
}
