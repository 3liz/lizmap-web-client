<?php
/**
 * @package    jelix
 * @subpackage utils
 * @author      Bastien Jaillot
 * @contributor Dominique Papin, Lepeltier kévin (the author of the original plugin)
 * @contributor geekbay, Brunto, Laurent Jouanneau
 * @copyright   2007-2008 Lepeltier kévin, 2008 Dominique Papin, 2008 Bastien Jaillot, 2009 geekbay, 2010 Brunto, 2011-2018 Laurent Jouanneau
 * @link       http://www.jelix.org
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Utility class to manipulate image
 * @package    jelix
 * @subpackage utils
 * @static
 */
class jImageModifier {

    /**
     * params inducing transforms of source image
     * @var array
     */
    static protected $transformParams = array('width', 'height', 'maxwidth', 'maxheight', 'zoom', 'alignh',
        'alignv', 'ext', 'quality', 'shadow', 'scolor', 'sopacity', 'sblur',
        'soffset', 'sangle', 'background', 'omo');

    /**
     * params associated with html equivalent attributes
     * do not induce any transform of source image
     * @var array
     */
    static protected $attributeParams = array('alt', 'class', 'id', 'style', 'longdesc', 'name', 'ismap', 'usemap',
        'title', 'dir', 'lang', 'onclick', 'ondblclick', 'onmousedown',
        'onmouseup', 'onmouseover', 'onmousemove', 'onmouseout', 'onkeypress',
        'onkeydown', 'onkeyup', 'width', 'height');


    /**
     * retrieve an image from the combination of a source image and parameters
     *
     * parameters list
     * some induce transformations, some not
     *
     *
     * class :string
     * id :string
     * alt :string
     * width :uint
     * height :uint
     * maxwidth :uint only with maxheight
     * maxheight :uint only with maxwidth
     * zoom 1-100
     * omo :boolean
     * alignh [left|center|right|:int]
     * alignv [top|center|bottom|:int]
     * ext [png|jpg|gif]
     * quality 0-100 if ext = jpg
     * shadow :boolean
     * soffset :uint
     * sangle :uint
     * sblur :uint
     * sopacity :uint
     * scolor #000000 :string
     * background #000000 :string
     *
     *
     * gif   -> image/gif
     * jpeg  -> image/jpeg
     * jpg   -> image/jpeg
     * jpe   -> image/jpeg
     * xpm   -> image/x-xpixmap
     * xbm   -> image/x-xbitmap
     * wbmp  -> image/vnd.wap.wbmp
     * png   -> image/png
     * other -> image/png
     *
     * @param string $src the path to the source image, relative to the www directory
     *                    or relative to the path indicated into the configuration.
     *                    The filename should have one of these extensions:
     *                    gif,jpeg,jpg,jpe,xpm,xbm,wbmp,png
     * @param array $params parameters specifying image
     * @param array $send_cache_path include cache path in result
     * @param array $config the paths configuration. should contain same parameters
     *                      as you find in the imagemodifier section of the configuration.
     *                      give these array if you want to override the configuration.
     * @return array  list of attributes
     **/
    static function get($src, $params = array(), $sendCachePath = true, $config = null) {

        $basePath = jApp::urlBasePath();
        if(strpos($src, $basePath) === 0) {
            // in the case where the path is constructed with $j_basepath or $j_themepath
            // in a template
            $src = substr($src, strlen($basePath));
        }

        // extension
        if(empty($params['ext'])) {
            $path_parts = pathinfo($src);
            if ( isset($path_parts['extension'])) {
                $ext = strtolower($path_parts['extension']);
            }
            else {
                $ext = '';
            }
        } else {
            $ext = strtolower($params['ext']);
        }

        //// white background for IE
        //if (empty($params['background'])
        //    && strpos($_SERVER["HTTP_USER_AGENT"], 'MSIE') !== false
        //    && strpos($_SERVER["HTTP_USER_AGENT"], 'MSIE 7') === false) {
        //    $params['background'] = '#ffffff';
        //}

        // parse params
        $chaine = $src;
        foreach($params as $key => $value) {
            if( in_array($key, jImageModifier::$transformParams)) {
                $chaine .= $key.$value;
            }
            if( in_array($key, jImageModifier::$attributeParams)) {
                // attribute params are just transmitted back
                $att[$key] = $value;
            }
        }
        // generate cache key based on image src and transform params
        $cacheName = md5($chaine).'.'.$ext;

        // paths & uri
        list($srcPath, $srcUri, $cachePath, $cacheUri) = self::computeUrlFilePath($config, $src);

        // apply transforms if necessary (serve directly or from cache otherwise)
        $pendingTransforms = ($chaine !== $src);
        if( $pendingTransforms && is_file($srcPath.$src) && !is_file($cachePath.$cacheName) ) {
            self::transformImage($srcPath.$src, $cachePath, $cacheName, $params);
        }

        // Attributes
        if( !is_file($cachePath.$cacheName) ) {
            // image does not undergo any transformation
            $att['src'] = $srcUri.$src;
            $att['style'] = empty($att['style'])?'':$att['style'];
            if( !empty($params['width']) )             $att['style'] .= 'width:'.$params['width'].'px;';
            else if( !empty($params['maxwidth']) )     $att['style'] .= 'width:'.$params['maxwidth'].'px;';
            if( !empty($params['height']) )            $att['style'] .= 'height:'.$params['height'].'px;';
            else if( !empty($params['maxheight']) )    $att['style'] .= 'height:'.$params['maxheight'].'px;';
        } else {
            $att['src'] = $cacheUri.$cacheName;
        }

        if ($sendCachePath) {
            $att['cache_path'] = $cachePath . $cacheName;
        }

        return $att;
    }

