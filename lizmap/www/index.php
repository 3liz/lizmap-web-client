<?php
/**
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

require ('../application.init.php');
require (JELIX_LIB_CORE_PATH.'request/jClassicRequest.class.php');

checkAppOpened();

// Charge la configuration
jApp::loadConfig('index/config.ini.php');

// nouveau coordinateur, que l'on indique à jApp
jApp::setCoord(new jCoordinator());

// Nouvel objet request, que l'on passe au coordinateur, pour traiter le routage.
jApp::coord()->process(new jClassicRequest());
