<?php
/**
 * Author : Julien Moquet
 * 
 * Inspired by Proj4js from Mike Adair madairATdmsolutions.ca
 *                      and Richard Greenwood rich@greenwoodmap.com 
 * License: LGPL as per: http://www.gnu.org/copyleft/lesser.html 
 */

/** 
 * point object, nothing fancy, just allows values to be
 * passed back and forth by reference rather than by value.
 * Other point classes may be used as long as they have
 * x and y properties, which will get modified in the transform method.
*/
class proj4phpPoint {

    public $x;
    public $y;
    public $z;

    /**
     * Constructor: Proj4js.Point
     *
     * Parameters:
     * - x {float} or {Array} either the first coordinates component or
     *     the full coordinates
     * - y {float} the second component
     * - z {float} the third component, optional.
     */
    public function __construct( $x = null, $y = null, $z = null ) {
        
        if( is_array( $x ) ) {
            $this->x = $x[0];
            $this->y = $x[1];
            $this->z = isset($x[2]) ? $x[2] : 0.0;#(count( $x ) > 2) ? $x[2] : 0.0;
        } else if( is_string( $x ) && !is_numeric( $y ) ) {
            $coord = explode( ' ', $x );
            $this->x = floatval( $coord[0] );
            $this->y = floatval( $coord[1] );
            $this->z = (count( $coord ) > 2) ? floatval( $coord[2] ) : 0.0;
        } else {
            $this->x = $x !== null ? $x : 0.0;
            $this->y = $y !== null ? $y : 0.0;
            $this->z = $z !== null ? $z : 0.0;
        }
    }

    /**
     * APIMethod: clone
     * Build a copy of a Proj4js.Point object.
     *
     * renamed because of PHP keyword.
     * 
     * Return:
     * {Proj4js}.Point the cloned point.
     */
    public function __clone() {
        return new Proj4phpPoint( $this->x, $this->y, $this->z );
    }

    /**
     * APIMethod: toString
     * Return a readable string version of the point
     *
     * Return:
     * {String} String representation of Proj4js.Point object. 
     *           (ex. <i>"x=5,y=42"</i>)
     */
    public function toString() {
        return "x=" . $this->x . ",y=" . $this->y;
    }

    /**
     * APIMethod: toShortString
     * Return a short string version of the point.
     *
     * Return:
     * {String} Shortened String representation of Proj4js.Point object. 
     *         (ex. <i>"5, 42"</i>)
     */
    public function toShortString() {
        return $this->x . " " . $this->y;
    }

}