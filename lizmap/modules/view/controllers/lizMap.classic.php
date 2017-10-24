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

class lizMapCtrl extends jController {

  // repositoryKey: Used to pass repository key
  protected $repositoryKey = null;
  // projectKey: Used to pass project key
  protected $projectKey = null;
  // projectObj: Used to pass project Object (no need to rebuild it)
  protected $projectObj = null;

  // forceHiddenProjectVisible: Used to override plugin configuration hideProject
  // (helpfull for modules which maps are based on a hidden project)
  protected $forceHiddenProjectVisible = false;

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

    // default response
    // redirection if error encountered
    $rep = $this->getResponse('redirect');
    $rep->action = 'view~default:index';

    if(!$lrep or !jAcl2::check('lizmap.repositories.view', $lrep->getKey())){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
      return $rep;
    }

    // We must redirect to default repository project list if no project given
    if(!$project){
        try {
            $lproj = lizmap::getProject($lrep->getKey().'~'.$lser->defaultProject);
            if (!$lproj) {
                jMessage::add('The parameter project is mandatory!', 'error');
                return $rep;
            } else
                $project = $lser->defaultProject;
        }
        catch(UnknownLizmapProjectException $e) {
            jMessage::add('The parameter project is mandatory!', 'error');
            return $rep;
        }
    }

