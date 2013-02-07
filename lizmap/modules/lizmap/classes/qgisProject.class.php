<?php
/**
* QGIS Project tools
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


class qgisProject{

 /**
  * Read a QGIS project file and put it in session
  * @param string $string String passed
  * @return string
  */
  public function readQgisProject($lizmapConfig, $project, $xpath=Null){

    // Get QGIS project path
    $qgsPath = realpath($lizmapConfig->repositoryData['path'].$project.'.qgs');
    $pathKey = $lizmapConfig->repositoryKey.'|'.$project;
    $use_errors = libxml_use_internal_errors(true);
    $go = true; $errorlist = array();
    $xpathItems = Null;
     
    // Check if session exits and file has not been changed since last time
    if(
      isset($_SESSION['lizmap_qgis_xml']) 
      and isset($_SESSION['lizmap_qgis_xml'][$pathKey])
      and $_SESSION['lizmap_qgis_xml'][$pathKey]['filemtime'] >= filemtime($qgsPath)
      and $_SESSION['lizmap_qgis_xml'][$pathKey]['xml']
    ){
      $qgsLoad = simplexml_load_string($_SESSION['lizmap_qgis_xml'][$pathKey]['xml']);
      return array($go, $qgsLoad, $qgsLoad->xpath($xpath), $errorlist);
    }
    
    // Create a DOM instance
    $qgsLoad = simplexml_load_file($qgsPath);
    
    if(!$qgsLoad) {
      foreach(libxml_get_errors() as $error) {
        $errorlist[] = $error;
      }
      $go = false;
    }
    
    // Optionnaly get items based on xpath search
    if($go and $xpath){
      $xpathItems = $qgsLoad->xpath($xpath);
    }
    
    // Write xml into session
    $_SESSION['lizmap_qgis_xml'] = array("$pathKey"=>array());
    $_SESSION['lizmap_qgis_xml'][$pathKey]['xml'] = $qgsLoad->saveXml();
    $_SESSION['lizmap_qgis_xml'][$pathKey]['filemtime'] = filemtime($qgsPath);
    
    return array($go, $qgsLoad, $xpathItems, $errorlist);
  }  

}
