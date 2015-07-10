<?php
/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4js from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodma$p->com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */

/** datum object
 */
class proj4phpDatum {

    public $datum_type;
    public $datum_params;
    
    /**
     *
     * @param type $proj 
     */
    public function __construct( $proj ) {
        
        $this->datum_type = Proj4php::$common->PJD_WGS84;   //default setting
        
        if( isset($proj->datumCode) && $proj->datumCode == 'none' ) {
            $this->datum_type = Proj4php::$common->PJD_NODATUM;
        }
        
        if( isset( $proj->datum_params ) ) {
            
            for( $i = 0; $i < sizeof( $proj->datum_params ); $i++ ) {
                $proj->datum_params[$i] = floatval( $proj->datum_params[$i] );
            }
            
            if( $proj->datum_params[0] != 0 || $proj->datum_params[1] != 0 || $proj->datum_params[2] != 0 ) {
                $this->datum_type = Proj4php::$common->PJD_3PARAM;
            }
            
            if( sizeof( $proj->datum_params ) > 3 ) {
                if( $proj->datum_params[3] != 0 || $proj->datum_params[4] != 0 ||
                    $proj->datum_params[5] != 0 || $proj->datum_params[6] != 0 ) {
                    
                    $this->datum_type = Proj4php::$common->PJD_7PARAM;
                    $proj->datum_params[3] *= Proj4php::$common->SEC_TO_RAD;
                    $proj->datum_params[4] *= Proj4php::$common->SEC_TO_RAD;
                    $proj->datum_params[5] *= Proj4php::$common->SEC_TO_RAD;
                    $proj->datum_params[6] = ($proj->datum_params[6] / 1000000.0) + 1.0;
                }
            }
            
            $this->datum_params = $proj->datum_params;
        }
        if( isset( $proj ) ) {
            $this->a = $proj->a;    //datum object also uses these values
            $this->b = $proj->b;
            $this->es = $proj->es;
            $this->ep2 = $proj->ep2;
            #$this->datum_params = $proj->datum_params;
        }
    }
    
    
    /**
     *
     * @param type $dest
     * @return boolean Returns TRUE if the two datums match, otherwise FALSE.
     * @throws type 
     */
    public function compare_datums( $dest ) {
        
        if( $this->datum_type != $dest->datum_type ) {
            return false; // false, datums are not equal
        } else if( $this->a != $dest->a || abs( $this->es - $dest->es ) > 0.000000000050 ) {
            // the tolerence for es is to ensure that GRS80 and WGS84
            // are considered identical
            return false;
        } else if( $this->datum_type == Proj4php::$common->PJD_3PARAM ) {
            return ($this->datum_params[0] == $dest->datum_params[0]
                      && $this->datum_params[1] == $dest->datum_params[1]
                      && $this->datum_params[2] == $dest->datum_params[2]);
        } else if( $this->datum_type == Proj4php::$common->PJD_7PARAM ) {
            return ($this->datum_params[0] == $dest->datum_params[0]
                      && $this->datum_params[1] == $dest->datum_params[1]
                      && $this->datum_params[2] == $dest->datum_params[2]
                      && $this->datum_params[3] == $dest->datum_params[3]
                      && $this->datum_params[4] == $dest->datum_params[4]
                      && $this->datum_params[5] == $dest->datum_params[5]
                      && $this->datum_params[6] == $dest->datum_params[6]);
        } else if( $this->datum_type == Proj4php::$common->PJD_GRIDSHIFT ||
            $dest->datum_type == Proj4php::$common->PJD_GRIDSHIFT ) {
            throw(new Exception( "ERROR: Grid shift transformations are not implemented." ));
            return false;
        }
        
        return true; // datums are equal
    }

