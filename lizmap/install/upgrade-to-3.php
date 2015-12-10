<?php

require (__DIR__.'/../application.init.php');

try {
    $installerIni = new jIniFileModifier(__DIR__.'/../var/config/installer.ini.php');
}
catch(Exception $e) {
    echo "Error: var/config/installer.ini.php is not found";
    exit (1);
}

try {
    $profiles = new jIniFileModifier(__DIR__.'/../var/config/profiles.ini.php');
}
catch(Exception $e) {
    echo "Error: var/config/profiles.ini.php is not found";
    exit (1);
}



if (null === $installerIni->getValue('admin.contexts', '__modules_data')) {
    $installerIni->setValue('admin.contexts', 'acl2', '__modules_data');
}

if (null === $installerIni->getValue('lizmap.contexts', '__modules_data')) {
    $installerIni->setValue('lizmap.contexts', 'db:default,acl2', '__modules_data');
}

if (null === $installerIni->getValue('view.contexts', '__modules_data')) {
    $installerIni->setValue('view.contexts', 'db:default', '__modules_data');
}
$installerIni->save();

if ($profiles->getValue('dsn', 'jdb:jauth') == 'sqlite:var:jauth.db') {
    $profiles->setValue('dsn', Null, 'jdb:jauth');
    $profiles->setValue('driver', 'sqlite3', 'jdb:jauth');
    $profiles->setValue('database', 'var:db/jauth.db', 'jdb:jauth');
}
if ($profiles->getValue('dsn', 'jdb:lizlog') == 'sqlite:var:logs.db') {
    $profiles->setValue('dsn', Null, 'jdb:lizlog');
    $profiles->setValue('driver', 'sqlite3', 'jdb:lizlog');
    $profiles->setValue('database', 'var:db/logs.db', 'jdb:lizlog');
}
$profiles->save();

require(__DIR__.'/installer.php');

