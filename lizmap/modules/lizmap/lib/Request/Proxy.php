<?php

/**
 * Proxy for map services.
 *
 * @author    3liz
 * @copyright 2012-2016 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use Kevinrob\GuzzleCache\CacheMiddleware;
use Kevinrob\GuzzleCache\Strategy;
use Lizmap\App;
use Lizmap\App\AppContextInterface;
use Lizmap\Project\Project;
use Lizmap\Project\Repository;
use Psr\Http\Message\ResponseInterface;

class Proxy
{
    /**
     * loaded profiles.
     *
     * @var array
     */
    protected static $_profiles = array();

    protected static $services;

    protected static $appContext;

    protected static $httpMessageCode = array(
        200 => 'OK',
        206 => 'Partial Content',
        304 => 'Not modified',
        400 => 'Bad Request',
        401 => 'Unauthorized',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        500 => 'Internal Server Error',
        501 => 'Not Implemented',
    );

    /**
     * Sets the services property that contains lizmap Services.
     *
     * @param \lizmapServices $services
     */
    public static function setServices($services)
    {
        self::$services = $services;
    }

    /**
     * Sets the appContext property that contains the context of the application (Jelix or Test).
     */
    public static function setAppContext(AppContextInterface $appContext)
    {
        self::$appContext = $appContext;
    }

    /**
     * Returns the services property.
     *
     * @return \lizmapServices
     */
    public static function getServices()
    {
        if (!self::$services) {
            self::$services = \lizmap::getServices();
        }

        return self::$services;
    }

    /**
     * Returns the appContext property.
     *
     * @return AppContextInterface
     */
    public static function getAppContext()
    {
        if (!self::$appContext) {
            self::$appContext = \lizmap::getAppContext();
        }

        return self::$appContext;
    }

    /**
     * Build OGC Request.
     *
     * @param Project     $project    the project
     * @param array       $params     the params array
     * @param null|string $requestXml the params array
     *
     * @return null|WFSRequest|WMSRequest|WMTSRequest
     */
    public static function build($project, $params, $requestXml = null)
    {
        $service = null;
        $request = null;
        $version = null;

        // Check request XML
        if ($requestXml && substr(trim($requestXml), 0, 1) == '<') {
            $requestXml = trim($requestXml);
        } else {
            $requestXml = null;
        }

        // Parse request XML
        if ($requestXml) {
            $xml = App\XmlTools::xmlFromString($requestXml);
            if (!is_object($xml)) {
                $errormsg = '\n'.$requestXml.'\n'.$xml;
                $errormsg = 'An error has been raised when loading requestXml:'.$errormsg;
                \jLog::log($errormsg, 'lizmapadmin');
                $requestXml = null;
            } else {
                $request = $xml->getName();
                if (property_exists($xml->attributes(), 'service')) {
                    // OGC service has to be upper case for QGIS Server
                    $service = strtoupper($xml['service']);
                }
                if (property_exists($xml->attributes(), 'version')) {
                    $version = $xml['version'];
                }
            }
        }

        // Check parameters
        if (!$requestXml && isset($params['service'])) {
            // OGC service has to be upper case for QGIS Server
            $service = strtoupper($params['service']);
            if (isset($params['request'])) {
                $request = strtolower($params['request']);
            }
        }

        if ($service == null) {
            return null;
        }
        $params['service'] = $service;
        if ($request !== null) {
            $params['request'] = $request;
        }
        // force version from XML in parameters
        if ($version !== null) {
            $params['version'] = $version;
        }
        if (in_array($service, array('WMS', 'WMTS', 'WFS'))) {
            $service = '\Lizmap\Request\\'.$service.'Request';

            return new $service($project, $params, self::getServices(), $requestXml);
        }

        return null;
    }

    /**
     * Returns the HTTP Status Message.
     *
     * @param int $code the HTTP Status Code
     *
     * @return string $msg the HTTP Status Message
     */
    public static function getHttpStatusMsg($code)
    {
        if (isset(self::$httpMessageCode[$code])) {
            return self::$httpMessageCode[$code];
        }

        return '';
    }

    /**
     * Normalize and filter request parameters.
     *
     * @param array $params array of parameters
     *
     * @return array $data normalized and filtered array
     */
    public static function normalizeParams($params)
    {
        $data = array();

        // Filter and normalize the parameters of the request
        $paramsBlocklist = array('module', 'action', 'c', 'repository', 'project');
        foreach ($params as $key => $val) {
            if (!in_array(strtolower($key), $paramsBlocklist)) {
                $data[strtolower($key)] = $val;
            }
        }

        // Sort parameters by key
        ksort($data);

        // Round bbox params to avoid rounding issues with cache
        if (array_key_exists('bbox', $data)) {
            $bboxExp = explode(',', $data['bbox']);
            $nBbox = array();
            foreach ($bboxExp as $val) {
                $val = (float) $val;
                $val = round($val, 6);
                $nBbox[] = str_replace(',', '.', (string) $val);
            }
            $data['bbox'] = implode(',', $nBbox);
        }

        return $data;
    }

    public static function constructUrl($params, $services, $url = null)
    {
        if ($url === null) {
            $url = $services->wmsServerURL;
        }

        if (!preg_match('/\?$/', $url)) {
            $url .= '?';
        }

        $bparams = http_build_query($params);

        // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');
        $bparams = str_replace($a, $b, $bparams);

        return $url.$bparams;
    }

    /**
     * @param null|array|string $options
     * @param string            $method
     * @param null|int          $debug
     *
     * @return array
     */
    protected static function buildOptions($options, $method, $debug)
    {
        $services = self::getServices();

        if (!is_array($options)) {
            // support of deprecated parameters
            if ($options !== null) {
                $options = array(
                    'method' => $method,
                    'proxyHttpBackend' => $options,
                );
            } else {
                $options = array('method' => $method);
            }
            if ($debug !== null) {
                $options['debug'] = $debug;
            }
        }

        $services = self::getServices();
        $options = array_merge(array(
            'method' => 'get',
            'referer' => '',
            'headers' => array(),
            'proxyHttpBackend' => $services->proxyHttpBackend,
            'debug' => $services->debugMode,
            'body' => '',
        ), $options);

        $options['method'] = strtolower($options['method']);

        return $options;
    }

    /**
     * @param string $url
     * @param array  $options
     *
     * @return array(string $url, array $option)
     */
    protected static function buildHeaders($url, $options)
    {
        if ($options['method'] == 'post' || $options['method'] == 'put') {
            if ($options['body'] == '') {
                $options['headers']['Content-type'] = 'application/x-www-form-urlencoded';
                $content = explode('?', $url);
                if (count($content) > 1) {
                    $url = $content[0];
                    $options['body'] = $content[1];
                }
            } elseif (!isset($options['headers']['Content-type'])) {
                $options['headers']['Content-type'] = 'application/x-www-form-urlencoded';
            }
        }

        $options['headers'] = array_merge(array(
            'Connection' => 'close',
            'User-Agent' => ini_get('user_agent'),
            'Accept' => '*/*',
        ), $options['headers']);

        if (strpos($url, self::$services->wmsServerURL) === 0) {
            // headers only for QGIS server
            $options['headers'] = array_merge(
                self::userHttpHeader(),
                self::$services->wmsServerHeaders,
                array('X-Request-Id' => uniqid().'-'.bin2hex(random_bytes(10))),
                $options['headers']
            );
        }

        if (isset($options['loginFilteredOverride'])) {
            $options['headers']['X-Lizmap-Override-Filter'] = $options['loginFilteredOverride'];
        }

        return array($url, $options);
    }

    /**
     * Log if the HTTP code is a 4XX or 5XX error code.
     *
     * @param int                   $httpCode The HTTP code of the request
     * @param string                $url      The URL of the request, for logging
     * @param array<string, string> $headers  The headers of the response
     */
    protected static function logRequestIfError($httpCode, $url, $headers = array())
    {
        if ($httpCode < 400) {
            return;
        }

        $xRequestId = $headers['X-Request-Id'] ?? '';

        $lizmapAdmin = 'An HTTP request ended with an error, please check the main error log.';
        $lizmapAdmin .= ' HTTP code '.$httpCode.'.';
        $error = 'The HTTP request ended with an error.';
        $error .= ' HTTP code '.$httpCode.'.';
        if ($xRequestId !== '') {
            $lizmapAdmin .= ' The X-Request-Id `'.$xRequestId.'`.';
            $error .= ' X-Request-Id `'.$xRequestId.'` → '.$url;
        } else {
            $error .= ' → '.$url;
        }
        \jLog::log($lizmapAdmin, 'lizmapadmin');
        \jLog::log($error, 'error');
    }

    /**
     * Sends a request with Guzzle.
     *
     * @param string     $url     url of the remote data to fetch
     * @param null|array $options list of options for the http request.
     *                            Option items can be: "method", "referer", "proxyHttpBackend",
     *                            "headers" (array of headers strings), "body", "debug", stream.
     *
     * @return ResponseInterface
     */
    protected static function sendRequest($url, $options)
    {
        list($url, $options) = self::buildHeaders($url, $options);

        // check is the env variable is set
        if (getenv('ECHO_OGC_ORIGINAL_REQUEST')) {
            // did the request has to be echoed ?
            if (self::hasEchoInBody($options['body'])) {
                $content = self::getEchoFromRequest($url, $options['body']);

                // We do not perform the request, but return the content previously logged
                return new Response(
                    200,
                    array('Content-Type' => 'text/json'),
                    $content,
                );
            }
            // All requests are logged
            self::logRequestToEcho($url, $options['body']);
        }

        if ($options['referer']) {
            $options['headers']['Referer'] = $options['referer'];
        }

        // Create request cache strategy
        $strategy = new Strategy\Delegate\DelegatingCacheStrategy($defaultStrategy = new Strategy\NullCacheStrategy());
        $lizmapServices = self::getServices();
        $qgisServerUrl = $lizmapServices->getUrlLizmapQgisServerMetadata();
        $strategy->registerRequestMatcher(
            new QgisServerMetadataRequestMatcher($qgisServerUrl),
            new Strategy\GreedyCacheStrategy(new RequestCacheStorage('requests')) // default TTL to 60 seconds
        );
        // Create request stack handler
        $stack = HandlerStack::create();
        $stack->push(new CacheMiddleware($strategy));

        // Create Client
        $client = new Client(array(
            // You can set any number of default request options.
            'timeout' => max(10.0, floatval(ini_get('max_execution_time')) - 5.0),
            // Set stack handler
            'handler' => $stack,
        ));

        // Create request
        $request = new Request(
            $options['method'],
            $url,
            $options['headers'],
            $options['body'],
        );

        // Define request options
        $requestOptions = array(
            'http_errors' => false,
        );

        // Set stream request option
        $requestOptions['stream'] = false;
        if (array_key_exists('stream', $options) && $options['stream'] === true) {
            $requestOptions['stream'] = true;
        }

        // Set proxy request options
        $services = self::getServices();
        if ($services->requestProxyEnabled && $services->requestProxyHost != '') {
            if ($services->requestProxyType == 'socks5') {
                $proxy = 'socks5://';
            } else {
                $proxy = 'http://';
            }

            if ($services->requestProxyUser) {
                $proxy .= urlencode($services->requestProxyUser).':'.urlencode($services->requestProxyPassword).'@';
            }

            $proxy .= $services->requestProxyHost;
            if ($services->requestProxyPort) {
                $proxy .= ':'.$services->requestProxyPort;
            }

            $noProxy = preg_split('/\s*,\s*/', $services->requestProxyNotForDomain);

            $requestOptions['proxy'] = array(
                'http' => $proxy, // Use this proxy with "http"
                'https' => $proxy, // Use this proxy with "https",
                'no' => $noProxy,    // Don't use a proxy with these
            );
        }

        // Send request
        $response = $client->send($request, $requestOptions);

        // Log if error
        self::logRequestIfError($response->getStatusCode(), $url, $response->getHeaders());

        return $response;
    }

    /**
     * Sends a request, and return the body response as string.
     *
     * @param string          $url     url of the remote data to fetch
     * @param null|array      $options list of options for the http request.
     *                                 Option items can be: "method", "referer", "proxyHttpBackend",
     *                                 "headers" (array of headers strings), "body", "debug".
     * @param null|int        $debug   deprecated. 0 or 1 to get debug log.
     *                                 it is ignored if $options is an array.
     * @param string|string[] $method  deprecated. the http method.
     *                                 it is ignored if $options is an array.
     *
     * @return array{0: string, 1: string, 2: int, 3: array} Array containing data (0: string), mime type (1: string), HTTP code (2: int) and headers
     */
    public static function getRemoteData($url, $options = null, $debug = null, $method = 'get')
    {
        $options = self::buildOptions($options, $method, $debug);
        $response = self::sendRequest($url, $options);

        $contentType = 'application/octet-stream';
        if ($response->hasHeader('Content-Type')) {
            $contentType = $response->getHeader('Content-Type')[0];
        }

        return array(
            (string) $response->getBody(),
            $contentType,
            $response->getStatusCode(),
            $response->getHeaders(),
        );
    }

    /**
     * Sends a request, and return the body response as a stream.
     *
     * @param string     $url     url of the remote data to fetch
     * @param null|array $options list of options for the http request.
     *                            Option items can be: "method", "referer", "proxyHttpBackend",
     *                            "headers" (array of headers strings), "body", "debug".
     *
     * @return ProxyResponse
     */
    public static function getRemoteDataAsStream($url, $options = null)
    {
        $options = self::buildOptions($options, 'get', null);
        $options['stream'] = true;

        $response = self::sendRequest($url, $options);

        $contentType = 'application/octet-stream';
        if ($response->hasHeader('Content-Type')) {
            $contentType = $response->getHeader('Content-Type')[0];
        }

        return new ProxyResponse(
            $response->getStatusCode(),
            $contentType,
            $response->getHeaders(),
            $response->getBody()
        );
    }

    /**
     * @return array
     */
    protected static function userHttpHeader()
    {
        $appContext = self::getAppContext();
        // Check if a user is authenticated
        if (!$appContext->UserIsConnected()) {
            // return headers with empty user header
            return array(
                'X-Lizmap-User' => '',
                'X-Lizmap-User-Groups' => '',
            );
        }

        // Provide user and groups to lizmap plugin access control
        $user = $appContext->getUserSession();
        $userGroups = $appContext->aclUserPublicGroupsId();

        return array(
            'X-Lizmap-User' => $user->login,
            'X-Lizmap-User-Groups' => implode(', ', $userGroups),
        );
    }

    /**
     * @param array $optionHeaders
     *
     * @return array
     */
    protected static function encodeHttpHeaders($optionHeaders)
    {
        $headers = array();
        foreach ($optionHeaders as $hname => $hvalue) {
            $headers[] = $hname.': '.$hvalue;
        }

        return $headers;
    }

    /**
     * @param string $cacheDirectory
     * @param string $cacheName
     * @param int    $cacheExpiration
     */
    protected static function createFileProfile($cacheDirectory, $cacheName, $cacheExpiration)
    {
        $appContext = self::getAppContext();
        // Create directory if needed
        \jFile::createDir($cacheDirectory);

        // Virtual cache profile parameter
        $cacheParams = array(
            'driver' => 'file',
            'cache_dir' => $cacheDirectory,
            'file_locking' => true,
            'directory_level' => '5',
            'file_name_prefix' => 'lizmap_',
            'ttl' => $cacheExpiration,
        );

        // Create the virtual cache profile
        $appContext->createVirtualProfile('jcache', $cacheName, $cacheParams);
    }

    /**
     * @param string $cacheDirectory
     * @param string $cacheName
     * @param int    $cacheExpiration
     * @param string $cacheDatabase
     */
    protected static function createSqLiteProfile($cacheDirectory, $cacheName, $cacheExpiration, $cacheDatabase)
    {
        $appContext = self::getAppContext();
        \jFile::createDir($cacheDirectory); // Create directory if needed
        $cachePdoDsn = 'sqlite:'.$cacheDatabase;

        // Create database and populate with table if needed
        if (!file_exists($cacheDatabase)) {
            copy(__DIR__.'/cacheTemplate.db', $cacheDatabase);
        }

        // Virtual jdb profile corresponding to the layer database
        $jdbParams = array(
            'driver' => 'pdo',
            'dsn' => $cachePdoDsn,
            'user' => 'cache',
            'password' => 'cache',
        );
        // Create the virtual jdb profile
        $cacheJdbName = 'jdb_'.$cacheName;
        $appContext->createVirtualProfile('jdb', $cacheJdbName, $jdbParams);

        // Virtual cache profile parameter
        $cacheParams = array(
            'driver' => 'db',
            'dbprofile' => $cacheJdbName,
            'ttl' => $cacheExpiration,
            'base64encoding' => true,
        );

        // Create the virtual cache profile
        $appContext->createVirtualProfile('jcache', $cacheName, $cacheParams);
    }

    /**
     * Create a profile to cache things related to a project.
     *
     * The profile will store content into files, redis or sqlite,
     * depending on the lizmap configuration
     *
     * @param string $repository
     * @param string $project
     * @param string $layers
     * @param string $crs
     *
     * @return string the profile name of the cache
     */
    public static function createVirtualProfile($repository, $project, $layers, $crs)
    {

        // Set cache configuration
        $cacheName = 'lizmapCache_'.$repository.'_'.$project.'_'.$layers.'_'.$crs;

        if (array_key_exists($cacheName, self::$_profiles)) {
            return $cacheName;
        }

        $appContext = self::getAppContext();
        // Storage type
        $ser = self::getServices();
        $cacheStorageType = $ser->cacheStorageType;
        // Expiration time : take default one
        $cacheExpiration = (int) $ser->cacheExpiration;

        // Cache root directory
        $cacheRootDirectory = $ser->cacheRootDirectory;
        if ($cacheStorageType != 'redis') {
            if (!is_dir($cacheRootDirectory) or !is_writable($cacheRootDirectory)) {
                \jLog::log('cacheRootDirectory "'.$cacheRootDirectory.'" is not a directory or is not writable!', 'lizmapadmin');
                $cacheRootDirectory = sys_get_temp_dir();
            }
        }

        if ($cacheStorageType == 'file') {
            // CACHE CONTENT INTO FILE SYSTEM
            // Directory where to store the cached files
            $cacheDirectory = $cacheRootDirectory.'/'.$repository.'/'.$project.'/'.$layers.'/'.$crs.'/';
            self::createFileProfile($cacheDirectory, $cacheName, $cacheExpiration);
        } elseif ($cacheStorageType == 'redis') {
            // CACHE CONTENT INTO REDIS
            self::declareRedisProfile($ser, $cacheName, $repository, $project, $layers, $crs);
        } else {
            // CACHE CONTENT INTO SQLITE DATABASE
            // Directory where to store the sqlite database
            $cacheDirectory = $cacheRootDirectory.'/'.$repository.'/'.$project.'/';
            $cacheDatabase = $cacheDirectory.$layers.'_'.$crs.'.db';
            self::createSqLiteProfile($cacheDirectory, $cacheName, $cacheExpiration, $cacheDatabase);
        }

        self::$_profiles[$cacheName] = true;

        return $cacheName;
    }

    /**
     * @param \lizmapServices $ser
     * @param string          $cacheName
     * @param string          $repository
     * @param null|string     $project
     * @param null|string     $layers
     * @param null|string     $crs
     */
    protected static function declareRedisProfile($ser, $cacheName, $repository, $project = null, $layers = null, $crs = null)
    {
        $cacheRedisHost = 'localhost';
        $cacheRedisPort = '6379';
        $cacheExpiration = (int) $ser->cacheExpiration;

        if (property_exists($ser, 'cacheRedisHost')) {
            $cacheRedisHost = trim($ser->cacheRedisHost);
        }
        if (property_exists($ser, 'cacheRedisPort')) {
            $cacheRedisPort = trim($ser->cacheRedisPort);
        }

        if (extension_loaded('redis')) {
            $driver = 'redis_ext';
        } else {
            $driver = 'redis_php';
        }

        // Virtual cache profile parameter
        $cacheParams = array(
            'driver' => $driver,
            'host' => $cacheRedisHost,
            'port' => $cacheRedisPort,
            'ttl' => $cacheExpiration,
        );
        if ($project) {
            if ($layers) {
                $cacheParams['key_prefix'] = $repository.'/'.$project.'/'.$layers.'/'.$crs.'/';
            } else {
                $cacheParams['key_prefix'] = $repository.'/'.$project.'/';
            }
        } else {
            $cacheParams['key_prefix'] = $repository.'/';
        }

        if (property_exists($ser, 'cacheRedisDb') and !empty($ser->cacheRedisDb)) {
            $cacheParams['db'] = $ser->cacheRedisDb;
        }
        if (property_exists($ser, 'cacheRedisKeyPrefix') and !empty($ser->cacheRedisKeyPrefix)) {
            $cacheParams['key_prefix'] = $ser->cacheRedisKeyPrefix.$cacheParams['key_prefix'];
        }
        if (property_exists($ser, 'cacheRedisKeyPrefixFlushMethod') and !empty($ser->cacheRedisKeyPrefixFlushMethod)) {
            $cacheParams['key_prefix_flush_method'] = $ser->cacheRedisKeyPrefixFlushMethod;
        }

        // Create the virtual cache profile
        self::getAppContext()->createVirtualProfile('jcache', $cacheName, $cacheParams);
    }

    /**
     * @param Repository $lrep
     *
     * @return false|string the repository key, or false if clear has failed
     */
    public static function clearCache($lrep)
    {
        // Get config utility
        $repository = $lrep->getKey();
        $ser = self::getServices();

        // Remove the cache for the repository for file/sqlite cache type
        $cacheStorageType = $ser->cacheStorageType;
        $clearCacheOk = false;
        if ($cacheStorageType != 'redis') {
            $cacheRootDirectory = $ser->cacheRootDirectory;
            if (!is_writable($cacheRootDirectory) or !is_dir($cacheRootDirectory)) {
                $cacheRootDirectory = sys_get_temp_dir();
            }
            $clearCacheOk = \jFile::removeDir($cacheRootDirectory.'/'.$repository);
        } else {
            // remove the cache from redis
            $cacheName = 'lizmapCache_'.$repository;
            self::declareRedisProfile($ser, $cacheName, $repository);
            $clearCacheOk = \jCache::flush($cacheName);
        }
        self::getAppContext()->eventNotify('lizmapProxyClearCache', array('repository' => $repository));
        if ($clearCacheOk) {
            return $repository;
        }

        return false;
    }

    /**
     * @param string $repository
     * @param string $project
     *
     * @return bool the project cache has been clear or not
     */
    public static function clearProjectCache($repository, $project)
    {
        // Storage type
        $ser = self::getServices();
        $appContext = self::getAppContext();
        $cacheStorageType = $ser->cacheStorageType;
        $clearCacheOk = false;

        // Cache root directory
        if ($cacheStorageType != 'redis') {
            $cacheRootDirectory = $ser->cacheRootDirectory;
            if (!is_dir($cacheRootDirectory) or !is_writable($cacheRootDirectory)) {
                $cacheRootDirectory = sys_get_temp_dir();
            }

            // Directory where cached files are stored for the project
            $cacheProjectDir = $cacheRootDirectory.'/'.$repository.'/'.$project.'/';
            $results = array();
            if (file_exists($cacheProjectDir)) {
                $clearCacheOk = \jFile::removeDir($cacheProjectDir);
            } else {
                return true;
            }
        } else {
            // FIXME: removing by layer is not supported for the moment. For the moment, we flush all layers of the project.
            $cacheName = 'lizmapCache_'.$repository.'_'.$project;
            self::declareRedisProfile($ser, $cacheName, $repository, $project);
            $appContext->flushCache($cacheName);
            $clearCacheOk = true;
        }
        $appContext->eventNotify('lizmapProxyClearProjectCache', array('repository' => $repository, 'project' => $project));

        return $clearCacheOk;
    }

    /**
     * @param string $repository
     * @param string $project
     * @param string $layer
     *
     * @return bool the layer cache has been clear or not
     */
    public static function clearLayerCache($repository, $project, $layer)
    {
        // Storage type
        $ser = self::getServices();
        $appContext = self::getAppContext();
        $cacheStorageType = $ser->cacheStorageType;

        // Cache root directory
        if ($cacheStorageType != 'redis') {
            $cacheRootDirectory = $ser->cacheRootDirectory;
            if (!is_dir($cacheRootDirectory) or !is_writable($cacheRootDirectory)) {
                $cacheRootDirectory = sys_get_temp_dir();
            }

            // Directory where cached files are stored for the project
            $cacheProjectDir = $cacheRootDirectory.'/'.$repository.'/'.$project.'/';
            $results = array();
            if (file_exists($cacheProjectDir)) {
                // Open the directory and walk through the filenames
                $handle = opendir($cacheProjectDir);
                while (($entry = readdir($handle)) !== false) {
                    if ($entry != '.' && $entry != '..') {
                        // Get directories and files corresponding to the layer
                        if (preg_match('#(^|_)'.$layer.'($|_)#', $entry)) {
                            $results[] = $cacheProjectDir.$entry;
                        }
                    }
                }
                closedir($handle);
                if (count($results) === 0) {
                    return true;
                }
                foreach ($results as $rem) {
                    if (is_dir($rem)) {
                        \jFile::removeDir($rem);
                    } else {
                        unlink($rem);
                    }
                }
            } else {
                return true;
            }
        } else {
            // FIXME: removing by layer is not supported for the moment. For the moment, we flush all layers of the project.
            $cacheName = 'lizmapCache_'.$repository.'_'.$project;
            self::declareRedisProfile($ser, $cacheName, $repository, $project);
            $appContext->flushCache($cacheName);
        }
        $appContext->eventNotify('lizmapProxyClearLayerCache', array('repository' => $repository, 'project' => $project, 'layer' => $layer));

        return true;
    }

    /**
     * check if $body contains a '__echo__=&' param.
     *
     * @return bool
     */
    public static function hasEchoInBody(string $body)
    {
        $encodedEchoParam = '%5F%5Fecho%5F%5F=&';

        return strstr($body, $encodedEchoParam);
    }

    /**
     * Log the URL and its body in the 'echoproxy' log file
     * We add a md5 hash of the string to help retrieving it later
     * NOTE : currently we log only the url & body, thus it doesn't really need to be logged
     * because the same url & body are needed to retreive the content
     * but the function will be useful when it will log additionnal content.
     */
    public static function logRequestToEcho(string $url, string $body)
    {
        $md5 = md5($url.'|'.$body);
        \jLog::log($md5."\t".$url.'?'.$body, 'echoproxy');
    }

    /**
     * return the content that was logged for the (url, body) params
     * using a md5 hash to search it in the log file.
     *
     * @see logRequestToEcho()
     */
    public static function getEchoFromRequest(string $url, string $body): string
    {
        $encodedEchoParam = '%5F%5Fecho%5F%5F=&';
        // md5 hash to search in the file
        $md5ToSearch = md5($url.'|'.str_replace($encodedEchoParam, '', $body));

        $logPath = \jApp::logPath('echoproxy.log');
        if (is_file($logPath)) {
            // retrieve the 50 last lines
            $nLastLines = preg_split("/\r\n|\n|\r/", App\FileTools::tail($logPath, 50));
            // key : md5 , value : usefull content
            $md5Assoc = array();
            foreach ($nLastLines as $line) {
                $words = explode("\t", $line);
                if (count($words) > 4
                    && $md5ToSearch == $words[3]) {
                    return $words[4];
                }
            }

            return 'unfound '.$md5ToSearch;
        }

        return 'unfound echoproxy.log';
    }
}

