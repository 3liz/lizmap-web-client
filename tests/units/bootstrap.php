<?php

require_once(__DIR__.'/../../lizmap/application.init.php');


spl_autoload_register(function($class) {
    if (preg_match("/ForTests$/", $class)) {
        require (__DIR__.'/testslib/'.$class.'.php');
    }
});

// set user_agent with Lizmap Version
$appInfos = \Jelix\Core\Infos\AppInfos::load();
$userAgent = 'Lizmap '.$appInfos->version;
ini_set('user_agent', $userAgent);

jApp::setEnv('lizmaptests');
if (file_exists(jApp::tempPath())) {
    jAppManager::clearTemp(jApp::tempPath());
}
