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

class adminHtmlResponse extends jResponseHtml
{
    public $bodyTpl = 'master_admin~main';

    public function __construct()
    {
        parent::__construct();

        // Header
        $this->addHttpHeader('x-ua-compatible', 'ie=edge');

        $this->addJSLink(jApp::config()->jquery['jquery']);
        $js = jApp::config()->jquery['jqueryui.js'];
        foreach ($js as $file) {
            $this->addJSLink($file);
        }
        $css = jApp::config()->jquery['jqueryui.css'];
        foreach ($css as $file) {
            $this->addCSSLink($file);
        }

        $bp = jApp::config()->urlengine['basePath'];
        $this->addJSLink($bp.'assets/js/bootstrap.js');

        // Favicon
        $this->addHeadContent('<link rel="shortcut icon" href="/assets/favicon/favicon.ico">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="57x57" href="/assets/favicon/apple-icon-57x57.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="60x60" href="/assets/favicon/apple-icon-60x60.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="72x72" href="/assets/favicon/apple-icon-72x72.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="76x76" href="/assets/favicon/apple-icon-76x76.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="114x114" href="/assets/favicon/apple-icon-114x114.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="120x120" href="/assets/favicon/apple-icon-120x120.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="144x144" href="/assets/favicon/apple-icon-144x144.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="152x152" href="/assets/favicon/apple-icon-152x152.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-icon-180x180.png">');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="192x192"  href="/assets/favicon/android-icon-192x192.png"> ');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png">');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon/favicon-96x96.png"> ');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png">');
        $this->addHeadContent('<link rel="manifest" href="/assets/favicon/manifest.json"> ');
        $this->addHeadContent('<meta name="msapplication-TileColor" content="#ffffff">');
        $this->addHeadContent('<meta name="msapplication-TileImage" content="/assets/favicon/ms-icon-144x144.png"> ');
        $this->addHeadContent('<meta name="theme-color" content="#ffffff">');

        $this->addHeadContent('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />');

        // Override default theme with color set in admin panel
        if ($cssContent = jFile::read(jApp::varPath('lizmap-theme-config/').'theme.css')) {
            $css = '<style type="text/css">'.$cssContent.'</style>
           ';
            $this->addHeadContent($css);
        }
    }

    protected function doAfterActions()
    {

        // Include all process in common for all actions, like the settings of the
        // main template, the settings of the response etc..
        $this->title .= ($this->title != '' ? ' - ' : '').' Administration';
        $this->body->assignIfNone('selectedMenuItem', '');
        $this->body->assignZone('MENU', 'master_admin~admin_menu', array('selectedMenuItem' => $this->body->get('selectedMenuItem')));
        $this->body->assignZone('INFOBOX', 'master_admin~admin_infobox');
        $this->body->assignIfNone('MAIN', '');
        $this->body->assignIfNone('adminTitle', '');
        $this->body->assign('user', jAuth::getUserSession());
    }
}
