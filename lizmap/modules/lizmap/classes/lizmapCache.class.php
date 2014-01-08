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
    $paramsBlacklist = array('module', 'action', 'c', 'repository','project');
    foreach($params as $key=>$val){
      if(!in_array(strtolower($key), $paramsBlacklist)){
        $data[strtolower($key)] = $val;
      }
    }

    // Sort parameters by key
    ksort($data);

    // Round bbox params to avoid rounding issues with cache
    if (array_key_exists('bbox', $data)) {
      $bboxExp = explode(',', $data['bbox']);
      $nBbox = array();
      foreach($bboxExp as $val){
        $val = (float)$val;
        $val = round($val, 6);
        $nBbox[] = str_replace(',', '.', (string)$val);
      }
      $data['bbox'] = implode(',', $nBbox);
    }

    return $data;
  }


  /**
  * Get remote data from URL, with curl or internal php functions.
  * @param string $url Url of the remote data to fetch.
  * @param boolean $proxyMethod Method for the proxy : 'php' (default) or 'curl'.
  * @return array($data, $mime) Array containing the data and the mime type.
  */
  static public function getRemoteData($url, $proxyMethod='php', $debug=0){

    // Initialize responses
    $data = '';
    $mime = '';

    // Proxy method : use curl or file_get_contents
    if($proxyMethod == 'curl' and extension_loaded("curl")){
      # With curl
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_HEADER, 0);
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false );
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
      $data = curl_exec($ch);
      $info = curl_getinfo($ch);
      $mime = $info['content_type'];
      // Optionnal debug
      if($debug or curl_errno($ch))
      {
        jLog::log('--> CURL: ' .json_encode($info));
      }

      curl_close($ch);
    }
    else{
      # With file_get_contents
      $data = file_get_contents($url);
      $mime = 'image/png';
      $matches = array();
      $info = $url . ' --> PHP: ';
      foreach ($http_response_header as $header){
        if (preg_match( '#Content-Type:\s+([\w/+]+)(;\s+charset=(\S+))?#i', $header, $matches )){
          $mime = $matches[1];
        }
        // optional debug
        if($debug){
          $info.= ' '.$header;
        }
      }
      if($debug)
      {
        jLog::log(json_encode($info));
      }
    }

    return array($data, $mime);
  }


  /**
  * Get data from map service or from the cache.
  * @param string $repository The repository.
  * @param string $project The project.
  * @param array $params Array of parameters.
  * @param boolean $avoidCache If true, get data from Qgis server (used by the jCache::call method when cache not found ).
  * @return array $data Normalized and filtered array.
  */
  static public function getServiceData( $repository, $project, $params, $avoidCache=false ) {

    // Get repository data
    $ser = lizmap::getServices();
    $lrep = lizmap::getRepository($repository);
    $lproj = lizmap::getProject($repository.'~'.$project);

    // Change to true to put some information in debug files
    $debug = $ser->debugMode;

    // Read config file for the current project
    $layername = $params["layers"];
    $configLayers = $lproj->getLayers();
    $configLayer = $configLayers->$layername;

    // Table to transform boolean string into boolean
    $string2bool = array('false'=>False, 'False'=>False, 'True'=>True, 'true'=>True);

    // request key data
    $layers = str_replace(',', '_', $params['layers']);
    $crs = preg_replace('#[^a-zA-Z0-9_]#', '_', $params['crs']);

    // Return cache if asked
    $dataFromCache = False;
    // If the method has not been initiated by the jCache::call method (with avoidCache=False):
    // Test if the user wants the cache for this layer
    if(!$avoidCache)
      $dataFromCache = $string2bool[$configLayer->cached];

    // Test if the client asks for small and square tiles
    // if not it is a classical qgis -> avoid cache and metatile
    $wmsClient = 'web';
    if($params['width'] != $params['height'] and ($params['width'] > 300 or $params['height'] > 300)){
      $wmsClient = 'gis';
      // Avoid cache
      if($dataFromCache)
        $dataFromCache = False;
    }


    if($dataFromCache) {

      // Set cache configuration
      $cacheName = 'lizmapCache_'.$repository.'_'.$project.'_'.$layers.'_'.$crs;
      // Storage type
      $cacheStorageType = $ser->cacheStorageType;
      // Expiration time : take default one or layer specified
      $cacheExpiration = (int)$ser->cacheExpiration;
      if(property_exists($configLayer, 'cacheExpiration'))
        $cacheExpiration = (int)$configLayer->cacheExpiration;
      // Cache root directory
      $cacheRootDirectory = $ser->cacheRootDirectory;
      if(!is_writable($cacheRootDirectory) or !is_dir($cacheRootDirectory)){
        $cacheRootDirectory = sys_get_temp_dir();
      }

      if($cacheStorageType == 'file'){
        // CACHE CONTENT INTO FILE SYSTEM
        // Directory where to store the cached files
        $cacheDirectory = $cacheRootDirectory.'/'.$repository.'/'.$project.'/'.$layers.'/'.$crs.'/';

        // Create directory if needed
        if(!file_exists($cacheDirectory))
          mkdir($cacheDirectory, 0750, true);

        // Virtual cache profile parameter
        $cacheParams = array(
          "driver"=>"file",
          "cache_dir"=>$cacheDirectory,
          "file_locking"=>True,
          "directory_level"=>"5",
          "directory_umask"=>"0750",
          "file_name_prefix"=>"lizmap_",
          "cache_file_umask"=>"0650",
          "ttl"=>$cacheExpiration
        );

        // Create the virtual cache profile
        jProfiles::createVirtualProfile('jcache', $cacheName, $cacheParams);

      }else{
        // CACHE CONTENT INTO SQLITE DATABASE

        // Directory where to store the sqlite database
        $cacheDirectory = $cacheRootDirectory.'/'.$repository.'/'.$project.'/';
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
          "dbprofile"=>$cacheJdbName,
          "ttl"=>$cacheExpiration,
        );

        // Create the virtual cache profile
        jProfiles::createVirtualProfile('jcache', $cacheName, $cacheParams);
      }

      // Call the cache : if not found, this method will use the method getServiceData with last param to false to force request to qgis
      return jCache::call(
        array('lizmapCache', __FUNCTION__ ),
        array( $repository, $project, $params, true ),
        $cacheExpiration,
        $cacheName
      );
    }

    // Log when no cache hit
    if($debug and $avoidCache){
      error_log(
        date(DATE_RFC822).': '.md5(serialize(array('lizmapCache', __FUNCTION__ )).serialize(array( $repository, $project, $params, true ))).', BBOX='.$params['bbox'].'
',
        3,
        sys_get_temp_dir().'/'.$repository.'/'.$project.'/'.$layers.'_'.$crs.'.log'
      );
    }



    // Construction of the WMS url : base url + parameters
    $url = $ser->wmsServerURL.'?';

    // Add project path into map parameter
    $params["map"] = $lrep->getPath().$lproj->getKey().".qgs";

    // Metatile : if needed, change the bbox
    // Avoid metatiling when the cache is not active for the layer
    $metatileSize = False;
    if(property_exists($configLayer, 'metatileSize'))
      if(preg_match('#^[3579],[3579]$#', $configLayer->metatileSize))
        $metatileSize = $configLayer->metatileSize;

    // Also checks if gd is installed
    if($metatileSize and $string2bool[$configLayer->cached] and $wmsClient == 'web'
    and extension_loaded('gd') && function_exists('gd_info')){
      # Metatile Size
      $metatileSizeExp = explode(',', $metatileSize);
      $metatileSizeX = (int) $metatileSizeExp[0];
      $metatileSizeY = (int) $metatileSizeExp[1];

      # Metatile buffer
      $metatileBuffer = 0;

      # Get requested bbox
      $bboxExp = explode(',', $params['bbox']);
      $width = $bboxExp[2] - $bboxExp[0];
      $height = $bboxExp[3] - $bboxExp[1];
      # Calculate factors
      $xFactor = (int)($metatileSizeX / 2);
      $yFactor = (int)($metatileSizeY / 2);
      # Calculate the new bbox
      $xmin = $bboxExp[0] - $xFactor * $width - $metatileBuffer;
      $ymin = $bboxExp[1] - $yFactor * $height - $metatileBuffer;
      $xmax = $bboxExp[2] + $xFactor * $width + $metatileBuffer;
      $ymax = $bboxExp[3] + $yFactor * $height + $metatileBuffer;
      # Replace request bbox by metatile bbox
      $params["bbox"] = "$xmin,$ymin,$xmax,$ymax";

      # Keep original param value
      $originalParams = array("width"=>$params["width"], "height"=>$params["height"]);
      # Replace width and height before requesting the image from qgis
      $params["width"] = $metatileSizeX * $params["width"];
      $params["height"] = $metatileSizeY * $params["height"];
    }

    // Build params before send the request to Qgis
    $builtParams = http_build_query($params);
    // Replace needed characters (not needed for php >= 5.4, just use the 4th parameter of the method http_build_query)
    $a = array('+', '_', '.', '-');
    $b = array('%20', '%5F', '%2E', '%2D');
    $builtParams = str_replace($a, $b, $builtParams);

    // Get data from the map server
    $lizmapCache = jClasses::getService('lizmap~lizmapCache');
    $proxyMethod = $ser->proxyMethod;
    $getRemoteData = $lizmapCache->getRemoteData($url . $builtParams, $proxyMethod, $debug);
    $data = $getRemoteData[0];
    $mime = $getRemoteData[1];

    // Metatile : if needed, crop the metatile into a single tile
    // Also checks if gd is installed
    if($metatileSize and $string2bool[$configLayer->cached] and $wmsClient == 'web'
    and extension_loaded('gd') && function_exists('gd_info')){

      # Save original content into an image var
      $original = imagecreatefromstring($data);

      # crop parameters
      $newWidth = (int)($originalParams["width"]); // px
      $newHeight = (int)($originalParams["height"]); // px
      $positionX = (int)($xFactor * $originalParams["width"]); // left translation of 30px
      $positionY = (int)($yFactor * $originalParams["height"]); // top translation of 20px

      # create new gd image
      $image = imageCreateTrueColor($newWidth, $newHeight);

      # save transparency if needed
      if(preg_match('#png#', $params['format'])){
        imagesavealpha($original, true);
        imagealphablending($image, false);
        $color = imagecolortransparent($image, imagecolorallocatealpha($image, 0, 0, 0, 127));
        imagefill($image, 0, 0, $color);
        imagesavealpha($image, true);
      }

      # crop image
      imagecopyresampled($image, $original, 0, 0, $positionX, $positionY, $newWidth, $newHeight, $newWidth, $newHeight);

      # Output the image as a string (use PHP buffering)
      ob_start();
      if(preg_match('#png#', $params['format']))
        imagepng($image, null);
      else
        imagejpeg($image, null, 80);
      $data = ob_get_contents(); // read from buffer
      ob_end_clean(); // delete buffer

      // Destroy image handlers
      imagedestroy($original);
      imagedestroy($image);
    }

    return $data;
  }






}
