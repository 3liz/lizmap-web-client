<?php
/**
 * Php proxy to access map services.
 *
 * @author    3liz
 * @copyright 2011-2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class serviceCtrl extends jController
{
    /**
     * @var lizmapProject
     */
    protected $project;

    /**
     * @var lizmapRepository
     */
    protected $repository;

    /**
     * @var lizmapServices
     */
    protected $services = '';

    protected $params = array();

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
        lizmap::startMetric();

        if (isset($_SERVER['PHP_AUTH_USER'])) {
            $ok = jAuth::login($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
        }

        $rep = $this->getResponse('redirect');

        // Get the project
        $project = $this->iParam('project');
        if (!$project) {
            // Error message
            jMessage::add('The parameter project is mandatory !', 'ProjectNotDefined');

            return $this->serviceException();
        }

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        // Return the appropriate action
        $service = strtoupper($this->iParam('SERVICE'));
        $request = strtoupper($this->iParam('REQUEST'));

        if ($request == 'GETCAPABILITIES') {
            return $this->GetCapabilities();
        }
        if ($request == 'GETCONTEXT') {
            return $this->GetContext();
        }
        if ($request == 'GETSCHEMAEXTENSION') {
            return $this->GetSchemaExtension();
        }
        if ($request == 'GETLEGENDGRAPHICS') {
            return $this->GetLegendGraphics();
        }
        if ($request == 'GETLEGENDGRAPHIC') {
            return $this->GetLegendGraphics();
        }
        if ($request == 'GETFEATUREINFO') {
            return $this->GetFeatureInfo();
        }
        if ($request == 'GETPRINT') {
            return $this->GetPrint();
        }
        if ($request == 'GETPRINTATLAS') {
            return $this->GetPrintAtlas();
        }
        if ($request == 'GETSTYLES') {
            return $this->GetStyles();
        }
        if ($request == 'GETMAP') {
            return $this->GetMap();
        }
        if ($request == 'GETFEATURE') {
            return $this->GetFeature();
        }
        if ($request == 'DESCRIBEFEATURETYPE') {
            return $this->DescribeFeatureType();
        }
        if ($request == 'GETTILE') {
            return $this->GetTile();
        }
        if ($request == 'GETPROJ4') {
            return $this->GetProj4();
        }
        if ($request == 'GETSELECTIONTOKEN') {
            return $this->GetSelectionToken();
        }
        if ($request == 'GETFILTERTOKEN') {
            return $this->GetFilterToken();
        }

        global $HTTP_RAW_POST_DATA;
        if (isset($HTTP_RAW_POST_DATA)) {
            $requestXml = $HTTP_RAW_POST_DATA;
        } else {
            $requestXml = file('php://input');
            $requestXml = implode("\n", $requestXml);
        }
        $xml = simplexml_load_string($requestXml);
        if ($xml == false) {
            if (!$request) {
                jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');
            } else {
                jMessage::add('Request '.$request.' is not supported', 'OperationNotSupported');
            }

            return $this->serviceException();
        }

        return $this->PostRequest($requestXml);
    }

    /**
     * Get a request parameter
     * whatever its case
     * and returns its value.
     *
     * @param string $param request parameter
     *
     * @return string request parameter value
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
                $rep->setHttpStatus(401, $code);

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
            } elseif ($code == 'ProjectNotDefined') {
                $rep->setHttpStatus(404, 'Not Found');
            } elseif ($code == 'RepositoryNotDefined') {
                $rep->setHttpStatus(404, 'Not Found');
            } elseif ($code == 'OperationNotSupported') {
                $rep->setHttpStatus(501, 'Not Implemented');
            }
        }

        return $rep;
    }

    /**
     * Get parameters and set classes for the project and repository given.
     *
     * @return array|false list of needed variables : $params, $lizmapProject, $lizmapRepository
     */
    protected function getServiceParameters()
    {

        // Get the project
        $project = $this->iParam('project');

        if (!$project) {
            jMessage::add('The parameter project is mandatory !', 'ProjectNotDefined');

            return false;
        }

        // Get repository data
        $repository = $this->iParam('repository');

        // Get the corresponding repository
        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');

            return false;
        }
        // Get the project object
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return false;
            }
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return false;
        }

        // Redirect if no rights to access this repository
        if (!$lproj->checkAcl()) {
            jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');

            return false;
        }

        // Get and normalize the passed parameters
        $pParams = jApp::coord()->request->params;
        $pParams['map'] = $lproj->getRelativeQgisPath();
        $params = lizmapProxy::normalizeParams($pParams);

        // Define class private properties
        $this->project = $lproj;
        $this->repository = $lrep;
        $this->services = lizmap::getServices();
        $this->params = $params;

        // Get the optionnal filter token
        if (isset($params['filtertoken'], $params['request'])
             &&
            in_array(strtolower($params['request']), array('getmap', 'getfeature', 'getprint', 'getfeatureinfo'))
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

        // Optionally filter data by login
        if (isset($params['request'])) {
            $request = strtolower($params['request']);
            if (in_array($request, array('getmap', 'getfeatureinfo', 'getfeature', 'getprint', 'getprintatlas')) &&
                !jAcl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey())
            ) {
                $this->filterDataByLogin();
            }
        }

        // Get the selection token
        if (isset($params['selectiontoken']) &&
            in_array($request, array('getmap', 'getfeature', 'getprint'))
        ) {
            $tokens = $params['selectiontoken'];
            $tokens = explode(';', $tokens);
            $selections = array();
            foreach ($tokens as $token) {
                $data = jCache::get($token);
                if ($data) {
                    $data = json_decode($data);
                    if (property_exists($data, 'typename') &&
                        property_exists($data, 'ids') &&
                        count($data->ids) > 0
                    ) {
                        $selections[] = $data->typename.':'.implode(',', $data->ids);
                    }
                }
            }
            if (count($selections) > 0) {
                $this->params['SELECTION'] = implode(';', $selections);
            }
        }

        return true;
    }

    /**
     * Filter data by login if necessary
     * as configured in the plugin for login filtered layers.
     */
    protected function filterDataByLogin()
    {

    // Optionally add a filter parameter
        $lproj = $this->project;

        $request = strtolower($this->params['request']);
        if ($request == 'getfeature') {
            $layers = $this->params['typename'];
        } else {
            if (array_key_exists('layers', $this->params)) {
                $layers = $this->params['layers'];
            } else {
                $layers = array();
            }
        }
        if (is_string($layers)) {
            $layers = explode(',', $layers);
        }
        $pConfig = $lproj->getFullCfg();

        // Filter only if needed
        if ($lproj->hasLoginFilteredLayers() &&
            $pConfig->loginFilteredLayers
        ) {
            // Add client side filter before changing it server side
            $clientExpFilter = null;
            if (array_key_exists('exp_filter', $this->params)) {
                $clientExpFilter = $this->params['exp_filter'];
            }
            $clientFilter = null;
            if (array_key_exists('filter', $this->params)) {
                $clientFilter = $this->params['filter'];
            }

            // Check if a user is authenticated
            $isConnected = jAuth::isConnected();

            // Check need for filter foreach layer
            $serverFilterArray = array();
            foreach ($layers as $layername) {
                $layerByTypeName = $this->project->findLayerByTypeName($layername);
                if ($layerByTypeName) {
                    $layername = $layerByTypeName->name;
                }
                if (property_exists($pConfig->loginFilteredLayers, $layername)) {
                    $oAttribute = $pConfig->loginFilteredLayers->{$layername}->filterAttribute;
                    $attribute = strtolower($oAttribute);

                    if ($isConnected) {
                        $user = jAuth::getUserSession();
                        $login = $user->login;
                        if (property_exists($pConfig->loginFilteredLayers->{$layername}, 'filterPrivate') &&
                            $pConfig->loginFilteredLayers->{$layername}->filterPrivate == 'True'
                        ) {
                            $serverFilterArray[$layername] = "\"${attribute}\" IN ( '".$login."' , 'all' )";
                        } else {
                            $userGroups = jAcl2DbUserGroup::getGroups();
                            $flatGroups = implode("' , '", $userGroups);
                            $serverFilterArray[$layername] = "\"${attribute}\" IN ( '".$flatGroups."' , 'all' )";
                        }
                    } else {
                        // The user is not authenticated: only show data with attribute = 'all'
                        $serverFilterArray[$layername] = "\"${attribute}\" = 'all'";
                    }
                }
            }

            // Set filter if needed
            if (count($serverFilterArray) > 0) {

                // WFS : EXP_FILTER
                if ($request == 'getfeature') {
                    $filter = '';
                    $s = '';
                    if (!empty($clientExpFilter)) {
                        $filter = $clientExpFilter;
                        $s = ' AND ';
                    }
                    if (count($serverFilterArray) > 0) {
                        foreach ($serverFilterArray as $lname => $lfilter) {
                            $filter .= $s.$lfilter;
                            $s = ' AND ';
                        }
                    }
                    $this->params['exp_filter'] = $filter;
                    if (array_key_exists('propertyname', $this->params)) {
                        $propertyName = trim($this->params['propertyname']);
                        if (!empty($propertyName)) {
                            $this->params['propertyname'] .= ",${oAttribute}";
                        }
                    }
                }
                // WMS : FILTER
                else {
                    if (!empty($clientFilter)) {
                        $cfexp = explode(';', $clientFilter);
                        foreach ($cfexp as $a) {
                            $b = explode(':', $a);
                            $lname = trim($b[0]);
                            $lfilter = trim($b[1]);
                            if (array_key_exists($lname, $serverFilterArray)) {
                                $serverFilterArray[$lname] .= ' AND '.$lfilter;
                            } else {
                                $serverFilterArray[$lname] = $lfilter;
                            }
                        }
                    }
                    $filter = '';
                    $s = '';
                    foreach ($serverFilterArray as $lname => $lfilter) {
                        $filter .= $s.$lname.':'.$lfilter;
                        $s = ';';
                    }
                    if (count($serverFilterArray) > 0) {
                        $this->params['filter'] = $filter;
                    }
                }
            }
        }
    }

    /**
     * GetCapabilities.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory.
     *
     * @return jResponseBinary JSON configuration file for the specified project
     */
    protected function GetCapabilities()
    {
        $service = strtolower($this->params['service']);
        $request = null;
        if ($service == 'wms') {
            $version = '1.3.0';
            if (array_key_exists('version', $this->params)) {
                $version = $this->params['version'];
            }
            $request = new lizmapWMSRequest(
                $this->project,
                array(
                    'service' => 'WMS',
                    'request' => 'GetCapabilities',
                    'version' => $version,
                )
            );
        } elseif ($service == 'wfs') {
            $version = '1.0.0';
            if (array_key_exists('version', $this->params)) {
                $version = $this->params['version'];
            }
            $request = new lizmapWFSRequest(
                $this->project,
                array(
                    'service' => 'WFS',
                    'request' => 'GetCapabilities',
                    'version' => $version,
                )
            );
        } elseif ($service == 'wmts') {
            $request = new lizmapWMTSRequest(
                $this->project,
                array(
                    'service' => 'WMTS',
                    'request' => 'GetCapabilities',
                )
            );
        }
        $result = $request->process();

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_server_'.$service.'_capabilities_'.$this->repository->getKey().'_'.$this->project->getKey();

        return $rep;
    }

    /**
     * GetContext.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory.
     *
     * @return jResponseBinary text/xml Web Map Context
     */
    protected function GetContext()
    {

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        $url = $this->services->wmsServerURL.'?';

        $bparams = http_build_query($this->params);
        $querystring = $url.$bparams;

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        // Replace qgis server url in the XML (hide real location)
        $sUrl = jUrl::getFull(
            'lizmap~service:index',
            array(
                'repository' => $this->repository->getKey(),
                'project' => $this->project->getKey(),
            ),
            0,
            $_SERVER['SERVER_NAME']
        );

        $sUrl = str_replace('&', '&amp;', $sUrl);
        $data = preg_replace('/xlink\:href=".*"/', 'xlink:href="'.$sUrl.'&amp;"', $data);

        // Return response
        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($code, '');
        $rep->mimeType = $mime;
        $rep->content = $data;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_server_getContext';

        return $rep;
    }

    /**
     * GetSchemaExtension.
     *
     * @urlparam string $SERVICE mandatory, has to be WMS
     * @urlparam string $REQUEST mandatory, has to be GetSchemaExtension
     *
     * @return jResponseBinary text/xml the WMS GEtCapabilities 1.3.0 Schema Extension.
     */
    protected function GetSchemaExtension()
    {
        $data = '<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://www.w3.org/2001/XMLSchema" xmlns:wms="http://www.opengis.net/wms" xmlns:qgs="http://www.qgis.org/wms" targetNamespace="http://www.qgis.org/wms" elementFormDefault="qualified" version="1.0.0">
  <import namespace="http://www.opengis.net/wms" schemaLocation="http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd"/>
  <element name="GetPrint" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
  <element name="GetPrintAtlas" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
  <element name="GetStyles" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
</schema>';
        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $rep->mimeType = 'text/xml';
        $rep->content = $data;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_server_schema_extension';

        return $rep;
    }

    /**
     * GetMap.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @return jResponseBinary image rendered by the Map Server
     */
    protected function GetMap()
    {

        //Get parameters  DELETED HERE SINCE ALREADY DONE IN index method
        //if(!$this->getServiceParameters())
        //return $this->serviceException();

        $wmsRequest = new lizmapWMSRequest($this->project, $this->params);
        $result = $wmsRequest->process();
        if ($result->data == 'error') {
            return $this->serviceException();
        }

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_server_wms_map_'.$this->repository->getKey().'_'.$this->project->getKey();
        $rep->setHttpStatus($result->code, '');

        if (!preg_match('/^image/', $result->mime)) {
            return $rep;
        }

        // HTTP browser cache expiration time
        $layername = $this->params['layers'];
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
     * @return jResponseBinary Image of the legend for 1 to n layers, returned by the Map Server
     */
    protected function GetLegendGraphics()
    {

        //Get parameters  DELETED HERE SINCE ALREADY DONE IN index method
        //if(!$this->getServiceParameters())
        //return $this->serviceException();

        $wmsRequest = new lizmapWMSRequest($this->project, $this->params);
        $result = $wmsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_server_legend';

        return $rep;
    }

    /**
     * GetFeatureInfo.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @return jResponseBinary feature Info
     */
    protected function GetFeatureInfo()
    {
        $globalResponse = '';

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        $lproj = $this->project;
        $pConfig = $lproj->getFullCfg();

        $externalWMSLayers = array();
        $QGISLayers = array();
        $queryLayers = explode(',', $this->iParam('QUERY_LAYERS'));

        // We split layers in two groups. First contains exernal WMS, second contains QGIS layers
        foreach ($queryLayers as $queryLayer) {
            if (property_exists($pConfig->layers, $queryLayer) &&
                property_exists($pConfig->layers->{$queryLayer}, 'externalAccess') &&
                $pConfig->layers->{$queryLayer}->externalAccess == 'True'
            ) {
                $externalWMSLayers[] = $queryLayer;
            } else {
                $QGISLayers[] = $queryLayer;
            }
        }

        // External WMS
        foreach ($externalWMSLayers as $externalWMSLayer) {
            $url = $pConfig->layers->{$externalWMSLayer}->externalAccess->url;

            $externalWMSLayerParams = $this->params;

            $externalWMSLayerParams['layers'] = $externalWMSLayer;
            $externalWMSLayerParams['query_layers'] = $externalWMSLayer;

            $keyValueParameters = array();
            $paramsBlacklist = array('module', 'action', 'C', 'repository', 'project', 'exceptions', 'map');

            // We force info_format application/vnd.ogc.gml as default value.
            // TODO let user choose which format he wants in lizmap plugin
            $externalWMSLayerParams['info_format'] = 'application/vnd.ogc.gml';

            foreach ($externalWMSLayerParams as $key => $val) {
                if (!in_array($key, $paramsBlacklist)) {
                    $keyValueParameters[] = strtolower($key).'='.urlencode($val);
                }
            }

            $querystring = $url.implode('&', $keyValueParameters);

            // Query external WMS layers
            list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

            $xml = simplexml_load_string($data);

            // Create HTML response
            if (count($xml->children())) {
                $layerstring = $externalWMSLayer.'_layer';
                $featurestring = $externalWMSLayer.'_feature';

                $layerTitle = $pConfig->layers->{$externalWMSLayer}->title;

                $HTMLResponse = "<h4>${layerTitle}</h4><div class='lizmapPopupDiv'><table class='lizmapPopupTable'>";

                foreach ($xml->{$layerstring}->{$featurestring}->children() as $key => $value) {
                    $HTMLResponse .= "<tr><td>${key}&nbsp;:&nbsp;</td><td>${value}</td></tr>";
                }
                $HTMLResponse .= '</table></div>';

                $globalResponse .= $HTMLResponse;
            }
        }

        // Query QGIS WMS layers
        if (!empty($QGISLayers)) {
            $QGISLayersParams = $this->params;

            $QGISLayersParams['layers'] = implode(',', $QGISLayers);
            $QGISLayersParams['query_layers'] = implode(',', $QGISLayers);

            $url = $this->services->wmsServerURL.'?';

            // Deactivate info_format to use Lizmap instead of QGIS
            $toHtml = false;
            if ($QGISLayersParams['info_format'] == 'text/html') {
                $toHtml = true;
                $QGISLayersParams['info_format'] = 'text/xml';
            }

            // Always request maptip to QGIS server so we can decide if to use it later
            $QGISLayersParams['with_maptip'] = 'true';
            // Always request geometry to QGIS server so we can decide if to use it later
            $QGISLayersParams['with_geometry'] = 'true';

            $bparams = http_build_query($QGISLayersParams);
            $querystring = $url.$bparams;

            // Get remote data
            list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

            // Get HTML content if needed
            if ($toHtml and preg_match('#/xml#', $mime)) {
                $data = $this->getFeatureInfoHtml($QGISLayersParams, $data);
                $mime = 'text/html';
            }

            $globalResponse .= $data;
        }

        // Log
        $eventParams = array(
            'key' => 'popup',
            'content' => '',
            'repository' => $this->repository->getKey(),
            'project' => $this->project->getKey(),
        );
        jEvent::notify('LizLogItem', $eventParams);

        $rep = $this->getResponse('binary');
        $rep->mimeType = 'text/html';
        $rep->content = $globalResponse;
        $rep->doDownload = false;
        $rep->outputFileName = 'getFeatureInfo';

        return $rep;
    }

    /**
     * replaceMediaPathByMediaUrl : replace all "/media/bla" in a text by the getMedia corresponding URL.
     * This method is used as callback in GetFeatureInfoHtml method for the preg_replace_callback.
     *
     * @param array $matches Array containing the preg matches
     *
     * @return string replaced text
     */
    protected function replaceMediaPathByMediaUrl($matches)
    {
        $req = jApp::coord()->request;
        $return = '';
        $return .= '"';
        $return .= jUrl::getFull(
            'view~media:getMedia',
            array(
                'repository' => $this->repository->getKey(),
                'project' => $this->project->getKey(),
                'path' => $matches[2],
            ),
            0,
            $req->getDomainName().$req->getPort()
        );
        $return .= '"';

        return $return;
    }

    /**
     * GetFeatureInfoHtml : return HTML for the getFeatureInfo.
     *
     * @param array  $params  Array of parameters
     * @param string $xmldata XML data from getFeatureInfo
     *
     * @return string feature Info in HTML format
     */
    protected function getFeatureInfoHtml($params, $xmldata)
    {

        // Get data from XML
        $use_errors = libxml_use_internal_errors(true);
        $errorlist = array();
        // Create a DOM instance
        $xml = simplexml_load_string($xmldata);
        if (!$xml) {
            foreach (libxml_get_errors() as $error) {
                $errorlist[] = $error;
            }
            $errormsg = 'An error has been raised when loading GetFeatureInfoHtml:';
            $errormsg .= '\n'.http_build_query($params);
            $errormsg .= '\n'.$xmldata;
            $errormsg .= '\n'.implode('\n', $errorlist);
            jLog::log($errormsg, 'error');
            // return empty html string
            return '';
        }

        // Check layer children
        if (!$xml->Layer) {
            // No data found
            // return empty html string
            return '';
        }

        // Get json configuration for the project
        $configLayers = $this->project->getLayers();

        // Get optional parameter fid
        $filterFid = null;
        $fid = $this->param('fid');
        if ($fid) {
            $expFid = explode('.', $fid);
            if (count($expFid) == 2) {
                $filterFid = array();
                $filterFid[$expFid[0]] = $expFid[1];
            }
        }

        // Loop through the layers
        $content = array();
        $popupClass = jClasses::getService('view~popup');

        foreach ($xml->Layer as $layer) {
            $layername = (string) $layer['name'];
            $configLayer = $this->project->findLayerByAnyName($layername);
            if ($configLayer == null) {
                continue;
            }

            // Avoid layer if no popup asked by the user for it
            // or if no popup property
            // or if no edition
            $returnPopup = false;
            if (property_exists($configLayer, 'popup') && $configLayer->popup == 'True') {
                $returnPopup = true;
            }

            if (!$returnPopup) {
                $editionLayer = $this->project->findEditionLayerByLayerId($configLayer->id);
                if ($editionLayer != null &&
                    ($editionLayer->capabilities->modifyGeometry == 'True'
                                     || $editionLayer->capabilities->modifyAttribute == 'True'
                                     || $editionLayer->capabilities->deleteFeature == 'True')
                ) {
                    $returnPopup = true;
                }
            }

            if (!$returnPopup) {
                continue;
            }

            // Get layer title
            $layerTitle = $configLayer->title;
            $layerId = $configLayer->id;

            // Get the template for the popup content
            $templateConfigured = false;
            if (property_exists($configLayer, 'popupTemplate')) {
                // Get template content
                $popupTemplate = (string) trim($configLayer->popupTemplate);
                // Use it if not empty
                if (!empty($popupTemplate)) {
                    $templateConfigured = true;
                    // first replace all "media/bla/bla/llkjk.ext" by full url
                    $popupTemplate = preg_replace_callback(
                        '#(["\']){1}((\.\./)?media/.+\.\w{3,10})(["\']){1}#',
                        array($this, 'replaceMediaPathByMediaUrl'),
                        $popupTemplate
                    );
                    // Replace : html encoded chars to let further regexp_replace find attributes
                    $popupTemplate = str_replace(array('%24', '%7B', '%7D'), array('$', '{', '}'), $popupTemplate);
                }
            }

            // Loop through the features
            $popupMaxFeatures = 10;
            if (property_exists($configLayer, 'popupMaxFeatures') && is_numeric($configLayer->popupMaxFeatures)) {
                $popupMaxFeatures = $configLayer->popupMaxFeatures + 0;
            }
            $layerFeaturesCounter = 0;
            foreach ($layer->Feature as $feature) {
                $id = (string) $feature['id'];
                // Optionnally filter by feature id
                if ($filterFid &&
                    isset($filterFid[$configLayer->name]) &&
                    $filterFid[$configLayer->name] != $id
                ) {
                    continue;
                }

                if ($layerFeaturesCounter == $popupMaxFeatures) {
                    break;
                }
                ++$layerFeaturesCounter;

                // Hidden input containing layer id and feature id
                $hiddenFeatureId = '<input type="hidden" value="'.$layerId.'.'.$id.'" class="lizmap-popup-layer-feature-id"/>
        ';

                // First get default template
                $tpl = new jTpl();
                $tpl->assign('layerName', $layername);
                $tpl->assign('layerId', $layerId);
                $tpl->assign('layerTitle', $layerTitle);
                $tpl->assign('featureId', $id);
                $tpl->assign('attributes', $feature->Attribute);
                $tpl->assign('repository', $this->repository->getKey());
                $tpl->assign('project', $this->project->getKey());
                $popupFeatureContent = $tpl->fetch('view~popupDefaultContent', 'html');
                $autoContent = $popupFeatureContent;

                // Get specific template for the layer has been configured
                if ($templateConfigured) {
                    $popupFeatureContent = $popupTemplate;

                    // then replace all column data by appropriate content
                    foreach ($feature->Attribute as $attribute) {
                        // Replace #col and $col by colomn name and value
                        $popupFeatureContent = $popupClass->getHtmlFeatureAttribute(
                            $attribute['name'],
                            $attribute['value'],
                            $this->repository->getKey(),
                            $this->project->getKey(),
                            $popupFeatureContent
                        );
                    }
                    $lizmapContent = $popupFeatureContent;
                }

                // Use default template if needed or maptip value if defined
                $hasMaptip = false;
                $maptipValue = '';
                // Get geometry data
                $hasGeometry = false;
                $geometryValue = '';

                foreach ($feature->Attribute as $attribute) {
                    if ($attribute['name'] == 'maptip') {
                        $hasMaptip = true;
                        $maptipValue = $attribute['value'];
                    } elseif ($attribute['name'] == 'geometry') {
                        $hasGeometry = true;
                        $geometryValue = $attribute['value'];
                    }
                }
                // If there is a maptip attribute we display its value
                if ($hasMaptip) {
                    // first replace all "media/bla/bla/llkjk.ext" by full url
                    $maptipValue = preg_replace_callback(
                        '#(["\']){1}((\.\./)?media/.+\.\w{3,10})(["\']){1}#',
                        array($this, 'replaceMediaPathByMediaUrl'),
                        $maptipValue
                    );
                    // Replace : html encoded chars to let further regexp_replace find attributes
                    $maptipValue = str_replace(array('%24', '%7B', '%7D'), array('$', '{', '}'), $maptipValue);
                    $qgisContent = $maptipValue;
                }

                // Get the BoundingBox data
                $hiddenGeometry = '';
                if ($hasGeometry && $feature->BoundingBox) {
                    $hiddenGeometry = '<input type="hidden" value="'.$geometryValue.'" class="lizmap-popup-layer-feature-geometry"/>
        ';
                    $bbox = $feature->BoundingBox[0];
                    $hiddenGeometry .= '<input type="hidden" value="'.$bbox['CRS'].'" class="lizmap-popup-layer-feature-crs"/>
        ';
                    $hiddenGeometry .= '<input type="hidden" value="'.$bbox['minx'].'" class="lizmap-popup-layer-feature-bbox-minx"/>
        ';
                    $hiddenGeometry .= '<input type="hidden" value="'.$bbox['miny'].'" class="lizmap-popup-layer-feature-bbox-miny"/>
        ';
                    $hiddenGeometry .= '<input type="hidden" value="'.$bbox['maxx'].'" class="lizmap-popup-layer-feature-bbox-maxx"/>
        ';
                    $hiddenGeometry .= '<input type="hidden" value="'.$bbox['maxy'].'" class="lizmap-popup-layer-feature-bbox-maxy"/>
        ';
                }

                // New option to choose the popup source : auto (=default), lizmap (=popupTemplate), qgis (=qgis maptip)
                $finalContent = $autoContent;
                if (property_exists($configLayer, 'popupSource')) {
                    if ($configLayer->popupSource == 'qgis' and $hasMaptip) {
                        $finalContent = $qgisContent;
                    }
                    if ($configLayer->popupSource == 'lizmap' and $templateConfigured) {
                        $finalContent = $lizmapContent;
                    }
                }

                $tpl = new jTpl();
                $tpl->assign('layerTitle', $layerTitle);
                $tpl->assign('layerName', $layername);
                $tpl->assign('layerId', $layerId);
                $tpl->assign('featureId', $id);
                $tpl->assign('popupContent', $hiddenFeatureId.$hiddenGeometry.$finalContent);
                $content[] = $tpl->fetch('view~popup', 'html');
            } // loop features

            // Raster Popup
            if (count($layer->Attribute) > 0) {
                $tpl = new jTpl();
                $tpl->assign('layerName', $layername);
                $tpl->assign('layerId', $layerId);
                $tpl->assign('attributes', $layer->Attribute);
                $tpl->assign('repository', $this->repository->getKey());
                $tpl->assign('project', $this->project->getKey());
                $popupRasterContent = $tpl->fetch('view~popupRasterContent', 'html');

                $tpl = new jTpl();
                $tpl->assign('layerTitle', $layerTitle);
                $tpl->assign('layerName', $layername);
                $tpl->assign('layerId', $layerId);
                $tpl->assign('popupContent', $popupRasterContent);
                $content[] = $tpl->fetch('view~popup', 'html');
            }
        } // loop layers

        $content = array_reverse($content);

        return implode("\n", $content);
    }

    /**
     * GetPrint.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @return jResponseBinary image rendered by the Map Server
     */
    protected function GetPrint()
    {

    /*
    foreach($this->params as $key=>$val){
      print $key. "=>". $val."\n";
    }
     */

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        $url = $this->services->wmsServerURL.'?';
        /*
        $bparams = http_build_query($this->params);
        // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');
        $bparams = str_replace($a, $b, $bparams);
        $querystring = $url . $bparams;
        */

        // Filter the parameters of the request
        // for querying GetPrint
        $data = array();
        $paramsBlacklist = array('module', 'action', 'C', 'repository', 'project');
        foreach ($this->params as $key => $val) {
            if (!in_array($key, $paramsBlacklist)) {
                $data[] = strtolower($key).'='.urlencode($val);
            }
        }
        $querystring = $url.implode('&', $data);

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring, array('method' => 'post'));

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($code, '');
        $rep->mimeType = $mime;
        $rep->content = $data;
        $rep->doDownload = false;
        $rep->outputFileName = $this->project->getKey().'_'.preg_replace('#[\\W]+#', '_', $this->params['template']).'.'.$this->params['format'];

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
     * GetPrintAtlas.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @return jResponseBinary image rendered by the Map Server
     */
    protected function GetPrintAtlas()
    {

    // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        $url = $this->services->wmsServerURL.'?';

        // Filter the parameters of the request
        // for querying GetPrint
        $data = array();
        $paramsBlacklist = array('module', 'action', 'C', 'repository', 'project');
        foreach ($this->params as $key => $val) {
            if (!in_array($key, $paramsBlacklist)) {
                $data[] = strtolower($key).'='.urlencode($val);
            }
        }
        $querystring = $url.implode('&', $data);

        // Trigger optional actions by other modules
        // For example, cadastre module can create a file
        $eventParams = array(
            'params' => $this->params,
            'repository' => $this->repository->getKey(),
            'project' => $this->project->getKey(),
        );
        jEvent::notify('BeforePdfCreation', $eventParams);

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring, array('method' => 'post'));

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($code, '');
        $rep->mimeType = $mime;
        $rep->content = $data;
        $rep->doDownload = false;
        $rep->outputFileName = $this->project->getKey().'_'.preg_replace('#[\\W]+#', '_', $this->params['template']).'.'.$this->params['format'];

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
     * @return jResponseBinary SLD Style XML
     */
    protected function GetStyles()
    {

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        // Construction of the request url : base url + parameters
        $url = $this->services->wmsServerURL.'?';
        $bparams = http_build_query($this->params);
        $querystring = $url.$bparams;

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        // Return response
        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($code, '');
        $rep->mimeType = $mime;
        $rep->content = $data;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_style';

        return $rep;
    }

    /**
     * Send the JSON configuration file for a specified project.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project
     *
     * @return jResponseText JSON configuration file for the specified project
     */
    public function getProjectConfig()
    {

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        $rep = $this->getResponse('text');
        $rep->content = $this->project->getUpdatedConfig();

        return $rep;
    }

    /**
     * PostRequest.
     *
     * @param string $xml_post
     *
     * @return jResponseBinary response data
     */
    protected function PostRequest($xml_post)
    {
        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        $url = $this->services->wmsServerURL.'?';

        // Filter the parameters of the request
        $data = array();
        $paramsBlacklist = array('module', 'action', 'C', 'repository', 'project');
        foreach ($this->params as $key => $val) {
            if (!in_array($key, $paramsBlacklist)) {
                $data[] = strtolower($key).'='.urlencode($val);
            }
        }
        $querystring = $url.implode('&', $data);

        // Get data form server
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring, array(
            'method' => 'post',
            'headers' => array('Content-Type' => 'text/xml'),
            'body' => $xml_post,
        ));

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($code, '');
        $rep->mimeType = $mime;
        $rep->content = $data;
        $rep->doDownload = false;
        $rep->outputFileName = 'post_request';

        return $rep;
    }

    /**
     * GetFeature.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @return jResponseBinary image rendered by the Map Server
     */
    protected function GetFeature()
    {
        $wfsRequest = new lizmapWFSRequest($this->project, $this->params);
        $result = $wfsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_server_wfs';
        $rep->setHttpStatus($result->code, '');

        if ($result->code >= 400) {
            $rep->content = $result->data;

            return $rep;
        }

        if (property_exists($result, 'file') and $result->file and is_file($result->data)) {
            $rep->fileName = $result->data;
            $rep->deleteFileAfterSending = true;
        } else {
            $rep->content = $result->data; // causes memory_limit for big content
        }

        // Define file name
        $typenames = implode('_', array_map('trim', explode(',', $this->params['typename'])));
        $zipped_files = array('shp', 'mif', 'tab');
        $outputformat = 'gml2';
        if (isset($this->params['outputformat'])) {
            $outputformat = strtolower($this->params['outputformat']);
        }
        if (in_array($outputformat, $zipped_files)) {
            $rep->outputFileName = $typenames.'.zip';
        } else {
            $rep->outputFileName = $typenames.'.'.$outputformat;
        }

        // Export
        $dl = $this->param('dl');
        if ($dl) {
            // force download
            $rep->doDownload = true;

            if ($rep->fileName == '' && $rep->content != '') {
                // debug 1st line blank from QGIS Server
                $rep->content = preg_replace('/^[\n\r]/', '', $result->data);
            }
            // Change file name
            if (in_array($outputformat, $zipped_files)) {
                $rep->outputFileName = 'export_'.$this->params['typename'].'.zip';
            } else {
                $rep->outputFileName = 'export_'.$this->params['typename'].'.'.$outputformat;
            }
        }

        return $rep;
    }

    /**
     * DescribeFeatureType.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @return jResponseBinary JSON content
     */
    protected function DescribeFeatureType()
    {

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        // Extensions to get aliases and type
        $returnJson = false;
        $outputformat = '';
        if (isset($this->params['outputformat'])) {
            $outputformat = strtolower($this->params['outputformat']);
        }
        if ($outputformat == 'json') {
            $this->params['outputformat'] = 'XMLSCHEMA';
            $returnJson = true;
        }

        // Construction of the request url : base url + parameters
        $url = $this->services->wmsServerURL.'?';
        $bparams = http_build_query($this->params);
        $querystring = $url.$bparams;

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        if ($code < 400 && $returnJson) {
            $jsonData = array();

            $layer = $this->project->findLayerByAnyName($this->params['typename']);
            if ($layer != null) {

                // Get data from XML
                $use_errors = libxml_use_internal_errors(true);
                $go = true;
                $errorlist = array();
                // Create a DOM instance
                $xml = simplexml_load_string($data);
                if (!$xml) {
                    foreach (libxml_get_errors() as $error) {
                        $errorlist[] = $error;
                    }
                    $go = false;
                }
                if ($go && $xml->complexType) {
                    $typename = (string) $xml->complexType->attributes()->name;
                    if ($typename == $this->params['typename'].'Type') {
                        $jsonData['name'] = $layer->name;
                        $types = array();
                        $elements = $xml->complexType->complexContent->extension->sequence->element;
                        foreach ($elements as $element) {
                            $types[(string) $element->attributes()->name] = (string) $element->attributes()->type;
                        }
                        $jsonData['types'] = (object) $types;
                    }
                }
                $layer = $this->project->getLayer($layer->id);
                $aliases = $layer->getAliasFields();
                $jsonData['aliases'] = (object) $aliases;
                $jsonData['defaults'] = (object) $layer->getDefaultValues();
            }
            $jsonData = json_encode((object) $jsonData);

            // Return response
            $rep = $this->getResponse('binary');
            $rep->setHttpStatus($code, '');
            $rep->mimeType = 'text/json; charset=utf-8';
            $rep->content = $jsonData;
            $rep->doDownload = false;
            $rep->outputFileName = 'qgis_server_wfs';

            return $rep;
        }

        // Return response
        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($code, '');
        $rep->mimeType = $mime;
        $rep->content = $data;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_server_wfs';

        return $rep;
    }

    /**
     * GetProj4.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     * @urlparam string $authid SRS or CRS authid like USER:*
     *
     * @return jResponseText
     */
    protected function GetProj4()
    {

        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        // Return response
        $rep = $this->getResponse('text');
        $content = $this->project->getProj4($this->iParam('authid'));
        if (!$content) {
            $rep->setHttpStatus(404, 'Not Found');
        }
        $content = (string) $content[0];
        $rep->content = $content;
        $rep->setExpires('+300 seconds');

        return $rep;
    }

    /**
     * @return jResponseBinary
     */
    protected function GetTile()
    {
        $wmsRequest = new lizmapWMTSRequest($this->project, $this->params);
        $result = $wmsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_server_wmts_tile_'.$this->repository->getKey().'_'.$this->project->getKey();
        $rep->setHttpStatus($result->code, '');

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
            'qgisParams' => $wmsRequest->parameters(),
            'qgisResponseCode' => $result->code,
        ));

        return $rep;
    }

    private function _getSelectionToken($repository, $project, $typename, $ids)
    {
        $token = md5($repository.$project.$typename.implode(',', $ids));

        $data = jCache::get($token);
        $incache = true;
        if (!$data or true) {
            $data = array();
            $data['token'] = $token;
            $data['typename'] = $typename;
            $data['ids'] = $ids;
            $incache = false;
            jCache::set($token, json_encode($data), 3600);
        } else {
            $data = json_decode($data);
        }

        return $data;
    }

    /**
     * @return jResponseJson
     */
    protected function getSelectionToken()
    {
        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        // Prepare response
        $rep = $this->getResponse('json');

        // Get params
        $typename = $this->params['typename'];
        $ids = explode(',', $this->params['ids']);
        sort($ids);

        // Token
        $data = $this->_getSelectionToken($this->iParam('repository'), $this->iParam('project'), $typename, $ids);
        $json = array();
        $json['token'] = $data['token'];

        $rep->data = $json;

        return $rep;
    }

    private function _getFilterToken($repository, $project, $typename, $filter)
    {
        $token = md5($repository.$project.$typename.$filter);

        $data = jCache::get($token);
        $incache = true;
        if (!$data or true) {
            $data = array();
            $data['token'] = $token;
            $data['typename'] = $typename;
            $data['filter'] = $filter;
            $incache = false;
            jCache::set($token, json_encode($data), 3600);
        } else {
            $data = json_decode($data);
        }

        return $data;
    }

    protected function getFilterToken()
    {
        // Get parameters
        if (!$this->getServiceParameters()) {
            return $this->serviceException();
        }

        // Prepare response
        $rep = $this->getResponse('json');

        // Get params
        $typename = $this->params['typename'];
        $filter = $this->params['filter'];

        // Token
        $data = $this->_getFilterToken($this->iParam('repository'), $this->iParam('project'), $typename, $filter);
        $json = array();
        $json['token'] = $data['token'];

        $rep->data = $json;

        return $rep;
    }
}
