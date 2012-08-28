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
  
    $rep = $this->getResponse('redirect');
    
    // Get the project
    $project = $this->param('project');
    if(!$project){
      // Error message
      $rep = $this->getResponse('text');
      $rep->content = "Parameter project is mandatory !";
      return $rep;
    }
    
    // Redirection to the appropriate action
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
      $rep = $this->getResponse('text');
      $rep->content = "Wrong REQUEST parameter given";
      return $rep;
    }
  }
  
  
  /**
  * GetCapabilities
  * @param $project Name of the project : mandatory.
  * @return JSON configuration file for the specified project.
  */
  function GetCapabilities(){
  
    $rep = $this->getResponse('text');
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'error');
      // Redirection to the public project list
      $rep = $this->getResponse('redirect');
      $rep->action = 'project:index';
      return $rep;
    }
    
    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Get the passed parameters
    global $gJCoord;
    $myParams = array_keys($gJCoord->request->params);
    
    // Construction of the request url
    $querystring = $lizmapConfig->wmsServerURL."?";
    $querystring.= "map=".$lizmapConfig->repositoryData['path'].$project.".qgs";
    
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
          $querystring .= "&".$param."=".$gJCoord->request->params[$param];       
      }
    }
    

    $sContent = jFile::read($querystring);
    $sUrl = jUrl::getFull("lizmap~service:index", array("repository"=>$repository, "project"=>$project));
    $sUrl = str_replace('&', '&amp;', $sUrl);
    $sContent = preg_replace('/xlink\:href=".*"/', 'xlink:href="'.$sUrl.'&amp;"', $sContent);
    $rep->content = $sContent;

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
      jMessage::add('The parameter project is mandatory !', 'error');
      // Redirection to the public project list
      $rep = $this->getResponse('redirect');
      $rep->action = 'project:index';
      return $rep;
    }

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository); 
        
    // Get the passed parameters
    global $gJCoord;
    $myParams = array_keys($gJCoord->request->params);
   
    // Request parameters
    $data = array("map"=>$lizmapConfig->repositoryData['path'].$project.".qgs");
    $cached = false;
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $data[$param] = $gJCoord->request->params[$param];
      }
    }

    // Construction of the request url : base url + parameters
    $url = $lizmapConfig->wmsServerURL.'?';
    $params = http_build_query($data);
    // On remplace certains caractères (plus besoin si php 5.4, alors utiliser le 4ème paramètre de http_build_query) 
    $a = array('+', '_', '.', '-');
    $b = array('%20', '%5F', '%2E', '%2D');
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
  * GetLegendGraphics
  * @param $project Name of the project : mandatory
  * @return Image of the legend for 1 to n layers, returned by the Map Server
  */
  function GetLegendGraphics(){
  
    $rep = $this->getResponse('text');
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'error');
      // Redirection to the public project list
      $rep = $this->getResponse('redirect');
      $rep->action = 'project:index';
      return $rep;
    }
        
    // Get the passed parameters
    global $gJCoord;
    $myParams = array_keys($gJCoord->request->params);

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository); 
   
    // paramètres de la requête
    $data = array("map"=>$lizmapConfig->repositoryData['path'].$project.".qgs");
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $data[$param] = $gJCoord->request->params[$param];
      }
    }

    // Construction of the request url : base url + parameters
    $url = $lizmapConfig->wmsServerURL.'?';
    $params = http_build_query($data);
    // On remplace certains caractères (plus besoin si php 5.4, alors utiliser le 4ème paramètre de http_build_query) 
    $a = array('+', '_', '.', '-');
    $b = array('%20', '%5F', '%2E', '%2D');
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
  * GetFeatureInfo
  * @param $project Name of the project : mandatory
  * @return Feature Info.
  */
  function GetFeatureInfo(){
  
    $rep = $this->getResponse('text');
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'error');
      // Redirection to the public project list
      $rep = $this->getResponse('redirect');
      $rep->action = 'project:index';
      return $rep;
    }
        
    // Get the passed parameters
    global $gJCoord;
    $myParams = array_keys($gJCoord->request->params);

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository); 
   
    // Request parameters
    $data = array("map"=>$lizmapConfig->repositoryData['path'].$project.".qgs");
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $data[$param] = $gJCoord->request->params[$param];
      }
    }

    // Construction of the request url : base url + parameters
    $url = $lizmapConfig->wmsServerURL.'?';
    $params = http_build_query($data);
#    // On remplace certains caractères (plus besoin si php 5.4, alors utiliser le 4ème paramètre de http_build_query) 
#    $a = array('+', '_', '.', '-');
#    $b = array('%20', '%5F', '%2E', '%2D');
#    $params = str_replace($a, $b, $params);

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
    $rep->outputFileName  =  'getFeatureInfo';
    
    return $rep;
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
      jMessage::add('The parameter project is mandatory !', 'error');
      // Redirection to the public project list
      $rep = $this->getResponse('redirect');
      $rep->action = 'project:index';
      return $rep;
    }

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository); 
        
    // Get the passed parameters
    global $gJCoord;
    $myParams = array_keys($gJCoord->request->params);
   
    // Request parameters
    $data = array("map"=>$lizmapConfig->repositoryData['path'].$project.".qgs");
    $cached = false;
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $data[$param] = $gJCoord->request->params[$param];
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
  * Send the JSON configuration file for a specified project
  * @param $project Name of the project
  * @return JSON configuration file for the specified project.
  */
  function getProjectConfig(){
  
    $rep = $this->getResponse('text');
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'error');
      // Redirection to the public project list
      $rep = $this->getResponse('redirect');
      $rep->action = 'project:index';
      return $rep;
    }

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository); 

    // Get the corresponding Qgis project configuration
    $configPath = $lizmapConfig->repositoryData['path'].$project.'.qgs.cfg';
#print_r($configPath);
    
    $configRead = jFile::read($configPath);    
    $rep->content = $configRead;
    
    return $rep;
  
  }

}
