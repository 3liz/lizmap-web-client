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

class map_dockZone extends jZone {

   protected $_tplname='map_dock';

   protected function _prepareTpl(){
    // Get the project and repository params
    $project = $this->param('project');
    $repository = $this->param('repository');
    
    jClasses::inc('lizmapMapDockItem');
    $dockable = array();
    $switcherTpl = new jTpl();
    $dockable[] = new lizmapMapDockItem('switcher', 'Couches', $switcherTpl->fetch('map_switcher'), 1);
    $legendTpl = new jTpl();
    $dockable[] = new lizmapMapDockItem('legend', 'Légende', $switcherTpl->fetch('map_legend'), 2);
    
    $metadataTpl = new jTpl();
    $lrep = lizmap::getRepository($repository);
    $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
    // Get the WMS information
    $wmsInfo = $lproj->getWMSInformation();
    // WMS GetCapabilities Url
    $wmsGetCapabilitiesUrl = jAcl2::check(
      'lizmap.tools.displayGetCapabilitiesLinks',
      $lrep->getKey()
    );
    if ( $wmsGetCapabilitiesUrl ) {
      $wmsGetCapabilitiesUrl = $lproj->getData('wmsGetCapabilitiesUrl');
    }
    $metadataTpl->assign(array_merge(array(
      'repositoryLabel'=>$lrep->getData('label'),
      'repository'=>$lrep->getKey(),
      'project'=>$project,
      'wmsGetCapabilitiesUrl' => $wmsGetCapabilitiesUrl
    ), $wmsInfo));
    //$metadataTpl->fetch('map_metadata');
    $dockable[] = new lizmapMapDockItem('metadata', 'Information', $metadataTpl->fetch('map_metadata'), 3);

    $assign = array(
      "dockable"=>$dockable
      );
    $this->_tpl->assign($assign);
   }
}
