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


class lizmapConfig{

  // Lizmap configuration file path (relative to the path folder)
  private $lizmapConfigFile = 'config/lizmapConfig.ini.php';
  // Lizmap configuration data
  public $lizmapConfigData = array();
  
  // SERVICES
  // services properties
  public $servicesPropertyList = array('wmsServerURL', 'cacheServerURL', 'defaultRepository');
  // Wms map server
  public $wmsServerURL = '';
  // map cache server
  public $cacheServerURL = '';
  // default repository
  public $defaultRepository = '';

  // REPOSITORIES
  // repository list
  public $repositoryList = array();
  // repository count
  public $repositoryCount = 0;
  // list of properties of one repository
  public $repositoryPropertyList = array('label', 'path');
  // repository data
  public $repositoryData = array();
  // selected repository
  public $repositoryKey = '';


  /**
  * Constructor of lizmapConfig.
  * Sets serveral public properties.
  * @param string $repository Name of the repository to instaciate (optional).
  * @param boolean $new If true, create a new empty repository.
  */
  public function __construct ($repository, $new=false){
    
    // read the lizmap configuration file
    $readConfigPath = parse_ini_file(jApp::varPath().$this->lizmapConfigFile, True);
    $this->lizmapConfigData = $readConfigPath;
    
    // set generic parameters
    foreach($this->servicesPropertyList as $prop)
      $this->$prop = $readConfigPath['services'][$prop];
      
    // Create the repository if needed
    if($new and $repository)
      $this->createRepository($repository);
    
    // Get the repository data
    if(!$repository)
      $repository = $this->defaultRepository;
    $this->getRepositoryData($repository);
    
    // Get the list of repositories
    $this->getRepositoryList();
    
  }

  
  /**
  * Get the data for one repository
  * @param string $repository Name of the repository.
  *
  */
  function getRepositoryData($repository){
  
    // Section
    $repositorySection = 'repository:' . $repository;
    
    // Check if repository exists in the ini file
    if(array_key_exists($repositorySection, $this->lizmapConfigData)){
      // set the repository
      $this->repositoryKey = $repository;
      // Set each property
      foreach($this->repositoryPropertyList as $property){
        $this->repositoryData[$property] = $this->lizmapConfigData[$repositorySection][$property];
        // If current property is the path, check if relative or absolute
        if($property == 'path')
          if ($this->repositoryData[$property][0] != '/')
            $this->repositoryData[$property] = jApp::varPath().$this->repositoryData[$property];
      }
    }else{
      // Else get the default repository
      $this->getRepositoryData($this->defaultRepository);
    }
  }
  
  
  /**
  * Get a list of repository names.
  *
  */
  function getRepositoryList(){
    $repositoryList = array();
    foreach($this->lizmapConfigData as $section=>$data){
      $match = preg_match('#(^repository:)#', $section, $matches);
      if(isset($matches[0]))
        $repositoryList[] = str_replace($matches[0], '', $section);
    }
    $this->repositoryList = $repositoryList;
  }
  
  
  
  /**
  * Modify the repository.
  * @param array $data Array containing the data of the repository.
  */
  function modifyRepository($data){
    $modified = false;
    
    // Modify properties
    foreach($this->repositoryPropertyList as $prop)
      $this->repositoryData[$prop] = $data[$prop];
      
    // Get access to the ini file
    $iniFile = jApp::configPath('lizmapConfig.ini.php');
    $ini = new jIniFileModifier($iniFile);
    
    // Set section
    $section = 'repository:'.$this->repositoryKey;
    
    // Modify the ini data for the repository    
    foreach($data as $k=>$v){
      if(in_array($k, $this->repositoryPropertyList)){
        // Set values in ini file
        $ini->setValue($k, $v, $section);
        // Modify lizmapConfigData
        $this->lizmapConfigData[$section][$k] = $v;
        $modified = true;      
      }
    }
    
    // Save the ini file
    if($modified)
      $ini->save();
  }
  
  
  /**
  * Create a new empty repository.
  * @param string $key key of the repository.
  */
  function createRepository($key){
    
    // Check if repository does not exists
    if(in_array($key, $this->repositoryList))
      return false;
      
    // Set properties
    $this->repositoryKey = $key;
    $this->repositoryList[] = $key;
      
    // Set empty data
    $data = array();
    foreach($this->repositoryPropertyList as $prop)
      $data[$prop] = "";
      
    // Modify repository data
    $this->modifyRepository($data);
    
  }

  
  /**
  * Remove a repository.
  * @param string $key key of the repository.
  */
  static function removeRepository($key){
    
    $return = false;
    // Get access to the ini file
    $iniFile = jApp::configPath('lizmapConfig.ini.php');
    $ini = new jIniFileModifier($iniFile);
      
    // Remove the section corresponding to the repository
    $section = 'repository:'.$key;
    if($ini->isSection($section)){
      $ini->removeValue(null, $section);
      $ini->save();
      $return = true;
    }
    return $return;
    
  }  
  
  
  /**
  * Modify the services.
  * @param array $data Array containing the data of the services.
  */
  function modifyServices($data){
    $modified = false;
      
    // Get access to the ini file
    $iniFile = jApp::configPath('lizmapConfig.ini.php');
    $ini = new jIniFileModifier($iniFile);
    
    // Set section
    $section = 'services';
    
    // Modify the ini data for the section    
    foreach($data as $k=>$v){
      if(in_array($k, $this->servicesPropertyList)){
        // Set values in ini file
        $ini->setValue($k, $v, $section);
        // Modify lizmapConfigData
        $this->lizmapConfigData[$section][$k] = $v;
        $this->$k = $v;
        $modified = true;      
      }
    }
    
    // Save the ini file
    if($modified)
      $ini->save();
  }  
}
