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
 * Simulate an Apache with CGI module or fastcgi module + PHP-FPM
 */
class ApacheCGI extends FakeServerConf {

    /**
     * value of cgi.fix_pathinfo in php.ini
     */
    //public $fixPathInfo = true;

    /**
     *
     */
    protected $cgiBin = '/usr/lib/cgi-bin/php5';

    /**
     * Alias to the binary, as defined in Apache with ScriptAlias
     */
    protected $cgiAlias = '/cgi-bin/php5';

    /**
     * @param string $documentRoot  the path of the document root of the site
     * @param string $serverScriptName the PHP script name
     * @param string $cgiBin full system path of the CGI binary that launch PHP cgi
     * @param string $cgiAlias the cgi alias as defined into apache
     */
    function __construct($documentRoot = null,
                         $scriptName = null,
                         $cgiBin = null,
                         $cgiAlias = null) {
        parent::__construct($documentRoot, $scriptName);
        if ($cgiBin)
            $this->cgiBin = $cgiBin;
        if ($cgiAlias)
            $this->cgiAlias = $cgiAlias;
    }

    public function setHttpRequest($url, $method='get', $body='', $bodyContentType='application/x-www-form-urlencoded') {
        parent::setHttpRequest($url, $method, $body, $bodyContentType);
        if (isset($_SERVER['PATH_INFO'])) {
            $_SERVER['PATH_TRANSLATED'] = $_SERVER["DOCUMENT_ROOT"].ltrim($_SERVER['PATH_INFO'], '/');
        }
        $_SERVER['ORIG_PATH_INFO'] = $_SERVER['PHP_SELF'];
        $_SERVER['ORIG_PATH_TRANSLATED'] = $_SERVER['SCRIPT_FILENAME'];
        if (isset($_SERVER['PATH_INFO'])) {
            $_SERVER['ORIG_PATH_TRANSLATED'] .= $_SERVER['PATH_INFO'];
        }
        $_SERVER['ORIG_SCRIPT_FILENAME'] = $this->cgiBin;
        $_SERVER['ORIG_SCRIPT_NAME'] = $this->cgiAlias;
        $_SERVER['REDIRECT_URL'] =  $_SERVER['PHP_SELF'];
    }

}