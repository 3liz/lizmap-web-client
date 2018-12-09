<?php
/**
* Php proxy to access map services
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class serviceCtrl extends jController {


  /**
   * @var lizmapProject
   */
  protected $project = '';
  protected $repository = '';
  protected $services = '';
  protected $params = '';


  /**
  * Redirect to the appropriate action depending on the REQUEST parameter.
  * @param $PROJECT Name of the project
  * @param $REQUEST Request type
  * @return Redirect to the corresponding action depending on the request parameters
  */
  function index() {

    // Variable stored to log lizmap metrics
    $_SERVER['LIZMAP_BEGIN_TIME'] = microtime(true);

    if (isset($_SERVER['PHP_AUTH_USER'])) {
      $ok = jAuth::login($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
    }

    $rep = $this->getResponse('redirect');

    // Get the project
    $project = $this->iParam('project');
    if(!$project){
      // Error message
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefined');
      return $this->serviceException();
    }

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    // Return the appropriate action
    $service = strtoupper($this->iParam('SERVICE'));
    $request = strtoupper($this->iParam('REQUEST'));
    if($request == "GETCAPABILITIES")
      return $this->GetCapabilities();
    elseif ($request == "GETCONTEXT")
      return $this->GetContext();
    elseif ($request == "GETSCHEMAEXTENSION")
      return $this->GetSchemaExtension();
    elseif ($request == "GETLEGENDGRAPHICS")
      return $this->GetLegendGraphics();
    elseif ($request == "GETLEGENDGRAPHIC")
      return $this->GetLegendGraphics();
    elseif ($request == "GETFEATUREINFO")
      return $this->GetFeatureInfo();
    elseif ($request == "GETPRINT")
      return $this->GetPrint();
    elseif ($request == "GETPRINTATLAS")
      return $this->GetPrintAtlas();
    elseif ($request == "GETSTYLES")
      return $this->GetStyles();
    elseif ($request == "GETMAP")
      return $this->GetMap();
    elseif ($request == "GETFEATURE")
      return $this->GetFeature();
    elseif ($request == "DESCRIBEFEATURETYPE")
      return $this->DescribeFeatureType();
    elseif ($request == "GETTILE")
      return $this->GetTile();
    elseif ($request == "GETPROJ4")
      return $this->GetProj4();
    elseif ($request == "GETSELECTIONTOKEN")
      return $this->GetSelectionToken();
    elseif ($request == "GETFILTERTOKEN")
      return $this->GetFilterToken();
    else {
      global $HTTP_RAW_POST_DATA;
      if(isset($HTTP_RAW_POST_DATA)){
        $requestXml = $HTTP_RAW_POST_DATA;
      }else{
        $requestXml = file('php://input');
        $requestXml = implode("\n",$requestXml);
      }
      $xml = simplexml_load_string( $requestXml );
      if($xml == false){
        jMessage::add('REQUEST '.$request.' not supported by Lizmap Web Client', 'InvalidRequest');
        return $this->serviceException();
      }
      return $this->PostRequest( $requestXml );
    }
  }


  /**
  * Get a request parameter
  * whatever its case
  * and returns its value.
  * @param $param request parameter.
  * @return Request parameter value.
  */
  protected function iParam($param){

    $pParams = jApp::coord()->request->params;
    foreach($pParams as $k=>$v){
      if(strtolower($k) == strtolower($param)){
        return $v;
      }
    }
    return Null;
  }

  /**
  * Send an OGC service Exception
  * @return jResponseXml XML OGC Service Exception.
  */
  protected function serviceException(){
    $messages = jMessage::getAll();
    if (!$messages) {
        $messages = array();
    }
    /** @var jResponseXml $rep */
    $rep = $this->getResponse('xml');
    $rep->contentTpl = 'lizmap~wms_exception';
    $rep->content->assign('messages', $messages);
    jMessage::clearAll();

    foreach( $messages as $code=>$msg ){
      if( $code == 'AuthorizationRequired' )
        $rep->setHttpStatus(401, $code);
      else if( $code == 'ProjectNotDefined' )
        $rep->setHttpStatus(404, 'Not Found');
      else if( $code == 'RepositoryNotDefined' )
        $rep->setHttpStatus(404, 'Not Found');
    }

    return $rep;
  }


  /**
  * Get parameters and set classes for the project and repository given.
  *
  * @return array List of needed variables : $params, $lizmapProject, $lizmapRepository.
  */
  protected function getServiceParameters(){

    // Get the project
    $project = $this->iParam('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefined');
      return false;
    }

    // Get repository data
    $repository = $this->iParam('repository');

    // Get the corresponding repository
    $lrep = lizmap::getRepository($repository);
    if(!$lrep){
      jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');
      return false;
    }
    // Get the project object
    $lproj = null;
    try {
        $lproj = lizmap::getProject($repository.'~'.$project);
        if ( !$lproj ) {
            jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
            return false;
        }
    }
    catch(UnknownLizmapProjectException $e) {
        jLog::logEx($e, 'error');
        jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
        return false;
    }

    // Redirect if no rights to access this repository
    if ( !$lproj->checkAcl() ) {
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return false;
    }

    // Get and normalize the passed parameters
    $pParams = jApp::coord()->request->params;
    $pParams['map'] = realpath($lrep->getPath()) . '/' . $project . ".qgs";
    $params = lizmapProxy::normalizeParams($pParams);

    // Define class private properties
    $this->project = $lproj;
    $this->repository = $lrep;
    $this->services = lizmap::getServices();
    $this->params = $params;

    // Get the optionnal filter token
    if(
      isset($params['filtertoken'])
      and isset($params['request'])
      and in_array(strtolower($params['request']), array('getmap', 'getfeature', 'getprint', 'getfeatureinfo'))
    ){
        $tokens = $params['filtertoken'];
        $tokens = explode(';', $tokens);
        $filters = array();
        foreach( $tokens as $token ) {
            $data = jCache::get($token);
            if($data){
                $data = json_decode($data);
                if(
                  property_exists($data, 'filter')
                  and trim($data->filter) != ''
                ){
                  $filters[] = $data->filter;
                }
            }
        }
        if( count( $filters ) > 0 )
            $this->params['filter'] = implode(';', $filters);
    }

    // Optionnaly filter data by login
    if(isset($params['request'])){
      $request = strtolower($params['request']);
      if(
        in_array($request, array('getmap', 'getfeatureinfo', 'getfeature', 'getprint', 'getprintatlas'))
        and !jAcl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey() )
      ){
        $this->filterDataByLogin();
      }
    }

    // Get the selection token
    if(
      isset($params['selectiontoken'])
      and in_array($request, array('getmap', 'getfeature', 'getprint'))
    ){
        $tokens = $params['selectiontoken'];
        $tokens = explode(';', $tokens);
        $selections = array();
        foreach( $tokens as $token ) {
            $data = jCache::get($token);
            if($data){
                $data = json_decode($data);
                if(
                  property_exists($data, 'typename')
                  and property_exists($data, 'ids')
                  and count($data->ids) > 0
                ){
                  $selections[] = $data->typename. ':' . implode(',', $data->ids);
                }
            }
        }
        if( count( $selections ) > 0 )
            $this->params['SELECTION'] = implode(';', $selections);
    }

    return true;
  }

  /**
  * Filter data by login if necessary
  * as configured in the plugin for login filtered layers.
  */
  protected function filterDataByLogin() {

    // Optionnaly add a filter parameter
    $lproj = $this->project;

    $request = strtolower($this->params['request']);
    if( $request == 'getfeature' )
      $layers = $this->params["typename"];
    else{
        if(array_key_exists('layers',$this->params))
          $layers = $this->params["layers"];
        else
          $layers = array();
    }
    $pConfig = $lproj->getFullCfg();

    // Filter only if needed
    if( $lproj->hasLoginFilteredLayers()
      and $pConfig->loginFilteredLayers
    ){
      // Add client side filter before changing it server side
      $clientExpFilter = Null;
      if( array_key_exists('exp_filter', $this->params))
        $clientExpFilter = $this->params['exp_filter'];
      $clientFilter = Null;
      if( array_key_exists('filter', $this->params))
        $clientFilter = $this->params['filter'];

      // Check if a user is authenticated
      $isConnected = jAuth::isConnected();

      // Check need for filter foreach layer
      $serverFilterArray = array();
      foreach(explode(',', $layers) as $layername){
        if( property_exists($pConfig->loginFilteredLayers, $layername) ) {
          $oAttribute = $pConfig->loginFilteredLayers->$layername->filterAttribute;
          $attribute = strtolower($oAttribute);

          if($isConnected){
            $user = jAuth::getUserSession();
            $login = $user->login;
            if (property_exists($pConfig->loginFilteredLayers->$layername, 'filterPrivate')
             && $pConfig->loginFilteredLayers->$layername->filterPrivate == 'True')
            {
              $serverFilterArray[$layername] = "\"$attribute\" IN ( '".$login."' , 'all' )";
            } else {
              $userGroups = jAcl2DbUserGroup::getGroups();
              $flatGroups = implode("' , '", $userGroups);
              $serverFilterArray[$layername] = "\"$attribute\" IN ( '".$flatGroups."' , 'all' )";
            }
          }else{
            // The user is not authenticated: only show data with attribute = 'all'
            $serverFilterArray[$layername] = "\"$attribute\" = 'all'";
          }

        }
      }

      // Set filter if needed
      if(count($serverFilterArray)>0){

        // WFS : EXP_FILTER
        if( $request == 'getfeature' ){
          $filter = ''; $s = '';
          if( !empty( $clientExpFilter ) ){
            $filter = $clientExpFilter;
            $s = ' AND ';
          }
          if(count($serverFilterArray) > 0){
            foreach($serverFilterArray as $lname=>$lfilter){
              $filter.= $s . $lfilter;
              $s = ' AND ';
            }
          }
          $this->params['exp_filter'] = $filter;
          if( array_key_exists('propertyname', $this->params)  ){
            $propertyName = trim($this->params["propertyname"]);
            if( !empty($propertyName) )
            $this->params["propertyname"].= ",$oAttribute";
          }
        }
        // WMS : FILTER
        else{
          if( !empty( $clientFilter ) ){
            $cfexp = explode(';', $clientFilter);
            foreach($cfexp as $a){
              $b = explode(':', $a);
              $lname = trim($b[0]);
              $lfilter = trim($b[1]);
              if(array_key_exists( $lname, $serverFilterArray) ){
                $serverFilterArray[$lname] .= ' AND ' . $lfilter;
              }else{
                $serverFilterArray[$lname] = $lfilter;
              }
            }
          }
          $filter = ''; $s = '';
          foreach($serverFilterArray as $lname=>$lfilter){
            $filter.= $s . $lname . ':' . $lfilter;
            $s = ';';
          }
          if( count($serverFilterArray) > 0 )
            $this->params['filter'] = $filter;
        }
      }

    }

  }


  /**
  * GetCapabilities
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory.
  * @return JSON configuration file for the specified project.
  */
  function GetCapabilities(){
        $service = strtolower($this->params['service']);
        $request = null;
        if( $service == 'wms' ) {
            $version = '1.3.0';
            if ( array_key_exists( 'version', $this->params ) ) {
                $version = $this->params['version'];
            }
            $request = new lizmapWMSRequest( $this->project, array(
                    'service'=>'WMS',
                    'request'=>'GetCapabilities',
                    'version'=>$version
                )
            );
        } else if( $service == 'wfs' ) {
            $request = new lizmapWFSRequest( $this->project, array(
                    'service'=>'WFS',
                    'request'=>'GetCapabilities'
                )
            );
        } else if( $service == 'wmts' ) {
            $request = new lizmapWMTSRequest( $this->project, array(
                    'service'=>'WMTS',
                    'request'=>'GetCapabilities'
                )
            );
        }
        $result = $request->process();

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload  =  false;
        $rep->outputFileName  =  'qgis_server_'.$service.'_capabilities_'.$this->repository->getKey().'_'.$this->project->getKey();

    return $rep;
  }

  /**
  * GetContext
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory.
  * @return jResponse text/xml Web Map Context.
  */
  function GetContext(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    $url = $this->services->wmsServerURL.'?';

    $bparams = http_build_query($this->params);
    $querystring = $url . $bparams;

    // Get remote data
    list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

    // Replace qgis server url in the XML (hide real location)
    $sUrl = jUrl::getFull(
      "lizmap~service:index",
      array(
          "repository"=>$this->repository->getKey(),
          "project"=>$this->project->getKey()
      ),
      0,
      $_SERVER['SERVER_NAME']
    );
    $sUrl = str_replace('&', '&amp;', $sUrl);
    $data = preg_replace('/xlink\:href=".*"/', 'xlink:href="'.$sUrl.'&amp;"', $data);

    // Return response
    $rep = $this->getResponse('binary');
    $rep->mimeType = $mime;
    $rep->content = $data;
    $rep->doDownload = false;
    $rep->outputFileName  =  'qgis_server_getContext';

    return $rep;
  }

  /**
  * GetSchemaExtension
  * @param string $SERVICE mandatory, has to be WMS
  * @param string $REQUEST mandatory, has to be GetSchemaExtension
  * @return text/xml the WMS GEtCapabilities 1.3.0 Schema Extension.
  */
  function GetSchemaExtension(){
    $data = '<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://www.w3.org/2001/XMLSchema" xmlns:wms="http://www.opengis.net/wms" xmlns:qgs="http://www.qgis.org/wms" targetNamespace="http://www.qgis.org/wms" elementFormDefault="qualified" version="1.0.0">
  <import namespace="http://www.opengis.net/wms" schemaLocation="http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd"/>
  <element name="GetPrint" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
  <element name="GetPrintAtlas" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
  <element name="GetStyles" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
</schema>';
    // Return response
    $rep = $this->getResponse('binary');
    $rep->mimeType = 'text/xml';
    $rep->content = $data;
    $rep->doDownload = false;
    $rep->outputFileName  =  'qgis_server_schema_extension';
    return $rep;
  }

  /**
  * GetMap
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function GetMap(){

        //Get parameters  DELETED HERE SINCE ALREADY DONE IN index method
        //if(!$this->getServiceParameters())
            //return $this->serviceException();

        $wmsRequest = new lizmapWMSRequest( $this->project, $this->params );
        $result = $wmsRequest->process();
        if ( $result->data == 'error' ) {
            return $this->serviceException();
        }

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload  =  false;
        $rep->outputFileName  =  'qgis_server_wms_map_'.$this->repository->getKey().'_'.$this->project->getKey();
        $rep->setHttpStatus( $result->code, '' );

        if ( !preg_match('/^image/',$result->mime) )
            return $rep;

        // HTTP browser cache expiration time
        $layername = $this->params["layers"];
        $lproj = $this->project;
        $configLayers = $lproj->getLayers();
        if( property_exists($configLayers, $layername) ){
            $configLayer = $configLayers->$layername;
            if( property_exists($configLayer, 'clientCacheExpiration')){
                $clientCacheExpiration = (int)$configLayer->clientCacheExpiration;
                $rep->setExpires("+".$clientCacheExpiration." seconds");
            }
        }

        // log metric
        lizmap::logMetric('LIZMAP_SERVICE_GETMAP');

        return $rep;
  }


  /**
  * GetLegendGraphics
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image of the legend for 1 to n layers, returned by the Map Server
  */
  function GetLegendGraphics(){

        //Get parameters  DELETED HERE SINCE ALREADY DONE IN index method
        //if(!$this->getServiceParameters())
            //return $this->serviceException();

        $wmsRequest = new lizmapWMSRequest( $this->project, $this->params );
        $result = $wmsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload = false;
        $rep->outputFileName  =  'qgis_server_legend';

        return $rep;
  }


  /**
  * GetFeatureInfo
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Feature Info.
  */
  function GetFeatureInfo(){

    $globalResponse = '';

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    $lproj = $this->project;
    $pConfig = $lproj->getFullCfg();

    $externalWMSLayers = array();
    $QGISLayers = array();
    $queryLayers = explode(",",$this->iParam('QUERY_LAYERS'));

    // We split layers in two groups. First contains exernal WMS, second contains QGIS layers
    foreach ($queryLayers as $queryLayer) {
      if( property_exists($pConfig->layers, $queryLayer)
       && property_exists($pConfig->layers->$queryLayer, 'externalAccess')
       && $pConfig->layers->$queryLayer->externalAccess == 'True' ){
        $externalWMSLayers[] = $queryLayer;
      }else{
        $QGISLayers[] = $queryLayer;
      }
    }

    // External WMS
    foreach ($externalWMSLayers as $externalWMSLayer) {
      $url = $pConfig->layers->$externalWMSLayer->externalAccess->url;

      $externalWMSLayerParams = $this->params;

      $externalWMSLayerParams['layers'] = $externalWMSLayer;
      $externalWMSLayerParams['query_layers'] = $externalWMSLayer;

      $keyValueParameters = array();
      $paramsBlacklist = array('module', 'action', 'C', 'repository','project','exceptions','map');

      // We force info_format application/vnd.ogc.gml as default value.
      // TODO let user choose which format he wants in lizmap plugin
      $externalWMSLayerParams['info_format'] = 'application/vnd.ogc.gml';

      foreach($externalWMSLayerParams as $key=>$val){
        if(!in_array($key, $paramsBlacklist)){
          $keyValueParameters[] = strtolower($key).'='.urlencode($val);
        }
      }

      $querystring = $url . implode('&', $keyValueParameters);

      // Query external WMS layers
      list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

      $xml = simplexml_load_string($data);

      // Create HTML response
      if (count($xml->children())) {
        $layerstring = $externalWMSLayer.'_layer';
        $featurestring = $externalWMSLayer.'_feature';

        $layerTitle = $pConfig->layers->$externalWMSLayer->title;

        $HTMLResponse = "<h4>$layerTitle</h4><div class='lizmapPopupDiv'><table class='lizmapPopupTable'>";

        foreach ($xml->$layerstring->$featurestring->children() as $key => $value) {
          $HTMLResponse .= "<tr><td>$key&nbsp;:&nbsp;</td><td>$value</td></tr>";
        }
        $HTMLResponse .= '</table></div>';

        $globalResponse .= $HTMLResponse;
      }
    }

    // Query QGIS WMS layers
    if(!empty($QGISLayers)){
      $QGISLayersParams = $this->params;

      $QGISLayersParams['layers'] = implode(',', $QGISLayers);
      $QGISLayersParams['query_layers'] = implode(',', $QGISLayers);

      $url = $this->services->wmsServerURL.'?';

       // Deactivate info_format to use Lizmap instead of QGIS
       $toHtml = False;
       if($QGISLayersParams['info_format'] == 'text/html'){
         $toHtml = True;
         $QGISLayersParams['info_format'] = 'text/xml';
       }

       $bparams = http_build_query($QGISLayersParams);
       $querystring = $url . $bparams;

       // Get remote data
       list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

       // Get HTML content if needed
       if($toHtml and preg_match('#/xml#', $mime)){
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
     'project' => $this->project->getKey()
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
  * This method is used as callback in GetFeatureInfoHtml method for the preg_replace_callback
  * @param array $matches Array containing the preg matches
  * @return Replaced text.
  */
  protected function replaceMediaPathByMediaUrl($matches){
    $req = jApp::coord()->request;
    $return = '';
    $return.= '"';
    $return.= jUrl::getFull(
      'view~media:getMedia',
      array(
        'repository'=>$this->repository->getKey(),
        'project'=>$this->project->getKey(),
        'path'=>$matches[2]
      ),
      0,
      $req->getDomainName().$req->getPort()
    );
    $return.= '"';
    return $return;
  }


  /**
  * GetFeatureInfoHtml : return HTML for the getFeatureInfo.
  * @param array $params Array of parameters
  * @param string $xmldata XML data from getFeatureInfo
  * @return Feature Info in HTML format.
  */
  function getFeatureInfoHtml($params, $xmldata){

    // Get data from XML
    $use_errors = libxml_use_internal_errors(true);
    $go = true; $errorlist = array();
    // Create a DOM instance
    $xml = simplexml_load_string($xmldata);
    if(!$xml) {
      foreach(libxml_get_errors() as $error) {
        $errorlist[] = $error;
      }
      $go = false;
    }

    // Get json configuration for the project
    $configLayers = $this->project->getLayers();

    // Get optional parameter fid
    $filterFid = null;
    $fid = $this->param('fid');
    if( $fid ){
      $expFid = explode( '.', $fid );
      if( count( $expFid ) == 2 ) {
        $filterFid = array();
        $filterFid[ $expFid[0] ] = $expFid[1];
      }

    }

    // Loop through the layers
    $content = array();
    $ptemplate = 'view~popup';
    $popupClass = jClasses::getService('view~popup');

    foreach($xml->Layer as $layer){
      $layername = $layer['name'];
      $configLayer = $this->project->findLayerByAnyName( $layername );
      if ( $configLayer == null )
        continue;


      // Avoid layer if no popup asked by the user for it
      // or if no popup property
      // or if no edition
      $returnPopup = False;
      if( property_exists($configLayer, 'popup') && $configLayer->popup == 'True' )
        $returnPopup = True;

      if ( !$returnPopup ){
        $editionLayer = $this->project->findEditionLayerByLayerId( $configLayer->id );
        if ( $editionLayer != null && ( $editionLayer->capabilities->modifyGeometry == 'True'
                                     || $editionLayer->capabilities->modifyAttribute == 'True'
                                     || $editionLayer->capabilities->deleteFeature == 'True') )
          $returnPopup = True;
      }

      if ( !$returnPopup )
        continue;

      // Get layer title
      $layerTitle = $configLayer->title;
      $layerId = $configLayer->id;

      // Get the template for the popup content
      $templateConfigured = False;
      if(property_exists($configLayer, 'popupTemplate')){
        // Get template content
        $popupTemplate = (string)trim($configLayer->popupTemplate);
        // Use it if not empty
        if(!empty($popupTemplate)){
          $templateConfigured = True;
          // first replace all "media/bla/bla/llkjk.ext" by full url
          $popupTemplate = preg_replace_callback(
            '#(["\']){1}(media/.+\.\w{3,10})(["\']){1}#',
            Array($this, 'replaceMediaPathByMediaUrl'),
            $popupTemplate
          );
          // Replace : html encoded chars to let further regexp_replace find attributes
          $popupTemplate = str_replace(array('%24', '%7B', '%7D'), array('$', '{', '}'), $popupTemplate);
        }
      }

      // Loop through the features
      $popupMaxFeatures = 10;
      if( property_exists($configLayer, 'popupMaxFeatures') && is_numeric($configLayer->popupMaxFeatures) )
          $popupMaxFeatures = $configLayer->popupMaxFeatures + 0;
      $layerFeaturesCounter = 0;
      foreach($layer->Feature as $feature){
        $id = $feature['id'];
        // Optionnally filter by feature id
        if ($filterFid &&
            isset($filterFid[$configLayer->name]) &&
            $filterFid[$configLayer->name] != $id) {
          continue;
        }

        if($layerFeaturesCounter == $popupMaxFeatures){
          break;
        }
        $layerFeaturesCounter++;

        // Hidden input containing layer id and feature id
        $hiddenFeatureId = '<input type="hidden" value="' . $layerId . '.' .$id.'" class="lizmap-popup-layer-feature-id"/>
        ';

        // First get default template
        $tpl = new jTpl();
        $tpl->assign('attributes', $feature->Attribute);
        $tpl->assign('repository', $this->repository->getKey());
        $tpl->assign('project', $this->project->getKey());
        $popupFeatureContent = $tpl->fetch('view~popupDefaultContent');
        $autoContent = $popupFeatureContent;

        // Get specific template for the layer has been configured
        if($templateConfigured){

          $popupFeatureContent = $popupTemplate;

          // then replace all column data by appropriate content
          foreach($feature->Attribute as $attribute){
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

        foreach($feature->Attribute as $attribute){
          if($attribute['name'] == 'maptip'){
            $hasMaptip = true;
            $maptipValue = $attribute['value'];
          }
          else if ($attribute['name'] == 'geometry'){
            $hasGeometry = true;
            $geometryValue = $attribute['value'];
          }
        }
        // If there is a maptip attribute we display its value
        if($hasMaptip){
          // first replace all "media/bla/bla/llkjk.ext" by full url
          $maptipValue = preg_replace_callback(
            '#(["\']){1}(media/.+\.\w{3,10})(["\']){1}#',
            Array($this, 'replaceMediaPathByMediaUrl'),
            $maptipValue
          );
          // Replace : html encoded chars to let further regexp_replace find attributes
          $maptipValue = str_replace(array('%24', '%7B', '%7D'), array('$', '{', '}'), $maptipValue);
          $qgisContent = $maptipValue;
        }

        // Get the BoundingBox data
        $hiddenGeometry = '';
        if ( $hasGeometry && $feature->BoundingBox) {
            $hiddenGeometry = '<input type="hidden" value="'. $geometryValue. '" class="lizmap-popup-layer-feature-geometry"/>
        ';
            $bbox = $feature->BoundingBox[0];
            $hiddenGeometry.= '<input type="hidden" value="'. $bbox['CRS']. '" class="lizmap-popup-layer-feature-crs"/>
        ';
            $hiddenGeometry.= '<input type="hidden" value="'. $bbox['minx']. '" class="lizmap-popup-layer-feature-bbox-minx"/>
        ';
            $hiddenGeometry.= '<input type="hidden" value="'. $bbox['miny']. '" class="lizmap-popup-layer-feature-bbox-miny"/>
        ';
            $hiddenGeometry.= '<input type="hidden" value="'. $bbox['maxx']. '" class="lizmap-popup-layer-feature-bbox-maxx"/>
        ';
            $hiddenGeometry.= '<input type="hidden" value="'. $bbox['maxy']. '" class="lizmap-popup-layer-feature-bbox-maxy"/>
        ';
        }

        // New option to choose the popup source : auto (=default), lizmap (=popupTemplate), qgis (=qgis maptip)
        $finalContent = $autoContent;
        if(property_exists($configLayer, 'popupSource')){
            if( $configLayer->popupSource == 'qgis' and $hasMaptip )
                $finalContent = $qgisContent;
            if( $configLayer->popupSource == 'lizmap' and $templateConfigured )
                $finalContent = $lizmapContent;
        }

        $tpl = new jTpl();
        $tpl->assign('layerTitle', $layerTitle);
        $tpl->assign('popupContent', $hiddenFeatureId . $hiddenGeometry . $finalContent);
        $content[] = $tpl->fetch('view~popup');

      } // loop features

      // Raster Popup
      if ( count($layer->Attribute) > 0 ){
        $tpl = new jTpl();
        $tpl->assign('attributes', $layer->Attribute);
        $tpl->assign('repository', $this->repository->getKey());
        $tpl->assign('project', $this->project->getKey());
        $popupRasterContent = $tpl->fetch('view~popupRasterContent');

        $tpl = new jTpl();
        $tpl->assign('layerTitle', $layerTitle);
        $tpl->assign('popupContent', $popupRasterContent);
        $content[] = $tpl->fetch('view~popup');
      }

    } // loop layers

    $content = array_reverse($content);
    return implode( "\n", $content);
  }



  /**
  * GetPrint
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function GetPrint(){

    /*
    foreach($this->params as $key=>$val){
      print $key. "=>". $val."\n";
    }
     */

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

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
    $paramsBlacklist = array('module', 'action', 'C', 'repository','project');
    foreach($this->params as $key=>$val){
      if(!in_array($key, $paramsBlacklist)){
        $data[] = strtolower($key).'='.urlencode($val);
      }
    }
    $querystring = $url . implode('&', $data);

    // Get remote data
    list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring, array('method'=>'post'));

    $rep = $this->getResponse('binary');
    $rep->mimeType = $mime;
    $rep->content = $data;
    $rep->doDownload  =  false;
    $rep->outputFileName  =  $this->project->getKey() . '_' . preg_replace("#[\W]+#", '_', $this->params['template']) . '.' . $this->params['format'];

   // Log
   $logContent ='
     <a href="'.jUrl::get('lizmap~service:index',jApp::coord()->request->params).'" target="_blank">'.$this->params['template'].'<a>
     ';
   $eventParams = array(
    'key' => 'print',
    'content' => $logContent,
    'repository' => $this->repository->getKey(),
    'project' => $this->project->getKey()
   );
   jEvent::notify('LizLogItem', $eventParams);

    return $rep;
  }




  /**
  * GetPrintAtlas
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function GetPrintAtlas(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    $url = $this->services->wmsServerURL.'?';

    // Filter the parameters of the request
    // for querying GetPrint
    $data = array();
    $paramsBlacklist = array('module', 'action', 'C', 'repository','project');
    foreach($this->params as $key=>$val){
      if(!in_array($key, $paramsBlacklist)){
        $data[] = strtolower($key).'='.urlencode($val);
      }
    }
    $querystring = $url . implode('&', $data);

    // Get remote data
    list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring, array('method'=>'post'));

    $rep = $this->getResponse('binary');
    $rep->mimeType = $mime;
    $rep->content = $data;
    $rep->doDownload  =  false;
    $rep->outputFileName  =  $this->project->getKey() . '_' . preg_replace("#[\W]+#", '_', $this->params['template']) . '.' . $this->params['format'];

   // Log
   $logContent ='
     <a href="'.jUrl::get('lizmap~service:index',jApp::coord()->request->params).'" target="_blank">'.$this->params['template'].'<a>
     ';
   $eventParams = array(
    'key' => 'print',
    'content' => $logContent,
    'repository' => $this->repository->getKey(),
    'project' => $this->project->getKey()
   );
   jEvent::notify('LizLogItem', $eventParams);

    return $rep;
  }

  /**
  * GetStyles
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return SLD Style XML
  */
  function GetStyles(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    // Construction of the request url : base url + parameters
    $url = $this->services->wmsServerURL.'?';
    $bparams = http_build_query($this->params);
    $querystring = $url . $bparams;

    // Get remote data
    list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

    // Return response
    $rep = $this->getResponse('binary');
    $rep->mimeType = 'text/xml';
    $rep->content = $data;
    $rep->doDownload  =  false;
    $rep->outputFileName  =  'qgis_style';

    return $rep;
  }


  /**
  * Send the JSON configuration file for a specified project
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project
  * @return JSON configuration file for the specified project.
  */
  function getProjectConfig(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    $rep = $this->getResponse('text');
    $rep->content = $this->project->getUpdatedConfig();
    return $rep;

  }

  /**
  * PostRequest
  * @param string $xml_post
  * @return request.
  */
  protected function PostRequest( $xml_post ){
    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    $url = $this->services->wmsServerURL.'?';

    // Filter the parameters of the request
    $data = array();
    $paramsBlacklist = array('module', 'action', 'C', 'repository','project');
    foreach($this->params as $key=>$val){
      if(!in_array($key, $paramsBlacklist)){
        $data[] = strtolower($key).'='.urlencode($val);
      }
    }
    $querystring = $url . implode('&', $data);

    // Get data form server
    list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring , array(
        "method" => "post",
        "headers" => array('Content-Type' => 'text/xml'),
        "body" => $xml_post
    ));

    $rep = $this->getResponse('binary');
    $rep->mimeType = $mime;
    $rep->content = $data;
    $rep->doDownload = false;
    $rep->outputFileName = 'post_request';
    return $rep;
  }

  /**
  * GetFeature
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function GetFeature(){

    $wfsRequest = new lizmapWFSRequest( $this->project, $this->params );
    $result = $wfsRequest->process();

    $rep = $this->getResponse('binary');
    $rep->mimeType = $result->mime;

    if(property_exists($result, 'file') and $result->file and is_file($result->data) ){
        $rep->fileName = $result->data;
    }else{
        $rep->content = $result->data; // causes memory_limit for big content
    }
    $rep->doDownload = false;
    $rep->outputFileName  =  'qgis_server_wfs';

    // Export
    $dl = $this->param('dl');
    if( $dl ){
      // force download
      $rep->doDownload = true;

      if(property_exists($result, 'file') and $result->file and is_file($result->data) ){
          $rep->fileName = $result->data;
      }else{
        // debug 1st line blank from QGIS Server
        $rep->content = preg_replace('/^[\n\r]/', '', $result->data);
      }
      // Change file name
      $zipped_files = array('shp','mif','tab');
      if ( in_array( strtolower($this->params['outputformat']), $zipped_files ) )
        $rep->outputFileName = 'export_' . $this->params['typename'] . '.zip';
      else
        $rep->outputFileName = 'export_' . $this->params['typename'] . '.' . strtolower( $this->params['outputformat'] );
    }

    return $rep;
  }

  /**
  * DescribeFeatureType
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function DescribeFeatureType(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    // Extensions to get aliases and type
    $returnJson = false;
    if ( strtolower( $this->params['outputformat'] ) == 'json' ) {
        $this->params['outputformat'] = 'XMLSCHEMA';
        $returnJson = true;
    }

    // Construction of the request url : base url + parameters
    $url = $this->services->wmsServerURL.'?';
    $bparams = http_build_query($this->params);
    $querystring = $url . $bparams;

    // Get remote data
    list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

    if( $returnJson ) {
        $jsonData = array();

        $layer = $this->project->findLayerByAnyName( $this->params['typename'] );
        if ( $layer != null ) {

            // Get data from XML
            $use_errors = libxml_use_internal_errors(true);
            $go = true; $errorlist = array();
            // Create a DOM instance
            $xml = simplexml_load_string($data);
            if(!$xml) {
              foreach(libxml_get_errors() as $error) {
                $errorlist[] = $error;
              }
              $go = false;
            }
            if( $go && $xml->complexType ) {
                $layername = $layer->name;
                $typename = (string)$xml->complexType->attributes()->name;
                if( $typename == $layername.'Type' ) {
                    $jsonData['name'] = $layername;
                    $types = array();
                    $elements = $xml->complexType->complexContent->extension->sequence->element;
                    foreach($elements as $element) {
                        $types[(string)$element->attributes()->name] = (string)$element->attributes()->type;
                    }
                    $jsonData['types'] = (object) $types;
                }
            }
            $layer = $this->project->getLayer( $layer->id );
            $aliases = $layer->getAliasFields();
            $jsonData['aliases'] = (object) $aliases;
        }
        $jsonData = json_encode( (object) $jsonData );

        // Return response
        $rep = $this->getResponse('binary');
        $rep->mimeType = 'text/json; charset=utf-8';
        $rep->content = $jsonData;
        $rep->doDownload  =  false;
        $rep->outputFileName  =  'qgis_server_wfs';

        return $rep;
    }

    // Return response
    $rep = $this->getResponse('binary');
    $rep->mimeType = $mime;
    $rep->content = $data;
    $rep->doDownload  =  false;
    $rep->outputFileName  =  'qgis_server_wfs';

    return $rep;
  }




  /**
  * GetProj4
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @param string $authid SRS or CRS authid like USER:*
  * @return Image rendered by the Map Server.
  */
  function GetProj4(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    // Return response
    $rep = $this->getResponse('text');
    $content = $this->project->getProj4( $this->iParam('authid') );
    $content = (string)$content[0];
    $rep->content = $content;
    $rep->setExpires("+300 seconds");
    return $rep;
  }

  function GetTile(){
        $wmsRequest = new lizmapWMTSRequest( $this->project, $this->params );
        $result = $wmsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload  =  false;
        $rep->outputFileName  =  'qgis_server_wmts_tile_'.$this->repository->getKey().'_'.$this->project->getKey();
        $rep->setHttpStatus( $result->code, '' );

        if ( !preg_match('/^image/',$result->mime) )
            return $rep;

        // HTTP browser cache expiration time
        $layername = $this->params["layer"];
        $lproj = $this->project;
        $configLayers = $lproj->getLayers();
        if( property_exists($configLayers, $layername) ){
            $configLayer = $configLayers->$layername;
            if( property_exists($configLayer, 'clientCacheExpiration')){
                $clientCacheExpiration = (int)$configLayer->clientCacheExpiration;
                $rep->setExpires("+".$clientCacheExpiration." seconds");
            }
        }
        lizmap::logMetric('LIZMAP_SERVICE_GETMAP');
        return $rep;
  }

  private function _getSelectionToken($repository, $project, $typename, $ids){
    $token = md5($repository . $project . $typename . implode(',', $ids));

    $data = jCache::get($token);
    $incache = True;
    if(!$data or true){
      $data = array();
      $data['token'] = $token;
      $data['typename'] = $typename;
      $data['ids'] = $ids;
      $incache = False;
      jCache::set($token, json_encode($data), 3600);
    }else{
      $data = json_decode($data);
    }

    return $data;
  }

  function getSelectionToken(){
    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    // Prepare response
    $rep = $this->getResponse('json');

    // Get params
    $typename = $this->params["typename"];
    $ids = explode(',', $this->params["ids"]);
    sort($ids);

    // Token
    $data = $this->_getSelectionToken($this->iParam('repository'), $this->iParam('project'), $typename, $ids);
    $json = array();
    $json['token'] = $data['token'];

    $rep->data = $json;

    return $rep;
  }

  private function _getFilterToken($repository, $project, $typename, $filter){
    $token = md5($repository . $project . $typename . $filter);

    $data = jCache::get($token);
    $incache = True;
    if(!$data or true){
      $data = array();
      $data['token'] = $token;
      $data['typename'] = $typename;
      $data['filter'] = $filter;
      $incache = False;
      jCache::set($token, json_encode($data), 3600);
    }else{
      $data = json_decode($data);
    }

    return $data;
  }

  function getFilterToken(){
    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    // Prepare response
    $rep = $this->getResponse('json');

    // Get params
    $typename = $this->params["typename"];
    $filter = $this->params["filter"];

    // Token
    $data = $this->_getFilterToken($this->iParam('repository'), $this->iParam('project'), $typename, $filter);
    $json = array();
    $json['token'] = $data['token'];

    $rep->data = $json;

    return $rep;
  }
}
