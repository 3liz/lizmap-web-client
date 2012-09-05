<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @copyright   2008-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require(LIB_PATH.'clearbricks/net/class.net.socket.php');
require(LIB_PATH.'clearbricks/net.http/class.net.http.php');

/**
 * To send http request
 * @package    jelix
 * @subpackage utils
 * @see netHttp
 */
class jHttp extends netHttp {
    protected $user_agent = 'Clearbricks/Jelix HTTP Client';


	/**
	* DELETE Request
	*
	* Executes a DELETE request for the specified path. If <var>$data</var> is
	* specified, appends it to a query string as part of the get request.
	* <var>$data</var> can be an array of key value pairs, in which case a
	* matching query string will be constructed. Returns true on success.
	* 
	* @param string	$path			Request path
	* @param array		$data			Request parameters
	* @return boolean
	*/
	public function delete($path,$data=false)
	{
		$this->path = $path;
		$this->method = 'DELETE';
		
		if ($data) {
			$this->path .= '?'.$this->buildQueryString($data);
		}
		
		return $this->doRequest();
	}
	
	/**
	* PUT Request
	*
	* Executes a PUT request for the specified path.
	*
	* @param string	$path			Request path
	* @param array		$data			Request parameters
	* @param array		$charset			Request charset
	* @return boolean
	*/
	public function put($path,$data,$charset=null)
	{
		if ($charset) {
			$this->post_charset = $charset;
		}
		$this->path = $path;
		$this->method = 'PUT';
		$this->postdata = $this->buildQueryString($data);
		return $this->doRequest();
	}

    protected function debug($msg,$object=false){
        if ($this->debug) {
            if($object) {
                jLog::dump($object, 'jhttp debug, '.$msg);
            }
            else {
                jLog::log('jhttp debug, '.$msg);
            }
        }
    }
}

