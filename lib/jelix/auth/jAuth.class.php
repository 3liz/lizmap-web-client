<?php
/**
* @package    jelix
* @subpackage auth
* @author     Laurent Jouanneau
* @contributor Frédéric Guillot, Antoine Detante, Julien Issler, Dominique Papin, Tahina Ramaroson, Sylvain de Vathaire, Vincent Viaud
* @copyright  2001-2005 CopixTeam, 2005-2016 Laurent Jouanneau, 2007 Frédéric Guillot, 2007 Antoine Detante
* @copyright  2007-2008 Julien Issler, 2008 Dominique Papin, 2010 NEOV, 2010 BP2I
*
* This classes were get originally from an experimental branch of the Copix project (Copix 2.3dev, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial author of this Copix classes is Laurent Jouanneau, and this classes were adapted for Jelix by him
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

require(JELIX_LIB_PATH.'auth/jIAuthDriver.iface.php');
require(JELIX_LIB_PATH.'auth/jAuthDriverBase.class.php');

/**
 * This is the main class for authentification process
 * @package    jelix
 * @subpackage auth
 */
class jAuth {

    /**
     * @deprecated
     * @see jAuth::getConfig()
     */
    protected static function _getConfig() {
        return self::loadConfig();
    }

    protected static $config = null;

    /**
     * @var jIAuthDriver
     */
    protected static $driver = null;

    /**
     * Load the configuration of authentification, stored in the auth plugin config
     * @param null $newconfig
     * @return array
     * @throws jException
     * @since 1.2.10
     */
    public static function loadConfig($newconfig = null){

        if (self::$config === null || $newconfig) {
            if (!$newconfig) {
                $plugin = jApp::coord()->getPlugin('auth');
                if($plugin === null)
                    throw new jException('jelix~auth.error.plugin.missing');
                $config = & $plugin->config;
            }
            else {
                $config = $newconfig;
            }

            if (!isset($config['session_name'])
                || $config['session_name'] == '')
                $config['session_name'] = 'JELIX_USER';

            if (!isset( $config['persistant_cookie_path'])
                ||  $config['persistant_cookie_path'] == '') {
                if (jApp::config())
                    $config['persistant_cookie_path'] = jApp::urlBasePath();
                else
                    $config['persistant_cookie_path'] = '/';
            }

            if (!isset($config['persistant_crypt_key']) || $config['persistant_crypt_key'] == '') {
                // in the case of the use of a separate file, persistant_crypt_key may be into the localconfig.ini.php
                if (isset(jApp::config()->coordplugin_auth) && isset(jApp::config()->coordplugin_auth['persistant_crypt_key'])) {
                    $config['persistant_crypt_key'] = trim(jApp::config()->coordplugin_auth['persistant_crypt_key']);
                }
                else {
                    $config['persistant_crypt_key'] = '';
                }
            }

            if (!isset($config['persistant_cookie_name'])) {
                $config['persistant_cookie_name'] = 'jauthSession';
            }

            // Read hash method configuration. If not empty, cryptPassword will use
            // the new API of PHP 5.5 (password_verify and so on...)
            $password_hash_method = (isset($config['password_hash_method'])? $config['password_hash_method']:0);

            if ($password_hash_method === '' || (! is_numeric($password_hash_method))) {
                $password_hash_method = 0;
            }
            else {
                $password_hash_method= intval($password_hash_method);
            }

            if ($password_hash_method > 0) {
                require_once(__DIR__.'/password.php');
                if (!can_use_password_API()) {
                    $password_hash_method = 0;
                }
            }
            require_once(__DIR__.'/hash_equals.php');

            $password_hash_options = (isset($config['password_hash_options'])?$config['password_hash_options']:'');
            if ($password_hash_options != '') {
                $list = '{"'.str_replace(array('=',';'), array('":"', '","'), $config['password_hash_options']).'"}';
                $json = new jJson(SERVICES_JSON_LOOSE_TYPE);
                $password_hash_options = @$json->decode($list);
                if (!$password_hash_options)
                    $password_hash_options = array();
            }
            else {
                $password_hash_options = array();
            }

            $config['password_hash_method'] = $password_hash_method;
            $config['password_hash_options'] = $password_hash_options;

            $config[$config['driver']]['password_hash_method'] = $password_hash_method;
            $config[$config['driver']]['password_hash_options'] = $password_hash_options;
            self::$config = $config;
            self::$driver = null;
        }
        return self::$config;
    }

