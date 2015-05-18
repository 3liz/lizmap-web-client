<?php
/**
* @package  jelix
* @subpackage
* @author   Laurent Jouanneau
* @contributor
* @copyright 2010-2011  Laurent Jouanneau
* @link      http://jelix.org
* @licence   http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

require ('../application.init.php');

// See Minify documentation/configuration to know this options
// values here are default values. You can configure only these options.
//$min_allowDebugFlag = true;
//$min_errorLogger = true;
//$min_cacheFileLocking = true;
//$min_serveOptions['bubbleCssImports'] = false;
$min_serveOptions['maxAge'] = 7200;
//$min_serveOptions['minApp']['allowDirs'] = array('//js', '//css');
$min_serveOptions['minApp']['maxFiles'] = 30;
//$min_symlinks = array();
//$min_uploaderHoursBehind = 0;

//$min_groupConfigPath=jApp::configPath(). 'minifyGroupsConfig.php';

require(LIB_PATH.'minify/jelix_minify.php');


