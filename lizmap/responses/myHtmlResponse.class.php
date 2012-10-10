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

class myHtmlResponse extends jResponseHtml {

  public $bodyTpl = 'view~main';

  function __construct() {

    parent::__construct();

    global $gJConfig;
    $bp = $gJConfig->urlengine['basePath'];

    $this->title = 'LizMap list';

    // CSS
    $this->addCSSLink($bp.'css/jquery-ui-1.8.23.custom.css');
    $this->addCSSLink($bp.'css/bootstrap.css');
    $this->addCSSLink($bp.'css/main.css');
    $this->addCSSLink($bp.'css/view.css');
    $this->addCSSLink($bp.'css/bootstrap-responsive.css');

    // META
    $this->addMetaDescription('');
    $this->addMetaKeywords('');
    $this->addHeadContent('<meta name="Revisit-After" content="10 days" />');
    $this->addHeadContent('<meta name="Robots" content="all" />');
    $this->addHeadContent('<meta name="Rating" content="general" />');
    $this->addHeadContent('<meta name="Distribution" content="global" />');

    $this->addJSLink($bp.'js/jquery-1.8.0.min.js');
    $this->addJSLink($bp.'js/bootstrap.js');
    $this->addJSLink($bp.'js/jquery-ui-1.8.23.custom.min.js');

  }

  protected function doAfterActions() {
      // Include all process in common for all actions, like the settings of the
      // main template, the settings of the response etc..
    //$this->bodyTagAttributes = array('onload'=>'init()');
    $this->body->assignIfNone('MAIN','<p>no content</p>');

  }
}
