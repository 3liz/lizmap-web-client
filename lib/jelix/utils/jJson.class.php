<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @copyright   2007-2011 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

define('SERVICES_JSON_STRICT_TYPE', 0);
define('SERVICES_JSON_LOOSE_TYPE', 16);

/**
 * object which encode or decode a php variable to or from JSON
 * @package    jelix
 * @subpackage utils
 */
class jJson {

    private $use;

    /**
     * constructs a new JSON instance
     *
     * @param    int     $use    object behavior flags; combine with boolean-OR
     *                           possible values:
     *                           - SERVICES_JSON_STRICT_TYPE: (default) strict
     *                             convertion
     *                           - SERVICES_JSON_LOOSE_TYPE:  loose typing.
     *                                   "{...}" syntax creates associative arrays
     *                                   instead of objects in decode().
     */
    function jJSON($use = 0) {
        $this->use = $use;
    }

   /**
    * encodes an arbitrary variable into JSON format
    *
    * @param    mixed   $var    any number, boolean, string, array, or object to be encoded.
    *                           if var is a string, note that encode() always expects it
    *                           to be in ASCII or UTF-8 format!
    * @return   mixed   JSON string representation of input var or an error if a problem occurs
    */
    function encode($var) {
        return json_encode($var);
    }

   /**
    * decodes a JSON string into appropriate variable
    *
    * @param    string  $str    JSON-formatted string
    * @return   mixed   number, boolean, string, array, or object
    *                   corresponding to given JSON input string.
    *                   Note that decode() always returns strings in ASCII or UTF-8 format!
    */
    function decode($str) {
        return json_decode($str, ($this->use == SERVICES_JSON_LOOSE_TYPE) );
    }
}

