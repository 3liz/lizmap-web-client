<?php

use Jelix\UnitTests\UnitTestCase;
use PHPUnit\Framework\Attributes\CoversNothing;

/**
 * Tests of the secret key and cache key of the BASIC authentication verification cache.
 *
 * @internal
 */
#[CoversNothing]
class CheckerBasicAuthCacheTest extends UnitTestCase
{
    /** @var string Temporary directory of the test */
    protected $dir;

    protected function setUp(): void
    {
        // Load the Jelix configuration (jApp, jLog...)
        parent::setUp();
        self::initJelixConfig();

        // Create an empty temporary directory
        $this->dir = sys_get_temp_dir().'/lizmap_checker_'.bin2hex(random_bytes(6));
        mkdir($this->dir);
    }

    protected function tearDown(): void
    {
        // Remove the temporary directory and its files
        foreach (glob($this->dir.'/*') as $file) {
            unlink($file);
        }
        rmdir($this->dir);
        parent::tearDown();
    }

    /**
     * The secret is generated at the first call, then read from the file.
     */
    public function testSecretGeneratedThenRead(): void
    {
        $file = $this->dir.'/secret.ini.php';
        $secret = CheckerForTests::getBasicAuthCacheSecretForTests($file);
        $this->assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $secret);
        $this->assertFileExists($file);
        // No other file left (temporary file renamed)
        $this->assertCount(1, glob($this->dir.'/*'));
        // The file is not readable by others and is not executable as PHP output
        $this->assertSame(0, fileperms($file) & 0o077);
        $this->assertStringStartsWith(";<?php die(''); ?>", file_get_contents($file));

        // Same secret at the next call
        $this->assertSame($secret, CheckerForTests::getBasicAuthCacheSecretForTests($file));
    }

    /**
     * Two generated secrets are different.
     */
    public function testSecretsAreRandom(): void
    {
        $secret1 = CheckerForTests::getBasicAuthCacheSecretForTests($this->dir.'/secret1.ini.php');
        $secret2 = CheckerForTests::getBasicAuthCacheSecretForTests($this->dir.'/secret2.ini.php');
        $this->assertNotSame($secret1, $secret2);
    }

    /**
     * An invalid file is not overwritten and no secret is returned.
     */
    public function testInvalidSecretFile(): void
    {
        $file = $this->dir.'/secret.ini.php';
        file_put_contents($file, "not a secret\n");
        $this->assertNull(CheckerForTests::getBasicAuthCacheSecretForTests($file));
        $this->assertSame("not a secret\n", file_get_contents($file));
    }

    /**
     * Without writable directory, no secret is returned.
     */
    public function testMissingDirectory(): void
    {
        $this->assertNull(CheckerForTests::getBasicAuthCacheSecretForTests($this->dir.'/missing/secret.ini.php'));
    }

    /**
     * Only real password hashes can be used in the verification cache.
     */
    public function testCacheablePasswordHash(): void
    {
        // bcrypt and argon2 hashes, as stored by the database authentication drivers
        $this->assertTrue(CheckerForTests::isCacheablePasswordHashForTests(password_hash('x', PASSWORD_BCRYPT)));
        if (defined('PASSWORD_ARGON2ID')) {
            $this->assertTrue(CheckerForTests::isCacheablePasswordHashForTests(password_hash('x', PASSWORD_ARGON2ID)));
        }

        // Placeholder stored by the LDAP module, empty value and legacy sha1 hash
        $this->assertFalse(CheckerForTests::isCacheablePasswordHashForTests('!!ldapdao password!!'));
        $this->assertFalse(CheckerForTests::isCacheablePasswordHashForTests(''));
        $this->assertFalse(CheckerForTests::isCacheablePasswordHashForTests(sha1('x')));
    }

    /**
     * The cache key depends on each part of the fingerprint and is a valid jCache key.
     */
    public function testCacheKey(): void
    {
        $key = CheckerForTests::basicAuthCacheKeyForTests('admin', 'admin', 'hash', 'secret');
        $this->assertMatchesRegularExpression('/^lizmap_basic_auth_[0-9a-f]{64}$/', $key);
        $this->assertSame($key, CheckerForTests::basicAuthCacheKeyForTests('admin', 'admin', 'hash', 'secret'));

        // Any change of the login, the password, the stored hash or the secret changes the key
        $this->assertNotSame($key, CheckerForTests::basicAuthCacheKeyForTests('admin2', 'admin', 'hash', 'secret'));
        $this->assertNotSame($key, CheckerForTests::basicAuthCacheKeyForTests('admin', 'admin2', 'hash', 'secret'));
        $this->assertNotSame($key, CheckerForTests::basicAuthCacheKeyForTests('admin', 'admin', 'hash2', 'secret'));
        $this->assertNotSame($key, CheckerForTests::basicAuthCacheKeyForTests('admin', 'admin', 'hash', 'secret2'));

        // The separator prevents ambiguities between the login and the password
        $this->assertNotSame(
            CheckerForTests::basicAuthCacheKeyForTests('ab', 'c', 'hash', 'secret'),
            CheckerForTests::basicAuthCacheKeyForTests('a', 'bc', 'hash', 'secret')
        );
    }
}
