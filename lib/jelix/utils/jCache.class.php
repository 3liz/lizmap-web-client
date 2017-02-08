<?php
/**
* @package     jelix
* @subpackage  cache
* @author      Tahina Ramaroson
* @contributor Sylvain de Vathaire, Brice Tence, Laurent Jouanneau
* @copyright   2009 Neov, 2010 Brice Tence, 2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* Interface for cache drivers
* @package     jelix
* @subpackage  cache
*/
interface jICacheDriver {
    /**
     * constructor
     * @param array $params driver parameters, written in the ini file
     */
    function __construct($params);

    /**
    * read a specific data in the cache.
    * @param mixed $key     key or array of keys used for storing data in the cache
    * @return mixed the value or false if failure
    */
    public function get ($key);

    /**
    * write a specific data in the cache.
    * @param string $key    key used for storing data in the cache
    * @param mixed  $value    data to store
    * @param mixed  $ttl    data time expiration. 0 means no expire, use a timestamp UNIX or a delay in secondes which mustn't exceed 30 days i.e 2592000s or a string in date format US
    */
    public function set ($key, $value, $ttl = 0);

    /**
    * delete a specific data in the cache
    * @param string $key       key used for storing data in the cache
    */
    public function delete ($key);

    /**
    * increment a specific data value by $incvalue
    * @param string $key       key used for storing data in the cache
    * @param mixed  $incvalue    value used to increment
    */
    public function increment ($key, $incvalue = 1);

    /**
    * decrement a specific data value by $decvalue
    * @param string $key       key used for storing data in the cache
    * @param mixed  $decvalue    value used to decrement
    */
    public function decrement ($key, $decvalue = 1);

    /**
    * replace a specific data value by $var
    * @param string $key       key used for storing data in the cache
    * @param mixed  $value    data to replace
    * @param mixed  $ttl    data time expiration. 0 means no expire, use a timestamp UNIX or a delay in secondes which mustn't exceed 30 days i.e 2592000s or a string in date format US
    */
    public function replace ($key, $value, $ttl = 0);

    /**
    * remove from the cache data of which TTL was expired
    */
    public function garbage ();

    /**
    * clear data in the cache
    */
    public function flush ();

}

/**
 * Global caching data provided from whatever sources
 * @since 1.2
 */
class jCache {

    /**
    * retrieve data in the cache 
    *
    * @param mixed   $key   key or array of keys used for storing data in the cache
    * @param string  $profile the cache profile name to use. if empty, use the default profile
    * @return mixed  $data      data stored
    */
    public static function get ($key, $profile='') {

        $drv = self::getDriver($profile);

        if (!$drv->enabled) {
            return false;
        }

        if (is_array($key)) {
            foreach ($key as $value) {
                self::_checkKey($value);
            }
        }
        else {
            self::_checkKey($key);
        }

        return $drv->get($key);

    }

    /**
     * set a specific data in the cache
     * @param string $key key used for storing data
     * @param mixed $value data to store
     * @param mixed $ttl data time expiration. 0 means no expire, use a timestamp UNIX or a delay in secondes which mustn't exceed 30 days i.e 2592000s or a string in date format US
     * @param string $profile the cache profile name to use. if empty, use the default profile
     * @return bool false if failure
     * @throws jException
     */
    public static function set ($key, $value, $ttl=null, $profile='') {

        $drv = self::getDriver($profile);

        if (!$drv->enabled || is_resource($value)) {
            return false;
        }

        self::_checkKey($key);

        if (is_null($ttl)) {
            $ttl = $drv->ttl;
        }
        elseif (is_string($ttl)) {
            if (($ttl = strtotime($ttl)) === FALSE) {
                throw new jException('jelix~cache.error.wrong.date.value');
            }
        }

        if ($ttl > 2592000 && $ttl < time()) {
            return $drv->delete($key);
        }

        //automatic cleaning cache
        if($drv->automatic_cleaning_factor > 0 &&  rand(1, $drv->automatic_cleaning_factor) == 1){
            $drv->garbage();
        }

        return $drv->set($key, $value, $ttl);
    }

