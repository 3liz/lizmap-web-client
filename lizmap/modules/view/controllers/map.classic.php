<?php
/**
* Displays a full featured map based on one Qgis project.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mapCtrl extends jController {

  /**
  * Load the map page for the given project.
  * @param string $repository Name of the repository.
  * @param string $project Name of the project.
  * @return Page with map and content for the chose Qgis project.
  */
  function index() {

    if ($this->param('theme')) {
      jApp::config()->theme = $this->param('theme');
    }
    $rep = $this->getResponse('htmlmap');
    $rep->addJSLink(jUrl::get('view~translate:index'));
    $ok = true;

    // Get the project
    $project = filter_var($this->param('project'), FILTER_SANITIZE_STRING);

    // Get repository data
    $repository = $this->param('repository');

    // Get lizmapRepository class
    // if repository not found get the default
    $lrep = null;
    if ( !$repository ){
      $lser = lizmap::getServices();
      $lrep = lizmap::getRepository($lser->defaultRepository);
    } else
      $lrep = lizmap::getRepository($repository);

    if(!jacl2::check('lizmap.repositories.view', $lrep->getKey())){
      $rep = $this->getResponse('redirect');
      $rep->action = 'view~default:index';
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
      return $rep;
    }

    // We must redirect to default repository project list if no project given
    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'error');
      $ok = false;
    }

    // Get lizmapProject class
    $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
    if(!$lproj){
      jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'error');
      $ok = false;
    }

    // Redirect if error encountered
    if(!$ok){
      $rep = $this->getResponse('redirect');
      $rep->params = array('repository'=>$lrep->getKey());
      $rep->action = 'view~default:index';
      return $rep;
    }

    // Add js link if google is needed
    if ( $lproj->needsGoogle() ) {
      $googleKey = $lproj->getGoogleKey();
      if ( $googleKey != '' )
        $rep->addJSLink('https://maps.google.com/maps/api/js?v=3.5&sensor=false&key='.$googleKey);
      else
        $rep->addJSLink('https://maps.google.com/maps/api/js?v=3.5&sensor=false');
    }

    // Add the jForms js
    $bp = jApp::config()->urlengine['basePath'];
    $rep->addJSLink($bp.'jelix/js/jforms_light.js');
    $rep->addJSLink($bp.'js/bootstrapErrorDecoratorHtml.js');

    // Pass some configuration options to the web page through javascript var
    $rep->addJSCode("var cfgUrl = '".jUrl::get('lizmap~service:getProjectConfig', array('repository'=>$repository, 'project'=>$project))."';");
    $rep->addJSCode("var wmsServerURL = '".jUrl::get('lizmap~service:index', array('repository'=>$repository, 'project'=>$project))."';");
    $rep->addJSCode("var mediaServerURL = '".jUrl::get('view~media:getMedia', array('repository'=>$repository, 'project'=>$project))."';");
    $rep->addJSCode("var nominatimURL = '".jUrl::get('lizmap~osm:nominatim')."';");
    $rep->addJSCode("var createAnnotationURL = '".jUrl::get('lizmap~annotation:createAnnotation', array('repository'=>$repository, 'project'=>$project))."';");

    // Get the WMS information
    $wmsInfo = $lproj->getWMSInformation();
    // Set page title from projet title
    if( $wmsInfo['WMSServiceTitle'] != '' )
      $rep->title = $wmsInfo['WMSServiceTitle'];
    else
      $rep->title = $repository.' - '.$project;

    $assign = array_merge(array(
      'repositoryLabel'=>$lrep->getData('label'),
      'repository'=>$lrep->getKey(),
      'project'=>$project,
      'isConnected'=>jAuth::isConnected(),
      'user'=>jAuth::getUserSession()
    ), $wmsInfo);
    $rep->body->assign($assign);

    return $rep;
  }


}
