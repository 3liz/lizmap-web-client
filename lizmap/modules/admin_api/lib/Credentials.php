<?php

namespace LizmapApi;

use Lizmap\App\Checker;

class Credentials{

    /**
     * Validates the user's credentials and updates the response object in case of failure.
     *
     * @return bool True if the credentials are valid, false otherwise.
     */
    static public function handle(): bool
    {
        return Checker::checkCredentials($_SERVER);
    }

}
