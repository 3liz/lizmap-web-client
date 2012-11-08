<?php
/**
 * @package     jelix
 * @subpackage  kvdb
 * @author      Yannick Le Guédart
 * @contributor Laurent Jouanneau
 * @copyright   2009 Yannick Le Guédart, 2010 Laurent Jouanneau
 *
 * @link     http://www.jelix.org
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

require_once(LIB_PATH . 'php5redis/Redis.php');

class redisKVDriver extends jKVDriver implements jIKVSet, jIKVttl {

    /**
     * Connects to the redis server
     *
     * @return Redis object
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

        // OK, let's connect now
        $cnx = new Redis($this->_profile['host'], $this->_profile['port']);
        return $cnx;
    }

    /**
     * Disconnect from the redis server
     */
    protected function _disconnect() {
        $this->_connection->disconnect();
    }

    public function get($key) {
        $res = $this->_connection->get($key);
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
        $res = $this->_connection->set($key, $this->esc($value));
        return ($res === 'OK');
    }

    public function insert($key, $value) {
        if (is_resource($value))
            return false;
        if ($this->_connection->exists($key) == 1)
            return false;
        $res = $this->_connection->set($key, $this->esc($value));
        return ($res === 'OK');
    }

    public function replace($key, $value) {
        if (is_resource($value))
            return false;
        if ($this->_connection->exists($key) == 0)
            return false;
        $res = $this->_connection->set($key, $this->esc($value));
        return ($res === 'OK');
    }

    public function delete($key) {
        return ($this->_connection->delete($key) > 0);
    }

    public function flush() {
        return ($this->_connection->flushall()  == 'OK');
    }

    public function append($key, $value) {
        if (is_resource($value))
            return false;
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
        if (intval($val) == $val)
            return $this->_connection->incr($key, intval($incvalue));
        else { // float values
            $result = intval($val)+intval($incvalue);
            if($this->_connection->set($key, $result))
                return $result;
            return false;
        }
    }

    public function decrement($key, $decvalue = 1) {
        $val = $this->get($key);
        if ($val === null || !is_numeric($val) || !is_numeric($decvalue))
            return false;
        if (intval($val) == $val)
            return $this->_connection->decr($key, intval($decvalue));
        else { // float values
            $result = intval($val)-intval($decvalue);
            if ($this->_connection->set($key, $result))
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
            return $val;
        }
    }

	// jIKVSet -------------------------------------------------------------

    public function sAdd($skey, $value) {
        return $this->_connection->sadd($skey, $value);
    }

    public function sRemove($skey, $value) {
        return $this->_connection->srem($skey, $decvalue);
    }

    public function sCount($skey) {
        return $this->_connection->scard($skey);
    }

    public function sPop($skey) {
        return $this->_connection->spop($skey);
    }

}
