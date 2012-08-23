<?php
# -- BEGIN LICENSE BLOCK ----------------------------------
#
# This file is part of Clearbricks.
#
# Copyright (c) 2003-2008 Olivier Meunier and contributors
# Licensed under the GPL version 2.0 license.
# See LICENSE file or
# http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
#
# -- END LICENSE BLOCK ------------------------------------

/**
* HTTP Client
*
* Features:
*
* - Implements a useful subset of the HTTP 1.0 and 1.1 protocols.
* - Includes cookie support.
* - Ability to set the user agent and referal fields.
* - Can automatically handle redirected pages.
* - Can be used for multiple requests, with any cookies sent by the server resent
*   for each additional request.
* - Support for gzip encoded content, which can dramatically reduce the amount of
*   bandwidth used in a transaction.
* - Object oriented, with static methods providing a useful shortcut for simple
*   requests.
* - The ability to only read the page headers - useful for implementing tools such
*   as link checkers.
* - Support for file uploads.
*
* This class is fully based on Simon Willison's HTTP Client in version 0.9 of
* 6th April 2003 - {@link http://scripts.incutio.com/httpclient/}
*
* Changes since fork:
*
* - PHP5 only with Exception support
* - Charset support in POST requests
* - Proxy support through HTTP_PROXY_HOST and HTTP_PROXY_PORT or setProxy()
* - SSL support (if possible)
* - Handles redirects on other hosts
* - Configurable output
*
* @package Clearbricks
* @subpackage Network
*/
class netHttp extends netSocket
{
	/** @var string Server host */				protected $host;
	/** @var integer Server port */				protected $port;
	/** @var string Query path */					protected $path;
	/** @var string HTTP method */				protected $method;
	/** @var string POST query string */			protected $postdata = '';
	/** @var string POST charset */				protected $post_charset;
	/** @var array Cookies sent */				protected $cookies = array();
	/** @var string HTTP referer */				protected $referer;
	/** @var string HTTP accept header */			protected $accept = 'text/xml,application/xml,application/xhtml+xml,text/html,text/plain,image/png,image/jpeg,image/gif,*/*';
	/** @var string HTTP accept encoding */			protected $accept_encoding = 'gzip';
	/** @var string HTTP accept language */			protected $accept_language = 'en-us';
	/** @var string HTTP User Agent */				protected $user_agent = 'Clearbricks HTTP Client';
	/** @var array More headers to be sent */		protected $more_headers = array();
	/** @var integer Connection timeout */			protected $timeout = 10;
	/** @var boolean Use SSL connection */			protected $use_ssl = false;
	/** @var boolean Use gzip transfert */			protected $use_gzip = false;
	/** @var boolean Allow persistant cookies */		protected $persist_cookies = true;
	/** @var boolean Allow persistant referers */	protected $persist_referers = true;
	/** @var boolean Use debug mode */				protected $debug = false;
	/** @var boolean Follow redirects */			protected $handle_redirects = true;
	/** @var integer Maximum redirects to follow */	protected $max_redirects = 5;
	/** @var boolean Retrieve only headers */		protected $headers_only = false;
	/** @var string Authentication user name */		protected $username;
	/** @var string Authentication password */		protected $password;
	/** @var string Proxy server host */			protected $proxy_host;
	/** @var integer Proxy server port */			protected $proxy_port;

	# Response vars
	/** @var integer HTTP Status code */			protected $status;
	/** @var string HTTP Status string */			protected $status_string;
	/** @var array Response headers */				protected $headers = array();
	/** @var string Response body */				protected $content = '';

	# Tracker variables
	/** @var integer Internal redirects count */		protected $redirect_count = 0;
	/** @var string Internal cookie host */			protected $cookie_host = '';

	# Output module (null is this->content)
	/** @var string Output stream name */			protected $output = null;
	/** @var resource Output resource */			protected $output_h = null;
	
	
	/**
	* Constructor.
	*
	* Takes the web server host, an optional port and timeout.
	*
	* @param string	$host			Server host
	* @param integer	$port			Server port
	* @param integer	$timeout			Connection timeout
	*/
	public function __construct($host,$port=80,$timeout=null)
	{
		$this->setHost($host,$port);
		
		if (defined('HTTP_PROXY_HOST') && defined('HTTP_PROXY_PORT')) {
			$this->setProxy(HTTP_PROXY_HOST,HTTP_PROXY_PORT);
		}
		
		if ($timeout) {
			$this->setTimeout($timeout);
		}
		$this->_timeout =& $this->timeout;
	}
	
