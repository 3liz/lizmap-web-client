<?php
/**
* Displays a list of project for a given repository.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class defaultCtrl extends jController {

  /**
  * Displays a list of project for a given repository.
  * 
  * @param string $repository. Name of the repository.
  * @return Html page with a list of projects.
  */
  function index() {    
  
    if ($this->param('theme')) {
      $GLOBALS['gJConfig']->theme = $this->param('theme');
    }

    $rep = $this->getResponse('html');
    
    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');

    $repositoryList = Array();
    if ($repository != null) {
      if(!jacl2::check('lizmap.repositories.view', $repository)){
        $rep = $this->getResponse('redirect');
        $rep->action = 'view~default:index';
        jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
        return $rep;
      }
      $repositoryList[] = $repository;
    } else {
      $lizmapConfig = new lizmapConfig($repository);
      $repositoryList = $lizmapConfig->repositoryList;
    }

    $repositories = Array();
    foreach ($repositoryList as $r) {
      if(jacl2::check('lizmap.repositories.view', $r)){
      $rConfig = new lizmapConfig($r);

      $projects = Array();
      if ($dh = opendir($rConfig->repositoryData['path'])) {
        $cfgFiles = Array();
        $qgsFiles = Array();
        while (($file = readdir($dh)) !== false) {
          if (substr($file, -3) == 'cfg')
            $cfgFiles[] = $file;
          if (substr($file, -3) == 'qgs')
            $qgsFiles[] = $file;
        }
        closedir($dh);
        foreach ($qgsFiles as $qgsFile) {
          if (in_array($qgsFile.'.cfg',$cfgFiles)) {
            $configRead = jFile::read($rConfig->repositoryData['path'].$qgsFile.'.cfg');
            $configOptions = json_decode($configRead)->options;
            $qgsXML = simplexml_load_file($rConfig->repositoryData['path'].$qgsFile);

            $project = Array(
              'repository'=>$rConfig->repositoryKey,
              'id'=>substr($qgsFile,0,-4),
              'title'=>ucfirst(substr($qgsFile,0,-4)),
              'abstract'=>'',
              'proj'=> $configOptions->projection->ref,
              'bbox'=> join($configOptions->bbox,', ')
            );
            # get title from WMS properties
            if (property_exists($qgsXML->properties, 'WMSServiceTitle'))
              if (!empty($qgsXML->properties->WMSServiceTitle))
                $project['title'] = $qgsXML->properties->WMSServiceTitle;
            # get abstract from WMS properties
            if (property_exists($qgsXML->properties, 'WMSServiceAbstract'))
              $project['abstract'] = $qgsXML->properties->WMSServiceAbstract;

            $projects[] = $project;
          }
        }
      }
      $repositories[] = Array('title'=> $rConfig->repositoryData['label'],'projects'=>$projects);
      }
    }

    //$rep->body->assign('repositoryLabel', $lizmapConfig->repositoryData['label']);
    $title = jLocale::get("view~default.repository.list.title");
    $rep->body->assign('repositoryLabel', $title);

    if (count($repositories) == 1)
      $title .= ' - '.$repositories[0]['title'];
    $rep->title = $title;

    $tpl = new jTpl();
    $tpl->assign('repositories', $repositories);
    $rep->body->assign('MAIN', $tpl->fetch('view'));

    return $rep;
  }
  
    /**
  * Displays an error.
  * 
  * @return Html page with the error message.
  */
  function error() {
  
    $rep = $this->getResponse('html');
    $tpl = new jTpl();
    $rep->body->assign('MAIN', '');
    return $rep;
    
  }
  

}
