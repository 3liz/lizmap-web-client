<?php
/**
* @package    jelix
* @subpackage auth_driver
* @author      Laurent Jouanneau
* @copyright   2011 Laurent Jouanneau
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * base class for some jAuth drivers
 */
class jAuthDriverBase {

    protected $_params;

    function __construct($params){
        $this->_params = $params;
    }

    /**
     * crypt the password
     */
    public function cryptPassword($password) {
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
}


/**
 * function to use to crypt password. use the password_salt value in the config
 * file of the plugin.
 */
function sha1WithSalt($salt, $password) {
    return sha1($salt.':'.$password);
}
