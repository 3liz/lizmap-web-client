<?php

use Jelix\UnitTests\UnitTestCase;
use Lizmap\App\Checker;

/**
 * Tests of the optional HTTP Basic authentication checks.
 *
 * @internal
 *
 * @coversNothing
 */
class CheckerTest extends UnitTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        self::initJelixConfig();
    }

    /**
     * Empty login is not valid.
     */
    public function testIsValidLoginEmptyLogin(): void
    {
        $this->assertFalse(Checker::isValidLogin(''));
    }

    /**
     * Untrimmed login is not valid.
     */
    public function testIsValidLoginUntrimmedLogin(): void
    {
        $this->assertFalse(Checker::isValidLogin(' admin '));
    }

    /**
     * Login with line feed is not valid.
     */
    public function testIsValidLoginWithLineFeedLogin(): void
    {
        $this->assertFalse(Checker::isValidLogin("admin\n"));
    }

    /**
     * `admin` login is valid.
     */
    public function testIsValidLoginWithValidLogin(): void
    {
        $this->assertTrue(Checker::isValidLogin('admin'));
    }

    /**
     * Without HTTP Basic credentials, no authentication is needed.
     */
    public function testCheckCredentialsWithoutBasicAuth(): void
    {
        $this->assertTrue(Checker::checkCredentials(array()));
    }

    /**
     * With an empty login and no password, the credentials are wrong.
     *
     * PHP does not define PHP_AUTH_PW when the Authorization header is "Basic Og==" (":" in base64),
     * as sent by some clients (curl, VirtualGeo) before sending the real credentials.
     */
    public function testCheckCredentialsWithEmptyLogin(): void
    {
        $this->assertFalse(Checker::checkCredentials(array('PHP_AUTH_USER' => '')));
    }

    /**
     * With an invalid login, the credentials are wrong.
     */
    public function testCheckCredentialsWithInvalidLogin(): void
    {
        $this->assertFalse(Checker::checkCredentials(array('PHP_AUTH_USER' => ' admin ')));
    }

    /**
     * With no password, the credentials are wrong.
     *
     * PHP does not define PHP_AUTH_PW when the Authorization header is "Basic YWRtaW46" ("admin:" in base64).
     * No PHP warning must be raised.
     */
    public function testCheckCredentialsWithEmptyPassword(): void
    {
        // Convert the PHP warnings into exceptions to detect them
        set_error_handler(function (int $errno, string $errstr, string $errfile, int $errline): bool {
            throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
        }, E_WARNING);

        try {
            $this->assertFalse(Checker::checkCredentials(array('PHP_AUTH_USER' => 'admin')));
        } finally {
            restore_error_handler();
        }
    }

    /**
     * Without HTTP Basic credentials, no logout needed.
     */
    public function testLogoutCredentialsWithoutBasicAuth(): void
    {
        $this->assertFalse(Checker::logoutCredentials(array()));
    }
}
