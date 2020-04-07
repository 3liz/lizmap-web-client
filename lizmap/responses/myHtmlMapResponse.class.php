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

class myHtmlMapResponse extends jResponseHtml
{
    public $bodyTpl = 'view~map';

    public function __construct()
    {
        parent::__construct();

        $bp = jApp::config()->urlengine['basePath'];

        $this->title = '';

        // Header
        $this->addHttpHeader('x-ua-compatible', 'ie=edge');

        // CSS
        $css = jApp::config()->jquery['jqueryui.css'];
        foreach ($css as $file) {
            $this->addCSSLink($file);
        }
        $this->addCSSLink($bp.'assets/css/bootstrap.css');
        $this->addCSSLink($bp.'assets/css/bootstrap-responsive.css');
        $this->addCSSLink($bp.'assets/css/jquery.dataTables.css');
        $this->addCSSLink($bp.'assets/css/jquery.dataTables.bootstrap.css');
        $this->addCSSLink($bp.'assets/js/TreeTable/stylesheets/jquery.treeTable.css');
        $this->addCSSLink($bp.'assets/js/OpenLayers-2.13/theme/default/style.css');
        $this->addCSSLink($bp.'assets/css/main.css');
        $this->addCSSLink($bp.'assets/css/map.css');
        $this->addCSSLink($bp.'assets/css/media.css');

//    $this->addCSSLink($bp.'assets/css/bootstrap-responsive.css');

        // META
        $this->addMetaDescription('');
        $this->addMetaKeywords('');

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

        $this->addHeadContent('<meta name="Revisit-After" content="10 days" />');
        $this->addHeadContent('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />');

        // JS
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/OpenLayers.js');
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/lib/OpenLayers/Format/WKT.js');
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/lib/OpenLayers/Format/XML.js');
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/lib/OpenLayers/Format/SLD/v1_1_0.js');
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/lib/OpenLayers/Geometry/Polygon.js');
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/lib/OpenLayers/Control/Attribution.js'); // Comes from OpenLayers master
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/lib/OpenLayers/Control/Scale.js');
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/lib/OpenLayers/Control/ScaleLine.js');
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/lib/OpenLayers/Control/lizmapMousePosition.js');
        $this->addJSLink($bp.'assets/js/OpenLayers-2.13/lib/OpenLayers/Popup/lizmapAnchored.js');
        $this->addJSLink($bp.'assets/js/Proj4js/proj4js.min.js');
        $this->addJSLink(jApp::config()->jquery['jquery']);
        $js = jApp::config()->jquery['jqueryui.js'];
        foreach ($js as $file) {
            $this->addJSLink($file);
        }
        $this->addJSLink($bp.'assets/js/jquery.combobox.js');
        $this->addJSLink($bp.'assets/js/bootstrap.js');
        $this->addJSLink($bp.'assets/js/TreeTable/javascripts/jquery.treeTable.js');
        $this->addJSLink($bp.'assets/js/jquery.dataTables.min.js');
        $this->addJSLink($bp.'assets/js/jquery.dataTables.bootstrap.js');
        $this->addJSLink($bp.'assets/js/map.js');
        $this->addJSLink($bp.'assets/js/lizmap.js');

        $generalJSConfig = '
      Proj4js.libPath = "'.$bp.'assets/js/Proj4js/";
      ';
        $this->addJSCode($generalJSConfig);
    }

    protected function doAfterActions()
    {
        $this->body->assignIfNone('MAIN', '');
        $this->body->assignIfNone('repositoryLabel', 'Lizmap');
        $this->body->assignIfNone('isConnected', jAuth::isConnected());
        $this->body->assignIfNone('user', jAuth::getUserSession());
        $this->body->assignIfNone('auth_url_return', '');
        $this->body->assignIfNone('googleAnalyticsID', '');
    }
}
