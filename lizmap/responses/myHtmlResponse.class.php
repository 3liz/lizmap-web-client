<?php
/**
 * HTML Jelix response for full screen map.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once JELIX_LIB_CORE_PATH.'response/jResponseHtml.class.php';

class myHtmlResponse extends jResponseHtml
{
    public $bodyTpl = 'view~main';

    public function __construct()
    {
        parent::__construct();

        $bp = jApp::urlBasePath();

        $this->title = 'LizMap list';

        // Header
        $this->addHttpHeader('x-ua-compatible', 'ie=edge');

        // CSS
        $css = jApp::config()->jquery['jqueryui.css'];
        foreach ($css as $file) {
            $this->addCSSLink($file);
        }
        $this->addCSSLink($bp.'assets/css/bootstrap.css');
        $this->addCSSLink($bp.'assets/css/bootstrap-responsive.css');
        $this->addCSSLink($bp.'assets/css/main.css');
        $this->addCSSLink($bp.'assets/css/view.css');
        $this->addCSSLink($bp.'assets/css/media.css');

        // META
        $this->addMetaDescription('');
        $this->addMetaKeywords('');

        // Favicon
        $this->addHeadContent('<link rel="shortcut icon" href="'.$bp.'assets/favicon/favicon.ico">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="57x57" href="'.$bp.'assets/favicon/apple-icon-57x57.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="60x60" href="'.$bp.'assets/favicon/apple-icon-60x60.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="72x72" href="'.$bp.'assets/favicon/apple-icon-72x72.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="76x76" href="'.$bp.'assets/favicon/apple-icon-76x76.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="114x114" href="'.$bp.'assets/favicon/apple-icon-114x114.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="120x120" href="'.$bp.'assets/favicon/apple-icon-120x120.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="144x144" href="'.$bp.'assets/favicon/apple-icon-144x144.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="152x152" href="'.$bp.'assets/favicon/apple-icon-152x152.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="180x180" href="'.$bp.'assets/favicon/apple-icon-180x180.png">');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="192x192"  href="'.$bp.'assets/favicon/android-icon-192x192.png"> ');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="32x32" href="'.$bp.'assets/favicon/favicon-32x32.png">');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="96x96" href="'.$bp.'assets/favicon/favicon-96x96.png"> ');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="16x16" href="'.$bp.'assets/favicon/favicon-16x16.png">');
        $this->addHeadContent('<link rel="manifest" href="'.$bp.'assets/favicon/manifest.json"> ');
        $this->addHeadContent('<meta name="msapplication-TileColor" content="#ffffff">');
        $this->addHeadContent('<meta name="msapplication-TileImage" content="'.$bp.'assets/favicon/ms-icon-144x144.png"> ');
        $this->addHeadContent('<meta name="theme-color" content="#ffffff">');

        $this->addHeadContent('<meta name="Revisit-After" content="10 days" />');
        $this->addHeadContent('<meta name="Robots" content="all" />');
        $this->addHeadContent('<meta name="Rating" content="general" />');
        $this->addHeadContent('<meta name="Distribution" content="global" />');
        $this->addHeadContent('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />');

        $this->addJSLink(jApp::config()->jquery['jquery']);
        $this->addJSLink($bp . 'assets/js/jquery/jquery-migrate-3.3.0.min.js');
        $js = jApp::config()->jquery['jqueryui.js'];
        foreach ($js as $file) {
            $this->addJSLink($file);
        }
        $this->addJSLink($bp.'assets/js/bootstrap.js');
    }

    protected function doAfterActions()
    {
        $this->body->assignIfNone('MAIN', '<p>no content</p>');
        $this->body->assignIfNone('repositoryLabel', 'Lizmap');
        $this->body->assignIfNone('isConnected', jAuth::isConnected());
        $this->body->assignIfNone('user', jAuth::getUserSession());
        $this->body->assignIfNone('auth_url_return', '');
        $this->body->assignIfNone('googleAnalyticsID', '');
    }
}
