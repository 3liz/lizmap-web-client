<?php
/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4php from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */
class Proj4phpProjGstmerc {

    public function init() {

        // array of:  a, b, lon0, lat0, k0, x0, y0
        $temp = $this->b / $this->a;
        $this->e = sqrt( 1.0 - $temp * $temp );
        $this->lc = $this->long0;
        $this->rs = sqrt( 1.0 + $this->e * $this->e * pow( cos( $this->lat0 ), 4.0 ) / (1.0 - $this->e * $this->e) );
        $sinz = sin( $this->lat0 );
        $pc = asin( $sinz / $this->rs );
        $sinzpc = sin( $pc );
        $this->cp = Proj4php::$common->latiso( 0.0, $pc, $sinzpc ) - $this->rs * Proj4php::$common->latiso( $this->e, $this->lat0, $sinz );
        $this->n2 = $this->k0 * $this->a * sqrt( 1.0 - $this->e * $this->e ) / (1.0 - $this->e * $this->e * $sinz * $sinz);
        $this->xs = $this->x0;
        $this->ys = $this->y0 - $this->n2 * $pc;

        if( !$this->title )
            $this->title = "Gauss Schreiber transverse mercator";
    }

    // forward equations--mapping lat,long to x,y
    // -----------------------------------------------------------------
    public function forward( $p ) {

        $lon = $p->x;
        $lat = $p->y;

        $L = $this->rs * ($lon - $this->lc);
        $Ls = $this->cp + ($this->rs * Proj4php::$common->latiso( $this->e, $lat, sin( $lat ) ));
        $lat1 = asin( sin( $L ) / Proj4php::$common->cosh( $Ls ) );
        $Ls1 = Proj4php::$common->latiso( 0.0, $lat1, sin( $lat1 ) );
        $p->x = $this->xs + ($this->n2 * $Ls1);
        $p->y = $this->ys + ($this->n2 * atan( Proj4php::$common->sinh( $Ls ) / cos( $L ) ));
        return $p;
    }

    // inverse equations--mapping x,y to lat/long
    // -----------------------------------------------------------------
    public function inverse( $p ) {

        $x = $p->x;
        $y = $p->y;

        $L = atan( Proj4php::$common->sinh( ($x - $this->xs) / $this->n2 ) / cos( ($y - $this->ys) / $this->n2 ) );
        $lat1 = asin( sin( ($y - $this->ys) / $this->n2 ) / Proj4php::$common->cosh( ($x - $this->xs) / $this->n2 ) );
        $LC = Proj4php::$common->latiso( 0.0, $lat1, sin( $lat1 ) );
        $p->x = $this->lc + $L / $this->rs;
        $p->y = Proj4php::$common->invlatiso( $this->e, ($LC - $this->cp) / $this->rs );
        return $p;
    }

}

Proj4php::$proj['gstmerc'] = new Proj4phpProjGestmerc();
