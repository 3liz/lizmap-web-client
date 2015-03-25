<?php
/**
* @package      jelix
* @subpackage   tests
* @author       Laurent Jouanneau
* @copyright    2012 Laurent Jouanneau
* @link         http://jelix.org
* @licence      MIT
*/

namespace jelix\FakeServerConf;

/**
 * base class for servers
 */
abstract class FakeServerConf {

    /**
     * full path to the document root
     */
    protected $documentRoot = '/var/www/';

    /**
     * part of the path from the document root path to the physical php script
     */
    protected $scriptName = '/index.php';

    /**
     * @param string $documentRoot  the path of the document root of the site
     * @param string $scriptName the PHP script name: path in the url from the domain name to the script itself
     */
    function __construct($documentRoot = null,
                         $scriptName = null) {
        if ($documentRoot)
            $this->documentRoot = $documentRoot;
        if ($scriptName) {
            if ($scriptName[0] != '/') {
                $this->scriptName = '/'.$scriptName;
            }
            else {
                $this->scriptName = $scriptName;
            }
        }
    }

    /**
     * @param string $url
     * @param string $method  the http method (get, post...)
     * @param string|array $body  the content of the request for http method that need it
     *                            it can be an array 
     */
    public function setHttpRequest($url, $method='get', $body='', $bodyContentType='application/x-www-form-urlencoded') {
        $this->setDefaultServer();

        $_SERVER["REQUEST_METHOD"] = strtoupper($method);

        $u = parse_url($url);

        if ($u['scheme'] == 'https')
            $_SERVER['HTTPS'] = 'on';

        if (isset($u['host']))
            $_SERVER["SERVER_NAME"] = $u['host'];

        $_SERVER["HTTP_HOST"] = $_SERVER["SERVER_NAME"];

        if (isset($u['port']))
            $_SERVER["SERVER_PORT"] = $u['port'];

        $_SERVER["REQUEST_URI"] = $path = '';
        if (isset($u['path']))
            $_SERVER["REQUEST_URI"] = $path = $u['path'];

        $_GET = $_POST = array();
        if(isset($u['query'])) {
            $_SERVER["REQUEST_URI"] .= '?'.$u['query'];
            $_SERVER["QUERY_STRING"] = $u['query'];
            parse_str($u['query'], $_GET);
        }
        else {
            $_SERVER["QUERY_STRING"] = '';
        }
        $_REQUEST = $_GET;

        // we got the scriptName in the url
        if (strpos($path, $this->scriptName) === 0) {
            $l = strlen($this->scriptName);
            $_SERVER['SCRIPT_NAME'] = $this->scriptName;
            $pi = substr($path, $l);
            if ($pi)
                $_SERVER['PATH_INFO'] = $pi;
        }
        else {
            // no script name in the url, try to find an other configuration
            $p = substr($this->scriptName, 0, -4); // supposed to have a .php at the end
            if (strpos($path, $p) === 0) {
                // here, only the ".php" is missing in the url => multiview mode
                $l = strlen($this->scriptName)-4;
                $_SERVER['SCRIPT_NAME']  = $this->scriptName;
                $pi = substr($path, $l);
                if ($pi)
                    $_SERVER['PATH_INFO'] = $pi;
            }
            else {
                $_SERVER['SCRIPT_NAME']  = $this->scriptName;
                $p = dirname($this->scriptName);
                if (strpos($path, $p) !== 0) {
                    $_SERVER['PATH_INFO'] = '#error';
                }
            }
        }
        $_SERVER['PHP_SELF'] = $_SERVER['SCRIPT_NAME'];
        if (isset($_SERVER['PATH_INFO']))
            $_SERVER['PHP_SELF'] .= $_SERVER['PATH_INFO'];

        $_SERVER['SCRIPT_FILENAME'] = $_SERVER["DOCUMENT_ROOT"].ltrim($_SERVER['SCRIPT_NAME'], '/');

        $_SERVER['REQUEST_METHOD'] = strtoupper($method);

        if ($body != '') {
            $_SERVER['CONTENT_TYPE'] = $bodyContentType;
            if ($bodyContentType == 'application/x-www-form-urlencoded' && $_SERVER['REQUEST_METHOD'] == 'POST') {
                if (is_array($body)) {
                    $_POST = $body;
                    $_REQUEST = array_merge($_REQUEST, $_POST);
                }
                else {
                    parse_str($body, $_POST);
                }
            }
            else {
                global  $HTTP_RAW_POST_DATA;
                $HTTP_RAW_POST_DATA = $body;
            }
        }
    }

    protected function setDefaultServer() {
        unset($_SERVER['HTTPS']);
        $_SERVER["REQUEST_METHOD"] = 'GET';
        $_SERVER["SERVER_NAME"] = 'localhost';
        $_SERVER["HTTP_HOST"] = $_SERVER["SERVER_NAME"];
        $_SERVER["DOCUMENT_ROOT"] = $this->documentRoot;
        $_SERVER["SERVER_ADDR"] = "127.0.0.1";
        $_SERVER["SERVER_PORT"] = "80";
        $_SERVER["HTTP_USER_AGENT"] ="Mozilla/5.0 (X11; Linux x86_64; rv:16.0) Gecko/20100101 Firefox/16.0";
        $_SERVER["HTTP_ACCEPT"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
        $_SERVER["HTTP_ACCEPT_LANGUAGE"] = "en-us,fr-fr;q=0.8,fr;q=0.5,en;q=0.3";
        $_SERVER["HTTP_ACCEPT_ENCODING"] = "gzip, deflate";
        $_SERVER["SERVER_SIGNATURE"] = "Apache/2.2.22";
        $_SERVER["SERVER_SOFTWARE"] = "Apache/2.2.22";
        $_SERVER["REMOTE_ADDR"] = "127.0.0.1";
        $_SERVER["SERVER_PROTOCOL"] = "HTTP/1.1";
        unset($_SERVER['PATH_TRANSLATED']);
        unset($_SERVER['ORIG_PATH_INFO']);
        unset($_SERVER['ORIG_PATH_TRANSLATED']);
        unset($_SERVER['ORIG_SCRIPT_FILENAME']);
        unset($_SERVER['ORIG_SCRIPT_NAME']);
        unset($_SERVER['PHPRC']);
        unset($_SERVER['REDIRECT_URL']);
        unset($_SERVER['PATH_INFO']);
        unset($_SERVER['CONTENT_TYPE']);
    }
}