    /**
     * @deprecated
     * @see jAuth::getDriver()
     */
    protected static function _getDriver() {
        return self::getDriver();
    }

    /**
     * return the auth driver
     * @return jIAuthDriver
     * @throws jException
     * @since 1.2.10
     */
    public static function getDriver(){
        if (self::$driver === null) {
            $config = self::loadConfig();
            $db = strtolower($config['driver']);
            $driver = jApp::loadPlugin($db, 'auth', '.auth.php', $config['driver'].'AuthDriver', $config[$config['driver']]);
            if(is_null($driver))
                throw new jException('jelix~auth.error.driver.notfound',$db);
            self::$driver = $driver;
        }
        return self::$driver;
    }

    /**
     * return the value of a parameter of the configuration of the current driver
     * @param string $paramName
     * @return string the value. null if it doesn't exist
     */
    public static function getDriverParam($paramName) {
        $config = self::loadConfig();
        $config = $config[$config['driver']];
        if(isset($config[$paramName]))
            return $config[$paramName];
        else
            return null;
    }

    /**
     * load user data
     *
     * This method returns an object, generated by the driver, and which contains
     * data corresponding to the given login. This method should be called if you want
     * to update data of a user. see updateUser method.
     *
     * @param string $login
     * @return object the user
     */
    public static function getUser($login){
        $dr = self::getDriver();
        return $dr->getUser($login);
    }

    /**
     * Create a new user object
     *
     * You should call this method if you want to create a new user. It returns an object,
     * representing a user. Then you should fill its properties and give it to the saveNewUser
     * method.
     *
     * @param string $login the user login
     * @param string $password the user password (not encrypted)
     * @return object the returned object depends on the driver
     * @since 1.0b2
     */
    public static function createUserObject($login,$password){
        $dr = self::getDriver();
        return $dr->createUserObject($login,$password);
    }

    /**
     * Save a new user
     *
     * if the saving has succeed, a AuthNewUser event is sent
     * The given object should have been created by calling createUserObject method :
     *
     * example :
     *  <pre>
     *   $user = jAuth::createUserObject('login','password');
     *   $user->email ='bla@foo.com';
     *   jAuth::saveNewUser($user);
     *  </pre>
     *  the type of $user depends of the driver, so it can have other properties.
     *
     * @param  object $user the user data
     * @return object the user (eventually, with additional data)
     */
    public static function saveNewUser($user){
        $dr = self::getDriver();
        if($dr->saveNewUser($user))
            jEvent::notify ('AuthNewUser', array('user'=>$user));
        return $user;
    }

    /**
     * update user data
     *
     * It send a AuthUpdateUser event if the saving has succeed. If you want
     * to change the user password, you must use jAuth::changePassword method
     * instead of jAuth::updateUser method.
     *
     * The given object should have been created by calling getUser method.
     * Example :
     *  <pre>
     *   $user = jAuth::getUser('login');
     *   $user->email ='bla@foo.com';
     *   jAuth::updateUser($user);
     *  </pre>
     *  the type of $user depends of the driver, so it can have other properties.
     *
     * @param object $user  user data
     * @return boolean true if the user has been updated
     */
    public static function updateUser($user){
        $dr = self::getDriver();
        if($dr->updateUser($user) === false)
            return false;

        if(self::isConnected() && self::getUserSession()->login === $user->login){
            $config = self::loadConfig();
            $_SESSION[$config['session_name']] = $user;
        }
        jEvent::notify ('AuthUpdateUser', array('user'=>$user));
        return true;
    }

    /**
     * remove a user
     * send first AuthCanRemoveUser event, then if ok, send AuthRemoveUser
     * and then remove the user.
     * @param string $login the user login
     * @return boolean true if ok
     */
    public static function removeUser($login){
        $dr = self::getDriver();
        $eventresp = jEvent::notify ('AuthCanRemoveUser', array('login'=>$login));
        foreach($eventresp->getResponse() as $rep){
            if(!isset($rep['canremove']) || $rep['canremove'] === false)
                return false;
        }
        $user = $dr->getUser($login);
        if($dr->removeUser($login)===false)
            return false;
        jEvent::notify ('AuthRemoveUser', array('login'=>$login, 'user'=>$user));
        if(self::isConnected() && self::getUserSession()->login === $login)
            self::logout();
        return true;
    }

