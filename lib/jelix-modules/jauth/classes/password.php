<?php
/**
 * A Compatibility library with PHP 5.5's simplified password hashing API.
 *
 * @author Anthony Ferrara <ircmaxell@php.net>
 * @contributor Laurent Jouanneau <laurent@jelix.org>
 * @license http://www.opensource.org/licenses/mit-license.html MIT License
 * @copyright 2012 The Authors
 */

 /**
  * function to check if the password API can be used
  * In some PHP version ( <5.3.7), crypt() with blowfish is vulnerable.
  * But this issue has been fixed on some older PHP version (php 5.3.3 for most of them) in some
  * distro, like Debian squeeze.
  * @see http://www.php.net/security/crypt_blowfish.php
  */
function can_use_password_API () {
    if (version_compare(PHP_VERSION, '5.3.7', '>=')) {
        if (!defined('_PASSWORD_CRYPT_HASH_FORMAT'))
            define('_PASSWORD_CRYPT_HASH_FORMAT', '$2y$%02d$');
        if (!defined('_PASSWORD_CRYPT_PROLOG'))
            define('_PASSWORD_CRYPT_PROLOG', '$2y$');
        return true;
    }
    if (version_compare(PHP_VERSION, '5.3.3', '<')) {
        return false;
    }
    // On debian squeeze, crypt() has been fixed in PHP 5.3.3
    // http://security-tracker.debian.org/tracker/CVE-2011-2483
    // so we can use crypt() securely with $2a$ ($2y$ is not available)
    if (preg_match('/squeeze(\d+)$/', PHP_VERSION, $m)) {
        if (intval($m[1]) >= 4) {
            if (!defined('_PASSWORD_CRYPT_HASH_FORMAT'))
                define('_PASSWORD_CRYPT_HASH_FORMAT', '$2a$%02d$');
            if (!defined('_PASSWORD_CRYPT_PROLOG'))
                define('_PASSWORD_CRYPT_PROLOG', '$2a$');
            return true;
        }
    }
    //FIXME crypt() in PHP 5.3.3 is fixed also on other distro like RedHat.
    // however I don't know if it supports 2y, and how does PHP_VERSION look like
    return false;
}



if (!can_use_password_API()) {
	trigger_error("The Password Compatibility Library requires PHP >= 5.3.7 or PHP >= 5.3.3-7+squeeze4 on debian", E_USER_WARNING);
	// Prevent defining the functions
	return;
}

