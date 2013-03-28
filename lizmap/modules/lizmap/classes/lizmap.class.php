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


class lizmap{
  
    // Lizmap configuration file path (relative to the path folder)
    protected static $lizmapConfig = 'config/lizmapConfig.ini.php';
    protected static $lizmapLogConfig = 'config/lizmapLogConfig.ini.php';

    // repositories
    protected static $repositories = array();
    
    // log items
    protected static $logItems = array();
    
    /**
     * this is a static class, so private constructor
     */
    private function __construct (){ }

    /**
     * 
     */
    public static function getServices (){
      return jClasses::getService('lizmap~lizmapServices');
    }

    /**
     * Get a list of repository names.
     *
     */
    public static function getRepositoryList(){
      // read the lizmap configuration file
      $readConfigPath = parse_ini_file(jApp::varPath().self::$lizmapConfig, True);
      $repositoryList = array();
      foreach($readConfigPath as $section=>$data){
        $match = preg_match('#(^repository:)#', $section, $matches);
        if(isset($matches[0]))
          $repositoryList[] = str_replace($matches[0], '', $section);
      }
      self::$repositories = $repositoryList;
      return self::$repositories;
    }

    /**
     * Get the list of properties for a generic repository.
     *
     */
    public static function getRepositoryProperties(){
      jClasses::inc('lizmap~lizmapRepository');
      return lizmapRepository::$properties;
    }
    

    /**
     * Get a repository
     * @param string $key Key of the repository to get
     *
     */
    public static function getRepository ($key){
      if ( !in_array($key, self::$repositories) )
        if ( !in_array($key, self::getRepositoryList()) )
          return null;

      jClasses::inc('lizmap~lizmapRepository');
      return new lizmapRepository($key);
    }


    /**
     * Create a repository
     */
    public static function createRepository ($key, $data){
      if ( in_array($key, self::$repositories)
        || in_array($key, self::getRepositoryList()) )
        return null;

      jClasses::inc('lizmap~lizmapRepository');
      $rep = new lizmapRepository($key);
      $rep->update( $data );
      self::getRepositoryList();
      return $rep;
    }

    /**
     * Removes a repository
     */
    public static function removeRepository ($key){
      if ( !in_array($key, self::$repositories) )
        if ( !in_array($key, self::getRepositoryList()) )
          return false;

      // Get access to the ini file
      $iniFile = jApp::configPath('lizmapConfig.ini.php');
      $ini = new jIniFileModifier($iniFile);

      // Remove the section corresponding to the repository
      $section = 'repository:'.$key;
      if($ini->isSection($section)){
        $ini->removeValue(null, $section);
        $ini->save();
        self::getRepositoryList();
        return true;
      }
      return false;
    }

    /**
     * Get a project
     */
    public static function getProject ($key){
      $match = preg_match('/(?P<rep>\w+)~(?P<proj>\w+)/', $key, $matches);
      if ( $match != 1 )
        return null;

      $rep = self::getRepository($matches['rep']);
      if ( $rep == null)
        return null;

      jClasses::inc('lizmap~lizmapProject');
      $proj = new lizmapProject($matches['proj'], $rep);
      if ( $proj->getKey() != $matches['proj'] )
        return null;
      return $proj;
    }
    
    
    /**
    * Get global configuration for logs
    */
    public static function getLogConfig(){
      return jClasses::getService('lizmap~lizmapLogConfig');
    }
    
    /**
     * Get a list of log items names.
     *
     */
    public static function getLogItemList(){
      // read the lizmap log configuration file
      $readConfigPath = parse_ini_file(jApp::varPath().self::$lizmapLogConfig, True);
      $logItemList = array();
      foreach($readConfigPath as $section=>$data){
        $match = preg_match('#(^item:)#', $section, $matches);
        if(isset($matches[0]))
          $logItemList[] = str_replace($matches[0], '', $section);
      }
      self::$logItems = $logItemList;
      return self::$logItems;
    }

    /**
     * Get the list of properties for a generic log item.
     *
     */
    public static function getLogItemProperties(){
      jClasses::inc('lizmap~lizmapLogItem');
      return lizmapLogItem::$properties;
    }
    

    /**
     * Get a log item
     * @param string $key Key of the log item to get
     *
     */
    public static function getLogItem ($key){
      if ( !in_array($key, self::$logItems) )
        if ( !in_array($key, self::getLogItemList()) )
          return null;

      jClasses::inc('lizmap~lizmapLogItem');
      return new lizmapLogItem($key);
    }
    
        
    
    
}
