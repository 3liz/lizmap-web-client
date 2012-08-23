<?php
/**
* Displaying a list of Qgis project file
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class defaultCtrl extends jController {

  /**
  * Redirect to the default project map
  * 
  * @return Redirection to the default project map
  */
  function index() {

    $rep = $this->getResponse('html');
    
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
      $groupName = $repository;
      if (is_string($projectsPaths->$repository)) {
        $groupPath = $projectsPaths->$repository;
        $groupLabel = $groupName;
      } else {
        $groupPath = $projectsPaths->$repository->path;
        $groupLabel = $projectsPaths->$repository->label;
      }
    }

    if ($groupPath[0] != '/')
      $groupPath = jApp::varPath().$groupPath;

    $projects = Array();
    if ($dh = opendir($groupPath)) {
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
          $configRead = jFile::read($groupPath.$qgsFile.'.cfg');
          $configOptions = json_decode($configRead)->options;
          $qgsXML = simplexml_load_file($groupPath.$qgsFile);

          $project = Array(
            'repository'=>$groupName,
            'id'=>substr($qgsFile,0,-4),
            'title'=>ucfirst(substr($qgsFile,0,-4)),
            'abstract'=>'',
            'proj'=> $configOptions->projection->ref,
            'bbox'=> $configOptions->bbox
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

    $rep->body->assign('repositoryLabel', $groupLabel);

    $main = '<div class="row liz-projects">';
    $count = 0;
    foreach($projects as $p) {
      if ($count == 3) {
        $main .= '</div>';
        $main .= '<div class="row liz-projects">';
        $count = 0;
      }
      $main .= '<div class="span4 liz-project">';
      $main .= '<div class="liz-project-img" title="'.jLocale::get("default.project.open.map").'">';
      $main .= '<img width="250" height="250" src="'.jUrl::get("view~media:illustration", array("repository"=>$p['repository'],"project"=>$p['id'])).'" alt="project image"/>';
      $main .= '<div class="liz-project-desc" style="display:none;">';
      $main .= '<div>';
      $main .= '<span class="bold">'.$p['title'].'</span><br/>';
      $main .= '<br/><span class="bold">'.jLocale::get("default.project.abstract.label").'</span>&nbsp;: '.$p['abstract'];
      $main .= '<br/><span class="bold">'.jLocale::get("default.project.projection.label").'</span>&nbsp;: '.$p['proj'];
      $main .= '<br/><span class="bold">'.jLocale::get("default.project.bbox.label").'</span>&nbsp;: '.join($p['bbox'],', ');
      $main .= '</div>';
      $main .= '</div>';
      $main .= '</div>';
      $main .= '<div class="liz-project-title">';
      $main .= '<a href="'.jUrl::get("view~map:index", array("repository"=>$p['repository'],"project"=>$p['id'])).'" title="'.jLocale::get("default.project.open.map").'">';
      $main .= $p['title'];
      $main .= '</a>';
      $main .= '</div>';
      $main .= '</div>';
      $count += 1;
    }
    $main .= '</div>';

    $rep->body->assign('MAIN',$main);

    $rep->addJSCode('
      $(window).load(function() {
        $(\'.liz-project-img\').mouseenter(function(){
          var self = $(this);
          self.find(\'.liz-project-desc\').slideDown();
          self.css(\'cursor\',\'pointer\');
        }).mouseleave(function(){
          var self = $(this);
          self.find(\'.liz-project-desc\').hide();
        }).click(function(){
          var self = $(this);
          window.location = self.parent().find(\'.liz-project-title a\').attr(\'href\');
        });
      });
    ');

    return $rep;
  }

}