    // Get lizmapProject class
    try {
        $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
        if(!$lproj){
            jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'error');
            return $rep;
        }
    }
    catch(UnknownLizmapProjectException $e) {
        jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'error');
        return $rep;
    }

    // Redirect if no right to access the project
    if (!$lproj->checkAcl()) {
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
      return $rep;
    }

    $pOptions = $lproj->getOptions();
    // Redirect if project is hidden (lizmap plugin option)
    if(!$this->forceHiddenProjectVisible ){
      if (
          property_exists($pOptions,'hideProject')
          && $pOptions->hideProject == 'True'
      ){
        jMessage::add(jLocale::get('view~default.project.access.denied'), 'error');
        return $rep;
      }
    }

    // the html response
    $rep = $this->getResponse('htmlmap');
    $rep->addJSLink(jUrl::get('view~translate:index'));

    $this->repositoryKey = $lrep->getKey();
    $this->projectKey = $lproj->getKey();
    $this->projectObj = $lproj;

    // Add js link if google is needed
    if ( $lproj->needsGoogle() ) {
      $googleKey = $lproj->getGoogleKey();
      if ( $googleKey != '' )
        $rep->addJSLink('https://maps.google.com/maps/api/js?v=3&key='.$googleKey);
      else
        $rep->addJSLink('https://maps.google.com/maps/api/js?v=3');
    }

    // Add the jForms js
    $bp = jApp::config()->urlengine['basePath'];
    $jq = jApp::config()->urlengine['jqueryPath'];
    $rep->addJSLink($jq.'include/jquery.include.js');
    $rep->addJSLink($bp.'jelix/js/jforms_jquery.js');
    $rep->addJSLink($bp.'jelix/js/jforms/datepickers/default/init.js');
    $rep->addJSLink($bp.'jelix/js/jforms/datepickers/default/ui.en.js');
    $rep->addJSLink($bp.'js/fileUpload/jquery.fileupload.js');
    $rep->addJSLink($bp.'js/bootstrapErrorDecoratorHtml.js');

    // Add botom dock js
    $rep->addJSLink($bp.'js/bottom-dock.js');

    // Pass some configuration options to the web page through javascript var
    $lizUrls = array(
      "params" => array('repository'=>$repository, 'project'=>$project),
      "config" => jUrl::get('lizmap~service:getProjectConfig'),
      "wms" => jUrl::get('lizmap~service:index'),
      "media" => jUrl::get('view~media:getMedia'),
      "nominatim" => jUrl::get('lizmap~osm:nominatim'),
      "ign" => jUrl::get('lizmap~ign:address'),
      "edition" => jUrl::get('lizmap~edition:getFeature'),
      "permalink" => jUrl::getFull('view~map:index'),
      "dataTableLanguage"=> $bp.'js/dataTables/'.jApp::config()->locale.'.json',
      "basepath" => $bp,
      "geobookmark" => jUrl::get('lizmap~geobookmark:index')
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
      $lizUrls['removeCache'] = jUrl::get('admin~config:removeLayerCache');

    $rep->addJSCode("var lizUrls = ".json_encode($lizUrls).";");
    $rep->addJSCode("var lizProj4 = ".json_encode($lproj->getAllProj4()).";");
    $rep->addStyle('#map','background-color:'.$lproj->getCanvasColor().';');

    // Get the WMS information
    $wmsInfo = $lproj->getWMSInformation();
    // Set page title from projet title
    $title = $project;
    if( $wmsInfo['WMSServiceTitle'] != '' )
      $title = $wmsInfo['WMSServiceTitle'];

    $title .= ' - '.$lrep->getData('label');
    $title .= ' - '. $lser->appName;
    $rep->title = $title;


    // Add search js
    $rep->addJSLink($bp.'js/search.js');


    // Add date.js for timemanager
    if( $lproj->hasTimemanagerLayers() ) {
        $rep->addJSLink($bp.'js/date.js');
    }

    // Assign variables to template
    $assign = array_merge(array(
      'repositoryLabel'=>$lrep->getData('label'),
      'repository'=>$lrep->getKey(),
      'project'=>$project,
      'onlyMaps'=>$lser->onlyMaps
    ), $wmsInfo);


    // WMS GetCapabilities Url
    $wmsGetCapabilitiesUrl = jAcl2::check(
      'lizmap.tools.displayGetCapabilitiesLinks',
      $lrep->getKey()
    );
    if ( $wmsGetCapabilitiesUrl ) {
      $wmsGetCapabilitiesUrl = $lproj->getData('wmsGetCapabilitiesUrl');
    }
    $assign['wmsGetCapabilitiesUrl'] = $wmsGetCapabilitiesUrl;

    // Get dockable and minidockable element
    $assign = array_merge( $assign, $this->getProjectDockables() );

    // Add dockable js
    foreach( array_merge($assign['dockable'], $assign['minidockable'], $assign['bottomdockable'], $assign['rightdockable'] ) as $d ) {
        if ( $d->js != '' )
          $rep->addJsLink( $d->js );
    }

    $themePath = jApp::config()->urlengine['basePath'].'themes/'.jApp::config()->theme.'/';
    $rep->addCssLink($themePath.'css/main.css');
    $rep->addCssLink($themePath.'css/map.css');
    $rep->addCssLink($themePath.'css/media.css');

    // Add dockable css
    foreach( array_merge($assign['dockable'], $assign['minidockable'], $assign['bottomdockable'], $assign['rightdockable'] ) as $d ) {
        if ( $d->css != '' )
          $rep->addCssLink( $d->css );
    }

    // Get additionnal JS and CSS from modules
    $additions = jEvent::notify('getMapAdditions',array('repository'=>$repository, 'project'=>$project))->getResponse();
    foreach($additions as $addition){
      if(is_array($addition)){
        if(array_key_exists('js', $addition)){
          foreach( $addition['js'] as $js ){
            $rep->addJSLink($js);
          }
        }
        if(array_key_exists('jscode', $addition)){
          foreach( $addition['jscode'] as $jscode ){
            $rep->addJSCode($jscode);
          }
        }
        if(array_key_exists('css', $addition)){
          foreach( $addition['css'] as $css ){
            $rep->addCssLink($css);
          }
        }
      }
    }

    // Override default theme with color set in admin panel
    if($cssContent = jFile::read(jApp::varPath('lizmap-theme-config/') . 'theme.css') ){
      $css = '<style type="text/css">' . $cssContent . '</style>
      ';
      $rep->addHeadContent($css);
    }


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
            //~ $rep->addCssLink( $cssUrl );
              // Use addHeadContent and not addCssLink to be sure it will be loaded after minified code
            $rep->addHeadContent('<link type="text/css" href="'.$cssUrl.'" rel="stylesheet" />');
          }
        }
      }

      // Add JS files found in media/js
      $jsDirArray = array('default', $project);
      foreach( $jsDirArray as $dir ){
        $jsUrls = array();
        $cssUrls = array();
        $jsPathRoot = realpath($repositoryPath . '/' . 'media/js/' . $dir);
        if( is_dir( $jsPathRoot ) ) {
          foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($jsPathRoot)) as $filename){
            $fileExtension = pathinfo($filename,  PATHINFO_EXTENSION);
            if( $fileExtension == 'js' || $fileExtension == 'css' ){
              $jsPath = realpath( $filename );
              $jsRelPath = 'media/js/' . $dir . str_replace( $jsPathRoot, '', $jsPath);
              $jsUrl = jUrl::get(
                'view~media:getMedia',
                array(
                  'repository'=>$lrep->getKey(),
                  'project'=>$project,
                  'path'=>$jsRelPath
                )
              );
              if($fileExtension == 'js')
                $jsUrls[] = $jsUrl;
              else
                $cssUrls[] = $jsUrl;
            }
          }
        }

        // Add CSS and JS files orderd by name
        sort($cssUrls);
        foreach( $cssUrls as $cssUrl ){
          $rep->addCSSLink( $cssUrl );
        }
        sort($jsUrls);
        foreach( $jsUrls as $jsUrl ){
          // Use addHeadContent and not addJSLink to be sure it will be loaded after minified code
          $rep->addContent('<script type="text/javascript" src="'.$jsUrl.'" ></script>');
        }
      }

    }

    // optionally hide some tools
    // header
    $jsCode = ''; $mapMenuCss = '';
    $h = $this->intParam('h',1);
    if(
      $h == 0  or
      (
        property_exists($pOptions,'hideHeader')
        && $pOptions->hideHeader == 'True'
      )
    ){
      $h = 0;
      $rep->addStyle('#body', 'padding-top:0px;');
      $rep->addStyle('#header', 'display:none; height:0px;');
    }

    // menu = left vertical menu with icons
    $m = $this->intParam('m', 1);
    if(
      $m == 0  or
      (
        property_exists($pOptions,'hideMenu')
        && $pOptions->hideMenu == 'True'
      )
    ){
      $m = 0;
      $rep->addStyle('#mapmenu', 'display:none !important; width:0px;');
      $rep->addStyle('#dock', 'left:0px; border-left:none;');
      $rep->addStyle('#map-content', 'margin-left:0px;');
    }

    // legend = legend open at startup
    $l = $this->intParam('l', 1);
    if(
      $l == 0  or
      (
        property_exists($pOptions,'hideLegend')
        && $pOptions->hideLegend == 'True'
      )
    ){
      $l = 0;
      //~ $rep->addStyle('#dock', 'display:none;');
      $jsCode.= "
      $( document ).ready( function() {
        lizMap.events.on({
          'uicreated':function(evt){
            $('#button-switcher').click();
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
    if( $jsCode != '')
      $rep->addJSCode($jsCode);


    // Hide groups checkboxes
    if( property_exists($pOptions,'hideGroupCheckbox')
        && $pOptions->hideGroupCheckbox == 'True'
    ) {
      $rep->addStyle('#switcher-layers button[name="group"]', 'display:none !important;');
    }

    // Add filter
    $filterParam = $this->param('filter');
    $filter = array();
    if ( $filterParam ){
      $fExp = explode( ';', $filterParam );
      foreach( $fExp as $item ){
        $iExp = explode( ':', $item );
        if( count($iExp) == 2 ){
          $filter[ $iExp[0] ] = $iExp[1];
        }
      }
      if( count( $filter ) > 0 )
        $rep->addJSCode( "var lizLayerFilter = " . json_encode($filter) . ";" );
    }

    // Add styles if needed
    $stylesParam = $this->param('layerStyles');
    $styles = array();
    if ( $stylesParam ){
      $fExp = explode( ';', $stylesParam );
      foreach( $fExp as $item ){
        $iExp = explode( ':', $item );
        if( count($iExp) == 2 ){
          $styles[ $iExp[0] ] = $iExp[1];
        }
      }
      if( count( $styles ) > 0 )
        $rep->addJSCode( "var lizLayerStyles = " . json_encode($styles) . ";" );
    }

    //$assign['auth_url_return'] = jUrl::get('view~default:index');

    // switcher-layers-actions javascript
    $rep->addJSLink( $bp.'js/switcher-layers-actions.js' );

    // Add Google Analytics ID
    $assign['googleAnalyticsID'] = '';
    if($lser->googleAnalyticsID != '' && preg_match("/^UA-\d+-\d+$/", $lser->googleAnalyticsID) == 1 )
      $assign['googleAnalyticsID'] = $lser->googleAnalyticsID;

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

  protected function getProjectDockables() {

    // Get repository key
    $repository = $this->repositoryKey;
    // Get the project key
    $project = $this->projectKey;
    // Get project object
    $lproj = $this->projectObj;

    $assign = array();
    // Get dockable and minidockable element
    $assign['dockable'] = $lproj->getDefaultDockable();
    $items = jEvent::notify('mapDockable',array('repository'=>$repository, 'project'=>$project))->getResponse();
    $assign['dockable'] = mapDockItemsMerge( $assign['dockable'], $items );

    $assign['minidockable'] = $lproj->getDefaultMiniDockable();
    $items = jEvent::notify('mapMiniDockable',array('repository'=>$repository, 'project'=>$project))->getResponse();
    $assign['minidockable'] = mapDockItemsMerge( $assign['minidockable'], $items );

    $assign['bottomdockable'] = $lproj->getDefaultBottomDockable();
    $items = jEvent::notify('mapBottomDockable',array('repository'=>$repository, 'project'=>$project))->getResponse();
    $assign['bottomdockable'] = mapDockItemsMerge( $assign['bottomdockable'], $items );

    $assign['rightdockable'] = array();
    $items = jEvent::notify('mapRightDockable',array('repository'=>$repository, 'project'=>$project))->getResponse();
    $assign['rightdockable'] = mapDockItemsMerge( $assign['rightdockable'], $items );

    return $assign;
  }
}
