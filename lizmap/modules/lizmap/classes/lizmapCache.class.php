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
    $paramsBlacklist = array('module', 'action', 'C', 'repository','project');
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

    // Read config file for the current project
    $configPath = $lizmapConfig->repositoryData['path'].$project.'.qgs.cfg';
    $configRead = jFile::read($configPath);
    $configOptions = json_decode($configRead)->options;
    $layername = $params["layers"];
    $configLayer = json_decode($configRead)->layers->$layername;

    // Table to transform boolean string into boolean
    $string2bool = array('false'=>False, 'False'=>False, 'True'=>True, 'true'=>True);

    // Return cache if asked
    if($dataFromCache)
      $dataFromCache = $string2bool[$configLayer->cached];

    if($dataFromCache) {
      // Set cache configuration
      $layers = str_replace(',', '_', $params['layers']);
      $crs = preg_replace('#[^a-zA-Z0-9_]#', '_', $params['crs']);
      $cacheName = 'lizmapCache_'.$repository.'_'.$project.'_'.$layers.'_'.$crs;
      $cacheStorageType = $lizmapConfig->cacheStorageType;
      $cacheExpiration = (int)$lizmapConfig->cacheExpiration;

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

    // Metatile : if needed, change the bbox
    $metatileSize = False;
    if(property_exists($configLayer, 'metatileSize'))
      $metatileSize = $configLayer->metatileSize;
    if($metatileSize and $string2bool[$configLayer->cached]){
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

    // Metatile : if needed, crop the metatile into a single tile
    if($metatileSize and $string2bool[$configLayer->cached]){

      # Save curl content into an image var
      $original = imagecreatefromstring($content);

      # crop parameters
      $newWidth = (int)($originalParams["width"]); // px
      $newHeight = (int)($originalParams["height"]); // px
      $positionX = (int)($xFactor * $originalParams["width"]); // left translation of 30px
      $positionY = (int)($yFactor * $originalParams["height"]); // top translation of 20px

      # create new gd image
      $image = imageCreateTrueColor($newWidth, $newHeight);

      # save transparency if needed
      if(preg_match('#png#', $params['format'])){
        imagesavealpha($orginal, true);
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
      $content = ob_get_contents(); // read from buffer
      ob_end_clean(); // delete buffer

      // Destroy image handlers
      imagedestroy($original);
      imagedestroy($image);
    }

    return $content;
  }






}
