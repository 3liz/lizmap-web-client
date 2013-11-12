<?php
/**
* Construct the toolbar content.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */

class map_toolbarZone extends jZone {

   protected $_tplname='map_toolbar';

   protected function _prepareTpl(){
    // Get the project and repository params
    $project = $this->param('project');
    $repository = $this->param('repository');

    // Get lizmapProject class
    $assign = array(
      "edition"=>true,
      "measure"=>true,
      "print"=>true,
      "geolocation"=>true,
      "locate"=>true,
      "timemanager"=>true
    );

    $lproj = lizmap::getProject($repository.'~'.$project);
    $configOptions = $lproj->getOptions();
    if ( !property_exists($configOptions,'measure')
      || !$configOptions->measure == 'True')
      $assign['measure'] = false;

    if ( !property_exists($configOptions,'print')
      || $configOptions->print != 'True')
      $assign['print'] = false;

    if ( !property_exists($configOptions,'geolocation')
      || $configOptions->geolocation != 'True')
      $assign['geolocation'] = false;

    $assign['timemanager'] = $lproj->hasTimemanagerLayers();

    $assign['locate'] = $lproj->hasLocateByLayer();

    $assign['edition'] = $lproj->hasEditionLayers();

    $this->_tpl->assign($assign);
   }
}
