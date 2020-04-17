<?php
/**
 * Author : Julien Moquet
 * 
 * Simple conversion from javascript to PHP of Proj4php by Mike Adair madairATdmsolutions.ca and Richard Greenwood rich@greenwoodmap.com 
 *
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
$dir = dirname( __FILE__ );

require_once($dir . "/proj4phpProj.php");
require_once($dir . "/proj4phpCommon.php");
require_once($dir . "/proj4phpDatum.php");
require_once($dir . "/proj4phpLongLat.php");
require_once($dir . "/proj4phpPoint.php");

class Proj4php {
    protected $defaultDatum = 'WGS84';
    public static $ellipsoid = array( );
    public static $common = null;
    public static $datum = array( );
    public static $defs = array( );
    public static $wktProjections = array( );
    public static $WGS84 = null;
    public static $primeMeridian = array( );
    public static $proj = array( );
    public $msg = '';
    /**
     * Property: defsLookupService
     * service to retreive projection definition parameters from
     */
    public static $defsLookupService = 'http://spatialreference.org/ref';
              
    /**
      Proj4php.defs is a collection of coordinate system definition objects in the
      PROJ.4 command line format.
      Generally a def is added by means of a separate .js file for example:

      <SCRIPT type="text/javascript" src="defs/EPSG26912.js"></SCRIPT>

      def is a CS definition in PROJ.4 WKT format, for example:
      +proj="tmerc"   //longlat, etc.
      +a=majorRadius
      +b=minorRadius
      +lat0=somenumber
      +long=somenumber
     */
    protected function initDefs() {
        // These are so widely used, we'll go ahead and throw them in
        // without requiring a separate .js file
        self::$defs['WGS84'] = "+title=long/lat:WGS84 +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";
        self::$defs['EPSG:4326'] = "+title=long/lat:WGS84 +proj=longlat +a=6378137.0 +b=6356752.31424518 +ellps=WGS84 +datum=WGS84 +units=degrees";
        self::$defs['EPSG:4269'] = "+title=long/lat:NAD83 +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees";
        self::$defs['EPSG:3875'] = "+title= Google Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
        self::$defs['EPSG:3785'] = self::$defs['EPSG:3875'];
        self::$defs['GOOGLE']    = self::$defs['EPSG:3875'];
        self::$defs['EPSG:900913'] = self::$defs['EPSG:3875'];
        self::$defs['EPSG:102113'] = self::$defs['EPSG:3875'];
    }

    //lookup table to go from the projection name in WKT to the Proj4php projection name
    //build this out as required
    protected function initWKTProjections() {
        self::$wktProjections["Lambert Tangential Conformal Conic Projection"] = "lcc";
        self::$wktProjections["Mercator"] = "merc";
        self::$wktProjections["Mercator_1SP"] = "merc";
        self::$wktProjections["Transverse_Mercator"] = "tmerc";
        self::$wktProjections["Transverse Mercator"] = "tmerc";
        self::$wktProjections["Lambert Azimuthal Equal Area"] = "laea";
        self::$wktProjections["Universal Transverse Mercator System"] = "utm";
    }

    protected function initDatum() {
        self::$datum["WGS84"] = array( 'towgs84' => "0,0,0", 'ellipse' => "WGS84", 'datumName' => "WGS84" );
        self::$datum["GGRS87"] = array( 'towgs84' => "-199.87,74.79,246.62", 'ellipse' => "GRS80", 'datumName' => "Greek_Geodetic_Reference_System_1987" );
        self::$datum["NAD83"] = array( 'towgs84' => "0,0,0", 'ellipse' => "GRS80", 'datumName' => "North_American_Datum_1983" );
        self::$datum["NAD27"] = array( 'nadgrids' => "@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat", 'ellipse' => "clrk66", 'datumName' => "North_American_Datum_1927" );
        self::$datum["potsdam"] = array( 'towgs84' => "606.0,23.0,413.0", 'ellipse' => "bessel", 'datumName' => "Potsdam Rauenberg 1950 DHDN" );
        self::$datum["carthage"] = array( 'towgs84' => "-263.0,6.0,431.0", 'ellipse' => "clark80", 'datumName' => "Carthage 1934 Tunisia" );
        self::$datum["hermannskogel"] = array( 'towgs84' => "653.0,-212.0,449.0", 'ellipse' => "bessel", 'datumName' => "Hermannskogel" );
        self::$datum["ire65"] = array( 'towgs84' => "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15", 'ellipse' => "mod_airy", 'datumName' => "Ireland 1965" );
        self::$datum["nzgd49"] = array( 'towgs84' => "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993", 'ellipse' => "intl", 'datumName' => "New Zealand Geodetic Datum 1949" );
        self::$datum["OSGB36"] = array( 'towgs84' => "446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894", 'ellipse' => "airy", 'datumName' => "Airy 1830" );
    }

    protected function initEllipsoid() {
        self::$ellipsoid["MERIT"] = array( 'a' => 6378137.0, 'rf' => 298.257, 'ellipseName' => "MERIT 1983" );
        self::$ellipsoid["SGS85"] = array( 'a' => 6378136.0, 'rf' => 298.257, 'ellipseName' => "Soviet Geodetic System 85" );
        self::$ellipsoid["GRS80"] = array( 'a' => 6378137.0, 'rf' => 298.257222101, 'ellipseName' => "GRS 1980(IUGG, 1980)" );
        self::$ellipsoid["IAU76"] = array( 'a' => 6378140.0, 'rf' => 298.257, 'ellipseName' => "IAU 1976" );
        self::$ellipsoid["airy"] = array( 'a' => 6377563.396, 'b' => 6356256.910, 'ellipseName' => "Airy 1830" );
        self::$ellipsoid["APL4."] = array( 'a' => 6378137, 'rf' => 298.25, 'ellipseName' => "Appl. Physics. 1965" );
        self::$ellipsoid["NWL9D"] = array( 'a' => 6378145.0, 'rf' => 298.25, 'ellipseName' => "Naval Weapons Lab., 1965" );
        self::$ellipsoid["mod_airy"] = array( 'a' => 6377340.189, 'b' => 6356034.446, 'ellipseName' => "Modified Airy" );
        self::$ellipsoid["andrae"] = array( 'a' => 6377104.43, 'rf' => 300.0, 'ellipseName' => "Andrae 1876 (Den., Iclnd.)" );
        self::$ellipsoid["aust_SA"] = array( 'a' => 6378160.0, 'rf' => 298.25, 'ellipseName' => "Australian Natl & S. Amer. 1969" );
        self::$ellipsoid["GRS67"] = array( 'a' => 6378160.0, 'rf' => 298.2471674270, 'ellipseName' => "GRS 67(IUGG 1967)" );
        self::$ellipsoid["bessel"] = array( 'a' => 6377397.155, 'rf' => 299.1528128, 'ellipseName' => "Bessel 1841" );
        self::$ellipsoid["bess_nam"] = array( 'a' => 6377483.865, 'rf' => 299.1528128, 'ellipseName' => "Bessel 1841 (Namibia)" );
        self::$ellipsoid["clrk66"] = array( 'a' => 6378206.4, 'b' => 6356583.8, 'ellipseName' => "Clarke 1866" );
        self::$ellipsoid["clrk80"] = array( 'a' => 6378249.145, 'rf' => 293.4663, 'ellipseName' => "Clarke 1880 mod." );
        self::$ellipsoid["CPM"] = array( 'a' => 6375738.7, 'rf' => 334.29, 'ellipseName' => "Comm. des Poids et Mesures 1799" );
        self::$ellipsoid["delmbr"] = array( 'a' => 6376428.0, 'rf' => 311.5, 'ellipseName' => "Delambre 1810 (Belgium)" );
        self::$ellipsoid["engelis"] = array( 'a' => 6378136.05, 'rf' => 298.2566, 'ellipseName' => "Engelis 1985" );
        self::$ellipsoid["evrst30"] = array( 'a' => 6377276.345, 'rf' => 300.8017, 'ellipseName' => "Everest 1830" );
        self::$ellipsoid["evrst48"] = array( 'a' => 6377304.063, 'rf' => 300.8017, 'ellipseName' => "Everest 1948" );
        self::$ellipsoid["evrst56"] = array( 'a' => 6377301.243, 'rf' => 300.8017, 'ellipseName' => "Everest 1956" );
        self::$ellipsoid["evrst69"] = array( 'a' => 6377295.664, 'rf' => 300.8017, 'ellipseName' => "Everest 1969" );
        self::$ellipsoid["evrstSS"] = array( 'a' => 6377298.556, 'rf' => 300.8017, 'ellipseName' => "Everest (Sabah & Sarawak)" );
        self::$ellipsoid["fschr60"] = array( 'a' => 6378166.0, 'rf' => 298.3, 'ellipseName' => "Fischer (Mercury Datum) 1960" );
        self::$ellipsoid["fschr60m"] = array( 'a' => 6378155.0, 'rf' => 298.3, 'ellipseName' => "Fischer 1960" );
        self::$ellipsoid["fschr68"] = array( 'a' => 6378150.0, 'rf' => 298.3, 'ellipseName' => "Fischer 1968" );
        self::$ellipsoid["helmert"] = array( 'a' => 6378200.0, 'rf' => 298.3, 'ellipseName' => "Helmert 1906" );
        self::$ellipsoid["hough"] = array( 'a' => 6378270.0, 'rf' => 297.0, 'ellipseName' => "Hough" );
        self::$ellipsoid["intl"] = array( 'a' => 6378388.0, 'rf' => 297.0, 'ellipseName' => "International 1909 (Hayford)" );
        self::$ellipsoid["kaula"] = array( 'a' => 6378163.0, 'rf' => 298.24, 'ellipseName' => "Kaula 1961" );
        self::$ellipsoid["lerch"] = array( 'a' => 6378139.0, 'rf' => 298.257, 'ellipseName' => "Lerch 1979" );
        self::$ellipsoid["mprts"] = array( 'a' => 6397300.0, 'rf' => 191.0, 'ellipseName' => "Maupertius 1738" );
        self::$ellipsoid["new_intl"] = array( 'a' => 6378157.5, 'b' => 6356772.2, 'ellipseName' => "New International 1967" );
        self::$ellipsoid["plessis"] = array( 'a' => 6376523.0, 'rf' => 6355863.0, 'ellipseName' => "Plessis 1817 (France)" );
        self::$ellipsoid["krass"] = array( 'a' => 6378245.0, 'rf' => 298.3, 'ellipseName' => "Krassovsky, 1942" );
        self::$ellipsoid["SEasia"] = array( 'a' => 6378155.0, 'b' => 6356773.3205, 'ellipseName' => "Southeast Asia" );
        self::$ellipsoid["walbeck"] = array( 'a' => 6376896.0, 'b' => 6355834.8467, 'ellipseName' => "Walbeck" );
        self::$ellipsoid["WGS60"] = array( 'a' => 6378165.0, 'rf' => 298.3, 'ellipseName' => "WGS 60" );
        self::$ellipsoid["WGS66"] = array( 'a' => 6378145.0, 'rf' => 298.25, 'ellipseName' => "WGS 66" );
        self::$ellipsoid["WGS72"] = array( 'a' => 6378135.0, 'rf' => 298.26, 'ellipseName' => "WGS 72" );
        self::$ellipsoid["WGS84"] = array( 'a' => 6378137.0, 'rf' => 298.257223563, 'ellipseName' => "WGS 84" );
        self::$ellipsoid["sphere"] = array( 'a' => 6370997.0, 'b' => 6370997.0, 'ellipseName' => "Normal Sphere (r=6370997)" );
    }

    protected function initPrimeMeridian() {
        self::$primeMeridian["greenwich"] = '0.0';               //"0dE",
        self::$primeMeridian["lisbon"] = -9.131906111111;   //"9d07'54.862\"W",
        self::$primeMeridian["paris"] = 2.337229166667;   //"2d20'14.025\"E",
        self::$primeMeridian["bogota"] = -74.080916666667;  //"74d04'51.3\"W",
        self::$primeMeridian["madrid"] = -3.687938888889;  //"3d41'16.58\"W",
        self::$primeMeridian["rome"] = 12.452333333333;  //"12d27'8.4\"E",
        self::$primeMeridian["bern"] = 7.439583333333;  //"7d26'22.5\"E",
        self::$primeMeridian["jakarta"] = 106.807719444444;  //"106d48'27.79\"E",
        self::$primeMeridian["ferro"] = -17.666666666667;  //"17d40'W",
        self::$primeMeridian["brussels"] = 4.367975;        //"4d22'4.71\"E",
        self::$primeMeridian["stockholm"] = 18.058277777778;  //"18d3'29.8\"E",
        self::$primeMeridian["athens"] = 23.7163375;       //"23d42'58.815\"E",
        self::$primeMeridian["oslo"] = 10.722916666667;  //"10d43'22.5\"E"
    }

    /**
     *
     */
    public function __construct() {

        $this->initWKTProjections();
        $this->initDefs();
        $this->initDatum();
        $this->initEllipsoid();
        $this->initPrimeMeridian();

        self::$proj['longlat'] = new proj4phpLongLat();
        self::$proj['identity'] = new proj4phpLongLat();
        self::$common = new proj4phpCommon();
        self::$WGS84 = new Proj4phpProj( 'WGS84' );
    }

    /**
     * Method: transform(source, dest, point)
     * Transform a point coordinate from one map projection to another.  This is
     * really the only public method you should need to use.
     *
     * Parameters:
     * source - {Proj4phpProj} source map projection for the transformation
     * dest - {Proj4phpProj} destination map projection for the transformation
     * point - {Object} point to transform, may be geodetic (long, lat) or
     *     projected Cartesian (x,y), but should always have x,y properties.
     */
    public function transform( $source, $dest, $point) {
        $this->msg = '';
        if( !$source->readyToUse ) {
            self::reportError( "Proj4php initialization for:" . $source->srsCode . " not yet complete" );
            return $point;
        }
        if( !$dest->readyToUse ) {
            self::reportError( "Proj4php initialization for:" . $dest->srsCode . " not yet complete" );
            return $point;
        }

        // DGR, 2010/11/12

        if( $source->axis != "enu" ) {
            $this->adjust_axis( $source, false, $point );
        }

        // Transform source points to long/lat, if they aren't already.
        if( $source->projName == "longlat" ) {
            $point->x *= Proj4php::$common->D2R;  // convert degrees to radians
            $point->y *= Proj4php::$common->D2R;
        } else {
            if( isset($source->to_meter) )
            {
                $point->x *= $source->to_meter;
                $point->y *= $source->to_meter;
            }
            $source->inverse( $point ); // Convert Cartesian to longlat
        }
        // Adjust for the prime meridian if necessary
        if( isset( $source->from_greenwich ) ) {
            $point->x += $source->from_greenwich;
        }

        // Convert datums if needed, and if possible.
        $point = $this->datum_transform( $source->datum, $dest->datum, $point );

        // Adjust for the prime meridian if necessary
        if( isset( $dest->from_greenwich ) ) {
            $point->x -= $dest->from_greenwich;
        }

        if( $dest->projName == "longlat" ) {
            // convert radians to decimal degrees
            $point->x *= Proj4php::$common->R2D;
            $point->y *= Proj4php::$common->R2D;
        } else {               // else project
            $dest->forward( $point );
            if( isset($dest->to_meter) ) {
                $point->x /= $dest->to_meter;
                $point->y /= $dest->to_meter;
            }
        }

        // DGR, 2010/11/12
        if( $dest->axis != "enu" ) {
            $this->adjust_axis( $dest, true, $point );
        }

        // Nov 2014 - changed Werner Schäffer
        // clone point to avoid a lot of problems
        return (clone $point);

    }

    /** datum_transform()
      source coordinate system definition,
      destination coordinate system definition,
      point to transform in geodetic coordinates (long, lat, height)
     */
    public function datum_transform( $source, $dest, $point ) {

        // Short cut if the datums are identical.
        if( $source->compare_datums( $dest ) ) {
            return $point; // in this case, zero is sucess,
            // whereas cs_compare_datums returns 1 to indicate TRUE
            // confusing, should fix this
        }

        // Explicitly skip datum transform by setting 'datum=none' as parameter for either source or dest
        if( $source->datum_type == Proj4php::$common->PJD_NODATUM
            || $dest->datum_type == Proj4php::$common->PJD_NODATUM ) {
            return $point;
        }

        /*
        // If this datum requires grid shifts, then apply it to geodetic coordinates.
        if( $source->datum_type == Proj4php::$common->PJD_GRIDSHIFT ) {
            throw(new Exception( "ERROR: Grid shift transformations are not implemented yet." ));
        }

        if( $dest->datum_type == Proj4php::$common->PJD_GRIDSHIFT ) {
            throw(new Exception( "ERROR: Grid shift transformations are not implemented yet." ));
        }
        */

        // Do we need to go through geocentric coordinates?
        if( $source->es != $dest->es || $source->a != $dest->a
            || $source->datum_type == Proj4php::$common->PJD_3PARAM
            || $source->datum_type == Proj4php::$common->PJD_7PARAM
            || $dest->datum_type == Proj4php::$common->PJD_3PARAM
            || $dest->datum_type == Proj4php::$common->PJD_7PARAM ) {

            // Convert to geocentric coordinates.
            $source->geodetic_to_geocentric( $point );
            // CHECK_RETURN;
            // Convert between datums
            if( $source->datum_type == Proj4php::$common->PJD_3PARAM || $source->datum_type == Proj4php::$common->PJD_7PARAM ) {
                $source->geocentric_to_wgs84( $point );
                // CHECK_RETURN;
            }

            if( $dest->datum_type == Proj4php::$common->PJD_3PARAM || $dest->datum_type == Proj4php::$common->PJD_7PARAM ) {
                $dest->geocentric_from_wgs84( $point );
                // CHECK_RETURN;
            }

            // Convert back to geodetic coordinates
            $dest->geocentric_to_geodetic( $point );
            // CHECK_RETURN;
        }

        // Apply grid shift to destination if required
        /*
        if( $dest->datum_type == Proj4php::$common->PJD_GRIDSHIFT ) {
            throw(new Exception( "ERROR: Grid shift transformations are not implemented yet." ));
            // pj_apply_gridshift( pj_param(dest.params,"snadgrids").s, 1, point);
            // CHECK_RETURN;
        }
        */
        return $point;
    }


    /**
     * Function: adjust_axis
     * Normalize or de-normalized the x/y/z axes.  The normal form is "enu"
     * (easting, northing, up).
     * Parameters:
     * crs {Proj4php.Proj} the coordinate reference system
     * denorm {Boolean} when false, normalize
     * point {Object} the coordinates to adjust
     */
    public function adjust_axis( $crs, $denorm, $point ) {
        
        $xin = $point->x;
        $yin = $point->y;
        $zin = isset( $point->z ) ? $point->z : 0.0;
        #$v;
        #$t;
        for( $i = 0; $i < 3; $i++ ) {
            if( $denorm && $i == 2 && !isset( $point->z ) ) {
                continue;
            }
            if( $i == 0 ) {
                $v = $xin;
                $t = 'x';
            } else if( $i == 1 ) {
                $v = $yin;
                $t = 'y';
            } else {
                $v = $zin;
                $t = 'z';
            }
            switch( $crs->axis[$i] ) {
                case 'e':
                    $point[$t] = $v;
                    break;
                case 'w':
                    $point[$t] = -$v;
                    break;
                case 'n':
                    $point[$t] = $v;
                    break;
                case 's':
                    $point[$t] = -$v;
                    break;
                case 'u':
                    if( isset( $point[$t] ) ) {
                        $point->z = $v;
                    }
                    break;
                case 'd':
                    if( isset( $point[$t] ) ) {
                        $point->z = -$v;
                    }
                    break;
                default :
                    throw(new Exception( "ERROR: unknow axis (" . $crs->axis[$i] . ") - check definition of " . $crs->projName ));
                    return null;
            }
        }
        return $point;
    }

    /**
     * Function: reportError
     * An internal method to report errors back to user.
     * Override this in applications to report error messages or throw exceptions.
     */
    public static function reportError( $msg ) {
        throw(new Exception($msg));
    }

    /**
     * Function : loadScript
     * adapted from original. PHP is simplier.
     */
    public static function loadScript( $filename, $onload = null, $onfail = null, $loadCheck = null ) {
        
        if( stripos($filename, 'http://') !== false ) {
            return @file_get_contents($filename);
        }
        elseif( file_exists( $filename ) ) {
            require_once($filename);
            return true;
        }
        else {
            throw(new Exception( "File $filename could not be found or was not able to be loaded." ));
        }
    }

    /**
     * Function: extend
     * Copy all properties of a source object to a destination object.  Modifies
     *     the passed in destination object.  Any properties on the source object
     *     that are set to undefined will not be (re)set on the destination object.
     *
     * Parameters:
     * destination - {Object} The object that will be modified
     * source - {Object} The object with properties to be set on the destination
     *
     * Returns:
     * {Object} The destination object.
     */
    public static function extend( $destination, $source ) {
        if( $source != null )
            foreach( $source as $key => $value ) {
                $destination->$key = $value;
            }
        return $destination;
    }

}