	/**
	* GET Request
	*
	* Executes a GET request for the specified path. If <var>$data</var> is
	* specified, appends it to a query string as part of the get request.
	* <var>$data</var> can be an array of key value pairs, in which case a
	* matching query string will be constructed. Returns true on success.
	* 
	* @param string	$path			Request path
	* @param array		$data			Request parameters
	* @return boolean
	*/
	public function get($path,$data=false)
	{
		$this->path = $path;
		$this->method = 'GET';
		
		if ($data) {
			$this->path .= '?'.$this->buildQueryString($data);
		}
		
		return $this->doRequest();
	}
	
	/**
	* POST Request
	*
	* Executes a POST request for the specified path. If <var>$data</var> is
	* specified, appends it to a query string as part of the get request.
	* <var>$data</var> can be an array of key value pairs, in which case a
	* matching query string will be constructed. Returns true on success.
	*
	* @param string	$path			Request path
	* @param array		$data			Request parameters
	* @param array		$charset			Request charset
	* @return boolean
	*/
	public function post($path,$data,$charset=null)
	{
		if ($charset) {
			$this->post_charset = $charset;
		}
		$this->path = $path;
		$this->method = 'POST';
		$this->postdata = $this->buildQueryString($data);
		return $this->doRequest();
	}
	
	/**
	* Query String Builder
	*
	* Prepares Query String for HTTP request. <var>$data</var> is an associative
	* array of arguments.
	*
	* @param array		$data			Query data
	* @return string
	*/
	protected function buildQueryString($data)
	{
		if (is_array($data))
		{
			$qs = array();
			# Change data in to postable data
			foreach ($data as $key => $val)
			{
				if (is_array($val)) {
					foreach ($val as $val2) {
						$qs[] = urlencode($key).'='.urlencode($val2);
					}
				} else {
					$qs[] = urlencode($key).'='.urlencode($val);
				}
			}
			$qs = implode('&',$qs);
		} else {
			$qs = $data;
		}
		
		return $qs;
	}
	
