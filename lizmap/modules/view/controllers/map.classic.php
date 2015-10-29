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
    $lser = lizmap::getServices();
    if ( !$repository ){
      $lrep = lizmap::getRepository($lser->defaultRepository);
      $repository = $lser->defaultRepository;
    } else {
      $lrep = lizmap::getRepository($repository);
    }

    if(!$lrep or !jacl2::check('lizmap.repositories.view', $lrep->getKey())){
      $rep = $this->getResponse('redirect');
      $rep->action = 'view~default:index';
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
      return $rep;
    }

    // We must redirect to default repository project list if no project given
    if(!$project){
      $lproj = lizmap::getProject($lrep->getKey().'~'.$lser->defaultProject);
      if (!$lproj) {
        jMessage::add('The parameter project is mandatory !', 'error');
        $ok = false;
      } else
        $project = $lser->defaultProject;
    }

    // Get lizmapProject class
    if($ok){
      $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
      if(!$lproj){
        jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'error');
        $ok = false;
      }
    }

    // Redirect if project is hidden (lizmap plugin option)
    if($ok){
      $pOptions = $lproj->getOptions();
      if (
          property_exists($pOptions,'hideProject')
          && $pOptions->hideProject == 'True'
      ){
        jMessage::add(jLocale::get('view~default.project.access.denied'), 'error');
        $ok = false;
      }
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
    $jq = jApp::config()->urlengine['jqueryPath'];
    $rep->addJSLink($jq.'include/jquery.include.js');
    $rep->addJSLink($bp.'jelix/js/jforms_jquery.js');
    $rep->addJSLink($bp.'jelix/js/jforms/datepickers/default/init.js');
    $rep->addJSLink($bp.'jelix/js/jforms/datepickers/default/ui.en.js');
    $rep->addJSLink($bp.'js/bootstrapErrorDecoratorHtml.js');

    // Add attributeTable js
    $rep->addJSLink($bp.'js/attributeTable.js');

    // Pass some configuration options to the web page through javascript var
    $lizUrls = array(
      "params" => array('repository'=>$repository, 'project'=>$project),
      "config" => jUrl::get('lizmap~service:getProjectConfig'),
      "wms" => jUrl::get('lizmap~service:index'),
      "media" => jUrl::get('view~media:getMedia'),
      "nominatim" => jUrl::get('lizmap~osm:nominatim'),
      "ign" => jUrl::get('lizmap~ign:address'),
      "edition" => jUrl::get('lizmap~edition:getFeature'),
      "permalink" => jUrl::getFull('view~map:index')
    );

    // Get optionnal WMS public url list
    $lser = lizmap::getServices();
    if($lser->wmsPublicUrlList){
        $publicUrlList = $lser->wmsPublicUrlList;
        function f($x) {
            return jUrl::getFull('lizmap~service:index', array(), 0, trim($x));
        }
        $pul = array_map('f', explode(',', $publicUrlList));
        $lizUrls['publicUrlList'] = $pul;
    }

    if(jacl2::check('lizmap.admin.repositories.delete'))
      $lizUrls['removeCache'] = jUrl::get('admin~config:removeLayerCache');

    $rep->addJSCode("var lizUrls = ".json_encode($lizUrls).";");
    $rep->addStyle('#map','background-color:'.$lproj->getCanvasColor().';');

    // Get the WMS information
    $wmsInfo = $lproj->getWMSInformation();
    // Set page title from projet title
    if( $wmsInfo['WMSServiceTitle'] != '' )
      $rep->title = $wmsInfo['WMSServiceTitle'];
    else
      $rep->title = $repository.' - '.$project;

    // Add Timemanager
    if( $lproj->hasTimemanagerLayers() ) {
        $rep->addJSLink($bp.'js/date.js');
        $rep->addJSLink($bp.'js/timemanager.js');
    }

    // Assign variables to template
    $assign = array_merge(array(
      'repositoryLabel'=>$lrep->getData('label'),
      'repository'=>$lrep->getKey(),
      'project'=>$project,
      'onlyMaps'=>$lser->onlyMaps
    ), $wmsInfo);


    // WMS GetCapabilities Url
    $wmsGetCapabilitiesUrl = jacl2::check(
      'lizmap.tools.displayGetCapabilitiesLinks',
      $lrep->getKey()
    );
    if ( $wmsGetCapabilitiesUrl ) {
      $wmsGetCapabilitiesUrl = $lproj->getData('wmsGetCapabilitiesUrl');
    }
    $assign['wmsGetCapabilitiesUrl'] = $wmsGetCapabilitiesUrl;

    $themePath = jApp::config()->urlengine['basePath'].'themes/'.jApp::config()->theme.'/';
    $rep->addCssLink($themePath.'css/main.css');
    $rep->addCssLink($themePath.'css/map.css');
    $rep->addCssLink($themePath.'css/media.css');
    // Replace default theme by theme found in
    // the repository folder media/themes/default/
    if ( $lrep->getData('allowUserDefinedThemes') ) {
      $repositoryPath = $lrep->getPath();
      $cssArray = array('main', 'map', 'media');
      $themeArray = array('default', $project);
      foreach ( $cssArray as $k ) {
        foreach ( $themeArray as $theme ) {
          $cssRelPath = 'media/themes/'.$theme.'/css/'.$k.'.css';
          $cssPath = $lrep->getPath().'/'.$cssRelPath;
          if (file_exists($cssPath) ){
            $cssUrl = jUrl::get(
              'view~media:getCssFile',
              array(
                'repository'=>$lrep->getKey(),
                'project'=>$project,
                'path'=>$cssRelPath
              )
            );
            $rep->addCssLink( $cssUrl );
          }
        }
      }

      // Add JS files found in media/js
      $jsDirArray = array('default', $project);
      foreach( $jsDirArray as $dir ){
        $jsPathGlob = $repositoryPath . '/' . 'media/js/' . $dir .'/*.js';
        foreach( glob( $jsPathGlob ) as $jsPath ){
          $jsPath = realpath( $jsPath );
          $jsRelPath = 'media/js/' . $dir .'/' . basename( $jsPath );
          $jsUrl = jUrl::get(
            'view~media:getMedia',
            array(
              'repository'=>$lrep->getKey(),
              'project'=>$project,
              'path'=>$jsRelPath
            )
          );
          $rep->addJSLink( $jsUrl );
        }
      }

    }

    // optionnally hide some tools
    // header
    $jsCode = ''; $headerMenuCss = '';
    $h = $this->intParam('h',1);
    if(
      $h == 0  or
      (
        property_exists($pOptions,'hideHeader')
        && $pOptions->hideHeader == 'True'
      )
    ){
      $h = 0;
      $headerMenuCss.= 'top:0px !important;';
      $jsCode.="
      $( document ).ready( function() {
        lizMap.events.on({
          'uicreated':function(evt){
            lizMap.updateContentSize();
          }
        });
      });
      ";
    }
    $assign['displayHeader'] = $h;

    // header menu = green menu with icons
    $hm = $this->intParam('hm', 1);
    if(
      $hm == 0  or
      (
        property_exists($pOptions,'hideMenu')
        && $pOptions->hideMenu == 'True'
      )
    ){
      $hm = 0;
      $headerMenuCss.= 'display:none !important; height:0px;';
      $jsCode.= "
      $( document ).ready( function() {
        lizMap.events.on({
          'uicreated':function(evt){
            lizMap.updateContentSize();
          }
        });
      });
      ";
    }
    $assign['displayHeaderMenu'] = $hm;

    // menu = left panel
    $l = $this->intParam('l', 1);
    if(
      $l == 0  or
      (
        property_exists($pOptions,'hideLegend')
        && $pOptions->hideLegend == 'True'
      )
    ){
      $l = 0;
      $rep->addStyle('#menu', 'display:none;');
      $jsCode.= "
      $( document ).ready( function() {

        lizMap.events.on({
          'uicreated':function(evt){
            $('#close-menu .ui-icon-close-menu').click();
          }

        });
      });
      ";
    }

    // navbar
    $n = $this->intParam('n', 1);
    if(
      $n == 0  or
      (
        property_exists($pOptions,'hideNavbar')
        && $pOptions->hideNavbar == 'True'
      )
    ){
      $rep->addStyle('#navbar', 'display:none !important;');
    }

    // overview-box = scale & overview
    $o = $this->intParam('o', 1);
    if(
      $o == 0  or
      (
        property_exists($pOptions,'hideOverview')
        && $pOptions->hideOverview == 'True'
      )
    ){
      $rep->addStyle('#overview-box', 'display:none !important;');
    }

    // Apply interface modifications
    if( $headerMenuCss != '' )
      $rep->addStyle('#headermenu', $headerMenuCss);
    if( $jsCode != '')
      $rep->addJSCode($jsCode);

    // Hide groups checkboxes
    $hideGroupCheckbox = '';
    if( property_exists($pOptions,'hideGroupCheckbox')
        && $pOptions->hideGroupCheckbox == 'True'
    ) {
      $hideGroupCheckbox = 'hideGroupCheckbox';
    }
    $assign['hideGroupCheckbox'] = $hideGroupCheckbox;


    $rep->body->assign($assign);

    // Log
    $eventParams = array(
        'key' => 'viewmap',
        'content' => '',
        'repository' => $lrep->getKey(),
        'project' => $project
    );
    jEvent::notify('LizLogItem', $eventParams);

    return $rep;
  }


}
