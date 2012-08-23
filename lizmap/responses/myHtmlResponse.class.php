<?php
/**
* @package   lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    All right reserved
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
    $this->addCSSLink($bp.'css/jquery-ui-1.8.custom.css');
    $this->addCSSLink($bp.'css/bootstrap.css');
    $this->addCSSLink($bp.'css/bootstrap-responsive.css');
    $this->addCSSLink($bp.'css/main.css');


    // META
    $this->addMetaDescription('');
    $this->addMetaKeywords('');
    $this->addHeadContent('<meta name="Revisit-After" content="10 days" />');
    $this->addHeadContent('<meta name="Robots" content="all" />');
    $this->addHeadContent('<meta name="Rating" content="general" />');
    $this->addHeadContent('<meta name="Distribution" content="global" />');

    $this->addJSLink($bp.'js/jquery-1.6.2.min.js');
    $this->addJSLink($bp.'js/jquery-ui-1.8.16.custom.min.js');


  }

  protected function doAfterActions() {
      // Include all process in common for all actions, like the settings of the
      // main template, the settings of the response etc..
    //$this->bodyTagAttributes = array('onload'=>'init()');
    $this->body->assignIfNone('MAIN','<p>no content</p>');

  }
}
