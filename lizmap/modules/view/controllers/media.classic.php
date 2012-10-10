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

    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      $rep = $this->getResponse('redirect');
      $rep->action = 'view~default:error';
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
      return $rep;
    }

    // Get the project
    $project = $this->param('project');
    // default illustration
    $rep->fileName = jApp::wwwPath().'css/img/250x250_mappemonde.png';
    // get project illustration if exists
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
