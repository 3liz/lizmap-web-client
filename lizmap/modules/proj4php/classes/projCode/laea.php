<?php

/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
/* * *****************************************************************************
  NAME                  LAMBERT AZIMUTHAL EQUAL-AREA

  PURPOSE:	Transforms input longitude and latitude to Easting and
  Northing for the Lambert Azimuthal Equal-Area projection.  The
  longitude and latitude must be in radians.  The Easting
  and Northing values will be returned in meters.

  PROGRAMMER              DATE
  ----------              ----
  D. Steinwand, EROS      March, 1991

  This function was adapted from the Lambert Azimuthal Equal Area projection
  code (FORTRAN) in the General Cartographic Transformation Package software
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

class Proj4phpProjLaea {

    protected $S_POLE = 1;
    protected $N_POLE = 2;
    protected $EQUIT = 3;
    protected $OBLIQ = 4;

    protected $P00 = .33333333333333333333;
    protected $P01 = .17222222222222222222;
    protected $P02 = .10257936507936507936;
    protected $P10 = .06388888888888888888;
    protected $P11 = .06640211640211640211;
    protected $P20 = .01641501294219154443;
    
    /* Initialize the Lambert Azimuthal Equal Area projection
      ------------------------------------------------------ */
    public function init() {
        $t = abs( $this->lat0 );
        if( abs( $t - Proj4php::$common->HALF_PI ) < Proj4php::$common->EPSLN ) {
            $this->mode = $this->lat0 < 0. ? $this->S_POLE : $this->N_POLE;
        } else if( abs( $t ) < Proj4php::$common->EPSLN ) {
            $this->mode = $this->EQUIT;
        } else {
            $this->mode = $this->OBLIQ;
        }
        if( $this->es > 0 ) {
            #$sinphi;

            $this->qp = Proj4php::$common->qsfnz( $this->e, 1.0 );
            $this->mmf = .5 / (1. - $this->es);
            $this->apa = $this->authset( $this->es );
            switch( $this->mode ) {
                case $this->N_POLE:
                case $this->S_POLE:
                    $this->dd = 1.;
                    break;
                case $this->EQUIT:
                    $this->rq = sqrt( .5 * $this->qp );
                    $this->dd = 1. / $this->rq;
                    $this->xmf = 1.;
                    $this->ymf = .5 * $this->qp;
                    break;
                case $this->OBLIQ:
                    $this->rq = sqrt( .5 * $this->qp );
                    $sinphi = sin( $this->lat0 );
                    $this->sinb1 = Proj4php::$common->qsfnz( $this->e, $sinphi ) / $this->qp;
                    $this->cosb1 = sqrt( 1. - $this->sinb1 * $this->sinb1 );
                    $this->dd = cos( $this->lat0 ) / (sqrt( 1. - $this->es * $sinphi * $sinphi ) * $this->rq * $this->cosb1);
                    $this->ymf = ($this->xmf = $this->rq) / $this->dd;
                    $this->xmf *= $this->dd;
                    break;
            }
        } else {
            if( $this->mode == $this->OBLIQ ) {
                $this->sinph0 = sin( $this->lat0 );
                $this->cosph0 = cos( $this->lat0 );
            }
        }
    }

    /* Lambert Azimuthal Equal Area forward equations--mapping lat,long to x,y
      ----------------------------------------------------------------------- */
    public function forward( $p ) {

        /* Forward equations
          ----------------- */
        #$x;
        #$y;
        $lam = $p->x;
        $phi = $p->y;
        $lam = Proj4php::$common->adjust_lon( $lam - $this->long0 );

        if( $this->sphere ) {
            /*
            $coslam;
            $cosphi;
            $sinphi;
            */
            
            $sinphi = sin( $phi );
            $cosphi = cos( $phi );
            $coslam = cos( $lam );
            switch( $this->mode ) {
                case $this->OBLIQ:
                case $this->EQUIT:
                    $y = ($this->mode == $this->EQUIT) ? 1. + $cosphi * $coslam : 1. + $this->sinph0 * $sinphi + $this->cosph0 * $cosphi * $coslam;
                    if( $y <= Proj4php::$common->EPSLN ) {
                        Proj4php::reportError( "laea:fwd:y less than eps" );
                        return null;
                    }
                    $y = sqrt( 2. / $y );
                    $x = $y * $cosphi * sin( $lam );
                    $y *= ($this->mode == $this->EQUIT) ? $sinphi : $this->cosph0 * $sinphi - $this->sinph0 * $cosphi * $coslam;
                    break;
                case $this->N_POLE:
                    $coslam = -$coslam;
                case $this->S_POLE:
                    if( abs( $phi + $this->phi0 ) < Proj4php::$common->EPSLN ) {
                        Proj4php::reportError( "laea:fwd:phi < eps" );
                        return null;
                    }
                    $y = Proj4php::$common->FORTPI - $phi * .5;
                    $y = 2. * (($this->mode == $this->S_POLE) ? cos( $y ) : sin( $y ));
                    $x = $y * sin( $lam );
                    $y *= $coslam;
                    break;
            }
        } else {
            /*
            $coslam;
            $sinlam;
            $sinphi;
            $q;
            */
            $sinb = 0.0;
            $cosb = 0.0;
            $b = 0.0;

            $coslam = cos( $lam );
            $sinlam = sin( $lam );
            $sinphi = sin( $phi );
            $q = Proj4php::$common->qsfnz( $this->e, $sinphi );
            if( $this->mode == $this->OBLIQ || $this->mode == $this->EQUIT ) {
                $sinb = $q / $this->qp;
                $cosb = sqrt( 1. - $sinb * $sinb );
            }
            switch( $this->mode ) {
                case $this->OBLIQ:
                    $b = 1. + $this->sinb1 * $sinb + $this->cosb1 * $cosb * $coslam;
                    break;
                case $this->EQUIT:
                    $b = 1. + $cosb * $coslam;
                    break;
                case $this->N_POLE:
                    $b = Proj4php::$common->HALF_PI + $phi;
                    $q = $this->qp - $q;
                    break;
                case $this->S_POLE:
                    $b = $phi - Proj4php::$common->HALF_PI;
                    $q = $this->qp + $q;
                    break;
            }
            if( abs( $b ) < Proj4php::$common->EPSLN ) {
                Proj4php::reportError( "laea:fwd:b < eps" );
                return null;
            }
            switch( $this->mode ) {
                case $this->OBLIQ:
                case $this->EQUIT:
                    $b = sqrt( 2. / $b );
                    if( $this->mode == $this->OBLIQ ) {
                        $y = $this->ymf * $b * ($this->cosb1 * $sinb - $this->sinb1 * $cosb * $coslam);
                    } else {
                        $y = ($b = sqrt( 2. / (1. + $cosb * $coslam) )) * $sinb * $this->ymf;
                    }
                    $x = $this->xmf * $b * $cosb * $sinlam;
                    break;
                case $this->N_POLE:
                case $this->S_POLE:
                    if( $q >= 0. ) {
                        $x = ($b = sqrt( $q )) * $sinlam;
                        $y = $coslam * (($this->mode == $this->S_POLE) ? $b : -$b);
                    } else {
                        $x = $y = 0.;
                    }
                    break;
            }
        }

        //v 1.0
        /*
          $sin_lat=sin(lat);
          $cos_lat=cos(lat);

          $sin_delta_lon=sin(delta_lon);
          $cos_delta_lon=cos(delta_lon);

          $g =$this->sin_lat_o * sin_lat +$this->cos_lat_o * cos_lat * cos_delta_lon;
          if (g == -1.0) {
          Proj4php::reportError("laea:fwd:Point projects to a circle of radius "+ 2.0 * R);
          return null;
          }
          $ksp = $this->a * sqrt(2.0 / (1.0 + g));
          $x = ksp * cos_lat * sin_delta_lon + $this->x0;
          $y = ksp * ($this->cos_lat_o * sin_lat - $this->sin_lat_o * cos_lat * cos_delta_lon) + $this->y0;
         */
        $p->x = $this->a * $x + $this->x0;
        $p->y = $this->a * $y + $this->y0;
        
        return $p;
    }
    
    /* Inverse equations
      ----------------- */
    public function inverse( $p ) {
        $p->x -= $this->x0;
        $p->y -= $this->y0;
        $x = $p->x / $this->a;
        $y = $p->y / $this->a;

        if( $this->sphere ) {
            $cosz = 0.0;
            #$rh;
            $sinz = 0.0;

            $rh = sqrt( $x * $x + $y * $y );
            $phi = $rh * .5;
            if( $phi > 1. ) {
                Proj4php::reportError( "laea:Inv:DataError" );
                return null;
            }
            $phi = 2. * asin( $phi );
            if( $this->mode == $this->OBLIQ || $this->mode == $this->EQUIT ) {
                $sinz = sin( $phi );
                $cosz = cos( $phi );
            }
            switch( $this->mode ) {
                case $this->EQUIT:
                    $phi = (abs( $rh ) <= Proj4php::$common->EPSLN) ? 0. : asin( $y * $sinz / $rh );
                    $x *= $sinz;
                    $y = $cosz * $rh;
                    break;
                case $this->OBLIQ:
                    $phi = (abs( $rh ) <= Proj4php::$common->EPSLN) ? $this->phi0 : asin( $cosz * $this->sinph0 + $y * $sinz * $this->cosph0 / $rh );
                    $x *= $sinz * $this->cosph0;
                    $y = ($cosz - sin( $phi ) * $this->sinph0) * $rh;
                    break;
                case $this->N_POLE:
                    $y = -$y;
                    $phi = Proj4php::$common->HALF_PI - $phi;
                    break;
                case $this->S_POLE:
                    $phi -= Proj4php::$common->HALF_PI;
                    break;
            }
            $lam = ($y == 0. && ($this->mode == $this->EQUIT || $this->mode == $this->OBLIQ)) ? 0. : atan2( $x, $y );
        } else {
            /*
            $cCe;
            $sCe;
            $q;
            $rho;
            */
            $ab = 0.0;

            switch( $this->mode ) {
                case $this->EQUIT:
                case $this->OBLIQ:
                    $x /= $this->dd;
                    $y *= $this->dd;
                    $rho = sqrt( $x * $x + $y * $y );
                    if( $rho < Proj4php::$common->EPSLN ) {
                        $p->x = 0.;
                        $p->y = $this->phi0;
                        return $p;
                    }
                    $sCe = 2. * asin( .5 * $rho / $this->rq );
                    $cCe = cos( $sCe );
                    $x *= ($sCe = sin( $sCe ));
                    if( $this->mode == $this->OBLIQ ) {
                        $ab = $cCe * $this->sinb1 + $y * $sCe * $this->cosb1 / $rho;
                        $q = $this->qp * $ab;
                        $y = $rho * $this->cosb1 * $cCe - $y * $this->sinb1 * $sCe;
                    } else {
                        $ab = $y * $sCe / $rho;
                        $q = $this->qp * $ab;
                        $y = $rho * $cCe;
                    }
                    break;
                case $this->N_POLE:
                    $y = -$y;
                case $this->S_POLE:
                    $q = ($x * $x + $y * $y);
                    if( !$q ) {
                        $p->x = 0.;
                        $p->y = $this->phi0;
                        return $p;
                    }
                    /*
                      q = $this->qp - q;
                     */
                    $ab = 1. - $q / $this->qp;
                    if( $this->mode == $this->S_POLE ) {
                        $ab = - $ab;
                    }
                    break;
            }
            $lam = atan2( $x, $y );
            $phi = $this->authlat( asin( $ab ), $this->apa );
        }

        /*
          $Rh = sqrt($p->x *$p->x +$p->y * $p->y);
          $temp = Rh / (2.0 * $this->a);

          if (temp > 1) {
          Proj4php::reportError("laea:Inv:DataError");
          return null;
          }

          $z = 2.0 * Proj4php::$common.asinz(temp);
          $sin_z=sin(z);
          $cos_z=cos(z);

          $lon =$this->long0;
          if (abs(Rh) > Proj4php::$common->EPSLN) {
          $lat = Proj4php::$common.asinz($this->sin_lat_o * cos_z +$this-> cos_lat_o * sin_z *$p->y / Rh);
          $temp =abs($this->lat0) - Proj4php::$common->HALF_PI;
          if (abs(temp) > Proj4php::$common->EPSLN) {
          temp = cos_z -$this->sin_lat_o * sin(lat);
          if(temp!=0.0) lon=Proj4php::$common->adjust_lon($this->long0+atan2($p->x*sin_z*$this->cos_lat_o,temp*Rh));
          } else if ($this->lat0 < 0.0) {
          lon = Proj4php::$common->adjust_lon($this->long0 - atan2(-$p->x,$p->y));
          } else {
          lon = Proj4php::$common->adjust_lon($this->long0 + atan2($p->x, -$p->y));
          }
          } else {
          lat = $this->lat0;
          }
         */
        //return(OK);
        $p->x = Proj4php::$common->adjust_lon( $this->long0 + $lam );
        $p->y = $phi;
        return $p;
    }

    /**
     * determine latitude from authalic latitude
     * 
     * @param type $es
     * @return type 
     */
    public function authset( $es ) {
        #$t;
        $APA = array( );
        $APA[0] = $es * $this->P00;
        $t = $es * $es;
        $APA[0] += $t * $this->P01;
        $APA[1] = $t * $this->P10;
        $t *= $es;
        $APA[0] += $t * $this->P02;
        $APA[1] += $t * $this->P11;
        $APA[2] = $t * $this->P20;
        return $APA;
    }

    /**
     *
     * @param type $beta
     * @param type $APA
     * @return type 
     */
    public function authlat( $beta, $APA ) {
        $t = $beta + $beta;
        return($beta + $APA[0] * sin( $t ) + $APA[1] * sin( $t + $t ) + $APA[2] * sin( $t + $t + $t ));
    }

}

Proj4php::$proj['laea'] = new Proj4phpProjLaea();
