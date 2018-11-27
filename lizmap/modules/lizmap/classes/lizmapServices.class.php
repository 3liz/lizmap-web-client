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

    // Lizmap configuration file path (relative to the path folder)
    private $config = 'config/lizmapConfig.ini.php';
    // Lizmap configuration data
    private $data = array();

    // services properties
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
      'proxyMethod',
      'debugMode',
      'cacheRootDirectory',
      'cacheRedisHost',
      'cacheRedisPort',
      'cacheRedisDb',
      'cacheRedisKeyPrefix',
      'allowUserAccountRequests',
      'adminContactEmail',
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
      'proxyMethod',
      'debugMode',
      'cacheRootDirectory',
      'cacheRedisHost',
      'cacheRedisPort',
      'cacheRedisDb',
      'cacheRedisKeyPrefix',
    );

    private $notEditableProperties = array(
        'cacheRedisKeyPrefixFlushMethod'
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
    // admin contact email
    public $googleAnalyticsID = '';

    public function __construct () {
      // read the lizmap configuration file
      $readConfigPath = parse_ini_file(jApp::varPath().$this->config, True);
      $this->data = $readConfigPath;

      // set generic parameters
      foreach($this->properties as $prop) {
        if(isset($readConfigPath['services'][$prop])) {
          $this->$prop = $readConfigPath['services'][$prop];
        }
      }
      foreach($this->notEditableProperties as $prop) {
        if(isset($readConfigPath['services'][$prop])) {
          $this->$prop = $readConfigPath['services'][$prop];
        }
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

    /**
     * Modify the services.
     * @param array $data Array containing the data of the services.
     */
    public function modify( $data ){
      $modified = false;
      foreach($data as $k=>$v){
        if(in_array($k, $this->properties)){
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
      if ( $modified )
        $modified = $this->save();
      return $modified;
    }

    /**
     * save the services.
     */
    public function save( ){
      // Get access to the ini file
      $iniFile = jApp::configPath('lizmapConfig.ini.php');
      $ini = new jIniFileModifier($iniFile);

      foreach($this->properties as $prop) {
        if($this->$prop != '')
          $ini->setValue($prop, $this->$prop, 'services');
        else
          $ini->removeValue($prop, 'services');
      }

      // Save the ini file
      $ini->save();
      return $ini->isModified();
    }
}
