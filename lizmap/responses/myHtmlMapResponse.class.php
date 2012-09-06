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

    global $gJConfig;
    $bp = $gJConfig->urlengine['basePath'];    

    $this->title = '';
	
    // CSS  
    $this->addCSSLink($bp.'css/jquery-ui-1.8.23.custom.css');
    $this->addCSSLink($bp.'css/bootstrap.css');
    $this->addCSSLink($bp.'TreeTable/stylesheets/jquery.treeTable.css');
    $this->addCSSLink($bp.'OpenLayers-2.12/theme/default/style.css');
    $this->addCSSLink($bp.'css/main.css');
    $this->addCSSLink($bp.'css/map.css');
#    $this->addCSSLink($bp.'css/color1.css');
#    $this->addCSSLink($bp.'css/color2.css');
    // META
    $this->addMetaDescription('');
    $this->addMetaKeywords('');
    $this->addHeadContent('<meta name="Revisit-After" content="10 days" />');
    // JS
    $this->addJSLink($bp.'OpenLayers-2.12/OpenLayers.js');
    $this->addJSLink($bp.'OpenLayers-2.12/lib/OpenLayers/Control/Scale.js');
    $this->addJSLink($bp.'OpenLayers-2.12/lib/OpenLayers/Control/ScaleLine.js');
    $this->addJSLink($bp.'Proj4js/proj4js-compressed.js');
    $this->addJSLink($bp.'js/jquery-1.8.0.min.js');
    $this->addJSLink($bp.'js/bootstrap.js');
    $this->addJSLink($bp.'js/jquery-ui-1.8.23.custom.min.js');
    $this->addJSLink($bp.'TreeTable/javascripts/jquery.treeTable.js');
    $this->addJSLink($bp.'js/map.js');
    
    $generalJSConfig = '
      Proj4js.libPath = "'.$bp.'Proj4js/";
	  ';
    $this->addJSCode($generalJSConfig);
      
  }

  protected function doAfterActions() {
      // Include all process in common for all actions, like the settings of the
      // main template, the settings of the response       $tpl = new jTpl();

  }
}
