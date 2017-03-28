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

/**
 * @deprecated  use lizmapProxy instead
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
        $http_code = null;

        // Proxy method : use curl or file_get_contents
        if($proxyMethod == 'curl' and extension_loaded("curl")){
            # With curl
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            $data = curl_exec($ch);
            $info = curl_getinfo($ch);
            $mime = $info['content_type'];
            $http_code = (int) $info['http_code'];
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
                if ( preg_match( '#^Content-Type:\s+([\w/\.+]+)(;\s+charset=(\S+))?#i', $header, $matches ) ){
                    $mime = $matches[1];
                    if ( count( $matches ) > 3 )
                $mime .= '; charset='.$matches[3];
                } else if ('HTTP/' === substr($header, 0, 5)) {
                    list($version, $code, $phrase) = explode(' ', $header, 3) + array('', FALSE, '');
            $http_code = (int) $code;
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

        return array($data, $mime, $http_code);
    }


    /**
    * Get data from map service or from the cache.
    * @param string $repository The repository.
    * @param string $project The project.
    * @param array $params Array of parameters.
    * @return array $data Normalized and filtered array.
    */
    static public function getServiceData( $repository, $project, $params ) {
        // Get cache if exists
        $keyParams = $params;
        if( array_key_exists( 'map', $keyParams ) ){
            unset($keyParams['map']);
        }
        ksort( $keyParams );
        $key = md5( serialize( $keyParams ) );

        $layers = str_replace(',', '_', $params['layers'] );
        $crs = preg_replace('#[^a-zA-Z0-9_]#', '_', $params['crs']);

        // Get repository data
        $ser = lizmap::getServices();
        $lrep = lizmap::getRepository( $repository );
        $lproj = lizmap::getProject( $repository.'~'.$project );

        // Change to true to put some information in debug files
        $debug = $ser->debugMode;

        // Read config file for the current project
        $layername = $params["layers"];
        $configLayers = $lproj->getLayers();
        $configLayer = null;
        if ( property_exists( $configLayers, $layername ) )
            $configLayers->$layername;

        // Set or get tile from the parent project in case of embedded layers
        if( $configLayer
            and property_exists($configLayer, 'sourceRepository')
            and property_exists($configLayer, 'sourceProject')
        ){
            $newRepository = (string)$configLayer->sourceRepository;
            $newProject = (string)$configLayer->sourceProject;
            $repository = $newRepository;
            $project = $newProject;
            $lrep = lizmap::getRepository($repository);
            $lproj = lizmap::getProject($repository.'~'.$project);
        }

        // Get tile cache virtual profile (tile storage)
        // And get tile if already in cache
        // --> must be done after checking that parent project is involved
        $profile = 'lizmapCache_'.$repository.'_'.$project.'_'.$layers.'_'.$crs;
        lizmapCache::createVirtualProfile( $repository, $project, $layers, $crs );
        $tile = jCache::get( $key, $profile );
        // Return tile if cache hit !
        if( $tile ){
            //~ jLog::log( 'cache hit !');
            return $tile;
        }

        // Has the user asked for cache for this layer ?
        $string2bool = array('false'=>False, 'False'=>False, 'True'=>True, 'true'=>True);
        $useCache = False;
        if ( $configLayer )
            $string2bool[$configLayer->cached];
        // Avoid using cache for requests concerning not square tiles or too big
        // Focus on real web square tiles
        $wmsClient = 'web';
        if( $useCache
            and $params['width'] != $params['height']
            and ( $params['width'] > 300 or $params['height'] > 300)
        ){
            $wmsClient = 'gis';
            $useCache = False;
        }

        // ***************************
        // No cache hit : need to ask the tile from QGIS Server
        // ***************************

        // Construction of the WMS url : base url + parameters
        $url = $ser->wmsServerURL.'?';

        // Add project path into map parameter
        $params["map"] = realpath($lrep->getPath()) . '/' . $lproj->getKey() . ".qgs";

        // Metatile : if needed, change the bbox
        // Avoid metatiling when the cache is not active for the layer
        $metatileSize = '1,1';
        if($configLayer and property_exists($configLayer, 'metatileSize'))
            if(preg_match('#^[3579],[3579]$#', $configLayer->metatileSize))
                $metatileSize = $configLayer->metatileSize;

        # Metatile buffer
        $metatileBuffer = 5;

        // Also checks if gd is installed
        if($metatileSize and $useCache and $wmsClient == 'web'
        and extension_loaded('gd') && function_exists('gd_info')){
            # Metatile Size
            $metatileSizeExp = explode(',', $metatileSize);
            $metatileSizeX = (int) $metatileSizeExp[0];
            $metatileSizeY = (int) $metatileSizeExp[1];

            # Get requested bbox
            $bboxExp = explode(',', $params['bbox']);
            $width = $bboxExp[2] - $bboxExp[0];
            $height = $bboxExp[3] - $bboxExp[1];
            # Calculate factors
            $xFactor = (int)($metatileSizeX / 2);
            $yFactor = (int)($metatileSizeY / 2);
            # Calculate the new bbox
            $xmin = $bboxExp[0] - $xFactor * $width - $metatileBuffer * $width / $params["width"];
            $ymin = $bboxExp[1] - $yFactor * $height - $metatileBuffer * $height / $params["height"];
            $xmax = $bboxExp[2] + $xFactor * $width + $metatileBuffer * $width / $params["width"];
            $ymax = $bboxExp[3] + $yFactor * $height + $metatileBuffer * $height / $params["height"];
            # Replace request bbox by metatile bbox
            $params["bbox"] = "$xmin,$ymin,$xmax,$ymax";

            # Keep original param value
            $originalParams = array("width"=>$params["width"], "height"=>$params["height"]);
            # Replace width and height before requesting the image from qgis
            $params["width"] = $metatileSizeX * $params["width"] + 2 * $metatileBuffer;
            $params["height"] = $metatileSizeY * $params["height"] + 2 * $metatileBuffer;
        }

        // Build params before send the request to Qgis
        $builtParams = http_build_query($params);
        // Replace needed characters (not needed for php >= 5.4, just use the 4th parameter of the method http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');
        $builtParams = str_replace($a, $b, $builtParams);

        // Get data from the map server
        $proxyMethod = $ser->proxyMethod;
        $getRemoteData = lizmapCache::getRemoteData($url . $builtParams, $proxyMethod, $debug);
        $data = $getRemoteData[0];
        $mime = $getRemoteData[1];

        if ( $useCache && !preg_match('/^image/',$mime) )
            $useCache = False;

        // Metatile : if needed, crop the metatile into a single tile
        // Also checks if gd is installed
        if($metatileSize and $useCache and $wmsClient == 'web'
        and extension_loaded('gd') && function_exists('gd_info')){

            # Save original content into an image var
            $original = imagecreatefromstring($data);

            # crop parameters
            $newWidth = (int)($originalParams["width"]); // px
            $newHeight = (int)($originalParams["height"]); // px
            $positionX = (int)($xFactor * $originalParams["width"]) + $metatileBuffer; // left translation of 30px
            $positionY = (int)($yFactor * $originalParams["height"]) + $metatileBuffer; // top translation of 20px

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


        // Store into cache if needed
        if( $useCache ) {
            //~ jLog::log( ' Store into cache');
            $cacheExpiration = (int)$ser->cacheExpiration;
            if(property_exists($configLayer, 'cacheExpiration'))
                $cacheExpiration = (int)$configLayer->cacheExpiration;

            jCache::set( $key, $data, $cacheExpiration, $profile );
        }

        return $data;
    }


    static public function createVirtualProfile( $repository, $project, $layers, $crs ) {

        // Set cache configuration
        $cacheName = 'lizmapCache_'.$repository.'_'.$project.'_'.$layers.'_'.$crs;
        // Storage type
        $ser = lizmap::getServices();
        $cacheStorageType = $ser->cacheStorageType;
        // Expiration time : take default one
        $cacheExpiration = (int)$ser->cacheExpiration;

        // Cache root directory
        $cacheRootDirectory = $ser->cacheRootDirectory;
        if(!is_dir($cacheRootDirectory) or !is_writable($cacheRootDirectory)){
            $cacheRootDirectory = sys_get_temp_dir();
        }

        if($cacheStorageType == 'file'){
            // CACHE CONTENT INTO FILE SYSTEM
            // Directory where to store the cached files
            $cacheDirectory = $cacheRootDirectory.'/'.$repository.'/'.$project.'/'.$layers.'/'.$crs.'/';

            // Create directory if needed
            jFile::createDir($cacheDirectory);

            // Virtual cache profile parameter
            $cacheParams = array(
                "driver"=>"file",
                "cache_dir"=>$cacheDirectory,
                "file_locking"=>True,
                "directory_level"=>"5",
                "file_name_prefix"=>"lizmap_",
                "ttl"=>$cacheExpiration
            );

            // Create the virtual cache profile
            jProfiles::createVirtualProfile('jcache', $cacheName, $cacheParams);

        }else{
            // CACHE CONTENT INTO SQLITE DATABASE

            // Directory where to store the sqlite database
            $cacheDirectory = $cacheRootDirectory.'/'.$repository.'/'.$project.'/';
            jFile::createDir($cacheDirectory); // Create directory if needed
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
                "base64encoding"=> true
            );

            // Create the virtual cache profile
            jProfiles::createVirtualProfile('jcache', $cacheName, $cacheParams);
        }
    }




}
