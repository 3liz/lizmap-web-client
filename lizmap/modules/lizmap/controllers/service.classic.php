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

        // Variable stored to log lizmap metrics
        $_SERVER['LIZMAP_BEGIN_TIME'] = microtime(true);

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

        $requestXml = null;
        global $HTTP_RAW_POST_DATA;
        if (isset($HTTP_RAW_POST_DATA)) {
            $requestXml = $HTTP_RAW_POST_DATA;
        } else if (isset($_SERVER['CONTENT_TYPE'])) {
            $contentType = $_SERVER['CONTENT_TYPE'];
            if (strpos($contentType, 'text/xml') === 0) {
                $requestXml = file('php://input');
                $requestXml = implode("\n", $requestXml);
            }
        }

        $ogcRequest = lizmapOGCRequest::build($this->project, $this->params, $requestXml);
        if ($ogcRequest === Null) {
            // Error message
            jMessage::add('Service unknown or unsupported.', 'ServiceNotSupported');

            return $this->serviceException();
        }

        // Return the appropriate action
        $service = strtoupper($ogcRequest->param('service'));
        $request = strtoupper($ogcRequest->param('request'));

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

        if(!$request) {
            jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');
        } else {
            jMessage::add('Request '.$request.' is not supported', 'OperationNotSupported');
        }

        return $this->serviceException();
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
                $addwww = False;
                $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
                if (!empty($referer)) {
                    $referer_parse = parse_url($referer);
                    if (array_key_exists('host', $referer_parse)) {
                        $referer_domain = $referer_parse['host'];
                        $domain = jApp::coord()->request->getDomainName();
                        if (!empty($domain) and $referer_domain != $domain) {
                            $addwww = True;
                        }
                    }
                }else{
                    $addwww = True;
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
            } elseif ($code == 'ServiceNotSupported') {
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
        if (isset($params['filtertoken']) &&
            isset($params['request']) &&
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
                if($layerByTypeName){
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
    protected function GetCapabilities($ogcRequest)
    {
        $service = $ogcRequest->param('service');
        $result = $ogcRequest->process();

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
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
    protected function GetContext($wmsRequest)
    {
        $result = $wmsRequest->process();

        // Return response
        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
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
     * @return jResponseBinary text/xml the WMS GetSchemaExtension 1.3.0 Schema Extension.
     */
    protected function GetSchemaExtension($wmsRequest)
    {
        $result = $wmsRequest->process();

        // Return response
        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
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
    protected function GetMap($wmsRequest)
    {
        $result = $wmsRequest->process();
        if ($result->data == 'error') {
            return $this->serviceException();
        }

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload = false;
        $rep->outputFileName = 'qgis_server_wms_map_'.$this->repository->getKey().'_'.$this->project->getKey();

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

        // log metric
        $ser = lizmap::getServices();
        $debug = $ser->debugMode;
        if ($debug) {
            lizmap::logMetric('LIZMAP_SERVICE_GETMAP');
        }

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
    protected function GetLegendGraphics($wmsRequest)
    {
        $result = $wmsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
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

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload = false;
        $rep->outputFileName = 'getFeatureInfo';

        return $rep;
    }

    /**
     * GetPrint.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @return jResponseBinary image rendered by the Map Server
     */
    protected function GetPrint($wmsRequest)
    {
        $result = $wmsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
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
    protected function GetPrintAtlas($wmsRequest)
    {
        $result = $wmsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
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
    protected function GetStyles($wmsRequest)
    {
        $result = $wmsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
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
     * GetFeature.
     *
     * @urlparam string $repository Lizmap Repository
     * @urlparam string $project Name of the project : mandatory
     *
     * @return jResponseBinary image rendered by the Map Server
     */
    protected function GetFeature($wfsRequest)
    {
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
    protected function DescribeFeatureType($wfsRequest)
    {
        $result = $wfsRequest->process();

        // Return response
        $rep = $this->getResponse('binary');
        $rep->setHttpStatus($result->code, '');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
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
    protected function GetTile($wmtsRequest)
    {
        $result = $wmtsRequest->process();

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

        // log metric
        $ser = lizmap::getServices();
        $debug = $ser->debugMode;
        if ($debug) {
            lizmap::logMetric('LIZMAP_SERVICE_GETMAP');
        }

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