    /*
     * The function Convert_Geodetic_To_Geocentric converts geodetic coordinates
     * (latitude, longitude, and height) to geocentric coordinates (X, Y, Z),
     * according to the current ellipsoid parameters.
     *
     *    Latitude  : Geodetic latitude in radians                     (input)
     *    Longitude : Geodetic longitude in radians                    (input)
     *    Height    : Geodetic height, in meters                       (input)
     *    X         : Calculated Geocentric X coordinate, in meters    (output)
     *    Y         : Calculated Geocentric Y coordinate, in meters    (output)
     *    Z         : Calculated Geocentric Z coordinate, in meters    (output)
     *
     */
    public function geodetic_to_geocentric( $p ) {
        
        $Longitude = $p->x;
        $Latitude = $p->y;
        $Height = isset( $p->z ) ? $p->z : 0;   //Z value not always supplied
        $Error_Code = 0;  //  GEOCENT_NO_ERROR;
        
        /*
         * * Don't blow up if Latitude is just a little out of the value
         * * range as it may just be a rounding issue.  Also removed longitude
         * * test, it should be wrapped by cos() and sin().  NFW for PROJ.4, Sep/2001.
         */
        if( $Latitude < -Proj4php::$common->HALF_PI && $Latitude > -1.001 * Proj4php::$common->HALF_PI ) {
            $Latitude = -Proj4php::$common->HALF_PI;
        } else if( $Latitude > Proj4php::$common->HALF_PI && $Latitude < 1.001 * Proj4php::$common->HALF_PI ) {
            $Latitude = Proj4php::$common->HALF_PI;
        } else if( ($Latitude < -Proj4php::$common->HALF_PI) || ($Latitude > Proj4php::$common->HALF_PI) ) {
            /* Latitude out of range */
            Proj4php::reportError( 'geocent:lat out of range:' . $Latitude );
            return null;
        }

        if( $Longitude > Proj4php::$common->PI )
            $Longitude -= (2 * Proj4php::$common->PI);
        
        $Sin_Lat = sin( $Latitude ); /*  sin(Latitude)  */
        $Cos_Lat = cos( $Latitude ); /*  cos(Latitude)  */
        $Sin2_Lat = $Sin_Lat * $Sin_Lat; /*  Square of sin(Latitude)  */
        $Rn = $this->a / (sqrt( 1.0e0 - $this->es * $Sin2_Lat )); /*  Earth radius at location  */
        $p->x = ($Rn + $Height) * $Cos_Lat * cos( $Longitude );
        $p->y = ($Rn + $Height) * $Cos_Lat * sin( $Longitude );
        $p->z = (($Rn * (1 - $this->es)) + $Height) * $Sin_Lat;
        
        return $Error_Code;
    }

    
    /**
     *
     * @param object $p
     * @return type 
     */
    public function geocentric_to_geodetic( $p ) {
        
        /* local defintions and variables */
        /* end-criterium of loop, accuracy of sin(Latitude) */
        $genau = 1.E-12;
        $genau2 = ($genau * $genau);
        $maxiter = 30;
        $X = $p->x;
        $Y = $p->y;
        $Z = $p->z ? $p->z : 0.0;   //Z value not always supplied
        
        /*
        $P;        // distance between semi-minor axis and location 
        $RR;       // distance between center and location
        $CT;       // sin of geocentric latitude 
        $ST;       // cos of geocentric latitude 
        $RX;
        $RK;
        $RN;       // Earth radius at location 
        $CPHI0;    // cos of start or old geodetic latitude in iterations 
        $SPHI0;    // sin of start or old geodetic latitude in iterations 
        $CPHI;     // cos of searched geodetic latitude
        $SPHI;     // sin of searched geodetic latitude 
        $SDPHI;    // end-criterium: addition-theorem of sin(Latitude(iter)-Latitude(iter-1)) 
        $At_Pole;     // indicates location is in polar region 
        $iter;        // of continous iteration, max. 30 is always enough (s.a.) 
        $Longitude;
        $Latitude;
        $Height;
        */
        
        $At_Pole = false;
        $P = sqrt( $X * $X + $Y * $Y );
        $RR = sqrt( $X * $X + $Y * $Y + $Z * $Z );

        /*      special cases for latitude and longitude */
        if( $P / $this->a < $genau ) {

            /*  special case, if P=0. (X=0., Y=0.) */
            $At_Pole = true;
            $Longitude = 0.0;

            /*  if (X,Y,Z)=(0.,0.,0.) then Height becomes semi-minor axis
             *  of ellipsoid (=center of mass), Latitude becomes PI/2 */
            if( $RR / $this->a < $genau ) {
                $Latitude = Proj4php::$common->HALF_PI;
                $Height = -$this->b;
                return;
            }
        } else {
            /*  ellipsoidal (geodetic) longitude
             *  interval: -PI < Longitude <= +PI */
            $Longitude = atan2( $Y, $X );
        }

        /* --------------------------------------------------------------
         * Following iterative algorithm was developped by
         * "Institut für Erdmessung", University of Hannover, July 1988.
         * Internet: www.ife.uni-hannover.de
         * Iterative computation of CPHI,SPHI and Height.
         * Iteration of CPHI and SPHI to 10**-12 radian res$p->
         * 2*10**-7 arcsec.
         * --------------------------------------------------------------
         */
        $CT = $Z / $RR;
        $ST = $P / $RR;
        $RX = 1.0 / sqrt( 1.0 - $this->es * (2.0 - $this->es) * $ST * $ST );
        $CPHI0 = $ST * (1.0 - $this->es) * $RX;
        $SPHI0 = $CT * $RX;
        $iter = 0;

        /* loop to find sin(Latitude) res$p-> Latitude
         * until |sin(Latitude(iter)-Latitude(iter-1))| < genau */
        do {
            ++$iter;
            $RN = $this->a / sqrt( 1.0 - $this->es * $SPHI0 * $SPHI0 );

            /*  ellipsoidal (geodetic) height */
            $Height = $P * $CPHI0 + $Z * $SPHI0 - $RN * (1.0 - $this->es * $SPHI0 * $SPHI0);

            $RK = $this->es * $RN / ($RN + $Height);
            $RX = 1.0 / sqrt( 1.0 - $RK * (2.0 - $RK) * $ST * $ST );
            $CPHI = $ST * (1.0 - $RK) * $RX;
            $SPHI = $CT * $RX;
            $SDPHI = $SPHI * $CPHI0 - $CPHI * $SPHI0;
            $CPHI0 = $CPHI;
            $SPHI0 = $SPHI;
        } while( $SDPHI * $SDPHI > $genau2 && $iter < $maxiter );

        /*      ellipsoidal (geodetic) latitude */
        $Latitude = atan( $SPHI / abs( $CPHI ) );

        $p->x = $Longitude;
        $p->y = $Latitude;
        $p->z = $Height;
        
        return $p;
    }

