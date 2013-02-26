<?php
/**
* Displays a full featured map based on one Qgis project.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class mapCtrl extends jController {

  /**
  * Load the map page for the given project.
  * @param string $repository Name of the repository.
  * @param string $project Name of the project.
  * @return Page with map and content for the chose Qgis project.
  */
  function index() {

    if ($this->param('theme')) {
      jApp::config()->theme = $this->param('theme');
    }
    $rep = $this->getResponse('htmlmap');
    $rep->addJSLink(jUrl::get('view~translate:index'));
    $ok = true;

    // Get the project
    $project = filter_var($this->param('project'), FILTER_SANITIZE_STRING);

    // Get repository data
    $repository = $this->param('repository');
    jClasses::inc('lizmap~lizmapConfig');
    $lizmapConfig = new lizmapConfig($repository);

    if(!jacl2::check('lizmap.repositories.view', $lizmapConfig->repositoryKey)){
      $rep = $this->getResponse('redirect');
      $rep->action = 'view~default:index';
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'error');
      return $rep;
    }

    // We must redirect to default repository project list if no project given
    if(!$project){
      jMessage::add('The parameter project is mandatory !', 'error');
      $ok = false;
    }

    // Get the corresponding Qgis project configuration
    $qgsPath = $lizmapConfig->repositoryData['path'].$project.'.qgs';
    $configPath = $qgsPath.'.cfg';

    // We must redirect to default repository project list if no project found.
    if(!file_exists($qgsPath)){
      jMessage::add('The project '.strtoupper($project).' does not exist !', 'error');
      $ok = false;
    }

    // We must redirect to default repository project list if no project configuration found
    if(!file_exists($configPath)){
      jMessage::add('The configuration file does not exist for the project : '.strtoupper($project).' !', 'error');
      $ok = false;
    }

    // Redirect if error encountered
    if(!$ok){
      $rep = $this->getResponse('redirect');
      $rep->params = array('repository'=>$lizmapConfig->repositoryKey);
      $rep->action = 'view~default:index';
      return $rep;
    }

    // Read json configuration file for the project.
    $configRead = jFile::read($configPath);
    $configOptions = json_decode($configRead)->options;
    if (property_exists($configOptions,'googleKey') && $configOptions->googleKey != '')
      $rep->addJSLink('https://maps.google.com/maps/api/js?v=3.5&sensor=false&'.$configOptions->googleKey != '');
    elseif (
      (property_exists($configOptions,'googleStreets') && $configOptions->googleStreets == 'True') ||
      (property_exists($configOptions,'googleSatellite') && $configOptions->googleSatellite == 'True') ||
      (property_exists($configOptions,'googleHybrid') && $configOptions->googleHybrid == 'True') ||
      (property_exists($configOptions,'googleTerrain') && $configOptions->googleTerrain == 'True')
    )
      $rep->addJSLink('https://maps.google.com/maps/api/js?v=3.5&sensor=false');

    // Add the jForms js
    $bp = jApp::config()->urlengine['basePath'];
    $rep->addJSLink($bp.'jelix/js/jforms_light.js');
    $rep->addJSLink($bp.'js/bootstrapErrorDecoratorHtml.js');

    // Pass some configuration options to the web page through javascript var
    $rep->addJSCode("var dictionaryUrl = '".jUrl::get('view~translate:getDictionary', array('property'=>'map'))."';");
    $rep->addJSCode("var cfgUrl = '".jUrl::get('lizmap~service:getProjectConfig', array('repository'=>$repository, 'project'=>$project))."';");
    $rep->addJSCode("var wmsServerURL = '".jUrl::get('lizmap~service:index', array('repository'=>$repository, 'project'=>$project))."';");
    $rep->addJSCode("var mediaServerURL = '".jUrl::get('view~media:getMedia', array('repository'=>$repository, 'project'=>$project))."';");
    $rep->addJSCode("var createAnnotationURL = '".jUrl::get('lizmap~annotation:createAnnotation', array('repository'=>$repository, 'project'=>$project))."';");

    // Read the QGIS project file to get the layer drawing order
    $qgisProjectClass = jClasses::getService('lizmap~qgisProject');
    list($go, $qgsLoad, $xpathItems, $errorlist) = $qgisProjectClass->readQgisProject($lizmapConfig, $project);

    // Default metadata
    $WMSServiceTitle = '';
    $WMSServiceAbstract = '';
    $WMSExtent = '';
    $ProjectCrs = '';
    $WMSOnlineResource = '';
    $WMSContactMail = '';
    $WMSContactOrganization = '';
    $WMSContactPerson = '';
    $WMSContactPhone = '';
    if($go){
      $WMSServiceTitle = (string)$qgsLoad->properties->WMSServiceTitle;
      $WMSServiceAbstract = (string)$qgsLoad->properties->WMSServiceAbstract;
      $WMSServiceAbstract = nl2br($WMSServiceAbstract);
      $WMSExtent = $qgsLoad->properties->WMSExtent->value[0];
      $WMSExtent.= ", ".$qgsLoad->properties->WMSExtent->value[1];
      $WMSExtent.= ", ".$qgsLoad->properties->WMSExtent->value[2];
      $WMSExtent.= ", ".$qgsLoad->properties->WMSExtent->value[3];
      $ProjectCrs = (string)$qgsLoad->properties->SpatialRefSys->ProjectCrs;
      $WMSOnlineResource = (string)$qgsLoad->properties->WMSOnlineResource;
      $WMSContactMail = (string)$qgsLoad->properties->WMSContactMail;
      $WMSContactOrganization = (string)$qgsLoad->properties->WMSContactOrganization;
      $WMSContactPerson= (string)$qgsLoad->properties->WMSContactPerson;
      $WMSContactPhone = (string)$qgsLoad->properties->WMSContactPhone;
    }
    
    // Set page title from projet title
    if($WMSServiceTitle)
      $rep->title = $WMSServiceTitle;
    else
      $rep->title = "$repository - $project";

    // Assign some properties to the body template
    $assign = array(
      'repositoryLabel'=>$lizmapConfig->repositoryData['label'],
      'repository'=>$lizmapConfig->repositoryKey,
      'project'=>$project,
      'isConnected'=>jAuth::isConnected(),
      'user'=>jAuth::getUserSession(),
      'WMSServiceTitle'=>$WMSServiceTitle,
      'WMSServiceAbstract'=>$WMSServiceAbstract,
      'WMSExtent'=>$WMSExtent,
      'ProjectCrs'=>$ProjectCrs,
      'WMSOnlineResource'=>$WMSOnlineResource,
      'WMSContactMail'=>$WMSContactMail,
      'WMSContactOrganization'=>$WMSContactOrganization,
      'WMSContactPerson'=>$WMSContactPerson,
      'WMSContactPhone'=>$WMSContactPhone
    );
    $rep->body->assign($assign);

    return $rep;
  }


}
