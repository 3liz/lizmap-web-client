<?php
/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
/*******************************************************************************
  NAME                            TRANSVERSE MERCATOR

  PURPOSE:	Transforms input longitude and latitude to Easting and
  Northing for the Transverse Mercator projection.  The
  longitude and latitude must be in radians.  The Easting
  and Northing values will be returned in meters.

  ALGORITHM REFERENCES

  1.  Snyder, John P., "Map Projections--A Working Manual", U.S. Geological
  Survey Professional Paper 1395 (Supersedes USGS Bulletin 1532), United
  State Government Printing Office, Washington D.C., 1987.

  2.  Snyder, John P. and Voxland, Philip M., "An Album of Map Projections",
  U.S. Geological Survey Professional Paper 1453 , United State Government
  Printing Office, Washington D.C., 1989.
*******************************************************************************/

/**
  Initialize Transverse Mercator projection
 */
class Proj4phpProjUtm{

    //public $dependsOn = 'tmerc';
    
    public $utmSouth = false; // UTM north/south
    private $e0, $e1, $e2, $e3, $ml0;

    /**
     *
     * @return void
     */
    public function init() {

        if( !isset($this->zone) ) {
            Proj4php::reportError( "utm:init: zone must be specified for UTM" );
            return;
        }

        $this->lat0 = 0.0;
        $this->long0 = ((6 * abs( $this->zone )) - 183) * Proj4php::$common->D2R;
        $this->x0 = 500000.0;
        $this->y0 = $this->utmSouth ? 10000000.0 : 0.0;
        $this->k0 = 0.9996;

        $this->e0 = Proj4php::$common->e0fn( $this->es );
        $this->e1 = Proj4php::$common->e1fn( $this->es );
        $this->e2 = Proj4php::$common->e2fn( $this->es );
        $this->e3 = Proj4php::$common->e3fn( $this->es );
        $this->ml0 = $this->a * Proj4php::$common->mlfn( $this->e0, $this->e1, $this->e2, $this->e3, $this->lat0 );
    }

    /**
      Transverse Mercator Forward  - long/lat to x/y
      long/lat in radians
     */

    public function forward( $p ) {

        $lon = $p->x;
        $lat = $p->y;

        $delta_lon = Proj4php::$common->adjust_lon( $lon - $this->long0 ); // Delta longitude
        #$con = 0;    // cone constant
        #$x = 0;
        #$y = 0;
        $sin_phi = sin( $lat );
        $cos_phi = cos( $lat );

        if( isset($this->sphere) && $this->sphere === true ) { /* spherical form */
            $b = $cos_phi * sin( $delta_lon );
            if( (abs( abs( $b ) - 1.0 )) < .0000000001 ) {
                Proj4php::reportError( "tmerc:forward: Point projects into infinity" );
                return(93);
            } else {
                $x = .5 * $this->a * $this->k0 * log( (1.0 + $b) / (1.0 - $b) );
                $con = acos( $cos_phi * cos( $delta_lon ) / sqrt( 1.0 - $b * $b ) );
                if( $lat < 0 )
                    $con = - $con;
                $y = $this->a * $this->k0 * ($con - $this->lat0);
            }
        } else {
            $al = $cos_phi * $delta_lon;
            $als = pow( $al, 2 );
            $c = $this->ep2 * pow( $cos_phi, 2 );
            $tq = tan( $lat );
            $t = pow( $tq, 2 );
            $con = 1.0 - $this->es * pow( $sin_phi, 2 );
            $n = $this->a / sqrt( $con );

            $ml = $this->a * Proj4php::$common->mlfn( $this->e0, $this->e1, $this->e2, $this->e3, $lat );

            $x = $this->k0 * $n * $al * (1.0 + $als / 6.0 * (1.0 - $t + $c + $als / 20.0 * (5.0 - 18.0 * $t + pow( $t, 2 ) + 72.0 * $c - 58.0 * $this->ep2))) + $this->x0;
            $y = $this->k0 * ($ml - $this->ml0 + $n * $tq * ($als * (0.5 + $als / 24.0 * (5.0 - $t + 9.0 * $c + 4.0 * pow( $c, 2 ) + $als / 30.0 * (61.0 - 58.0 * $t + pow( $t, 2 ) + 600.0 * $c - 330.0 * $this->ep2))))) + $this->y0;
        }

        $p->x = $x;
        $p->y = $y;

        return $p;
    }

