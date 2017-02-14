<?php
/**
* @package    jelix
* @subpackage  kvdb
* @author      Zend Technologies
* @contributor Tahina Ramaroson, Sylvain de Vathaire, Laurent Jouanneau
* @copyright  2005-2008 Zend Technologies USA Inc (http://www.zend.com), 2008 Neov, 2010-2011 Laurent Jouanneau
* The implementation of this class is based on Zend Cache Backend File class
* Few lines of code was adapted for Jelix
* @licence  see LICENCE file
*/


/**
* driver for jKVDb which store key values in files
*/
class fileKVDriver extends jKVDriver implements jIKVPersistent, jIKVttl {

    /**
    * directory where to put the files
    * @var string
    * @access protected
    */
    protected $_storage_dir;

    /**
    * enable / disable locking file
    * @var boolean
    * @access protected
    */
    protected $_file_locking = true;

    /**
    * directory level
    * @var integer
    * @access protected
    */
    protected $_directory_level = 2;

    /**
    * umask for directory structure
    * @var string
    * @access protected
    */
    protected $_directory_umask = 0700;

    /**
    * umask for cache files
    * @var string
    * @access protected
    */
    protected $file_umask = 0600;

    /**
    * profil name used in the ini file
    * @var string
    * @access public
    */
    public $profil_name;

    /**
    * automatic cleaning process
    * 0 means disabled, 1 means systematic cache cleaning of expired data (at each set or add call), greater values mean less frequent cleaning
    * @var integer
    * @access public
    */
    public $automatic_cleaning_factor = 0;

    public function _connect() {

        if (isset($this->_profile['storage_dir']) && $this->_profile['storage_dir']!='') {
            $this->_storage_dir = jFile::parseJelixPath( $this->_profile['storage_dir'] );
            $this->_storage_dir = rtrim($this->_storage_dir, '\\/') . DIRECTORY_SEPARATOR;
        }
        else
            $this->_storage_dir = jApp::varPath('kvfiles/');

        jFile::createDir($this->_storage_dir);

        if (isset($this->_profile['file_locking'])) {
            $this->_file_locking = ($this->_profile['file_locking']?true:false);
        }

        if (isset($this->_profile['automatic_cleaning_factor'])) {
            $this->automatic_cleaning_factor = $this->_profile['automatic_cleaning_factor'];
        }

        if (isset($this->_profile['directory_level']) && $this->_profile['directory_level'] > 0) {
            $this->_directory_level = $this->_profile['directory_level'];
            if ($this->_directory_level > 16)
                $this->_directory_level = 16;
        }

        if (isset($this->_profile['directory_umask']) && is_string($this->_profile['directory_umask']) && $this->_profile['directory_umask']!='') {
            $this->_directory_umask = octdec($this->_profile['directory_umask']);
        }

        if (isset($this->_profile['file_umask']) && is_string($this->_profile['file_umask']) && $this->_profile['file_umask']!='') {
            $this->file_umask = octdec($this->_profile['file_umask']);
        }
    }

    protected function _disconnect() {

    }

    /**
    * reads a specific data
    * @param mixed   $key   key or array of keys used for storing data
    * @return mixed $data    data or null if failure
    */
    public function get ($key) {
        $data = null;
        if (is_array($key)) {
            $data = array();
            foreach ($key as $k) {
                if ($this->_isStored($k)) {
                    $data[$k] = $this->_getFileContent($this->_getFilePath($k));
                }
            }
        }
        else {
            if ($this->_isStored($key)) {
                $data = $this->_getFileContent($this->_getFilePath($key));
            }
        }
        return $data;
    }

    /**
    * set a specific data
    * @param string $key       key used for storing data
    * @param mixed  $value       data to store
    * @return boolean false if failure
    */
    public function set ($key, $value) {
        $filePath = $this->_getFilePath($key);
        $this->_createDir(dirname($filePath));
        return $this->_setFileContent ($filePath, $value, time() + 3650*24*3600);
    }

