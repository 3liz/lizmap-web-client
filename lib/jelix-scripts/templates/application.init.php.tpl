<?php
/**
* @package   %%appname%%
* @subpackage
* @author    %%default_creator_name%%
* @copyright %%default_copyright%%
* @link      %%default_website%%
* @license   %%default_license_url%% %%default_license%%
*/

$appPath = dirname (__FILE__).'/';
require (%%php_rp_jelix%%.'init.php');

jApp::initPaths(
    $appPath,
    %%php_rp_www%%,
    %%php_rp_var%%,
    %%php_rp_log%%,
    %%php_rp_conf%%,
    %%php_rp_cmd%%
);
jApp::setTempBasePath(%%php_rp_temp%%);
