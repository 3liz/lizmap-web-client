<?php
/**
 * @package     jelix
 * @subpackage  kvdb
 * @author      Yannick Le Guédart
 * @contributor Laurent Jouanneau
 * @copyright   2009 Yannick Le Guédart, 2010-2017 Laurent Jouanneau
 *
 * @link     http://www.jelix.org
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

class redis_extKVDriver extends jKVDriver implements jIKVSet, jIKVttl {

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
     * @return jRedis object
     * @throws jException
     * @throws \RedisException
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

        $cnx = new jRedis();
        $cnx->connect($this->_profile['host'], $this->_profile['port']);

        if (isset($this->_profile['db']) && intval($this->_profile['db']) != 0) {
            $cnx->select($this->_profile['db']);
        }
        return $cnx;
    }

    /**
     * Disconnect from the redis server
     */
    protected function _disconnect() {
        $this->_connection->close();
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
     * @return jRedis
     */
    public function getRedis() {
        return $this->_connection;
    }

    public function get($key) {
        if (is_array($key)) {
            $res = $this->_connection->mGet($this->getUsedKey($key));
        }
        else {
            $res = $this->_connection->get($this->getUsedKey($key));
        }

        if ($res === false) {
            return null;
        }
        $res = $this->unesc($res);
        if (is_array($key)) {
            return array_combine($key, $res);
        }
        else {
            return $res;
        }
    }

    public function set($key, $value) {
        if (is_resource($value))
            return false;
        return $this->_connection->set($this->getUsedKey($key), $this->esc($value));
    }

    public function insert($key, $value) {
        if (is_resource($value))
            return false;
        $key = $this->getUsedKey($key);
        if ($this->_connection->exists($key))
            return false;
        return $this->_connection->set($key, $this->esc($value));
    }

    public function replace($key, $value) {
        if (is_resource($value))
            return false;
        $key = $this->getUsedKey($key);
        if (!$this->_connection->exists($key))
            return false;
        return $this->_connection->set($key, $this->esc($value));
    }

    public function delete($key) {
        return ($this->_connection->delete($this->getUsedKey($key)) > 0);
    }

    public function flush() {
        if (!$this->key_prefix) {
            return $this->_connection->flushDb();
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
                $this->_connection->rPush('jkvdbredisdelkeys', $this->key_prefix);
                return true;
        }
        return false;
    }

    public function append($key, $value) {
        if (is_resource($value))
            return false;
        $key = $this->getUsedKey($key);
        $val = $this->_connection->get($key);
        if ($val === false)
            return false;
        $val = $this->unesc($val).$value;
        $res = $this->_connection->set($key, $this->esc($val));
        if (!$res) {
            return false;
        }
        else {
            return $val;
        }
    }

    public function prepend($key, $value) {
        if (is_resource($value))
            return false;
        $key = $this->getUsedKey($key);
        $val = $this->_connection->get($key);
        if ($val === false)
            return false;
        $val = $value.$this->unesc($val);
        $res = $this->_connection->set($key, $this->esc($val));
        if (!$res) {
            return false;
        }
        else {
            return $val;
        }
    }

    public function increment($key, $incvalue = 1) {
        $val = $this->get($key);
        if ($val === null || !is_numeric($val) || !is_numeric($incvalue))
            return false;
        $usedkey = $this->getUsedKey($key);
        if (intval($val) == $val) {
            if ($incvalue != 1) {
                return $this->_connection->incrBy($usedkey, intval($incvalue));
            }
            return $this->_connection->incr($usedkey);
        }
        else { // float values
            $result = intval($val)+intval($incvalue);
            if ($this->_connection->set($usedkey, $result))
                return $result;
            return false;
        }
    }

    public function decrement($key, $decvalue = 1) {
        $val = $this->get($key);
        if ($val === null || !is_numeric($val) || !is_numeric($decvalue))
            return false;
        $usedkey = $this->getUsedKey($key);
        if (intval($val) == $val) {
            if ($decvalue != 1) {
                return $this->_connection->decrBy($usedkey, intval($decvalue));
            }
            return $this->_connection->decr($usedkey);
        }
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
        return $this->_connection->setEx($key, $ttl, $this->esc($value));
    }

    public function garbage() {
        return true;
    }


    // jIKVSet -------------------------------------------------------------

    public function sAdd($skey, $value) {
        return $this->_connection->sAdd($this->getUsedKey($skey), $value);
    }

    public function sRemove($skey, $value) {
        return $this->_connection->sRem($this->getUsedKey($skey), $value);
    }

    public function sCount($skey) {
        return $this->_connection->sCard($this->getUsedKey($skey));
    }

    public function sPop($skey) {
        return $this->_connection->sPop($this->getUsedKey($skey));
    }


    // ------------------------------------- utils

    protected function esc($val) {
        if (is_numeric($val) || is_int($val))
            return (string)$val;
        else
            return serialize($val);
    }

    protected function unesc($val) {
        if ($val === false) {
            return null;
        }
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

}
