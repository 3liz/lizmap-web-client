<?php
/**
* @package    jelix
* @subpackage auth
* @author     Laurent Jouanneau
* @contributor Frédéric Guillot, Antoine Detante, Julien Issler
* @copyright   2005-2008 Laurent Jouanneau, 2007 Frédéric Guillot, 2007 Antoine Detante
* @copyright   2007 Julien Issler
*
*/

/**
 * interface for auth drivers
 * @package    jelix
 * @subpackage auth
 * @static
 */
interface jIAuthDriver {
    /**
     * constructor
     * @param array $params driver parameters, written in the ini file of the auth plugin
     */
    function __construct($params);

    /**
     * creates a new user object, with some first data..
     * Careful : it doesn't create a user in a database for example. Just an object.
     * @param string $login the user login
     * @param string $password the user password
     * @return object the returned object depends on the driver
     */
    public function createUserObject($login, $password);

    /**
    * store a new user.
    *
    * It create the user in a database for example
    * should be call after a call of createUser and after setting some of its properties...
    * @param object $user the user data container
    */
    public function saveNewUser($user);

    /**
     * Erase user data of the user $login
     * @param string $login the login of the user to remove
     */
    public function removeUser($login);

    /**
    * save updated data of a user
    * warning : should not save the password !
    * @param object $user the user data container
    */
    public function updateUser($user);

    /**
     * return user data corresponding to the given login
     * @param string $login the login of the user
     * @return object the user data container
     */
    public function getUser($login);

    /**
     * construct the user list
     * @param string $pattern '' for all users
     * @return object[] array of objects representing the users
     */
    public function getUserList($pattern);

    /**
     * change a user password
     *
     * @param string $login the login of the user
     * @param string $newpassword
     * @return boolean true if the password has been changed
     */
    public function changePassword($login, $newpassword);

    /**
     * verify that the password correspond to the login
     * @param string $login the login of the user
     * @param string $password the password to test
     * @return object|false returns the object representing the user
     */
    public function verifyPassword($login, $password);
}
