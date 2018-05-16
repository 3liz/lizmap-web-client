<?php
/**
* Initialize all defines and includes necessary files
*
* @package  jelix
* @subpackage core
* @author   Laurent Jouanneau
* @contributor Loic Mathaud, Julien Issler
* @copyright 2005-2012 Laurent Jouanneau
* @copyright 2007 Julien Issler
* @link     http://www.jelix.org
* @licence  GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Version number of Jelix
 * @name  JELIX_VERSION
 */
define ('JELIX_VERSION', '1.6.17');

/**
 * base of namespace path used in xml files of jelix
 * @name  JELIX_NAMESPACE_BASE
 */
define ('JELIX_NAMESPACE_BASE' , 'http://jelix.org/ns/');

define ('JELIX_LIB_PATH',         __DIR__.'/');
define ('JELIX_LIB_CORE_PATH',    JELIX_LIB_PATH.'core/');
define ('JELIX_LIB_UTILS_PATH',   JELIX_LIB_PATH.'utils/');
define ('LIB_PATH',               dirname(JELIX_LIB_PATH).'/');


define ('BYTECODE_CACHE_EXISTS', function_exists('opcache_compile_file') || function_exists('apc_cache_info') || function_exists('eaccelerator_info') || function_exists('xcache_info'));

error_reporting (E_ALL | E_STRICT);

require (JELIX_LIB_CORE_PATH . 'jApp.class.php');
require (JELIX_LIB_CORE_PATH . 'jelix_api.php');
require (JELIX_LIB_CORE_PATH . 'jICoordPlugin.iface.php');
require (JELIX_LIB_CORE_PATH . 'jISelector.iface.php');
require (JELIX_LIB_CORE_PATH . 'jIUrlEngine.iface.php');
require (JELIX_LIB_CORE_PATH . 'jBasicErrorHandler.class.php');
require (JELIX_LIB_CORE_PATH . 'jException.class.php');
require (JELIX_LIB_CORE_PATH . 'jConfig.class.php');
require (JELIX_LIB_CORE_PATH . 'jSelector.class.php');
require (JELIX_LIB_CORE_PATH . 'jServer.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorModule.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorActFast.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorAct.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorClass.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorDao.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorDaoRecord.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorForm.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorIface.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorLoc.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorTpl.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorZone.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorSimpleFile.class.php');
require (JELIX_LIB_CORE_PATH . 'selector/jSelectorFile.lib.php');
require (JELIX_LIB_CORE_PATH . 'jUrlBase.class.php');
require (JELIX_LIB_CORE_PATH . 'jUrlAction.class.php');
require (JELIX_LIB_CORE_PATH . 'jUrl.class.php');
require (JELIX_LIB_CORE_PATH . 'jCoordinator.class.php');
require (JELIX_LIB_CORE_PATH . 'jController.class.php');
require (JELIX_LIB_CORE_PATH . 'jRequest.class.php');
require (JELIX_LIB_CORE_PATH . 'jResponse.class.php');
require (JELIX_LIB_CORE_PATH . 'jBundle.class.php');
require (JELIX_LIB_CORE_PATH . 'jLocale.class.php');
require (JELIX_LIB_CORE_PATH . 'jLog.class.php');
require (JELIX_LIB_CORE_PATH . 'jIncluder.class.php');
require (JELIX_LIB_CORE_PATH . 'jSession.class.php');

/**
 * contains path for the jelix_autoload function
 * @global array $gLibPath
 * @name $gLibPath
 * @see jelix_autoload()
 */
$GLOBALS['gLibPath']=array('Config'=>JELIX_LIB_PATH.'core/',
 'Db'=>JELIX_LIB_PATH.'db/', 'Dao'=>JELIX_LIB_PATH.'dao/',
 'Forms'=>JELIX_LIB_PATH.'forms/', 'Event'=>JELIX_LIB_PATH.'events/',
 'Tpl'=>JELIX_LIB_PATH.'tpl/', 'Controller'=>JELIX_LIB_PATH.'controllers/',
 'Auth'=>JELIX_LIB_PATH.'auth/', 'Installer'=>JELIX_LIB_PATH.'installer/',
 'KV'=>JELIX_LIB_PATH.'kvdb/');