if (!defined('PASSWORD_BCRYPT')) {

	define('PASSWORD_BCRYPT', 1);
	define('PASSWORD_DEFAULT', PASSWORD_BCRYPT);

	/**
	 * Hash the password using the specified algorithm
	 *
	 * @param string $password The password to hash
	 * @param int    $algo     The algorithm to use (Defined by PASSWORD_* constants)
	 * @param array  $options  The options for the algorithm to use
	 *
	 * @returns string|false The hashed password, or false on error.
	 */
	function password_hash($password, $algo, array $options = array()) {
		if (!function_exists('crypt')) {
			trigger_error("Crypt must be loaded for password_hash to function", E_USER_WARNING);
			return null;
		}
		if (!is_string($password)) {
			trigger_error("password_hash(): Password must be a string", E_USER_WARNING);
			return null;
		}
		if (!is_int($algo)) {
			trigger_error("password_hash() expects parameter 2 to be long, " . gettype($algo) . " given", E_USER_WARNING);
			return null;
		}
		switch ($algo) {
			case PASSWORD_BCRYPT:
				// Note that this is a C constant, but not exposed to PHP, so we don't define it here.
				$cost = 10;
				if (isset($options['cost'])) {
					$cost = $options['cost'];
					if ($cost < 4 || $cost > 31) {
						trigger_error(sprintf("password_hash(): Invalid bcrypt cost parameter specified: %d", $cost), E_USER_WARNING);
						return null;
					}
				}
				$required_salt_len = 22;
				$hash_format = sprintf(_PASSWORD_CRYPT_HASH_FORMAT, $cost);
				break;
			default:
				trigger_error(sprintf("password_hash(): Unknown password hashing algorithm: %s", $algo), E_USER_WARNING);
				return null;
		}
		if (isset($options['salt'])) {
			switch (gettype($options['salt'])) {
				case 'NULL':
				case 'boolean':
				case 'integer':
				case 'double':
				case 'string':
					$salt = (string) $options['salt'];
					break;
				case 'object':
					if (method_exists($options['salt'], '__tostring')) {
						$salt = (string) $options['salt'];
						break;
					}
				case 'array':
				case 'resource':
				default:
					trigger_error('password_hash(): Non-string salt parameter supplied', E_USER_WARNING);
					return null;
			}
			if (strlen($salt) < $required_salt_len) {
				trigger_error(sprintf("password_hash(): Provided salt is too short: %d expecting %d", strlen($salt), $required_salt_len), E_USER_WARNING);
				return null;
			} elseif (0 == preg_match('#^[a-zA-Z0-9./]+$#D', $salt)) {
				$salt = str_replace('+', '.', base64_encode($salt));
			}
		} else {
			$buffer = '';
			$raw_length = (int) ($required_salt_len * 3 / 4 + 1);
			$buffer_valid = false;
			if (function_exists('mcrypt_create_iv')) {
				$buffer = mcrypt_create_iv($raw_length, MCRYPT_DEV_URANDOM);
				if ($buffer) {
					$buffer_valid = true;
				}
			}
			if (!$buffer_valid && function_exists('openssl_random_pseudo_bytes')) {
				$buffer = openssl_random_pseudo_bytes($raw_length);
				if ($buffer) {
					$buffer_valid = true;
				}
			}
			if (!$buffer_valid && file_exists('/dev/urandom')) {
				$f = @fopen('/dev/urandom', 'r');
				if ($f) {
					$read = strlen($buffer);
					while ($read < $raw_length) {
						$buffer .= fread($f, $raw_length - $read);
						$read = strlen($buffer);
					}
					fclose($f);
					if ($read >= $raw_length) {
						$buffer_valid = true;
					}
				}
			}
			if (!$buffer_valid || strlen($buffer) < $raw_length) {
				$bl = strlen($buffer);
				for ($i = 0; $i < $raw_length; $i++) {
					if ($i < $bl) {
						$buffer[$i] = $buffer[$i] ^ chr(mt_rand(0, 255));
					} else {
						$buffer .= chr(mt_rand(0, 255));
					}
				}
			}
			$salt = str_replace('+', '.', base64_encode($buffer));

		}
		$salt = substr($salt, 0, $required_salt_len);

		$hash = $hash_format . $salt;

		$ret = crypt($password, $hash);

		if (!is_string($ret) || strlen($ret) <= 13) {
			return false;
		}

		return $ret;
	}

	/**
	 * Get information about the password hash. Returns an array of the information
	 * that was used to generate the password hash.
	 *
	 * array(
	 *    'algo' => 1,
	 *    'algoName' => 'bcrypt',
	 *    'options' => array(
	 *        'cost' => 10,
	 *    ),
	 * )
	 *
	 * @param string $hash The password hash to extract info from
	 *
	 * @return array The array of information about the hash.
	 */
	function password_get_info($hash) {
		$return = array(
			'algo' => 0,
			'algoName' => 'unknown',
			'options' => array(),
		);
		if (substr($hash, 0, 4) == _PASSWORD_CRYPT_PROLOG && strlen($hash) == 60) {
			$return['algo'] = PASSWORD_BCRYPT;
			$return['algoName'] = 'bcrypt';
			list($cost) = sscanf($hash, _PASSWORD_CRYPT_HASH_FORMAT);
			$return['options']['cost'] = $cost;
		}
		return $return;
	}

	/**
	 * Determine if the password hash needs to be rehashed according to the options provided
	 *
	 * If the answer is true, after validating the password using password_verify, rehash it.
	 *
	 * @param string $hash    The hash to test
	 * @param int    $algo    The algorithm used for new password hashes
	 * @param array  $options The options array passed to password_hash
	 *
	 * @return boolean True if the password needs to be rehashed.
	 */
	function password_needs_rehash($hash, $algo, array $options = array()) {
		$info = password_get_info($hash);
		if ($info['algo'] != $algo) {
			return true;
		}
		switch ($algo) {
			case PASSWORD_BCRYPT:
				$cost = isset($options['cost']) ? $options['cost'] : 10;
				if ($cost != $info['options']['cost']) {
					return true;
				}
				break;
		}
		return false;
	}

	/**
	 * Verify a password against a hash using a timing attack resistant approach
	 *
	 * @param string $password The password to verify
	 * @param string $hash     The hash to verify against
	 *
	 * @return boolean If the password matches the hash
	 */
    function password_verify($password, $hash) {
		if (!function_exists('crypt')) {
			trigger_error("Crypt must be loaded for password_verify to function", E_USER_WARNING);
			return false;
		}
		$ret = crypt($password, $hash);
		if (!is_string($ret) || strlen($ret) != strlen($hash) || strlen($ret) <= 13) {
			return false;
		}

		$status = 0;
		for ($i = 0; $i < strlen($ret); $i++) {
			$status |= (ord($ret[$i]) ^ ord($hash[$i]));
		}

		return $status === 0;
	}
}



