<?php
/**
* @package    jelix
* @subpackage plugins_cache_db
* @author     Tahina Ramaroson
* @contributor Sylvain de Vathaire, Laurent Jouanneau
* @copyright  2009 Neov, 2009-2017 Laurent Jouanneau
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
* cache driver for data stored in a database
*   Warning : 
*   Beware about the time returned by the DBMS of the server and the server PHP client : possible asynchronous time (particulary
*   in case of use of multiple servers, incoherent data can be involved).
* @package jelix
* @subpackage plugins_cache_db
*/
class dbCacheDriver implements jICacheDriver {

    /**
    * name of the table mapping.
    * @var string
    * @access protected
    */
    protected $_dao = 'jelix~jcache';
    /**
    * connexion dbprofile 
    * @var string
    * @access protected
    */
    protected $_dbprofile = '';
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
    * 0 means disabled, 1 means systematic cache cleaning of expired data (at each set or add call), greater values mean less frequent cleaning
    * @var integer
    * @access public
    */
    public $automatic_cleaning_factor = 0;

    /**
     * for some sqlite version, it seems it doesn't support
     * very well result of php serialization. This flags indicates
     * to encode values before storing them
     */
    protected $base64encoding = false;

    public function __construct($params) {

        $this->profil_name = $params['_name'];

        if(isset($params['enabled'])){
            $this->enabled = ($params['enabled']?true:false);
        }

        if(isset($params['ttl'])){
            $this->ttl = $params['ttl'];
        }

        if(isset($params['dao'])){
            $this->_dao = $params['dao'];
        }

        if(isset($params['dbprofile'])){
            $this->_dbprofile = $params['dbprofile'];
        }

        if (isset($params['automatic_cleaning_factor'])) {
            $this->automatic_cleaning_factor = $params['automatic_cleaning_factor'];
        }

        if(isset($params['base64encoding']) && $params['base64encoding']){
            $this->base64encoding = true;
        }
    }

    /**
     * read a specific data in the cache.
     * @param mixed $key key or array of keys used for storing data in the cache
     * @return mixed $data      data or false if failure
     * @throws jException
     */
    public function get ($key) {

        $dao = jDao::get($this->_dao, $this->_dbprofile);
        if (is_array($key)) {
            if (($rs = $dao->getDataList($key)) === FALSE) {
                return false;
            }
            
            $data = array();
            foreach($rs as $cache){
                if(is_null($cache->date) || (strtotime($cache->date) > time())){
                    try {
                        $val = $this->base64encoding?base64_decode($cache->data):$cache->data;
                        $data[$cache->key] = unserialize($val);
                    } catch(Exception $e) {
                        throw new jException('jelix~cache.error.unserialize.data',array($this->profil_name, $e->getMessage()));
                    }
                }
            }
            return $data;
        }
        else {
            $rec = $dao->getData($key);
            if ($rec){
                try {
                    $val = $this->base64encoding?base64_decode($rec->data):$rec->data;
                    $data = unserialize($val);
                } catch(Exception $e) {
                    throw new jException('jelix~cache.error.unserialize.data',array($this->profil_name, $e->getMessage()));
                }
                return $data;
            }else{
                return false;
            }
        }
    }

    /**
     * set a specific data in the cache
     * @param string $key key used for storing data
     * @param mixed $var data to store
     * @param int $ttl data time expiration. -1 means no change
     * @return bool false if failure
     * @throws jException
     */
    public function set ($key, $var, $ttl=0){

        try{
            $var = serialize($var);
            if ($this->base64encoding) {
                $var = base64_encode($var);
            }
        }
        catch(Exception $e) {
            throw new jException('jelix~cache.error.serialize.data',array($this->profil_name,$e->getMessage()));
        }

        $dao = jDao::get($this->_dao, $this->_dbprofile);
        switch($ttl){
            case -1:
                $date=-1;
                $n = $dao->updateData($key, $var);
                break;
            case 0:
                $date=null;
                $n = $dao->updateFullData($key, $var, $date);
                break;
            default:
                if($ttl <= 2592000){
                    $ttl += time();
                }
                $date = date("Y-m-d H:i:s", $ttl);
                $n = $dao->updateFullData($key, $var, $date);
                break;
        }
        if ($n==0) {
            $cache = jDao::createRecord($this->_dao, $this->_dbprofile);
            $cache->key = $key;
            $cache->data = $var;
            $cache->date = $date;
            return !($dao->insert($cache)?false:true);
        }

        return true;
    }

    /**
    * delete a specific data in the cache
    * @param string $key    key used for storing data in the cache
    * @return boolean false if failure
    */
    public function delete ($key){
        return (bool)(jDao::get($this->_dao,$this->_dbprofile)->delete($key));
    }

    /**
    * increment a specific data value by $var
    * @param string $key    key used for storing data in the cache
    * @param mixed  $var    value used
    * @return boolean false if failure
    */
    public function increment ($key, $var=1) {

        if ($oldData = $this->get($key)) {

            if (!is_numeric($oldData) || !is_numeric($var)) {
                return false;
            }
            $data = $oldData + $var;
            if ($data < 0 || $oldData == $data) {
                return false;
            }

            return ( $this->set($key,(int)$data,-1) ? (int)$data : false);
        }
        return false;
    }

    /**
    * decrement a specific data value by $var
    * @param string $key    key used for storing data in the cache
    * @param mixed  $var    value used
    * @return boolean false if failure
    */
    public function decrement ($key,$var=1) {

        if (($oldData=$this->get($key))) {

            if (!is_numeric($oldData) || !is_numeric($var)) {
                return false;
            }
            $data= $oldData - (int)$var;
            if ($data < 0 || $oldData == $data) {
                return false;
            }

            return ( $this->set($key,(int)$data,-1) ? (int)$data : false);
        }

        return false;
    }

    /**
    * replace a specific data value by $var
    * @param string $key    key used for storing data in the cache
    * @param mixed  $var    data to replace
    * @param int    $ttl    data time expiration
    * @return boolean false if failure
    */
    public function replace ($key,$var,$ttl=0){

        $dao = jDao::get($this->_dao,$this->_dbprofile);
        if (!$dao->get($key)) {
            return false;
        }

        return $this->set($key,$var,$ttl);
    }

    /**
    * remove from the cache data of which TTL was expired
    * @return boolean false if failure
    */
    public function garbage (){
        jDao::get($this->_dao,$this->_dbprofile)->garbage();
        return true;
    }

    /**
    * clear all data in the cache
    * @return boolean false if failure
    */
    public function flush (){
        jDao::get($this->_dao,$this->_dbprofile)->flush();
        return true;
    }

}