    /**
     * construct the user list
     * @param string $pattern '' for all users
     * @return array array of object
     */
    public static function getUserList($pattern = '%'){
        $dr = self::getDriver();
        return $dr->getUserlist($pattern);
    }

    /**
     * change a user password
     *
     * @param string $login the login of the user
     * @param string $newpassword the new password (not encrypted)
     * @return boolean true if the change succeed
     */
    public static function changePassword($login, $newpassword){
        $dr = self::getDriver();
        if($dr->changePassword($login, $newpassword)===false)
            return false;
        jEvent::notify ('AuthChangePassword', array('login'=>$login, 'password'=>$newpassword));
        if(self::isConnected() && self::getUserSession()->login === $login){
            $config = self::loadConfig();
            $_SESSION[$config['session_name']] = self::getUser($login);
        }
        return true;
    }

    /**
     * verify that the password correspond to the login
     * @param string $login the login of the user
     * @param string $password the password to test (not encrypted)
     * @return object|false  if ok, returns the user as object
     */
    public static function verifyPassword($login, $password){
        $dr = self::getDriver();
        return $dr->verifyPassword($login, $password);
    }

    /**
     * authentificate a user, and create a user in the php session
     * @param string $login the login of the user
     * @param string $password the password to test (not encrypted)
     * @param boolean $persistant (optional) the session must be persistant
     * @return boolean true if authentification is ok
     */
    public static function login($login, $password, $persistant=false){

        $dr = self::getDriver();
        $config = self::loadConfig();

        $eventresp = jEvent::notify ('AuthBeforeLogin', array('login'=>$login));
        foreach($eventresp->getResponse() as $rep){
            if(isset($rep['processlogin']) && $rep['processlogin'] === false)
                return false;
        }

        if($user = $dr->verifyPassword($login, $password)){

            $eventresp = jEvent::notify ('AuthCanLogin', array('login'=>$login, 'user'=>$user));
            foreach($eventresp->getResponse() as $rep){
                if(!isset($rep['canlogin']) || $rep['canlogin'] === false)
                    return false;
            }

            $_SESSION[$config['session_name']] = $user;

            if ($persistant) {
                $persistence = self::generateCookieToken($login, $password);
            }
            else {
                $persistence = 0;
            }

            jEvent::notify ('AuthLogin', array('login'=>$login, 'persistence'=>$persistence));
            return true;
        }else{
            jEvent::notify ('AuthErrorLogin', array('login'=>$login));
            return false;
        }
    }

    /**
     * Check if persistant session is enabled in config
     * @return boolean true if persistant session in enabled
     */
    public static function isPersistant(){
        $config = self::loadConfig();
        if(!isset($config['persistant_enable']))
            return false;
        else
            return $config['persistant_enable'];
    }

    /**
     * logout a user and delete the user in the php session
     */
    public static function logout(){

        $config = self::loadConfig();
        jEvent::notify ('AuthLogout', array('login'=>$_SESSION[$config['session_name']]->login));
        $_SESSION[$config['session_name']] = new jAuthDummyUser();

        if (isset($config['session_destroy']) && $config['session_destroy']) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
            session_destroy();
        }

