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
    else{
      jMessage::add('Wrong REQUEST parameter given', 'InvalidRequest');
      return $this->serviceException();
    }
  }


  /**
  * GetCapabilities
  * @param $project Name of the project : mandatory.
  * @return JSON configuration file for the specified project.
  */
  function GetCapabilities(){

    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return $this->serviceException();
    }

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return $this->serviceException();
    }

    // Get the passed parameters
    $myParams = array_keys(jApp::coord()->request->params);

    // Construction of the request url
    $querystring = $lizmapConfig->wmsServerURL."?";
    $querystring.= "map=".$lizmapConfig->repositoryData['path'].$project.".qgs";

    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
          $querystring .= "&".$param."=".jApp::coord()->request->params[$param];
      }
    }

    // Get remote data
    $lizmapCache = jClasses::getService('lizmap~lizmapCache');
    $getRemoteData = $lizmapCache->getRemoteData(
      $querystring,
      $lizmapConfig->proxyMethod,
      $lizmapConfig->debugMode
    );
    $data = $getRemoteData[0];
    $mime = $getRemoteData[1];

    // Replace qgis server url in the XML (hide real location)
    $sUrl = jUrl::getFull(
      "lizmap~service:index",
      array("repository"=>$repository, "project"=>$project),
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
  * @param $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function GetMap(){

    $rep = $this->getResponse('text');
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return $this->serviceException();
    }

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Redirect if no rights to access this repository
    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return $this->serviceException();
    }

    // Get the passed parameters
    $params = jApp::coord()->request->params;

    // Get data
    $lizmapCache = jClasses::getService('lizmap~lizmapCache');
    $params = $lizmapCache->normalizeParams($params);
    $content = $lizmapCache->getServiceData($repository, $project, $params);

    // Return response
    $rep = $this->getResponse('binary');
    if(preg_match('#png#', $params['format']))
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
  * @param $project Name of the project : mandatory
  * @return Image of the legend for 1 to n layers, returned by the Map Server
  */
  function GetLegendGraphics(){

    $rep = $this->getResponse('text');
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return $this->serviceException();
    }

    // Get the passed parameters
    $myParams = array_keys(jApp::coord()->request->params);

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Redirect if no rights to access this repository
    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return $this->serviceException();
    }

    // paramètres de la requête
    $params = array("map"=>$lizmapConfig->repositoryData['path'].$project.".qgs");
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $params[$param] = jApp::coord()->request->params[$param];
      }
    }

    // Construction of the request url : base url + parameters
    $url = $lizmapConfig->wmsServerURL.'?';
    $bparams = http_build_query($params);
    // On remplace certains caractères (plus besoin si php 5.4, alors utiliser le 4ème paramètre de http_build_query)
    $a = array('+', '_', '.', '-');
    $b = array('%20', '%5F', '%2E', '%2D');
    $bparams = str_replace($a, $b, $bparams);

    // Get remote data
    $lizmapCache = jClasses::getService('lizmap~lizmapCache');
    $querystring = $url . $bparams;
    $getRemoteData = $lizmapCache->getRemoteData(
      $querystring,
      $lizmapConfig->proxyMethod,
      $lizmapConfig->debugMode
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
  * @param $project Name of the project : mandatory
  * @return Feature Info.
  */
  function GetFeatureInfo(){

    $rep = $this->getResponse('text');
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return $this->serviceException();
    }

    // Get the passed parameters
    $myParams = array_keys(jApp::coord()->request->params);

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Redirect if no rights to access this repository
    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return $this->serviceException();
    }

    // Request parameters
    $params = array("map"=>$lizmapConfig->repositoryData['path'].$project.".qgs");
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $params[$param] = jApp::coord()->request->params[$param];
      }
    }

    // Normalize params
    $lizmapCache = jClasses::getService('lizmap~lizmapCache');
    $params = $lizmapCache->normalizeParams($params);

    // Deactivate info_format to use Lizmap instead of QGIS
    $toHtml = False;
    if($params['info_format'] == 'text/html'){
      $toHtml = True;
      $params['info_format'] = 'text/xml';
    }

    // Construction of the request url : base url + parameters
    $url = $lizmapConfig->wmsServerURL.'?';
    $bparams = http_build_query($params);
