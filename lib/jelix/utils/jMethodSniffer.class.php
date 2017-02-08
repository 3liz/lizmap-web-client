<?php
/**
* @package    jelix
* @subpackage utils
* @author     Brice Tencé
* @copyright  2012 Brice Tencé
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Utility class to "sniff" method calls to a class instance
 * so that those calls may be repeated later on. The sniffed method should not use
 * any of the magic methods used here (namely __get, __set, __call and __toString).
* @package    jelix
* @subpackage utils
* @static
*/
class jMethodSniffer {

    //use a single var to prevent colisions
    protected $jMethodSnifferVars = null;
    
    public function __construct( $classInst, $instanceString='$classInstance', $notSniffed=array() ) {
        $this->jMethodSnifferVars = new stdClass;
        $this->jMethodSnifferVars->sniffedInstance = $classInst;
        $this->jMethodSnifferVars->instanceString = $instanceString;
        $this->jMethodSnifferVars->notSniffed = $notSniffed;
        $this->jMethodSnifferVars->sniffed = array();
    }

    public function __get( $propertyName ) {
        trigger_error( "jMethodSniffer used : you should not access properties of this '".get_class($this->jMethodSnifferVars->sniffedInstance)."' instance !", E_USER_ERROR );
    }

    public function __set( $propertyName, $value ) {
        trigger_error( "jMethodSniffer used : you should not write properties of this '".get_class($this->jMethodSnifferVars->sniffedInstance)."' instance !", E_USER_ERROR );
    }

    public function __call( $name , array $arguments ) {
        if( !in_array( $name, $this->jMethodSnifferVars->notSniffed ) ) {
            $this->jMethodSnifferVars->sniffed[] = array($name, $arguments);
        }
        return call_user_func_array( array($this->jMethodSnifferVars->sniffedInstance, $name), $arguments ); 
    }

    public function __toString() {
        $sniffedString = '';
        foreach( $this->jMethodSnifferVars->sniffed as $sniffedItem ) {
            $canUseJson = true;
            foreach( $sniffedItem[1] as $methodParam ) {
                if( $canUseJson && !( is_bool($methodParam) || is_int($methodParam) ||
                    is_double($methodParam) || is_float($methodParam) ||
                    is_string($methodParam) ) ) {
                    //json_encode / json_decode would be faster than serialize / unserialize, but this could lead to behaviour
                    //differences if one (at least) of the arguments is e.g. an object ...
                    $canUseJson = false;
                    break;
                }
            }
            $decodingMethod = 'json_decode';
            if( $canUseJson ) {
                $encodedParams = str_replace("'", "\\'", str_replace("\\", "\\\\", json_encode( $sniffedItem[1] )));
            } else {
                $encodedParams = str_replace("'", "\\'", str_replace("\\", "\\\\", serialize( $sniffedItem[1] )));
                $decodingMethod = 'unserialize';
            }
            $sniffedString .= "call_user_func_array( array(". $this->jMethodSnifferVars->instanceString . ", '$sniffedItem[0]')" .
                ", ".$decodingMethod."('" . $encodedParams . "'));\n";
        }
        return $sniffedString;
    }
}