    /** 
     * Convert_Geocentric_To_Geodetic
     * The method used here is derived from 'An Improved Algorithm for
     * Geocentric to Geodetic Coordinate Conversion', by Ralph Toms, Feb 1996
     * 
     * @param object Point $p
     * @return object Point $p
     */
    public function geocentric_to_geodetic_noniter( $p ) {
        
        /*
        $Longitude;
        $Latitude;
        $Height;
        
        $W;        // distance from Z axis 
        $W2;       // square of distance from Z axis 
        $T0;       // initial estimate of vertical component 
        $T1;       // corrected estimate of vertical component 
        $S0;       // initial estimate of horizontal component 
        $S1;       // corrected estimate of horizontal component
        $Sin_B0;   // sin(B0), B0 is estimate of Bowring aux variable 
        $Sin3_B0;  // cube of sin(B0) 
        $Cos_B0;   // cos(B0)
        $Sin_p1;   // sin(phi1), phi1 is estimated latitude 
        $Cos_p1;   // cos(phi1) 
        $Rn;       // Earth radius at location 
        $Sum;      // numerator of cos(phi1) 
        $At_Pole;  // indicates location is in polar region 
        */
        
        $X = floatval( $p->x );  // cast from string to float
        $Y = floatval( $p->y );
        $Z = floatval( $p->z ? $p->z : 0 );

        $At_Pole = false;
        if( $X <> 0.0 ) {
            $Longitude = atan2( $Y, $X );
        } else {
            if( $Y > 0 ) {
                $Longitude = Proj4php::$common->HALF_PI;
            } else if( Y < 0 ) {
                $Longitude = -Proj4php::$common->HALF_PI;
            } else {
                $At_Pole = true;
                $Longitude = 0.0;
                if( $Z > 0.0 ) { /* north pole */
                    $Latitude = Proj4php::$common->HALF_PI;
                } else if( Z < 0.0 ) { /* south pole */
                    $Latitude = -Proj4php::$common->HALF_PI;
                } else { /* center of earth */
                    $Latitude = Proj4php::$common->HALF_PI;
                    $Height = -$this->b;
                    return;
                }
            }
        }
        $W2 = $X * $X + $Y * $Y;
        $W = sqrt( $W2 );
        $T0 = $Z * Proj4php::$common->AD_C;
        $S0 = sqrt( $T0 * $T0 + $W2 );
        $Sin_B0 = $T0 / $S0;
        $Cos_B0 = $W / $S0;
        $Sin3_B0 = $Sin_B0 * $Sin_B0 * $Sin_B0;
        $T1 = $Z + $this->b * $this->ep2 * $Sin3_B0;
        $Sum = $W - $this->a * $this->es * $Cos_B0 * $Cos_B0 * $Cos_B0;
        $S1 = sqrt( $T1 * $T1 + $Sum * $Sum );
        $Sin_p1 = $T1 / $S1;
        $Cos_p1 = $Sum / $S1;
        $Rn = $this->a / sqrt( 1.0 - $this->es * $Sin_p1 * $Sin_p1 );
        if( $Cos_p1 >= Proj4php::$common->COS_67P5 ) {
            $Height = $W / $Cos_p1 - $Rn;
        } else if( $Cos_p1 <= -Proj4php::$common->COS_67P5 ) {
            $Height = $W / -$Cos_p1 - $Rn;
        } else {
            $Height = $Z / $Sin_p1 + $Rn * ($this->es - 1.0);
        }
        if( $At_Pole == false ) {
            $Latitude = atan( $Sin_p1 / $Cos_p1 );
        }
        
        $p->x = $Longitude;
        $p->y = $Latitude;
        $p->z = $Height;
        
        return $p;
    }

