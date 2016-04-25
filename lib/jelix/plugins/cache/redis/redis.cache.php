<?php
/**
 * @package     jelix
 * @subpackage  cache
 * @author      Yannick Le Guédart
 * @contributor Laurent Jouanneau
 * @copyright   2009 Yannick Le Guédart, 2010-2016 Laurent Jouanneau
 *
 * @link     http://www.jelix.org
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

require_once(LIB_PATH . 'php5redis/Redis.php');

class redisCacheDriver implements jICacheDriver {

    /**
    * profil name used in the ini file
    * @var string
    * @access public
    */
    protected $profileName;

    /**
    * active cache ?
    * @var boolean
    * @access public
    */
    public $enabled = true;

    /**
    * TTL used
    * @var boolean
    * @access public
    */
    public $ttl = 0;

    /**
    * automatic cleaning process
    * 0 means disabled, 1 means systematic cache cleaning of expired data (at each set or add call), greater values mean less frequent cleaning
    * @var integer
    * @access public
    */
    public $automatic_cleaning_factor = 0;

    /**
     * @param Redis the redis connection
     */
    protected $redis;

    public function __construct($params) {

        $this->profileName = $params['_name'];

        // A host is needed
        if (! isset($params['host'])) {
            throw new jException(
                'jelix~cache.error.no.host', $this->profileName);
        }

        // A port is needed as well
        if (! isset($params['port'])) {
            throw new jException(
                'jelix~cache.error.no.port', $this->profileName);
        }

        if (isset($params['enabled'])) {
            $this->enabled = ($params['enabled'])?true:false;
        }

        if (isset($params['ttl'])) {
            $this->ttl = $params['ttl'];
        }

        if (isset($params['automatic_cleaning_factor'])) {
            $this->automatic_cleaning_factor = $params['automatic_cleaning_factor'];
        }

        // OK, let's connect now
        $this->redis = new Redis($params['host'], $params['port']);
    }

    /**
    * read a specific data in the cache.
    * @param mixed   $key   key or array of keys used for storing data in the cache
    * @return mixed $data      array of data or false if failure
    */
    public function get($key) {
        $res = $this->redis->get($key);
        if ($res === null)
            return false;
        $res = $this->unesc($res);
        if (is_array($key)) {
            return array_combine($key, $res);
        }
        else {
            return $res;
        }
    }

    /**
    * set a specific data in the cache
    * @param string $key    key used for storing data
    * @param mixed  $var    data to store
    * @param int    $ttl    data time expiration
    * @return boolean       false if failure
    */
    public function set($key, $value, $ttl = 0) {
        if (is_resource($value)) {
            return false;
        }
        $res = $this->redis->set($key, $this->esc($value));

        if ($res !== 'OK') {
            return false;
        }

        if ($ttl === 0) {
            return true;
        }
        if ($ttl != 0 && $ttl > 2592000) {
            $ttl -= time();
        }
        if ($ttl <= 0) {
            return true;
        }

        return ($this->redis->expire($key, $ttl) == 1);
    }

    /**
    * delete a specific data in the cache
    * @param string $key    key used for storing data in the cache
    * @return boolean       false if failure
    */
    public function delete($key) {
        return ($this->redis->delete($key) > 0);
    }

    /**
    * increment a specific data value by $var
    * @param string $key    key used for storing data in the cache
    * @param mixed  $incvalue    value used
    * @return boolean       false if failure
    */
    public function increment($key, $incvalue = 1) {
        $val = $this->get($key);
        if ($val === null || !is_numeric($val) || !is_numeric($incvalue)) {
            return false;
        }
        if (intval($val) == $val) {
            return $this->redis->incr($key, intval($incvalue));
        }
        else { // float values
            $result = intval($val)+intval($incvalue);
            if($this->redis->set($key, $result)) {
                return $result;
            }
            return false;
        }
    }

    /**
    * decrement a specific data value by $var
    * @param string $key    key used for storing data in the cache
    * @param mixed  $decvalue    value used
    * @return boolean       false if failure
    */
    public function decrement($key, $decvalue = 1) {
        $val = $this->get($key);
        if ($val === null || !is_numeric($val) || !is_numeric($decvalue)) {
            return false;
        }
        if (intval($val) == $val) {
            return $this->redis->decr($key, intval($decvalue));
        }
        else { // float values
            $result = intval($val)-intval($decvalue);
            if ($this->redis->set($key, $result)) {
                return $result;
            }
            return false;
        }
    }

    /**
    * replace a specific data value by $var
    * @param string $key    key used for storing data in the cache
    * @param mixed  $var    data to replace
    * @param int    $ttl    data time expiration
    * @return boolean       false if failure
    */
    public function replace($key, $value, $ttl = 0) {
        if ($this->redis->exists($key) == 0) {
            return false;
        }
        return $this->set($key, $value, $ttl);
    }

    /**
    * remove from the cache data of which TTL was expired
    * element with TTL expired already removed => Nothing to do because memcache have an internal garbage mechanism
    * @return boolean
    */
    public function garbage() {
        return true;
    }

    /**
    * clear all data in the cache
    * @return boolean       false if failure
    */
    public function flush() {
        return ($this->redis->flushall()  == 'OK');
    }

    protected function esc($val) {
        if (is_numeric($val) || is_int($val))
            return (string)$val;
        else
            return serialize($val);
    }

    protected function unesc($val) {
        if (is_numeric($val))
            return floatval($val);
        else if (is_string($val))
            return unserialize($val);
        else if (is_array($val)) {
            foreach($val as $k=>$v) {
                $val[$k] = $this->unesc($v);
            }
            return $val;
        }
    }
}
