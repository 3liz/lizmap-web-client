<?php
/**
* Handling of one project among all the projects. Display a map based on one Qgis project
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mapCtrl extends jController {

  /**
  * Load the project page
  * @param $project Name of the project
  * @return Page with map and content for the chose Qgis project
  */
  function index() {
  
    $rep = $this->getResponse('htmlmap');
       
    // Get the project
    $project = $this->param('project');

    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'error');
      // Redirection to the public project list
      $rep = $this->getResponse('redirect');
      $rep->params = array('project'=>'montpellier');
      $rep->action = 'view~map:index';
      return $rep;
    }
    
    // Get the config
    $appConfigPath = jApp::varPath().'projects.json';
    $configRead = jFile::read($appConfigPath);
    $config = json_decode($configRead);
        
    // Get the project path
    $projectsPaths = $config->projectsPaths;
    $groupName = $projectsPaths->default;
    $groupLabel = 'LizMap';
    $groupPath = '';
    if (is_string($projectsPaths->$groupName)) {
      $groupPath = $projectsPaths->$groupName;
    } else {
      $groupPath = $projectsPaths->$groupName->path;
      $groupLabel = $projectsPaths->$groupName->label;
    }

    $repository = $this->param('repository');
    if(isset($projectsPaths->$repository)) {
      if (is_string($projectsPaths->$repository)) {
        $groupPath = $projectsPaths->$repository;
        $groupLabel = $repository;
      } else {
        $groupPath = $projectsPaths->$repository->path;
        $groupLabel = $projectsPaths->$repository->label;
      }
    }

    if ($groupPath[0] != '/')
      $groupPath = jApp::varPath().$groupPath;
    
    // Get the corresponding Qgis project configuration
    $configPath = $groupPath.$project.'.qgs.cfg';
    
    // Get the cache server
    $cacheServerURL = $config->services->cacheServerURL;
    $rep->addJSCode("var cacheServerURL = '".$cacheServerURL."';");

   
    $configRead = jFile::read($configPath); 
    $configOptions = json_decode($configRead)->options;
    if (property_exists($configOptions,'googleKey') && $configOptions->googleKey != '')
      $rep->addJSLink('http://maps.google.com/maps/api/js?v=3.5&sensor=false&'.$configOptions->googleKey != '');
    elseif (
      (property_exists($configOptions,'googleStreets') && $configOptions->googleStreets == 'True') ||
      (property_exists($configOptions,'googleSatellite') && $configOptions->googleSatellite == 'True') ||
      (property_exists($configOptions,'googleHybrid') && $configOptions->googleHybrid == 'True') ||
      (property_exists($configOptions,'googleTerrain') && $configOptions->googleTerrain == 'True')
    )
      $rep->addJSLink('http://maps.google.com/maps/api/js?v=3.5&sensor=false');

    // Add the json config as a javascript variable
    $rep->addJSCode("var dictionaryUrl = '".jUrl::get('view~translate:getDictionary', array('property'=>'map'))."';");
    $rep->addJSCode("var cfgUrl = '".jUrl::get('lizmap~service:getProjectConfig', array('repository'=>$repository, 'project'=>$project))."';");
    $rep->addJSCode("var wmsServerURL = '".jUrl::get('lizmap~service:index', array('repository'=>$repository, 'project'=>$project))."';");

    $rep->body->assign('repositoryLabel', $groupLabel);
    return $rep;
  }
  

}
