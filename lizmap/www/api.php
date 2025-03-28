<?php

/**
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */

require '../application.init.php';

require JELIX_LIB_CORE_PATH.'request/jClassicRequest.class.php';

checkAppOpened();

// Load configuration
jApp::loadConfig('api/config.ini.php');

// New coordinator that we indicate at jApp
jApp::setCoord(new jCoordinator());

// New request object passed to coordinator to process routing.
// Entry point for REST API
jApp::coord()->process(new jClassicRequest());
