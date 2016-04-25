<?php
/**
* Displays the list of projects for ajax request
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class lizAjaxCtrl extends jController {

  /**
  * Displays the list of project for a given repository for ajax request.
  *
  * @param string $repository. Name of the repository.
  * @return Html fragment with a list of projects.
  */
  function index() {

    $rep = $this->getResponse('htmlfragment');

    // Get repository data
    $repository = $this->param('repository');

    $repositoryList = Array();
    if ( $repository ) {
      if( !jAcl2::check('lizmap.repositories.view', $repository )){
        jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
        return $rep;
      }
    }

    if ( $repository ) {
      $lrep = lizmap::getRepository($repository);
      $title .= ' - '.$lrep->getData('label');
    }

    $content = jZone::get('ajax_view', array('repository'=>$repository));
    $rep->addContent($content);

    return $rep;
  }

  /**
  * Displays map for ajax request.
  *
  * @param string $repository. Name of the repository.
  * @param string $project. Name of the project.
  * @return Html fragment with a list of projects.
  */
  function map() {

    $rep = $this->getResponse('htmlfragment');

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

    if(!jAcl2::check('lizmap.repositories.view', $lrep->getKey())){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
      return $rep;
    }
    // We must redirect to default repository project list if no project given
    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'error');
      return $rep;
    }

    // Get lizmapProject class
    $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
    if(!$lproj){
      jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'error');
      return $rep;
    }

    $lizUrls = array(
      "params" => array('repository'=>$repository, 'project'=>$project),
      "config" => jUrl::getFull('lizmap~service:getProjectConfig'),
      "wms" => jUrl::getFull('lizmap~service:index'),
      "media" => jUrl::getFull('view~media:getMedia'),
      "nominatim" => jUrl::getFull('lizmap~osm:nominatim'),
      "edition" => jUrl::getFull('lizmap~edition:getFeature'),
      "permalink" => jUrl::getFull('view~map:index')
    );

    // Get optional WMS public url list
    $lser = lizmap::getServices();
    if($lser->wmsPublicUrlList){
        $publicUrlList = $lser->wmsPublicUrlList;
        function f($x) {
            return jUrl::getFull('lizmap~service:index', array(), 0, trim($x));
        }
        $pul = array_map('f', explode(',', $publicUrlList));
        $lizUrls['publicUrlList'] = $pul;
    }

    if(jAcl2::check('lizmap.admin.repositories.delete'))
      $lizUrls['removeCache'] = jUrl::getFull('admin~config:removeLayerCache');

    $content = '<script type="text/javascript" src="'.jUrl::getFull('view~translate:index').'"/>'."\n";
    $content .= '<script type="text/javascript">// <![CDATA['."\n";
    $content .= "var lizUrls = ".json_encode($lizUrls).";\n";
    $content .= 'var lizPosition = {"lon":null, "lat":null, "zoom":null};'."\n";
    $content .= "$('#map').css('background-color','".$lproj->getCanvasColor()."');\n";
    $content .= "// ]]></script>";


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
    ), $wmsInfo);

    $tpl = new jTpl();
    $tpl->assign($assign);
    $content .= $tpl->fetch('view~map');

    $rep->addContent($content);

    return $rep;
  }


}
