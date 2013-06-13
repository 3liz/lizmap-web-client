<?php
/**
* HTML Jelix response for full screen map.
* @package   lizmap
* @subpackage andromede
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


require_once (JELIX_LIB_CORE_PATH.'response/jResponseHtml.class.php');

class simpleHtmlResponse extends jResponseHtml {

  public $bodyTpl = 'view~simplepage';

  function __construct() {

    parent::__construct();
    $this->title = 'Lizmap';

  }

  protected function doAfterActions() {
      // Include all process in common for all actions, like the settings of the
      // main template, the settings of the response etc..
    //$this->bodyTagAttributes = array('onload'=>'init()');
    $this->body->assignIfNone('MAIN','<p>Pas de contenu</p>');

  }
}
