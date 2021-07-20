<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2012-2020 Laurent Jouanneau
* @link       http://jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
* Static class providing some utilities to retrieve informations about the server
* @package    jelix
* @subpackage core
* @since Jelix 1.3.2
*/
class jServer {
    
    /**
     * tells if we are in a CLI (Command Line Interface) context or not.
     * If this is the case, fills some missing $_SERVER variables when cgi is used
     * @return boolean true if we are in a CLI context
     */
    static function isCLI() {
        if (PHP_SAPI != 'cli' && strpos(PHP_SAPI, 'cgi') === false) {
            return false;
        }

        if (PHP_SAPI != 'cli') {
            // only php-cgi used from the command line can be used, not the one called by apache
            if (isset($_SERVER['HTTP_HOST']) || isset($_SERVER['REDIRECT_URL'])  || isset($_SERVER['SERVER_PORT'])) {
                return false;
            }
            header('Content-type: text/plain');
            if (!isset($_SERVER['argv'])) {
                $_SERVER['argv'] = array_keys($_GET);
                $_SERVER['argc'] = count($_GET);
            }
            if (!isset($_SERVER['SCRIPT_NAME'])) {
                $_SERVER['SCRIPT_NAME'] = $_SERVER['argv'][0];
            }
            if (!isset($_SERVER['DOCUMENT_ROOT'])) {
                $_SERVER['DOCUMENT_ROOT'] = '';
            }
        }
        return true;
    }

    /**
     * return the application domain name
     * @return string
     * @since 1.6.30
     */
    static function getDomainName()
    {
        // domainName should not be empty, as it is filled by jConfigCompiler
        // but let's check it anyway, jConfigCompiler cache may not be valid anymore
        if (jApp::config()->domainName != '') {
            return jApp::config()->domainName;
        }
        list($domain, $port) = self::getDomainPortFromServer();
        return $domain;
    }

    /**
     * return the server URI of the application (protocol + server name + port)
     * @return string the serveur uri
     * @since 1.6.30
     */
    static function getServerURI($forceHttps = null) {

        if ( ($forceHttps === null && self::isHttps()) || $forceHttps) {
            $uri = 'https://';
        }
        else {
            $uri = 'http://';
        }

        $uri .= self::getDomainName();
        $uri .= self::getPort($forceHttps);
        return $uri;
    }

    /**
     * return the server port of the application
     * @return string the ":port" or empty string
     * @since 1.6.30
     */
    static function getPort($forceHttps = null) {
        $isHttps = self::isHttps();

        if ($forceHttps === null)
            $https = $isHttps;
        else
            $https = $forceHttps;

        $forcePort = ($https ? jApp::config()->forceHTTPSPort : jApp::config()->forceHTTPPort);
        if ($forcePort === true || $forcePort === '1') {
            return '';
        }
        else if ($forcePort) { // a number
            $port = $forcePort;
        }
        else if($isHttps != $https) {
            // the asked protocol is different from the current protocol
            // we use the standard port for the asked protocol
            return '';
        } else {
            list($domain, $port) = self::getDomainPortFromServer();
        }

        if (($port === NULL) || ($port == '') || ($https && $port == '443' ) || (!$https && $port == '80' ))
            return '';
        return ':'.$port;
    }

    /**
     * Indicate if the request is done or should be done with HTTPS,
     *
     * It takes care about the Jelix configuration, else from the server
     * parameters.
     *
     * @return bool true if the request is done or should be done with HTTPS
     * @todo support Forwarded and X-Forwarded-Proto headers
     * @since 1.6.30
     */
    static function isHttps() {
        if (jApp::config()->urlengine['forceProxyProtocol'] == 'https') {
            if (trim(jApp::config()->forceHTTPSPort) === '') {
                jApp::config()->forceHTTPSPort = true;
            }
            return true;
        }

        return self::isHttpsFromServer();
    }

    /**
     * return the protocol
     * @return string  http:// or https://
     * @since 1.6.30
     */
    static function getProtocol()
    {
        return (self::isHttps() ? 'https://':'http://');
    }


    static protected $domainPortCache = null;

    /**
     * Return the domain and the port from the server parameters
     *
     * @param boolean $cache
     * @return array the domain and the port number
     * @since 1.6.34
     */
    static function getDomainPortFromServer($cache=true)
    {
        if ($cache && self::$domainPortCache !== null) {
            return self::$domainPortCache;
        }

        $domain = $port = '';
        if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST']) {
            list($domain, $port) = explode(':', $_SERVER['HTTP_HOST'].':');
        }
        elseif (isset($_SERVER['SERVER_NAME']) && $_SERVER['SERVER_NAME']) {
            list($domain, $port) = explode(':', $_SERVER['SERVER_NAME'].':');
        }
        elseif (function_exists('gethostname') && gethostname() !== false) {
            $domain = gethostname();
        }
        elseif (php_uname('n') !== false) {
            $domain = php_uname('n');
        }

        if ($port == '') {
            if (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT']) {
                $port = $_SERVER['SERVER_PORT'];
            }
            else if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] && $_SERVER['HTTPS'] != 'off') {
                $port = '443';
            }
            else {
                $port = '80';
            }
        }
        self::$domainPortCache = array($domain, $port);
        return self::$domainPortCache;
    }

    /**
     * Indicate if the request is done with HTTPS, as indicated by the server parameters
     * @since 1.6.34
     */
    static function isHttpsFromServer()
    {
        return (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] && $_SERVER['HTTPS'] != 'off');
    }
}
