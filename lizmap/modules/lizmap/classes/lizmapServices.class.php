<?php
/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2012 3liz
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
     * List of all properties of lizmapServices that should be retrieved
     * from lizmapConfig.ini.php or from the main configuration.
     */
    private $properties = array(
        'appName',
        'qgisServerVersion',
        'wmsServerURL',
        'wmsPublicUrlList',
        'wmsMaxWidth',
        'wmsMaxHeight',
        'cacheStorageType',
        'cacheExpiration',
        'defaultRepository',
        'defaultProject',
        'onlyMaps',
        'projectSwitcher',
        'rootRepositories',
        'relativeWMSPath',
        'proxyMethod',
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
    );

    // services properties
    private $sensitiveProperties = array(
        'qgisServerVersion',
        'wmsServerURL',
        'wmsPublicUrlList',
        'wmsMaxWidth',
        'wmsMaxHeight',
        'cacheStorageType',
        'cacheExpiration',
        'rootRepositories',
        'relativeWMSPath',
        'proxyMethod',
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
        'adminSenderName',
    );

    private $notEditableProperties = array(
        'cacheRedisKeyPrefixFlushMethod',
    );

    /**
     * List of properties mapped to a parameter of the main configuration of Jelix.
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

    // Wms map server
    public $appName = 'Lizmap';
    // QGIS Server version
    public $qgisServerVersion = '3.0';
    // Wms map server
    public $wmsServerURL = '';
    // Public Wms url list
    public $wmsPublicUrlList = '';
    // Wms max width
    public $wmsMaxWidth = 3000;
    // Wms max width
    public $wmsMaxHeight = 3000;
    // map cache server
    public $cacheStorageType = '';
    // default repository
    public $defaultRepository = '';
    // default project in default repository
    public $defaultProject = '';
    // Do not display Lizmap projects page
    public $onlyMaps = '';
    // Show projects switcher in maps page
    public $projectSwitcher = '';
    // display all project in maps
    public $allInMap = '';
    // Root folder of repositories
    public $rootRepositories = '';
    // Does the server use relative Path from root folder?
    public $relativeWMSPath = '0';
    // proxy method : use curl ('curl') or file_get_contents ('php')
    public $proxyMethod = '';

    public $requestProxyEnabled = false;
    public $requestProxyHost = '';
    public $requestProxyPort = '';
    public $requestProxyUser = '';
    public $requestProxyPassword = '';
    // proxy type: 'http' or 'socks5'. Only used with the curl proxyMethod
    public $requestProxyType = 'http';
    // list of domains separated by a comma, to which the proxy is not used
    public $requestProxyNotForDomain = 'localhost,127.0.0.1';

    // debug mode : none or log
    public $debugMode = '';
    // Cache root directory
    public $cacheRootDirectory = '';
    // Redis host
    public $cacheRedisHost = 'localhost';
    // Redis port
    public $cacheRedisPort = '6379';
    // Redis db
    public $cacheRedisDb = '';
    // Redis key prefix
    public $cacheRedisKeyPrefix = '';
    // method to flush keys when $cacheRedisKeyPrefix is set. See Jelix documentation
    public $cacheRedisKeyPrefixFlushMethod = '';
    // if we allow to view the form to request an account
    public $allowUserAccountRequests = '';
    // admin contact email
    public $adminContactEmail = '';
    // admin sender email
    public $adminSenderEmail = '';
    public $adminSenderName = '';
    // application id for google analytics
    public $googleAnalyticsID = '';

    public function __construct()
    {
        // read the lizmap configuration file
        $readConfigPath = parse_ini_file(jApp::configPath('lizmapConfig.ini.php'), true);
        $this->data = $readConfigPath;
        $globalConfig = jApp::config();

        $this->isUsingLdap = jApp::isModuleEnabled('ldapdao');

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

        // check email address where to send notifications
        if ($this->adminContactEmail == 'root@localhost' ||
            $this->adminContactEmail == 'root@localhost.localdomain' ||
            $this->adminContactEmail == '' ||
            !filter_var($this->adminContactEmail, FILTER_VALIDATE_EMAIL)
        ) {
            $this->adminContactEmail = '';
        }

        // check email address of the sender
        if ($this->adminSenderEmail == 'root@localhost' ||
            $this->adminSenderEmail == 'root@localhost.localdomain' ||
            $this->adminSenderEmail == '' ||
            !filter_var($this->adminSenderEmail, FILTER_VALIDATE_EMAIL)
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

        // set it for external requests, needed for file_get_contents
        $userAgent = 'Lizmap';
        if (isset($readConfigPath['services']['userAgent'])) {
            // may be set to false if already set in the php.ini
            $userAgent = $readConfigPath['services']['userAgent'];
        }
        if ($userAgent) {
            ini_set('user_agent', 'Lizmap');
        }
    }

    public function isLdapEnabled()
    {
        return $this->isUsingLdap;
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
                $rootRepositories = realpath(jApp::varPath().$rootRepositories);
            }
            // add a trailing slash if needed
            if (!preg_match('#/$#', $rootRepositories)) {
                $rootRepositories .= '/';
            }
        }

        return $rootRepositories;
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
        $globalConfig = jApp::config();
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
     * Update the services. (modify and save).
     *
     * @param array $data array containing the data of the services
     */
    public function update($data)
    {
        $modified = $this->modify($data);
        if ($modified) {
            $modified = $this->save();
        }

        return $modified;
    }

    /**
     * save the services.
     */
    public function save()
    {
        // Get access to the ini file
        $ini = new jIniFileModifier(jApp::configPath('lizmapConfig.ini.php'));
        $liveIni = new jIniFileModifier(jApp::configPath('liveconfig.ini.php'));

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
            } else {
                $ini->removeValue($prop, 'services');
            }
        }

        $modified = $ini->isModified() || $liveIni->isModified();

        // Save the ini file
        $ini->save();
        $liveIni->save();

        return $modified;
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
                jLog::log('error while sending email to admin: '.$e->getMessage(), 'error');
            }
        } else {
            if (!$sender && !$email) {
                jLog::log('Notification cannot be send: no sender email nor notification email have been configured', 'warning');
            } elseif (!$email) {
                jLog::log('Notification cannot be send: no notification email has been configured', 'warning');
            } elseif (!$sender) {
                jLog::log('Notification cannot be send: no sender email has been configured', 'warning');
            }
        }
    }
}