    /**
     * compute path from the configuration or from
     * the given array. These paths will be used to read images and to save them
     * into a cache directory.
     * @return array. keys are
     *          src_url, src_path, cache_path, cache_url
     */
    static public function computeUrlFilePath($config=null, $src = null) {
        // paths & uri
        $basePath = jApp::urlBasePath();

        if (!$config)
            $config = & jApp::config()->imagemodifier;

        // compute URL and file path of the source image
        if ($config['src_url'] && $config['src_path']) {
            $srcUri = $config['src_url'];
            if ($srcUri[0] != '/' && !preg_match("/^https?\\:\\/\\/$/", $srcUri)) {
                $srcUri = $basePath . $srcUri;
            }
            $srcPath = jFile::parseJelixPath( $config['src_path'] );
        }
        else {
            $srcUri = jApp::coord()->request->getServerURI().$basePath;
            $srcPath = jApp::wwwPath();
        }

        if ($config['cache_path'] && $config['cache_url']) {
            $cacheUri = $config['cache_url'];
            if ($cacheUri[0] != '/' && !preg_match("/^https?\\:\\/\\/$/", $cacheUri)) {
                $cacheUri = $basePath . $cacheUri;
            }
            $cachePath = jFile::parseJelixPath( $config['cache_path'] );
        }
        else {
            $cachePath = jApp::wwwPath('cache/images/');
            $cacheUri = jApp::coord()->request->getServerURI().$basePath.'cache/images/';
        }

        if ($src && (!isset($config['use_old_cache_path']) || !$config['use_old_cache_path'])) {
            // new cache path. Only generate if there is no old_cache_path config parameter of if it's old
            $cachePath .= $src.'.cache/';
            $cacheUri .= $src.'.cache/';
        }

        return array($srcPath, $srcUri, $cachePath, $cacheUri);
    }

    static protected $mimes = array('gif'=>'image/gif', 'png'=>'image/png',
        'jpeg'=>'image/jpeg', 'jpg'=>'image/jpeg', 'jpe'=>'image/jpeg',
        'xpm'=>'image/x-xpixmap', 'xbm'=>'image/x-xbitmap', 'wbmp'=>'image/vnd.wap.wbmp');

