<?php

use GuzzleHttp\Psr7\Utils as Psr7Utils;
use Lizmap\App\Checker;
use Lizmap\App\ControllerTools;
use Lizmap\Project\Project;

use Lizmap\Project\Repository;
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
     * @var null|Repository
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

        // Optional BASIC authentication
        $ok = Checker::checkCredentials($_SERVER);
        if (!$ok) {
            jMessage::add(
                jLocale::get('view~default.service.access.wrong_credentials.title'),
                'AuthorizationRequired'
            );

            return $this->serviceException();
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
            $resp->addHttpHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
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
                $addHeader = !ControllerTools::clientIsABrowser();
                // Add WWW-Authenticate header
                if ($addHeader) {
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
        // Check DXF export rights if FORMAT is application/dxf
        if (isset($this->params['format']) && strtolower($this->params['format']) === 'application/dxf') {
            // Check if DXF export is enabled
            $dxfExportEnabled = $this->project->getOption('dxfExportEnabled');
            // Handle both boolean (from use_proper_boolean) and string 'True'/'true'
            $isDxfEnabled = is_bool($dxfExportEnabled) ? $dxfExportEnabled : (strtolower($dxfExportEnabled) === 'true');

            if (!$isDxfEnabled) {
                jMessage::add('DXF export is not enabled for this project', 'Forbidden');

                return $this->serviceException();
            }

            // Check if user has access based on allowedGroups
            $allowedGroups = $this->project->getOption('allowedGroups');
            if ($allowedGroups && trim($allowedGroups) !== '') {
                $userGroups = $this->project->getAppContext()->aclUserGroupsId();
                $exportGroups = array_map('trim', explode(',', $allowedGroups));
                $hasAccess = (bool) array_intersect($exportGroups, $userGroups);

                if (!$hasAccess) {
                    jMessage::add('You do not have permission to export DXF from this project', 'Forbidden');

                    return $this->serviceException();
                }
            }
        }

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
        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        // Etag header and cache control
        $etag = 'GetLegendGraphic-'.$wmsRequest->param('layer', $wmsRequest->param('layers', ''));
        $etag = $this->buildEtag($etag);
        $respCanBeCached = $this->canBeCached();
        if ($respCanBeCached && $rep->isValidCache(null, $etag)) {
            $this->setACAOHeader($rep);

            return $rep;
        }

        $result = $wmsRequest->process();
        $this->setupBinaryResponse($rep, $result, 'qgis_server_legend');

        if ($respCanBeCached) {
            $this->setEtagCacheHeaders($rep, $etag);
            $this->setACAOHeader($rep);
        }

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
     * Generate atlas filename from QGIS project configuration for single feature requests.
     *
     * @param string $template  The print template name
     * @param string $expFilter The expression filter (e.g., "$id IN (123)")
     * @param string $layerName The layer name
     * @param string $format    The output format (e.g., "pdf")
     *
     * @return null|string The generated filename or null if cannot generate
     */
    protected function generateAtlasFilename($template, $expFilter, $layerName, $format)
    {
        error_log('=== generateAtlasFilename START ===');
        error_log("Template: {$template}, Layer: {$layerName}, Format: {$format}");
        error_log("EXP_FILTER: {$expFilter}");

        // Check if this is a single feature request by parsing EXP_FILTER
        // Expected format: $id IN (123) or $id IN (123, 456, 789)
        if (!preg_match('/\$id\s+IN\s*\(([^)]+)\)/i', $expFilter, $matches)) {
            error_log('Failed: EXP_FILTER does not match expected pattern');

            return null; // Not a valid $id IN (...) filter
        }

        // Extract feature IDs
        $idsString = $matches[1];
        $ids = array_map('trim', explode(',', $idsString));
        error_log('Extracted IDs: '.print_r($ids, true));

        // Only process single feature requests
        if (count($ids) !== 1) {
            error_log('Failed: Multiple features detected ('.count($ids).'), using fallback');

            return null; // Multiple features, use fallback
        }

        $featureId = $ids[0];
        error_log("Single feature ID: {$featureId}");

        // Get atlas configuration from QGIS project file
        try {
            $qgisPath = $this->project->getQgisPath();
            error_log("QGIS project path: {$qgisPath}");

            if (!file_exists($qgisPath)) {
                error_log("Failed: QGIS project file does not exist at {$qgisPath}");

                return null;
            }

            $xmlContent = file_get_contents($qgisPath);
            $xml = simplexml_load_string($xmlContent);

            if (!$xml) {
                error_log('Failed: Could not parse QGIS project XML');

                return null;
            }
            error_log('Got QGIS project XML');
        } catch (Exception $e) {
            error_log('Exception reading QGIS project: '.$e->getMessage());

            return null;
        }

        // Find the Layout (print template) with the given name
        $layouts = $xml->xpath("//Layout[@name='{$template}']");
        error_log('Found '.count($layouts)." layout(s) with name '{$template}'");
        if (empty($layouts)) {
            error_log('Failed: No layout found with that name');

            return null;
        }

        $layout = $layouts[0];

        // Get atlas configuration from the layout
        $atlasElements = $layout->xpath('.//Atlas');
        error_log('Found '.count($atlasElements).' atlas element(s) in layout');
        if (empty($atlasElements)) {
            error_log('Failed: No atlas configuration found in layout');

            return null;
        }

        $atlas = $atlasElements[0];
        error_log('Atlas attributes: '.print_r($atlas->attributes(), true));

        // Check if atlas is enabled
        if (!isset($atlas['enabled']) || ($atlas['enabled'] != '1' && $atlas['enabled'] !== true)) {
            error_log('Failed: Atlas is not enabled');

            return null;
        }

        // Get filename pattern and page name expression
        $filenamePattern = isset($atlas['filenamePattern']) ? (string) $atlas['filenamePattern'] : null;
        $pageNameExpression = isset($atlas['pageNameExpression']) ? (string) $atlas['pageNameExpression'] : null;

        error_log('filenamePattern: '.($filenamePattern ?: 'NULL'));
        error_log('pageNameExpression: '.($pageNameExpression ?: 'NULL'));

        if (!$filenamePattern || !$pageNameExpression) {
            error_log('Failed: Missing filenamePattern or pageNameExpression');

            return null;
        }

        // Get the coverage layer ID from atlas config and use it to get layer config
        $coverageLayerId = isset($atlas['coverageLayer']) ? (string) $atlas['coverageLayer'] : null;
        $coverageLayerName = isset($atlas['coverageLayerName']) ? (string) $atlas['coverageLayerName'] : null;

        error_log('Coverage Layer ID: '.($coverageLayerId ?: 'NULL'));
        error_log('Coverage Layer Name: '.($coverageLayerName ?: 'NULL'));

        if (!$coverageLayerId) {
            error_log('Failed: No coverageLayer in atlas config');

            return null;
        }

        // Get the layer config using the coverage layer ID from atlas
        $layerConfig = $this->project->getLayer($coverageLayerId);
        if (!$layerConfig) {
            error_log("Failed: Layer config not found for coverage layer ID '{$coverageLayerId}'");

            return null;
        }
        error_log('Got layer config from coverage layer ID');

        // Fetch feature data via WFS to get the attribute value
        try {
            // Use the built-in method to get the WFS typename
            // This will use shortname if available (e.g., "Flurstucke"), otherwise name
            /** @var qgisVectorLayer $layerConfig */
            $typename = $layerConfig->getWfsTypeName();
            error_log("WFS typename from getWfsTypeName(): {$typename}");

            // FEATUREID format must be typename.id for WFS
            $wfsFeatureId = $typename.'.'.$featureId;
            error_log("WFS FeatureID: {$wfsFeatureId}");

            $wfsParams = array(
                'SERVICE' => 'WFS',
                'VERSION' => '1.0.0',
                'REQUEST' => 'GetFeature',
                'TYPENAME' => $typename,
                'OUTPUTFORMAT' => 'GeoJSON',
                'FEATUREID' => $wfsFeatureId,
            );

            error_log('WFS request params: '.print_r($wfsParams, true));

            $wfsRequest = new WFSRequest(
                $this->project,
                $wfsParams,
                lizmap::getServices()
            );

            $wfsResult = $wfsRequest->process();
            $geojsonString = $wfsResult->getBodyAsString();
            error_log('WFS response length: '.strlen($geojsonString));

            $geojson = json_decode($geojsonString, true);

            if (!$geojson || !isset($geojson['features']) || count($geojson['features']) === 0) {
                error_log('Failed: No features returned from WFS');
                error_log('GeoJSON response: '.substr($geojsonString, 0, 500));

                return null;
            }

            error_log('Got '.count($geojson['features']).' feature(s) from WFS');

            $feature = $geojson['features'][0];
            $properties = $feature['properties'];
            error_log('Feature properties: '.print_r(array_keys($properties), true));

            // Clean up the page name expression (remove quotes)
            $pageNameField = str_replace('"', '', $pageNameExpression);
            error_log("Looking for field: '{$pageNameField}'");

            if (!isset($properties[$pageNameField])) {
                error_log("Failed: Field '{$pageNameField}' not found in feature properties");
                error_log('Available fields: '.implode(', ', array_keys($properties)));

                return null;
            }

            $pageNameValue = $properties[$pageNameField];
            error_log("Page name value: '{$pageNameValue}'");

            // Evaluate the filename pattern
            // Replace @atlas_pagename with the actual value
            $evaluatedFilename = $this->evaluateAtlasFilenamePattern($filenamePattern, $pageNameValue);
            error_log("Evaluated filename: '{$evaluatedFilename}'");

            if ($evaluatedFilename) {
                // Ensure it has the correct extension
                if (!preg_match('/\.'.preg_quote($format, '/').'$/i', $evaluatedFilename)) {
                    $evaluatedFilename .= '.'.$format;
                }

                error_log("Final filename: '{$evaluatedFilename}'");
                error_log('=== generateAtlasFilename SUCCESS ===');

                return $evaluatedFilename;
            }
        } catch (Exception $e) {
            // If anything fails, return null to use fallback
            error_log('Exception in generateAtlasFilename: '.$e->getMessage());
            error_log('Stack trace: '.$e->getTraceAsString());

            return null;
        }

        error_log('Failed: Reached end of function without generating filename');

        return null;
    }

    /**
     * Evaluate atlas filename pattern with feature data.
     *
     * @param string $pattern  The filename pattern (e.g., "'Flstk_'||replace(@atlas_pagename ,'/','-')")
     * @param string $pageName The page name value from the feature
     *
     * @return null|string The evaluated filename or null if cannot evaluate
     */
    protected function evaluateAtlasFilenamePattern($pattern, $pageName)
    {
        // Simple evaluation for common patterns
        // This handles: 'Flstk_'||replace(@atlas_pagename ,'/','-')

        // Replace @atlas_pagename with actual value
        $evaluated = $pattern;

        // Handle replace() function: replace(@atlas_pagename, '/', '-')
        if (preg_match('/replace\s*\(\s*@atlas_pagename\s*,\s*[\'"]([^\'"]*)[\'"],\s*[\'"]([^\'"]*)[\'"].*\)/i', $evaluated, $matches)) {
            $searchStr = $matches[1];
            $replaceStr = $matches[2];
            $replacedValue = str_replace($searchStr, $replaceStr, $pageName);
            $evaluated = preg_replace('/replace\s*\([^)]+\)/i', "'{$replacedValue}'", $evaluated);
        } else {
            // Simple replacement without replace() function
            $evaluated = str_replace('@atlas_pagename', "'{$pageName}'", $evaluated);
        }

        // Handle string concatenation with ||
        $evaluated = preg_replace('/\'\s*\|\|\s*\'/', '', $evaluated);

        // Remove remaining quotes
        $evaluated = str_replace("'", '', $evaluated);

        // Clean up the filename
        $evaluated = trim($evaluated);

        // Sanitize filename - remove/replace unsafe characters
        $evaluated = preg_replace('/[<>:"|?*]/', '_', $evaluated);

        return $evaluated ?: null;
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

        // Try to extract filename from QGIS Server's Content-Disposition header
        // QGIS Server may include the evaluated atlas filename expression
        $fileName = null;
        $headers = $result->getHeaders();

        // Search for Content-Disposition header (case-insensitive)
        $contentDisposition = null;
        foreach ($headers as $headerName => $headerValue) {
            if (strtolower($headerName) === 'content-disposition') {
                // Headers can be arrays in PSR-7 format
                $contentDisposition = is_array($headerValue) ? $headerValue[0] : $headerValue;

                break;
            }
        }

        if ($contentDisposition) {
            // Parse Content-Disposition header to extract filename
            // Format: attachment; filename="evaluated_name.pdf" or filename*=UTF-8''evaluated_name.pdf
            if (preg_match('/filename\*?="?([^";]+)"?/i', $contentDisposition, $matches)) {
                $fileName = urldecode($matches[1]);
                // Clean up UTF-8'' prefix if present (RFC 5987)
                $fileName = preg_replace("/^UTF-8''/i", '', $fileName);
            }
        }

        // If no filename from header, try to generate from atlas configuration for single features
        if (!$fileName && isset($this->params['exp_filter'])) {
            $fileName = $this->generateAtlasFilename(
                $this->params['template'],
                $this->params['exp_filter'],
                $this->params['layer'],
                $this->params['format']
            );
        }

        // Fallback to default naming if still no filename
        if (!$fileName) {
            $fileName = $this->project->getKey().'_'.preg_replace('#[\W]+#', '_', $this->params['template']).'.'.$this->params['format'];
        }

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
