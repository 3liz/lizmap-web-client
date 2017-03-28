<?php
/**
 * @package     jelix
 * @subpackage  kvdb
 * @author      Yannick Le Guédart
 * @contributor Laurent Jouanneau
 * @copyright   2009 Yannick Le Guédart, 2010-2016 Laurent Jouanneau
 *
 * @link     http://www.jelix.org
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

class redis_phpKVDriver extends jKVDriver implements jIKVSet, jIKVttl {

    protected $key_prefix = '';

    /**
     * method to flush the keys when key_prefix is used
     *
     * direct: uses SCAN and DEL, but it can take huge time
     * jkvdbredisworker: it stores the keys prefix to delete into a redis list
     *     named 'jkvdbredisdelkeys'.
     *     You can use a script to launch a worker which pops from this list
     *     prefix of keys to delete, and delete them with SCAN/DEL redis commands.
     *     See the redisworker controller in the jelix module.
     * event: send a jEvent. It's up to your application to respond to this event
     *     and to implement your prefered method to delete all keys.
     */
    protected $key_prefix_flush_method = 'direct';

    /**
     * Connects to the redis server
     * @return \PhpRedis\Redis object
     * @throws jException
     */
    protected function _connect() {

        // A host is needed
        if (! isset($this->_profile['host'])) {
            throw new jException(
                'jelix~kvstore.error.no.host', $this->_profileName);
        }

        // A port is needed as well
        if (! isset($this->_profile['port'])) {
            throw new jException(
                'jelix~kvstore.error.no.port', $this->_profileName);
        }

        if (isset($this->_profile['key_prefix'])) {
            $this->key_prefix = $this->_profile['key_prefix'];
        }

        if ($this->key_prefix && isset($this->_profile['key_prefix_flush_method'])) {
            if (in_array($this->_profile['key_prefix_flush_method'],
                         array('direct', 'jkvdbredisworker', 'event'))) {
                $this->key_prefix_flush_method = $this->_profile['key_prefix_flush_method'];
            }
        }

        // OK, let's connect now
        $cnx = new \PhpRedis\Redis($this->_profile['host'], $this->_profile['port']);

        if (isset($this->_profile['db']) && intval($this->_profile['db']) != 0) {
            $cnx->select_db($this->_profile['db']);
        }
        return $cnx;
    }

    /**
     * Disconnect from the redis server
     */
    protected function _disconnect() {
        $this->_connection->disconnect();
    }

    protected function getUsedKey($key) {
        if ($this->key_prefix == '') {
            return $key;
        }

        $prefix = $this->key_prefix;
        if (is_array($key)) {
            return array_map(function($k) use($prefix) {
                return $prefix.$k;
            }, $key);
        }

        return $prefix.$key;
    }

    /**
     * @return \PhpRedis\Redis
     */
    public function getRedis() {
        return $this->_connection;
    }

    public function get($key) {
        $res = $this->_connection->get($this->getUsedKey($key));
        if ($res === null)
            return null;
        $res = $this->unesc($res);
        if (is_array($key)) {
            return array_combine($key, $res);
        }
        else
            return $res;
    }

    public function set($key, $value) {
        if (is_resource($value))
            return false;
        $res = $this->_connection->set($this->getUsedKey($key), $this->esc($value));
        return ($res === 'OK');
    }

    public function insert($key, $value) {
        if (is_resource($value))
            return false;
        $key = $this->getUsedKey($key);
        if ($this->_connection->exists($key) == 1)
            return false;
        $res = $this->_connection->set($key, $this->esc($value));
        return ($res === 'OK');
    }

    public function replace($key, $value) {
        if (is_resource($value))
            return false;
        $key = $this->getUsedKey($key);
        if ($this->_connection->exists($key) == 0)
            return false;
        $res = $this->_connection->set($key, $this->esc($value));
        return ($res === 'OK');
    }

    public function delete($key) {
        return ($this->_connection->delete($this->getUsedKey($key)) > 0);
    }

    public function flush() {
        if (!$this->key_prefix) {
            return ($this->_connection->flushdb()  == 'OK');
        }
        switch($this->key_prefix_flush_method) {
            case 'direct':
                $this->_connection->flushByPrefix($this->key_prefix);
                return true;
            case 'event':
                jEvent::notify('jKvDbRedisFlushKeyPrefix', array('prefix'=>$this->key_prefix,
                                                                 'profile' =>$this->_profile['_name']));
                return true;
            case 'jkvdbredisworker':
                $this->_connection->rpush('jkvdbredisdelkeys', $this->key_prefix);
                return true;
        }
        return false;
    }

    public function append($key, $value) {
        if (is_resource($value))
            return false;
        $key = $this->getUsedKey($key);
        $val = $this->_connection->get($key);
        if ($val === null)
            return false;
        $val = $this->unesc($val).$value;
        $res = $this->_connection->set($key, $this->esc($val));
        if ($res !== 'OK')
            return false;
        else return $val;
    }

    public function prepend($key, $value) {
        if (is_resource($value))
            return false;
        $key = $this->getUsedKey($key);
        $val = $this->_connection->get($key);
        if ($val === null)
            return false;
        $val = $value.$this->unesc($val);
        $res = $this->_connection->set($key, $this->esc($val));
        if ($res !== 'OK')
            return false;
        else return $val;
    }

    public function increment($key, $incvalue = 1) {
        $val = $this->get($key);
        if ($val === null || !is_numeric($val) || !is_numeric($incvalue))
            return false;
        $usedkey = $this->getUsedKey($key);
        if (intval($val) == $val)
            return $this->_connection->incr($usedkey, intval($incvalue));
        else { // float values
            $result = intval($val)+intval($incvalue);
            if($this->_connection->set($usedkey, $result))
                return $result;
            return false;
        }
    }

    public function decrement($key, $decvalue = 1) {
        $val = $this->get($key);
        if ($val === null || !is_numeric($val) || !is_numeric($decvalue))
            return false;
        $usedkey = $this->getUsedKey($key);
        if (intval($val) == $val)
            return $this->_connection->decr($usedkey, intval($decvalue));
        else { // float values
            $result = intval($val)-intval($decvalue);
            if ($this->_connection->set($usedkey, $result))
                return $result;
            return false;
        }
    }

    // jIKVttl -------------------------------------------------------------
    public function setWithTtl($key, $value, $ttl) {
        if (is_resource($value))
            return false;

        if ($ttl != 0 && $ttl > 2592000) {
            $ttl -= time();
        }
        if ($ttl <= 0)
            return true;

        $key = $this->getUsedKey($key);
        $res = $this->_connection->set($key, $this->esc($value));

        if ($res !== 'OK') {
            return false;
        }

        return ($this->_connection->expire($key, $ttl) == 1);
    }

    public function garbage() {
        return true;
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
        }
        return $val;
    }

    // jIKVSet -------------------------------------------------------------

    public function sAdd($skey, $value) {
        return $this->_connection->sadd($this->getUsedKey($skey), $value);
    }

    public function sRemove($skey, $value) {
        return $this->_connection->srem($this->getUsedKey($skey), $value);
    }

    public function sCount($skey) {
        return $this->_connection->scard($this->getUsedKey($skey));
    }

    public function sPop($skey) {
        return $this->_connection->spop($this->getUsedKey($skey));
    }

}
