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
 * lizmapConfig.ini.php
 */
$lizmapConfig = new jIniFileModifier('/www/lizmap/var/config/lizmapConfig.ini.php');

$lizmapConfig->setValue('wmsServerURL', getenv('LIZMAP_WMSSERVERURL'), 'services');
$lizmapConfig->setValue('cacheRedisHost', getenv('LIZMAP_CACHEREDISHOST'), 'services');

foreach(array(
        'cacheRedisPort'    => 'LIZMAP_CACHEREDISPORT',
        'cacheExpiration'   => 'LIZMAP_CACHEEXPIRATION',
        'debugMode'         => 'LIZMAP_DEBUGMODE',
        'cacheStorageType'  => 'LIZMAP_CACHESTORAGETYPE',
        'cacheRedisDb'      => 'LIZMAP_CACHEREDISDB',
        'cacheRedisKeyPrefix' => 'LIZMAP_CACHEREDISKEYPREFIX',
        ) as $key => $envValue
) {
    if (getenv($envValue) !== false) {
        $lizmapConfig->setValue($key, getenv($envValue), 'services');
    }
}

// DropIn capabilities: Merge all ini file in LIZMAP_LIZMAPCONFIG_INCLUDE
load_include_config('LIZMAP_LIZMAPCONFIG_INCLUDE', $lizmapConfig);

$lizmapConfig->save();

/**
 * localconfig.ini.php
 */
$localConfig = new jIniFileModifier('/www/lizmap/var/config/localconfig.ini.php');

// Set up WPS configuration
if (getenv("LIZMAP_WPS_URL") !== false) {
    $localConfig->setValue('wps.access', 2, 'modules');
    $localConfig->setValues(array(
            'wps_rootUrl' => getenv('LIZMAP_WPS_URL'),
            'ows_url'     => getenv('LIZMAP_WMSSERVERURL'),
            'wps_rootDirectories' => "/srv/projects",
            // Redis config
            'redis_port' => getenv('LIZMAP_CACHEREDISPORT') ?: 6379,
            'redis_host' => getenv('LIZMAP_CACHEREDISHOST') ?: 'redis',
            'redis_db'   => getenv('LIZMAP_CACHEREDISDB')   ?: 1,
            'redis_key_prefix' => "wpslizmap"
        ),
        'wps');
} else {
     $localConfig->setValue('wps.access', 0, 'modules');
}

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