    /**
     * transform source image file (given parameters) and store the result into an other file
     * @param string $srcFs the path to the image to transform. [gif|jpeg|jpg|jpe|xpm|xbm|wbmp|png]
     * @param string $targetPath  the path of the directory to store the resulting image
     * @param string $targetName the filename of the resulting image
     * @param array $params parameters specifying transformations
     */
    static public function transformImage($srcFs, $targetPath, $targetName, $params) {

        $path_parts = pathinfo($srcFs);
        $mimeType = self::$mimes[strtolower($path_parts['extension'])];

        $quality = (!empty($params['quality']))?  $params['quality'] : 100;

        // Creating an image
        switch ( $mimeType ) {
            case 'image/gif'             : $image = imagecreatefromgif($srcFs); break;
            case 'image/jpeg'            : $image = imagecreatefromjpeg($srcFs); break;
            case 'image/png'             : $image = imagecreatefrompng($srcFs); break;
            case 'image/vnd.wap.wbmp'    : $image = imagecreatefromwbmp($srcFs); break;
            case 'image/image/x-xbitmap' : $image = imagecreatefromxbm($srcFs); break;
            case 'image/x-xpixmap'       : $image = imagecreatefromxpm($srcFs); break;
            default                      : return false;
        }

        if ($image === false) {
            return false;
        }

        if(!empty($params['maxwidth']) && !empty($params['maxheight'])) {

            $origWidth = imagesx($image);
            $origHeight = imagesy($image);
            $constWidth = $params['maxwidth'];
            $constHeight = $params['maxheight'];
            $ratio = imagesx($image)/imagesy($image);

            if ( $origWidth < $constWidth && $origHeight < $constHeight ) {
                $params['width'] = $origWidth;
                $params['height'] = $origHeight;
            } else {
                $ratioHeight = $constWidth/$ratio;
                $ratioWidth = $constHeight*$ratio;
                if ( $ratioWidth > $constWidth ) {
                    $constHeight = $ratioHeight;
                }
                else if ( $ratioHeight > $constHeight ) {
                    $constWidth = $ratioWidth;
                }
                $params['width'] = $constWidth;
                $params['height'] = $constHeight;
            }
        }

        if (!empty($params['width']) || !empty($params['height'])) {

            $ancienimage = $image;
            $resampleheight = imagesy($ancienimage);
            $resamplewidth = imagesx($ancienimage);

            if(empty($params['width'])) {
                $finalheight = $params['height'];
                $finalwidth = $finalheight*imagesx($ancienimage)/imagesy($ancienimage);
            } else if (empty($params['height'])) {
                $finalwidth = $params['width'];
                $finalheight = $finalwidth*imagesy($ancienimage)/imagesx($ancienimage);
            } else {
                $finalwidth = $params['width'];
                $finalheight = $params['height'];
                if(!empty($params['omo']) && $params['omo'] == 'true') {
                    if($params['width'] >= $params['height']) {
                        $resampleheight = ( $resamplewidth*$params['height'] )/$params['width'];
                    } else {
                        $resamplewidth = ( $resampleheight*$params['width'] )/$params['height'];
                    }
                }
            }

            if(!empty($params['zoom'])) {
                $resampleheight /= 100/$params['zoom'];
                $resamplewidth /= 100/$params['zoom'];
            }

            $posx = imagesx($ancienimage)/2 -$resamplewidth/2;
            $posy = imagesy($ancienimage)/2 -$resampleheight/2;

            if(!empty($params['alignh'])) {
                if($params['alignh'] == 'left')            $posx = 0;
                else if($params['alignh'] == 'right')    $posx = -($resamplewidth - imagesx($ancienimage));
                else if($params['alignh'] != 'center')    $posx = -$params['alignh'];
            }

            if(!empty($params['alignv'])) {
                if($params['alignv'] == 'top')            $posy = 0;
                else if($params['alignv'] == 'bottom')    $posy = -($resampleheight - imagesy($ancienimage));
                else if($params['alignv'] != 'center')    $posy = -$params['alignv'];
            }

            $image = imagecreatetruecolor($finalwidth, $finalheight);
            imagesavealpha($image, true);
            $tp = imagecolorallocatealpha($image,0,0,0,127);
            imagecopyresampled($image, $ancienimage, 0, 0, $posx, $posy, imagesx($image), imagesy($image), $resamplewidth, $resampleheight);
            imagefill($image,0,0,$tp); // Because of a strange behavior (ticket #1486), we must fill the background AFTER imagecopyresampled
        }

        // The shadow cast adds to the dimension of the image chooses
        if( !empty($params['shadow']) )
            $image = self::createShadow($image, $params);

        // Background
        if( !empty($params['background']) ) {
            $params['background'] = str_replace('#', '', $params['background']);
            $rgb = array(0,0,0);
            for ($x=0;$x<3;$x++) $rgb[$x] = hexdec(substr($params['background'],(2*$x),2));
            $fond = imagecreatetruecolor(imagesx($image), imagesy($image));
            imagefill( $fond, 0, 0, imagecolorallocate( $fond, $rgb[0], $rgb[1], $rgb[2]) );
            imagecopy( $fond, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
            $image = $fond;
        }

        $filename = $targetPath.$targetName;
        jFile::createDir(dirname($filename));

        // Register
        switch ( $mimeType ) {
            case 'image/gif'  : imagegif($image, $filename); break;
            case 'image/jpeg' : imagejpeg($image, $filename, $quality); break;
            default           : imagepng($image, $filename);
        }
        chmod($filename, jApp::config()->chmodFile);

        // Destruction
        @imagedestroy($image);
    }


    /**
     * create a shadow
     * @param string $src the url of image (myapp/www/):string.[gif|jpeg|jpg|jpe|xpm|xbm|wbmp|png]
     * @param array $params parameters for the url
     * @return resource the image with shadow
     **/
    static protected function createShadow($image, $params) {

        // Default
        $leng = isset($params['soffset'])?$params['soffset']:10;
        $angle = isset($params['sangle'])?$params['sangle']:135;
        $flou = isset($params['sblur'])?$params['sblur']:10;
        $opac = isset($params['sopacity'])?$params['sopacity']:20;
        $color = isset($params['scolor'])?$params['scolor']:'#000000';

        // Color of the shadow
        $color = str_replace('#', '', $color);
        $rgb = array(0,0,0);
        if (strlen($color) == 6)
            for ($x=0;$x<3;$x++)
                $rgb[$x] = hexdec(substr($color,(2*$x),2));
        else if (strlen($color) == 3)
            for ($x=0;$x<3;$x++)
                $rgb[$x] = hexdec(substr($color,(2*$x),1));

        // Gaussian blur parameter
        $coeffs = array (array ( 1),
            array ( 1, 1),
            array ( 1, 2, 1),
            array ( 1, 3, 3, 1),
            array ( 1, 4, 6, 4, 1),
            array ( 1, 5, 10, 10, 5, 1),
            array ( 1, 6, 15, 20, 15, 6, 1),
            array ( 1, 7, 21, 35, 35, 21, 7, 1),
            array ( 1, 8, 28, 56, 70, 56, 28, 8, 1),
            array ( 1, 9, 36, 84, 126, 126, 84, 36, 9, 1),
            array ( 1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1),
            array ( 1, 11, 55, 165, 330, 462, 462, 330, 165, 55, 11, 1));
        $sum = pow (2, $flou);
        $demi = $flou/2;


        // Horizontal blur and blur margin
        $temp1 = imagecreatetruecolor(imagesx($image)+$flou, imagesy($image)+$flou);
        imagesavealpha($temp1, true);
        $tp = imagecolorallocatealpha($temp1,0,0,0,127);
        imagefill($temp1,0,0,$tp);

        for ( $i=0 ; $i < imagesx($temp1) ; $i++ ) {
            for ($j = 0; $j < imagesy($temp1); $j++) {
                $ig = $i - $demi;
                $jg = $j - $demi;
                $suma = 0;
                for ($k = 0; $k <= $flou; $k++) {
                    $ik = $ig - $demi + $k;
                    if ($jg < 0 || $jg > imagesy($temp1) - $flou - 1) $alpha = 127;
                    else if ($ik < 0 || $ik > imagesx($temp1) - $flou - 1) $alpha = 127;
                    else $alpha = (imagecolorat($image, $ik, $jg) & 0x7F000000) >> 24;
                    $suma += $alpha * $coeffs[$flou][$k];
                }
                $c = imagecolorallocatealpha($temp1, 0, 0, 0, $suma / $sum);
                imagesetpixel($temp1, $i, $j, $c);
            }
        }

        // Vertical blur, a shift of the angle, opacity and color

        $x = cos(deg2rad($angle))*$leng;
        $y = sin(deg2rad($angle))*$leng;

        $temp2 = imagecreatetruecolor(imagesx($temp1)+abs($x), imagesy($temp1)+abs($y));
        imagesavealpha($temp2, true);
        $tp = imagecolorallocatealpha($temp2,0,0,0,127);
        imagefill($temp2,0,0,$tp);

        $x1 = $x<0?0:$x;
        $y1 = $y<0?0:$y;

        for ( $i=0 ; $i < imagesx($temp1) ; $i++ ) {
            for ($j = 0; $j < imagesy($temp1); $j++) {
                $suma = 0;
                for ($k = 0; $k <= $flou; $k++) {
                    $jk = $j - $demi + $k;
                    if ($jk < 0 || $jk > imagesy($temp1) - 1) $alpha = 127;
                    else $alpha = (imagecolorat($temp1, $i, $jk) & 0x7F000000) >> 24;
                    $suma += $alpha * $coeffs[$flou][$k];
                }
                $alpha = 127 - ((127 - ($suma / $sum)) / (100 / $opac));
                $c = imagecolorallocatealpha($temp2, $rgb[0], $rgb[1], $rgb[2], $alpha < 0 ? 0 : $alpha > 127 ? 127 : $alpha);
                imagesetpixel($temp2, $i + $x1, $j + $y1, $c);
            }
        }
        imagedestroy($temp1);

        // Merge of the image and are shade
        $x = $x>0?0:$x;
        $y = $y>0?0:$y;
        imagecopy( $temp2, $image, $demi-$x, $demi-$y, 0, 0, imagesx($image), imagesy($image));

        return $temp2;

    }

}
