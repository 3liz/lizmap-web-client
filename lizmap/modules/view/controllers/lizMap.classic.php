<?php

use Lizmap\Project\Project;
use Lizmap\Project\ProjectFilesFinder;
use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\RemoteStorageRequest;
use Lizmap\Server\Server;

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
     * @var Project
     */
    protected $projectObj;

    // forceHiddenProjectVisible: Used to override plugin configuration hideProject
    // (helpful for modules which maps are based on a hidden project)
    protected $forceHiddenProjectVisible = false;

    /**
     * Load the map page for the given project.
     *
     * @return jResponseHtml|jResponseRedirect with map and content for the chose Qgis project
     */
    public function index()
    {
        $theme = $this->param('theme');
        if ($theme && preg_match('/^[a-zA-Z0-9\-_]+$/', $theme)) {
            jApp::config()->theme = $theme;
        }

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
        $server = new Server();

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
            } catch (UnknownLizmapProjectException $e) {
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
        } catch (UnknownLizmapProjectException $e) {
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
        /** @var AbstractLizmapHtmlResponse $rep */
        $rep = $this->getResponse('htmlmap');
        $rep->addJSLink(jUrl::get('view~translate:index').'?lang='.jApp::config()->locale, array('defer' => ''));

        $this->repositoryKey = $lrep->getKey();
        $this->projectKey = $lproj->getKey();
        $this->projectObj = $lproj;

        // Add js link if google is needed
        if ($lproj->needsGoogle()) {
            $googleKey = $lproj->getGoogleKey();
            if ($googleKey != '') {
                $rep->addJSLink('https://maps.google.com/maps/api/js?v=3&key='.$googleKey, array('defer' => ''));
            } else {
                $rep->addJSLink('https://maps.google.com/maps/api/js?v=3', array('defer' => ''));
            }
        }

        $bp = jApp::urlBasePath();

        // Add the jForms js
        if ($lproj->hasEditionLayersForCurrentUser()) {
            $www = jApp::urlJelixWWWPath();
            $rep->addAssets('jforms_html');
            $rep->addJSLink($www.'jquery/include/jquery.include.js', array('defer' => ''));
            $rep->addAssets('jforms_imageupload');
            $rep->addAssets('jforms_datepicker_default');
            $rep->addAssets('jforms_datetimepicker_default');
            $rep->addAssets('jforms_htmleditor_ckdefault');

            // Add other js
            $rep->addJSLink($bp.'assets/js/fileUpload/jquery.fileupload.js', array('defer' => ''));
            $rep->addJSLink($bp.'assets/js/bootstrapErrorDecoratorHtml.js', array('defer' => ''));
        }

        // Add bottom dock js
        $rep->addJSLink($bp.'assets/js/bottom-dock.js', array('defer' => ''));

        // TODO : refacto, quite the same URLs are declared in lizAjax.classic.php
        // Pass some configuration options to the web page through javascript var
        $lizUrls = array(
            'params' => array('repository' => $repository, 'project' => $project),
            'config' => jUrl::get('lizmap~service:getProjectConfig'),
            'remoteStorageConfig' => jUrl::get('lizmap~service:getRemoteStorageConfig'),
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
            'resourceUrlReplacement' => array(),
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

        if (jAcl2::check('lizmap.admin.access') || jAcl2::check('lizmap.admin.server.information.view')) {
            $lizUrls['repositoryAdmin'] = jUrl::getFull('admin~maps:index');
        }
        $webDavProfile = RemoteStorageRequest::getProfile('webdav');
        if ($webDavProfile) {
            $lizUrls['webDavUrl'] = $webDavProfile['baseUri'];
            $lizUrls['resourceUrlReplacement']['webdav'] = 'dav/';
        }

        $rep->addJsVariable('lizUrls', $lizUrls);
        $rep->addJsVariable('lizProj4', $lproj->getAllProj4());

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

        // Add moment.js for timemanager
        if ($lproj->hasTimemanagerLayers()) {
            $rep->addJSLink($bp.'assets/js/moment.js', array('defer' => ''));
            $rep->addJSLink($bp.'assets/js/filter.js', array('defer' => ''));
            $filterConfigData = array(
                'url' => jUrl::get(
                    'filter~service:index',
                    array(
                        'repository' => $this->repositoryKey,
                        'project' => $this->projectKey,
                    )
                ),
            );
            $rep->addJsVariable('filterConfigData', $filterConfigData);
        }

        // Add atlas.js for atlas feature and additional CSS for right-dock max-width
        if ($lproj->hasAtlasEnabled()) {
            // Add JS
            $rep->addJSLink($bp.'assets/js/atlas.js', array('defer' => ''));

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
                if (is_array($d->jsParams)) {
                    $d->jsParams['defer'] = '';
                }
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

        // Get additional JS and CSS from modules
        $additions = jEvent::notify('getMapAdditions', array('repository' => $repository, 'project' => $project))->getResponse();
        foreach ($additions as $addition) {
            if (is_array($addition)) {
                if (array_key_exists('js', $addition)) {
                    foreach ($addition['js'] as $js) {
                        $rep->addJSLink($js, array('defer' => ''));
                    }
                }
                if (array_key_exists('jsvars', $addition) && is_array($addition['jsvars'])) {
                    $rep->addJsVariables($addition['jsvars']);
                } elseif (array_key_exists('jscode', $addition)) {
                    foreach ($addition['jscode'] as $jscode) {
                        $rep->addJSCode($jscode);
                    }
                }

                if (array_key_exists('css', $addition)) {
                    foreach ($addition['css'] as $css) {
                        $rep->addCssLink($css);
                    }
                }

                if (array_key_exists('bodyattr', $addition)) {
                    foreach ($addition['bodyattr'] as $bodyattr) {
                        $rep->setBodyAttributes($bodyattr);
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

        if ($this->boolParam('skip_warnings_display') == true) {
            $rep->setBodyAttributes(array('data-skip-warnings-display' => true));
        }

        $countUserJs = 0;
        // Override default theme by themes found in folder media/themes/...
        // Theme name can be 'default' and apply to all projects in a repository
        // or the project name and only apply to it
        // Also if media/themes/default/css is found one directory above repositories one
        // it will apply to all repositories
        if ($lrep->allowUserDefinedThemes() && $this->boolParam('no_user_defined_js') != true) {
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

            $fileFinder = new ProjectFilesFinder();
            $allURLS = $fileFinder->listFileURLS($lproj);

            $cssUrls = $allURLS['css'];
            $jsUrls = $allURLS['js'];
            $mjsUrls = $allURLS['mjs'];
            $countUserJs = count($jsUrls) + count($mjsUrls);
            // Add CSS, MJS and JS files ordered by name
            sort($cssUrls);
            foreach ($cssUrls as $cssUrl) {
                $rep->addCSSLink($cssUrl);
            }
            sort($jsUrls);
            foreach ($jsUrls as $jsUrl) {
                // Use addHeadContent and not addJSLink to be sure it will be loaded after minified code
                $rep->addContent('<script type="text/javascript" defer src="'.$jsUrl.'" ></script>');
            }
            sort($mjsUrls);
            foreach ($mjsUrls as $mjsUrl) {
                // Use addHeadContent and not addJSLink to be sure it will be loaded after minified code
                $rep->addContent('<script type="module" defer src="'.$mjsUrl.'" ></script>');
            }
        }
        $rep->setBodyAttributes(array('data-lizmap-user-defined-js-count' => $countUserJs));

        // optionally hide some tools
        // header
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
            $rep->setBodyAttributes(array('data-lizmap-hide-legend' => true));
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
                $rep->addJsVariable('lizLayerFilter', $filter);
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
                $rep->addJsVariable('lizLayerStyles', $styles);
            }
        }

        // switcher-layers-actions javascript
        $rep->addJSLink($bp.'assets/js/switcher-layers-actions.js', array('defer' => ''));

        // Add Google Analytics ID
        $assign['googleAnalyticsID'] = '';
        if ($lser->googleAnalyticsID != '' && preg_match('/^UA-\d+-\d+$/', $lser->googleAnalyticsID) == 1) {
            $assign['googleAnalyticsID'] = $lser->googleAnalyticsID;
        }

        if (jAcl2::check('lizmap.admin.access') || jAcl2::check('lizmap.admin.server.information.view')) {
            if ($lproj->qgisLizmapPluginUpdateNeeded()) {
                $rep->setBodyAttributes(array('data-lizmap-plugin-update-warning-url' => jUrl::get('admin~qgis_projects:index')));
            } elseif ($lproj->projectCountCfgWarnings() >= 1) {
                $rep->setBodyAttributes(array('data-lizmap-plugin-has-warnings-url' => jUrl::get('admin~qgis_projects:index')));
            }
            // add body attribute to tell if current user is admin
            $rep->setBodyAttributes(array('data-lizmap-admin-user' => true));
        }

        $rep->body->assign($assign);

        $request_headers = jApp::coord()->request->headers();
        $_SESSION['html_map_token'] = md5(json_encode(array(
            'Host' => $request_headers['Host'],
            'User-Agent' => $request_headers['User-Agent'],
        )));

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

        $assign['rightdockable'] = $lproj->getDefaultRightDockable();
        $items = jEvent::notify('mapRightDockable', array('repository' => $repository, 'project' => $project))->getResponse();
        $assign['rightdockable'] = mapDockItemsMerge($assign['rightdockable'], $items);

        return $assign;
    }
}
