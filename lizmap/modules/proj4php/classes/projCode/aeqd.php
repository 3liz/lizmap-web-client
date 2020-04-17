<?php

/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
class Proj4phpProjAeqd {

    public function init() {
        $this->sin_p12 = sin( $this->lat0 );
        $this->cos_p12 = cos( $this->lat0 );
    }

    /**
     *
     * @param type $p
     * @return type 
     */
    public function forward( $p ) {

        #$lon = $p->x;
        #$lat = $p->y;
        #$ksp;

        $sinphi = sin( $p->y );
        $cosphi = cos( $p->y );
        $dlon = Proj4php::$common->adjust_lon($p->x - $this->long0);
        $coslon = cos( $dlon );
        $g = $this->sin_p12 * $sinphi + $this->cos_p12 * $cosphi * $coslon;
        if( abs( abs( $g ) - 1.0 ) < Proj4php::$common->EPSLN ) {
            $ksp = 1.0;
            if( $g < 0.0 ) {
                Proj4php::reportError( "aeqd:Fwd:PointError" );
                return;
            }
        } else {
            $z = acos( $g );
            $ksp = $z / sin( $z );
        }
        $p->x = $this->x0 + $this->a * $ksp * $cosphi * sin( $dlon );
        $p->y = $this->y0 + $this->a * $ksp * ($this->cos_p12 * $sinphi - $this->sin_p12 * $cosphi * $coslon);
        
        return $p;
    }

    /**
     *
     * @param type $p
     * @return type 
     */
    public function inverse( $p ) {
        
        $p->x -= $this->x0;
        $p->y -= $this->y0;

        $rh = sqrt( $p->x * $p->x + $p->y * $p->y );
        if( $rh > (2.0 * Proj4php::$common->HALF_PI * $this->a) ) {
            Proj4php::reportError( "aeqdInvDataError" );
            return;
        }
        $z = $rh / $this->a;

        $sinz = sin( $z );
        $cosz = cos( $z );

        $lon = $this->long0;
        #$lat;
        if( abs( $rh ) <= Proj4php::$common->EPSLN ) {
            $lat = $this->lat0;
        } else {
            $lat = Proj4php::$common->asinz( $cosz * $this->sin_p12 + ($p->y * $sinz * $this->cos_p12) / $rh );
            $con = abs( $this->lat0 ) - Proj4php::$common->HALF_PI;
            if( abs( $con ) <= Proj4php::$common->EPSLN ) {
                if( $this->lat0 >= 0.0 ) {
                    $lon = Proj4php::$common->adjust_lon( $this->long0 + atan2( $p->x, -$p->y ) );
                } else {
                    $lon = Proj4php::$common->adjust_lon( $this->long0 - atan2( -$p->x, $p->y ) );
                }
            } else {
                $con = $cosz - $this->sin_p12 * sin( $lat );
                if( (abs( $con ) < Proj4php::$common->EPSLN) && (abs( $p->x ) < Proj4php::$common->EPSLN) ) {
                    //no-op, just keep the lon value as is
                } else {
                    #$temp = atan2( ($p->x * $sinz * $this->cos_p12 ), ($con * $rh ) ); // $temp is unused !?!
                    $lon = Proj4php::$common->adjust_lon( $this->long0 + atan2( ($p->x * $sinz * $this->cos_p12 ), ($con * $rh ) ) );
                }
            }
        }
        
        $p->x = $lon;
        $p->y = $lat;
        
        return $p;
    }

}

Proj4php::$proj['aeqd'] = new Proj4phpProjAeqd();
