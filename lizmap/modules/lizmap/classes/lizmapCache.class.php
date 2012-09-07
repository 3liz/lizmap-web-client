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

  static public function getServiceData( $repository, $project, $params, $lizmapConfig, $dataFromCache=true ) {

    // Return cache if asked
    if( $dataFromCache ) {
    
      // Set cache configuration
      $layers = str_replace(',', '_', $params['LAYERS']);
      $crs = preg_replace('#[^a-zA-Z0-9_]#', '_', $params['CRS']);
      $cacheName = 'lizmapCache_'.$repository.'_'.$project.'_'.$layers.'_'.$crs;
      $cacheStorageType = $lizmapConfig->cacheStorageType;
      
      if($cacheStorageType == 'file'){
        // CACHE CONTENT INTO FILE SYSTEM
        // Directory where to store the cached files
        $cacheDirectory = sys_get_temp_dir().'/'.$repository.'/'.$project.'/'.$layers.'/'.$crs.'/';
        
        // Create directory if needed
        mkdir($cacheDirectory, 0750, true);
        
        // Virtual cache profile parameter
        $cacheParams = array(
          "driver"=>"file",
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
        null, 
        $cacheName
      );
    }

    // Get data from map server

    // Get the parameters of the request
    $data = array("map"=>$lizmapConfig->repositoryData['path'].$project.".qgs");
    
    // Filter them
    $paramsBlacklist = array('module', 'action', 'C', 'repository','project', 'cached');
    foreach($params as $key=>$val){
      if(!in_array($key, $paramsBlacklist)){
        $data[$key] = $val;
      }
    }

    // Construction of the WMS url : base url + parameters
    $url = $lizmapConfig->wmsServerURL.'?';
    $bdata = http_build_query($data);
    
    // Replace needed characters (not needed for php >= 5.4, just use the 4th parameter of the method http_build_query) 
    $a = array('+', '_', '.', '-');
    $b = array('%20', '%5F', '%2E', '%2D');
    $bdata = str_replace($a, $b, $bdata);
    
    // Get data from the map server using Curl
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_URL, $url . $bdata);
    curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false );
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $content = curl_exec($ch);
#    $content = $url . $bdata;
    $response = curl_getinfo($ch);
    curl_close($ch);
    
    return $content;
  
  }

}
