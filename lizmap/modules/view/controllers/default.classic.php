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

    // Get lizmap services
    $services = lizmap::getServices();

    // only maps
    if($services->onlyMaps) {
        $repository = lizmap::getRepository($services->defaultRepository);
        if ($repository && jAcl2::check('lizmap.repositories.view', $repository->getKey())) {
            try {
                $project = lizmap::getProject($repository->getKey().'~'.$services->defaultProject);
                if ($project) {
                    // test redirection to an other controller
                    $items = jEvent::notify('mainviewGetMaps')->getResponse();
                    foreach ($items as $item) {
                        if($item->parentId == $repository->getKey() && $item->id == $services->defaultProject ) {
                            $rep = $this->getResponse('redirectUrl');
                            $rep->url = $item->url;
                            return $rep;
                        }
                    }
                    // redirection to default controller
                    $rep = $this->getResponse('redirect');
                    $rep->action = 'view~map:index';
                    return $rep;
                }
            }
            catch(UnknownLizmapProjectException $e) {
                jMessage::add('The \'only maps\' option is not well configured!', 'error');
                jLog::logEx($e, 'error');
            }
      }
    }

    // Get repository data
    $repository = $this->param('repository');

    $repositoryList = Array();
    if ( $repository ) {
      if( !jAcl2::check('lizmap.repositories.view', $repository )){
        $rep = $this->getResponse('redirect');
        $rep->action = 'view~default:index';
        jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
        return $rep;
      }
    }

    $title = jLocale::get("view~default.repository.list.title").' - '.$services->appName;

    if ( $repository ) {
      $lrep = lizmap::getRepository($repository);
      $title = $lrep->getData('label') .' - '. $title;
    }
    $rep->title = $title;

    $rep->body->assign('repositoryLabel', $title);

    $auth_url_return = jUrl::get('view~default:index');
    if ( $repository )
        $auth_url_return = jUrl::get('view~default:index', array('repository'=>$repository));
    $rep->body->assign('auth_url_return', $auth_url_return);

    $rep->body->assign('isConnected', jAuth::isConnected());
    $rep->body->assign('user', jAuth::getUserSession());

    if($services->allowUserAccountRequests)
      $rep->body->assign('allowUserAccountRequests', True);

    // Add Google Analytics ID
    if($services->googleAnalyticsID != '' && preg_match("/^UA-\d+-\d+$/", $services->googleAnalyticsID) == 1 ) {
        $rep->body->assign('googleAnalyticsID', $services->googleAnalyticsID);
    }


    $rep->body->assignZone('MAIN', 'main_view', array('repository'=>$repository, 'auth_url_return'=>$auth_url_return));

    // JS code
    // Click on thumbnails
    // and hack to normalize the height of the project thumbnails to avoid line breaks with long project titles
    $bp = jApp::config()->urlengine['basePath'];
    $rep->addJSLink($bp.'js/view.js');

    // Override default theme with color set in admin panel
    if($cssContent = jFile::read(jApp::varPath('lizmap-theme-config/') . 'theme.css') ){
      $css = '<style type="text/css">' . $cssContent . '</style>
      ';
      $rep->addHeadContent($css);
    }


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