	/**
	* Do Request
	*
	* Sends HTTP request and stores status, headers, content object properties.
	*
	* @return boolean
	*/
	protected function doRequest()
	{
		if ($this->proxy_host && $this->proxy_port) {
			if ($this->use_ssl) {
				throw new Exception('SSL support is not available through a proxy');
			}
			$this->_host = $this->proxy_host;
			$this->_port = $this->proxy_port;
			$this->_transport = '';
		} else {
			$this->_host = $this->host;
			$this->_port = $this->port;
			$this->_transport = $this->use_ssl ? 'ssl://' : '';
		}
		
		#Reset all the variables that should not persist between requests
		$this->headers = array();
		$in_headers = true;
		$this->outputOpen();
		
		$request = $this->buildRequest();
		$this->debug('Request',implode("\r",$request));
		
		$this->open();
		$this->debug('Connecting to '.$this->_transport.$this->_host.':'.$this->_port);
		foreach($this->write($request) as $index => $line)
		{
			# Deal with first line of returned data
			if ($index == 0)
			{
				$line = rtrim($line,"\r\n");
				if (!preg_match('/HTTP\/(\\d\\.\\d)\\s*(\\d+)\\s*(.*)/', $line, $m)) {
					throw new Exception('Status code line invalid: '.$line);
				}
				$http_version = $m[1]; # not used
				$this->status = $m[2];
				$this->status_string = $m[3]; # not used
				$this->debug($line);
				continue;
			}
			
			# Read headers
			if ($in_headers)
			{
				$line = rtrim($line,"\r\n");
				if ($line == '')
				{
					$in_headers = false;
					$this->debug('Received Headers',$this->headers);
					if ($this->headers_only) {
						break;
					}
					continue;
				}
				
				if (!preg_match('/([^:]+):\\s*(.*)/', $line, $m)) {
					# Skip to the next header
					continue;
				}
				$key = strtolower(trim($m[1]));
				$val = trim($m[2]);
				# Deal with the possibility of multiple headers of same name
				if (isset($this->headers[$key])) {
					if (is_array($this->headers[$key])) {
						$this->headers[$key][] = $val;
					} else {
						$this->headers[$key] = array($this->headers[$key], $val);
					}
				} else {
					$this->headers[$key] = $val;
				}
				continue;
			}
			
			# We're not in the headers, so append the line to the contents
			$this->outputWrite($line);
		}
		$this->close();
		$this->outputClose();
		
		# If data is compressed, uncompress it
		if ($this->getHeader('content-encoding') && $this->use_gzip) {
			$this->debug('Content is gzip encoded, unzipping it');
			# See http://www.php.net/manual/en/function.gzencode.php
			$this->content = gzinflate(substr($this->content, 10));
		}
		
		# If $persist_cookies, deal with any cookies
		if ($this->persist_cookies && $this->getHeader('set-cookie') && $this->host == $this->cookie_host)
		{
			$cookies = $this->headers['set-cookie'];
			if (!is_array($cookies)) {
				$cookies = array($cookies);
			}
			
			foreach ($cookies as $cookie)
			{
				if (preg_match('/([^=]+)=([^;]+);/', $cookie, $m)) {
					$this->cookies[$m[1]] = $m[2];
				}
			}
			
			# Record domain of cookies for security reasons
			$this->cookie_host = $this->host;
		}
		
		# If $persist_referers, set the referer ready for the next request
		if ($this->persist_referers) {
			$this->debug('Persisting referer: '.$this->getRequestURL());
			$this->referer = $this->getRequestURL();
		}
		
		# Finally, if handle_redirects and a redirect is sent, do that
		if ($this->handle_redirects)
		{
			if (++$this->redirect_count >= $this->max_redirects)
			{
				$this->redirect_count = 0;
				throw new Exception('Number of redirects exceeded maximum ('.$this->max_redirects.')');
			}
			
			$location = isset($this->headers['location']) ? $this->headers['location'] : '';
			$uri = isset($this->headers['uri']) ? $this->headers['uri'] : '';
			if ($location || $uri)
			{
				if (self::readUrl($location.$uri,$r_ssl,$r_host,$r_port,$r_path,$r_user,$r_pass))
				{
					# If we try to move on another host, remove cookies, user and pass
					if ($r_host != $this->host || $r_port != $this->port) {
						$this->cookies = array();
						$this->setAuthorization(null,null);
						$this->setHost($r_host,$r_port);
					}
					$this->useSSL($r_ssl);
					$this->debug('Redirect to: '.$location.$uri);
					return $this->get($r_path);
				}
			}
			$this->redirect_count = 0;
		}
		return true;
	}
	
	/**
	* Prepare Request
	*
	* Prepares HTTP request and returns an array of HTTP headers.
	*
	* @return array
	*/
	protected function buildRequest()
	{
		$headers = array();
		
		if ($this->proxy_host) {
			$path = $this->getRequestURL();
		} else {
			$path = $this->path;
		}
		
		# Using 1.1 leads to all manner of problems, such as "chunked" encoding
		$headers[] = $this->method.' '.$path.' HTTP/1.0';
		
		$headers[] = 'Host: '.$this->host;
		$headers[] = 'User-Agent: '.$this->user_agent;
		$headers[] = 'Accept: '.$this->accept;
		
		if ($this->use_gzip) {
			$headers[] = 'Accept-encoding: '.$this->accept_encoding;
		}
		$headers[] = 'Accept-language: '.$this->accept_language;
		
		if ($this->referer) {
			$headers[] = 'Referer: '.$this->referer;
		}
		
		# Cookies
		if ($this->cookies) {
			$cookie = 'Cookie: ';
			foreach ($this->cookies as $key => $value) {
				$cookie .= $key.'='.$value.';';
			}
			$headers[] = $cookie;
		}
		
		# X-Forwarded-For
		$xforward= array($_SERVER['REMOTE_ADDR']);
		if ($this->proxy_host) {
			$xforward[] = $_SERVER['SERVER_ADDR'];
		}
		$headers[] = 'X-Forwarded-For: '.implode(', ',$xforward);
		
		# Basic authentication
		if ($this->username && $this->password) {
			$headers[] = 'Authorization: Basic '.base64_encode($this->username.':'.$this->password);
		}
		
		$headers = array_merge($headers,$this->more_headers);
		
		# If this is a POST, set the content type and length
		if ($this->postdata) {
			$content_type = 'Content-Type: application/x-www-form-urlencoded';
			if ($this->post_charset) {
				$content_type .= '; charset='.$this->post_charset;
			}
			$headers[] = $content_type;
			$headers[] = 'Content-Length: '.strlen($this->postdata);
			$headers[] = '';
			$headers[] = $this->postdata;
		}
		
		return $headers;
	}
	
