<?php
/**
* Handle cache for map services.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class lizmapCache {


  /**
  * Normalize and filter request parameters.
  * @param array $params Array of parameters.
  * @return array $data Normalized and filtered array.
  */
  static public function normalizeParams($params){
  
    $data = array();

    // Filter and normalize the parameters of the request
    $paramsBlacklist = array('module', 'action', 'C', 'repository','project', 'cached');
    foreach($params as $key=>$val){
      if(!in_array($key, $paramsBlacklist)){
        $data[strtolower($key)] = $val;
      }
    }
    return $data;
  }


  /**
  * Get data from map service or from the cache.
  * @param string $repository The repository.
  * @param string $project The project.
  * @param array $params Array of parameters.
  * @param object $lizmapConfig Lizmap configuration object.
  * @param boolean $dataFromCache If true, get data from the cache, else from the map server.
  * @return array $data Normalized and filtered array.
  */
  static public function getServiceData( $repository, $project, $params, $lizmapConfig, $dataFromCache=true ) {


    // Return cache if asked
    if( $dataFromCache ) {
    
      // Set cache configuration
      $layers = str_replace(',', '_', $params['layers']);
      $crs = preg_replace('#[^a-zA-Z0-9_]#', '_', $params['crs']);
      $cacheName = 'lizmapCache_'.$repository.'_'.$project.'_'.$layers.'_'.$crs;
      $cacheStorageType = $lizmapConfig->cacheStorageType;
      $cacheExpiration = $lizmapConfig->cacheExpiration;
      
      if($cacheStorageType == 'file'){
        // CACHE CONTENT INTO FILE SYSTEM
        // Directory where to store the cached files
        $cacheDirectory = sys_get_temp_dir().'/'.$repository.'/'.$project.'/'.$layers.'/'.$crs.'/';
        
        // Create directory if needed
        if(!file_exists($cacheDirectory))
          mkdir($cacheDirectory, 0750, true);
        
        // Virtual cache profile parameter
        $cacheParams = array(
          "driver"=>"file",
          "ttl"=>$cacheExpiration,
          "cache_dir"=>$cacheDirectory,
          "file_locking"=>True,
          "directory_level"=>"5",
          "directory_umask"=>"0750",
          "file_name_prefix"=>"lizmap_",
          "cache_file_umask"=>"0650"
        );
        
        // Create the virtual cache profile
        jProfiles::createVirtualProfile('jcache', $cacheName, $cacheParams);

      }else{
        // CACHE CONTENT INTO SQLITE DATABASE
        
        // Directory where to store the sqlite database
        $cacheDirectory = sys_get_temp_dir().'/'.$repository.'/'.$project.'/';
        if(!file_exists($cacheDirectory))
          mkdir($cacheDirectory, 0750, true); // Create directory if needed
        $cacheDatabase = $cacheDirectory.$layers.'_'.$crs.'.db';
        $cachePdoDsn = 'sqlite:'.$cacheDatabase;
        
        // Create database and populate with table if needed
        if(!file_exists($cacheDatabase))
          copy(jApp::varPath()."cacheTemplate.db", $cacheDatabase);
        
        // Virtual jdb profile corresponding to the layer database
        $jdbParams = array(
          "driver"=>"pdo",
          "ttl"=>$cacheExpiration,
          "dsn"=>$cachePdoDsn,
          "user"=>"cache",
          "password"=>"cache"
        );
        // Create the virtual jdb profile
        $cacheJdbName = "jdb_".$cacheName;
        jProfiles::createVirtualProfile('jdb', $cacheJdbName, $jdbParams);
        
        // Virtual cache profile parameter
        $cacheParams = array(
          "driver"=>"db",
          "dbprofile"=>$cacheJdbName
        );
        
        // Create the virtual cache profile
        jProfiles::createVirtualProfile('jcache', $cacheName, $cacheParams);
      }
      
      return jCache::call( 
        array('lizmapCache', __FUNCTION__ ), 
        array( $repository, $project, $params, $lizmapConfig, false ),
        $cacheExpiration, 
        $cacheName
      );
    }



    // Construction of the WMS url : base url + parameters
    $url = $lizmapConfig->wmsServerURL.'?';

    // Add project path into map parameter
    $params["map"] = $lizmapConfig->repositoryData['path'].$project.".qgs";
    $builtParams = http_build_query($params);
    
    // Replace needed characters (not needed for php >= 5.4, just use the 4th parameter of the method http_build_query) 
    $a = array('+', '_', '.', '-');
    $b = array('%20', '%5F', '%2E', '%2D');
    $builtParams = str_replace($a, $b, $builtParams);
    
    // Get data from the map server using Curl
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_URL, $url . $builtParams);
    curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false );
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $content = curl_exec($ch);
#    $content = $url . $builtParams;
    $response = curl_getinfo($ch);
    $mimetype = $response['content_type'];
    curl_close($ch);
       
    return $content;  
  }






}
