<?php
/**
* @package   %%appname%%
* @subpackage 
* @author    %%default_creator_name%%
* @copyright %%default_copyright%%
* @link      %%default_website%%
* @license   %%default_license_url%% %%default_license%%
*/

require_once (dirname(__FILE__).'/%%rp_app%%application.init.php');

checkAppOpened();

require_once (JELIX_LIB_CORE_PATH.'jCmdlineCoordinator.class.php');

require_once (JELIX_LIB_CORE_PATH.'request/jCmdLineRequest.class.php');

jApp::setCoord(new jCmdlineCoordinator('%%config_file%%'));
jApp::coord()->process(new jCmdLineRequest());

