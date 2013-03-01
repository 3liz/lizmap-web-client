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
  * Get a media file (image, html, csv, pdf, etc.) store in the repository.
  * Used to display media in the popup, via the information icon, etc.
  *
  * @param string $repository Repository of the project.
  * @param string $project Project key.
  * @param string $path Path to the media relative to the project file.
  * @return binary object The media.
  */
  function getMedia() {
    // Get repository data
    $repository = $this->param('repository');

    $lrep = lizmap::getRepository($repository);

    if(!jacl2::check('lizmap.repositories.view', $lrep->getKey())){
      $rep = $this->getResponse('redirect');
      $rep->action = 'view~default:error';
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
      return $rep;
    }

    // Get the project
    $project = $this->param('project');

    // Get the file
    $path = $this->param('path');
    $repositoryPath = realpath($lrep->getPath());
    $abspath = realpath($repositoryPath.'/'.$path);
    $n_repositoryPath = str_replace('\\', '/', $repositoryPath);
    $n_abspath = str_replace('\\', '/', $abspath);

    $ok = True;
    // Only allow files within the repository for safety reasons
    // and in the media folder    
    if(!preg_match("#^".$n_repositoryPath."(/)?media/#", $n_abspath)){
      $ok = False;
    }

    // Check if file exists
    if($ok and !file_exists($abspath)){
      $ok = False;
    }

    // Redirect if errors
    if(!$ok){
      $content = "No media file in the specified path";
      $rep = $this->getResponse('text');
      $rep->content = $content;
      return $rep;
    }

    // Prepare the file to return
    $rep = $this->getResponse('binary');
    $rep->doDownload = false;
    $rep->fileName = $abspath;

    // Get the name of the file
    $path_parts = pathinfo($abspath);
    $name = $path_parts['basename'].'.'.$path_parts['extension'];
    $rep->outputFileName = $name;

    // Get the mime type
    $mime = Null;
    if (extension_loaded('fileinfo')) {
      $finfo = new finfo(FILEINFO_MIME);
      if ($finfo){
        $file_info = $finfo->file($abspath);
        $mime = substr($file_info, 0, strpos($file_info, ';'));
      }
    }

    // Mime type
    if($mime)
      $rep->mimeType = $mime;

    $mimeTextArray = array('text/html', 'text/text');
    if(in_array($mime, $mimeTextArray)){
      $content = jFile::read($abspath);
      $rep->fileName = Null;
      $rep->content = $content;
    }

    return $rep;
  }


  /**
  * Get illustration image for a specified project.
  * @param string $repository Repository of the project.
  * @param string $project Project key.
  * @return binary object The image for this project.
  */
  function illustration() {

    $rep = $this->getResponse('binary');
    $rep->doDownload = false;

    // Get repository data
    $repository = $this->param('repository');

    $lrep = lizmap::getRepository($repository);
    if (!$lrep) {
      $ser = lizmap::getServices();
      $lrep = lizmap::getRepository($ser->defaultRepository);
    }

    if(!jacl2::check('lizmap.repositories.view', $lrep->getKey())){
      $rep = $this->getResponse('redirect');
      $rep->action = 'view~default:error';
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
      return $rep;
    }

    // Get the project
    $project = $this->param('project');
    // default illustration
    $themePath = jApp::wwwPath().'themes/'.jApp::config()->theme.'/';
    $rep->fileName = $themePath.'css/img/250x250_mappemonde.png';    
    // get project illustration if exists
    if($project){
      $imageTypes = array('jpg', 'jpeg', 'png', 'gif');
      foreach($imageTypes as $type){
        if(file_exists($lrep->getPath().$project.'.qgs.'.$type)){
          $rep->fileName = $lrep->getPath().$project.'.qgs.'.$type;
          return $rep;
        }
      }
    }
    return $rep;
  }

}
