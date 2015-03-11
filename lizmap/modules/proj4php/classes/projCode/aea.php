<?php
/*******************************************************************************
  NAME                     ALBERS CONICAL EQUAL AREA

  PURPOSE:	Transforms input longitude and latitude to Easting and Northing
  for the Albers Conical Equal Area projection.  The longitude
  and latitude must be in radians.  The Easting and Northing
  values will be returned in meters.

  PROGRAMMER              DATE
  ----------              ----
  T. Mittan,       	Feb, 1992

  ALGORITHM REFERENCES

  1.  Snyder, John P., "Map Projections--A Working Manual", U.S. Geological
  Survey Professional Paper 1395 (Supersedes USGS Bulletin 1532), United
  State Government Printing Office, Washington D.C., 1987.

  2.  Snyder, John P. and Voxland, Philip M., "An Album of Map Projections",
  U.S. Geological Survey Professional Paper 1453 , United State Government
  Printing Office, Washington D.C., 1989.
 *******************************************************************************/

/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
class Proj4phpProjAea {

    /**
     *
     * @return void 
     */
    public function init() {

        if( abs( $this->lat1 + $this->lat2 ) < Proj4php::$common->EPSLN ) {
            Proj4php::reportError( "aeaInitEqualLatitudes" );
            return;
        }
        $this->temp = $this->b / $this->a;
        $this->es = 1.0 - pow( $this->temp, 2 );
        $this->e3 = sqrt( $this->es );

        $this->sin_po = sin( $this->lat1 );
        $this->cos_po = cos( $this->lat1 );
        $this->t1 = $this->sin_po;
        $this->con = $this->sin_po;
        $this->ms1 = Proj4php::$common->msfnz( $this->e3, $this->sin_po, $this->cos_po );
        $this->qs1 = Proj4php::$common->qsfnz( $this->e3, $this->sin_po, $this->cos_po );

        $this->sin_po = sin( $this->lat2 );
        $this->cos_po = cos( $this->lat2 );
        $this->t2 = $this->sin_po;
        $this->ms2 = Proj4php::$common->msfnz( $this->e3, $this->sin_po, $this->cos_po );
        $this->qs2 = Proj4php::$common->qsfnz( $this->e3, $this->sin_po, $this->cos_po );

        $this->sin_po = sin( $this->lat0 );
        $this->cos_po = cos( $this->lat0 );
        $this->t3 = $this->sin_po;
        $this->qs0 = Proj4php::$common->qsfnz( $this->e3, $this->sin_po, $this->cos_po );

        if( abs( $this->lat1 - $this->lat2 ) > Proj4php::$common->EPSLN ) {
            $this->ns0 = ($this->ms1 * $this->ms1 - $this->ms2 * $this->ms2) / ($this->qs2 - $this->qs1);
        } else {
            $this->ns0 = $this->con;
        }
        
        $this->c = $this->ms1 * $this->ms1 + $this->ns0 * $this->qs1;
        $this->rh = $this->a * sqrt( $this->c - $this->ns0 * $this->qs0 ) / $this->ns0;
    }

    /**
     * Albers Conical Equal Area forward equations--mapping lat,long to x,y
     *
     * @param Point $p
     * @return Point $p 
     */
    public function forward( $p ) {

        $lon = $p->x;
        $lat = $p->y;

        $this->sin_phi = sin( $lat );
        $this->cos_phi = cos( $lat );

        $qs = Proj4php::$common->qsfnz( $this->e3, $this->sin_phi, $this->cos_phi );
        $rh1 = $this->a * sqrt( $this->c - $this->ns0 * $qs ) / $this->ns0;
        $theta = $this->ns0 * Proj4php::$common->adjust_lon( $lon - $this->long0 );
        $x = rh1 * sin( $theta ) + $this->x0;
        $y = $this->rh - $rh1 * cos( $theta ) + $this->y0;

        $p->x = $x;
        $p->y = $y;
        
        return $p;
    }

    /**
     *
     * @param Point $p
     * @return Point $p
     */
    public function inverse( $p ) {
        
        $p->x -= $this->x0;
        $p->y = $this->rh - $p->y + $this->y0;
        
        if( $this->ns0 >= 0 ) {
            $rh1 = sqrt( $p->x * $p->x + $p->y * $p->y );
            $con = 1.0;
        } else {
            $rh1 = -sqrt( $p->x * $p->x + $p->y * $p->y );
            $con = -1.0;
        }
        
        $theta = 0.0;
        if( $rh1 != 0.0 ) {
            $theta = atan2( $con * $p->x, $con * $p->y );
        }
        
        $con = $rh1 * $this->ns0 / $this->a;
        $qs = ($this->c - $con * $con) / $this->ns0;
        
        if( $this->e3 >= 1e-10 ) {
            $con = 1 - .5 * (1.0 - $this->es) * log( (1.0 - $this->e3) / (1.0 + $this->e3) ) / $this->e3;
            if( abs( abs( $con ) - abs( $qs ) ) > .0000000001 ) {
                $lat = $this->phi1z( $this->e3, $qs );
            } else {
                if( $qs >= 0 ) {
                    $lat = .5 * Proj4php::$common->PI;
                } else {
                    $lat = -.5 * Proj4php::$common->PI;
                }
            }
        } else {
            $lat = $this->phi1z( $this->e3, $qs );
        }

        $lon = Proj4php::$common->adjust_lon( $theta / $this->ns0 + $this->long0 );
        
        $p->x = $lon;
        $p->y = $lat;
        
        return $p;
    }

    /**
     * Function to compute phi1, the latitude for the inverse of the Albers Conical Equal-Area projection.
     *
     * @param type $eccent
     * @param type $qs
     * @return $phi or null on Convergence error
     */
    public function phi1z( $eccent, $qs ) {
        
        $phi = Proj4php::$common->asinz( .5 * $qs );
        
        if( $eccent < Proj4php::$common->EPSLN )
            return $phi;

        $eccnts = $eccent * $eccent;
        for( $i = 1; $i <= 25; ++$i ) {
            $sinphi = sin( $phi );
            $cosphi = cos( $phi );
            $con = $eccent * $sinphi;
            $com = 1.0 - $con * $con;
            $dphi = .5 * $com * $com / $cosphi * ($qs / (1.0 - $eccnts) - $sinphi / $com + .5 / $eccent * log( (1.0 - $con) / (1.0 + $con) ));
            $phi = $phi + $dphi;
            if( abs( $dphi ) <= 1e-7 )
                return $phi;
        }
        
        Proj4php::reportError( "aea:phi1z:Convergence error" );
        
        return null;
    }

}

Proj4php::$proj['aea'] = new Proj4phpProjAea();