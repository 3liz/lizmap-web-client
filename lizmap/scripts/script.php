<?php

/**
 * @author    your name
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    All rights reserved
 */
require_once __DIR__.'/../application.init.php';

checkAppOpened();

require_once JELIX_LIB_CORE_PATH.'jCmdlineCoordinator.class.php';

require_once JELIX_LIB_CORE_PATH.'request/jCmdLineRequest.class.php';

jApp::setCoord(new jCmdlineCoordinator('cmdline/script.ini.php'));
jApp::coord()->process(new jCmdLineRequest());
