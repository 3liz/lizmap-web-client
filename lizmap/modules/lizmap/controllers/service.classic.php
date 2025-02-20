<?php

use GuzzleHttp\Psr7\Utils as Psr7Utils;
use Lizmap\Project\Project;
use Lizmap\Project\UnknownLizmapProjectException;

use Lizmap\Request\Proxy;
use Lizmap\Request\WFSRequest;
use Lizmap\Request\WMSRequest;
use Lizmap\Request\WMTSRequest;

/**
 * Php proxy to access map services.
 *
 * @author    3liz
 * @copyright 2011-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class serviceCtrl extends jController
{
    /**
     * @var null|Project
     */
    protected $project;

    /**
     * @var null|lizmapRepository
     */
    protected $repository;

    /**
     * @var lizmapServices
     */
    protected $services = '';

    protected $params = array();

    /**
     * @var null|bool
     */
    protected $respCanBeCached;

    /**
     * Redirect to the appropriate action depending on the REQUEST parameter.
     *
     * @urlparam $PROJECT Name of the project
     * @urlparam $REQUEST Request type
     *
     * @return jResponse Redirect to the corresponding action depending on the request parameters
     */
    public function index()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return $this->processOptionsRequests();
        }

        lizmap::startMetric();

        if (isset($_SERVER['PHP_AUTH_USER'])) {
            $ok = jAuth::login($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
            // FIXME we don't return an error if login fails?
        }

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        $requestXml = null;
        if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'text/xml') === 0) {
            $requestXml = $this->request->getBody();
        }

        $ogcRequest = Proxy::build($this->project, $this->params, $requestXml);
        if ($ogcRequest === null) {
            // Error message
            jMessage::add('Service unknown or unsupported.', 'ServiceNotSupported');

            return $this->serviceException();
        }

        // Return the appropriate action
        $request = $ogcRequest->param('request');
        if (!$request) {
            jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');

            return $this->serviceException();
        }

        $request = strtoupper($request);

        // Extra request
        if ($request == 'GETPROJ4') {
            return $this->GetProj4();
        }
        if ($request == 'GETSELECTIONTOKEN') {
            return $this->GetSelectionToken();
        }
        if ($request == 'GETFILTERTOKEN') {
            return $this->GetFilterToken();
        }

        // Standard request
        // All requests are not possible for all services. The possibility is
        // checked into the process() method of $ogcRequest.
        if ($request == 'GETCAPABILITIES') {
            return $this->GetCapabilities($ogcRequest);
        }
        if ($request == 'GETCONTEXT') {
            return $this->GetContext($ogcRequest);
        }
        if ($request == 'GETSCHEMAEXTENSION') {
            return $this->GetSchemaExtension($ogcRequest);
        }
        if ($request == 'GETLEGENDGRAPHICS') {
            return $this->GetLegendGraphics($ogcRequest);
        }
        if ($request == 'GETLEGENDGRAPHIC') {
            return $this->GetLegendGraphics($ogcRequest);
        }
        if ($request == 'GETFEATUREINFO') {
            return $this->GetFeatureInfo($ogcRequest);
        }
        if ($request == 'GETPRINT') {
            return $this->GetPrint($ogcRequest);
        }
        if ($request == 'GETPRINTATLAS') {
            return $this->GetPrintAtlas($ogcRequest);
        }
        if ($request == 'GETSTYLES') {
            return $this->GetStyles($ogcRequest);
        }
        if ($request == 'GETMAP') {
            return $this->GetMap($ogcRequest);
        }
        if ($request == 'GETFEATURE') {
            return $this->GetFeature($ogcRequest);
        }
        if ($request == 'DESCRIBEFEATURETYPE') {
            return $this->DescribeFeatureType($ogcRequest);
        }
        if ($request == 'GETTILE') {
            return $this->GetTile($ogcRequest);
        }

        jMessage::add('Request '.$request.' is not supported', 'OperationNotSupported');

        return $this->serviceException();
    }

    /**
     * construct the response to a CORS preflights request.
     *
     * This kind of requests are made by browsers before fetching a resource
     *
     * @return jResponseText
     *
     * @see https://fetch.spec.whatwg.org/#http-cors-protocol
     */
    protected function processOptionsRequests()
    {
        /** @var jResponseText $resp */
        $resp = $this->getResponse('text');
        if ($this->request->header('Origin')) {
            $resp->addHttpHeader('Access-Control-Allow-Methods', 'GET,POST');
            $resp->addHttpHeader('Access-Control-Request-Headers', $this->request->header('Access-Control-Request-Headers'));
            $resp->addHttpHeader('Access-Control-Allow-Credentials', 'true');
            $resp->addHttpHeader('Access-Control-Max-Age', '3600');
            if ($this->getServiceParameters(true)) {
                $this->setACAOHeader($resp);
            }
        }

        return $resp;
    }

    /**
     * Get a request parameter
     * whatever its case
     * and returns its value.
     *
     * @param string $param request parameter
     *
     * @return null|string request parameter value
     */
    protected function iParam($param)
    {
        $pParams = jApp::coord()->request->params;
        foreach ($pParams as $k => $v) {
            if (strtolower($k) == strtolower($param)) {
                return $v;
            }
        }

        return null;
    }

    /**
     * Check if cache can be used because it is impossible
     * to use cache on other request type that GET or HEAD.
     *
     * @return bool
     */
    protected function canBeCached()
    {
        if ($this->respCanBeCached === null) {
            $this->respCanBeCached = in_array($_SERVER['REQUEST_METHOD'], array('GET', 'HEAD'));
        }

        return $this->respCanBeCached;
    }

    /**
     * @param jResponse $resp
     * @param string    $etag
     *
     * @return jResponse the response updated
     */
    protected function setEtagCacheHeaders($resp, $etag)
    {
        if ($this->canBeCached()) {
            $resp->addHttpHeader('ETag', $etag);
            $resp->addHttpHeader('Cache-Control', 'no-cache');
        }

        return $resp;
    }

    /**
     * Set CORS headers on the response to allow an application other than Lizmap
     * to access to the services.
     *
     * Authorized application are sets into repository properties
     *
     * @param jResponse $resp
     */
    protected function setACAOHeader($resp)
    {
        // The repository does not exists or the request header does not contains Origin
        if (!$this->repository || !$this->request->header('Origin')) {
            return;
        }
        $referer = $this->request->header('Referer');
        $header = $this->repository->getACAOHeaderValue($referer);
        if ($header != '') {
            $resp->addHttpHeader('Access-Control-Allow-Origin', $header);
            $resp->addHttpHeader('Vary', 'origin');
            $resp->addHttpHeader('Access-Control-Allow-Credentials', 'true');
            $resp->addHttpHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

            $requestHeaders = $this->request->header('Access-Control-Request-Headers');
            if ($requestHeaders) {
                $resp->addHttpHeader('Access-Control-Allow-Headers', $requestHeaders);
            }
        }
    }

    /**
     * Send an OGC service Exception.
     *
     * @return jResponseXml XML OGC Service Exception
     */
    protected function serviceException()
    {
        $messages = jMessage::getAll();
        if (!$messages) {
            $messages = array();
        }

        /** @var jResponseXml $rep */
        $rep = $this->getResponse('xml');
        $rep->contentTpl = 'lizmap~wms_exception';
        $rep->content->assign('messages', $messages);
        jMessage::clearAll();

        foreach ($messages as $code => $msg) {
            if ($code == 'AuthorizationRequired') {

                // 401 : AuthorizationRequired
                $rep->setHttpStatus(401, Proxy::getHttpStatusMsg(401));

                // Add WWW-Authenticate header only for external clients
                // To avoid web browser to ask for login/password when session expires
                // In browser, Lizmap UI sends full service URL in referer
                $addwww = false;
                $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
                if (!empty($referer)) {
                    $referer_parse = parse_url($referer);
                    if (array_key_exists('host', $referer_parse)) {
                        $referer_domain = $referer_parse['host'];
                        $domain = jApp::coord()->request->getDomainName();
                        if (!empty($domain) and $referer_domain != $domain) {
                            $addwww = true;
                        }
                    }
                } else {
                    $addwww = true;
                }
                // Add WWW-Authenticate header
                if ($addwww) {
                    $rep->addHttpHeader('WWW-Authenticate', 'Basic realm="LizmapWebClient", charset="UTF-8"');
                }
            } elseif ($code == 'Forbidden') {
                $rep->setHttpStatus(403, Proxy::getHttpStatusMsg(403));
            } elseif ($code == 'ProjectNotDefined'
                      || $code == 'RepositoryNotDefined') {
                $rep->setHttpStatus(404, Proxy::getHttpStatusMsg(404));
            } elseif ($code === 'OperationNotSupported'
                      || $code === 'ServiceNotSupported') {
                $rep->setHttpStatus(501, Proxy::getHttpStatusMsg(501));
            }
        }

        $this->setACAOHeader($rep);

        return $rep;
    }

    /**
     * Build an Etag based on a key and the project (key, repository key, file time and config file time)
     * and optionally the user.
     *
     * @param string $key  The first element of the Etag
     * @param bool   $user Use the user to build the Etag
     *
     * @return string the build Etag
     */
    protected function buildEtag($key, $user = true)
    {
        $etag = $key.'-'.$this->repository->getKey().'~'.$this->project->getKey();
        if ($user) {
            $appContext = $this->project->getAppContext();
            if ($appContext->UserIsConnected()) {
                $etag .= '-'.implode('~', $appContext->aclUserPublicGroupsId());
            } else {
                $etag .= '-__anonymous';
            }
        }
        $cacheHandler = $this->project->getCacheHandler();
        $etag .= '-'.$cacheHandler->getFileTime().'~'.$cacheHandler->getCfgFileTime();

        return base_convert(strlen($etag), 10, 16).'-'.sha1($etag);
    }

    /**
     * @param jResponseBinary $rep
     * @param mixed           $ogcResult
     * @param mixed           $filename
     * @param mixed           $eTag
     */
    protected function setupBinaryResponse($rep, $ogcResult, $filename, $eTag = '')
    {
        $rep->setHttpStatus($ogcResult->code, Proxy::getHttpStatusMsg($ogcResult->code));
        $rep->mimeType = $ogcResult->mime;
        if (is_string($ogcResult->data) || is_callable($ogcResult->data)) {
            $rep->content = $ogcResult->data;
        }
        $rep->doDownload = false;
        $rep->outputFileName = $filename;
        if ($eTag !== '' && $ogcResult->code < 400) {
            $this->setEtagCacheHeaders($rep, $eTag);
        }
        $this->setACAOHeader($rep);
    }

    /**
     * Read parameters and set classes for the project and repository given.
     *
     * @param bool $forOptionsMethodOnly set it to true for HTTP request with OPTIONS method
     *                                   so it will load only the required resources
     *
     * @return bool false if some request parameters are missing
     */
    protected function getServiceParameters($forOptionsMethodOnly = false)
    {

        // Get the project
        $project = $this->iParam('project');

        if (!$project) {
            jMessage::add('The parameter project is mandatory !', 'ProjectNotDefined');

            return false;
        }

        // Get repository data
        $repository = $this->iParam('repository');
        if (!$repository) {
            jMessage::add('The repository parameter is missing', 'RepositoryNotDefined');

            return false;
        }

        // Get the corresponding repository
        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');

            return false;
        }

        // Define first class private properties
        // because the repository exists
        $this->services = lizmap::getServices();
        $this->repository = $lrep;

        if ($forOptionsMethodOnly) {
            return true;
        }

        // Get the project object
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return false;
            }
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return false;
        }

        // Define the project class private property
        // because the project exists
        $this->project = $lproj;

        // Redirect if no rights to access this repository
        if (!$lproj->checkAcl()) {
            jMessage::add(jLocale::get('view~default.service.access.denied'), 'AuthorizationRequired');

            return false;
        }

        // Get and normalize the passed parameters
        $pParams = jApp::coord()->request->params;
        $pParams['map'] = $lproj->getRelativeQgisPath();
        $params = Proxy::normalizeParams($pParams);

        // Check WFS rights
        if (isset($params['service']) && strtolower($params['service']) === 'wfs'
            && !$lproj->getAppContext()->aclCheck('lizmap.tools.layer.export', $this->repository->getKey())) {
            $request_headers = jApp::coord()->request->headers();
            if (!isset($_SESSION['html_map_token'])
                || $_SESSION['html_map_token'] !== md5(json_encode(array(
                    'Host' => $request_headers['Host'],
                    'User-Agent' => $request_headers['User-Agent'],
                )))) {
                jMessage::add(jLocale::get('view~default.service.access.forbidden'), 'Forbidden');

                return false;
            }
        }

        // Define parameters class private property
        $this->params = $params;

        // Get the optional filter token
        if (isset($params['filtertoken'], $params['request'])
            && in_array(strtolower($params['request']), array('getmap', 'getfeature', 'getprint', 'getfeatureinfo'))
        ) {
            $tokens = $params['filtertoken'];
            $tokens = explode(';', $tokens);
            $filters = array();
            foreach ($tokens as $token) {
                $data = jCache::get($token);
                if ($data) {
                    $data = json_decode($data);
                    if (
                        property_exists($data, 'filter')
                        and trim($data->filter) != ''
                    ) {
                        $filters[] = $data->filter;
                    }
                }
            }
            if (count($filters) > 0) {
                $this->params['filter'] = implode(';', $filters);
            }
        }

        // Get the selection token
        // For WMS, create the content for the SELECTION parameter
        // For WFS, create it for the FEATUREID parameter
        if (isset($params['request'])) {
            $request = strtolower($params['request']);
            if (isset($params['selectiontoken'])
                && in_array($request, array('getmap', 'getfeature', 'getprint'))
            ) {
                $tokens = $params['selectiontoken'];
                $tokens = explode(';', $tokens);
                $selections = array();
                $feature_ids = array();
                foreach ($tokens as $token) {
                    $data = jCache::get($token);
                    if ($data) {
                        $data = json_decode($data);
                        if (property_exists($data, 'typename')
                            && property_exists($data, 'ids')
                            && count($data->ids) > 0
                        ) {
                            $layerName = $data->typename;
                            // For WMS, use the layer name in the SELECTION parameter
                            $selections[] = $layerName.':'.implode(',', $data->ids);

                            // For WFS we use feature ids in the FEATUREID parameter
                            if ($request == 'getfeature') {
                                // For WFS, the typename is not the layer name
                                // We need to get the layer from the project
                                $layer = $this->project->findLayerByAnyName($layerName);
                                $layerId = $layer->id;
                                $qgisLayer = $this->project->getLayer($layerId);
                                $typename = $qgisLayer->getWfsTypeName();
                                $data_ids = array();
                                foreach ($data->ids as $id) {
                                    $data_ids[] = $typename.'.'.$id;
                                }
                                $feature_ids[] = implode(',', $data_ids);
                            }
                        }
                    }
                }
                // Add SELECTION for WMS
                if ($request != 'getfeature' && count($selections) > 0) {
                    $this->params['SELECTION'] = implode(';', $selections);
                }
                // Add FEATUREID for WFS GetFeature
                if ($request == 'getfeature' && count($feature_ids) > 0) {
                    $this->params['FEATUREID'] = implode(',', $feature_ids);
                }
            }
        }

        return true;
    }

    /**
     * GetCapabilities.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory.
     *
     * @param WFSRequest|WMSRequest|WMTSRequest $ogcRequest
     *
     * @return jResponseBinary JSON configuration file for the specified project
     */
    protected function GetCapabilities($ogcRequest)
    {
        $service = $ogcRequest->param('service');
        $version = $ogcRequest->param('version');

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');

        // Etag header and cache control
        $etag = $this->buildEtag('GetCapabilities~'.strtolower($service).($version ? '~'.$version : ''));
        if ($this->canBeCached() && $rep->isValidCache(null, $etag)) {
            $this->setACAOHeader($rep);

            return $rep;
        }

        $result = $ogcRequest->process();
        $filename = 'qgis_server_'.$service.'_capabilities_'.$this->repository->getKey().'_'.$this->project->getKey();

        $this->setupBinaryResponse($rep, $result, $filename, $etag);

        return $rep;
    }

    /**
     * GetContext.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory.
     *
     * @param WMSRequest $wmsRequest
     *
     * @return jResponseBinary text/xml Web Map Context
     */
    protected function GetContext($wmsRequest)
    {
        $result = $wmsRequest->process();

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $this->setupBinaryResponse($rep, $result, 'qgis_server_getContext');

        return $rep;
    }

    /**
     * GetSchemaExtension.
     *
     * @urlparam string $SERVICE mandatory, has to be WMS
     * @urlparam string $REQUEST mandatory, has to be GetSchemaExtension
     *
     * @param WMSRequest $wmsRequest
     *
     * @return jResponseBinary text/xml the WMS GetSchemaExtension 1.3.0 Schema Extension.
     */
    protected function GetSchemaExtension($wmsRequest)
    {
        $result = $wmsRequest->process();

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $this->setupBinaryResponse($rep, $result, 'qgis_server_schema_extension');

        return $rep;
    }

    /**
     * GetMap.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @param WMSRequest $wmsRequest
     *
     * @return jResponseBinary|jResponseXml image rendered by the Map Server or Service Exception
     */
    protected function GetMap($wmsRequest)
    {
        $result = $wmsRequest->process();
        if ($result->data == 'error') {
            return $this->serviceException();
        }

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $filename = 'qgis_server_wms_map_'.$this->repository->getKey().'_'.$this->project->getKey();
        $this->setupBinaryResponse($rep, $result, $filename);

        if (!preg_match('/^image/', $result->mime)) {
            return $rep;
        }

        // HTTP browser cache expiration time
        $layername = $this->params['layers'];
        $lproj = $this->project;
        $configLayer = $lproj->findLayerByAnyName($layername);
        if ($configLayer && property_exists($configLayer, 'clientCacheExpiration')) {
            $clientCacheExpiration = (int) $configLayer->clientCacheExpiration;
            $rep->setExpires('+'.$clientCacheExpiration.' seconds');
        }

        lizmap::logMetric('LIZMAP_SERVICE_GETMAP', 'WMS', array(
            'qgisParams' => $wmsRequest->parameters(),
            'qgisResponseCode' => $result->code,
        ));

        return $rep;
    }

    /**
     * GetLegendGraphics.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @param WMSRequest $wmsRequest
     *
     * @return jResponseBinary Image of the legend for 1 to n layers, returned by the Map Server
     */
    protected function GetLegendGraphics($wmsRequest)
    {
        $result = $wmsRequest->process();

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $this->setupBinaryResponse($rep, $result, 'qgis_server_legend');

        return $rep;
    }

    /**
     * GetFeatureInfo.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @param WMSRequest $wmsRequest
     *
     * @return jResponseBinary feature Info
     */
    protected function GetFeatureInfo($wmsRequest)
    {
        $result = $wmsRequest->process();

        // Log
        $eventParams = array(
            'key' => 'popup',
            'content' => '',
            'repository' => $this->repository->getKey(),
            'project' => $this->project->getKey(),
        );
        jEvent::notify('LizLogItem', $eventParams);

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $this->setupBinaryResponse($rep, $result, 'getFeatureInfo');

        return $rep;
    }

    /**
     * GetPrint.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @param WMSRequest $wmsRequest
     *
     * @return jResponseBinary image rendered by the Map Server
     */
    protected function GetPrint($wmsRequest)
    {
        $result = $wmsRequest->process();

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $fileName = $this->project->getKey().'_'.preg_replace('#[\W]+#', '_', $this->params['template']).'.'.$this->params['format'];
        $this->setupBinaryResponse($rep, $result, $fileName);
        $rep->doDownload = true;

        // Log
        $logContent = '<a href="'.jUrl::get('lizmap~service:index', jApp::coord()->request->params).'" target="_blank">'.$this->params['template'].'<a>';
        $eventParams = array(
            'key' => 'print',
            'content' => $logContent,
            'repository' => $this->repository->getKey(),
            'project' => $this->project->getKey(),
        );
        jEvent::notify('LizLogItem', $eventParams);

        return $rep;
    }

    /**
     * GetPrintAtlas.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @param WMSRequest $wmsRequest
     *
     * @return jResponseBinary image rendered by the Map Server
     */
    protected function GetPrintAtlas($wmsRequest)
    {
        $result = $wmsRequest->process();

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $fileName = $this->project->getKey().'_'.preg_replace('#[\W]+#', '_', $this->params['template']).'.'.$this->params['format'];
        $this->setupBinaryResponse($rep, $result, $fileName);
        $rep->doDownload = true;

        // Log
        $logContent = '
     <a href="'.jUrl::get('lizmap~service:index', jApp::coord()->request->params).'" target="_blank">'.$this->params['template'].'<a>
     ';
        $eventParams = array(
            'key' => 'print',
            'content' => $logContent,
            'repository' => $this->repository->getKey(),
            'project' => $this->project->getKey(),
        );
        jEvent::notify('LizLogItem', $eventParams);

        return $rep;
    }

    /**
     * GetStyles.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @param WMSRequest $wmsRequest
     *
     * @return jResponseBinary SLD Style XML
     */
    protected function GetStyles($wmsRequest)
    {
        $result = $wmsRequest->process();

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $this->setupBinaryResponse($rep, $result, 'qgis_style');

        return $rep;
    }

    /**
     * Send the JSON configuration file for a specified project.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     *
     * @return jResponseJson|jResponseText|jResponseXml JSON configuration file for the specified project or Service Exception
     */
    public function getProjectConfig()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return $this->processOptionsRequests();
        }

        // Get and Check parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Etag header and cache control
        $etag = $this->buildEtag('GetProjectConfig');
        if ($this->canBeCached() && $rep->isValidCache(null, $etag)) {
            $this->setACAOHeader($rep);

            return $rep;
        }

        // Set body
        $rep->data = $this->project->getUpdatedConfig();
        $this->setEtagCacheHeaders($rep, $etag);
        $this->setACAOHeader($rep);

        return $rep;
    }

    /**
     * Send the key/value JSON configuration file for a specified project.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     *
     * @return jResponseJson|jResponseText|jResponseXml key/value JSON configuration file for the specified project or Service Exception
     */
    public function getKeyValueConfig()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return $this->processOptionsRequests();
        }

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Etag header and cache control
        $etag = $this->buildEtag('GetKeyValueConfig');
        if ($this->canBeCached() && $rep->isValidCache(null, $etag)) {
            $this->setACAOHeader($rep);

            return $rep;
        }

        $rep->data = $this->project->getLayersLabeledFieldsConfig();
        $this->setEtagCacheHeaders($rep, $etag);
        $this->setACAOHeader($rep);

        return $rep;
    }

    /**
     * GetFeature.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @param WFSRequest $wfsRequest
     *
     * @return jResponseBinary WFS GetFeature response
     */
    protected function GetFeature($wfsRequest)
    {
        $result = $wfsRequest->process();

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $this->setupBinaryResponse($rep, $result, 'qgis_server_wfs');

        if ($result->code >= 400) {
            $rep->content = $result->getBodyAsString();

            return $rep;
        }

        // Define file name
        $outputFileName = 'qgis_server_wfs';
        $typenames = implode('_', array_map('trim', explode(',', $wfsRequest->requestedTypename())));
        $zipped_files = array('shp', 'mif', 'tab');
        $outputformat = 'gml2';
        if (isset($this->params['outputformat'])) {
            $outputformat = strtolower($this->params['outputformat']);
        }
        if (in_array($outputformat, $zipped_files)) {
            $outputFileName = $typenames.'.zip';
        } else {
            $outputFileName = $typenames.'.'.$outputformat;
        }

        // Export
        $doDownload = false;
        $dl = $this->param('dl');
        if ($dl) {
            // force download
            $doDownload = true;

            // Change file name
            if (in_array($outputformat, $zipped_files)) {
                $outputFileName = 'export_'.$this->params['typename'].'.zip';
            } else {
                $outputFileName = 'export_'.$this->params['typename'].'.'.$outputformat;
            }
        }
        $rep->outputFileName = $outputFileName;
        $rep->doDownload = $doDownload;

        $rep->setContentCallback(function () use ($result) {
            $output = Psr7Utils::streamFor(fopen('php://output', 'w+'));
            Psr7Utils::copyToStream($result->getBodyAsStream(), $output);
        });

        return $rep;
    }

    /**
     * DescribeFeatureType.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @param WFSRequest $wfsRequest
     *
     * @return jResponseBinary JSON content
     */
    protected function DescribeFeatureType($wfsRequest)
    {
        $result = $wfsRequest->process();

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $this->setupBinaryResponse($rep, $result, 'qgis_server_wfs');

        return $rep;
    }

    /**
     * GetProj4.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     * @urlparam string $authid SRS or CRS authid like USER:*
     *
     * @return jResponseText|jResponseXml
     */
    protected function GetProj4()
    {
        /** @var jResponseText $rep */
        $rep = $this->getResponse('text');
        $this->setACAOHeader($rep);

        // Projection authority id (ESPG:* or USER:*)
        $authid = $this->iParam('authid');

        // Etag header and cache control
        $etag = $this->buildEtag('GetProj4-'.$authid, false);
        if ($this->canBeCached() && $rep->isValidCache(null, $etag)) {
            return $rep;
        }

        // Get content
        $content = $this->project->getProj4($authid);
        if (!$content) {
            $rep->setHttpStatus(404, Proxy::getHttpStatusMsg(404));
        }
        $rep->content = $content;
        $rep->setExpires('+300 seconds');
        $this->setEtagCacheHeaders($rep, $etag);

        return $rep;
    }

    /**
     * @param WMTSRequest $wmtsRequest
     *
     * @return jResponseBinary
     */
    protected function GetTile($wmtsRequest)
    {
        $result = $wmtsRequest->process();

        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $filename = 'qgis_server_wmts_tile_'.$this->repository->getKey().'_'.$this->project->getKey();
        $this->setupBinaryResponse($rep, $result, $filename);

        if (!preg_match('/^image/', $result->mime)) {
            return $rep;
        }

        // HTTP browser cache expiration time
        $layername = $this->params['layer'];
        $lproj = $this->project;
        $configLayers = $lproj->getLayers();
        if (property_exists($configLayers, $layername)) {
            $configLayer = $configLayers->{$layername};
            if (property_exists($configLayer, 'clientCacheExpiration')) {
                $clientCacheExpiration = (int) $configLayer->clientCacheExpiration;
                $rep->setExpires('+'.$clientCacheExpiration.' seconds');
            }
        }

        lizmap::logMetric('LIZMAP_SERVICE_GETMAP', 'WMS', array(
            'qgisParams' => $wmtsRequest->parameters(),
            'qgisResponseCode' => $result->code,
        ));

        return $rep;
    }

    /**
     * @param string $repository
     * @param string $project
     * @param string $typename
     * @param string $ids
     *
     * @return array
     */
    private function _getSelectionToken($repository, $project, $typename, $ids)
    {
        $token = md5($repository.$project.$typename.implode(',', $ids));

        $data = jCache::get($token);
        $incache = true;
        if (!$data) {
            $data = array();
            $data['token'] = $token;
            $data['typename'] = $typename;
            $data['ids'] = $ids;
            $incache = false;
            jCache::set($token, json_encode($data), 3600);
        } else {
            $data = json_decode($data, true);
        }

        return $data;
    }

    /**
     * @return jResponseJson|jResponseXml
     */
    protected function getSelectionToken()
    {
        // Prepare response
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $this->setACAOHeader($rep);

        // Get params
        $typename = $this->params['typename'];
        $ids = preg_split('/\s*,\s*/', $this->params['ids']);
        sort($ids);

        // Token
        $data = $this->_getSelectionToken($this->iParam('repository'), $this->iParam('project'), $typename, $ids);
        if ($this->canBeCached() && $rep->isValidCache(null, $data['token'])) {
            return $rep;
        }

        $json = array();
        $json['token'] = $data['token'];

        $rep->data = $json;
        $this->setEtagCacheHeaders($rep, $data['token']);

        return $rep;
    }

    /**
     * @param string $repository
     * @param string $project
     * @param string $typename
     * @param string $filter
     *
     * @return array
     */
    private function _getFilterToken($repository, $project, $typename, $filter)
    {
        $token = md5($repository.$project.$typename.$filter);

        $data = jCache::get($token);
        if (!$data) {
            $data = array();
            $data['token'] = $token;
            $data['typename'] = $typename;
            $data['filter'] = $filter;
            jCache::set($token, json_encode($data), 3600);
        } else {
            $data = json_decode($data, true);
        }

        return $data;
    }

    protected function getFilterToken()
    {
        // Prepare response
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $this->setACAOHeader($rep);

        // Get params
        $typename = $this->params['typename'];
        $filter = $this->params['filter'];

        // Token
        $data = $this->_getFilterToken($this->iParam('repository'), $this->iParam('project'), $typename, $filter);
        if ($this->canBeCached() && $rep->isValidCache(null, $data['token'])) {
            return $rep;
        }

        $json = array();
        $json['token'] = $data['token'];

        $rep->data = $json;
        $this->setEtagCacheHeaders($rep, $data['token']);

        return $rep;
    }
}
