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

    /**
     * With the HTTP Basic credentials of another user, nothing is logged out.
     */
    public function testLogoutCredentialsWithAnotherUser(): void
    {
        $config = jAuth::loadConfig();
        $user = new stdClass();
        $user->login = 'admin';
        $_SESSION[$config['session_name']] = $user;

        try {
            $this->assertFalse(Checker::logoutCredentials(array('PHP_AUTH_USER' => 'other')));
            $this->assertSame($user, $_SESSION[$config['session_name']]);
        } finally {
            unset($_SESSION[$config['session_name']]);
        }
    }

    /**
     * The user authenticated with HTTP Basic credentials is only removed from memory.
     */
    public function testLogoutCredentialsRemovesTheRequestUser(): void
    {
        $config = jAuth::loadConfig();
        $user = new stdClass();
        $user->login = 'admin';
        $_SESSION[$config['session_name']] = $user;

        try {
            $this->assertTrue(Checker::logoutCredentials(array('PHP_AUTH_USER' => 'admin')));
            $this->assertInstanceOf(jAuthDummyUser::class, $_SESSION[$config['session_name']]);
        } finally {
            unset($_SESSION[$config['session_name']]);
        }
    }

    /**
     * Without HTTP Basic credentials, the session is kept as is.
     */
    public function testCheckCredentialsWithoutBasicAuthKeepsTheSession(): void
    {
        CheckerForTests::reset();

        $this->assertTrue(CheckerForTests::checkCredentials(array()));
        $this->assertSame(0, CheckerForTests::$sessionClosedCount);
        $this->assertSame(array(), CheckerForTests::$notifiedEvents);
    }

    /**
     * With HTTP Basic credentials, the session is closed without writing, even if the login is invalid.
     */
    public function testCheckCredentialsWithInvalidLoginClosesTheSession(): void
    {
        CheckerForTests::reset();

        $this->assertFalse(CheckerForTests::checkCredentials(array('PHP_AUTH_USER' => '')));
        $this->assertSame(1, CheckerForTests::$sessionClosedCount);
        $this->assertNull(CheckerForTests::$requestUser);
    }

    /**
     * With valid HTTP Basic credentials, the user is set for the request only.
     *
     * The session is closed without writing, and no AuthLogin event is notified.
     */
    public function testCheckCredentialsWithValidPassword(): void
    {
        CheckerForTests::reset(array('admin' => 'secret'));
        CheckerForTests::$eventResponses['AuthCanLogin'] = array(array('canlogin' => true));

        $this->assertTrue(CheckerForTests::checkCredentials(array('PHP_AUTH_USER' => 'admin', 'PHP_AUTH_PW' => 'secret')));
        $this->assertSame(1, CheckerForTests::$sessionClosedCount);
        $this->assertNotNull(CheckerForTests::$requestUser);
        $this->assertSame('admin', CheckerForTests::$requestUser->login);
        $this->assertSame(array('AuthBeforeLogin', 'AuthCanLogin'), CheckerForTests::$notifiedEvents);
    }

    /**
     * With a wrong password, no user is set and AuthErrorLogin is notified.
     */
    public function testCheckCredentialsWithWrongPassword(): void
    {
        CheckerForTests::reset(array('admin' => 'secret'));

        $this->assertFalse(CheckerForTests::checkCredentials(array('PHP_AUTH_USER' => 'admin', 'PHP_AUTH_PW' => 'wrong')));
        $this->assertSame(1, CheckerForTests::$sessionClosedCount);
        $this->assertNull(CheckerForTests::$requestUser);
        $this->assertSame(array('AuthBeforeLogin', 'AuthErrorLogin'), CheckerForTests::$notifiedEvents);
    }

    /**
     * A listener of AuthBeforeLogin can forbid the login, before the password check.
     */
    public function testCheckCredentialsForbiddenBeforeLogin(): void
    {
        CheckerForTests::reset(array('admin' => 'secret'));
        CheckerForTests::$eventResponses['AuthBeforeLogin'] = array(array('processlogin' => false));

        $this->assertFalse(CheckerForTests::checkCredentials(array('PHP_AUTH_USER' => 'admin', 'PHP_AUTH_PW' => 'secret')));
        $this->assertNull(CheckerForTests::$requestUser);
        $this->assertSame(array('AuthBeforeLogin'), CheckerForTests::$notifiedEvents);
    }

    /**
     * A listener of AuthCanLogin can refuse the account (e.g. disabled account).
     */
    public function testCheckCredentialsWithAccountNotAllowed(): void
    {
        CheckerForTests::reset(array('admin' => 'secret'));
        CheckerForTests::$eventResponses['AuthCanLogin'] = array(array('canlogin' => true), array('canlogin' => false));

        $this->assertFalse(CheckerForTests::checkCredentials(array('PHP_AUTH_USER' => 'admin', 'PHP_AUTH_PW' => 'secret')));
        $this->assertNull(CheckerForTests::$requestUser);
    }
}