	/**
	* Open Output
	*
	* Initializes output handler if {@link $output} property is not null and
	* is a valid resource stream.
	*/
	protected function outputOpen()
	{
		if ($this->output) {
			if (($this->output_h = @fopen($this->output,'wb')) === false) {
				throw new Exception('Unable to open output stream '.$this->output);
			}
		} else {
			$this->content = '';
		}
	}
	
	/**
	* Close Output
	*
	* Closes output module if exists.
	*/
	protected function outputClose()
	{
		if ($this->output && is_resource($this->output_h)) {
			fclose($this->output_h);
		}
	}
	
	/**
	* Write Output
	*
	* Writes data <var>$c</var> to output module.
	*
	* @param string	$c				Data content
	*/
	protected function outputWrite($c)
	{
		if ($this->output && is_resource($this->output_h)) {
			fwrite($this->output_h,$c);
		} else {
			$this->content .= $c;
		}
	}
	
	/**
	* Get Status
	*
	* Returns the status code of the response - 200 means OK, 404 means file not
	* found, etc.
	*
	* @return string
	*/
	public function getStatus()
	{
		return $this->status;
	}
	
	/**
	* Get Contet
	*
	* Returns the content of the HTTP response. This is usually an HTML document.
	*
	* @return string
	*/
	public function getContent()
	{
		return $this->content;
	}
	
	/**
	* Response Headers
	*
	* Returns the HTTP headers returned by the server as an associative array.
	*
	* @return array
	*/
	public function getHeaders()
	{
		return $this->headers;
	}
	
	/**
	* Response Header
	*
	* Returns the specified response header, or false if it does not exist.
	*
	* @param string	$header			Header name
	* @return string
	*/
	public function getHeader($header)
	{
		$header = strtolower($header);
		if (isset($this->headers[$header])) {
			return $this->headers[$header];
		} else {
			return false;
		}
	}
	
	/**
	* Cookies
	*
	* Returns an array of cookies set by the server.
	*
	* @return array
	*/
	public function getCookies()
	{
		return $this->cookies;
	}
	
	/**
	* Request URL
	*
	* Returns the full URL that has been requested.
	*
	* @return string
	*/
	public function getRequestURL()
	{
		$url = 'http'.($this->use_ssl ? 's' : '').'://'.$this->host;
		if (!$this->use_ssl && $this->port != 80 || $this->use_ssl && $this->port != 443) {
			$url .= ':'.$this->port;
		}
		$url .= $this->path;
		return $url;
	}
	
	/**
	* Sets server host and port.
	*
	* @param string	$host			Server host
	* @param integer	$port			Server port
	*/
	public function setHost($host,$port=80)
	{
		$this->host = $host;
		$this->port = abs((integer) $port);
	}
	
	/**
	* Sets proxy host and port.
	*
	* @param string	host				Proxy host
	* @param integer	port				Proxy port
	*/
	public function setProxy($host,$port='8080')
	{
		$this->proxy_host = $host;
		$this->proxy_port = abs((integer) $port);
	}
	
	/**
	* Sets connection timeout.
	*
	* @param integer	$t				Connection timeout
	*/
	public function setTimeout($t)
	{
		$this->timeout = abs((integer) $t);
	}
	
