<?php
/**
* @package    jelix
* @subpackage auth_driver
* @author      Laurent Jouanneau
* @contributor Yannick Le Guédart (adaptation de jAuthDriverDb pour une classe quelconque)
* @copyright   2006-2014 Laurent Jouanneau, 2006 Yannick Le Guédart
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * interface for classes used with the jAuthDriverClass
* @package    jelix
* @subpackage auth_driver
* @see jAuth
* @since 1.0b2
 */
interface jIAuthDriverClass {
    /**
    * save a new user
    * @param object $user user informations
    */
    public function insert($user);

    /**
    * delete a user
    * @param string $login login of the user to delete
    */
    public function deleteByLogin($login);

    /**
    * update user informations
    * @param object $user user informations
    */
    public function update($user);

    /**
    * get user informations
    * @param string $login login of the user on which we want to get informations
    * @return object user informations
    */
    public function getByLogin($login);

    /**
    * create an empty object which will contains user informations
    * @return object user informations (empty)
    */
    public function createUserObject();

    /**
    * gets all users
    * @return object[] list of users
    */
    public function findAll();

    /**
    * gets all users for which the login corresponds to the given pattern
    * @param string $pattern the pattern
    * @return object[] list of users
    */
    public function findByLoginPattern($pattern);

    /**
    * change the password of a user
    * @param string $login the user login
    * @param string $cryptedpassword the new encrypted password
    */
    public function updatePassword($login, $cryptedpassword);

    /**
    * get the user corresponding to the given login and encrypted password
    * @param string $login the user login
    * @param string $cryptedpassword the new encrypted password
    * @return object user informations
    * @deprecated since 1.2.10
    */
    public function getByLoginPassword($login, $cryptedpassword);
}

/**
* Driver for a class which implement an authentification
* @package    jelix
* @subpackage auth_driver
* @see jAuth
* @since 1.0a5
*/
class classAuthDriver extends jAuthDriverBase implements jIAuthDriver {

    public function saveNewUser($user){
        $class = jClasses::create($this->_params['class']);
        $class->insert($user);
        return true;
    }

    public function removeUser($login){
        $class = jClasses::create($this->_params['class']);
        $class->deleteByLogin($login);
        return true;
    }

    public function updateUser($user){
        $class = jClasses::create($this->_params['class']);
        $class->update($user);
        return true;
    }

    public function getUser($login){
        $class = jClasses::create($this->_params['class']);
        return $class->getByLogin($login);
    }

    public function createUserObject($login,$password){
        $class = jClasses::create($this->_params['class']);
        $user = $class->createUserObject();
        $user->login = $login;
        $user->password = $this->cryptPassword($password);
        return $user;
    }

    public function getUserList($pattern){
        $class = jClasses::create($this->_params['class']);
        if($pattern == '%' || $pattern == ''){
            return $class->findAll();
        }else{
            return $class->findByLoginPattern($pattern);
        }
    }

    public function changePassword($login, $newpassword){
        $class = jClasses::create($this->_params['class']);
        return $class->updatePassword($login, $this->cryptPassword($newpassword));
    }

    public function verifyPassword($login, $password){
        if (trim($password) == '')
            return false;
        $class = jClasses::create($this->_params['class']);
        $user = $class->getByLogin($login);
        if (!$user) {
            return false;
        }

        $result = $this->checkPassword($password, $user->password);
        if ($result === false)
            return false;

        if ($result !== true) {
            // it is a new hash for the password, let's update it persistently
            $user->password = $result;
            $class->updatePassword($login, $result);
        }

        return $user;
    }

}
