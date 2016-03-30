<?php
/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
/*******************************************************************************
  NAME                       SWISS OBLIQUE MERCATOR

  PURPOSE:	Swiss projection.
  WARNING:  X and Y are inverted (weird) in the swiss coordinate system. Not
  here, since we want X to be horizontal and Y vertical.

  ALGORITHM REFERENCES
  1. "Formules et constantes pour le Calcul pour la
  projection cylindrique conforme à axe oblique et pour la transformation entre
  des systèmes de référence".
  http://www.swisstopo.admin.ch/internet/swisstopo/fr/home/topics/survey/sys/refsys/switzerland.parsysrelated1.31216.downloadList.77004.DownloadFile.tmp/swissprojectionfr.pdf

*******************************************************************************/

class Proj4phpProjSomerc {

    /**
     * 
     */
    public function init() {
        $phy0 = $this->lat0;
        $this->lambda0 = $this->long0;
        $sinPhy0 = sin( $phy0 );
        $semiMajorAxis = $this->a;
        $invF = $this->rf;
        $flattening = 1 / $invF;
        $e2 = 2 * $flattening - pow( $flattening, 2 );
        $e = $this->e = sqrt( $e2 );
        $this->R = $this->k0 * $semiMajorAxis * sqrt( 1 - $e2 ) / (1 - $e2 * pow( $sinPhy0, 2.0 ));
        $this->alpha = sqrt( 1 + $e2 / (1 - $e2) * pow( cos( $phy0 ), 4.0 ) );
        $this->b0 = asin( $sinPhy0 / $this->alpha );
        $this->K = log( tan( Proj4php::$common->PI / 4.0 + $this->b0 / 2.0 ) )
                  - $this->alpha
                  * log( tan( Proj4php::$common->PI / 4.0 + $phy0 / 2.0 ) )
                  + $this->alpha
                  * $e / 2
                  * log( (1 + $e * $sinPhy0)
                            / (1 - $e * $sinPhy0) );
    }

    /**
     *
     * @param type $p
     * @return type 
     */
    public function forward( $p ) {
        $Sa1 = log( tan( Proj4php::$common->PI / 4.0 - $p->y / 2.0 ) );
        $Sa2 = $this->e / 2.0
                  * log( (1 + $this->e * sin( $p->y ))
                            / (1 - $this->e * sin( $p->y )) );
        $S = -$this->alpha * ($Sa1 + $Sa2) + $this->K;

        // spheric latitude
        $b = 2.0 * (atan( exp( $S ) ) - Proj4php::$common->PI / 4.0);

        // spheric longitude
        $I = $this->alpha * ($p->x - $this->lambda0);

        // psoeudo equatorial rotation
        $rotI = atan( sin( $I )
                  / (sin( $this->b0 ) * tan( $b ) +
                  cos( $this->b0 ) * cos( $I )) );

        $rotB = asin( cos( $this->b0 ) * sin( $b ) -
                  sin( $this->b0 ) * cos( $b ) * cos( $I ) );

        $p->y = $this->R / 2.0
                  * log( (1 + sin( $rotB )) / (1 - sin( $rotB )) )
                  + $this->y0;
        
        $p->x = $this->R * $rotI + $this->x0;
        
        return $p;
    }

    /**
     *
     * @param type $p
     * @return type 
     */
    public function inverse( $p ) {
        
        $Y = $p->x - $this->x0;
        $X = $p->y - $this->y0;

        $rotI = $Y / $this->R;
        $rotB = 2 * (atan( exp( $X / $this->R ) ) - Proj4php::$common->PI / 4.0);

        $b = asin( cos( $this->b0 ) * sin( $rotB )
                  + sin( $this->b0 ) * cos( $rotB ) * cos( $rotI ) );
        $I = atan( sin( $rotI )
                  / (cos( $this->b0 ) * cos( $rotI ) - sin( $this->b0 )
                  * tan( $rotB )) );

        $lambda = $this->lambda0 + $I / $this->alpha;

        $S = 0.0;
        $phy = $b;
        $prevPhy = -1000.0;
        $iteration = 0;
        while( abs( $phy - $prevPhy ) > 0.0000001 ) {
            if( ++$iteration > 20 ) {
                Proj4php::reportError( "omercFwdInfinity" );
                return;
            }
            //S = log(tan(PI / 4.0 + phy / 2.0));
            $S = 1.0
                      / $this->alpha
                      * (log( tan( Proj4php::$common->PI / 4.0 + $b / 2.0 ) ) - $this->K)
                      + $this->e
                      * log( tan( Proj4php::$common->PI / 4.0
                                          + asin( $this->e * sin( $phy ) )
                                          / 2.0 ) );
            $prevPhy = $phy;
            $phy = 2.0 * atan( exp( $S ) ) - Proj4php::$common->PI / 2.0;
        }

        $p->x = $lambda;
        $p->y = $phy;
        
        return $p;
    }

}

Proj4php::$proj['somerc'] = new Proj4phpProjSomerc();
