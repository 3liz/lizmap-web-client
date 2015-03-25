<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2005-2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

// caller script should setup :
// $commandName

error_reporting(E_ALL);
define ('JELIX_SCRIPTS_PATH', __DIR__.'/../');
require (JELIX_SCRIPTS_PATH.'../jelix/init.php');
require (JELIX_SCRIPTS_PATH.'includes/JelixScript.class.php');

if (!jServer::isCLI()) {
    echo "Error: you're not allowed to execute this script outside a command line shell.\n";
    exit(1);
}

// ------------- retrieve the name of the jelix command

$argv = $_SERVER['argv'];
$scriptName = array_shift($argv); // shift the script name

// ------------ load the config and retrieve the command object

set_error_handler('JelixScriptsErrorHandler');
set_exception_handler('JelixScriptsExceptionHandler');

if (count($argv) > 0 && ($argv[0] == '-h' || $argv[0] == 'help')) {
    array_shift($argv);
    array_unshift($argv, $commandName);
    array_unshift($argv, "-standalone");
    $commandName = 'help';
    $command = JelixScript::getCommand($commandName, JelixScript::loadConfig(false), false);
}
else
    $command = JelixScript::getCommand($commandName, null, true);

if (jApp::isInit()) {
    echo "Error: shouldn't run within an application\n";
    exit(1);
}
if ($command->applicationRequirement == JelixScriptCommand::APP_MUST_EXIST) {
    echo "Error: This command needs an existing application\n";
    exit(1);
}

// --------- launch the command now

$command->init($argv);
$command->run();

exit(0);
