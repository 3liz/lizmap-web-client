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

use Lizmap\App;

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
     *
     * @param Lizmap\App\AppContextInterface $appContext
     */
    public static function setAppContext(App\AppContextInterface $appContext)
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
     * @return \Lizmap\App\AppContextInterface
     */
    public static function getAppContext()
    {
        if (!self::$appContext) {
            self::$appContext = \lizmap::getAppContext();
        }

        return self::$appContext;
    }

    /**
     * @param $project
     * @param $params
     * @param null $requestXml
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
                \jLog::log($errormsg, 'error');
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

            return new $service($project, $params, self::getServices(), self::getAppContext(), $requestXml);
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
            'User-Agent' => ini_get('user_agent') ?: 'Lizmap',
            'Accept' => '*/*',
        ), $options['headers']);

        if (strpos($url, self::$services->wmsServerURL) === 0) {
            // headers only for QGIS server
            $options['headers'] = array_merge(
                self::userHttpHeader(),
                self::$services->wmsServerHeaders,
                $options['headers']
            );
        }

        if (isset($options['loginFilteredOverride'])) {
            $options['headers']['X-Lizmap-Override-Filter'] = $options['loginFilteredOverride'];
        }

        return array($url, $options);
    }

    protected static function curlProxy($url, $options)
    {
        $services = self::getServices();
        $http_code = null;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        // For POST, remove parameters from the URL
        // and add them to the body of the request
        // Also change the content type
        if ($options['method'] === 'post') {
            if (empty($options['body'])) {
                $explode_url = explode('?', $url);
                if (count($explode_url) == 2) {
                    // Override previous url by removing the parameters after ?
                    $url = $explode_url[0];

                    // Set the body to use POST instead of GET
                    $options['body'] = $explode_url[1];
                    $options['headers']['Content-type'] = 'application/x-www-form-urlencoded';
                }
            }
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, self::encodeHttpHeaders($options['headers']));
        curl_setopt($ch, CURLOPT_URL, $url);

        if ($services->requestProxyEnabled && $services->requestProxyHost != '') {
            $proxy = $services->requestProxyHost;
            if ($services->requestProxyPort) {
                $proxy .= ':'.$services->requestProxyPort;
            }
            curl_setopt($ch, CURLOPT_PROXY, $proxy);
            if ($services->requestProxyType) {
                curl_setopt($ch, CURLOPT_PROXYTYPE, $services->requestProxyType);
            }
            if ($services->requestProxyNotForDomain) {
                curl_setopt($ch, CURLOPT_NOPROXY, $services->requestProxyNotForDomain);
            }
            if ($services->requestProxyUser) {
                curl_setopt($ch, CURLOPT_PROXYAUTH, CURLAUTH_BASIC);
                curl_setopt($ch, CURLOPT_PROXYUSERPWD, $services->requestProxyUser.':'.$services->requestProxyPassword);
            }
        }

        if ($options['referer']) {
            curl_setopt($ch, CURLOPT_REFERER, $options['referer']);
        }
        if ($options['method'] === 'post') {
            curl_setopt($ch, CURLOPT_POST, 1);
            if (!empty($options['body'])) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $options['body']);
            }
        }
        $data = curl_exec($ch);
        $info = curl_getinfo($ch);
        $mime = $info['content_type'];
        $http_code = (int) $info['http_code'];
        // Optionnal debug
        if ($options['debug'] and curl_errno($ch)) {
            \jLog::log('--> CURL: '.json_encode($info));
        }

        curl_close($ch);

        return array($data, $mime, $http_code);
    }

    protected static function fileProxy($url, $options)
    {
        $services = self::getServices();
        $http_code = null;

        $urlInfo = parse_url($url);
        $scheme = isset($urlInfo['scheme']) ? $urlInfo['scheme'] : 'http';

        $opts = array(
            'protocol_version' => '1.1',
            'method' => strtoupper($options['method']),
        );

        if ($services->requestProxyEnabled && $services->requestProxyHost != '') {
            $okproxy = true;
            if ($services->requestProxyNotForDomain) {
                $noProxy = preg_split('/\s*,\s*/', $services->requestProxyNotForDomain);
                $host = isset($urlInfo['host']) ? $urlInfo['host'] : 'localhost';
                if (in_array($host, $noProxy)) {
                    $okproxy = false;
                }
            }
            if ($okproxy) {
                $proxy = 'tcp://'.$services->requestProxyHost;
                if ($services->requestProxyPort) {
                    $proxy .= ':'.$services->requestProxyPort;
                }
                $opts['proxy'] = $proxy;
                $opts['request_fulluri'] = true;

                if ($services->requestProxyUser) {
                    $options['headers']['Proxy-Authorization'] =
                        'Basic '.base64_encode($services->requestProxyUser.':'.$services->requestProxyPassword);
                }
            }
        }
        if ($options['referer']) {
            $options['headers']['Referer'] = $options['referer'];
        }
        if ($options['method'] != 'get' && $options['body'] != '') {
            $opts['content'] = $options['body'];
        } else {
            unset($options['headers']['Connection']);
        }
        $opts['header'] = self::encodeHttpHeaders($options['headers']);

        $context = stream_context_create(array($scheme => $opts));
        // for debug, uncomment it and uncomment  the lizmap_stream_notification_callback function below
        //use stream_context_set_params($context, array("notification" => "lizmap_stream_notification_callback"));

        $data = file_get_contents($url, false, $context);
        $mime = 'image/png';
        $matches = array();
        $http_code = 0;
        // $http_response_header is created by file_get_contents
        foreach ($http_response_header as $header) {
            if (preg_match('#^Content-Type:\s+([\w/\.+]+)(;\s+charset=(\S+))?#i', $header, $matches)) {
                $mime = $matches[1];
                if (count($matches) > 3) {
                    $mime .= '; charset='.$matches[3];
                }
            } elseif (substr($header, 0, 5) === 'HTTP/') {
                list($version, $code, $phrase) = explode(' ', $header, 3) + array('', false, '');
                $http_code = (int) $code;
            }
        }
        // optional debug
        if ($options['debug'] && ($http_code >= 400)) {
            \jLog::log('getRemoteData, bad response for '.$url);
            \jLog::dump($opts, 'getRemoteData, bad response, options');
            \jLog::dump($http_response_header, 'getRemoteData, bad response, response headers');
        }

        return array($data, $mime, $http_code);
    }

    /**
     * Get remote data from URL, with curl or internal php functions.
     *
     * @param string            $url     url of the remote data to fetch
     * @param null|array|string $options list of options for the http request.
     *                                   Option items can be: "method", "referer", "proxyHttpBackend",
     *                                   "headers" (array of headers strings), "body", "debug".
     *                                   If $options is a string, this should be the proxy method
     *                                   for compatibility to old calls.
     *                                   $proxyHttpBackend: method for the proxy : 'php' or 'curl', or ''.
     *                                   by default, it is the proxy method indicated into lizmapService
     * @param null|int          $debug   deprecated. 0 or 1 to get debug log.
     *                                   if null, it uses the method indicated into lizmapService.
     *                                   it is ignored if $options is an array.
     * @param string|string[]   $method  deprecated. the http method.
     *                                   it is ignored if $options is an array.
     *
     * @return array($data, $mime, $http_code) Array containing the data and the mime type
     */
    public static function getRemoteData($url, $options = null, $debug = null, $method = 'get')
    {
        $options = self::buildOptions($options, $method, $debug);
        list($url, $options) = self::buildHeaders($url, $options);

        // Proxy http backend : use curl or file_get_contents
        if (extension_loaded('curl') && $options['proxyHttpBackend'] != 'php') {
            // With curl
            return self::curlProxy($url, $options);
        }
        // With file_get_contents
        return self::fileProxy($url, $options);
    }

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

    protected static function encodeHttpHeaders($optionHeaders)
    {
        $headers = array();
        foreach ($optionHeaders as $hname => $hvalue) {
            $headers[] = $hname.': '.$hvalue;
        }

        return $headers;
    }

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

    protected static function createSqLiteProfile($cacheDirectory, $cacheName, $cacheExpiration, $cacheDatabase)
    {
        $appContext = self::getAppContext();
        \jFile::createDir($cacheDirectory); // Create directory if needed
        $cachePdoDsn = 'sqlite:'.$cacheDatabase;

        // Create database and populate with table if needed
        if (!file_exists($cacheDatabase)) {
            copy($appContext->appVarPath().'cacheTemplate.db', $cacheDatabase);
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
                \jLog::log('cacheRootDirectory "'.$cacheRootDirectory.'" is not a directory or is not writable!', 'error');
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
     * @param Lizmap\Project\Repository $lrep
     *
     * @return mixed the repository key, or false if clear has failed
     */
    public static function clearCache($lrep)
    {
        if (!$lrep) {
            return null;
        }

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
            $clearCacheOk = $clearCacheOk && \jCache::flush($cacheName);
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
