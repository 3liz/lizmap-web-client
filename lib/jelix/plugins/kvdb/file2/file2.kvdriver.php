<?php
/**
 * @package     jelix
 * @subpackage  kvdb
 * @author      Yannick Le Guédart
 * @contributor Laurent Jouanneau
 * @copyright   2009 Yannick Le Guédart, 2010 Laurent Jouanneau
 *
 * @link     http://jelix.org
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

/**
 * @deprecated
 */
class file2KVDriver extends jKVDriver {

	protected $dir;

    /**
	 * "Connects" to the fileServer
	 *
	 * @return fileServer object
	 * @access protected
	 */
   	protected function _connect() {
        $cnx = new fileServer(jApp::tempPath('filekv'));

        return $cnx;
	}

   	protected function _disconnect() {}

    public function get($key) {
        return $this->_connection->get($key);
    }

    public function set($key, $value, $ttl) {
        return $this->_connection->set(
            $key,
            $value,
            $ttl
        );
    }

    public function delete($key) {
        return $this->_connection->delete($key);
    }

    public function flush() {
        return $this->_connection->flush();
    }
}

class fileServer {
	
	protected $dir;
	
    public function __construct ($directory) {
		
		$this->dir = $directory;
        // Create temp kvFile directory if necessary

        if (! file_exists()) {
            jFile::createDir($this->dir);
        }
    }

	/**
	* set
	*
	* @param string $key	a key (unique name) to identify the cached info
	* @param mixed  $value	the value to cache
	* @param integer $ttl how many seconds will the info be cached
	*
	* @return boolean whether the action was successful or not
	*/
	public function set($key, $value, $ttl) {
		$r = false;

		if ($fl = @fopen($this->dir . '/.flock', 'w+')) {
			if (flock($fl, LOCK_EX)) {
				// mutex zone

				$md5 	= md5($key);
				$subdir = $md5[0].$md5[1];

                if (! file_exists($this->dir . '/' . $subdir)) {
                    jFile::createDir($this->dir . '/' . $subdir);
                }

				// write data to cache
                $fn = $this->dir . '/' . $subdir . '/' . $md5;
				if ($f = @gzopen($fn . '.tmp', 'w')) {
					// write temporary file
					fputs($f, base64_encode(serialize($value)));
					fclose($f);

					// change time of the file to the expiry time
					@touch("$fn.tmp", time() + $ttl);

					// rename the temporary file
					$r = @rename("$fn.tmp", $fn);

                    chmod($fn, jApp::config()->chmodFile);
				}

				// end of mutex zone
				flock($fl, LOCK_UN);
			}
		}

		return $r;
	}

	/**
	* get
	*
	* @param string $key	the key (unique name) that identify the cached info
	*
	* @return mixed,false  false if the cached info does not exist or has expired
	*               or the data if the info exists and is valid
	*/
	public function get($key) {
		$r = false;

		// the name of the file
		$md5    = md5($key);
		$subdir = $md5[0].$md5[1];

		$fn = $this->dir . '/' . $subdir . '/' . $md5;

		// file does not exists
		if (! file_exists($fn)) {
            return false;
        }

		//  data has expired => delete file and return false
        if (@filemtime($fn) < time()) {
            @unlink($fn);
            return false;
        }

		// date is valid
		if ($f = @gzopen($fn, 'rb')) {
			$r = '';

			while ($read = fread($f, 1024)) {
				$r .= $read;
			}

			fclose($f);
		}

		// return cached info
		return @unserialize(base64_decode($r));
	}

	/**
	* delete
	*
	* @param string $key	a key (unique name) to identify the cached info
	*
	* @return boolean whether the action was successful or not
	*/
	public function delete($key) {
 		// the name of the file
		$md5    = md5($key);
		$subdir = $md5[0].$md5[1];

		$fn = $this->dir . '/' . $subdir . '/' . $md5;

        return @unlink($fn);
    }

	/**
	* flush
	*
	* @return boolean whether the action was successful or not
	*/
	public function flush() {
        return @unlink($this->dir);
    }
}
