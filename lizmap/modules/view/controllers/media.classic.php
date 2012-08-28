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
    
    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    // Get the project
    $project = $this->param('project');
    $rep->fileName = $lizmapConfig->repositoryData['path'].'illustration.png';
    if($project){
      $imageTypes = array('jpg', 'jpeg', 'png', 'gif');
      foreach($imageTypes as $type){
        if(file_exists($lizmapConfig->repositoryData['path'].$project.'.qgs.'.$type)){
          $rep->fileName = $lizmapConfig->repositoryData['path'].$project.'.qgs.'.$type;
          return $rep;
        }
      }
    }
    return $rep;
  }

}