#    // On remplace certains caractères (plus besoin si php 5.4, alors utiliser le 4ème paramètre de http_build_query)
#    $a = array('+', '_', '.', '-');
#    $b = array('%20', '%5F', '%2E', '%2D');
#    $bparams = str_replace($a, $b, $bparams);

    // Get remote data
    $querystring = $url . $bparams;
    $getRemoteData = $lizmapCache->getRemoteData(
      $querystring,
      $lizmapConfig->proxyMethod,
      $lizmapConfig->debugMode
    );
    $data = $getRemoteData[0];
    $mime = $getRemoteData[1];

    // Get HTML content if needed
    if($toHtml and preg_match('#/xml$#', $mime)){
      $data = $this->getFeatureInfoHtml($params, $data, $lizmapConfig, $project);
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
        if(!empty($popupTemplate))
          $templateConfigured = True;
      }

      // Loop through the features
      foreach($layer->Feature as $feature){
        $id = $feature['id'];
        // Specific template for the layer has been configured
        if($templateConfigured){

          $popupFeatureContent = $popupTemplate;

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
  * @param $project Name of the project : mandatory
  * @return Image rendered by the Map Server.
  */
  function GetPrint(){

    $rep = $this->getResponse('text');
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return $this->serviceException();
    }

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Redirect if no rights to access this repository
    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return $this->serviceException();
    }

    // Get the passed parameters
    $myParams = array_keys(jApp::coord()->request->params);

    // Request parameters
    $data = array("map"=>$lizmapConfig->repositoryData['path'].$project.".qgs");

    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $data[$param] = jApp::coord()->request->params[$param];
      }
    }

    // Construction of the request url : base url + parameters
    $url = $lizmapConfig->wmsServerURL.'?';
    $params = http_build_query($data);
    // On remplace certains caractères (plus besoin si php 5.4, alors utiliser le 4ème paramètre de http_build_query)
    $a = array('+', '_', '.', '-','%3A');
    $b = array('%20', '%5F', '%2E', '%2D',':');
    $params = str_replace($a, $b, $params);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_URL, $url . $params);
    curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false );
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

    $content = curl_exec($ch);
    $response = curl_getinfo($ch);
    curl_close($ch);

    $rep = $this->getResponse('binary');
    $rep->mimeType = $response['content_type'];
    $rep->content = $content;
    $rep->doDownload  =  false;
    $rep->outputFileName  =  'mapserver';

    return $rep;
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
  * Send the JSON configuration file for a specified project
  * @param $project Name of the project
  * @return JSON configuration file for the specified project.
  */
  function getProjectConfig(){

    $rep = $this->getResponse('text');
    // Get the project
    $project = $this->param('project');

    if(!$project){
      // Return the error in JSON
      jMessage::add('The parameter project is mandatory !', 'ProjectNotDefind');
      return $this->serviceException();
    }

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Redirect if no rights to access this repository
    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return $this->serviceException();
    }

    // Get the corresponding Qgis project configuration
    $configPath = $lizmapConfig->repositoryData['path'].$project.'.qgs.cfg';
    // Read Json content from config file
    $configRead = jFile::read($configPath);

    // Read the QGIS project file to get the layer drawing order
    // Get project data from XML .qgs
    $layersOrder = array();    
    $use_errors = libxml_use_internal_errors(true);
    $go = true; $errorlist = array();
    // Create a DOM instance
    $qgsLoad = simplexml_load_file($lizmapConfig->repositoryData['path'].$project.'.qgs');
    if(!$qgsLoad) {
      foreach(libxml_get_errors() as $error) {
        $errorlist[] = $error;
      }
      $go = false;
    }
    if($go){
      $layers =  $qgsLoad->xpath('//legendlayer');
      foreach($layers as $layer){
        if($layer->attributes()->drawingOrder and $layer->attributes()->drawingOrder > 0){
          $layersOrder[(string)$layer->attributes()->name] = (integer)$layer->attributes()->drawingOrder;
        }
      }
    }
    if(!empty($layersOrder)){
      $configJson = json_decode($configRead);
      $configJson->layersOrder = $layersOrder;
      $configRead = json_encode($configJson);
    }
        
    $rep->content = $configRead;

    return $rep;

  }

}
