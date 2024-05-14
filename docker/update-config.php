#!/usr/bin/env php
<?php
require('/www/lizmap/vendor/autoload.php');
use \Jelix\IniFile\IniModifier;

/**
 * @param $varname
 * @param IniModifier $iniFileModifier
 * @return void
 */
function load_include_config($varname, $iniFileModifier)
{
    $includeConfigDir = getenv($varname);
    if ($includeConfigDir !== false and is_dir($includeConfigDir)) {
        echo("Checking for lizmap configuration files in ".$includeConfigDir."\n");
        foreach (glob(rtrim($includeConfigDir,"/")."/*.ini.php") as $includeFile) {
            echo("* Loading lizmap configuration: ".$includeFile."\n");
            $includeConfig = new IniModifier($includeFile);
            $iniFileModifier->import($includeConfig);
        }
    }

    // remove sections marked as deleted
    foreach ($iniFileModifier->getSectionList() as $section) {
        if ($iniFileModifier->getValue('__drop_in_delete', $section)) {
            $iniFileModifier->removeSection($section);
        }
    }
}

/**
 * connect to Postgresql with the given profile
 * @param array
 */
function pgSqlConnect ($profile)
{
    $str = '';

    // Service is PostgreSQL way to store credentials in a file :
    // http://www.postgresql.org/docs/9.1/static/libpq-pgservice.html
    // If given, no need to add host, user, database, port and password
    if(isset($profile['service']) && $profile['service'] != ''){
        $str = 'service=\''.$profile['service'].'\''.$str;

        // Database name may be given, even if service is used
        // dbname should not be mandatory in service file
        if (isset($profile['database']) && $profile['database'] != '') {
            $str .= ' dbname=\''.$profile['database'].'\'';
        }
    }
    else {
        // we do a distinction because if the host is given == TCP/IP connection else unix socket
        if($profile['host'] != '')
            $str = 'host=\''.$profile['host'].'\''.$str;

        if (isset($profile['port'])) {
            $str .= ' port=\''.$profile['port'].'\'';
        }

        if ($profile['database'] != '') {
            $str .= ' dbname=\''.$profile['database'].'\'';
        }

        // we do isset instead of equality test against an empty string, to allow to specify
        // that we want to use configuration set in environment variables
        if (isset($profile['user'])) {
            $str .= ' user=\''.$profile['user'].'\'';
        }

        if (isset($profile['password'])) {
            $str .= ' password=\''.$profile['password'].'\'';
        }
    }

    if (isset($profile['timeout']) && $profile['timeout'] != '') {
        $str .= ' connect_timeout=\''.$profile['timeout'].'\'';
    }

    if (isset($profile['pg_options']) && $profile['pg_options'] != '') {
        $str .= ' options=\''.$profile['pg_options'].'\'';
    }

    if (isset($profile['force_new']) && $profile['force_new']) {
        $cnx = pg_connect($str, PGSQL_CONNECT_FORCE_NEW);
    }
    else {
        $cnx = pg_connect($str);
    }

    // let's do the connection
    if ($cnx) {
        pg_close($cnx);
        return true;
    }
    return false;
}

/**
 * Try to connect to the postgresql database.
 *
 * @param IniModifier $profilesConfig
 * @param string $profileName The profile to use
 * @param int $nbRetries
 * @return bool
 * @throws Exception
 */
function checkAndWaitPostgresql($profilesConfig, $profileName, $nbRetries=10, $wait=2)
{
    $origProfileName = $profileName;
    $profileAlias = $profilesConfig->getValue($profileName, 'jdb');
    if ($profileAlias != '') {
        $profileName = $profileAlias;
    }
    $profile = $profilesConfig->getValues('jdb:'.$profileName);
    if ($profile === null) {
        throw new Exception("Database profile jdb:$profileName not found");
    }
    $profile = (new jDbParameters($profile))->getParameters();
    if ($profile['driver'] != 'pgsql') {
        return true;
    }
    $profile['timeout'] = 30;
    echo "trying to connect to the Postgresql database ".$profile['database']." at ".$profile['host']." with the profile $origProfileName...\n";
    for($i=0; $i < $nbRetries; $i++) {
        if (pgSqlConnect($profile)) {
            echo "  Ok, Postgresql is alive.\n";
            return true;
        }
        // if there is nothing on the host/port, pg_connect fails immediately,
        // it doesn't take account on timeout. So we're waiting a bit before retrying.
        echo "  Cannot connect yet, wait a bit before retrying...\n";
        sleep($wait);
        echo "  Retry...\n";
    }
    echo "Error: cannot connect to the Postgresql database.\n";
    echo "Lizmap cannot starts.\n";
    return false;
}

/**
 * lizmapConfig.ini.php
 */
$lizmapConfig = new \Jelix\IniFile\IniModifier('/www/lizmap/var/config/lizmapConfig.ini.php');

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
$logger_metric = getenv('LIZMAP_LOGMETRICS');
if ($logger_metric !== false) {
    $lizmapConfig->setValue('metricsEnabled', 1, 'services');
}

$lizmapConfig->save();

/**
 * localconfig.ini.php
 */
$localConfig = new \Jelix\IniFile\IniModifier('/www/lizmap/var/config/localconfig.ini.php');
$mainConfig =  new \Jelix\IniFile\IniModifier('/www/lizmap/app/system/mainconfig.ini.php');

// Let's modify the install configuration of jcommunity, to not create a default
// admin account (no `defaultusers` parameter). We're relying on
// lizmap-entrypoint.sh to setup it
$jCommunityInstallParams = $mainConfig->getValue('jcommunity.installparam', 'modules');
unset($jCommunityInstallParams['defaultusers']);
$localConfig->setValue('jcommunity.installparam', $jCommunityInstallParams, 'modules');


if ($logger_metric !== false) {
    $localConfig->setValue('metric', $logger_metric, 'logger');
}

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
$profilesConfig = new IniModifier('/www/lizmap/var/config/profiles.ini.php');

// DropIn capabilities: Merge all ini file in LIZMAP_PROFILES_INCLUDE
load_include_config('LIZMAP_PROFILES_INCLUDE', $profilesConfig);

$profilesConfig->save();

$retries = intval(getenv('LIZMAP_DATABASE_CHECK_RETRIES'));
if ($retries == 0) {
    $retries = 10;
}

$waits = intval(getenv('LIZMAP_DATABASE_CHECK_WAIT_BEFORE_RETRY'));
if ($waits == 0) {
    $waits = 2;
}

// Try to connect to the postgresql database, and retries if it does not ready yet
// we should wait after Postgresql to be sure the Lizmap installer could create
// its table and so on.
// Try with the default profile
if (!checkAndWaitPostgresql($profilesConfig, 'default', $retries, $waits)) {
    exit (1);
}
// try with the lizlog profile, it may be a different database.
if (!checkAndWaitPostgresql($profilesConfig, 'lizlog', $retries, $waits)) {
    exit (1);
}
