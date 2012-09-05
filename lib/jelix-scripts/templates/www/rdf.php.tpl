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
require (JELIX_LIB_CORE_PATH.'request/jRdfRequest.class.php');

checkAppOpened();

$config_file = '%%config_file%%';

$jelix = new jCoordinator($config_file);
$jelix->process(new jRdfRequest());


