<?php
/**
 * @package    jelix
 * @subpackage kvdb_plugin
 *
 * @author     Laurent Jouanneau
 * @copyright  2012-2021 Laurent Jouanneau
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

class dbaKVDriver extends jKVDriver implements jIKVPersistent
{
    /**
     * Gets one or several values;
     *
     * @param string|array $key a key or an array of keys
     * @return string or null if the key doesn't exist
     */
    public function get($key) {
        if (is_array($key)) {
            $result = array();
            foreach($key as $k) {
                if (dba_exists($k, $this->_connection)) {
                    $result[$k] = unserialize(dba_fetch($k, $this->_connection));
                }
            }
            return $result;
        }
        else {
            if (dba_exists($key, $this->_connection)) {
                return unserialize(dba_fetch($key, $this->_connection));
            }
        }
        return null;
    }

    /**
     * Store a key/value.
     *
     * @param string $key  the key
     * @param string $value
     *
     * @return boolean  false if failure, if the value is a resource...
     */
    public function set($key, $value)
    {
        if ($this->isResource($value)) {
            return false;
        }
        if (dba_exists($key, $this->_connection))
            return dba_replace($key, serialize($value), $this->_connection);
        else
            return dba_insert($key, serialize($value), $this->_connection);
    }

    /**
     * Store a key/value. If the key already exist : error
     *
     * @param string $key  the key
     * @param string $value
     *
     * @return boolean  false if failure
     */
    public function insert($key, $value)
    {
        if ($this->isResource($value)) {
            return false;
        }
        return dba_insert($key, serialize($value), $this->_connection);
        
    }

    /**
     * Store a key/value. The key should exists
     *
     * @param string $key  the key
     * @param string $value
     *
     * @return boolean  false if failure
     */
    public function replace($key, $value)
    {
        if ($this->isResource($value)) {
            return false;
        }
        if (dba_exists($key, $this->_connection))
            return dba_replace($key, serialize($value), $this->_connection);
        return false;
    }

    /**
     * Deletes a key from the KVdb.
     *
     * @param string  $key the key
     * @return boolean false if failure
     */
    public function delete($key){
        return dba_delete($key, $this->_connection);
    }

    /**
     * Flush the KVDb. Deletes all keys.
     * @return boolean true if it is a success
     */
    public function flush() {

        $key = dba_firstkey($this->_connection);
        $handle_later = array();
        while ($key != false) {
            $handle_later[] = $key;
            $key = dba_nextkey($this->_connection);
        }
        
        foreach ($handle_later as $val) {
            dba_delete($val, $this->_connection);
        }
        return true;
    }

    /**
     * append a string to an existing key value
     * @param string $key   the key of the value to modify
     * @param string $value  the value to append to the current key value
     * @return string  the new value or false if failure
     */
    public function append($key, $value)
    {
        if ($this->isResource($value)) {
            return false;
        }
        if (!dba_exists($key, $this->_connection))
            return false;

        $value = unserialize(dba_fetch($key, $this->_connection)) . $value;
        dba_replace($key, serialize($value), $this->_connection);
        return $value;
    }

    /**
     * prepend a string to an existing key value
     * @param string $key   the key of the value to modify
     * @param string $value  the value to prepend to the current key value
     * @return string  the new value or false if failure
     */
    public function prepend($key, $value)
    {
        if ($this->isResource($value)) {
            return false;
        }
        if (!dba_exists($key, $this->_connection))
            return false;

        $value .= unserialize(dba_fetch($key, $this->_connection));
        dba_replace($key, serialize($value), $this->_connection);
        return $value;
    }

    /**
    * increment a value by $incr. the key should exist and should be an integer.
    * @param string $key    the key of the value
    * @param mixed  $incr   the value to add to the current value
    * @return integer   the result, or false if failure
    */
    public function increment($key, $incr = 1) {
        if (!is_numeric($incr)) {
            return false;
        }
        if (!dba_exists($key, $this->_connection))
            return false;

        $value = unserialize(dba_fetch($key, $this->_connection));
        if (!is_numeric($value))
            return false;
        
        $value = serialize($value + $incr);
        dba_replace($key, $value, $this->_connection);
        return true;
    }

    /**
    * decrement a value by $decr. the key should exist and should be an integer.
    * @param string $key    the key of the value
    * @param mixed  $decr   the value to substract to the current value
    * @return integer   the result, or false if failure
    */
    public function decrement($key, $decr = 1) {
        if (!is_numeric($decr)) {
            return false;
        }
        if (!dba_exists($key, $this->_connection))
            return false;

        $value = unserialize(dba_fetch($key, $this->_connection));
        if (!is_numeric($value))
            return false;
        
        $value = serialize($value - $decr);
        dba_replace($key, $value, $this->_connection);
        return true;
    }

    protected $_file;
    protected function _connect() {
        
        if (isset($this->_profile['file']) && $this->_profile['file']!='') {
            $this->_file = jFile::parseJelixPath( $this->_profile['file'] );
        }
        else
            throw new Exception('No file in the configuration of the dba driver for jKVDB');

        $mode = "cl";
        if (isset($this->_profile['handler']) && $this->_profile['handler']!='') {
            $handler = $this->_profile['handler'];
        }
        else
            throw new Exception('No handler in the configuration of the dba driver for jKVDB');

        if (isset($this->_profile['persistant']) && $this->_profile['persistant'])
            $conn = dba_popen($this->_file, $mode, $handler);
        else
            $conn = dba_open($this->_file, $mode, $handler);
        if ($conn === false)
            return null;
        return $conn;
    }

    protected function _disconnect() {
        dba_close($this->_connection);
    }

    //------------------ jIKVPersistent

    /**
     * synchronize the memory content with the persistent storage
     */
    public function sync() {
        return dba_sync($this->_connection);
    }
}
