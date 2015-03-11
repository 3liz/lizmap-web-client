<?php
/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */

// Initialize the Stereographic projection
class Proj4phpProjStere {

    protected $TOL = 1.e-8;
    protected $NITER = 8;
    protected $CONV = 1.e-10;
    protected $S_POLE = 0;
    protected $N_POLE = 1;
    protected $OBLIQ = 2;
    protected $EQUIT = 3;

    /**
     *
     * @param type $phit
     * @param type $sinphi
     * @param type $eccen
     * @return type 
     */
    public function ssfn_( $phit, $sinphi, $eccen ) {
        $sinphi *= $eccen;
        return (tan( .5 * (Proj4php::$common->HALF_PI + $phit) ) * pow( (1. - $sinphi) / (1. + $sinphi), .5 * $eccen ));
    }
    
    /**
     * 
     */
    public function init() {
        $this->phits = $this->lat_ts ? $this->lat_ts : Proj4php::$common->HALF_PI;
        $t = abs( $this->lat0 );
        if( (abs( $t ) - Proj4php::$common->HALF_PI) < Proj4php::$common->EPSLN ) {
            $this->mode = $this->lat0 < 0. ? $this->S_POLE : $this->N_POLE;
        } else {
            $this->mode = $t > Proj4php::$common->EPSLN ? $this->OBLIQ : $this->EQUIT;
        }
        $this->phits = abs( $this->phits );
        if( $this->es ) {
            #$X;

            switch( $this->mode ) {
                case $this->N_POLE:
                case $this->S_POLE:
                    if( abs( $this->phits - Proj4php::$common->HALF_PI ) < Proj4php::$common->EPSLN ) {
                        $this->akm1 = 2. * $this->k0 / sqrt( pow( 1 + $this->e, 1 + $this->e ) * pow( 1 - $this->e, 1 - $this->e ) );
                    } else {
                        $t = sin( $this->phits );
                        $this->akm1 = cos( $this->phits ) / Proj4php::$common->tsfnz( $this->e, $this->phits, $t );
                        $t *= $this->e;
                        $this->akm1 /= sqrt( 1. - $t * $t );
                    }
                    break;
                case $this->EQUIT:
                    $this->akm1 = 2. * $this->k0;
                    break;
                case $this->OBLIQ:
                    $t = sin( $this->lat0 );
                    $X = 2. * atan( $this->ssfn_( $this->lat0, $t, $this->e ) ) - Proj4php::$common->HALF_PI;
                    $t *= $this->e;
                    $this->akm1 = 2. * $this->k0 * cos( $this->lat0 ) / sqrt( 1. - $t * $t );
                    $this->sinX1 = sin( $X );
                    $this->cosX1 = cos( $X );
                    break;
            }
        } else {
            switch( $this->mode ) {
                case $this->OBLIQ:
                    $this->sinph0 = sin( $this->lat0 );
                    $this->cosph0 = cos( $this->lat0 );
                case $this->EQUIT:
                    $this->akm1 = 2. * $this->k0;
                    break;
                case $this->S_POLE:
                case $this->N_POLE:
                    $this->akm1 = abs( $this->phits - Proj4php::$common->HALF_PI ) >= Proj4php::$common->EPSLN ?
                              cos( $this->phits ) / tan( Proj4php::$common->FORTPI - .5 * $this->phits ) :
                              2. * $this->k0;
                    break;
            }
        }
    }

    /**
     * Stereographic forward equations--mapping lat,long to x,y
     *
     * @param type $p
     * @return type 
     */
    public function forward( $p ) {
        
        $lon = $p->x;
        $lon = Proj4php::$common->adjust_lon( $lon - $this->long0 );
        $lat = $p->y;
        #$x;
        #$y;

        if( $this->sphere ) {
            /*
            $sinphi;
            $cosphi;
            $coslam;
            $sinlam;
            */
            
            $sinphi = sin( $lat );
            $cosphi = cos( $lat );
            $coslam = cos( $lon );
            $sinlam = sin( $lon );
            switch( $this->mode ) {
                case $this->EQUIT:
                    $y = 1. + $cosphi * $coslam;
                    if( y <= Proj4php::$common->EPSLN ) {
                        Proj4php::reportError("stere:forward:Equit");
                    }
                    $y = $this->akm1 / $y;
                    $x = $y * $cosphi * $sinlam;
                    $y *= $sinphi;
                    break;
                case $this->OBLIQ:
                    $y = 1. + $this->sinph0 * $sinphi + $this->cosph0 * $cosphi * $coslam;
                    if( $y <= Proj4php::$common->EPSLN ) {
                        Proj4php::reportError("stere:forward:Obliq");
                    }
                    $y = $this->akm1 / $y;
                    $x = $y * $cosphi * $sinlam;
                    $y *= $this->cosph0 * $sinphi - $this->sinph0 * $cosphi * $coslam;
                    break;
                case $this->N_POLE:
                    $coslam = -$coslam;
                    $lat = -$lat;
                //Note  no break here so it conitnues through S_POLE
                case $this->S_POLE:
                    if( abs( $lat - Proj4php::$common->HALF_PI ) < $this->TOL ) {
                        Proj4php::reportError("stere:forward:S_POLE");
                    }
                    $y = $this->akm1 * tan( Proj4php::$common->FORTPI + .5 * $lat );
                    $x = $sinlam * $y;
                    $y *= $coslam;
                    break;
            }
        } else {
            $coslam = cos( $lon );
            $sinlam = sin( $lon );
            $sinphi = sin( $lat );
            if( $this->mode == $this->OBLIQ || $this->mode == $this->EQUIT ) {
                $Xt = 2. * atan( $this->ssfn_( $lat, $sinphi, $this->e ) );
                $sinX = sin( $Xt - Proj4php::$common->HALF_PI );
                $cosX = cos( $Xt );
            }
            switch( $this->mode ) {
                case $this->OBLIQ:
                    $A = $this->akm1 / ($this->cosX1 * (1. + $this->sinX1 * $sinX + $this->cosX1 * $cosX * $coslam));
                    $y = $A * ($this->cosX1 * $sinX - $this->sinX1 * $cosX * $coslam);
                    $x = $A * $cosX;
                    break;
                case $this->EQUIT:
                    $A = 2. * $this->akm1 / (1. + $cosX * $coslam);
                    $y = $A * $sinX;
                    $x = $A * $cosX;
                    break;
                case $this->S_POLE:
                    $lat = -$lat;
                    $coslam = - $coslam;
                    $sinphi = -$sinphi;
                case $this->N_POLE:
                    $x = $this->akm1 * Proj4php::$common->tsfnz( $this->e, $lat, $sinphi );
                    $y = - $x * $coslam;
                    break;
            }
            $x = $x * $sinlam;
        }
        
        $p->x = $x * $this->a + $this->x0;
        $p->y = $y * $this->a + $this->y0;
        
        return $p;
    }