    /**
     * call a specified method/function or get the result from cache. The function
     * must not return false. The result of the function is stored into the
     * cache system, with the function name and other things as key. If the
     * key already exists in the cache, the function is not called and the value
     * is returned directly.
     * @param mixed $fn method/function name ($functionName or array($object, $methodName) or array($className, $staticMethodName))
     * @param array $fnargs arguments used by the method/function
     * @param mixed $ttl data time expiration. 0 means no expire, use a timestamp UNIX or a delay in secondes which mustn't exceed 30 days i.e 2592000s or a string in date format US
     * @param string $profile the cache profile name to use. if empty, use the default profile
     * @return mixed method/function result
     * @throws jException
     */
    public static function call ($fn, $fnargs=array(), $ttl=null, $profile='') {

        $drv = self::getDriver($profile);

        if($drv->enabled){

            $key = md5(serialize($fn).serialize($fnargs));
            $lockKey = $key.'___jcacheLock';
            $data = $drv->get($key);
            if ($data === false) {
                //wait lock to be realesed (if a lock exists)
                $lockTests=0;
                while( $drv->get($lockKey) ) {
                    usleep(100000);
                    if( ($lockTests++)%10 == 0 ) { //every second, first shot is on first call
                        //automatic cleaning cache
                        if($drv->automatic_cleaning_factor > 0 &&  rand(1, $drv->automatic_cleaning_factor) == 1){
                            $drv->garbage();
                        }
                    }
                }
                if( $lockTests > 0 ) {
                    //a lock has been met. So read again jCache value now that it has been released
                    $data = $drv->get($key);
                }
            }

            if ( $data === false ) {
                $lockTtl = get_cfg_var('max_execution_time');
                if( !$lockTtl ) {
                    $lockTtl = $drv->ttl;
                }
                $lockTtl = max( 30, min( $lockTtl, $drv->ttl ) ); //prevent lock ttl from being more than drv's ttl and from being eternal
                $drv->set($lockKey,true,$lockTtl);

                $data = self::_doFunctionCall($fn,$fnargs);

                if (!is_resource($data)) {
                    if (is_null($ttl)) {
                        $ttl = $drv->ttl;
                    } elseif (is_string($ttl)) {
                        if (($ttl = strtotime($ttl))===FALSE) {
                            throw new jException('jelix~cache.error.wrong.date.value');
                        }
                    }
                    if (!($ttl > 2592000 && $ttl < time())) {
                        //automatic cleaning cache
                        if($drv->automatic_cleaning_factor > 0 &&  rand(1,$drv->automatic_cleaning_factor)==1){
                            $drv->garbage();
                        }
                        $drv->set($key,$data,$ttl);
                    }
                }
                $drv->delete($lockKey);
            }

            return $data;

        }else{
            return self::_doFunctionCall($fn,$fnargs);
        }
    }

    /**
    * delete a specific data in the cache
    * @param string $key    key used for storing data in the cache
    * @param string $profile the cache profil name to use. if empty, use the default profile
    * @return boolean false if failure
    */
    public static function delete ($key, $profile=''){

        $drv = self::getDriver($profile);

        if (!$drv->enabled) {
            return false;
        }

        self::_checkKey($key);

        return $drv->delete($key);

    }

    /**
    * increment a specific data value by $incvalue
    * @param string $key    key used for storing data in the cache
    * @param mixed  $incvalue    value used
    * @param string $profile the cache profile name to use. if empty, use the default profile
    * @return boolean false if failure
    */
    public static function increment ($key, $incvalue=1, $profile='') {

        $drv = self::getDriver($profile);

        if (!$drv->enabled) {
            return false;
        }

        self::_checkKey($key);

        return $drv->increment($key, $incvalue);
    }

    /**
    * decrement a specific data value by $decvalue
    * @param string $key    key used for storing data in the cache
    * @param mixed  $decvalue    value used
    * @param string $profile the cache profile name to use. if empty, use the default profile
    * @return boolean false if failure
    */
    public static function decrement ($key, $decvalue=1, $profile=''){

        $drv = self::getDriver($profile);

        if (!$drv->enabled) {
            return false;
        }

        self::_checkKey($key);
        return $drv->decrement($key, $decvalue);
    }

    /**
     * replace a specific data value by $value
     * @param string $key key used for storing data in the cache
     * @param mixed $value data to replace
     * @param mixed $ttl data time expiration. 0 means no expire, use a timestamp UNIX or a delay in secondes which mustn't exceed 30 days i.e 2592000s or a string in date format US
     * @param string $profile the cache profile name to use. if empty, use the default profile
     * @return bool false if failure
     * @throws jException
     */
    public static function replace ($key, $value, $ttl=null, $profile=''){

        $drv = self::getDriver($profile);

        if(!$drv->enabled || is_resource($value)){
            return false;
        }

        self::_checkKey($key);

        if (is_null($ttl)) {
            $ttl = $drv->ttl;
        }
        elseif (is_string($ttl)) {
            if (($ttl=strtotime($ttl))===FALSE) {
                throw new jException('jelix~cache.error.wrong.date.value');
            }
        }

        if ($ttl > 2592000 && $ttl < time()) {
            return $drv->delete($key);
        }

        return $drv->replace($key, $value, $ttl);
    }

