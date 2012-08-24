<?php
/**
* @package   lizmap
* @subpackage admin
* @author    3liz
* @copyright 2012 3liz
* @link      http://www.3liz.com
* @license    Mozilla Public Licence - MPL
*/

class defaultCtrl extends jController {

  public $pluginParams = array(
  '*' => array( 'jacl2.right'=>'lizadmin.access')
  );

  /**
  * Administration home page.
  * All component must notify themselves to appear in the lateral menu.
  */
  function index() {
    $rep = $this->getResponse('htmladmin');

    return $rep;
  }
    
}

