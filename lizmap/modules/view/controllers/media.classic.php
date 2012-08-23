<?php
/**
* Service to provide media (image, documents)
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mediaCtrl extends jController {

  /**
  * Get illustration image for a specified project.
  * 
  * @return binary object The image for this project.
  */
  function illustration() {

    $rep = $this->getResponse('binary');
    $rep->doDownload = false;
    
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
      } else {
        $groupPath = $projectsPaths->$repository->path;
        $groupLabel = $projectsPaths->$repository->label;
      }
    }

    if ($groupPath[0] != '/')
      $groupPath = jApp::varPath().$groupPath;

    // Get the project
    $project = $this->param('project');
    $rep->fileName = $groupPath.'illustration.png';
    if($project){
      $imageTypes = array('jpg', 'jpeg', 'png', 'gif');
      foreach($imageTypes as $type){
        if(file_exists($groupPath.$project.'.qgs.'.$type)){
          $rep->fileName = $groupPath.$project.'.qgs.'.$type;
          return $rep;
        }
      }
    }
    return $rep;
  }

}
