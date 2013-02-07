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


  private $project = ''; 
  private $repository = ''; 
  private $params = ''; 
  private $lizmapConfig = ''; 
  private $lizmapCache = '';
  

  /**
  * Redirect to the appropriate action depending on the REQUEST parameter.
  * @param $PROJECT Name of the project
  * @param $REQUEST Request type
  * @return Redirect to the corresponding action depending on the request parameters
  */
  function index() {
    if (isset($_SERVER['PHP_AUTH_USER'])) {
      $ok = jAuth::login($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
    }

    $rep = $this->getResponse('redirect');

    // Get the project
    $project = $this->param('project');
    if(!$project){
      // Error message
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return $this->serviceException();
    }

    // Return the appropriate action
    $request = $this->param('REQUEST');
    if($request == "GetCapabilities")
      return $this->getCapabilities();
    elseif ($request == "GetLegendGraphics")
      return $this->GetLegendGraphics();
    elseif ($request == "GetFeatureInfo")
      return $this->GetFeatureInfo();
    elseif ($request == "GetPrint")
      return $this->GetPrint();
    elseif ($request == "GetMap")
      return $this->GetMap();
    elseif ($request == "GetFeature")
      return $this->GetFeature();
    else{
      jMessage::add('Wrong REQUEST parameter given', 'InvalidRequest');
      return $this->serviceException();
    }
  }


  /**
  * Send an OGC service Exception
  * @param $SERVICE the OGC service
  * @return XML OGC Service Exception.
  */
  function serviceException(){
    $messages = jMessage::getAll();

    $rep = $this->getResponse('xml');
    $rep->contentTpl = 'lizmap~wms_exception';
    $rep->content->assign('messages', $messages);
    jMessage::clearAll();

    return $rep;
  }


  /**
  * Get parameters and set lizmapConfig for the project and repository given.
  *
  * @return array List of needed variables : $params, $lizmapConfig, $lizmapCache.
  */
  private function getServiceParameters(){
  
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return false;
    }

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Redirect if no rights to access this repository
    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return false;
    }
    
    // Get and normalize the passed parameters
    $pParams = jApp::coord()->request->params;
    $pParams['map'] = $lizmapConfig->repositoryData['path'].$project.".qgs";  
    $lizmapCache = jClasses::getService('lizmap~lizmapCache');
    $params = $lizmapCache->normalizeParams($pParams);
    
    // Define class private properties   
    $this->project = $project;
    $this->repository = $repository;
    $this->params = $params;
    $this->lizmapConfig = $lizmapConfig;
    $this->lizmapCache = $lizmapCache;
    
    return true;
    
    
  }


  /**
  * GetCapabilities
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory.
  * @return JSON configuration file for the specified project.
  */
  function GetCapabilities(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();
    
    $url = $this->lizmapConfig->wmsServerURL.'?';

    $bparams = http_build_query($this->params);
    $querystring = $url . $bparams;

    // Get remote data
    $getRemoteData = $this->lizmapCache->getRemoteData(
      $querystring,
      $this->lizmapConfig->proxyMethod,
      $this->lizmapConfig->debugMode
    );
    $data = $getRemoteData[0];
    $mime = $getRemoteData[1];

    // Replace qgis server url in the XML (hide real location)
    $sUrl = jUrl::getFull(
      "lizmap~service:index",
      array("repository"=>$this->repository, "project"=>$this->project),
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
    $rep->outputFileName  =  'qgis_server_getCapabilities';

    return $rep;
  }

  /**
  * GetMap
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function GetMap(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();
    
    $content = $this->lizmapCache->getServiceData($this->repository, $this->project, $this->params);

    // Return response
    $rep = $this->getResponse('binary');
    if(preg_match('#png#', $this->params['format']))
      $rep->mimeType = 'image/png';
    else
      $rep->mimeType = 'image/jpeg';
    $rep->content = $content;
    $rep->doDownload  =  false;
    $rep->outputFileName  =  'qgis_server';

    return $rep;
  }


  /**
  * GetLegendGraphics
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image of the legend for 1 to n layers, returned by the Map Server
  */
  function GetLegendGraphics(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();
      
    $url = $this->lizmapConfig->wmsServerURL.'?';
    $bparams = http_build_query($this->params);
    // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
    $a = array('+', '_', '.', '-');
    $b = array('%20', '%5F', '%2E', '%2D');
    $bparams = str_replace($a, $b, $bparams); 
    $querystring = $url . $bparams;

    // Get remote data
    $getRemoteData = $this->lizmapCache->getRemoteData(
      $querystring,
      $this->lizmapConfig->proxyMethod,
      $this->lizmapConfig->debugMode
    );
    $data = $getRemoteData[0];
    $mime = $getRemoteData[1];

    $rep = $this->getResponse('binary');
    $rep->mimeType = $mime;
    $rep->content = $data;
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

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();
      
    $url = $this->lizmapConfig->wmsServerURL.'?';

    // Deactivate info_format to use Lizmap instead of QGIS
    $toHtml = False;
    if($this->params['info_format'] == 'text/html'){
      $toHtml = True;
      $this->params['info_format'] = 'text/xml';
    }

    $bparams = http_build_query($this->params);
    $querystring = $url . $bparams;

    // Get remote data
    $getRemoteData = $this->lizmapCache->getRemoteData(
      $querystring,
      $this->lizmapConfig->proxyMethod,
      $this->lizmapConfig->debugMode
    );
    $data = $getRemoteData[0];
    $mime = $getRemoteData[1];

    // Get HTML content if needed
    if($toHtml and preg_match('#/xml$#', $mime)){
      $data = $this->getFeatureInfoHtml($this->params, $data, $this->lizmapConfig, $this->project);
      $mime = 'text/html';
    }

    $rep = $this->getResponse('binary');
    $rep->mimeType = $mime;
    $rep->content = $data;
    $rep->doDownload = false;
    $rep->outputFileName = 'getFeatureInfo';

    return $rep;
  }


  /**
  * GetFeatureInfoHtml : return HTML for the getFeatureInfo.  
  * @param array $params Array of parameters
  * @param string $xmldata XML data from getFeatureInfo
  * @param object $lizmapConfig Lizmap configuration for the repository
  * @param $project Name of the project : mandatory
  * @return Feature Info in HTML format.
  */
  function getFeatureInfoHtml($params, $xmldata, $lizmapConfig, $project){

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
    $qgsPath = $lizmapConfig->repositoryData['path'].$project.'.qgs';
    $configRead = jFile::read($qgsPath.'.cfg');
    $configLayers = json_decode($configRead)->layers;

    // Loop through the layers
    $content = '';
    $ptemplate = 'view~popup';
    $lizmapCache = jClasses::getService('lizmap~lizmapCache');
    $popupClass = jClasses::getService('view~popup');

    foreach($xml->Layer as $layer){
      $layername = $layer['name'];

      // Avoid layer if no popup asked by the user for it
      // or if no popup property
      if(property_exists($configLayers->$layername, 'popup')){
        if($configLayers->$layername->popup != 'True'){
          continue;
        }
      }
      else{
        continue;
      }



      // Get the template for the popup content
      $templateConfigured = False;
      if(property_exists($configLayers->$layername, 'popupTemplate')){
        // Get template content
        $popupTemplate = (string)trim($configLayers->$layername->popupTemplate);
        // Use it if not empty
        if(!empty($popupTemplate)){
          $templateConfigured = True;
          // first replace all "media/bla/bla/llkjk.ext" by full url       
          $popupTemplate = preg_replace_callback(
            '#(["\']){1}(media/.+\.\w{3,10})(["\']){1}#', 
            create_function(
              '$matches',
              'return jUrl::getFull(
                \'view~media:getMedia\',
                array(\'repository\'=>$repository, \'project\'=>$project, \'path\'=>$matches[2]),
                0,
                $_SERVER[\'SERVER_NAME\']
                );'
            ),
            $popupTemplate
          );        
        }

      }

      // Loop through the features
      foreach($layer->Feature as $feature){
        $id = $feature['id'];
        // Specific template for the layer has been configured
        if($templateConfigured){

          $popupFeatureContent = $popupTemplate;
          
          // then replace all column data by appropriate content
          foreach($feature->Attribute as $attribute){
            // Replace #col and $col by colomn name and value
            $popupFeatureContent = $popupClass->getHtmlFeatureAttribute(
              $attribute['name'],
              $attribute['value'],
              $lizmapConfig->repositoryKey,
              $project,
              $popupFeatureContent
            );
          }
        }
        // Use default template if needed
        else{
          $tpl = new jTpl();
          $tpl->assign('attributes', $feature->Attribute);
          $tpl->assign('repository', $lizmapConfig->repositoryKey);
          $tpl->assign('project', $project);
          $popupFeatureContent = $tpl->fetch('view~popupDefaultContent');
        }

        $tpl = new jTpl();
        $tpl->assign('layername', $layername);
        $tpl->assign('popupContent', $popupFeatureContent);
        $content.= $tpl->fetch('view~popup');

      } // loop features

    } // loop layers

    return $content;
  }



  /**
  * GetPrint
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function GetPrint(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();
      
    $url = $this->lizmapConfig->wmsServerURL.'?';
    $bparams = http_build_query($this->params);
    // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
    $a = array('+', '_', '.', '-');
    $b = array('%20', '%5F', '%2E', '%2D');
    $bparams = str_replace($a, $b, $bparams); 
    $querystring = $url . $bparams;

    // Get remote data
    $getRemoteData = $this->lizmapCache->getRemoteData(
      $querystring,
      $this->lizmapConfig->proxyMethod,
      $this->lizmapConfig->debugMode
    );
    $data = $getRemoteData[0];
    $mime = $getRemoteData[1];

    $rep = $this->getResponse('binary');
    $rep->mimeType = $mime;
    $rep->content = $data;
    $rep->doDownload  =  false;
    $rep->outputFileName  =  'getPrint';

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
      
    // Read the QGIS project file to get the layer drawing order
    $qgisProjectClass = jClasses::getService('lizmap~qgisProject');
    $xpath = '//legendlayer';
    list($go, $qgsLoad, $xpathItems, $errorlist) = $qgisProjectClass->readQgisProject($this->lizmapConfig, $this->project, $xpath);
    $legend = $qgsLoad->xpath('//legend');
    $legendZero = $legend[0];
    $updateDrawingOrder = (string)$legendZero->attributes()->updateDrawingOrder;
    
    $layersOrder = array();  
    if($go and $updateDrawingOrder == 'false'){
      $layers =  $xpathItems;
      foreach($layers as $layer){
        if($layer->attributes()->drawingOrder and $layer->attributes()->drawingOrder >= 0){
          $layersOrder[(string)$layer->attributes()->name] = (integer)$layer->attributes()->drawingOrder;
        }
      }
    }
    
    // Get the corresponding Qgis project configuration
    $configPath = $this->lizmapConfig->repositoryData['path'].$this->project.'.qgs.cfg';
    
    // Read Json content from config file
    $configRead = jFile::read($configPath);   
    
    // Remove layerOrder option from config if not required 
    if(!empty($layersOrder)){
      $configJson = json_decode($configRead);
      $configJson->layersOrder = $layersOrder;
      $configRead = json_encode($configJson);
    }
    
    // Remove annotationLayers from config if no right to access this tool
    // Or if no ability to load spatialite extension
    $spatial = false;
    try{
      $db = new SQLite3(':memory:');
      $spatial = $db->loadExtension('libspatialite.so'); # loading SpatiaLite as an extension
    }catch(Exception $e){
      $spatial = False;
    }    
    if(!$spatial or !jacl2::check('lizmap.tools.annotation.use', $this->lizmapConfig->repositoryKey)){
      $configJson = json_decode($configRead);
      unset($configJson->annotationLayers);
      $configRead = json_encode($configJson);      
    }
    
    $rep = $this->getResponse('text');
    $rep->content = $configRead;
    return $rep;

  }

  /**
  * GetFeature
  * @param string $repository Lizmap Repository
  * @param string $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function GetFeature(){

    // Get parameters
    if(!$this->getServiceParameters())
      return $this->serviceException();

    // Construction of the request url : base url + parameters
    $url = $this->lizmapConfig->wmsServerURL.'?';
    $bparams = http_build_query($this->params);
    $querystring = $url . $bparams;

    // Get remote data
    $getRemoteData = $this->lizmapCache->getRemoteData(
      $querystring,
      $this->lizmapConfig->proxyMethod,
      $this->lizmapConfig->debugMode
    );
    $data = $getRemoteData[0];
    $mime = $getRemoteData[1];

    // Return response
    $rep = $this->getResponse('binary');
    if(preg_match('#^GML#', $this->params['outputformat']))
      $rep->mimeType = 'text/xml';
    else
      $rep->mimeType = 'text/json';
    $rep->content = $data;
    $rep->doDownload  =  false;
    $rep->outputFileName  =  'qgis_server_wfs';

    return $rep;
  }

}