    /************************************************************** */
    // pj_geocentic_to_wgs84( p )
    //  p = point to transform in geocentric coordinates (x,y,z)
    public function geocentric_to_wgs84( $p ) {

        if( $this->datum_type == Proj4php::$common->PJD_3PARAM ) {
            // if( x[io] == HUGE_VAL )
            //    continue;
            $p->x += $this->datum_params[0];
            $p->y += $this->datum_params[1];
            $p->z += $this->datum_params[2];
        } else if( $this->datum_type == Proj4php::$common->PJD_7PARAM ) {
            $Dx_BF = $this->datum_params[0];
            $Dy_BF = $this->datum_params[1];
            $Dz_BF = $this->datum_params[2];
            $Rx_BF = $this->datum_params[3];
            $Ry_BF = $this->datum_params[4];
            $Rz_BF = $this->datum_params[5];
            $M_BF = $this->datum_params[6];
            // if( x[io] == HUGE_VAL )
            //    continue;
            $p->x = $M_BF * ( $p->x - $Rz_BF * $p->y + $Ry_BF * $p->z) + $Dx_BF;
            $p->y = $M_BF * ( $Rz_BF * $p->x + $p->y - $Rx_BF * $p->z) + $Dy_BF;
            $p->z = $M_BF * (-$Ry_BF * $p->x + $Rx_BF * $p->y + $p->z) + $Dz_BF;
        }
    }

    /*************************************************************** */

    // pj_geocentic_from_wgs84()
    //  coordinate system definition,
    //  point to transform in geocentric coordinates (x,y,z)
    public function geocentric_from_wgs84( $p ) {

        if( $this->datum_type == Proj4php::$common->PJD_3PARAM ) {
            //if( x[io] == HUGE_VAL )
            //    continue;
            $p->x -= $this->datum_params[0];
            $p->y -= $this->datum_params[1];
            $p->z -= $this->datum_params[2];
        } else if( $this->datum_type == Proj4php::$common->PJD_7PARAM ) {
            $Dx_BF = $this->datum_params[0];
            $Dy_BF = $this->datum_params[1];
            $Dz_BF = $this->datum_params[2];
            $Rx_BF = $this->datum_params[3];
            $Ry_BF = $this->datum_params[4];
            $Rz_BF = $this->datum_params[5];
            $M_BF = $this->datum_params[6];
            $x_tmp = ($p->x - $Dx_BF) / $M_BF;
            $y_tmp = ($p->y - $Dy_BF) / $M_BF;
            $z_tmp = ($p->z - $Dz_BF) / $M_BF;
            //if( x[io] == HUGE_VAL )
            //    continue;

            $p->x = $x_tmp + $Rz_BF * $y_tmp - $Ry_BF * $z_tmp;
            $p->y = -$Rz_BF * $x_tmp + $y_tmp + $Rx_BF * $z_tmp;
            $p->z = $Ry_BF * $x_tmp - $Rx_BF * $y_tmp + $z_tmp;
        } //cs_geocentric_from_wgs84()
    }

}