        if(isset($config['persistant_enable']) && $config['persistant_enable']){
            if(isset($config['persistant_cookie_name'])) {
                setcookie($config['persistant_cookie_name'].'[auth]', '', time() - 3600, $config['persistant_cookie_path'], "", false, true);
            }
            else {
                jLog::log(jLocale::get('jelix~auth.error.persistant.incorrectconfig','persistant_cookie_name'), 'error');
            }
        }
    }

    /**
     * Says if the user is connected
     * @return boolean
     */
    public static function isConnected(){
        $config = self::loadConfig();
        return (isset($_SESSION[$config['session_name']]) && $_SESSION[$config['session_name']]->login != '');
    }

   /**
    * return the user stored in the php session
    * @return object the user data
    */
    public static function getUserSession (){
        $config = self::loadConfig();
        if (!isset ($_SESSION[$config['session_name']]) ||
            !$_SESSION[$config['session_name']]) {
            $_SESSION[$config['session_name']] = new jAuthDummyUser();
        }
        return $_SESSION[$config['session_name']];
    }

    /**
     * generate a password with random letters, numbers and special characters
     * @param int $length the length of the generated password
     * @param boolean $withoutSpecialChars (optional, default false) the generated password may be use this characters : !@#$%^&*?_,~
     * @return string the generated password
     */
    public static function getRandomPassword($length = 10, $withoutSpecialChars = false){
        if ($length < 10)
            $length = 10;
        $nbNumber = floor($length/4);
        if ($nbNumber < 2)
            $nbNumber = 2;
        if ($withoutSpecialChars)
            $nbSpec = 0;
        else {
            $nbSpec = floor($length/5);
            if ($nbSpec < 1)
                $nbSpec = 1;
        }

        $nbLower = floor(($length-$nbNumber-$nbSpec)/2);
        $nbUpper = $length-$nbNumber-$nbLower-$nbSpec;

        $pass = '';

        $letter = "1234567890";
        for($i=0;$i<$nbNumber;$i++)
            $pass .= $letter[rand(0,9)];

        $letter = '!@#$%^&*?_,~';
        for($i=0;$i<$nbSpec;$i++)
            $pass .= $letter[rand(0,11)];

        $letter = "abcdefghijklmnopqrstuvwxyz";
        for($i=0;$i<$nbLower;$i++)
            $pass .= $letter[rand(0,25)];

        $letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for($i=0;$i<$nbUpper;$i++)
            $pass .= $letter[rand(0,25)];

        return str_shuffle($pass);
    }

    /**
     *
     */
    public static function checkCookieToken() {
        $config = self::loadConfig();
        if (isset($config['persistant_enable']) && $config['persistant_enable'] && !self::isConnected()) {
            if (isset($config['persistant_cookie_name']) &&
                isset($config['persistant_crypt_key']) &&
                trim($config['persistant_cookie_name']) != '' &&
                trim($config['persistant_crypt_key']) != ''
                ) {
                $cookieName = $config['persistant_cookie_name'];
                if (isset($_COOKIE[$cookieName]['auth']) && strlen($_COOKIE[$cookieName]['auth'])>0) {
                    $decrypted = jCrypt::decrypt($_COOKIE[$cookieName]['auth'],$config['persistant_crypt_key']);
                    $decrypted = @unserialize($decrypted);
                    if ($decrypted && is_array($decrypted) && count($decrypted) == 2) {
                        list($login, $password) = $decrypted;
                        self::login($login, $password, true);
                    }
                }
                if (isset($_COOKIE[$cookieName]['login'])) {
                    // destroy deprecated cookies
                    setcookie($cookieName.'[login]', '', time() - 3600, $config['persistant_cookie_path']);
                    setcookie($cookieName.'[passwd]', '', time() - 3600, $config['persistant_cookie_path']);
                }
            }
        }
    }

    public static function generateCookieToken($login, $password) {
        $persistence = 0;
        $config = self::loadConfig();

        // Add a cookie for session persistance, if enabled
        if (isset($config['persistant_enable']) && $config['persistant_enable']) {
            if (!isset($config['persistant_crypt_key']) ||
                !isset($config['persistant_cookie_name']) ||
                trim($config['persistant_crypt_key']) == '' ||
                trim($config['persistant_cookie_name']) == '') {
                jLog::log(jLocale::get('jelix~auth.error.persistant.incorrectconfig','persistant_cookie_name, persistant_crypt_key'), 'error');
                return 0;
            }

            if (isset($config['persistant_duration'])) {
                $persistence = intval($config['persistant_duration'])*86400;
            }
            else {
                $persistence = 86400; // 24h
            }
            $persistence += time();
            $encrypted = jCrypt::encrypt(serialize(array($login, $password)),$config['persistant_crypt_key']);
            setcookie($config['persistant_cookie_name'].'[auth]', $encrypted, $persistence, $config['persistant_cookie_path'], "", false, true);
        }
        return $persistence;
    }
}
