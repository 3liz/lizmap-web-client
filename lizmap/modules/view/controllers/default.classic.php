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
      jApp::config()->theme = $this->param('theme');
    }

    $rep = $this->getResponse('html');

    // Get repository data
    $repository = $this->param('repository');

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
      $repositoryList = lizmap::getRepositoryList();
    }

    $repositories = Array();
    foreach ($repositoryList as $r) {
      if(jacl2::check('lizmap.repositories.view', $r)){
      $lrep = lizmap::getRepository($r);
      $projects = $lrep->getProjects();
      $repositories[] = Array('title'=> $lrep->getData('label'),'projects'=>$projects);
      }
    }

    $title = jLocale::get("view~default.repository.list.title");
    $rep->body->assign('repositoryLabel', $title);
    $rep->body->assign('isConnected', jAuth::isConnected());
    $rep->body->assign('user', jAuth::getUserSession());

    if (count($repositories) == 1)
      $title .= ' - '.$repositories[0]['title'];
    $rep->title = $title;

    $tpl = new jTpl();
    $tpl->assign('repositories', $repositories);
    $rep->body->assign('MAIN', $tpl->fetch('view'));

    $rep->addJSCode("
      $(window).load(function() {
        $('.liz-project-img').parent().mouseenter(function(){
          var self = $(this);
          self.find('.liz-project-desc').slideDown();
          self.css('cursor','pointer');
        }).mouseleave(function(){
          var self = $(this);
          self.find('.liz-project-desc').hide();
        }).click(function(){
          var self = $(this);
          window.location = self.parent().find('a.liz-project-view').attr('href');
        });
      });
      ");

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