	/**
	* User Agent String
	*
	* Sets the user agent string to be used in the request. Default is
	* "Clearbricks HTTP Client".
	*
	* @param string	$string			User agent string
	*/
	public function setUserAgent($string)
	{
		$this->user_agent = $string;
	}
	
	/**
	* HTTP Authentication
	*
	* Sets the HTTP authorization username and password to be used in requests.
	* Don't forget to unset this in subsequent requests to different servers.
	*
	* @param string	$username			User name
	* @param string	$password			Password
	*/
	public function setAuthorization($username,$password)
	{
		$this->username = $username;
		$this->password = $password;
	}
	
	/**
	* Add Header
	*
	* Sets additionnal header to be sent with the request.
	*
	* @param string	$header			Full header definition
	*/
	public function setMoreHeader($header)
	{
		$this->more_headers[] = $header;
	}
	
	/**
	* Empty additionnal headers
	*/
	public function voidMoreHeaders()
	{
		$this->more_headers = array();
	}
	
	
	/**
	* Set Cookies
	*
	* Sets the cookies to be sent in the request. Takes an array of name value
	* pairs.
	*
	* @param array		$array			Cookies array
	*/
	public function setCookies($array)
	{
		$this->cookies = $array;
	}
	
	/**
	* Enable / Disable SSL
	*
	* Sets SSL connection usage.
	*
	* @param boolean	$boolean			Enable/Disable SSL
	*/
	public function useSSL($boolean)
	{
		if ($boolean) {
			if (!in_array('ssl',stream_get_transports())) {
				throw new Exception('SSL support is not available');
			}
			$this->use_ssl = true;
		} else {
			$this->use_ssl = false;
		}
	}
	
	/**
	* Use Gzip
	*
	* Specifies if the client should request gzip encoded content from the server
	* (saves bandwidth but can increase processor time). Default behaviour is
	* false.
	*
	* @param boolean	$boolean			Enable/Disable Gzip
	*/
	public function useGzip($boolean)
	{
		$this->use_gzip = (boolean) $boolean;
	}
	
	/**
	* Persistant Cookies
	*
	* Specify if the client should persist cookies between requests. Default
	* behaviour is true.
	*
	* @param boolean	$boolean			Enable/Disable Persist Cookies
	*/
	public function setPersistCookies($boolean)
	{
		$this->persist_cookies = (boolean) $boolean;
	}
	
	/**
	* Persistant Referrers
	*
	* Specify if the client should use the URL of the previous request as the
	* referral of a subsequent request. Default behaviour is true.
	*
	* @param boolean	$boolean			Enable/Disable Persistant Referrers
	*/
	public function setPersistReferers($boolean)
	{
		$this->persist_referers = (boolean) $boolean;
	}
	
	/**
	* Enable / Disable Redirects
	*
	* Specify if the client should automatically follow redirected requests.
	* Default behaviour is true.
	*
	* @param boolean	$boolean			Enable/Disable Redirects
	*/
	public function setHandleRedirects($boolean)
	{
		$this->handle_redirects = (boolean) $boolean;
	}
	
	/**
	* Maximum Redirects
	*
	* Set the maximum number of redirects allowed before the client quits
	* (mainly to prevent infinite loops) Default is 5.
	*
	* @param integer	$num				Maximum redirects value
	*/
	public function setMaxRedirects($num)
	{
		$this->max_redirects = abs((integer) $num);
	}
	
	/**
	* Headers Only
	*
	* If true, the client only retrieves the headers from a page. This could be
	* useful for implementing things like link checkers. Defaults to false.
	*
	* @param boolean	$boolean			Enable/Disable Headers Only
	*/
	public function setHeadersOnly($boolean)
	{
		$this->headers_only = (boolean) $boolean;
	}
	
	/**
	* Debug mode
	*
	* Should the client run in debug mode? Default behaviour is false.
	*
	* @param boolean	$boolean			Enable/Disable Debug Mode
	*/
	public function setDebug($boolean)
	{
		$this->debug = (boolean) $boolean;
	}
	
	/**
	* Set Output
	*
	* Output module init. If <var>$out</var> is null, then output will be
	* directed to STDOUT.
	*
	* @param string|null	$out			Output stream
	*/
	public function setOutput($out)
	{
		$this->output = $out;
	}
	
