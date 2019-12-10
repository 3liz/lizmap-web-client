<?php

/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4js from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodmap.com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
class Proj4phpCommon {

    public $PI = M_PI; #3.141592653589793238; //Math.PI,
    public $HALF_PI = M_PI_2; #1.570796326794896619; //Math.PI*0.5,
    public $TWO_PI = 6.283185307179586477; //Math.PI*2,
    public $FORTPI = 0.78539816339744833;
    public $R2D = 57.29577951308232088;
    public $D2R = 0.01745329251994329577;
    public $SEC_TO_RAD = 4.84813681109535993589914102357e-6; /* SEC_TO_RAD = Pi/180/3600 */
    public $EPSLN = 1.0e-10;
    public $MAX_ITER = 20;
    // following constants from geocent.c
    public $COS_67P5 = 0.38268343236508977;  /* cosine of 67.5 degrees */
    public $AD_C = 1.0026000;                /* Toms region 1 constant */

    /* datum_type values */
    public $PJD_UNKNOWN = 0;
    public $PJD_3PARAM = 1;
    public $PJD_7PARAM = 2;
    public $PJD_GRIDSHIFT = 3;
    public $PJD_WGS84 = 4;   // WGS84 or equivalent
    public $PJD_NODATUM = 5;   // WGS84 or equivalent

    const SRS_WGS84_SEMIMAJOR = 6378137.0;  // only used in grid shift transforms

    // ellipoid pj_set_ell.c

    public $SIXTH = .1666666666666666667; /* 1/6 */
    public $RA4 = .04722222222222222222; /* 17/360 */
    public $RA6 = .02215608465608465608; /* 67/3024 */
    public $RV4 = .06944444444444444444; /* 5/72 */
    public $RV6 = .04243827160493827160; /* 55/1296 */


    /* meridinal distance for ellipsoid and inverse
     * *	8th degree - accurate to < 1e-5 meters when used in conjuction
     * *		with typical major axis values.
     * *	Inverse determines phi to EPS (1e-11) radians, about 1e-6 seconds.
     */
    protected $C00 = 1.0;
    protected $C02 = .25;
    protected $C04 = .046875;
    protected $C06 = .01953125;
    protected $C08 = .01068115234375;
    protected $C22 = .75;
    protected $C44 = .46875;
    protected $C46 = .01302083333333333333;
    protected $C48 = .00712076822916666666;
    protected $C66 = .36458333333333333333;
    protected $C68 = .00569661458333333333;
    protected $C88 = .3076171875;

    /**
     * Function to compute the constant small m which is the radius of
     * a parallel of latitude, phi, divided by the semimajor axis.
     * 
     * @param type $eccent
     * @param type $sinphi
     * @param type $cosphi
     * @return type
     */
    public function msfnz( $eccent, $sinphi, $cosphi ) {
        
        $con = $eccent * $sinphi;
        
        return $cosphi / (sqrt( 1.0 - $con * $con ));
    }

    /**
     * Function to compute the constant small t for use in the forward
     * computations in the Lambert Conformal Conic and the Polar
     * Stereographic projections.
     * 
     * @param type $eccent
     * @param type $phi
     * @param type $sinphi
     * @return type
     */
    public function tsfnz( $eccent, $phi, $sinphi ) {
        
        $con = $eccent * $sinphi;
        $com = 0.5 * $eccent;
        $con = pow( ((1.0 - $con) / (1.0 + $con) ), $com );
        
        return (tan( .5 * (M_PI_2 - $phi) ) / $con);
    }

    /**
     * Function to compute the latitude angle, phi2, for the inverse of the
     * Lambert Conformal Conic and Polar Stereographic projections.
     * 
     * rise up an assertion if there is no convergence.
     * 
     * @param type $eccent
     * @param type $ts
     * @return type
     */
    public function phi2z( $eccent, $ts ) {
        
        $eccnth = .5 * $eccent;
        $phi = M_PI_2 - 2 * atan( $ts );
        
        for( $i = 0; $i <= 15; $i++ ) {
            $con = $eccent * sin( $phi );
            $dphi = M_PI_2 - 2 * atan( $ts * (pow( ((1.0 - $con) / (1.0 + $con) ), $eccnth )) ) - $phi;
            $phi += $dphi;
            if( abs( $dphi ) <= .0000000001 )
                return $phi;
        }
        assert( "false; /* phi2z has NoConvergence */" );
        
        return (-9999);
    }

