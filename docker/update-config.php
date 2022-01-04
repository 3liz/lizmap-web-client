#!/usr/bin/env php
<?php
require('/www/lib/jelix/utils/jIniFileModifier.class.php');

function load_include_config($varname, $iniFileModifier)
{
    $includeConfigDir = getenv($varname);
    if ($includeConfigDir !== false and is_dir($includeConfigDir)) {
        echo("Checking for lizmap configuration files in ".$includeConfigDir."\n");
        foreach (glob(rtrim($includeConfigDir,"/")."/*.ini.php") as $includeFile) {
            echo("* Loading lizmap configuration: ".$includeFile."\n"); 
            $includeConfig = new jIniFileModifier($includeFile);
            $iniFileModifier->import($includeConfig);
        }  
    }  
} 

/** 
 * mainconfig.ini.php
 */
$mainconfig = new jIniFileModifier('/www/lizmap/var/config/mainconfig.ini.php');

// Configure metric logger
$logger_metric = getenv('LIZMAP_LOGMETRICS');
if ($logger_metric !== false) {
    $mainconfig->setValue('metric', $logger_metric, 'logger');
}

$mainconfig->save();

/**
 * lizmapConfig.ini.php
 */
$lizmapConfig = new jIniFileModifier('/www/lizmap/var/config/lizmapConfig.ini.php');

$lizmapConfig->setValue('wmsServerURL', getenv('LIZMAP_WMSSERVERURL'), 'services');
$lizmapConfig->setValue('lizmapPluginAPIURL', getenv('LIZMAP_LIZMAPPLUGINAPIURL'), 'services');
$lizmapConfig->setValue('rootRepositories', getenv('LIZMAP_ROOT_REPOSITORIES'), 'services');
$lizmapConfig->setValue('relativeWMSPath', true, 'services');

foreach(array(
        'cacheExpiration'     => 'LIZMAP_CACHEEXPIRATION',
        'debugMode'           => 'LIZMAP_DEBUGMODE',
        'cacheStorageType'    => 'LIZMAP_CACHESTORAGETYPE',
        'cacheRedisDb'        => 'LIZMAP_CACHEREDISDB',
        'cacheRedisKeyPrefix' => 'LIZMAP_CACHEREDISKEYPREFIX',
        'cacheRedisHost'      => 'LIZMAP_CACHEREDISHOST',
        'cacheRedisPort'      => 'LIZMAP_CACHEREDISPORT',
        ) as $key => $envValue
) {
    if (getenv($envValue) !== false) {
        $lizmapConfig->setValue($key, getenv($envValue), 'services');
    }
}

// DropIn capabilities: Merge all ini file in LIZMAP_LIZMAPCONFIG_INCLUDE
load_include_config('LIZMAP_LIZMAPCONFIG_INCLUDE', $lizmapConfig);

// Enable metrics
if ($logger_metric !== false) {
    $lizmapConfig->setValue('metricsEnabled', 1, 'services');
} 

$lizmapConfig->save();

/**
 * localconfig.ini.php
 */
$localConfig = new jIniFileModifier('/www/lizmap/var/config/localconfig.ini.php');

// Let's modify the install configuration of jcommunity, to not create a default
// admin account (no `defaultusers` parameter). We're relying on
// lizmap-entrypoint.sh to setup it
$localConfig->setValue('jcommunity.installparam', 'manualconfig', 'modules');

// Set urlengine config

if (getenv('LIZMAP_PROXYURL_PROTOCOL') !== false) {
    $localConfig->setValue('checkHttpsOnParsing', false, 'urlengine');
    $localConfig->setValue('forceProxyProtocol', getenv('LIZMAP_PROXYURL_PROTOCOL'), 'urlengine');

    // By default, use the 443 https port
    if (getenv('LIZMAP_PROXYURL_HTTPS_PORT') !== false) {
        $config['forceHTTPSPort'] = getenv('LIZMAP_PROXYURL_HTTPS_PORT');
        $localConfig->setValue('forceHTTPSPort', getenv('LIZMAP_PROXYURL_HTTPS_PORT'));
    }
    else {
        $localConfig->setValue('forceHTTPSPort', 443);
    }
}

if (getenv('LIZMAP_PROXYURL_DOMAIN') !== false) {
    $localConfig->setValue('domainName', getenv('LIZMAP_PROXYURL_DOMAIN'), 'urlengine');
}

if (getenv('LIZMAP_PROXYURL_BASEPATH') !== false) {
    $localConfig->setValue('basePath', getenv('LIZMAP_PROXYURL_BASEPATH'), 'urlengine');
}

if (getenv('LIZMAP_PROXYURL_BACKENDBASEPATH') !== false) {
    $localConfig->setValue('backendBasePath', getenv('LIZMAP_PROXYURL_BACKENDBASEPATH'), 'urlengine');
}

if (getenv('LIZMAP_THEME') !== false) {
    $localConfig->setValue('theme', getenv('LIZMAP_THEME'));
}

// DropIn capabilities: Merge all ini file in LIZMAP_LOCALCONFIG_INCLUDE
load_include_config('LIZMAP_LOCALCONFIG_INCLUDE', $localConfig);

// Do not break older install
$mailConfigFile = '/srv/etc/mailconfig.ini';
if (file_exists($mailConfigFile)) {
    $mailConfig = parse_ini_file($mailConfigFile, true);
    $localConfig->setValues($mailConfig['mailer'], 'mailer');
}

$localConfig->save();

/**
 * profiles.ini.php
 */
$profilesConfig = new jIniFileModifier('/www/lizmap/var/config/profiles.ini.php');

// DropIn capabilities: Merge all ini file in LIZMAP_PROFILES_INCLUDE
load_include_config('LIZMAP_PROFILES_INCLUDE', $profilesConfig);

$profilesConfig->save();