	/**
	* Quick Get
	*
	* Static method designed for running simple GET requests. Returns content or
	* false on failure.
	*
	* @param string	$url				Request URL
	* @param string	$output			Optionnal output stream
	* @return string|false
	*/
	public static function quickGet($url,$output=null)
	{
		if (($client = self::initClient($url,$path)) === false) {
			return false;
		}
		$client->setOutput($output);
		$client->get($path);
		return $client->getStatus() == 200 ? $client->getContent() : false;
	}
	
	/**
	* Quick Post
	*
	* Static method designed for running simple POST requests. Returns content or
	* false on failure.
	*
	* @param string	$url				Request URL
	* @param string	$data			Array of parameters
	* @param string	$output			Optionnal output stream
	* @return string
	*/
	public static function quickPost($url,$data,$output=null)
	{
		if (($client = self::initClient($url,$path)) === false) {
			return false;
		}
		$client->setOutput($output);
		$client->post($path,$data);
		return $client->getStatus() == 200 ? $client->getContent() : false;
	}
	
	/**
	* Quick Init
	*
	* Returns a new instance of the class. <var>$path</var> is an output variable.
	*
	* @param string	$url				Request URL
	* @param string	&$path			Resulting path
	* @return netHttp
	*/
	public static function initClient($url,&$path)
	{
		if (!self::readUrl($url,$ssl,$host,$port,$path,$user,$pass)) {
			return false;
		}
		
		$client = new self($host,$port);
		$client->useSSL($ssl);
		$client->setAuthorization($user,$pass);
		
		return $client;
	}
	
	/**
	* Read URL
	*
	* Parses an URL and fills <var>$ssl</var>, <var>$host</var>, <var>$port</var>,
	* <var>$path</var>, <var>$user</var> and <var>$pass</var> variables. Returns
	* true on succes.
	*
	* @param string	$url				Request URL
	* @param boolean	&$ssl			true if HTTPS URL
	* @param string	&$host			Host name
	* @param string	&$port			Server Port
	* @param string	&$path			Path
	* @param string	&$user			Username
	* @param string	&$pass			Password
	* @return boolean
	*/
	public static function readURL($url,&$ssl,&$host,&$port,&$path,&$user,&$pass)
	{
		$bits = parse_url($url);
		
		if (empty($bits['host'])) {
			return false;
		}
		
		if (empty($bits['scheme']) || !preg_match('%^http[s]?$%',$bits['scheme'])) {
			return false;
		}
		
		$scheme = isset($bits['scheme']) ? $bits['scheme'] : 'http';
		$host = isset($bits['host']) ? $bits['host'] : null;
		$port = isset($bits['port']) ? $bits['port'] : null;
		$path = isset($bits['path']) ? $bits['path'] : '/';
		$user = isset($bits['user']) ? $bits['user'] : null;
		$pass = isset($bits['pass']) ? $bits['pass'] : null;
		
		$ssl = $scheme == 'https';
		
		if (!$port) {
			$port = $ssl ? 443 : 80;
		}
		
		if (isset($bits['query'])) {
			$path .= '?'.$bits['query'];
		}
		
		return true;
	}
	
	/**
	* Debug
	*
	* This method is the method the class calls whenever there is debugging
	* information available. $msg is a debugging message and $object is an
	* optional object to be displayed (usually an array). Default behaviour is to
	* display the message and the object in a red bordered div. If you wish
	* debugging information to be handled in a different way you can do so by
	* creating a new class that extends HttpClient and over-riding the debug()
	* method in that class.
	* 
	* @param string	$msg				Debug message
	* @param mixed		$object			Variable to print_r
	*/
	protected function debug($msg,$object=false)
	{
		if ($this->debug) {
			echo "-----------------------------------------------------------\n";
			echo '-- netHttp Debug: '.$msg."\n";
			if ($object) {
				print_r($object);
				echo "\n";
			}
			echo "-----------------------------------------------------------\n\n";
		}
	}
}


# Compatibility to Incutio HttpClient class
# This will be removed soon!
/** @ignore */
class HttpClient extends netHttp
{
	public function getError()
	{
		return null;
	}
}
?>