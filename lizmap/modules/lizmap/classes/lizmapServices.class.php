<?php

use Lizmap\Server\Server;

/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2012-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapServices
{
    /**
     * Lizmap configuration data from lizmapConfig.ini.php
     * This allow to access to configuration properties that are not exposed
     * via properties member for this class.
     */
    private $data = array();

    /**
     * List of all properties of lizmapServices that are editable in the
     * configuration form of Lizmap.
     *
     * properties values are stored into lizmapConfig.ini.php or the main configuration.
     */
    private $properties = array(
        'appName',
        'wmsServerURL',
        'wmsPublicUrlList',
        'wmsMaxWidth',
        'wmsMaxHeight',
        'lizmapPluginAPIURL',
        'cacheStorageType',
        'cacheExpiration',
        'defaultRepository',
        'defaultProject',
        'onlyMaps',
        'projectSwitcher',
        'rootRepositories',
        'qgisProjectsPrivateDataFolder',
        'relativeWMSPath',
        'proxyHttpBackend',
        'requestProxyEnabled',
        'requestProxyHost',
        'requestProxyPort',
        'requestProxyUser',
        'requestProxyPassword',
        'requestProxyType',
        'requestProxyNotForDomain',
        'debugMode',
        'cacheRootDirectory',
        'cacheRedisHost',
        'cacheRedisPort',
        'cacheRedisDb',
        'cacheRedisKeyPrefix',
        'allowUserAccountRequests',
        'adminContactEmail',
        'adminSenderEmail',
        'adminSenderName',
        'googleAnalyticsID',
        'uploadedImageMaxWidthHeight',
    );

    /**
     * services properties to not display into the configuration form,
     * when hideSensitiveServicesProperties is set to 1.
     */
    private $sensitiveProperties = array(
        'wmsServerURL',
        'wmsPublicUrlList',
        'wmsMaxWidth',
        'wmsMaxHeight',
        'lizmapPluginAPIURL',
        'cacheStorageType',
        'cacheExpiration',
        'rootRepositories',
        'qgisProjectsPrivateDataFolder',
        'relativeWMSPath',
        'requestProxyEnabled',
        'requestProxyHost',
        'requestProxyPort',
        'requestProxyUser',
        'requestProxyPassword',
        'requestProxyType',
        'requestProxyNotForDomain',
        'debugMode',
        'cacheRootDirectory',
        'cacheRedisHost',
        'cacheRedisPort',
        'cacheRedisDb',
        'cacheRedisKeyPrefix',
        'adminSenderEmail',
        'proxyHttpBackend',
    );

    /**
     * List of properties that are not editable at all.
     *
     * @var string[]
     */
    private $notEditableProperties = array(
        'cacheRedisKeyPrefixFlushMethod',
        'wmsServerHeaders',
        'metricsEnabled',
    );

    /**
     * List of properties mapped to a parameter of the main configuration
     * of Jelix.
     *
     * @var array
     */
    private $globalConfigProperties = array(
        // property name => array(ini parameter name, ini section name)
        'allowUserAccountRequests' => array('registrationEnabled', 'jcommunity'),
        'adminSenderEmail' => array('webmasterEmail', 'mailer'),
        'adminSenderName' => array('webmasterName', 'mailer'),
    );

    private $isUsingLdap = false;

    private $varPath = '';
    private $globalConfig;

    /**
     * Application name.
     *
     * @var string
     */
    public $appName = 'Lizmap';

    /**
     * QGIS Server version
     * For external modules only, which are still using the variable.
     *
     * @see https://github.com/3liz/lizmap-cadastre-module/issues/94
     *
     * @var string
     *
     * @deprecated 3.7.0 Use the {@see Server}
     */
    public $qgisServerVersion = '3.0';

    /**
     * QGIS Server URL.
     *
     * @var string
     */
    public $wmsServerURL = '';

    /**
     * Headers to send to WMS map server.
     *
     * @var array
     */
    public $wmsServerHeaders = array();

    /**
     * Public WMS list.
     *
     * @var string
     */
    public $wmsPublicUrlList = '';

    /**
     * WMS max width.
     *
     * @var int
     */
    public $wmsMaxWidth = 3000;

    /**
     * WMS max height.
     *
     * @var int
     */
    public $wmsMaxHeight = 3000;

    /**
     * QGIS server JSON metadata file name.
     *
     * @var string
     */
    public static $qgisServerMetadata = '/server.json';

    /**
     * Custom URL to the API exposed by the Lizmap plugin for QGIS Server.
     * Property which can be an empty string if QGIS FCGI is used.
     *
     * @var string
     */
    public $lizmapPluginAPIURL = '';

    /**
     * Map cache server type.
     *
     * @var string
     */
    public $cacheStorageType = '';

    /**
     * Default repository.
     *
     * @var string
     */
    public $defaultRepository = '';

    /**
     * Default project in default repository.
     *
     * @var string
     */
    public $defaultProject = '';

    /**
     * Do not display Lizmap projects page.
     */
    public $onlyMaps = '';

    /**
     * Show projects switcher in maps page.
     */
    public $projectSwitcher = '';

    /**
     * Display all project in maps.
     */
    public $allInMap = '';

    /**
     * Root folder of repositories.
     *
     * @var string
     */
    public $rootRepositories = '';

    /**
     * Root folder of QGIS project inspection data output files (qgis-project-validator).
     *
     * @var string
     */
    public $qgisProjectsPrivateDataFolder = '';

    /**
     * Does the server use relative Path from root folder?
     *
     * @var string
     */
    public $relativeWMSPath = '0';

    /**
     * backend to use to do http request : use curl ('curl') or file_get_contents ('php').
     * leave empty to have automatic selection (it will use curl if the curl extension is installed).
     * Fill it only for tests.
     *
     * @var string
     */
    public $proxyHttpBackend = '';

    /**
     * Map cache server.
     *
     * @var bool
     */
    public $requestProxyEnabled = false;

    /**
     * Proxy host.
     *
     * @var string
     */
    public $requestProxyHost = '';

    /**
     * Proxy port.
     *
     * @var string
     */
    public $requestProxyPort = '';

    /**
     * Proxy user.
     *
     * @var string
     */
    public $requestProxyUser = '';

    /**
     * Proxy password.
     *
     * @var string
     */
    public $requestProxyPassword = '';

    /**
     * Proxy type: 'http' or 'socks5'. Only used with the curl proxyHttpBackend.
     *
     * @var string
     */
    public $requestProxyType = 'http';

    /**
     * List of domains separated by a comma, to which the proxy is not used.
     *
     * @var string
     */
    public $requestProxyNotForDomain = 'localhost,127.0.0.1';

    /**
     * Debug mode : none or log.
     */
    public $debugMode = '';

    /**
     * Cache root directory.
     *
     * @var string
     */
    public $cacheRootDirectory = '';

    /**
     * Redis host.
     *
     * @var string
     */
    public $cacheRedisHost = 'localhost';

    /**
     * Redis port.
     *
     * @var string
     */
    public $cacheRedisPort = '6379';

    /**
     * Redis DB.
     *
     * @var string
     */
    public $cacheRedisDb = '';

    /**
     * Redis key prefix.
     *
     * @var string
     */
    public $cacheRedisKeyPrefix = '';

    /**
     * Cache expiration.
     *
     * @var string
     */
    public $cacheExpiration = '';

    /**
     * Method to flush keys when $cacheRedisKeyPrefix is set.
     *
     * @see https://docs.jelix.org/en/manual
     *
     * @var string
     */
    public $cacheRedisKeyPrefixFlushMethod = '';

    /**
     * If we allow to view the form to request an account.
     */
    public $allowUserAccountRequests = '';

    /**
     * Admin contact email.
     *
     * @var string
     */
    public $adminContactEmail = '';

    /**
     * Administrator sender email.
     *
     * @var string
     */
    public $adminSenderEmail = '';

    /**
     * Administrator sender name.
     *
     * @var string
     */
    public $adminSenderName = '';

    /**
     * Application ID for Google Analytics.
     *
     * @var string
     */
    public $googleAnalyticsID = '';

    /**
     * Uploaded image maximum width and height.
     *
     * @var int
     */
    public $uploadedImageMaxWidthHeight = 1920;

    /**
     * @var bool|int true/1 if metrics should be sent to the metric logger
     */
    private $metricsEnabled = false;

    protected $appContext;

    /**
     * constructor method.
     *
     * @param array  $readConfigPath the lizmapConfig ini file put in an array
     * @param object $globalConfig   the jelix configuration
     * @param bool   $ldapEnabled    true if ldapdao module is enabled
     * @param string $varPath        the configuration files path given by jApp::varPath()
     * @param mixed  $appContext
     */
    public function __construct($readConfigPath, $globalConfig, $ldapEnabled, $varPath, $appContext)
    {
        // read the lizmap configuration file
        $this->data = $readConfigPath;
        $this->globalConfig = $globalConfig;
        $this->varPath = $varPath;
        $this->isUsingLdap = $ldapEnabled;
        $this->appContext = $appContext;

        // set generic parameters
        foreach ($this->properties as $prop) {
            if (isset($this->globalConfigProperties[$prop])) {
                list($key, $section) = $this->globalConfigProperties[$prop];
                if (isset($globalConfig->{$section})) {
                    $conf = &$globalConfig->{$section};
                }
                if (isset($conf[$key])) {
                    $this->{$prop} = trim($conf[$key]);
                }
            } elseif (isset($readConfigPath['services'][$prop])) {
                $this->{$prop} = $readConfigPath['services'][$prop];
            }
        }

        foreach ($this->notEditableProperties as $prop) {
            if (isset($readConfigPath['services'][$prop])) {
                $this->{$prop} = $readConfigPath['services'][$prop];
            }
        }

        if (!is_array($this->wmsServerHeaders)) {
            $this->wmsServerHeaders = array();
        }

        // check email address where to send notifications
        if ($this->adminContactEmail == 'root@localhost'
            || $this->adminContactEmail == 'root@localhost.localdomain'
            || $this->adminContactEmail == ''
            || !filter_var($this->adminContactEmail, FILTER_VALIDATE_EMAIL)
        ) {
            $this->adminContactEmail = '';
        }

        // check email address of the sender
        if ($this->adminSenderEmail == 'root@localhost'
            || $this->adminSenderEmail == 'root@localhost.localdomain'
            || $this->adminSenderEmail == ''
            || !filter_var($this->adminSenderEmail, FILTER_VALIDATE_EMAIL)
        ) {
            // if the sender email is not configured, deactivate features that
            // need to send an email
            $this->allowUserAccountRequests = false;
            $this->adminSenderEmail = '';
        }

        if ($this->isUsingLdap) {
            // as ldapdao cannot write to the ldap, a user cannot create an account
            $this->allowUserAccountRequests = false;
        }

        // set user_agent for external requests, needed for file_get_contents
        if (isset($readConfigPath['services']['userAgent'])) {
            // may be set to false if already set in the php.ini
            $userAgent = $readConfigPath['services']['userAgent'];
        } elseif (property_exists($globalConfig, 'lizmap')) {
            $userAgent = $globalConfig->lizmap['version'];
        } else {
            $userAgent = 'lizmap';
        }
        if ($userAgent && !ini_get('user_agent')) {
            ini_set('user_agent', $userAgent);
        }
    }

    public function isLdapEnabled()
    {
        return $this->isUsingLdap;
    }

    public function isSmtpEnabled()
    {
        $config = jApp::config()->mailer;

        return $config['mailerType'] == 'smtp'
            && $config['smtpHost'] != ''
            && $config['smtpPort'] != '';
    }

    /**
     * @return bool|int
     */
    public function areMetricsEnabled()
    {
        return $this->metricsEnabled === true || $this->metricsEnabled === '1' || $this->metricsEnabled === 'true';
    }

    public function getProperties()
    {
        return $this->properties;
    }

    public function hideSensitiveProperties()
    {
        if (isset($this->data['hideSensitiveServicesProperties'])
          && $this->data['hideSensitiveServicesProperties'] != '0'
        ) {
            return true;
        }

        return false;
    }

    public function getSensitiveProperties()
    {
        return $this->sensitiveProperties;
    }

    public function getRootRepositories()
    {
        $rootRepositories = $this->rootRepositories;

        if ($rootRepositories != '') {
            // if path is relative, get full path
            if ($rootRepositories[0] != '/' and $rootRepositories[1] != ':') {
                $rootRepositories = realpath($this->varPath.$rootRepositories);
            }
            // add a trailing slash if needed
            if ($rootRepositories !== false) {
                $rootRepositories = rtrim($rootRepositories, '/').'/';
            }
        }

        return $rootRepositories;
    }

    /**
     * Get the path where the inspection data generated by qgis-project-validator
     * tool are stored. If not found, use the rootRepositories folder.
     *
     * @return string Path of the folder containing the inspection data
     */
    public function getQgisProjectsPrivateDataFolder()
    {
        $qgisProjectsPrivateDataFolder = $this->qgisProjectsPrivateDataFolder;

        if ($qgisProjectsPrivateDataFolder != '') {
            // if path is relative, get full path
            if ($qgisProjectsPrivateDataFolder[0] != '/' and $qgisProjectsPrivateDataFolder[1] != ':') {
                $qgisProjectsPrivateDataFolder = realpath($this->varPath.$qgisProjectsPrivateDataFolder);
            }
            // add a trailing slash if needed
            if ($qgisProjectsPrivateDataFolder !== false) {
                $qgisProjectsPrivateDataFolder = rtrim($qgisProjectsPrivateDataFolder, '/').'/';
            }
        } else {
            $qgisProjectsPrivateDataFolder = $this->getRootRepositories();
        }

        return $qgisProjectsPrivateDataFolder;
    }

    public function isRelativeWMSPath()
    {
        // in the ini file, if the value is 'off' or 'false', the result is ''
        return $this->relativeWMSPath !== '' && $this->relativeWMSPath !== '0';
    }

    /**
     * Modify the services.
     *
     * @param array $data array containing the data of the services
     */
    public function modify($data)
    {
        $modified = false;
        $globalConfig = $this->globalConfig;
        if (!isset($data)) {
            return $modified;
        }
        foreach ($data as $k => $v) {
            if (isset($this->globalConfigProperties[$k])) {
                list($key, $section) = $this->globalConfigProperties[$k];
                if (!isset($globalConfig->{$section})) {
                    $globalConfig->{$section} = array();
                }
                $conf = &$globalConfig->{$section};
                $conf[$key] = $v;
                $this->{$k} = $v;
                $modified = true;
            } elseif (in_array($k, $this->properties)) {
                $this->data['services'][$k] = $v;
                $this->{$k} = $v;
                $modified = true;
            }
        }

        return $modified;
    }

    /**
     * Host URL to the Lizmap QGIS Server API, taking care of the QGIS Server context : FCGI, QJazz, etc.
     *
     * @return string the host part of the Lizmap API
     */
    public function getHostLizmapAPI()
    {
        if (empty($this->lizmapPluginAPIURL)) {
            // When the Lizmap API URL is not set, we use the WMS server URL only
            // and we add '/lizmap' at then end
            return rtrim($this->wmsServerURL, '/').'/lizmap';
        }

        // When the Lizmap API URL is set
        return rtrim($this->lizmapPluginAPIURL, '/');
    }

    /**
     * URL to the JSON QGIS Server metadata, taking care of the QGIS Server context : FCGI, QJazz, etc.
     *
     * @return string the URL to the QGIS Server JSON metadata file
     */
    public function getUrlLizmapQgisServerMetadata()
    {
        return $this->getHostLizmapAPI().self::$qgisServerMetadata;
    }

    public function saveIntoIni($ini, $liveIni)
    {
        $dontSaveSensitiveProps = $this->hideSensitiveProperties();
        $hiddenProps = array();
        if ($dontSaveSensitiveProps) {
            $hiddenProps = array_combine($this->sensitiveProperties, array_fill(0, count($this->sensitiveProperties), true));
        }

        foreach ($this->properties as $prop) {
            if ($dontSaveSensitiveProps && isset($hiddenProps[$prop])) {
                continue;
            }
            if (isset($this->globalConfigProperties[$prop])) {
                list($key, $section) = $this->globalConfigProperties[$prop];
                $liveIni->setValue($key, $this->{$prop}, $section);
            } elseif ($this->{$prop} != '') {
                $ini->setValue($prop, $this->{$prop}, 'services');
                if ($prop == 'adminContactEmail') {
                    if ($this->globalConfig->lizmap['setAdminContactEmailAsReplyTo']) {
                        $liveIni->setValue('replyTo', $this->{$prop}, 'mailer');
                    }
                    // for jCommunity 1.4+
                    $liveIni->setValue('notificationReceiverEmail', $this->{$prop}, 'jcommunity');
                }
            } else {
                $ini->removeValue($prop, 'services');
            }
        }
    }

    public function sendNotificationEmail($subject, $body)
    {
        $email = filter_var($this->adminContactEmail, FILTER_VALIDATE_EMAIL);
        $sender = filter_var($this->adminSenderEmail, FILTER_VALIDATE_EMAIL);
        if ($email && $sender) {
            $mail = new jMailer();
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->AddAddress($email, 'Lizmap Notifications');

            try {
                $mail->Send();
            } catch (Exception $e) {
                jLog::log('error while sending email to admin: '.$e->getMessage(), 'lizmapadmin');
                jLog::logEx($e, 'error');
            }
        } else {
            if (!$sender && !$email) {
                jLog::log('Notification cannot be send: no sender email nor notification email have been configured', 'lizmapadmin');
            } elseif (!$email) {
                jLog::log('Notification cannot be send: no notification email has been configured', 'lizmapadmin');
            } else {
                jLog::log('Notification cannot be send: no sender email has been configured', 'lizmapadmin');
            }
        }
    }

    /**
     * This method will create and return a lizmapRepository instance.
     *
     * @param string $key the name of the repository
     *
     * @return lizmapRepository The lizmapRepository instance
     */
    public function getLizmapRepository($key)
    {
        $section = 'repository:'.$key;

        if ($key === null || $key === '') {
            // XXX: should we throw an exception instead?
            return false;
        }
        // Check if repository exists in the ini file
        if (array_key_exists($section, $this->data)) {
            $data = $this->data[$section];
        } else {
            $data = array();
        }

        return new lizmapRepository($key, $data, $this->varPath, $this, $this->appContext);
    }
}
