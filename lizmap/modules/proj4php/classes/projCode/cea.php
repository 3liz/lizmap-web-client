<?php
/*******************************************************************************
  NAME                    LAMBERT CYLINDRICAL EQUAL AREA

  PURPOSE:	Transforms input longitude and latitude to Easting and
  Northing for the Lambert Cylindrical Equal Area projection.
  This class of projection includes the Behrmann and
  Gall-Peters Projections.  The
  longitude and latitude must be in radians.  The Easting
  and Northing values will be returned in meters.

  PROGRAMMER              DATE
  ----------              ----
  R. Marsden              August 2009
  Winwaed Software Tech LLC, http://www.winwaed.com

  This function was adapted from the Miller Cylindrical Projection in the Proj4php
  library.

  Note: This implementation assumes a Spherical Earth. The (commented) code
  has been included for the ellipsoidal forward transform, but derivation of
  the ellispoidal inverse transform is beyond me. Note that most of the
  Proj4php implementations do NOT currently support ellipsoidal figures.
  Therefore this is not seen as a problem - especially this lack of support
  is explicitly stated here.

  ALGORITHM REFERENCES

  1.  "Cartographic Projection Procedures for the UNIX Environment -
  A User's Manual" by Gerald I. Evenden, USGS Open File Report 90-284
  and Release 4 Interim Reports (2003)

  2.  Snyder, John P., "Flattening the Earth - Two Thousand Years of Map
  Projections", Univ. Chicago Press, 1993
 ****************************************************************************** */

/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
class Proj4phpProjCea {
    /* Initialize the Cylindrical Equal Area projection
      ------------------------------------------- */

    public function init() {
        //no-op
    }

    /* Cylindrical Equal Area forward equations--mapping lat,long to x,y
      ------------------------------------------------------------ */
    public function forward( $p ) {
        
        $lon = $p->x;
        $lat = $p->y;
        
        /* Forward equations
          ----------------- */
        $dlon = Proj4php::$common->adjust_lon( $lon - $this->long0 );
        $x = $this->x0 + $this->a * $dlon * cos( $this->lat_ts );
        $y = $this->y0 + $this->a * sin( $lat ) / cos( $this->lat_ts );
        /* Elliptical Forward Transform
          Not implemented due to a lack of a matchign inverse function
          {
          $Sin_Lat = sin(lat);
          $Rn = $this->a * (sqrt(1.0e0 - $this->es * Sin_Lat * Sin_Lat ));
          x = $this->x0 + $this->a * dlon * cos($this->lat_ts);
          y = $this->y0 + Rn * sin(lat) / cos($this->lat_ts);
          }
         */

        $p->x = $x;
        $p->y = $y;
        
        return $p;
    }

    /**
     * Cylindrical Equal Area inverse equations--mapping x,y to lat/long
     * 
     * @param type $p
     * @return type 
     */
    public function inverse( $p ) {
        $p->x -= $this->x0;
        $p->y -= $this->y0;

        $p->x = Proj4php::$common->adjust_lon( $this->long0 + ($p->x / $this->a) / cos( $this->lat_ts ) );
        $p->y = asin( ($p->y / $this->a) * cos( $this->lat_ts ) );
        
        return $p;
    }
}

Proj4php::$proj['cea'] = new Proj4phpProjCea();