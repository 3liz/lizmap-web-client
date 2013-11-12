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
    $auth_url_return = jUrl::get('view~map:index',
      array(
        "repository"=>$repository,
        "project"=>$project,
      ));

    // Get lizmapProject class
    $assign = array(
      'isConnected'=>jAuth::isConnected(),
      'user'=>jAuth::getUserSession(),
      'auth_url_return'=>$auth_url_return,
      "externalSearch"=>"",
      "edition"=>true,
      "measure"=>true,
      "locate"=>true,
      "geolocation"=>true,
      "timemanager"=>true,
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

    $assign['edition'] = $lproj->hasEditionLayers();

    if ( !property_exists($configOptions,'geolocation')
      || $configOptions->geolocation != 'True')
      $assign['geolocation'] = false;

    if ( !property_exists($configOptions,'geolocation')
      || $configOptions->geolocation != 'True')
      $assign['geolocation'] = false;

    $assign['timemanager'] = $lproj->hasTimemanagerLayers();

    $this->_tpl->assign($assign);
   }
}