    /**
     * Function to compute constant small q which is the radius of a 
     * parallel of latitude, phi, divided by the semimajor axis.
     * 
     * @param type $eccent
     * @param type $sinphi
     * @return type
     */
    public function qsfnz( $eccent, $sinphi ) {
        
        if( $eccent > 1.0e-7 ) {
            
            $con = $eccent * $sinphi;
            
            return (( 1.0 - $eccent * $eccent) * ($sinphi / (1.0 - $con * $con) - (.5 / $eccent) * log( (1.0 - $con) / (1.0 + $con) )));
        }
        
        return (2.0 * $sinphi);
    }

    /**
     * Function to eliminate roundoff errors in asin
     * 
     * @param type $x
     * @return type
     */
    public function asinz( $x ) {
        
        return asin( 
            abs( $x ) > 1.0 ? ($x > 1.0 ? 1.0 : -1.0) : $x 
        );
        
        #if( abs( $x ) > 1.0 ) {
        #    $x = ($x > 1.0) ? 1.0 : -1.0;
        #}
        #return asin( $x );
    }

    /**
     * following functions from gctpc cproj.c for transverse mercator projections
     * 
     * @param type $x
     * @return type
     */
    public function e0fn( $x ) {
        return (1.0 - 0.25 * $x * (1.0 + $x / 16.0 * (3.0 + 1.25 * $x)));
    }

    /**
     * 
     * @param type $x
     * @return type
     */
    public function e1fn( $x ) {
        return (0.375 * $x * (1.0 + 0.25 * $x * (1.0 + 0.46875 * $x)));
    }

    /**
     * 
     * @param type $x
     * @return type
     */
    public function e2fn( $x ) {
        return (0.05859375 * $x * $x * (1.0 + 0.75 * $x));
    }

    /**
     * 
     * @param type $x
     * @return type
     */
    public function e3fn( $x ) {
        return ($x * $x * $x * (35.0 / 3072.0));
    }

    /**
     * 
     * @param type $e0
     * @param type $e1
     * @param type $e2
     * @param type $e3
     * @param type $phi
     * @return type
     */
    public function mlfn( $e0, $e1, $e2, $e3, $phi ) {
        return ($e0 * $phi - $e1 * sin( 2.0 * $phi ) + $e2 * sin( 4.0 * $phi ) - $e3 * sin( 6.0 * $phi ));
    }

    /**
     * 
     * @param type $esinp
     * @param type $exp
     * @return type
     */
    public function srat( $esinp, $exp ) {
        return (pow( (1.0 - $esinp) / (1.0 + $esinp), $exp ));
    }

    /**
     * Function to return the sign of an argument
     * 
     * @param type $x
     * @return type
     */
    public function sign( $x ) {
        
        return $x < 0.0 ? -1 : 1;
    }

    /**
     * Function to adjust longitude to -180 to 180; input in radians
     * 
     * @param type $x
     * @return type
     */
    public function adjust_lon( $x ) {
        
        return (abs( $x ) < M_PI) ? $x : ($x - ($this->sign( $x ) * $this->TWO_PI) );
    }

    /**
     * IGNF - DGR : algorithms used by IGN France
     * Function to adjust latitude to -90 to 90; input in radians
     * 
     * @param type $x
     * @return type
     */
    public function adjust_lat( $x ) {
        
        $x = (abs( $x ) < M_PI_2) ? $x : ($x - ($this->sign( $x ) * M_PI) );
        
        return $x;
    }

