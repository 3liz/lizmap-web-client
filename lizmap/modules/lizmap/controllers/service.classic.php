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

  // Get the projects config file
  protected $wmsServerURL = '';
  
  // User
  protected $projectsPaths = '';
  
  function __construct ($request){
    parent::__construct($request);
    
    // set the service url
    $appConfigPath = jApp::varPath().'projects.json';
    $configRead = jFile::read($appConfigPath);
    $config = json_decode($configRead);
    $this->wmsServerURL = $config->services->wmsServerURL;
    
    // set the 
    $this->projectsPaths = $config->projectsPaths;
    $defaultPathName = $this->projectsPaths->default;
    if (is_string($this->projectsPaths->$defaultPathName))
      $this->projectsPath = $this->projectsPaths->$defaultPathName; 
    else
      $this->projectsPath = $this->projectsPaths->$defaultPathName->path; 
    
  }
  

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
    
    $repository = $this->param('repository');
    $groupPath = $this->projectsPath;
    if(isset($this->projectsPaths->$repository))
      if (is_string($this->projectsPaths->$repository))
        $groupPath = $this->projectsPaths->$repository;
      else
        $groupPath = $this->projectsPaths->$repository->path;
    
    if ($groupPath[0] != '/')
      $groupPath = jApp::varPath().$groupPath;

    // Get the passed parameters
    global $gJCoord;
    $myParams = array_keys($gJCoord->request->params);
#    print_r($myParams);
    
    // Construction of the request url
    $querystring = $this->wmsServerURL."?";
    $querystring.= "map=".$groupPath.$project.".qgs";
    
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

    $repository = $this->param('repository');
    $groupPath = $this->projectsPath;
    if(isset($this->projectsPaths->$repository))
      if (is_string($this->projectsPaths->$repository))
        $groupPath = $this->projectsPaths->$repository;
      else
        $groupPath = $this->projectsPaths->$repository->path;

    if ($groupPath[0] != '/')
      $groupPath = jApp::varPath().$groupPath;
        
    // Get the passed parameters
    global $gJCoord;
    $myParams = array_keys($gJCoord->request->params);
   
    // paramètres de la requête
    $data = array("map"=>$groupPath.$project.".qgs");
    $cached = false;
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $data[$param] = $gJCoord->request->params[$param];
      }
    }

    // Construction of the request url : base url + parameters
    $url = $this->wmsServerURL.'?';
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

#    $rep = $this->getResponse('text');
#    $rep->content = $url . $params;
    
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

    $repository = $this->param('repository');
    $groupPath = $this->projectsPath;
    if(isset($this->projectsPaths->$repository))
      if (is_string($this->projectsPaths->$repository))
        $groupPath = $this->projectsPaths->$repository;
      else
        $groupPath = $this->projectsPaths->$repository->path;

    if ($groupPath[0] != '/')
      $groupPath = jApp::varPath().$groupPath;
   
    // paramètres de la requête
    $data = array("map"=>$groupPath.$project.".qgs");
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $data[$param] = $gJCoord->request->params[$param];
      }
    }

    // Construction of the request url : base url + parameters
    $url = $this->wmsServerURL.'?';
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

#    $rep = $this->getResponse('text');
#    $rep->content = $url . $params;
    
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

    $repository = $this->param('repository');
    $groupPath = $this->projectsPath;
    if(isset($this->projectsPaths->$repository))
      if (is_string($this->projectsPaths->$repository))
        $groupPath = $this->projectsPaths->$repository;
      else
        $groupPath = $this->projectsPaths->$repository->path;

    if ($groupPath[0] != '/')
      $groupPath = jApp::varPath().$groupPath;
   
    // paramètres de la requête
    $data = array("map"=>$groupPath.$project.".qgs");
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $data[$param] = $gJCoord->request->params[$param];
      }
    }

    // Construction of the request url : base url + parameters
    $url = $this->wmsServerURL.'?';
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

    $repository = $this->param('repository');
    $groupPath = $this->projectsPath;
    if(isset($this->projectsPaths->$repository))
      if (is_string($this->projectsPaths->$repository))
        $groupPath = $this->projectsPaths->$repository;
      else
        $groupPath = $this->projectsPaths->$repository->path;

    if ($groupPath[0] != '/')
      $groupPath = jApp::varPath().$groupPath;
        
    // Get the passed parameters
    global $gJCoord;
    $myParams = array_keys($gJCoord->request->params);
   
    // paramètres de la requête
    $data = array("map"=>$groupPath.$project.".qgs");
    $cached = false;
    // on garde les paramètres intéressants
    foreach($myParams as $param){
      if(!in_array($param, array('module', 'action', 'C', 'project'))){
        $data[$param] = $gJCoord->request->params[$param];
      }
    }

    // Construction of the request url : base url + parameters
    $url = $this->wmsServerURL.'?';
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

#    $rep = $this->getResponse('text');
#    $rep->content = $url . $params;
    
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

    $repository = $this->param('repository');
    $groupPath = $this->projectsPath;
    if(isset($this->projectsPaths->$repository))
      if (is_string($this->projectsPaths->$repository))
        $groupPath = $this->projectsPaths->$repository;
      else
        $groupPath = $this->projectsPaths->$repository->path;

    if ($groupPath[0] != '/')
      $groupPath = jApp::varPath().$groupPath;
    
    // Get the corresponding Qgis project configuration
    $configPath = $groupPath.$project.'.qgs.cfg';
#print_r($configPath);
    
    $configRead = jFile::read($configPath);    
    $rep->content = $configRead;
    
    return $rep;
  
  }
  

}
