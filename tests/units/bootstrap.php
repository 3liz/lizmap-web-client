<?php

require_once(__DIR__.'/../../lizmap/application.init.php');
require_once(LIB_PATH.'jelix-tests/classes/junittestcase.class.php');
require_once(LIB_PATH.'jelix-tests/classes/junittestcasedb.class.php');


spl_autoload_register(function($class) {
    if (preg_match("/ForTests$/", $class)) {
        require (__DIR__.'/testslib/'.$class.'.php');
    }
});




jApp::setEnv('lizmaptests');
if (file_exists(jApp::tempPath())) {
    jAppManager::clearTemp(jApp::tempPath());
}