    /**
     * Stereographic inverse equations--mapping x,y to lat/long
     *
     * @param type $p
     * @return type 
     */
    public function inverse( $p ) {
        $x = ($p->x - $this->x0) / $this->a;   /* descale and de-offset */
        $y = ($p->y - $this->y0) / $this->a;
        /*
        $lon;
        $lat;
        $cosphi;
        $sinphi;
        $rho;
        $tp = 0.0;
        $phi_l = 0.0;
        $i;
        */
        $halfe = 0.0;
        $pi2 = 0.0;

        if( $this->sphere ) {
            /*
            $c;
            $rh;
            $sinc;
            $cosc;
            */
            
            $rh = sqrt( $x * $x + $y * $y );
            $c = 2. * atan( $rh / $this->akm1 );
            $sinc = sin( $c );
            $cosc = cos( $c );
            $lon = 0.;
            
            switch( $this->mode ) {
                case $this->EQUIT:
                    if( abs( $rh ) <= Proj4php::$common->EPSLN ) {
                        $lat = 0.;
                    } else {
                        $lat = asin( $y * $sinc / $rh );
                    }
                    if( $cosc != 0. || $x != 0. )
                        $lon = atan2( $x * $sinc, $cosc * $rh );
                    break;
                case $this->OBLIQ:
                    if( abs( $rh ) <= Proj4php::$common->EPSLN ) {
                        $lat = $this->phi0;
                    } else {
                        $lat = asin( $cosc * $this->sinph0 + $y * $sinc * $this->cosph0 / $rh );
                    }
                    $c = $cosc - $this->sinph0 * sin( $lat );
                    if( $c != 0. || $x != 0. ) {
                        $lon = atan2( $x * $sinc * $this->cosph0, $c * $rh );
                    }
                    break;
                case $this->N_POLE:
                    $y = -$y;
                case $this->S_POLE:
                    if( abs( $rh ) <= Proj4php::$common->EPSLN ) {
                        $lat = $this->phi0;
                    } else {
                        $lat = asin( $this->mode == $this->S_POLE ? -$cosc : $cosc  );
                    }
                    $lon = ($x == 0. && $y == 0.) ? 0. : atan2( $x, $y );
                    break;
            }
            $p->x = Proj4php::$common->adjust_lon( $lon + $this->long0 );
            $p->y = $lat;
        } else {
            $rho = sqrt( $x * $x + $y * $y );
            switch( $this->mode ) {
                case $this->OBLIQ:
                case $this->EQUIT:
                    $tp = 2. * atan2( $rho * $this->cosX1, $this->akm1 );
                    $cosphi = cos( $tp );
                    $sinphi = sin( $tp );
                    if( $rho == 0.0 ) {
                        $phi_l = asin( $cosphi * $this->sinX1 );
                    } else {
                        $phi_l = asin( $cosphi * $this->sinX1 + ($y * $sinphi * $this->cosX1 / $rho) );
                    }

                    $tp = tan( .5 * (Proj4php::$common->HALF_PI + $phi_l) );
                    $x *= $sinphi;
                    $y = $rho * $this->cosX1 * $cosphi - $y * $this->sinX1 * $sinphi;
                    $pi2 = Proj4php::$common->HALF_PI;
                    $halfe = .5 * $this->e;
                    break;
                case $this->N_POLE:
                    $y = -$y;
                case $this->S_POLE:
                    $tp = - $rho / $this->akm1;
                    $phi_l = Proj4php::$common->HALF_PI - 2. * atan( $tp );
                    $pi2 = -Proj4php::$common->HALF_PI;
                    $halfe = -.5 * $this->e;
                    break;
            }
            for( $i = $this->NITER; $i--; $phi_l = $lat ) { //check this
                $sinphi = $this->e * sin( $phi_l );
                $lat = 2. * atan( $tp * pow( (1. + $sinphi) / (1. - $sinphi), $halfe ) ) - $pi2;
                if( abs( phi_l - lat ) < $this->CONV ) {
                    if( $this->mode == $this->S_POLE )
                        $lat = -$lat;
                    $lon = ($x == 0. && $y == 0.) ? 0. : atan2( $x, $y );
                    $p->x = Proj4php::$common->adjust_lon( $lon + $this->long0 );
                    $p->y = $lat;
                    return $p;
                }
            }
        }
    }

}

Proj4php::$proj['stere'] = new Proj4phpProjStere();