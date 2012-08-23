<?php
/**
* Service to provide translation dictionnary.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class translateCtrl extends jController {

  /**
  * Get JSON containing all translation for a given jelix property file.
  * @param string $property Name of the property file. Ex: map if searched file is map.UTF-8.properties
  * @param string $lang Language. Ex: fr_FR (optionnal)
  * @return binary object The image for this project.
  */
  function getDictionary() {

    $rep = $this->getResponse('json');
    
    // Get the property file
    $property= $this->param('property');
    $lang = $this->param('lang');
    
    if(!$lang)
      $lang = jLocale::getCurrentLang().'_'.jLocale::getCurrentCountry();
    
    $data = array();
    $path = jApp::appPath().'modules/view/locales/'.$lang.'/'.$property.'.UTF-8.properties';
    if(file_exists($path)){
      $lines = file($path);
      foreach ($lines as $lineNumber => $lineContent){
        if(!empty($lineContent) and $lineContent != '\n'){
          $exp = explode('=', trim($lineContent));
          if(!empty($exp[0]))
            $data[$exp[0]] = $exp[1];
        }
      }
    }
    
    $rep->data = $data;
    return $rep;
  }

}
