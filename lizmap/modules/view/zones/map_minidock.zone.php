<?php
/**
* Construct the toolbar content.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2014 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */

class map_minidockZone extends jZone {

   protected $_tplname='map_minidock';

   protected function _prepareTpl(){
    // Get the project and repository params
    $project = $this->param('project');
    $repository = $this->param('repository');
    /*
    $auth_url_return = jUrl::get('view~map:index',
      array(
        "repository"=>$repository,
        "project"=>$project,
      ));

    // Get lizmapProject class
    $assign = array(
      "edition"=>false,
      "measure"=>false,
      "locate"=>false,
      "geolocation"=>false,
      "timemanager"=>false,
      "print"=>false,
      "attributeLayers"=>false
    );
    */

    $lproj = lizmap::getProject($repository.'~'.$project);
    $configOptions = $lproj->getOptions();

    /*
    if ( property_exists($configOptions,'measure')
      && $configOptions->measure == 'True')
      $assign['measure'] = true;

    $assign['locate'] = $lproj->hasLocateByLayer();

    $assign['edition'] = $lproj->hasEditionLayers();

    if ( property_exists($configOptions,'geolocation')
      && $configOptions->geolocation == 'True')
      $assign['geolocation'] = true;

    $assign['timemanager'] = $lproj->hasTimemanagerLayers();

    $assign['attributeLayers'] = $lproj->hasAttributeLayers();
    */
    
    jClasses::inc('lizmapMapDockItem');
    $dockable = array();
    
    if ( property_exists($configOptions,'geolocation')
      && $configOptions->geolocation == 'True') {
      $geolocationTpl = new jTpl();
      $dockable[] = new lizmapMapDockItem('geolocation', 'Geolocalisation', $geolocationTpl->fetch('map_geolocation'));
    }
    
    if ( property_exists($configOptions,'print')
      || $configOptions->print == 'True') {
      $printTpl = new jTpl();
      $dockable[] = new lizmapMapDockItem('print', 'Impression', $printTpl->fetch('map_print'));
    }
    
    if ( $lproj->hasLocateByLayer() ) {
      $printTpl = new jTpl();
      $dockable[] = new lizmapMapDockItem('locate', 'localisation', $printTpl->fetch('map_locate'));
    }
      
    /*
    $switcherTpl = new jTpl();
    $dockable[] = new lizmapMapDockItem('switcher', 'Couches', $switcherTpl->fetch('map_switcher'), 1);
    */

    $assign = array(
      "dockable"=>$dockable
      );
    $this->_tpl->assign($assign);
   }
}
