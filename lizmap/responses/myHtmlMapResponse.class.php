<?php
/**
* HTML Jelix response for full screen map.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


require_once (JELIX_LIB_CORE_PATH.'response/jResponseHtml.class.php');

class myHtmlMapResponse extends jResponseHtml {

  public $bodyTpl = 'view~map';

  function __construct() {
    parent::__construct();

    $bp = jApp::config()->urlengine['basePath'];

    $this->title = '';

    // CSS
    $this->addCSSLink($bp.'css/jquery-ui-1.8.23.custom.css');
    $this->addCSSLink($bp.'css/bootstrap.css');
    $this->addCSSLink($bp.'css/bootstrap-responsive.css');
    $this->addCSSLink($bp.'css/jquery.dataTables.css');
    $this->addCSSLink($bp.'css/jquery.dataTables.bootstrap.css');
    $this->addCSSLink($bp.'TreeTable/stylesheets/jquery.treeTable.css');
    $this->addCSSLink($bp.'OpenLayers-2.13/theme/default/style.css');
    $this->addCSSLink($bp.'css/main.css');
    $this->addCSSLink($bp.'css/map.css');
    $this->addCSSLink($bp.'css/media.css');

#    $this->addCSSLink($bp.'css/bootstrap-responsive.css');

    // META
    $this->addMetaDescription('');
    $this->addMetaKeywords('');
    $this->addHeadContent('<meta name="Revisit-After" content="10 days" />');
    $this->addHeadContent('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />');

    // JS
    $this->addJSLink($bp.'OpenLayers-2.13/OpenLayers.js');
    $this->addJSLink($bp.'OpenLayers-2.13/lib/OpenLayers/Format/XML.js');
    $this->addJSLink($bp.'OpenLayers-2.13/lib/OpenLayers/Format/SLD/v1_1_0.js');
    $this->addJSLink($bp.'OpenLayers-2.13/lib/OpenLayers/Control/Attribution.js'); // Comes from OpenLayers master
    $this->addJSLink($bp.'OpenLayers-2.13/lib/OpenLayers/Control/Scale.js');
    $this->addJSLink($bp.'OpenLayers-2.13/lib/OpenLayers/Control/ScaleLine.js');
    $this->addJSLink($bp.'OpenLayers-2.13/lib/OpenLayers/Control/lizmapMousePosition.js');
    $this->addJSLink($bp.'OpenLayers-2.13/lib/OpenLayers/Popup/lizmapAnchored.js');
    $this->addJSLink($bp.'Proj4js/proj4js.min.js');
    $this->addJSLink($bp.'js/jquery-1.12.4.min.js');
    $this->addJSLink($bp.'js/jquery-ui-1.11.2.custom.min.js');
    $this->addJSLink($bp.'js/jquery.combobox.js');
    $this->addJSLink($bp.'js/bootstrap.js');
    $this->addJSLink($bp.'TreeTable/javascripts/jquery.treeTable.js');
    $this->addJSLink($bp.'js/jquery.dataTables.min.js');
    $this->addJSLink($bp.'js/jquery.dataTables.bootstrap.js');
    $this->addJSLink($bp.'js/map.js');


    $generalJSConfig = '
      Proj4js.libPath = "'.$bp.'Proj4js/";
      ';
    $this->addJSCode($generalJSConfig);

  }

  protected function doAfterActions() {
      $this->body->assignIfNone('MAIN','');
      $this->body->assignIfNone('repositoryLabel', 'Lizmap');
      $this->body->assignIfNone('isConnected', jAuth::isConnected());
      $this->body->assignIfNone('user', jAuth::getUserSession());
      $this->body->assignIfNone('auth_url_return','');
      $this->body->assignIfNone('googleAnalyticsID', '');
  }
}
