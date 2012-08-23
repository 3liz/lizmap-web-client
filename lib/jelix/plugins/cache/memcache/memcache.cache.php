<?php
/**
* @package    jelix
* @subpackage plugins_cache_memcached
* @author     Tahina Ramaroson
* @contributor Sylvain de Vathaire
* @copyright  2009 Neov, 2010 Neov
* @link     http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
* cache driver for data stored in Memcached. Use the memcache extension of PHP.
* This plugin should be used with version 3.0.1 or more of the memcache extension
* @package jelix
* @subpackage plugins_cache_memcached
*/
class memcacheCacheDriver implements jICacheDriver {

    /**
    * Memcached servers list
    * @var string 
    * @access protected
    */
    protected $_servers = '127.0.0.1:11211';
    /**
    * Memcache API
    * @var object Memcache
    * @access protected
    */
    protected $_memcache;
    /**
    * profil name used in the ini file
    * @var string
    * @access public
    */
    public $profil_name;
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
    * always disabled. This driver don't need automatic cleaning because Memcache have an internal cleaning mechanism
    * @var integer
    * @access public
    */
    public $automatic_cleaning_factor = 0;

    public function __construct($params){

        if (!extension_loaded('memcache')) {
            throw new jException('jelix~cache.error.memcache.extension.missing',array($this->profil_name, ''));
        }
        if (version_compare(phpversion('memcache'), '3.0.1') == -1) { // memcache should be >= 3.0.1
            throw new jException('jelix~cache.error.memcache.extension.badversion.3',array($this->profil_name));
        }

        $this->profil_name = $params['_name'];

        if (isset($params['enabled'])) {
            $this->enabled = ($params['enabled'])?true:false;
        }

        if (isset($params['ttl'])) {
            $this->ttl = $params['ttl'];
        }

        $this->_memcache = new Memcache;

        if(isset($params['servers'])){
            $this->_servers = $params['servers'];
        }

        $servers = explode(',',$this->_servers );
        $fails = 0;
        for ($i = 0; $i<count($servers); $i++) {
            list($server,$port) = explode(':', $servers[$i]);
            if (!$this->_memcache->addServer($server, (int)$port)) {
                $fails++;
            }
        }
        if ($fails==$i) {
            throw new jException('jelix~cache.error.no.memcache.server.available',$this->profil_name);
        }

    }

    /**
    * read a specific data in the cache.
    * @param mixed   $key   key or array of keys used for storing data in the cache
    * @return mixed $data      array of data or false if failure
    */
    public function get ($key) {
        return $this->_memcache->get($key);
    }

    /**
    * set a specific data in the cache
    * @param string $key    key used for storing data
    * @param mixed  $var    data to store
    * @param int    $ttl    data time expiration
    * @return boolean       false if failure
    */
    public function set ($key, $var, $ttl=0){
        return $this->_memcache->set($key, $var, 0, $ttl);
    }

    /**
    * delete a specific data in the cache
    * @param string $key    key used for storing data in the cache
    * @return boolean       false if failure
    */
    public function delete ($key){
        return $this->_memcache->delete($key);
    }

    /**
    * increment a specific data value by $var
    * @param string $key    key used for storing data in the cache
    * @param mixed  $var    value used
    * @return boolean       false if failure
    */
    public function increment ($key,$var=1){
        if (!is_numeric($var)) {
            return false;
        }
        $val = $this->get($key);
        if(!is_numeric($val)) {
            return false;
        }else if (is_float($val)) {
            $val = ((int)$val) + $var;
            if($this->_memcache->set($key, $val))
                return $val;
            else return false;
        }
        return $this->_memcache->increment($key,$var);
    }

    /**
    * decrement a specific data value by $var
    * @param string $key    key used for storing data in the cache
    * @param mixed  $var    value used
    * @return boolean       false if failure
    */
    public function decrement ($key, $var=1) {
        if (!is_numeric($var)) {
            return false;
        }
        $val = $this->get($key);
        if(!is_numeric($val)) {
            return false;
        }else if (is_float($val)) {
            $val = ((int)$val) - $var;
            if($this->_memcache->set($key, $val))
                return $val;
            else return false;
        }
        return $this->_memcache->decrement($key,$var);
    }

    /**
    * replace a specific data value by $var
    * @param string $key    key used for storing data in the cache
    * @param mixed  $var    data to replace
    * @param int    $ttl    data time expiration
    * @return boolean       false if failure
    */
    public function replace ($key,$var,$ttl=0){
        return $this->_memcache->replace($key,$var,0,$ttl);
    }

    /**
    * remove from the cache data of which TTL was expired
    * element with TTL expired already removed => Nothing to do because memcache have an internal garbage mechanism
    * @return boolean
    */
    public function garbage (){
        return true;
    }

    /**
    * clear all data in the cache
    * @return boolean       false if failure
    */
    public function flush (){
        return $this->_memcache->flush();
    }
}
