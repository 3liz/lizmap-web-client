<?php
/**
* Home page
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class defaultCtrl extends jController {

  /**
  * Redirect to the default project map
  * 
  * @return Redirection to the default project map
  */
  function index() {
  
    $rep = $this->getResponse('redirect');
    $rep->params = array('project'=>'montpellier');
    $rep->action = 'view~map:index';
    return $rep;
  }
  

}