/**
 * function used by php to try to load an unknown class
 */
function jelix_autoload($class) {
    if (strpos($class, 'jelix\\') === 0) {
        $f = LIB_PATH.str_replace('\\', DIRECTORY_SEPARATOR, $class).'.php';
    }
    else if(preg_match('/^j(Dao|Tpl|Event|Db|Controller|Forms|Auth|Config|Installer|KV).*/i', $class, $m)){
        $f=$GLOBALS['gLibPath'][$m[1]].$class.'.class.php';
    }
    elseif(preg_match('/^cDao(?:Record)?_(.+)_Jx_(.+)_Jx_(.+)$/', $class, $m)){
        // for DAO which are stored in sessions for example
        if(!isset(jApp::config()->_modulesPathList[$m[1]])){
            //this may happen if we have several entry points, but the current one does not have this module accessible
            return;
        }
        $s = new jSelectorDao($m[1].'~'.$m[2], $m[3], false);
        if(jApp::config()->compilation['checkCacheFiletime']){
            // if it is needed to check the filetime, then we use jIncluder
            // because perhaps we will have to recompile the dao before the include
            jIncluder::inc($s);
        }else{
            $f = $s->getCompiledFilePath();
            // we should verify that the file is here and if not, we recompile
            // (case where the temp has been cleaned, see bug #6062 on berlios.de)
            if (!file_exists($f)) {
                jIncluder::inc($s);
            }
            else
                require($f);
        }
        return;
    }else{
        $f = JELIX_LIB_UTILS_PATH.$class.'.class.php';
    }

    if(file_exists($f)){
        require($f);
    }
}

spl_autoload_register("jelix_autoload");

/**
 * check if the application is opened. If not, it displays the yourapp/install/closed.html
 * file with a http error (or lib/jelix/installer/closed.html), and exit.
 * This function should be called in all entry point, before the creation of the coordinator.
 * @see jAppManager
 * @todo migrate the code to jAppManager or jApp
 */
function checkAppOpened() {
    if (!jApp::isInit()) {
        header("HTTP/1.1 500 Application not available");
        header('Content-type: text/html');
        echo "checkAppOpened: jApp is not initialized!";
        exit(1);
    }
    if (file_exists(jApp::configPath('CLOSED'))) {
        $message = file_get_contents(jApp::configPath('CLOSED'));

        if (jServer::isCLI()) {
            echo "Application closed.". ($message?"\n$message\n":"\n");
            exit(1);
        }

        if (file_exists(jApp::appPath('install/closed.html'))) {
            $file = jApp::appPath('install/closed.html');
        }
        else
            $file = JELIX_LIB_PATH.'installer/closed.html';

        header("HTTP/1.1 500 Application not available");
        header('Content-type: text/html');
        echo str_replace('%message%', $message, file_get_contents($file));
        exit(1);
    }
}

/**
 * check if the application is not installed. If the app is installed, an
 * error message appears and the scripts ends.
 * It should be called only by some scripts
 * like an installation wizard, not by an entry point.
 * @todo migrate the code to jAppManager or jApp
 */
function checkAppNotInstalled() {
    if (isAppInstalled()) {
         if (jServer::isCLI()) {
            echo "Application is installed. The script cannot be runned.\n";
        }
        else {
            header("HTTP/1.1 500 Application not available");
            header('Content-type: text/plain');
            echo "Application is installed. The script cannot be runned.\n";
        }
        exit(1);
    }
}

/**
 * @todo migrate the code to jAppManager or jApp
 */
function isAppInstalled() {
    return file_exists(jApp::configPath('installer.ini.php'));
}
