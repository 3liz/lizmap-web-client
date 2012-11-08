<?php
/**
* @package   %%appname%%
* @subpackage 
* @author    %%default_creator_name%%
* @copyright %%default_copyright%%
* @link      %%default_website%%
* @license   %%default_license_url%% %%default_license%%
*/

require ('%%rp_app%%application.init.php');
require (JELIX_LIB_CORE_PATH.'request/jXmlRpcRequest.class.php');

checkAppOpened();

jApp::loadConfig('%%config_file%%');

jApp::setCoord(new jCoordinator());
jApp::coord()->process(new jXmlRpcRequest());

