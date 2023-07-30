<?php
/**
 * Displays a full featured map based on one Qgis project.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizMapCtrl extends jController
{
    // repositoryKey: Used to pass repository key
    protected $repositoryKey;
    // projectKey: Used to pass project key
    protected $projectKey;

    /**
     * Used to pass project Object (no need to rebuild it).
     *
     * @var \Lizmap\Project\Project
     */
    protected $projectObj;

    // forceHiddenProjectVisible: Used to override plugin configuration hideProject
    // (helpfull for modules which maps are based on a hidden project)
    protected $forceHiddenProjectVisible = false;

    /**
     * Load the map page for the given project.
     *
     * @param string $repository name of the repository
     * @param string $project    name of the project
     *
     * @return jResponseHtml|jResponseRedirect with map and content for the chose Qgis project
     */
    public function index()
    {
        if ($this->param('theme')) {
            jApp::config()->theme = $this->param('theme');
        }
        $ok = true;

        // Get the project
        $project = htmlspecialchars(strip_tags($this->param('project')));

        // Get repository data
        $repository = $this->param('repository');

        // Get lizmapRepository class
        // if repository not found get the default
        $lrep = null;
        $lser = lizmap::getServices();
        if (!$repository) {
            $lrep = lizmap::getRepository($lser->defaultRepository);
            $repository = $lser->defaultRepository;
        } else {
            $lrep = lizmap::getRepository($repository);
        }

        // default response
        // redirection if error encountered
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->action = 'view~default:index';

        // Check server status
        $server = new \Lizmap\Server\Server();

        // QGIS server version
        $requiredQgisVersion = jApp::config()->minimumRequiredVersion['qgisServer'];
        $currentQgisVersion = $server->getQgisServerVersion();

        // Lizmap server plugin version
        $requiredLizmapVersion = jApp::config()->minimumRequiredVersion['lizmapServerPlugin'];
        $currentLizmapVersion = $server->getLizmapPluginServerVersion();

        // Check if they are found and also their versions
        if ($server->versionCompare($currentQgisVersion, $requiredQgisVersion)
            || $server->pluginServerNeedsUpdate($currentLizmapVersion, $requiredLizmapVersion)) {
            jMessage::add(jLocale::get('view~default.server.information.error'), 'error');

            return $rep;
        }

        if (!$lrep or !jAcl2::check('lizmap.repositories.view', $lrep->getKey())) {
            jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
            if (!jAuth::isConnected()) {
                $rep->action = 'jcommunity~login:index';
            }

            return $rep;
        }

        // We must redirect to default repository project list if no project given
        if (!$project) {
            try {
                $lproj = lizmap::getProject($lrep->getKey().'~'.$lser->defaultProject);
                if (!$lproj) {
                    jMessage::add('The parameter project is mandatory!', 'error');

                    return $rep;
                }
                $project = $lser->defaultProject;
            } catch (\Lizmap\Project\UnknownLizmapProjectException $e) {
                jMessage::add('The parameter project is mandatory!', 'error');

                return $rep;
            }
        }

        // Get the project
        try {
            $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'error');

                return $rep;
            }
        } catch (\Lizmap\Project\UnknownLizmapProjectException $e) {
            jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'error');

            return $rep;
        }

        // Redirect if the project needs an upgrade
        if ($lproj->needsUpdateError()) {
            jMessage::add(jLocale::get('view~default.project.needs.update'), 'error');

            return $rep;
        }

        // Redirect if no right to access the project
        if (!$lproj->checkAcl()) {
            jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
            if (!jAuth::isConnected()) {
                $rep->action = 'jcommunity~login:index';
            }

            return $rep;
        }

        // Redirect if project is hidden (lizmap plugin option)
        if (!$this->forceHiddenProjectVisible) {
            if ($lproj->getBooleanOption('hideProject')) {
                jMessage::add(jLocale::get('view~default.project.access.denied'), 'error');

                return $rep;
            }
        }

        // the html response
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('htmlmap');
        $rep->addJSLink((jUrl::get('view~translate:index')).'?lang='.jApp::config()->locale);

        $this->repositoryKey = $lrep->getKey();
        $this->projectKey = $lproj->getKey();
        $this->projectObj = $lproj;

        // Add js link if google is needed
        if ($lproj->needsGoogle()) {
            $googleKey = $lproj->getGoogleKey();
            if ($googleKey != '') {
                $rep->addJSLink('https://maps.google.com/maps/api/js?v=3&key='.$googleKey);
            } else {
                $rep->addJSLink('https://maps.google.com/maps/api/js?v=3');
            }
        }

        $bp = jApp::urlBasePath();

        // Add the jForms js
        if ($lproj->hasEditionLayersForCurrentUser()) {
            $www = jApp::urlJelixWWWPath();
            $rep->addAssets('jforms_html');
            $rep->addJSLink($www.'jquery/include/jquery.include.js');
            $rep->addAssets('jforms_imageupload');
            $rep->addAssets('jforms_datepicker_default');
            $rep->addAssets('jforms_datetimepicker_default');
            $rep->addAssets('jforms_htmleditor_ckdefault');

            // Add other js
            $rep->addJSLink($bp.'assets/js/fileUpload/jquery.fileupload.js');
            $rep->addJSLink($bp.'assets/js/bootstrapErrorDecoratorHtml.js');
        }

        // Add bottom dock js
        $rep->addJSLink($bp.'assets/js/bottom-dock.js');

        // Pass some configuration options to the web page through javascript var
        $lizUrls = array(
            'params' => array('repository' => $repository, 'project' => $project),
            'config' => jUrl::get('lizmap~service:getProjectConfig'),
            'keyValueConfig' => jUrl::get('lizmap~service:getKeyValueConfig'),
            'wms' => jUrl::get('lizmap~service:index'),
            'media' => jUrl::get('view~media:getMedia'),
            'nominatim' => jUrl::get('lizmap~osm:nominatim'),
            'ign' => jUrl::get('lizmap~ign:address'),
            'edition' => jUrl::get('lizmap~edition:getFeature'),
            'permalink' => jUrl::getFull('view~map:index'),
            'dataTableLanguage' => $bp.'assets/js/dataTables/'.jApp::config()->locale.'.json',
            'basepath' => $bp,
            'geobookmark' => jUrl::get('lizmap~geobookmark:index'),
            'service' => jUrl::get('lizmap~service:index').'?repository='.$repository.'&project='.$project,
        );

        // Get optional WMS public url list
        $lser = lizmap::getServices();
        if ($lser->wmsPublicUrlList) {
            $publicUrlList = $lser->wmsPublicUrlList;
            function f($x)
            {
                return jUrl::getFull('lizmap~service:index', array(), 0, trim($x));
            }
            $pul = array_map('f', explode(',', $publicUrlList));
            $lizUrls['publicUrlList'] = $pul;
        }

        if (jAcl2::check('lizmap.admin.repositories.delete')) {
            $lizUrls['removeCache'] = jUrl::get('admin~maps:removeLayerCache');
        }

        $rep->addJSCode('var lizUrls = '.json_encode($lizUrls).';');
        $rep->addJSCode('var lizProj4 = '.json_encode($lproj->getAllProj4()).';');
        $rep->addStyle('#map', 'background-color:'.$lproj->getCanvasColor().';');

        // Get the WMS information
        $wmsInfo = $lproj->getWMSInformation();
        // Set page title from projet title
        $title = $project;
        if ($wmsInfo['WMSServiceTitle'] != '') {
            $title = $wmsInfo['WMSServiceTitle'];
        }

        $title .= ' - '.$lrep->getLabel();
        $title .= ' - '.$lser->appName;
        $rep->title = $title;

        // Add search js
        $rep->addJSLink($bp.'assets/js/search.js');

        // Add moment.js for timemanager
        if ($lproj->hasTimemanagerLayers()) {
            $rep->addJSLink($bp.'assets/js/moment.js');
            $rep->addJSLink($bp.'assets/js/filter.js');
            $filterConfigData = array(
                'url' => jUrl::get(
                    'filter~service:index',
                    array(
                        'repository' => $this->repositoryKey,
                        'project' => $this->projectKey,
                    )
                ),
            );
            $rep->addJSCode('var filterConfigData = '.json_encode($filterConfigData));
        }

        // Add atlas.js for atlas feature and additionnal CSS for right-dock max-width
        if ($lproj->hasAtlasEnabled()) {
            // Add JS
            $rep->addJSLink($bp.'assets/js/atlas.js');

            // Add CSS
            $atlasWidth = $lproj->getOption('atlasMaxWidth');
            $cssContent = '';
            $cssContent .= "#content.atlas-visible:not(.mobile) #right-dock {width: {$atlasWidth}%; max-width: {$atlasWidth}%;}";
            $cssContent .= "#content.atlas-visible:not(.mobile) #map-content {margin-right: {$atlasWidth}%;}";
            $css = '<style type="text/css">'.$cssContent.'</style>';
            $rep->addHeadContent($css);
        }

        // Assign variables to template
        $assign = array_merge(array(
            'repositoryLabel' => $lrep->getLabel(),
            'repository' => $lrep->getKey(),
            'project' => $project,
            'onlyMaps' => $lser->onlyMaps,
        ), $wmsInfo);

        // WMS GetCapabilities Url
        $wmsGetCapabilitiesUrl = jAcl2::check(
            'lizmap.tools.displayGetCapabilitiesLinks',
            $lrep->getKey()
        );
        if ($wmsGetCapabilitiesUrl) {
            $wmsGetCapabilitiesUrl = $lproj->getWMSGetCapabilitiesUrl();
        }
        $assign['wmsGetCapabilitiesUrl'] = $wmsGetCapabilitiesUrl;

        // Get dockable and minidockable element
        $assign = array_merge($assign, $this->getProjectDockables());

        // Add dockable js
        foreach (array_merge($assign['dockable'], $assign['minidockable'], $assign['bottomdockable'], $assign['rightdockable']) as $d) {
            if ($d->js != '') {
                $rep->addJsLink($d->js, $d->jsParams);
            }
        }

        $rep->addAssets('maptheme');

        // Add dockable css
        foreach (array_merge($assign['dockable'], $assign['minidockable'], $assign['bottomdockable'], $assign['rightdockable']) as $d) {
            if ($d->css != '') {
                $rep->addCssLink($d->css);
            }
        }

        // Get additionnal JS and CSS from modules
        $additions = jEvent::notify('getMapAdditions', array('repository' => $repository, 'project' => $project))->getResponse();
        foreach ($additions as $addition) {
            if (is_array($addition)) {
                if (array_key_exists('js', $addition)) {
                    foreach ($addition['js'] as $js) {
                        $rep->addJSLink($js);
                    }
                }
                if (array_key_exists('jscode', $addition)) {
                    foreach ($addition['jscode'] as $jscode) {
                        $rep->addJSCode($jscode);
                    }
                }
                if (array_key_exists('css', $addition)) {
                    foreach ($addition['css'] as $css) {
                        $rep->addCssLink($css);
                    }
                }
            }
        }

        // Override default theme with color set in admin panel
        $CSSThemeFile = jApp::varPath('lizmap-theme-config/').'theme.css';
        if (file_exists($CSSThemeFile)) {
            $cssContent = file_get_contents($CSSThemeFile);
            if ($cssContent) {
                $css = '<style type="text/css">'.$cssContent.'</style>';
                $rep->addHeadContent($css);
            }
        }

        // Override default theme by themes found in folder media/themes/...
        // Theme name can be 'default' and apply to all projects in a repository
        // or the project name and only apply to it
        // Also if media/themes/default/css is found one directory above repositorie's one
        // it will apply to all repositories
        if ($lrep->allowUserDefinedThemes()) {
            $repositoryPath = $lrep->getPath();
            $cssArray = array('main', 'map', 'media');
            $themeArray = array('default', $project);
            foreach ($cssArray as $k) {
                // Handle theme applying to all repository's projects in the same directory
                $cssRelPath = '../media/themes/default/css/'.$k.'.css';
                $cssPath = realpath($repositoryPath.$cssRelPath);
                if (file_exists($cssPath)) {
                    $cssUrl = jUrl::get(
                        'view~media:getCssFile',
                        array(
                            'repository' => $lrep->getKey(),
                            'project' => $project,
                            'path' => $cssRelPath,
                        )
                    );
                    // ~ $rep->addCssLink( $cssUrl );
                    // Use addHeadContent and not addCssLink to be sure it will be loaded after minified code
                    $rep->addHeadContent('<link type="text/css" href="'.$cssUrl.'" rel="stylesheet" />');
                }

                // Handle themes applying to a repository (media/themes/default)
                // or to a project (media/themes/PROJECT-NAME)
                foreach ($themeArray as $theme) {
                    $cssRelPath = 'media/themes/'.$theme.'/css/'.$k.'.css';
                    $cssPath = realpath($repositoryPath.$cssRelPath);
                    if (file_exists($cssPath)) {
                        $cssUrl = jUrl::get(
                            'view~media:getCssFile',
                            array(
                                'repository' => $lrep->getKey(),
                                'project' => $project,
                                'path' => $cssRelPath,
                            )
                        );
                        // ~ $rep->addCssLink( $cssUrl );
                        // Use addHeadContent and not addCssLink to be sure it will be loaded after minified code
                        $rep->addHeadContent('<link type="text/css" href="'.$cssUrl.'" rel="stylesheet" />');
                    }
                }
            }

            // Add JS files found in media/js
            $jsDirArray = array('default', $project);
            foreach ($jsDirArray as $dir) {
                $jsUrls = array();
                $cssUrls = array();
                $items = array(
                    'media/js/',
                    '../media/js/',
                );
                foreach ($items as $item) {
                    $jsPathRoot = realpath($repositoryPath.$item.$dir);
                    if (is_dir($jsPathRoot)) {
                        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($jsPathRoot)) as $filename) {
                            $fileExtension = pathinfo($filename, PATHINFO_EXTENSION);
                            if ($fileExtension == 'js' || $fileExtension == 'css') {
                                $jsPath = realpath($filename);
                                $jsRelPath = $item.$dir.str_replace($jsPathRoot, '', $jsPath);
                                $url = 'view~media:getMedia';
                                if ($fileExtension == 'css') {
                                    $url = 'view~media:getCssFile';
                                }
                                $jsUrl = jUrl::get(
                                    $url,
                                    array(
                                        'repository' => $lrep->getKey(),
                                        'project' => $project,
                                        'mtime' => filemtime($filename),
                                        'path' => $jsRelPath,
                                    )
                                );
                                if ($fileExtension == 'js') {
                                    $jsUrls[] = $jsUrl;
                                } else {
                                    $cssUrls[] = $jsUrl;
                                }
                            }
                        }
                    }
                }

                // Add CSS and JS files orderd by name
                sort($cssUrls);
                foreach ($cssUrls as $cssUrl) {
                    $rep->addCSSLink($cssUrl);
                }
                sort($jsUrls);
                foreach ($jsUrls as $jsUrl) {
                    // Use addHeadContent and not addJSLink to be sure it will be loaded after minified code
                    $rep->addContent('<script type="text/javascript" src="'.$jsUrl.'" ></script>');
                }
            }
        }

        // optionally hide some tools
        // header
        $jsCode = '';
        $mapMenuCss = '';
        $h = $this->intParam('h', 1);
        if ($h == 0
            || $lproj->getBooleanOption('hideHeader')
        ) {
            $h = 0;
            $rep->addStyle('#body', 'padding-top:0px;');
            $rep->addStyle('#header', 'display:none; height:0px;');
        }

        // menu = left vertical menu with icons
        $m = $this->intParam('m', 1);
        if ($m == 0
            || $lproj->getBooleanOption('hideMenu')
        ) {
            $m = 0;
            $rep->addStyle('#mapmenu', 'display:none !important; width:0px;');
            $rep->addStyle('#dock', 'left:0px; border-left:none;');
            $rep->addStyle('#map-content', 'margin-left:0px;');
            $rep->addStyle('#content.mobile #mini-dock', 'left:0px;');
        }

        // legend = legend open at startup
        $l = $this->intParam('l', 1);
        if ($l == 0
            || $lproj->getBooleanOption('hideLegend')
        ) {
            $l = 0;
            // ~ $rep->addStyle('#dock', 'display:none;');
            $jsCode .= "
      $( document ).ready( function() {
        lizMap.events.on({
          'uicreated':function(evt){
            $('li.switcher.active #button-switcher').click();
          }
        });
      });
      ";
        }

        // navbar
        $n = $this->intParam('n', 1);
        if ($n == 0
            || $lproj->getBooleanOption('hideNavbar')
        ) {
            $rep->addStyle('#navbar', 'display:none !important;');
        }

        // overview-box = scale & overview
        $o = $this->intParam('o', 1);
        if ($o == 0
            || $lproj->getBooleanOption('hideOverview')
        ) {
            $rep->addStyle('#overview-box', 'display:none !important;');
        }

        // Apply interface modifications
        if ($jsCode != '') {
            $rep->addJSCode($jsCode);
        }

        // Hide groups checkboxes
        if ($lproj->getBooleanOption('hideGroupCheckbox')) {
            $rep->addStyle('#switcher-layers button[name="group"]', 'display:none !important;');
        }

        // Add filter
        $filterParam = $this->param('filter');
        $filter = array();
        if ($filterParam) {
            $fExp = explode(';', $filterParam);
            foreach ($fExp as $item) {
                $iExp = explode(':', $item);
                if (count($iExp) == 2) {
                    $filter[$iExp[0]] = $iExp[1];
                }
            }
            if (count($filter) > 0) {
                $rep->addJSCode('var lizLayerFilter = '.json_encode($filter).';');
            }
        }

        // Add styles if needed
        $stylesParam = $this->param('layerStyles');
        $styles = array();
        if ($stylesParam) {
            $fExp = explode(';', $stylesParam);
            foreach ($fExp as $item) {
                $iExp = explode(':', $item);
                if (count($iExp) == 2) {
                    $styles[$iExp[0]] = $iExp[1];
                }
            }
            if (count($styles) > 0) {
                $rep->addJSCode('var lizLayerStyles = '.json_encode($styles).';');
            }
        }

        // $assign['auth_url_return'] = jUrl::get('view~default:index');

        // switcher-layers-actions javascript
        $rep->addJSLink($bp.'assets/js/switcher-layers-actions.js');

        // Add Google Analytics ID
        $assign['googleAnalyticsID'] = '';
        if ($lser->googleAnalyticsID != '' && preg_match('/^UA-\\d+-\\d+$/', $lser->googleAnalyticsID) == 1) {
            $assign['googleAnalyticsID'] = $lser->googleAnalyticsID;
        }

        $rep->body->assign($assign);

        // Log
        $eventParams = array(
            'key' => 'viewmap',
            'content' => '',
            'repository' => $lrep->getKey(),
            'project' => $project,
        );
        jEvent::notify('LizLogItem', $eventParams);

        return $rep;
    }

    protected function getProjectDockables()
    {

        // Get repository key
        $repository = $this->repositoryKey;
        // Get the project key
        $project = $this->projectKey;
        // Get project object
        $lproj = $this->projectObj;

        $assign = array();
        // Get dockable and minidockable element
        $assign['dockable'] = $lproj->getDefaultDockable();
        $items = jEvent::notify('mapDockable', array('repository' => $repository, 'project' => $project))->getResponse();
        $assign['dockable'] = mapDockItemsMerge($assign['dockable'], $items);

        $assign['minidockable'] = $lproj->getDefaultMiniDockable();
        $items = jEvent::notify('mapMiniDockable', array('repository' => $repository, 'project' => $project))->getResponse();
        $assign['minidockable'] = mapDockItemsMerge($assign['minidockable'], $items);

        $assign['bottomdockable'] = $lproj->getDefaultBottomDockable();
        $items = jEvent::notify('mapBottomDockable', array('repository' => $repository, 'project' => $project))->getResponse();
        $assign['bottomdockable'] = mapDockItemsMerge($assign['bottomdockable'], $items);

        $assign['rightdockable'] = array();
        $items = jEvent::notify('mapRightDockable', array('repository' => $repository, 'project' => $project))->getResponse();
        $assign['rightdockable'] = mapDockItemsMerge($assign['rightdockable'], $items);

        return $assign;
    }
}
