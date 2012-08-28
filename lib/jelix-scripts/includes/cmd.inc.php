<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2005-2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

error_reporting(E_ALL);
define ('JELIX_SCRIPTS_PATH', dirname(__FILE__).'/../');

if(!class_exists('jCoordinator', false)) { // for old application.init.php which doesn't include init.php
    echo "Error: your application.init.php should include the lib/jelix/init.php";
    exit(1);
}

if (!jServer::isCLI()) {
    echo "Error: you're not allowed to execute this script outside a command line shell.\n";
    exit(1);
}

// ------------- retrieve the name of the jelix command

if ($_SERVER['argc'] < 2) {
    echo "Error: command is missing. See '".$_SERVER['argv'][0]." help'.\n";
    exit(1);
}

$argv = $_SERVER['argv'];
$scriptName = array_shift($argv); // shift the script name
$commandName = array_shift($argv); // get the command name

// ------------ load the config and retrieve the command object

require(JELIX_SCRIPTS_PATH.'includes/JelixScript.class.php');

set_error_handler('JelixScriptsErrorHandler');
set_exception_handler('JelixScriptsExceptionHandler');

$config = JelixScript::loadConfig();

$command = JelixScript::getCommand($commandName, $config);

if (!jApp::isInit()) {
    echo "Error: should run within an application\n";
    exit(1);
}
if ($command->applicationRequirement == JelixScriptCommand::APP_MUST_NOT_EXIST) {
    echo "Error: This command doesn't apply on an existing application\n";
    exit(1);
}

jApp::setEnv('jelix-scripts');
jApp::initLegacy();

JelixScript::checkTempPath();

// --------- launch the command now

$command->init($argv);
$command->run();

exit(0);
