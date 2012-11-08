<?php
/**
* @package   %%appname%%
* @subpackage 
* @author    %%default_creator_name%%
* @copyright %%default_copyright%%
* @link      %%default_website%%
* @license   %%default_license_url%% %%default_license%%
*/

require_once ('%%rp_app%%application.init.php');

checkAppOpened();

require_once (JELIX_LIB_CORE_PATH.'jSoapCoordinator.class.php');
require_once (JELIX_LIB_CORE_PATH.'request/jSoapRequest.class.php');

ini_set("soap.wsdl_cache_enabled", "0"); // disabling PHP's WSDL cache

jApp::loadConfig('%%config_file%%');
$jelix = new jSoapCoordinator();
jApp::setCoord($jelix);
$jelix->request = new jSoapRequest();
$jelix->request->initService();
$jelix->processSoap();
