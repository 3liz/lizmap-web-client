<?php

use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Server\Server;
use LizmapAdmin\LandingContent;

/**
 * Displays a list of project for a given repository.
 *
 * @author    3liz
 * @copyright 2012-2024 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class defaultCtrl extends jController
{
    /**
     * Displays a list of project for a given repository.
     *
     * @return jResponseHtml|jResponseRedirect|jResponseRedirectUrl page with a list of projects
     */
    public function index()
    {
        $theme = $this->param('theme');
        if ($theme && preg_match('/^[a-zA-Z0-9\-_]+$/', $theme)) {
            jApp::config()->theme = $theme;
        }

        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        // Get lizmap services
        $services = lizmap::getServices();

        // only maps
        if ($services->onlyMaps) {
            $repository = lizmap::getRepository($services->defaultRepository);
            if ($repository && jAcl2::check('lizmap.repositories.view', $repository->getKey())) {
                try {
                    $project = lizmap::getProject($repository->getKey().'~'.$services->defaultProject);
                    if ($project && $project->checkAcl()) {
                        if (!$project->needsUpdateError()) {
                            // test redirection to an other controller
                            $items = jEvent::notify('mainviewGetMaps')->getResponse();
                            foreach ($items as $item) {
                                if ($item->parentId == $repository->getKey() && $item->id == $services->defaultProject) {
                                    /** @var jResponseRedirectUrl $rep */
                                    $rep = $this->getResponse('redirectUrl');
                                    $rep->url = $item->url;

                                    return $rep;
                                }
                            }

                            // redirection to default controller
                            /** @var jResponseRedirect $rep */
                            $rep = $this->getResponse('redirect');
                            $rep->action = 'view~map:index';

                            return $rep;
                        }
                        jMessage::add(jLocale::get('view~default.project.needs.update'), 'error');
                    }
                    jMessage::add('The \'only maps\' option is not well configured!', 'error');
                } catch (UnknownLizmapProjectException $e) {
                    jMessage::add('The \'only maps\' option is not well configured!', 'error');
                    jLog::logEx($e, 'error');
                }
            }
        }

        // Get repository data
        $repository = $this->param('repository');

        $repositoryList = array();
        if ($repository) {
            if (!jAcl2::check('lizmap.repositories.view', $repository)) {
                /** @var jResponseRedirect $rep */
                $rep = $this->getResponse('redirect');
                $rep->action = 'view~default:index';
                jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');

                return $rep;
            }
        }

        $title = $services->appName;
        $subTitle = jLocale::get('view~default.home.title');

        if ($repository) {
            $lrep = lizmap::getRepository($repository);
            $subTitle = $lrep->getLabel().' - '.jLocale::get('view~default.repository.list.title');
        }
        $rep->title = $subTitle.' - '.$title;

        $rep->body->assign('title', $title);
        $rep->body->assign('subTitle', $subTitle);

        $auth_url_return = jUrl::get('view~default:index');
        if ($repository) {
            $auth_url_return = jUrl::get('view~default:index', array('repository' => $repository));
        }
        $rep->body->assign('auth_url_return', $auth_url_return);

        $rep->body->assign('isConnected', jAuth::isConnected());
        $rep->body->assign('user', jAuth::getUserSession());
        $rep->body->assign('allowUserAccountRequests', $services->allowUserAccountRequests);

        // Add Google Analytics ID
        if ($services->googleAnalyticsID != '' && preg_match('/^UA-\d+-\d+$/', $services->googleAnalyticsID) == 1) {
            $rep->body->assign('googleAnalyticsID', $services->googleAnalyticsID);
        }

        // Is QGIS server OK ?
        // We don't care about the reason of the error
        $checkServerInformation = false;
        if (jAcl2::check('lizmap.admin.server.information.view')) {
            // Check server status
            $server = new Server();

            // Check QGIS server status
            $requiredQgisVersion = jApp::config()->minimumRequiredVersion['qgisServer'];
            $currentQgisVersion = $server->getQgisServerVersion();

            // Check Lizmap server status
            $requiredLizmapVersion = jApp::config()->minimumRequiredVersion['lizmapServerPlugin'];
            $currentLizmapVersion = $server->getLizmapPluginServerVersion();

            // Check if they are found and also their versions
            if ($server->versionCompare($currentQgisVersion, $requiredQgisVersion)
                || $server->pluginServerNeedsUpdate($currentLizmapVersion, $requiredLizmapVersion)) {
                $checkServerInformation = true;
            }
        }
        $rep->body->assign('checkServerInformation', $checkServerInformation);

        $landingContentService = new LandingContent();

        // Add custom HTML content at top of page
        $rep->body->assign('landing_page_content_bottom', $landingContentService->getBottomContentForView());
        $rep->body->assign('landing_page_content', $landingContentService->getTopContentForView());

        // Hide header if parameter h=0
        $h = $this->intParam('h', 1);
        $hide_header = false;
        if ($h == 0) {
            // Add some CSS to remove header and change other properties
            $hcss = '<style type="text/css">';
            $hcss .= ' body {padding-top: 10px;}';
            $hcss .= ' #search {top: 5px;}';
            $hcss .= ' #header {display: none;}';
            $hcss .= '</style>';
            $rep->addHeadContent($hcss);

            // Change URL for each project to add h=0
            $hide_header = true;
        }

        // Add main zone with project grid
        $rep->body->assignZone('MAIN', 'main_view', array(
            'repository' => $repository,
            'auth_url_return' => $auth_url_return,
            'hide_header' => $hide_header,
        ));

        // JS code
        // Click on thumbnails
        // and hack to normalize the height of the project thumbnails to avoid line breaks with long project titles
        $rep->addAssets('view');

        // Override default theme with color set in admin panel
        $CSSThemeFile = jApp::varPath('lizmap-theme-config/').'theme.css';
        if (file_exists($CSSThemeFile)) {
            $cssContent = file_get_contents($CSSThemeFile);
            if ($cssContent) {
                $css = '<style type="text/css">'.$cssContent.'</style>';
                $rep->addHeadContent($css);
            }
        }
        $rep->body->assign('showHomeLink', false);

        return $rep;
    }

    /**
     * Displays an error.
     *
     * @return jResponseHtml page with the error message
     */
    public function error()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');
        $tpl = new jTpl();
        $rep->body->assign('MAIN', '');

        return $rep;
    }
}
