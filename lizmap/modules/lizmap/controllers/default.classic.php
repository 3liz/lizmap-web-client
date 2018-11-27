<?php
/**
* Redirect to the default repository project list page.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class defaultCtrl extends jController {

  /**
  * Redirect to the default repository project list.
  * 
  * @return Redirection to the default repository list
  */
  function index() {
    $rep = $this->getResponse('redirect');
    
    // Get repository data
    $repository = $this->param('repository');
    // Get the corresponding repository
    $lrep = lizmap::getRepository($repository);
    
    // Set the redirection parameters
    if($lrep)
      $rep->params = array('repository'=>$lrep->getKey());

    $rep->action = 'view~default:index';
    return $rep;
  }
  

}
