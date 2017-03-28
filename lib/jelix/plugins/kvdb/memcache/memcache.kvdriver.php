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
 *
 * @see http://fr2.php.net/manual/en/book.memcache.php
 */

class memcacheKVDriver extends jKVDriver implements jIKVttl {

    /**
     * Array of StdClass objects that contains host/port attributes for the
     * memcache servers. Used only during _connection.
     *
     * @var array
     */
    private $_servers = array();

    /**
     * Should the data be compressed ? This feature is implemented sometimes
     * in memcached drivers, and works sometimes...
     *
     * @var boolean
     */
    protected $_compress = false;

    /**
     * Connects to the memcache server
     *
     * The host list is in the host profile value, in the form of :
     *
     * host=server1:port1;server2:port2;server3;port3;...
     * @return Memcache object
     * @throws jException
     */
    protected function _connect() {
        /* A host is needed */
        if (! isset($this->_profile['host'])) {
            throw new jException(
                'jelix~kvstore.error.no.host', $this->_profileName);
        }

        /* There are 3 way to define memcache servers
         *
         * host=memcache_server
         * port=memcache_port
         *
         * ... or...
         *
         * host=memcache_server1:memcache_port1[;memcache_server2:memcache_port2]*
         *
         * ... or...
         *
         * host[]=memcache_server1:memcache_port1
         * host[]=memcache_server2:memcache_port2
         * ...
         */

        if (is_string($this->_profile['host'])) {
            // Case 1 : if there's a port value and no ':' in the host string

            if (isset($this->_profile['port'])
                and
                strpos($this->_profile['host'], ':') === false)
            {
                $server         = new stdClass();
                $server->host   = $this->_profile['host'];
                $server->port   = (int)$this->_profile['port'];

                $this->_servers[] = $server;
            }
            else { // Case 2 : no port => concatened string

                foreach (explode(',', $this->_profile['host']) as $host_port) {
                    $hp = explode(':', $host_port);
    
                    $server         = new stdClass();
                    $server->host   = $hp[0];
                    $server->port   = (int)$hp[1];

                    $this->_servers[] = $server;
                }
            }
        }

        // Case 3 : array of host:port string
        elseif (is_array($this->_profile['host'])) {
            foreach ($this->_profile['host'] as $host_port) {
                $hp = split(':', $host_port);
                $server         = new stdClass();
                $server->host   = $hp[0];
                $server->port   = (int)$hp[1];
                $this->_servers[] = $server;
            }
        }

        /* OK, let's connect now */

        $cnx = new Memcache();

        $oneServerAvalaible = false;

        foreach ($this->_servers as $s) {
            $result = @$cnx->addServer($s->host, $s->port);
            if (! $oneServerAvalaible && $result) {
                $oneServerAvalaible = true;
            }
        }

        if (! $oneServerAvalaible) {
            throw new jException(
                'jelix~kvstore.error.memcache.server.unavailabled', $this->_profileName);
        }

        /* Setting the $_compress flag */
        if (isset($this->_profile['compress'])
                and ($this->_profile['compress'] == 1)) {
            $this->_compress = true;
        }

        return $cnx;
    }

    /**
     * Disconnect from the memcache server
     */
    protected function _disconnect() {
        $this->_connection->close();
    }

    public function get($key) {
        $val = $this->_connection->get($key);
        if ($val === false)
            return null;
        return $val;
    }

    public function set($key, $value) {
        if (is_resource($value))
            return false;
        return $this->_connection->set(
            $key,
            $value,
            (($this->_compress) ? MEMCACHE_COMPRESSED : 0),
            0
        );
    }

    public function insert($key, $value) {
        if (is_resource($value))
            return false;
        return $this->_connection->add(
            $key,
            $value,
            (($this->_compress) ? MEMCACHE_COMPRESSED : 0),
            0
        );
    }

    public function replace($key, $value) {
        if (is_resource($value))
            return false;
        return $this->_connection->replace(
            $key,
            $value,
            (($this->_compress) ? MEMCACHE_COMPRESSED : 0),
            0
        );
    }

    public function delete($key) {
        return $this->_connection->delete($key);
    }

    public function flush() {
        return $this->_connection->flush();
    }

    /**
     * append a string to an existing key value
     * @param string $key   the key of the value to modify
     * @param string $value  the value to append to the current key value
     * @return boolean false if failure
     */
    public function append ($key, $value) {
        $oldData = $this->get($key);
        if ($oldData === null)
            return false;

        if ($this->replace($key, $oldData.$value))
            return $oldData.$value;
        else
            return false;
    }

    /**
     * prepend a string to an existing key value
     * @param string $key   the key of the value to modify
     * @param string $value  the value to prepend to the current key value
     * @return boolean false if failure
     */
    public function prepend ($key, $value) {
        $oldData = $this->get($key);
        if ($oldData === null)
            return false;

        if ($this->replace($key, $value.$oldData))
            return $value.$oldData;
        else
            return false;
    }

    /**
    * increment a specific data value by $var
    * @param string $key       key used for storing data in the cache
    * @param mixed  $var    value used
    * @return integer   the result, or false if failure
    */
    public function increment($key, $incvalue = 1) {
        if (!is_numeric($incvalue)) {
            return false;
        }
        $val = $this->get($key);
        if(!is_numeric($val)) {
            return false;
        }else if (is_float($val)) {
            $val = ((int)$val) + $incvalue;
            if($this->_connection->set($key, $val))
                return $val;
            return false;
        }
        return $this->_connection->increment($key, $incvalue);
    }

    /**
    * decrement a specific data value by $var
    * @param string $key       key used for storing data in the cache
    * @param mixed  $var    value used
    * @return integer   the result, or false if failure
    */
    public function decrement($key, $decvalue = 1) {
        if (!is_numeric($decvalue)) {
            return false;
        }
        $val = $this->get($key);
        if(!is_numeric($val)) {
            return false;
        }else if (is_float($val)) {
            $val = ((int)$val) - $decvalue;
            if($this->_connection->set($key, $val))
                return $val;
            return false;
        }
        return $this->_connection->decrement($key, $decvalue);
    }

    // ----------------------------------- jIKVttl

    /**
    * set a specific data with a ttl 
    * @param string $key       key used for storing data
    * @param mixed  $var       data to store
    * @param int    $ttl    data time expiration
    * @return boolean false if failure
    */
    public function setWithTtl($key, $value, $ttl) {
        if (is_resource($value))
            return false;
        return $this->_connection->set(
            $key,
            $value,
            (($this->_compress) ? MEMCACHE_COMPRESSED : 0),
            $ttl
        );
    }

    public function garbage() {
        // memcache api doesn't provide api to do garbage....
        return true;
    }

}
