<?php
/**
* Manage and give access to lizmap log item.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


class lizmapLogItem{

    // Lizmap log configuration file path (relative to the path folder)
    private $config = 'config/lizmapLogConfig.ini.php';

    // log item properties
    private static $properties = array(
      'label',
      'logCounter',
      'logDetail',
      'logIp',
      'logEmail'
    );

    // Log key
    private $key = '';

    // Log label
    private $label = '';

    // If a counter must be increased for this item
    private $logCounter = '';

    // If a new line must be added in the detail log
    private $logDetail = '';

    // If user IP address must be logged in the detail log
    private $logIp = '';

    // If an email must be sent to the admin contact
    private $logEmail = '';

    private $data = array();

    // log record keys
    private static $recordKeys = array(
      'key',
      'user',
      'content',
      'repository',
      'project',
      'ip',
      'email'
    );


    public function __construct ( $key ) {
      // read the lizmap log configuration file
      $readConfigPath = parse_ini_file(jApp::varPath().$this->config, True);

      $section = 'item:'.$key;

      // Check if this item exists in the ini file
      if(array_key_exists($section, $readConfigPath)){
        // Set each property
        foreach(self::$properties as $property){
          $this->data[$property] = $readConfigPath[$section][$property];
        }
      }
      $this->key = $key;

    }

    /**
    * Return log item key
    */
    public function getKey(){
      return $this->key;
    }

    /**
    * Return the array of properties
    */
    public function getProperties(){
      return self::$properties;
    }

    public static function getSProperties(){
        return self::$properties;
    }


    /**
    * Return the array of record keys
    */
    public function getRecordKeys(){
      return self::$recordKeys;
    }

    /**
    * Return data for a log item
    * @param string $key Key of the log item
    *
    */
    public function getData( $key ) {
      if ( !array_key_exists($key, $this->data) )
        return null;
      return $this->data[$key];
    }

    /**
    * Update the data for the log item in the ini file
    */
    public function update( $data ) {
      // Get access to the ini file
      $iniFile = jApp::configPath('lizmapLogConfig.ini.php');
      $ini = new jIniFileModifier($iniFile);

      // Set section
      $section = 'item:'.$this->key;

      $modified = false;
      // Modify the ini data for the repository
      foreach($data as $k=>$v){
        if(in_array($k, self::$properties)){
          // Set values in ini file
          $ini->setValue($k, $v, $section);
          // Modify lizmapConfigData
          $this->data[$k] = $v;
          $modified = true;
        }
      }

      // Save the ini file
      if($modified)
        $ini->save();
      return $modified;
    }


    /**
    * Insert a new line of log for this item
    */
    public function insertLogDetail( $data, $profile='lizlog'){

      $dao = jDao::get('lizmap~logDetail', $profile);
      $rec = jDao::createRecord('lizmap~logDetail', $profile);
      // Set the value for each column
      foreach(self::$recordKeys as $k){
        if(array_key_exists($k, $data))
          $rec->$k = $data[$k];
      }
      try{
        $dao->insert($rec);
      }catch(Exception $e){
        jLog::log('Error while inserting a new line in log_detail :'.$e->getMessage());
      }

    }

    /**
    * Increase counter for this log item
    */
    public function increaseLogCounter($repository='', $project='', $profile='lizlog'){

      $dao = jDao::get('lizmap~logCounter', $profile);

      if($rec = $dao->getDistinctCounter($this->key, $repository, $project)){
        $rec->counter += 1;
        try{
          $dao->update($rec);
        }catch(Exception $e){
          jLog::log('Error while updating a line in log_counter :'.$e->getMessage());
        }

      }else{
        $rec = jDao::createRecord('lizmap~logCounter', $profile);
        $rec->key = $this->key;
        if( $repository )
          $rec->repository = $repository;
        if( $project )
          $rec->project = $project;
        $rec->counter = 1;
        try{
          $dao->insert($rec);
        }catch(Exception $e){
          jLog::log('Error while inserting a new line in log_counter :'.$e->getMessage());
        }

      }

    }


}
