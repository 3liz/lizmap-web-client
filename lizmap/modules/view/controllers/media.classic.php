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
   * Returns error
   */
  protected function error($message){
    $rep = $this->getResponse('redirect');
    $rep->action = 'view~default:error';
    jMessage::add($message, 'error');
    return $rep;
  }

  /**
   * Return 404
   */
  protected function error404($message){
    $rep = $this->getResponse('json');
    $rep->data = array('error'=>'404 not found (wrong action)', 'message'=>$message);
    $rep->setHttpStatus('404', 'Not Found');
    return $rep;
    /*
      $rep = $this->getResponse('text');
      $rep->content = $message  ;
      $rep->setHttpStatus('404', 'Not Found');
      return $rep;
     */
  }

  /**
   * Return 403
   */
  protected function error403($message){
    $rep = $this->getResponse('json');
    $rep->data = array('error'=>'403 forbidden (you\'re not allowed to access to this media)', 'message'=>$message);
    $rep->setHttpStatus('403', 'Forbidden');
    return $rep;
  }

  /**
   * Return 401
   */
  protected function error401($message){
    $rep = $this->getResponse('json');
    $rep->data = array('error'=>'401 Unauthorized (authentication is required)', 'message'=>$message);
    $rep->setHttpStatus('401', 'Unauthorized');
    return $rep;
  }

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
    if(!$lrep)
        return $this->error404('');
    if(!jAcl2::check('lizmap.repositories.view', $lrep->getKey())){
        return $this->error403(jLocale::get('view~default.repository.access.denied'));
    }

    // Get the project
    $project = $this->param('project');

    // Get lizmapProject class
    try {
        $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
        if(!$lproj){
            return $this->error404('The lizmapProject '.strtoupper($project).' does not exist !');
        }
    }
    catch(UnknownLizmapProjectException $e) {
        jLog::logEx($e, 'error');
        return $this->error404('The lizmapProject '.strtoupper($project).' does not exist !');
    }

    // Redirect if no right to access the project
    if ( !$lproj->checkAcl() ){
        return $this->error403(jLocale::get('view~default.repository.access.denied'));
    }

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
    if($ok && !is_file($abspath)){
      $ok = False;
    }

    // Redirect if errors
    if(!$ok){
        $content = "No media file in the specified path: ".$path;
        if ( is_link($repositoryPath.'/'.$path) )
            $content .= " ".readlink($repositoryPath.'/'.$path);
        return $this->error404($content);
    }

    // Prepare the file to return
    $rep = $this->getResponse('binary');
    $rep->doDownload = false;
    $rep->fileName = $abspath;

    // Get the name of the file
    $path_parts = pathinfo($abspath);
    if (isset($path_parts['extension'])) {
        $rep->outputFileName = $path_parts['basename'].'.'.$path_parts['extension'];
    }
    else {
        $rep->outputFileName = $path_parts['basename'];
    }

    // Get the mime type
    $mime = jFile::getMimeType($abspath);
    if( $mime == 'text/plain' || $mime == '' || $mime == 'application/octet-stream') {
        $mime = jFile::getMimeTypeFromFilename($abspath);
    }
    $rep->mimeType = $mime;

    $mimeTextArray = array('text/html', 'text/text');
    if(in_array($mime, $mimeTextArray)){
      $content = jFile::read($abspath);
      $rep->fileName = Null;
      $rep->content = $content;
    }

    $rep->setExpires('+1 days');

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
    if(!$lrep)
        return $this->error404('');

    if(!jAcl2::check('lizmap.repositories.view', $lrep->getKey())){
        return $this->error403(jLocale::get('view~default.repository.access.denied'));
    }

    // Get the project
    $project = $this->param('project');

    // Get lizmapProject class
    try {
        $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
        if(!$lproj){
            return $this->error404('The lizmapProject '.strtoupper($project).' does not exist !');
        }
    }
    catch(UnknownLizmapProjectException $e) {
        jLog::logEx($e, 'error');
        return $this->error404('The lizmapProject '.strtoupper($project).' does not exist !');
    }

    // Redirect if no right to access the project
    if ( !$lproj->checkAcl() ){
        return $this->error403(jLocale::get('view~default.repository.access.denied'));
    }

    // Get the project
    $project = $this->param('project');
    // default illustration
    $themePath = jApp::wwwPath().'themes/'.jApp::config()->theme.'/';
    $rep->fileName = $themePath.'css/img/250x250_mappemonde.png';
    $rep->outputFileName = 'lizmap_mappemonde.png';
    $rep->mimeType = 'image/png';

    // get project illustration if exists
    if($project){
        $imageTypes = array('jpg', 'jpeg', 'png', 'gif');
        foreach($imageTypes as $type){
            if ( !file_exists($lrep->getPath().$project.'.qgs.'.$type) )
                continue;

            $rep->fileName = $lrep->getPath().$project.'.qgs.'.$type;
            $rep->outputFileName = $repository.'_'.$project.'.'.$type;
            $rep->mimeType = 'image/'.$type;
        }
    }

    // Get the mime type
    $mime = jFile::getMimeType($rep->fileName);
    if( $mime == 'text/plain' || $mime == '') {
        $mime = jFile::getMimeTypeFromFilename($rep->fileName);
    }
    $rep->mimeType = $mime;

    $rep->setExpires('+1 days');
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

    if(!$lrep or !jAcl2::check('lizmap.repositories.view', $lrep->getKey())){
      $this->error(jLocale::get('view~default.repository.access.denied'));
    }

    // Get the project
    $project = $this->param('project');

    // Get lizmapProject class
    $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
    if(!$lproj){
        $this->error('The lizmapProject '.strtoupper($project).' does not exist !');
    }

    // Redirect if no right to access the project
    if ( !$lproj->checkAcl() ){
      return $this->error(jLocale::get('view~default.repository.access.denied'));
    }

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
    if(!isset($path_parts['extension']) ||
        strtolower($path_parts['extension']) != 'css') {
        $ok = False;
    }

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

    $rep->setExpires('+1 days');

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


  /**
  * Get logo or background image defined in lizmap admin theme configuration
  * @param $key : type of image. Can be 'headerLogo' or 'headerBackgroundImage'
  * @return Admin configured theme logo
  */
  function themeImage() {

    $key = $this->param('key', 'headerLogo');
    if($key != 'headerLogo' and $key != 'headerBackgroundImage')
        $key = 'headerLogo';

    $rep = $this->getResponse('binary');
    $rep->doDownload = false;

    $theme = lizmap::getTheme();
    $imgPath = jApp::varPath('lizmap-theme-config/') . $theme->$key;

    if( is_file($imgPath) ){
        $mime = jFile::getMimeType($imgPath);
        if( $mime == 'text/plain' || $mime == '') {
            $mime = jFile::getMimeTypeFromFilename($imgPath);
        }
        $rep->mimeType = $mime;
        $rep->fileName = $imgPath;
    }else{
        if( $key == 'headerLogo' ){
            $rep->fileName = realpath(jApp::wwwPath('/themes/default/css/img/logo.png'));
            $rep->mimeType = 'image/png';
            $rep->outputFileName = 'logo.png';
        }else{
            return $this->error404('The image file  does not exist !');
        }
    }
    $rep->setExpires('+1 days');

    return $rep;
  }


}
