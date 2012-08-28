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
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);
    
    // Set the redirection parameters
    $rep->params = array('repository'=>$lizmapConfig->repositoryKey);
    $rep->action = 'view~default:index';
    return $rep;
  }
  

}