    /**
     * Latitude Isometrique - close to tsfnz ...
     * 
     * @param type $eccent
     * @param float $phi
     * @param type $sinphi
     * @return string
     */
    public function latiso( $eccent, $phi, $sinphi ) {
        
        if( abs( $phi ) > M_PI_2 )
            return +NaN;
        if( $phi == M_PI_2 )
            return INF;
        if( $phi == -1.0 * M_PI_2 )
            return -1.0 * INF;

        $con = $eccent * $sinphi;
        
        return log( tan( (M_PI_2 + $phi) / 2.0 ) ) + $eccent * log( (1.0 - $con) / (1.0 + $con) ) / 2.0;
    }

    /**
     * 
     * @param type $x
     * @param type $L
     * @return type
     */
    public function fL( $x, $L ) {
        return 2.0 * atan( $x * exp( $L ) ) - M_PI_2;
    }

    /**
     * Inverse Latitude Isometrique - close to ph2z
     * 
     * @param type $eccent
     * @param type $ts
     * @return type
     */
    public function invlatiso( $eccent, $ts ) {
        
        $phi = $this->fL( 1.0, $ts );
        $Iphi = 0.0;
        $con = 0.0;
        
        do {
            $Iphi = $phi;
            $con = $eccent * sin( $Iphi );
            $phi = $this->fL( exp( $eccent * log( (1.0 + $con) / (1.0 - $con) ) / 2.0 ), $ts );
        } while( abs( $phi - $Iphi ) > 1.0e-12 );
        
        return $phi;
    }

    /**
     * Grande Normale
     * 
     * @param type $a
     * @param type $e
     * @param type $sinphi
     * @return type
     */
    public function gN( $a, $e, $sinphi ) {
        $temp = $e * $sinphi;
        return $a / sqrt( 1.0 - $temp * $temp );
    }

    /**
     * code from the PROJ.4 pj_mlfn.c file;  this may be useful for other projections
     * 
     * @param type $es
     * @return type
     */
    public function pj_enfn( $es ) {

        $en = array( );
        $en[0] = $this->C00 - $es * ($this->C02 + $es * ($this->C04 + $es * ($this->C06 + $es * $this->C08)));
        $en[1] = $es * ($this->C22 - $es * ($this->C04 + $es * ($this->C06 + $es * $this->C08)));
        $t = $es * $es;
        $en[2] = $t * ($this->C44 - $es * ($this->C46 + $es * $this->C48));
        $t *= $es;
        $en[3] = $t * ($this->C66 - $es * $this->C68);
        $en[4] = $t * $es * $this->C88;
        
        return $en;
    }

    /**
     * 
     * @param type $phi
     * @param type $sphi
     * @param type $cphi
     * @param type $en
     * @return type
     */
    public function pj_mlfn( $phi, $sphi, $cphi, $en ) {
        
        $cphi *= $sphi;
        $sphi *= $sphi;
        
        return ($en[0] * $phi - $cphi * ($en[1] + $sphi * ($en[2] + $sphi * ($en[3] + $sphi * $en[4]))));
    }

    /**
     * 
     * @param type $arg
     * @param type $es
     * @param type $en
     * @return type
     */
    public function pj_inv_mlfn( $arg, $es, $en ) {
        
        $k = (float) 1 / (1 - $es);
        $phi = $arg;
        
        for( $i = Proj4php::$common->MAX_ITER; $i; --$i ) { /* rarely goes over 2 iterations */
            $s = sin( $phi );
            $t = 1. - $es * $s * $s;
            //$t = $this->pj_mlfn($phi, $s, cos($phi), $en) - $arg;
            //$phi -= $t * ($t * sqrt($t)) * $k;
            $t = ($this->pj_mlfn( $phi, $s, cos( $phi ), $en ) - $arg) * ($t * sqrt( $t )) * $k;
            $phi -= $t;
            if( abs( $t ) < Proj4php::$common->EPSLN )
                return $phi;
        }

        Proj4php::reportError( "cass:pj_inv_mlfn: Convergence error" );

        return $phi;
    }

}
