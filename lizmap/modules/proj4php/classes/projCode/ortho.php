<?php
/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
/* * *****************************************************************************
  NAME                             ORTHOGRAPHIC

  PURPOSE:	Transforms input longitude and latitude to Easting and
  Northing for the Orthographic projection.  The
  longitude and latitude must be in radians.  The Easting
  and Northing values will be returned in meters.

  PROGRAMMER              DATE
  ----------              ----
  T. Mittan		Mar, 1993

  ALGORITHM REFERENCES

  1.  Snyder, John P., "Map Projections--A Working Manual", U.S. Geological
  Survey Professional Paper 1395 (Supersedes USGS Bulletin 1532), United
  State Government Printing Office, Washington D.C., 1987.

  2.  Snyder, John P. and Voxland, Philip M., "An Album of Map Projections",
  U.S. Geological Survey Professional Paper 1453 , United State Government
  Printing Office, Washington D.C., 1989.
 * ***************************************************************************** */

class Proj4phpProjOrtho {
    
    /* Initialize the Orthographic projection
      ------------------------------------- */
    public function init( $def ) {
        //double temp;			/* temporary variable		*/

        /* Place parameters in static storage for common use
          ------------------------------------------------- */;
        $this->sin_p14 = sin( $this->lat0 );
        $this->cos_p14 = cos( $this->lat0 );
    }

    /* Orthographic forward equations--mapping lat,long to x,y
      --------------------------------------------------- */
    public function forward( $p ) {
        
        /*
        $sinphi;
        $cosphi; // sin and cos value
        $dlon;  // delta longitude value
        $coslon;  // cos of longitude
        $ksp;  // scale factor
        $g;
        */
        
        $lon = $p->x;
        $lat = $p->y;
        
        /* Forward equations
          ----------------- */
        $dlon = Proj4php::$common->adjust_lon( $lon - $this->long0 );

        $sinphi = sin( $lat );
        $cosphi = cos( $lat );

        $coslon = cos( $dlon );
        $g = $this->sin_p14 * sinphi + $this->cos_p14 * $cosphi * $coslon;
        $ksp = 1.0;
        
        if( ($g > 0) || (abs( $g ) <= Proj4php::$common->EPSLN) ) {
            $x = $this->a * $ksp * $cosphi * sin( $dlon );
            $y = $this->y0 + $this->a * $ksp * ($this->cos_p14 * $sinphi - $this->sin_p14 * $cosphi * $coslon);
        } else {
            Proj4php::reportError( "orthoFwdPointError" );
        }
        
        $p->x = $x;
        $p->y = $y;
        
        return $p;
    }

    /**
     *
     * @param type $p
     * @return type 
     */
    public function inverse( $p ) {
        
        /*
        $rh;  // height above ellipsoid	
        $z;  // angle
        $sinz;
        $cosz; // sin of z and cos of z	
        $temp;
        $con;
        $lon;
        $lat;
        */
        
        /* Inverse equations
          ----------------- */
        $p->x -= $this->x0;
        $p->y -= $this->y0;
        $rh = sqrt( $p->x * $p->x + $p->y * $p->y );
        if( $rh > $this->a + .0000001 ) {
            Proj4php::reportError( "orthoInvDataError" );
        }
        $z = Proj4php::$common->asinz( $rh / $this->a );

        $sinz = sin( $z );
        $cosz = cos( $z );

        $lon = $this->long0;
        if( abs( $rh ) <= Proj4php::$common->EPSLN ) {
            $lat = $this->lat0;
        }
        $lat = Proj4php::$common->asinz( $cosz * $this->sin_p14 + ($p->y * $sinz * $this->cos_p14) / $rh );
        $con = abs( $this->lat0 ) - Proj4php::$common->HALF_PI;
        if( abs( con ) <= Proj4php::$common->EPSLN ) {
            if( $this->lat0 >= 0 ) {
                $lon = Proj4php::$common->adjust_lon( $this->long0 + atan2( $p->x, -$p->y ) );
            } else {
                $lon = Proj4php::$common->adjust_lon( $this->long0 - atan2( -$p->x, $p->y ) );
            }
        }
        $con = $cosz - $this->sin_p14 * sin( $lat );
        
        $p->x = $lon;
        $p->y = $lat;
        
        return $p;
    }

}

Proj4php::$proj['ortho'] = new Proj4phpProjOrtho();