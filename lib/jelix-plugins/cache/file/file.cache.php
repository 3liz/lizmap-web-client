<?php
/**
* @package    jelix
* @subpackage plugins_cache_file
* @author      Zend Technologies
* @contributor Tahina Ramaroson, Sylvain de Vathaire, Bricet, Laurent Jouanneau
* @copyright  2005-2008 Zend Technologies USA Inc (http://www.zend.com), 2008 Neov, 2011-2017 Laurent Jouanneau
* The implementation of this class is based on Zend Cache Backend File class
* Few lines of code was adapted for Jelix
* @licence  see LICENCE file
*/


/**
* cache driver for data stored in a file
* @package jelix
* @subpackage plugins_cache_file
*/
class fileCacheDriver implements jICacheDriver {

    /**
    * extension to use for cache files.
    * @var string
    */
    const CACHEEXT = '.cache';
    /**
    * directory where to put the cache files
    * @var string
    * @access protected
    */
    protected $_cache_dir;
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
    protected $_directory_level = 0;
    /**
    * umask for directory structure
    * @var string
    * @access protected
    */
    protected $_directory_umask = 0700;
    /**
    * prefix for cache files
    * @var string
    * @access protected
    */
    protected $_file_name_prefix = 'jelix_cache';
    /**
    * umask for cache files
    * @var string
    * @access protected
    */
    protected $_cache_file_umask = 0600;
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

    public function __construct($params){

        $this->profil_name = $params['_name'];

        if(isset($params['enabled'])){
            $this->enabled = ($params['enabled'])?true:false;
        }

        if(isset($params['ttl'])){
            $this->ttl = $params['ttl'];
        }

        $this->_cache_dir = jApp::tempPath('cache/').$this->profil_name.'/';
        if(isset($params['cache_dir']) && $params['cache_dir']!=''){
            $cache_dir = jFile::parseJelixPath( $params['cache_dir'] );
            if (is_dir($cache_dir) && is_writable($cache_dir)) {
                $this->_cache_dir = rtrim(realpath($cache_dir), '\\/') . DIRECTORY_SEPARATOR;
            } else {
                throw new jException('jelix~cache.directory.not.writable',$this->profil_name);
            }
        }
        else {
            jFile::createDir($this->_cache_dir);
        }

        if (isset($params['file_locking'])) {
            $this->_file_locking = ($params['file_locking'])?true:false;
        }

        if (isset($params['automatic_cleaning_factor'])) {
            $this->automatic_cleaning_factor = $params['automatic_cleaning_factor'];
        }

        if (isset($params['directory_level']) && $params['directory_level'] > 0) {
            $this->_directory_level = $params['directory_level'];
        }

        if (isset($params['directory_umask']) && is_string($params['directory_umask']) && $params['directory_umask']!='') {
            $this->_directory_umask = octdec($params['directory_umask']);
        }
        else {
            $this->_directory_umask = jApp::config()->chmodDir;
        }

        if (isset($params['file_name_prefix'])) {
            $this->_file_name_prefix = $params['file_name_prefix'];
        }

        if (isset($params['cache_file_umask']) && is_string($params['cache_file_umask']) && $params['cache_file_umask']!='') {
            $this->_cache_file_umask = octdec($params['cache_file_umask']);
        }
        else {
            $this->_cache_file_umask = jApp::config()->chmodFile;
        }
    }

    /**
    * read a specific data in the cache.
    * @param mixed   $key   key or array of keys used for storing data in the cache
    * @return mixed $data      data or false if failure
    */
    public function get ($key) {

        $data=false;
        if(is_array($key)){
            $data=array();
            foreach($key as $value){
                if ($this->_isCached($value)){
                    $data[$value] = $this->_getFileContent($this->_getCacheFilePath($value));
                }
            }
        }else{
            if ($this->_isCached($key)) {
                $data = $this->_getFileContent($this->_getCacheFilePath($key));
            }
        }

        return $data;
    }

    /**
    * set a specific data in the cache
    * @param string $key       key used for storing data
    * @param mixed  $var       data to store
    * @param int    $ttl    data time expiration
    * @return boolean false if failure
    */
    public function set ($key,$var,$ttl=0){

        $filePath = $this->_getCacheFilePath($key);
        $this->_createDir(dirname($filePath));
        if ($this->_setFileContent ($filePath,$var)) {

            switch($ttl) {
                case 0:
                    touch($filePath, time() + 3650*24*3600);
                    break;
                default:
                    if ($ttl <= 2592000) {
                        $ttl += time();
                    }
                    touch($filePath,$ttl);
                    break;
            }
            return true;
        }
        return false;
    }