    /**
    * insert new data
    * @param string $key       key used for storing data
    * @param mixed  $value       data to store
    * @return boolean false if failure
    */
    public function insert ($key, $value) {
        if ($this->_isStored($key))
            return false;
        else
            return $this->set($key, $value);
    }

    /**
    * replace a specific data
    * @param string $key       key used for storing data
    * @param mixed  $value       data to store
    * @return boolean false if failure
    */
    public function replace ($key, $value){
        if (!$this->_isStored($key))
            return false;
        else
            return $this->set($key, $value);
    }

    /**
    * delete a specific data
    * @param string $key       key used for storing data in the cache
    * @return boolean false if failure
    */
    public function delete ($key) {
        $filePath = $this->_getFilePath($key);
        if (file_exists($filePath)) {
            if (!(@unlink($filePath))) {
                touch($filePath,strtotime("-1 day"));
                return false;
            }
            return true;
        }
        return false;
    }

    /**
    * clear all data in the cache
    * @return boolean false if failure
    */
    public function flush (){
        $this->_removeDir($this->_storage_dir, true, false);
        return true;
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

        if ($this->setWithTtl($key, $oldData.$value, filemtime($this->_getFilePath($key))))
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

        if ($this->setWithTtl($key, $value.$oldData, filemtime($this->_getFilePath($key))))
            return $value.$oldData;
        else
            return false;
    }

    /**
    * increment a specific data value by $var
    * @param string $key   key used for storing data in the cache
    * @param mixed  $var  value used
    * @return integer     the result, or false if failure
    */
    public function increment ($key, $var=1) {
        $oldData = $this->get($key);
        if ($oldData === null)
            return false;

        if (!is_numeric($oldData) || !is_numeric($var)) {
            return false;
        }
        $data = $oldData + $var;
        if ($data < 0 || $oldData == $data) {
            return false;
        }
        return ( $this->setWithTtl($key, (int)$data, filemtime($this->_getFilePath($key))) ) ? (int)$data : false;
    }

    /**
    * decrement a specific data value by $var
    * @param string $key       key used for storing data in the cache
    * @param mixed  $var    value used
    * @return integer   the result, or false if failure
    */
    public function decrement ($key, $var=1) {
        $oldData = $this->get($key);
        if ($oldData === null)
            return false;

        if (!is_numeric($oldData) || !is_numeric($var)) {
            return false;
        }
        $data = $oldData - (int)$var;
        if ($data < 0 || $oldData == $data) {
            return false;
        }
        return ( $this->setWithTtl($key, (int)$data, filemtime($this->_getFilePath($key))) ) ? (int)$data : false;
    }

    // ----------------------------------- jIKVPersistent

    public function sync() { }

    // ----------------------------------- jIKVttl

    /**
    * set a specific data with a ttl
    * @param string $key       key used for storing data
    * @param mixed  $var       data to store
    * @param int    $ttl      time to live, in seconds
    * @return boolean false if failure
    */
    public function setWithTtl ($key, $var, $ttl) {

        $filePath = $this->_getFilePath($key);
        $this->_createDir(dirname($filePath));

        if ($ttl > 0) {
            if ($ttl <= 2592000) {
                $ttl += time();
            }
        }
        else
            $ttl = time() + 3650*24*3600;

        return $this->_setFileContent ($filePath, $var, $ttl);
    }

    /**
    * remove from the cache data of which TTL was expired
    */
    public function garbage () {
        $this->_removeDir($this->_storage_dir, false, false);
        return true;
    }

    /**
    * Check if exist a non expired stored file for the key $key
    * @param  string    $key         key used for the specific data
    * @return  boolean
    */
    protected function _isStored ($key){
        $filePath = $this->_getFilePath($key);
        if (!file_exists($filePath))
            return false;
        clearstatcache(false, $filePath);
        $mt = filemtime($filePath);
        return ( $mt >= time() || $mt == 0) && is_readable ($filePath);
    }

