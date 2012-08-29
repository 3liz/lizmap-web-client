<?php
/**
* Displays a full featured map based on one Qgis project.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mapCtrl extends jController {

  /**
  * Load the project page for the given project.
  * @param string $repository Name of the repository.
  * @param string $project Name of the project.
  * @return Page with map and content for the chose Qgis project.
  */
  function index() {
  
    if ($this->param('theme')) {
      $GLOBALS['gJConfig']->theme = $this->param('theme');
    }
    $rep = $this->getResponse('htmlmap');
    $ok = true;
    
    // Get the project
    $project = filter_var($this->param('project'), FILTER_SANITIZE_STRING);
    
    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);
    
    // We must redirect to default repository project list if no project given
    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'error');
      $ok = false;
    }
    
    // Get the corresponding Qgis project configuration
    $qgsPath = $lizmapConfig->repositoryData['path'].$project.'.qgs';
    $configPath = $qgsPath.'.cfg';
    
    // We must redirect to default repository project list if no project found.
    if(!file_exists($qgsPath)){
      jMessage::add('The project '.strtoupper($project).' does not exist !', 'error');
      $ok = false;
    }
    
    // We must redirect to default repository project list if no project configuration found
    if(!file_exists($configPath)){
      jMessage::add('The configuration file does not exist for the project : '.strtoupper($project).' !', 'error');
      $ok = false;
    }    
    
    // Redirect if error encountered
    if(!$ok){
      $rep = $this->getResponse('redirect');
      $rep->params = array('repository'=>$lizmapConfig->repositoryKey);
      $rep->action = 'view~default:index';
      return $rep;
    }
    
    // Add the cache server url as Javascript var.
    $rep->addJSCode("var cacheServerURL = '".$lizmapConfig->cacheServerURL."';");

    
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

    $rep->body->assign('repositoryLabel', $lizmapConfig->repositoryData['label']);
    return $rep;
  }
  

}