    /**
    * delete a specific data in the cache
    * @param string $key       key used for storing data in the cache
    * @return boolean false if failure
    */
    public function delete ($key){

        $filePath = $this->_getCacheFilePath($key);
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
    * increment a specific data value by $var
    * @param string $key       key used for storing data in the cache
    * @param mixed  $var    value used
    * @return boolean false if failure
    */
    public function increment ($key, $var=1) {

        if(($oldData=$this->get($key))){
            if (!is_numeric($oldData) || !is_numeric($var)) {
                return false;
            }
            $data= $oldData + $var;
            if($data<0 || $oldData==$data){
                return false;
            }
            return ( $this->set($key,(int)$data,filemtime($this->_getCacheFilePath($key))) ) ? (int)$data : false;
        }
        return false;
    }

    /**
    * decrement a specific data value by $var
    * @param string $key       key used for storing data in the cache
    * @param mixed  $var    value used
    * @return boolean false if failure
    */
    public function decrement ($key,$var=1){

        if ($oldData = $this->get($key)) {

            if (!is_numeric($oldData) || !is_numeric($var)) {
                return false;
            }
            $data = $oldData - (int)$var;
            if ($data < 0 || $oldData == $data) {
                return false;
            }
            return ( $this->set($key,(int)$data,filemtime($this->_getCacheFilePath($key))) ) ? (int)$data : false;
        }
        return false;
    }

    /**
    * replace a specific data value by $var
    * @param string $key       key used for storing data in the cache
    * @param mixed  $var    data to replace
    * @param int    $ttl    data time expiration
    * @return boolean false if failure
    */
    public function replace ($key,$var,$ttl=0){

        if(!$this->_isCached($key)){
            return false;
        }
        return $this->set($key,$var,$ttl);
    }

    /**
    * remove from the cache data of which TTL was expired
    * @return boolean false if failure
    */
    public function garbage (){
        $this->_removeDir($this->_cache_dir,false, false);
        return true;
    }

    /**
    * clear all data in the cache
    * @return boolean false if failure
    */
    public function flush (){
        $this->_removeDir($this->_cache_dir,true, false);
        return true;
    }

    /**
    * Check if exist a non expired cache file for the key $key
    * @param  string    $key         key used for the specific data
    * @return  boolean
    */
    protected function _isCached ($key){
        $filePath = $this->_getCacheFilePath($key);
        if(!file_exists($filePath))
            return false;
        clearstatcache(false, $filePath);
        return (filemtime($filePath) > time() || filemtime($filePath) == 0) && is_readable ($filePath);
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

        if ($this->_file_locking){
            @flock($f, LOCK_SH);
        }
        $content = stream_get_contents($f);
        if ($this->_file_locking){
            @flock($f, LOCK_UN);
        }
        @fclose($f);

        try{
            $content=unserialize($content);
        }catch(Exception $e){
            throw new jException('jelix~cache.error.unserialize.data',array($this->profil_name,$e->getMessage()));
        }

        return $content;
    }

    /**
    * Writing in a file.
    * @param    string      $filePath         file name
    * @param    string      $DataToWrite  data to write in the file
    * @return   boolean     true if success of writing operation
    */
    protected function _setFileContent ($filePath, $dataToWrite){

        try{
            $dataToWrite=serialize($dataToWrite);
        }catch(Exception $e){
            throw new jException('jelix~cache.error.serialize.data',array($this->profil_name,$e->getMessage()));
        }

        $f = @fopen($filePath, 'wb+');
        if (!$f) {
            return false;
        }
        if ($this->_file_locking){
            @flock($f, LOCK_EX);
        }
        @fwrite($f, $dataToWrite);
        if ($this->_file_locking){
            @flock($f, LOCK_UN);
        }
        @fclose($f);
        @chmod($filePath, $this->_cache_file_umask);

        return true;

    }

    /**
    * create a directory
    * It creates also all necessary parent directory
    * @param string $dir the path of the directory
    */
    protected function _createDir($dir){

        if(!file_exists($dir)){
            $this->_createDir(dirname($dir));
            @mkdir($dir, $this->_directory_umask);
            @chmod($dir, $this->_directory_umask); //this line is required in some configurations
        }

    }

    /**
    * make and return a file name (with path)
    *
    * @param  string $key Cache key
    * @return string File name (with path)
    */
    protected function _getCacheFilePath($key){

        $path = $this->_getPath($key);
        if (DIRECTORY_SEPARATOR === '\\') {
            // Windows doesn't like colon in file names
            $key = str_replace(':', '_.._', $key);
        }
        return $path . $key.self::CACHEEXT;

    }

    /**
    * return the complete directory path
    *
    * @param  string $key Cache key
    * @return string directory path
    */
    protected function _getPath($key){

        $path = $this->_cache_dir.$this->_file_name_prefix. DIRECTORY_SEPARATOR;
        if ($this->_directory_level>0) {
            $hash = md5($key);
            for ($i=0;$i<$this->_directory_level;$i++) {
                $path .= substr($hash, 0, $i + 1). DIRECTORY_SEPARATOR;
            }
        }
        if ($key[0] == '/' || $key[0] == DIRECTORY_SEPARATOR) {
            $path .= $this->_file_name_prefix. DIRECTORY_SEPARATOR;
        }
        return $path;
    }

    /**
     * recursive function deleting a directory for the class
     * @param string $dir the path of the directory to remove recursively
     * @param boolean $all directory deleting mode. If true delete all else delete files expired
     */
    protected function _removeDir($dir,$all = true, $deleteParent = true){

        if (file_exists($dir) && $handle = opendir($dir)) {
            while (false !== ($file = readdir($handle))) {
                if ($file != '.' && $file != '..'){
                    $f = $dir.'/'.$file;
                    if (is_file ($f)){
                        if($all){
                            @unlink ($f);
                        }else{
                            clearstatcache(false, $f);
                            if(time() > filemtime($f) && filemtime($f) != 0){
                                @unlink ($dir.'/'.$file);
                            }
                        }
                    }
                    if (is_dir ($f)){
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