    /**
    * Reading in a file.
    * @param string $File file name
    * @return mixed return file content or null if failure.
    */
    protected function _getFileContent ($filePath){

        if (!is_file($filePath)) {
            return null;
        }

        $f = @fopen($filePath, 'rb');
        if (!$f) {
            return null;
        }

        if ($this->_file_locking) {
            @flock($f, LOCK_SH);
        }
        $content = stream_get_contents($f);
        if ($this->_file_locking) {
            @flock($f, LOCK_UN);
        }
        @fclose($f);

        try {
            $content = unserialize($content);
        }
        catch(Exception $e) {
            throw new jException('jelix~kvstore.error.unserialize.data',array($this->profil_name,$e->getMessage()));
        }

        return $content;
    }

    /**
    * Writing in a file.
    * @param    string      $filePath         file name
    * @param    string      $DataToWrite  data to write in the file
    * @param    integer     $mtime   modification time
    * @return   boolean     true if success of writing operation
    */
    protected function _setFileContent ($filePath, $dataToWrite, $mtime) {
        if (is_resource($dataToWrite))
            return false;

        try {
            $dataToWrite = serialize($dataToWrite);
        }
        catch(Exception $e) {
            throw new jException('jelix~kvstore.error.serialize.data', array($this->profil_name, $e->getMessage()));
        }

        $f = @fopen($filePath, 'wb+');
        if (!$f) {
            return false;
        }
        if ($this->_file_locking) {
            @flock($f, LOCK_EX);
        }
        @fwrite($f, $dataToWrite);
        if ($this->_file_locking) {
            @flock($f, LOCK_UN);
        }
        @fclose($f);
        @chmod($filePath, $this->file_umask);
        touch($filePath, $mtime);
        return true;
    }

    /**
    * create a directory
    * It creates also all necessary parent directory
    * @param string $dir the path of the directory
    */
    protected function _createDir($dir) {

        if (!file_exists($dir)) {
            $this->_createDir(dirname($dir));
            @mkdir($dir, $this->_directory_umask);
            @chmod($dir, $this->_directory_umask); //this line is required in some configurations
        }
    }

    protected $keyPath = array();

    /**
    * make and return a file name (with path)
    *
    * @param  string $key the key
    * @return string File name (with path)
    */
    protected function _getFilePath($key) {
        if (isset($this->keyPath[$key]))
            return $this->keyPath[$key];

        $hash = md5($key);
        $path = $this->_storage_dir;

        if ($this->_directory_level > 0) {
            for ($i = 0; $i < $this->_directory_level; $i++) {
                $path .= substr($hash, $i*2, 2 ). DIRECTORY_SEPARATOR;
            }
        }

        if (preg_match("/^([a-zA-Z0-9\._\-]+)/", $key, $m))
            $fileName = $path.$hash."_".$m[1];
        else
            $fileName = $path.$hash;
        $this->keyPath[$key] = $fileName;
        return $fileName;
    }


    /**
     * recursive function deleting a directory for the class
     * @param string $dir the path of the directory to remove recursively
     * @param boolean $all directory deleting mode. If true delete all else delete files expired
     */
    protected function _removeDir($dir, $all = true, $deleteParent = true) {

        if (file_exists($dir) && $handle = opendir($dir)) {
            while (false !== ($file = readdir($handle))) {
                if ($file != '.' && $file != '..') {
                    $f = $dir.'/'.$file;
                    if (is_file ($f)) {
                        if ($all) {
                            @unlink ($f);
                        } else {
                            clearstatcache(false, $f);
                            if (time() > filemtime($f) && filemtime($f) != 0) {
                                @unlink ($f);
                            }
                        }
                    }
                    if (is_dir ($f)) {
                        self::_removeDir($f, $all);
                    }
                }
            }
            closedir($handle);
            if ($deleteParent)
                @rmdir($dir);
        }
    }
}
