<?php
/**
* @package   lizmap
* @subpackage
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

$appPath = __DIR__.'/';
require ($appPath.'vendor/autoload.php');

if (file_exists($appPath.'my-packages/vendor/autoload.php')) {
    require ($appPath.'my-packages/vendor/autoload.php');
}
jApp::initPaths(
    $appPath
    //$appPath.'www/',
    //$appPath.'var/',
    //$appPath.'var/log/',
    //$appPath.'var/config/',
    //$appPath.'scripts/'
);
jApp::setTempBasePath(realpath($appPath.'../temp/lizmap/').'/');

require (__DIR__.'/vendor/jelix_app_path.php');
if (file_exists($appPath.'my-packages/vendor/jelix_app_path.php')) {
    require ($appPath.'my-packages/vendor/jelix_app_path.php');
}

jApp::declareModulesDir(array(
                            __DIR__.'/modules/',
                            __DIR__.'/lizmap-modules/'
                        ));
jApp::declarePluginsDir(array(
                            __DIR__.'/plugins'
                        ));
