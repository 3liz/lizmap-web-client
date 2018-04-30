<?php
/**
* Manage and give access to lizmap configuration.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


class lizmapServices{

    /**
     * Lizmap configuration data from lizmapConfig.ini.php
     * This allow to access to configuration properties that are not exposed
     * via properties member for this class
     */
    private $data = array();

    /**
     * List of all properties of lizmapServices that should be retrieved
     * from lizmapConfig.ini.php or from the main configuration
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
      'rootRepositories',
      'relativeWMSPath',
      'proxyMethod',
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
      'googleAnalyticsID'
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
        'cacheRedisKeyPrefixFlushMethod'
    );

    /**
     * List of properties mapped to a parameter of the main configuration of Jelix
     * @var array
     */
    private $globalConfigProperties = array(
        // property name => array(ini parameter name, ini section name)
        'allowUserAccountRequests' => array('registrationEnabled', 'jcommunity'),
        'adminSenderEmail' => array('webmasterEmail', 'mailer'),
        'adminSenderName' => array('webmasterName', 'mailer'),
    );


    // Wms map server
    public $appName = 'Lizmap';
    // QGIS Server version
    public $qgisServerVersion = '2.14';
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
    // display all project in maps
    public $allInMap = '';
    // Root folder of repositories
    public $rootRepositories = '';
    // Does the server use relative Path from root folder?
    public $relativeWMSPath = '0';
    // proxy method : use curl or file_get_contents
    public $proxyMethod = '';
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

    public function __construct () {
      // read the lizmap configuration file
      $readConfigPath = parse_ini_file(jApp::configPath('lizmapConfig.ini.php'), True);
      $this->data = $readConfigPath;
      $globalConfig = jApp::config();

      // set generic parameters
      foreach($this->properties as $prop) {
        if (isset($this->globalConfigProperties[$prop])) {
          list($key, $section) = $this->globalConfigProperties[$prop];
          if (isset($globalConfig->$section)) {
              $conf = & $globalConfig->$section;
          }
          if (isset($conf[$key])) {
            $this->$prop = $conf[$key];
          }
        }
        else if(isset($readConfigPath['services'][$prop])) {
          $this->$prop = $readConfigPath['services'][$prop];
        }
      }

      foreach($this->notEditableProperties as $prop) {
        if(isset($readConfigPath['services'][$prop])) {
          $this->$prop = $readConfigPath['services'][$prop];
        }
      }

      $sender = filter_var($globalConfig->mailer['webmasterEmail'], FILTER_VALIDATE_EMAIL);
      if (!$sender) {
          // if the sender email is not configured, deactivate features that
          // need to send an email
          $this->allowUserAccountRequests = false;
      }
    }

    public function getProperties(){
      return $this->properties;
    }

    public function hideSensitiveProperties(){
      if ( isset($this->data['hideSensitiveServicesProperties']) && $this->data['hideSensitiveServicesProperties'] != '0')
        return true;
      return false;
    }

    public function getSensitiveProperties(){
      return $this->sensitiveProperties;
    }

    public function getRootRepositories(){
        $rootRepositories = $this->rootRepositories;

        if ( $rootRepositories != '' ) {
            // if path is relative, get full path
            if ($rootRepositories[0] != '/' and $rootRepositories[1] != ':')
                $rootRepositories = realpath( jApp::varPath().$rootRepositories );
            // add a trailing slash if needed
            if( !preg_match('#/$#', $rootRepositories ))
                $rootRepositories .= '/';
        }
        return $rootRepositories;
    }

    public function isRelativeWMSPath(){
      if ( $this->relativeWMSPath != '0')
        return true;
      return false;
    }

    /**
     * Modify the services.
     * @param array $data Array containing the data of the services.
     */
    public function modify( $data ){
      $modified = false;
      $globalConfig = jApp::config();
      foreach($data as $k=>$v){
        if (isset($this->globalConfigProperties[$k])) {
          list($key, $section) = $this->globalConfigProperties[$k];
          if (!isset($globalConfig->$section)) {
            $globalConfig->$section = array();
          }
          $conf = & $globalConfig->$section;
          $conf[$key] = $v;
          $this->$k = $v;
          $modified = true;
        }
        else if(in_array($k, $this->properties)){
          $this->data['services'][$k] = $v;
          $this->$k = $v;
          $modified = true;
        }
      }
      return $modified;
    }

    /**
     * Update the services. (modify and save)
     * @param array $data Array containing the data of the services.
     */
    public function update( $data ){
      $modified = $this->modify( $data );
      if ($modified)
        $modified = $this->save();
      return $modified;
    }

    /**
     * save the services.
     */
    public function save( ){
      // Get access to the ini file
      $ini = new jIniFileModifier(jApp::configPath('lizmapConfig.ini.php'));
      $localIni = new jIniFileModifier(jApp::configPath('localconfig.ini.php'));

      foreach($this->properties as $prop) {
        if (isset($this->globalConfigProperties[$prop])) {
          list($key, $section) = $this->globalConfigProperties[$prop];
          $localIni->setValue($key, $this->$prop, $section);
        }
        else if ($this->$prop != '') {
          $ini->setValue($prop, $this->$prop, 'services');
        }
        else {
          $ini->removeValue($prop, 'services');
        }
      }

      $modified = $ini->isModified() || $localIni->isModified();

      // Save the ini file
      $ini->save();
      $localIni->save();
      return $modified;
    }

    function sendNotificationEmail($subject, $body) {
        $email = filter_var($this->adminContactEmail, FILTER_VALIDATE_EMAIL);
        $sender = filter_var($this->adminSenderEmail, FILTER_VALIDATE_EMAIL);
        if ($email && $sender) {
            $mail = new jMailer();
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->AddAddress( $email, 'Lizmap Notifications');
            try{
                $mail->Send();
            }
            catch(Exception $e){
                jLog::log('error while sending email to admin: '. $e->getMessage(), 'error');
            }
        }
        else {
            if (!$sender && !$email) {
                jLog::log('Notification cannot be send: no sender email nor notification email have been configured', 'warning');
            }
            else if (!$email) {
                jLog::log('Notification cannot be send: no notification email has been configured', 'warning');
            }
            else if (!$sender) {
                jLog::log('Notification cannot be send: no sender email has been configured', 'warning');
            }
        }
    }
}
