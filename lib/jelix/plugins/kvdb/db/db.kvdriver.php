<?php
/**
* @package    jelix
* @subpackage kvdb
* @author     Laurent Jouanneau
* @copyright  2010 Laurent Jouanneau
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

class dbKVDriver extends jKVDriver implements jIKVttl, jIKVPersistent {

    protected $table;

   	protected function _connect() {

        if (!isset($this->_profile['table']) || !isset($this->_profile['dbprofile'])) {
            throw new Exception("table and dbprofile is missing for the db kvdb driver");
        }

        $this->table = $this->_profile['table'];

        $cnx = jDb::getConnection($this->_profile['dbprofile']);
        return $cnx;
	}

   	protected function _disconnect() {
        $this->_connection = null;
    }

    public function get ($key) {

        $sql = 'SELECT k_key, k_value FROM '.$this->_connection->prefixTable($this->table).
        ' WHERE k_expire > \''.date('Y-m-d H:i:s').'\' AND k_key ';

        if (is_array($key)) {
            $in = '';
            foreach($key as $k) {
                $in.=','.$this->_connection->quote($k);
            }
            $sql.= ' IN ('.substr($in,1).')';
            
            $result = array_combine($key, array_fill(0, count($key), null));
            $rs = $this->_connection->query($sql);
            if (!$rs)
                return $result;
            
            foreach ($rs as $rec) {
                $result[$rec->k_key] = unserialize($rs->unescapeBin($rec->k_value));
            }
            return $result;
        }
        else {
            $sql.= ' = '.$this->_connection->quote($key);
            $rs = $this->_connection->query($sql);
            if (!$rs)
                return null;
            $result = $rs->fetch();
            if (!$result)
                return null;
            return unserialize($rs->unescapeBin($result->k_value));
        }
    }

    public function set ($key, $value) {
		if (is_resource($value))
			return false;
        return $this->_set($key, $value, '2050-12-31 00:00:00');
    }

    public function _set ($key, $value, $expire) {

        $table = $this->_connection->prefixTable($this->table);
        $key = $this->_connection->quote($key);
        $value = $this->_connection->quote2(serialize($value), false, true);
        $expire = $this->_connection->quote($expire);

        $sql = 'SELECT k_key, k_value FROM '.$table.
               ' WHERE k_key = '.$key;

        $rs = $this->_connection->query($sql);
        if (!$rs || !$rs->fetch()) {
            $sql = 'INSERT INTO '.$table.' (k_key, k_value, k_expire) VALUES ('
            .$key.','.$value.','.$expire.')';
        }
        else {
            $sql = 'UPDATE '.$table.' SET k_value= '.$value.',  k_expire = '.$expire.'
            WHERE k_key='.$key;
        }
        return (bool) $this->_connection->exec($sql);
    }

    public function insert ($key, $value) {
		if (is_resource($value))
			return false;

        $table = $this->_connection->prefixTable($this->table);
        $key = $this->_connection->quote($key);
        $value = $this->_connection->quote2(serialize($value), false, true);

        try {
            $sql = 'INSERT INTO '.$table.' (k_key, k_value, k_expire) VALUES ('
            .$key.','.$value.',\'2050-12-31 00:00:00\')';
            return $this->_connection->exec($sql);
        }
        catch(Exception $e) {
            return false;
        }
    }

    public function replace ($key, $value) {
		if (is_resource($value))
			return false;

        $table = $this->_connection->prefixTable($this->table);
        $key = $this->_connection->quote($key);
        $value = $this->_connection->quote2(serialize($value), false, true);

        $sql = 'UPDATE '.$table.' SET k_value= '.$value.',  k_expire = \'2050-12-31 00:00:00\'
        WHERE k_key='.$key;
        return (bool) $this->_connection->exec($sql);
    }


    public function delete ($key) {
        $table = $this->_connection->prefixTable($this->table);
        $key = $this->_connection->quote($key);
        $sql = 'DELETE FROM  '.$table.' WHERE k_key='.$key;
        
        return (bool)$this->_connection->exec($sql);
    }

    public function flush () {
        $table = $this->_connection->prefixTable($this->table);
        return (bool)$this->_connection->exec('DELETE FROM '.$table);
    }

    public function append ($key, $value) {
		if (is_resource($value))
			return false;

        $table = $this->_connection->prefixTable($this->table);
        $key = $this->_connection->quote($key);

        $sql = 'SELECT k_key, k_value FROM '.$table.' WHERE k_key = '.$key;

        $rs = $this->_connection->query($sql);
        if (!$rs || !($rec = $rs->fetch())) {
            return false;
        }
        $value = unserialize($rs->unescapeBin($rec->k_value)) . $value;
        $sql = 'UPDATE '.$table.' SET k_value= '.$this->_connection->quote2(serialize($value), false, true).' WHERE k_key='.$key;
        if ($this->_connection->exec($sql))
            return $value;
        return false;
    }

    public function prepend ($key, $value) {
		if (is_resource($value))
			return false;

        $table = $this->_connection->prefixTable($this->table);
        $key = $this->_connection->quote($key);

        $sql = 'SELECT k_key, k_value FROM '.$table.' WHERE k_key = '.$key;

        $rs = $this->_connection->query($sql);
        if (!$rs || !($rec = $rs->fetch())) {
            return false;
        }
        $value = $value.unserialize($rs->unescapeBin($rec->k_value));
        $sql = 'UPDATE '.$table.' SET k_value= '.$this->_connection->quote2(serialize($value), false, true).' WHERE k_key='.$key;
        if ($this->_connection->exec($sql))
            return $value;
        return false;
    }

    public function increment ($key, $incr = 1) {

        $table = $this->_connection->prefixTable($this->table);
        $key = $this->_connection->quote($key);

        $sql = 'SELECT k_key, k_value FROM '.$table.' WHERE k_key = '.$key;

        $rs = $this->_connection->query($sql);
        if (!$rs || !($rec = $rs->fetch())) {
            return false;
        }
        $value = unserialize($rec->k_value);
        if (!is_numeric($value))
            return false;
        
        $value = serialize($value + $incr);
        $sql = 'UPDATE '.$table.' SET k_value= '.$this->_connection->quote($value).' WHERE k_key='.$key;
        return (bool)$this->_connection->exec($sql);
    }

    public function decrement ($key, $decr = 1) {

        $table = $this->_connection->prefixTable($this->table);
        $key = $this->_connection->quote($key);

        $sql = 'SELECT k_key, k_value FROM '.$table.' WHERE k_key = '.$key;

        $rs = $this->_connection->query($sql);
        if (!$rs || !($rec = $rs->fetch())) {
            return false;
        }
        $value = unserialize($rec->k_value);
        if (!is_numeric($value))
            return false;

        $value = serialize($value - $decr);
        $sql = 'UPDATE '.$table.' SET k_value= '.$this->_connection->quote($value).' WHERE k_key='.$key;
        return (bool)$this->_connection->exec($sql);
    }

    /**
     * set a key/value with a ttl value
     * @param string $key  the key
     * @param string $value the value
     * @param integer $ttl the time to live in seconds...
     * @return boolean false if failure, if the value is a resource...
     */
    public function setWithTtl($key, $value, $ttl) {
        if (is_resource($value))
			return false;
        if ($ttl > 0) {
            if ($ttl <= 2592000) {
                $ttl += time();
            }
            $ttl = date("Y-m-d H:i:s", $ttl);
        }
        else
            $ttl = '2050-12-31 00:00:00';

        return $this->_set($key, $value, $ttl);
    }

    /**
     * delete all keys which are not any more valid
     * @return boolean false if failure
     */
    public function garbage() {
        $table = $this->_connection->prefixTable($this->table);
        $sql = 'DELETE FROM  '.$table.' WHERE k_expire < '.$this->_connection->quote(date('Y-m-d H:i:s'));
        return (bool)$this->_connection->exec($sql);
    }
    
    public function sync() {
        // nothing to do
    }
}