    /**
      Transverse Mercator Inverse  -  x/y to long/lat
     */
    public function inverse( $p ) {

        #$phi;  /* temporary angles       */
        #$delta_phi; /* difference between longitudes    */
        $max_iter = 6;      /* maximun number of iterations */
        if( isset($this->sphere) && $this->sphere === true ) { /* spherical form */
            $f = exp( $p->x / ($this->a * $this->k0) );
            $g = .5 * ($f - 1 / $f);
            $temp = $this->lat0 + $p->y / ($this->a * $this->k0);
            $h = cos( $temp );
            $con = sqrt( (1.0 - $h * $h) / (1.0 + $g * $g) );
            $lat = Proj4php::$common->asinz( $con );
            if( $temp < 0 )
                $lat = -$lat;
            if( ($g == 0) && ($h == 0) ) {
                $lon = $this->long0;
            } else {
                $lon = Proj4php::$common->adjust_lon( atan2( $g, $h ) + $this->long0 );
            }
        } else {    // ellipsoidal form
            $x = $p->x - $this->x0;
            $y = $p->y - $this->y0;

            $con = ($this->ml0 + $y / $this->k0) / $this->a;
            $phi = $con;

            for( $i = 0; true; $i++ ) {
                $delta_phi = (($con + $this->e1 * sin( 2.0 * $phi ) - $this->e2 * sin( 4.0 * $phi ) + $this->e3 * sin( 6.0 * $phi )) / $this->e0) - $phi;
                $phi += $delta_phi;
                if( abs( $delta_phi ) <= Proj4php::$common->EPSLN )
                    break;
                if( $i >= $max_iter ) {
                    Proj4php::reportError( "tmerc:inverse: Latitude failed to converge" );
                    return(95);
                }
            } // for()


            if( abs( $phi ) < Proj4php::$common->HALF_PI ) {
                // sincos(phi, &sin_phi, &cos_phi);
                $sin_phi = sin( $phi );
                $cos_phi = cos( $phi );
                $tan_phi = tan( $phi );
                $c = $this->ep2 * pow( $cos_phi, 2 );
                $cs = pow( $c, 2 );
                $t = pow( $tan_phi, 2 );
                $ts = pow( $t, 2 );
                $con = 1.0 - $this->es * pow( $sin_phi, 2 );
                $n = $this->a / sqrt( $con );
                $r = $n * (1.0 - $this->es) / $con;
                $d = $x / ($n * $this->k0);
                $ds = pow( $d, 2 );
                $lat = $phi - ($n * $tan_phi * $ds / $r) * (0.5 - $ds / 24.0 * (5.0 + 3.0 * $t + 10.0 * $c - 4.0 * $cs - 9.0 * $this->ep2 - $ds / 30.0 * (61.0 + 90.0 * $t + 298.0 * $c + 45.0 * $ts - 252.0 * $this->ep2 - 3.0 * $cs)));
                $lon = Proj4php::$common->adjust_lon( $this->long0 + ($d * (1.0 - $ds / 6.0 * (1.0 + 2.0 * $t + $c - $ds / 20.0 * (5.0 - 2.0 * $c + 28.0 * $t - 3.0 * $cs + 8.0 * $this->ep2 + 24.0 * $ts))) / $cos_phi) );
            } else {
                $lat = Proj4php::$common->HALF_PI * Proj4php::$common->sign( $y );
                $lon = $this->long0;
            }
        }

        $p->x = $lon;
        $p->y = $lat;

        return $p;
    }
}

Proj4php::$proj['utm'] = new Proj4phpProjUtm();