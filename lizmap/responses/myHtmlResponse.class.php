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

    $bp = jApp::config()->urlengine['basePath'];

    $this->title = 'LizMap list';

    // CSS
    $this->addCSSLink($bp.'css/jquery-ui-1.8.23.custom.css');
    $this->addCSSLink($bp.'css/bootstrap.css');
    $this->addCSSLink($bp.'css/bootstrap-responsive.css');
    $this->addCSSLink($bp.'css/main.css');
    $this->addCSSLink($bp.'css/view.css');
    $this->addCSSLink($bp.'css/media.css');

    // META
    $this->addMetaDescription('');
    $this->addMetaKeywords('');
    $this->addHeadContent('<meta name="Revisit-After" content="10 days" />');
    $this->addHeadContent('<meta name="Robots" content="all" />');
    $this->addHeadContent('<meta name="Rating" content="general" />');
    $this->addHeadContent('<meta name="Distribution" content="global" />');
    $this->addHeadContent('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />');

    $this->addJSLink($bp.'js/jquery-1.12.4.min.js');
    $this->addJSLink($bp.'js/jquery-ui-1.11.2.custom.min.js');
    $this->addJSLink($bp.'js/bootstrap.js');

  }

  protected function doAfterActions() {
    $this->body->assignIfNone('MAIN','<p>no content</p>');
    $this->body->assignIfNone('repositoryLabel', 'Lizmap');
    $this->body->assignIfNone('isConnected', jAuth::isConnected());
    $this->body->assignIfNone('user', jAuth::getUserSession());
    $this->body->assignIfNone('auth_url_return','');
    $this->body->assignIfNone('googleAnalyticsID', '');
  }
}
