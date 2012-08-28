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

    $rep = $this->getResponse('html');
    
    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository); 

    $projects = Array();
    if ($dh = opendir($lizmapConfig->repositoryData['path'])) {
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
          $configRead = jFile::read($lizmapConfig->repositoryData['path'].$qgsFile.'.cfg');
          $configOptions = json_decode($configRead)->options;
          $qgsXML = simplexml_load_file($lizmapConfig->repositoryData['path'].$qgsFile);

          $project = Array(
            'repository'=>$lizmapConfig->repositoryKey,
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

    $rep->body->assign('repositoryLabel', $lizmapConfig->repositoryData['label']);

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
