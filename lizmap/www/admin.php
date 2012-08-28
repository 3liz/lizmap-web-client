<?php
/**
* @package   castries
* @subpackage 
* @author    yourname
* @copyright 2010 yourname
* @link      http://www.yourwebsite.undefined
* @license    All right reserved
*/

require ('../application.init.php');
require (JELIX_LIB_CORE_PATH.'request/jClassicRequest.class.php');

checkAppOpened();

$config_file = 'admin/config.ini.php';

$jelix = new jCoordinator($config_file);
$jelix->process(new jClassicRequest());


