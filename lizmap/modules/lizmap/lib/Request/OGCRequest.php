<?php

/**
 * Manage OGC request.
 *
 * @author    3liz
 * @copyright 2015-2021 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

use Lizmap\App;
use Lizmap\Project\Project;
use Lizmap\Project\Repository;

/**
 * @see https://en.wikipedia.org/wiki/Open_Geospatial_Consortium.
 *
 * Base class for Requests
 */
abstract class OGCRequest
{
    /**
     * @var Project
     */
    protected $project;

    /**
     * @var Repository
     */
    protected $repository;

    /**
     * @var array
     */
    protected $params;

    /**
     * @var null|string
     */
    protected $requestXml;

    /**
     * @var \lizmapServices
     */
    protected $services;

    /**
     * @var string selector of a template
     */
    protected $tplExceptions;

    /**
     * @var App\AppContextInterface
     */
    protected $appContext;

    /**
     * constructor.
     *
     * @param Project         $project    the project
     * @param array           $params     the params array
     * @param \lizmapServices $services
     * @param null|string     $requestXml the params array
     */
    public function __construct($project, $params, $services, $requestXml = null)
    {
        // print_r( $project != null );
        $this->project = $project;
        $this->repository = $project->getRepository();

        $this->services = $services;
        $this->appContext = $this->project->getAppContext();

        $params['map'] = $project->getRelativeQgisPath();
        $this->params = Proxy::normalizeParams($params);
        $this->requestXml = $requestXml;
    }

    /**
     * Get the value of a request parameter. If not defined, gets its default value.
     *
     * @param string $name              the name of the request parameter
     * @param mixed  $defaultValue      the default returned value if the parameter doesn't exists
     * @param bool   $useDefaultIfEmpty true: says to return the default value if the parameter value is ""
     *
     * @return mixed the request parameter value
     */
    public function param($name, $defaultValue = null, $useDefaultIfEmpty = false)
    {
        $name = strtolower($name);
        if (isset($this->params[$name])) {
            if ($useDefaultIfEmpty && trim($this->params[$name]) == '') {
                return $defaultValue;
            }

            return $this->params[$name];
        }

        return $defaultValue;
    }

