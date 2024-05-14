<?php
/**
 * Script executing commands for application developers
 *
 * These are commands to help to develop an application
 * based on the Jelix framework.
 *
 * If you are not a developer, see the console.php scripts
 * for user commands.
 */
use Jelix\DevHelper\JelixCommands;

require (__DIR__.'/application.init.php');
$application = JelixCommands::setup();

if (file_exists(jApp::appPath('app/devcommands.php'))) {
    // devcommands is supposed to add commands to $application
    include(jApp::appPath('app/devcommands.php'));
}

exit(JelixCommands::launch($application));
