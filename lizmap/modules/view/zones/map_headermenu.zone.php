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

class map_headermenuZone extends jZone {

   protected $_tplname='map_headermenu';

   protected function _prepareTpl(){
    // Get the project and repository params
    $project = $this->param('project');
    $repository = $this->param('repository');

    // Get lizmapProject class
    $assign = array(
      'isConnected'=>jAuth::isConnected(),
      'user'=>jAuth::getUserSession(),
      "externalSearch"=>"",
      "annotation"=>true,
      "measure"=>true,
      "locate"=>true,
      "geolocate"=>true,
      "print"=>true,
    );

    $lproj = lizmap::getProject($repository.'~'.$project);
    $configOptions = $lproj->getOptions();

    if ( property_exists($configOptions,'externalSearch') )
      $assign['externalSearch'] = $configOptions->externalSearch;

    if ( !property_exists($configOptions,'measure')
      || $configOptions->measure != 'True')
      $assign['measure'] = false;

    $assign['locate'] = $lproj->hasLocateByLayer();

    $assign['annotation'] = $lproj->hasAnnotationLayers();

    if ( !property_exists($configOptions,'geolocate')
      || $configOptions->geolocate != 'True')
      $assign['geolocate'] = false;

    if ( !property_exists($configOptions,'print')
      || $configOptions->print != 'True')
      $assign['print'] = false;

    $this->_tpl->assign($assign);
   }
}
