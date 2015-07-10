<?php
/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */


/* Function to compute, phi4, the latitude for the inverse of the
  Polyconic projection.
  ------------------------------------------------------------ */
function phi4z( $eccent, $e0, $e1, $e2, $e3, $a, $b, &$c, $phi ) {
    /*
    $sinphi;
    $sin2ph;
    $tanph;
    $ml;
    $mlp;
    $con1;
    $con2;
    $con3;
    $dphi;
    $i;
    */

    $phi = $a;
    for( $i = 1; $i <= 15; $i++ ) {
        $sinphi = sin( $phi );
        $tanphi = tan( $phi );
        $c = $tanphi * sqrt( 1.0 - $eccent * $sinphi * $sinphi );
        $sin2ph = sin( 2.0 * $phi );
        /*
          ml = e0 * *phi - e1 * sin2ph + e2 * sin (4.0 *  *phi);
          mlp = e0 - 2.0 * e1 * cos (2.0 *  *phi) + 4.0 * e2 *  cos (4.0 *  *phi);
         */
        $ml = $e0 * $phi - $e1 * $sin2ph + $e2 * sin( 4.0 * $phi ) - $e3 * sin( 6.0 * $phi );
        $mlp = $e0 - 2.0 * $e1 * cos( 2.0 * $phi ) + 4.0 * $e2 * cos( 4.0 * $phi ) - 6.0 * $e3 * cos( 6.0 * $phi );
        $con1 = 2.0 * $ml + $c * ($ml * $ml + $b) - 2.0 * $a * ($c * $ml + 1.0);
        $con2 = $eccent * $sin2ph * ($ml * $ml + $b - 2.0 * $a * $ml) / (2.0 * $c);
        $con3 = 2.0 * ($a - $ml) * ($c * $mlp - 2.0 / $sin2ph) - 2.0 * $mlp;
        $dphi = $con1 / ($con2 + $con3);
        $phi += $dphi;
        if( abs( $dphi ) <= .0000000001 )
            return($phi);
    }
    
    Proj4php::reportError( "phi4z: No convergence" );
    
    return null;
}

/* Function to compute the constant e4 from the input of the eccentricity
  of the spheroid, x.  This constant is used in the Polar Stereographic
  projection.
  -------------------------------------------------------------------- */
function e4fn( $x ) {
    #$con;
    #$com;
    $con = 1.0 + $x;
    $com = 1.0 - $x;
    return (sqrt( (pow( $con, $con )) * (pow( $com, $com )) ));
}

/* * *****************************************************************************
  NAME                             POLYCONIC

  PURPOSE:	Transforms input longitude and latitude to Easting and
  Northing for the Polyconic projection.  The
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

class Proj4phpProjPoly {
    
    /* Initialize the POLYCONIC projection
      ---------------------------------- */
    public function init() {
        #$temp;   /* temporary variable		 */
        if( $this->lat0 == 0 )
            $this->lat0 = 90; //$this->lat0 ca

        /* Place parameters in static storage for common use
          ------------------------------------------------- */
        $this->temp = $this->b / $this->a;
        $this->es = 1.0 - pow( $this->temp, 2 ); // devait etre dans tmerc.js mais n y est pas donc je commente sinon retour de valeurs nulles 
        $this->e = sqrt( $this->es );
        $this->e0 = Proj4php::$common->e0fn( $this->es );
        $this->e1 = Proj4php::$common->e1fn( $this->es );
        $this->e2 = Proj4php::$common->e2fn( $this->es );
        $this->e3 = Proj4php::$common->e3fn( $this->es );
        $this->ml0 = Proj4php::$common->mlfn( $this->e0, $this->e1, $this->e2, $this->e3, $this->lat0 ); //si que des zeros le calcul ne se fait pas
        //if (!$this->ml0) {$this->ml0=0;}
    }

    /* Polyconic forward equations--mapping lat,long to x,y
      --------------------------------------------------- */
    public function forward( $p ) {
        
        /*
        $sinphi;
        $cosphi; // sin and cos value
        $al;    // temporary values
        $c;    // temporary values
        $con;
        $ml;  // cone constant, small m	
        $ms;    // small m
        $x;
        $y;
        */
        
        $lon = $p->x;
        $lat = $p->y;

        $con = Proj4php::$common->adjust_lon( $lon - $this->long0 );
        
        if( abs( $lat ) <= .0000001 ) {
            $x = $this->x0 + $this->a * $con;
            $y = $this->y0 - $this->a * $this->ml0;
        } else {
            $sinphi = sin( $lat );
            $cosphi = cos( $lat );
            
            $ml = Proj4php::$common->mlfn( $this->e0, $this->e1, $this->e2, $this->e3, $lat );
            $ms = Proj4php::$common->msfnz( $this->e, $sinphi, $cosphi );
            
            $x = $this->x0 + $this->a * $ms * sin( $sinphi ) / $sinphi;
            $y = $this->y0 + $this->a * ($ml - $this->ml0 + $ms * (1.0 - cos( $sinphi )) / $sinphi);
        }

        $p->x = $x;
        $p->y = $y;
        
        return $p;
    }

    /* Inverse equations
      ----------------- */
    public function inverse( $p ) {
        
        /*
        $sin_phi;
        $cos_phi; // sin and cos values
        $al;     // temporary values
        $b;     // temporary values
        $c;     // temporary values
        $con;
        $ml;   // cone constant, small m
        $iflg;    // error flag	
        $lon;
        $lat;
        */
        
        $p->x -= $this->x0;
        $p->y -= $this->y0;
        $al = $this->ml0 + $p->y / $this->a;
        $iflg = 0;

        if( abs( $al ) <= .0000001 ) {
            $lon = $p->x / $this->a + $this->long0;
            $lat = 0.0;
        } else {
            $b = $al * $al + ($p->x / $this->a) * ($p->x / $this->a);
            $iflg = phi4z( $this->es, $this->e0, $this->e1, $this->e2, $this->e3, $this->al, $b, $c, $lat );
            if( $iflg != 1 )
                return($iflg);
            $lon = Proj4php::$common->adjust_lon( (Proj4php::$common->asinz( $p->x * $c / $this->a ) / sin( $lat )) + $this->long0 );
        }

        $p->x = $lon;
        $p->y = $lat;
        return $p;
    }

}

Proj4php::$proj['poly'] = new Proj4phpProjPoly();