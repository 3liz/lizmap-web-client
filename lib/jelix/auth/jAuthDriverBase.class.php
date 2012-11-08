<?php
/**
* @package    jelix
* @subpackage auth_driver
* @author      Laurent Jouanneau
* @contributor Florian Lonqueu-Brochard
* @copyright   2011 Laurent Jouanneau, 2011 Florian Lonqueu-Brochard
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * base class for some jAuth drivers
 */
class jAuthDriverBase {

    protected $_params;
    protected $passwordHashMethod;
    protected $passwordHashOptions;

    function __construct($params){
        $this->_params = $params;
        $this->passwordHashOptions = $params['password_hash_options'];
        $this->passwordHashMethod = $params['password_hash_method'];
    }

    /**
     * hash the given password
     * @param string $password the password to hash
     * @return string the hash password
     */
    public function cryptPassword($password, $forceOldHash = false) {
        if (!$forceOldHash && $this->passwordHashMethod) {
            return password_hash($password, $this->passwordHashMethod, $this->passwordHashOptions);
        }

        if (isset($this->_params['password_crypt_function'])) {
            $f = $this->_params['password_crypt_function'];
            if ($f != '') {
                if ($f[1] == ':') {
                    $t = $f[0];
                    $f = substr($f, 2);
                    if ($t == '1') {
                        return $f((isset($this->_params['password_salt'])?$this->_params['password_salt']:''), $password);
                    }
                    else if ($t == '2') {
                        return $f($this->_params, $password);
                    }
                }
                return $f($password);
            }
        }
        return $password;
    }

    /**
     * @param string $givenPassword     the password to verify
     * @param string $currentPasswordHash the hash of the real password
     * @return boolean|string false if password does not correspond. True if it is ok. A string
     * containing a new hash if it is ok and need to store a new hash
     */
    public function checkPassword($givenPassword, $currentPasswordHash) {
        if ($currentPasswordHash[0] == '$' && $this->passwordHashMethod) {
            // ok, we have hash for standard API, let's use standard API
            if (!password_verify($givenPassword, $currentPasswordHash)) {
                return false;
            }

            // check if rehash is needed, 
            if (password_needs_rehash($currentPasswordHash, $this->passwordHashMethod, $this->passwordHashOptions)) {
                return password_hash($givenPassword, $this->passwordHashMethod,  $this->passwordHashOptions);
            }
        }
        else {
            // verify with the old hash api
            if ($currentPasswordHash != $this->cryptPassword($givenPassword, true)) {
                return false;
            }

            if ($this->passwordHashMethod) {
                // if there is a method to hash with the standard API, let's rehash the password
                return password_hash($givenPassword, $this->passwordHashMethod,  $this->passwordHashOptions);
            }
        }
        return true;
    }
}


/**
 * function to use to crypt password. use the password_salt value in the config
 * file of the plugin.
 * @deprecated
 */
function sha1WithSalt($salt, $password) {
    return sha1($salt.':'.$password);
}

/**
 * hash password with blowfish algorithm. use the password_salt value in the config file of the plugin
 */
function bcrypt($salt, $password, $iteration_count = 12) {
    
    if (CRYPT_BLOWFISH != 1)
        throw new jException('jelix~auth.error.bcrypt.inexistant');
    
    if(empty($salt) || !ctype_alnum($salt) || strlen($salt) != 22)
        throw new jException('jelix~auth.error.bcrypt.bad.salt');

    $hash = crypt($password, '$2a$'.$iteration_count.'$'.$salt.'$');
    
    return substr($hash, strrpos($hash, '$')+strlen($salt));
 
}
