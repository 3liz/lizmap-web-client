<?php
/**
* @package    jelix
* @subpackage core
* @author     Julien Issler
* @contributor Laurent Jouanneau
* @copyright  2007-2009 Julien Issler, 2008-2012 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
* @since 1.0
*/

/**
 * session management class of the jelix core
 *
 * @package  jelix
 * @subpackage core
 * @since 1.0
 */
class jSession {

    protected static $_params;

    /**
     * start a session
     */
    public static function start(){

        $params = & jApp::config()->sessions;

        // do not start the session if the request is made from the command line or if sessions are disabled in configuration
        if (jApp::coord()->request instanceof jCmdLineRequest || !$params['start']) {
            return false;
        }

        $cookieOptions = array(
            'path' => '/',
            'secure' => $params['cookieSecure'], // true to send the cookie only on a secure channel
            'httponly' => $params['cookieHttpOnly'],
            'lifetime' => $params['cookieLifetime']
        );

        if (!$params['shared_session']) {
            //make sure that the session cookie is only for the current application
            $cookieOptions['path'] = jApp::urlBasePath();
        }

        if (PHP_VERSION_ID < 70300) {
            session_set_cookie_params($cookieOptions['lifetime'], $cookieOptions['path'], '', $cookieOptions['secure'], $cookieOptions['httponly']);
        }
        else {
            if ($params['cookieSameSite'] != '') {
                $cookieOptions['samesite'] = $params['cookieSameSite'];
            }
            session_set_cookie_params($cookieOptions);
        }

        if ($params['storage'] != '') {

            /* on debian/ubuntu (maybe others), garbage collector launch probability is set to 0
               and replaced by a simple cron job which is not enough for jSession (different path, db storage, ...),
               so we set it to 1 as PHP's default value */
            if(!ini_get('session.gc_probability'))
                ini_set('session.gc_probability','1');

            switch($params['storage']){
                case 'dao':
                    session_set_save_handler(
                        array(__CLASS__,'daoOpen'),
                        array(__CLASS__,'daoClose'),
                        array(__CLASS__,'daoRead'),
                        array(__CLASS__,'daoWrite'),
                        array(__CLASS__,'daoDestroy'),
                        array(__CLASS__,'daoGarbageCollector')
                    );
                    self::$_params = $params;
                    break;

                case 'files':
                    session_save_path($params['files_path']);
                    break;
            }
        }

        if($params['name'] !=''){
            if(!preg_match('#^[a-zA-Z0-9]+$#',$params['name'])){
                // regexp check because session name can only be alpha numeric according to the php documentation
                throw new jException('jelix~errors.jsession.name.invalid');
            }
            session_name($params['name']);
        }

        if(isset($params['_class_to_load'])) {
            foreach($params['_class_to_load'] as $file) {
                require_once($file);
            }
        }

        session_start();
        return true;
    }

    /**
     * end a session
     */
    public static function end(){
        session_write_close();
        return true;
    }

    public static function isStarted() {
        if (php_sapi_name() !== 'cli') {
            if (version_compare(phpversion(), '5.4.0', '>=') ) {
                return (session_status() === PHP_SESSION_ACTIVE);
            } else {
                return session_id() === '' ? false : true;
            }
        }
        return false;
    }

    protected static function _getDao(){
        if(isset(self::$_params['dao_db_profile']) && self::$_params['dao_db_profile']){
            $dao = jDao::get(self::$_params['dao_selector'], self::$_params['dao_db_profile']);
        }
        else{
            $dao = jDao::get(self::$_params['dao_selector']);
        }
        return $dao;
    }

    /**
     * dao handler for session stored in database
     */
    public static function daoOpen ($save_path, $session_name) {
        return true;
    }

    /**
     * dao handler for session stored in database
     */
    public static function daoClose() {
        return true;
    }

    /**
     * dao handler for session stored in database
     */
    public static function daoRead ($id) {
        $session = self::_getDao()->get($id);

        if(!$session){
            return '';
        }

        return $session->data;
    }

    /**
     * dao handler for session stored in database
     */
    public static function daoWrite ($id, $data) {
        $dao = self::_getDao();

        $session = $dao->get($id);
        if(!$session){
            $session = jDao::createRecord(self::$_params['dao_selector']);
            $session->id = $id;
            $session->data = $data;
            $now = date('Y-m-d H:i:s');
            $session->creation = $now;
            $session->access = $now;
            $dao->insert($session);
        }
        else{
            $session->data = $data;
            $session->access = date('Y-m-d H:i:s');
            $dao->update($session);
        }

        return true;
    }

    /**
     * dao handler for session stored in database
     */
    public static function daoDestroy ($id) {
        if (isset($_COOKIE[session_name()])) {
           setcookie(session_name(), '', time()-42000, '/');
        }

        self::_getDao()->delete($id);
        return true;
    }

    /**
     * dao handler for session stored in database
     */
    public static function daoGarbageCollector ($maxlifetime) {
        $date = new jDateTime();
        $date->now();
        $date->sub(0,0,0,0,0,$maxlifetime);
        self::_getDao()->deleteExpired($date->toString(jDateTime::DB_DTFORMAT));
        return true;
    }

}
