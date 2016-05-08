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

    if(!$lrep or !jAcl2::check('lizmap.repositories.view', $lrep->getKey())){
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
    $n_abspath = $n_repositoryPath.'/'.trim($path, '/');
    //manually canonize path to authorize symlink
    $n_abspath = explode('/', $n_abspath);
    $n_keys = array_keys($n_abspath, '..');
    foreach($n_keys AS $keypos => $key)
    {
        array_splice($address, $key - ($keypos * 2 + 1), 2);
    }
    $n_abspath = implode('/', $n_abspath);
    $n_abspath = str_replace('./', '', $n_abspath);

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
      $content = "No media file in the specified path: ".$path;
      if ( is_link($repositoryPath.'/'.$path) )
        $content .= " ".readlink($repositoryPath.'/'.$path);
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
    $ext = $path_parts['extension'];
    $name = $path_parts['basename'].'.'.$ext;
    $rep->outputFileName = $name;

    // Get the mime type
    $mime = jFile::getMimeType($abspath);
    if( $mime == 'text/plain' ){
        if( $ext == 'css' )
            $mime = 'text/css';
        if( $ext == 'js' )
            $mime = 'text/javascript';
    }
    if($mime)
      $rep->mimeType = $mime;

    $mimeTextArray = array('text/html', 'text/text');
    if(in_array($mime, $mimeTextArray)){
      $content = jFile::read($abspath);
      $rep->fileName = Null;
      $rep->content = $content;
    }

    $rep->setExpires('+60 seconds');

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

    if(!jAcl2::check('lizmap.repositories.view', $lrep->getKey())){
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
          $rep->mimeType = "image/$type";
          $rep->setExpires('+60 seconds');
          return $rep;
        }
      }
    }
    return $rep;
  }


  /**
  * Get a CSS file stored in the repository in a "media/themes" folder.
  * Url to images are replaced by getMedia URL
  *
  * @param string $repository Repository of the project.
  * @param string $project Project key.
  * @param string $path Path to the CSS file relative to the project file.
  * @return binary object The transformed CSS file.
  */
  function getCssFile() {
    // Get repository data
    $repository = $this->param('repository');

    $lrep = lizmap::getRepository($repository);

    if(!jAcl2::check('lizmap.repositories.view', $lrep->getKey())){
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
    // and in the media/themes/ folder
    if(!preg_match("#^".$n_repositoryPath."(/)?media/themes/#", $n_abspath)){
      $ok = False;
    }

    // Check if file exists
    if($ok and !file_exists($abspath)){
      $ok = False;
    }

    // Check if file is CSS
    $path_parts = pathinfo($abspath);
    if( strtolower($path_parts['extension']) != 'css' )
      $ok = False;

    // Redirect if errors
    if(!$ok){
      $content = "No CSS file in the specified path";
      $rep = $this->getResponse('text');
      $rep->content = $content;
      return $rep;
    }

    // Prepare the file to return
    $rep = $this->getResponse('binary');
    $rep->doDownload = false;
    $rep->fileName = $abspath;

    // Get the name of the file
    $name = $path_parts['basename'].'.'.$path_parts['extension'];
    $rep->outputFileName = $name;

    // Mime type
    $rep->mimeType = 'text/css';


    // Read content from file
    $content = jFile::read($abspath);

    // Replace relative images URL with getMedia URL
    $newPath = preg_replace("#".$path_parts['basename']."$#", '', $path );
    $baseUrl = jUrl::get(
      'view~media:getMedia',
      array(
        'repository'=>$lrep->getKey(),
        'project'=>$project,
        'path'=> $newPath
      )
    );
    $pattern = 'url\((.+)\)';
    $replacement = 'url(' . $baseUrl . '/\1)';
    $content = preg_replace("#$pattern#", $replacement, $content);
    $content = str_replace('"', '', $content);
    $rep->content = $content;

    $rep->setExpires('+60 seconds');

    return $rep;
  }

  /**
  * Get default Lizmap theme as a ZIP file.
  *
  * @return Zip file containing the default theme
  */
  function getDefaultTheme() {
    $rep = $this->getResponse('zip');
    $rep->zipFilename='lizmapWebClient_default_theme.zip';
    $rep->content->addDir(jApp::wwwPath().'/themes/default/', 'default', true);
    return $rep;
  }



}
