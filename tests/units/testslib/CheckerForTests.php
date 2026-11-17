<?php

use Lizmap\App\Checker;

/**
 * Expose the protected methods of Checker for the unit tests.
 */
class CheckerForTests extends Checker
{
    /**
     * Build the cache key of a successful BASIC authentication check.
     *
     * @param string $login      The login
     * @param string $password   The password
     * @param string $storedHash The stored password hash
     * @param string $secret     The secret key
     *
     * @return string The cache key
     */
    public static function basicAuthCacheKeyForTests($login, $password, $storedHash, $secret)
    {
        return self::basicAuthCacheKey($login, $password, $storedHash, $secret);
    }

    /**
     * Check if the stored password can be used in the verification cache.
     *
     * @param string $storedHash The stored password
     *
     * @return bool True if the stored password is a password hash
     */
    public static function isCacheablePasswordHashForTests($storedHash)
    {
        return self::isCacheablePasswordHash($storedHash);
    }

    /**
     * Get, or generate, the secret key stored in the given file.
     *
     * @param string $file The secret file path
     *
     * @return null|string The secret, or null
     */
    public static function getBasicAuthCacheSecretForTests($file)
    {
        return self::getBasicAuthCacheSecret($file);
    }
}