/*

function lizmap_stream_notification_callback($notification_code, $severity, $message, $message_code, $bytes_transferred, $bytes_max) {

    switch($notification_code) {
        case STREAM_NOTIFY_RESOLVE:
        case STREAM_NOTIFY_AUTH_REQUIRED:
        case STREAM_NOTIFY_COMPLETED:
        case STREAM_NOTIFY_FAILURE:
        case STREAM_NOTIFY_AUTH_RESULT:
            \jLog::dump(array(
                "notification_code"=>$notification_code,
                "severity"=>$severity,
                "message"=>$message,
                "message_code"=>$message_code,
                "bytes_transferred"=>$bytes_transferred,
                "bytes_max"=>$bytes_max),
                "notification_callback");
            break;

        case STREAM_NOTIFY_REDIRECTED:
            \jLog::log("notification_callback - Being redirected to: ".$message);
            break;

        case STREAM_NOTIFY_CONNECT:
            \jLog::log("notification_callback - Connected...");
            break;

        case STREAM_NOTIFY_FILE_SIZE_IS:
            \jLog::log( "notification_callback - Got the filesize: ". $bytes_max);
            break;

        case STREAM_NOTIFY_MIME_TYPE_IS:
            \jLog::log( "notification_callback - Found the mime-type: ". $message);
            break;

        case STREAM_NOTIFY_PROGRESS:
            \jLog::log( "notification_callback - Made some progress, downloaded ". $bytes_transferred. " so far");
            break;
    }
}
*/