    /**
     * Provide the parameters with the lizmap extra parameters for filtering the request.
     *
     * Lizmap_User, Lizmap_User_Groups, Lizmap_Override_Filter
     * have been added to the OGC request parameters.
     *
     * @return array the OGC request parameters with Lizmap extra parameters for filtering request
     */
    public function parameters()
    {
        $appContext = $this->appContext;
        // Check if a user is authenticated
        if (!$appContext->UserIsConnected()) {
            // return parameters with empty user param
            return array_merge($this->params, array(
                'Lizmap_User' => '',
                'Lizmap_User_Groups' => '',
            ));
        }

        // Provide user and groups to lizmap plugin access control without private group
        $user = $appContext->getUserSession();
        $userGroups = $appContext->aclUserPublicGroupsId();
        $loginFilteredOverride = $appContext->aclCheck('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey());

        return array_merge($this->params, array(
            'Lizmap_User' => $user->login,
            'Lizmap_User_Groups' => implode(', ', $userGroups),
            'Lizmap_Override_Filter' => $loginFilteredOverride,
        ));
    }

    /**
     * Process the OGC Request
     * Checks the request parameter and performs the right method.
     *
     * @return object The request result with HTTP code, response mime-type, response data
     *                (properties $code, $mime, $data, $cached)
     */
    public function process()
    {
        $req = $this->param('request');
        $req_version = $this->param('version');

        // VERSION parameter is mandatory except for GetCapabilities request
        if (strtolower($req) !== 'getcapabilities' && !$req_version) {
            \jMessage::add('Please add the value of the VERSION parameter', 'OperationNotSupported');

            return $this->serviceException(501);
        }

        if ($req) {
            $reqMeth = 'process_'.$req;
            if (method_exists($this, $reqMeth)) {
                return $this->{$reqMeth}();
            }
        }

        if (!$req) {
            \jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');
        } else {
            \jMessage::add('Request '.$req.' is not supported', 'OperationNotSupported');
        }

        return $this->serviceException(501);
    }

    /**
     * Build the URL to request QGIS Server.
     *
     * @return string The URL to use to request QGIS Server
     */
    protected function constructUrl()
    {
        $url = $this->services->wmsServerURL.'';
        if (!preg_match('/\?/', $url)) {
            $url .= '?';
        } elseif (!preg_match('/&$/', $url)) {
            $url .= '&';
        }

        return Proxy::constructUrl($this->parameters(), $this->services, $url);
    }

    /**
     * Generate a string to identify the target of the HTTP request.
     *
     * @param array $parameters The list of HTTP parameters in the query
     * @param int   $code       The HTTP code of the request
     *
     * @return string The string to identify the HTTP request, with main OGC parameters first such as MAP, SERVICE...
     */
    private function formatHttpErrorString($parameters, $code)
    {
        // Clone parameters array to perform unset without modify it
        $params = array_merge(array(), $parameters);

        // Ordered list of params to fetch first
        $mainParamsToLog = array('map', 'repository', 'project', 'service', 'request');

        $output = array();
        foreach ($mainParamsToLog as $paramName) {
            if (array_key_exists($paramName, $params)) {
                $output[] = '"'.strtoupper($paramName).'" = '."'".$params[$paramName]."'";
                unset($params[$paramName]);
            }
        }

        // First implode with main parameters
        $message = implode(' & ', $output);

        if ($params) {
            // Ideally, we want two lines, one with main parameters, the second one with secondary parameters
            // It does not work in jLog
            // $message .= '\n';
            $message .= ' & ';
        }

        // For remaining parameters in the array, which are not in the main list
        $output = array();
        foreach ($params as $key => $value) {
            $output[] = '"'.strtoupper($key).'" = '."'".$value."'";
        }

        $message .= implode(' & ', $output);

        return 'HTTP code '.$code.' on '.$message;
    }

    /**
     * Log if the HTTP code is a 4XX or 5XX error code.
     *
     * @param int                   $code    The HTTP code of the request
     * @param array<string, string> $headers The headers of the response
     */
    protected function logRequestIfError($code, $headers)
    {
        if ($code < 400) {
            return;
        }

        $message = 'The HTTP OGC request to QGIS Server ended with an error.';

        $xRequestId = $headers['X-Request-Id'] ?? '';
        if ($xRequestId !== '') {
            $message .= ' The X-Request-Id `'.$xRequestId.'`.';
        }

        // The master error with MAP parameter
        // This user must have an access to QGIS Server logs
        $params = $this->parameters();
        \jLog::log($message.' Check logs on QGIS Server. '.$this->formatHttpErrorString($params, $code), 'error');

        // The admin error without the MAP parameter
        // but replaced by REPOSITORY and PROJECT parameters
        // This user might not have an access to QGIS Server logs
        unset($params['map']);
        $params['repository'] = $this->project->getRepository()->getKey();
        $params['project'] = $this->project->getKey();
        \jLog::log($message.' '.$this->formatHttpErrorString($params, $code), 'lizmapadmin');
    }

    /**
     * Request QGIS Server.
     *
     * @param bool $post   Force to use POST request
     * @param bool $stream Get data as stream
     *
     * @return OGCResponse The request result with HTTP code, response mime-type and response data
     *                     (properties $code, $mime, $data)
     */
    protected function request($post = false, $stream = false)
    {
        $querystring = $this->constructUrl();
        $headers = array(
            'X-Qgis-Service-Url' => $this->project->getOgcServiceUrl(),
        );
        // If the OGC request is provided from command line the request is null
        $browserRequest = $this->appContext->getCoord()->request;
        if ($browserRequest) {
            $host = $browserRequest->getDomainName();
            $proto = $browserRequest->getProtocol();
            $headers = array_merge(
                $headers,
                array(
                    'X-Forwarded-Host' => $host,
                    'X-Forwarded-Proto' => $proto,
                    'Forwarded' => 'host='.$host.';proto='.$proto,
                ),
            );
        }

        $options = array();
        if ($this->requestXml !== null) {
            $options = array(
                'method' => 'post',
                'body' => $this->requestXml,
            );
            $headers = array_merge(
                array('Content-Type' => 'text/xml'),
                $headers,
            );
        } elseif ($post) {
            $options = array('method' => 'post');
        }
        $options['headers'] = $headers;

        // Add login filtered override info
        $options['loginFilteredOverride'] = \jAcl2::check('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey());

        if ($stream) {
            $response = Proxy::getRemoteDataAsStream($querystring, $options);

            $this->logRequestIfError($response->getCode(), $response->getHeaders());

            return new OGCResponse($response->getCode(), $response->getMime(), $response->getBodyAsStream());
        }

        list($data, $mime, $code, $headers) = Proxy::getRemoteData($querystring, $options);

        $this->logRequestIfError($code, $headers);

        return new OGCResponse($code, $mime, $data);
    }

    /**
     * Provide an OGC Service Exception result.
     *
     * @param int $code The HTTP code to return
     *
     * @return OGCResponse The request result with HTTP code, response mime-type, response data
     *                     (properties $code, $mime, $data, $cached)
     */
    protected function serviceException($code = 400)
    {
        $messages = \jMessage::getAll();

        if ($this->tplExceptions !== null) {
            $mime = 'text/xml';
            $tpl = new \jTpl();
            $tpl->assign('messages', $messages);
            $data = $tpl->fetch($this->tplExceptions);
        } else {
            $mime = 'text/plain';
            if (is_array($messages) && count($messages)) {
                $data = implode('\n', $messages);
            } else {
                $data = '';
            }
        }
        \jMessage::clearAll();

        return new OGCResponse($code, $mime, $data);
    }

    /**
     * Perform an OGC GetCapabilities Request.
     *
     * @return OGCResponse The request result with HTTP code, response mime-type, response data
     *                     (properties $code, $mime, $data, $cached)
     */
    protected function process_getcapabilities()
    {
        $appContext = $this->appContext;
        // Get cached session
        // the cache should be unique between each user/service because the
        // request content depends on rights of the user
        $key = session_id().'-'.$this->param('service');
        $version = $this->param('version');
        if ($version) {
            $key .= '-'.$version;
        }
        if ($appContext->UserIsConnected()) {
            $juser = $appContext->getUserSession();
            $key .= '-'.$juser->login;
        }
        $key = 'getcapabilities-'.sha1($key);
        $cached = false;

        try {
            $cached = $this->project->getCacheHandler()->getProjectRelatedDataCache($key);
        } catch (\Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            \jLog::logEx($e, 'error');
        }
        // return cached data
        if ($cached !== false) {
            return new OGCResponse($cached['code'], $cached['mime'], $cached['data'], true);
        }

        // Get remote data
        $response = $this->request();

        // Retry if 500 error ( hackish, but QGIS Server segfault sometimes with cache issue )
        if ($response->code == 500) {
            // Get remote data
            $response = $this->request();
        }

        if ($response->code == 200) {
            $cachedContent = array(
                'code' => $response->code,
                'mime' => $response->mime,
                'data' => $response->data,
            );
            $cached = $this->project->getCacheHandler()->setProjectRelatedDataCache($key, $cachedContent, 3600);
        }

        return new OGCResponse($response->code, $response->mime, $response->data, $cached);
    }

    /*
     * Interprets a string of XML into an object
     *
     * @param string $xmldata a well-formed XML string
     * @param string $name    an XML name
     *
     * @return SimpleXMLElement|null an object with properties containing
     *                               the data held within the XML document
     *                               or null
     */
    protected function loadXmlString($xmldata, $name)
    {
        // Get data from XML
        // Create a DOM instance
        $xml = App\XmlTools::xmlFromString($xmldata);
        if (!is_object($xml)) {
            $errormsg = '\n'.$xmldata.'\n'.$xml;
            $errormsg = '\n'.http_build_query($this->params).$errormsg;
            $errormsg = 'An error has been raised when loading '.$name.':'.$errormsg;
            \jLog::log($errormsg, 'lizmapadmin');

            return null;
        }

        return $xml;
    }
}
