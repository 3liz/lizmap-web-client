<?php
/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
/*******************************************************************************
  NAME                    VAN DER GRINTEN

  PURPOSE:	Transforms input Easting and Northing to longitude and
  latitude for the Van der Grinten projection.  The
  Easting and Northing must be in meters.  The longitude
  and latitude values will be returned in radians.

  PROGRAMMER              DATE
  ----------              ----
  T. Mittan		March, 1993

  This function was adapted from the Van Der Grinten projection code
  (FORTRAN) in the General Cartographic Transformation Package software
  which is available from the U.S. Geological Survey National Mapping Division.

  ALGORITHM REFERENCES

  1.  "New Equal-Area Map Projections for Noncircular Regions", John P. Snyder,
  The American Cartographer, Vol 15, No. 4, October 1988, pp. 341-355.

  2.  Snyder, John P., "Map Projections--A Working Manual", U.S. Geological
  Survey Professional Paper 1395 (Supersedes USGS Bulletin 1532), United
  State Government Printing Office, Washington D.C., 1987.

  3.  "Software Documentation for GCTP General Cartographic Transformation
  Package", U.S. Geological Survey National Mapping Division, May 1982.
 * ***************************************************************************** */

class Proj4phpProjVandg {
    
    /* Initialize the Van Der Grinten projection
      ---------------------------------------- */
    public function init() {
        $this->R = 6370997.0; //Radius of earth
    }

    /**
     *
     * @param type $p
     * @return type 
     */
    public function forward( $p ) {

        $lon = $p->x;
        $lat = $p->y;

        /* Forward equations
          ----------------- */
        $dlon = Proj4php::$common->adjust_lon( $lon - $this->long0 );
        $x;
        $y;

        if( abs( $lat ) <= Proj4php::$common->EPSLN ) {
            $x = $this->x0 + $this->R * $dlon;
            $y = $this->y0;
        }
        $theta = Proj4php::$common->asinz( 2.0 * abs( $lat / Proj4php::$common->PI ) );
        if( (abs( $dlon ) <= Proj4php::$common->EPSLN) || (abs( abs( $lat ) - Proj4php::$common->HALF_PI ) <= Proj4php::$common->EPSLN) ) {
            $x = $this->x0;
            if( $lat >= 0 ) {
                $y = $this->y0 + Proj4php::$common->PI * $this->R * tan( .5 * $theta );
            } else {
                $y = $this->y0 + Proj4php::$common->PI * $this->R * - tan( .5 * $theta );
            }
            //  return(OK);
        }
        $al = .5 * abs( (Proj4php::$common->PI / $dlon) - ($dlon / Proj4php::$common->PI) );
        $asq = $al * $al;
        $sinth = sin( $theta );
        $costh = cos( $theta );

        $g = $costh / ($sinth + $costh - 1.0);
        $gsq = $g * $g;
        $m = $g * (2.0 / $sinth - 1.0);
        $msq = $m * $m;
        $con = Proj4php::$common->PI * $this->R * ($al * ($g - $msq) + sqrt( $asq * ($g - $sq) * ($g - $msq) - ($msq + $asq) * ($gsq - $msq) )) / ($msq + $asq);
        if( $dlon < 0 ) {
            $con = -$con;
        }
        $x = $this->x0 + $con;
        $con = abs( $con / (Proj4php::$common->PI * $this->R) );
        if( $lat >= 0 ) {
            $y = $this->y0 + Proj4php::$common->PI * $this->R * sqrt( 1.0 - $con * $con - 2.0 * $al * $con );
        } else {
            $y = $this->y0 - Proj4php::$common->PI * $this->R * sqrt( 1.0 - $con * $con - 2.0 * $al * $con );
        }
        
        $p->x = $x;
        $p->y = $y;
        
        return $p;
    }

    /* Van Der Grinten inverse equations--mapping x,y to lat/long
      --------------------------------------------------------- */

    public function inverse( $p ) {
        
        /*
        $dlon;
        $xx;
        $yy;
        $xys;
        $c1;
        $c2;
        $c3;
        $al;
        $asq;
        $a1;
        $m1;
        $con;
        $th1;
        $d;
        */
        
        /* inverse equations
          ----------------- */
        $p->x -= $this->x0;
        $p->y -= $this->y0;
        $con = Proj4php::$common->PI * $this->R;
        $xx = $p->x / $con;
        $yy = $p->y / $con;
        $xys = $xx * $xx + $yy * $yy;
        $c1 = -abs( $yy ) * (1.0 + $xys);
        $c2 = $c1 - 2.0 * $yy * $yy + $xx * $xx;
        $c3 = -2.0 * $c1 + 1.0 + 2.0 * $yy * $yy + $xys * $xys;
        $d = $yy * $yy / $c3 + (2.0 * $c2 * $c2 * $c2 / $c3 / $c3 / $c3 - 9.0 * $c1 * $c2 / $c3 / $c3) / 27.0;
        $a1 = ($c1 - $c2 * $c2 / 3.0 / $c3) / $c3;
        $m1 = 2.0 * sqrt( -$a1 / 3.0 );
        $con = ((3.0 * $d) / $a1) / $m1;
        if( abs( $con ) > 1.0 ) {
            if( $con >= 0.0 ) {
                $con = 1.0;
            } else {
                $con = -1.0;
            }
        }
        $th1 = acos( $con ) / 3.0;
        if( $p->$y >= 0 ) {
            $lat = (-$m1 * cos( $th1 + Proj4php::$common->PI / 3.0 ) - $c2 / 3.0 / $c3) * Proj4php::$common->PI;
        } else {
            $lat = -(-$m1 * cos( $th1 + Proj4php::$common->PI / 3.0 ) - $c2 / 3.0 / $c3) * Proj4php::$common->PI;
        }

        if( abs( $xx ) < Proj4php::$common->EPSLN ) {
            $lon = $this->long0;
        }
        $lon = Proj4php::$common->adjust_lon( $this->long0 + Proj4php::$common->PI * ($xys - 1.0 + sqrt( 1.0 + 2.0 * ($xx * $xx - $yy * $yy) + $xys * $xys )) / 2.0 / $xx );

        $p->x = $lon;
        $p->y = $lat;
        
        return $p;
    }

}

Proj4php::$proj['vandg'] = new Proj4phpProjVandg();
