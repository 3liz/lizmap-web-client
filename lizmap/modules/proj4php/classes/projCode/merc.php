<?php

/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
/* * *****************************************************************************
  NAME                            MERCATOR

  PURPOSE:	Transforms input longitude and latitude to Easting and
  Northing for the Mercator projection.  The
  longitude and latitude must be in radians.  The Easting
  and Northing values will be returned in meters.

  PROGRAMMER              DATE
  ----------              ----
  D. Steinwand, EROS      Nov, 1991
  T. Mittan		Mar, 1993

  ALGORITHM REFERENCES

  1.  Snyder, John P., "Map Projections--A Working Manual", U.S. Geological
  Survey Professional Paper 1395 (Supersedes USGS Bulletin 1532), United
  State Government Printing Office, Washington D.C., 1987.

  2.  Snyder, John P. and Voxland, Philip M., "An Album of Map Projections",
  U.S. Geological Survey Professional Paper 1453 , United State Government
  Printing Office, Washington D.C., 1989.
 * ***************************************************************************** */

//static double r_major = a;		   /* major axis 				*/
//static double r_minor = b;		   /* minor axis 				*/
//static double lon_center = long0;	   /* Center longitude (projection center) */
//static double lat_origin =  lat0;	   /* center latitude			*/
//static double e,es;		           /* eccentricity constants		*/
//static double m1;		               /* small value m			*/
//static double false_northing = y0;   /* y offset in meters			*/
//static double false_easting = x0;	   /* x offset in meters			*/
//scale_fact = k0 

class Proj4phpProjMerc {

    public function init() {
        //?$this->temp = $this->r_minor / $this->r_major;
        //$this->temp = $this->b / $this->a;
        //$this->es = 1.0 - sqrt($this->temp);
        //$this->e = sqrt( $this->es );
        //?$this->m1 = cos($this->lat_origin) / (sqrt( 1.0 - $this->es * sin($this->lat_origin) * sin($this->lat_origin)));
        //$this->m1 = cos(0.0) / (sqrt( 1.0 - $this->es * sin(0.0) * sin(0.0)));
        if( $this->lat_ts ) {
            if( $this->sphere ) {
                $this->k0 = cos( $this->lat_ts );
            } else {
                $this->k0 = Proj4php::$common->msfnz( $this->es, sin( $this->lat_ts ), cos( $this->lat_ts ) );
            }
        }
    }

    /* Mercator forward equations--mapping lat,long to x,y
      -------------------------------------------------- */

    public function forward( $p ) {
        
        //alert("ll2m coords : ".coords);
        $lon = $p->x;
        $lat = $p->y;
        // convert to radians
        if( $lat * Proj4php::$common->R2D > 90.0 &&
                  $lat * Proj4php::$common->R2D < -90.0 &&
                  $lon * Proj4php::$common->R2D > 180.0 &&
                  $lon * Proj4php::$common->R2D < -180.0 ) {
            Proj4php::reportError( "merc:forward: llInputOutOfRange: " . $lon . " : " . $lat );
            return null;
        }
        
        if( abs( abs( $lat ) - Proj4php::$common->HALF_PI ) <= Proj4php::$common->EPSLN ) {
            Proj4php::reportError( "merc:forward: ll2mAtPoles" );
            return null;
        } else {
            if( $this->sphere ) {
                $x = $this->x0 + $this->a * $this->k0 * Proj4php::$common->adjust_lon( $lon - $this->long0 );
                $y = $this->y0 + $this->a * $this->k0 * log( tan( Proj4php::$common->FORTPI + 0.5 * $lat ) );
            } else {
                $sinphi = sin( lat );
                $ts = Proj4php::$common->tsfnz( $this->e, $lat, $sinphi );
                $x = $this->x0 + $this->a * $this->k0 * Proj4php::$common->adjust_lon( $lon - $this->long0 );
                $y = $this->y0 - $this->a * $this->k0 * log( $ts );
            }
            
            $p->x = $x;
            $p->y = $y;
            
            return $p;
        }
    }

    /* Mercator inverse equations--mapping x,y to lat/long
      -------------------------------------------------- */

    public function inverse( $p ) {

        $x = $p->x - $this->x0;
        $y = $p->y - $this->y0;
        
        if( $this->sphere ) {
            $lat = Proj4php::$common->HALF_PI - 2.0 * atan( exp( -$y / $this->a * $this->k0 ) );
        } else {
            $ts = exp( -$y / ($this->a * $this->k0) );
            $lat = Proj4php::$common->phi2z( $this->e, $ts );
            if( $lat == -9999 ) {
                Proj4php::reportError( "merc:inverse: lat = -9999" );
                return null;
            }
        }
        $lon = Proj4php::$common->adjust_lon( $this->long0 + $x / ($this->a * $this->k0) );

        $p->x = $lon;
        $p->y = $lat;
        return $p;
    }

}

Proj4php::$proj['merc'] = new Proj4phpProjMerc();