    /**
     * add data in the cache
     * @param string $key key used for storing data in the cache
     * @param mixed $value data to add
     * @param mixed $ttl data time expiration. 0 means no expire, use a timestamp UNIX or a delay in secondes which mustn't exceed 30 days i.e 2592000s or a string in date format US
     * @param string $profile the cache profile name to use. if empty, use the default profile
     * @return bool false if failure
     * @throws jException
     */
    public static function add ($key, $value, $ttl=null, $profile=''){

        $drv = self::getDriver($profile);

        if (!$drv->enabled || is_resource($value)) {
            return false;
        }

        self::_checkKey($key);

        if($drv->get($key)){
            return false;
        }

        if (is_null($ttl)) {
            $ttl = $drv->ttl;
        }
        elseif (is_string($ttl)) {
            if (($ttl = strtotime($ttl))===FALSE) {
                throw new jException('jelix~cache.error.wrong.date.value');
            }
        }

        if ($ttl > 2592000 && $ttl < time()) {
            return false;
        }

        //automatic cleaning cache
        if ($drv->automatic_cleaning_factor > 0 &&  rand(1, $drv->automatic_cleaning_factor)==1) {
            $drv->garbage();
        }

        return $drv->set($key, $value, $ttl);
    }

    /**
    * remove from the cache data of which TTL was expired
    *
    * @param string $profile the cache profile name to use. if empty, use the default profile
    * @return boolean false if failure
    */
    public static function garbage ($profile=''){

        $drv = self::getDriver($profile);

        if (!$drv->enabled) {
            return false;
        }

        return $drv->garbage();
    }

    /**
    * clear data in the cache
    *
    * @param string $profile the cache profile name to use. if empty, use the default profile
    * @return boolean false if failure
    */
    public static function flush ($profile='') {

        $drv = self::getDriver($profile);

        if (!$drv->enabled) {
            return false;
        }

        return $drv->flush();
    }

    /**
     * load the cache driver
     *
     * get an instance of driver according the settings in the profile file
     * @param string $profile profile name
     * @return jICacheDriver
     */
    public static function getDriver($profile) {
        return jProfiles::getOrStoreInPool('jcache', $profile, array('jCache', '_loadDriver'), true);
    }

    /**
     * callback method for jProfiles. internal use.
     */
    public static function _loadDriver($profile) {
        $driver = jApp::loadPlugin($profile['driver'], 'cache', '.cache.php', $profile['driver'].'CacheDriver', $profile);
        if (is_null($driver))
            throw new jException('jelix~cache.error.driver.missing',array($profile['_name'], $profile['driver']));
    
        if (!$driver instanceof jICacheDriver) {
            throw new jException('jelix~cache.driver.object.invalid', array($profile['_name'], $profile['driver']));
        }
        return $driver;
    }

    /**
     * verify the key for a specific data : only a subset of characters
     * are accepted : letters, numbers, '_','/',':','.','-','@','#','&'.
     *
     * no space.
     *
     * db, redis: any characters
     * memcache: no space, no control char (\t \n \00)
     * file: any (key is hashed with md5)
     *
     * @param string $key key used for storing data
     * @throws jException
     */
    protected static function _checkKey($key){
        if (!preg_match('/^[\\w0-9_\\/:\\.\\-@#&]+$/iu',$key) || strlen($key) > 255) {
            throw new jException('jelix~cache.error.invalid.key',$key);
        }
    }

    public static function normalizeKey($key) {
        if (preg_match('/[^\\w0-9_\\/:\\.\\-@#&]/iu',$key)) {
            $key = preg_replace('/[^\\w0-9_\\/:\\.\\-@#&]/iu', '_', $key)
                .'#'.sha1($key);
        }
        return $key;
    }

    /**
     * check and call a specified method/function
     * @param mixed $fn method/function name
     * @param array $fnargs arguments used by the method/function
     * @return mixed $data      method/function result
     * @throws jException
     */
    protected static function _doFunctionCall($fn,$fnargs) {

        if (!is_callable($fn)) {
            throw new jException('jelix~cache.error.function.not.callable',self::_functionToString($fn));
        }

        try {
            $data = call_user_func_array($fn,$fnargs);
        }
        catch(Exception $e) {
            throw new jException('jelix~cache.error.call.function',array(self::_functionToString($fn),$e->getMessage()));
        }

        return $data;
    }

    /**
    * get the method/function full name 
    * @param mixed  $fn        method/function name
    * @return string  $fnname      method/function name
    */
    protected static function _functionToString($fn) {

        if (is_array($fn)) {
            if (is_object($fn[0])) {
                $fnname = get_class($fn[0])."-".$fn[1];
            }
            else {
                $fnname = implode("-",$fn);
            }
        }
        else {
            $fnname = $fn;
        }

        return $fnname;
    }
}

