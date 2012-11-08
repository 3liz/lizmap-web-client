<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @contributor Julien Issler, Hadrien Lanneau
* @copyright   2006-2012 Laurent Jouanneau
* @copyright   2008 Julien Issler, 2011 Hadrien Lanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/
/**
 * interface for datatypes which can filter value
 * @package     jelix
 * @subpackage  utils
 * @since 1.1
 */
interface jIFilteredDatatype {
    /**
     * return the value on which filters are applied
     * should be call after a call of check() method
     */
    public function getFilteredValue();
}
/**
 *
 * @package     jelix
 * @subpackage  utils
 */
abstract class jDatatype {

    protected $hasFacets= false;
    protected $facets = array();

    /**
    * call it to add restriction on possible values
    * @param string $type
    * @param string $value
    */
    public function addFacet($type,$value=null){
        if(in_array($type, $this->facets)){
            $this->hasFacets = true;
            $this->_addFacet($type,$value);
        }
    }

    /**
    * get a restriction value
    * @param string $type
    * @return mixed  the value
    * @since 1.0
    */
    public function getFacet($type){
        if(in_array($type, $this->facets)){
            return $this->$type;
        }
        return null;
    }

    protected function _addFacet($type,$value){
        $this->$type = $value;
    }

    /**
    * verify a value : it should correspond to the datatype
    * @param string   $value
    * @return boolean true if the value is ok
    */
    public function check($value){
        return true;
    }

    /**
     * says if the value can contain only whitespaces
     * @return boolean
     * @since 1.2.7
     */
    public function allowWhitespace() {
        return false;
    }
}

/**
 * Datatype String.
 *
 * Possible facets are: 'length','minLength','maxLength', 'pattern'
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeString extends jDatatype {
    protected $length=null;
    protected $minLength=null;
    protected $maxLength=null;
    protected $pattern=null;
    protected $facets = array('length','minLength','maxLength', 'pattern');

    public function check($value){
        if($this->hasFacets){
            $len = iconv_strlen(
                trim(preg_replace( '@\s+@', ' ', $value)),
                jApp::config()->charset
            );
            if($this->length !== null && $len != $this->length)
                return false;
            if($this->minLength !== null && $len < $this->minLength)
                return false;
            if($this->maxLength !== null && $len > $this->maxLength)
                return false;
            if($this->pattern !== null && !preg_match($this->pattern,$value))
                return false;
        }
        return true;
    }

    public function allowWhitespace() {
        return true;
    }
}

/**
 * Datatype HTML String.
 *
 * Possible facets are: 'length','minLength','maxLength'
 * @package     jelix
 * @subpackage  utils
 * @since 1.1
 */
class jDatatypeHtml extends jDatatype implements jIFilteredDatatype {
    protected $length=null;
    protected $minLength=null;
    protected $maxLength=null;
    protected $facets = array('length','minLength','maxLength');
    public $outputXhtml = false;
    public $fromWysiwyg = false;

    protected $newValue;

    public function __construct($aOutputXhtml = false, $fromWysiwyg = false) {
        $this->outputXhtml = $aOutputXhtml;
        $this->fromWysiwyg = $fromWysiwyg;
    }

    public function check($value){
        if($this->hasFacets){
            if ($this->fromWysiwyg)
                $len = iconv_strlen(strip_tags($value,'<img><img/><object><embed><video><video/><svg>'), jApp::config()->charset);
            else
                $len = iconv_strlen($value, jApp::config()->charset);
            if($this->length !== null && $len != $this->length)
                return false;
            if($this->minLength !== null && $len < $this->minLength)
                return false;
            if($this->maxLength !== null && $len > $this->maxLength)
                return false;
        }
        $this->newValue = jFilter::cleanHtml($value, $this->outputXhtml);
        return is_string($this->newValue);
    }

    public function getFilteredValue() {
        return $this->newValue;
    }

    public function allowWhitespace() {
        return true;
    }
}

/**
 * Datatype Booléen
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeBoolean extends jDatatype {
    public function check($value) { return jFilter::isBool($value); }
}

/**
 * Datatype Decimal
 *
 * Possible facets are: 'maxValue', 'minValue'
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeDecimal extends jDatatype {
    // xxxx.yyyyy
    protected $maxValue=null;
    protected $minValue=null;
    protected $facets = array('maxValue', 'minValue');
    public function check($value) { return jFilter::isFloat($value, $this->minValue, $this->maxValue); }
    protected function _addFacet($type,$value){
        if($type == 'maxValue' || $type == 'minValue'){
            $this->$type = floatval($value);
        }
    }
}

/**
 * Datatype Integer
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeInteger extends jDatatypeDecimal {
    public function check($value) { return jFilter::isInt($value, $this->minValue, $this->maxValue); }
    protected function _addFacet($type,$value){
        if($type == 'maxValue' || $type == 'minValue'){
            $this->$type = intval($value);
        }
    }
}


/**
 * Datatype Hexa
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeHexadecimal extends jDatatypeDecimal {
    public function check($value) {
        if(substr($value,0,2) != '0x') $value='0x'.$value;
        return jFilter::isHexInt($value, $this->minValue, $this->maxValue);
    }
    protected function _addFacet($type,$value){
        if($type == 'maxValue' || $type == 'minValue'){
            $this->$type = intval($value,16);
        }
    }
}


/**
 * Datatype datetime
 *
 * Possible facets are: 'maxValue', 'minValue'
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeDateTime extends jDatatype {
    protected $facets = array('maxValue', 'minValue');
    protected $maxValue;
    protected $minValue;
    private $dt;
    protected $format=21;
    protected $_date_format = 'Y-m-d H:i:s';
    public function check($value) {
        $this->dt = new jDateTime();
        if(!$this->dt->setFromString($value,$this->format)) return false;
        if($this->maxValue !== null){
            if($this->dt->compareTo($this->maxValue) == 1) return false;
        }
        if($this->minValue !== null){
            if($this->dt->compareTo($this->minValue) == -1) return false;
        }
        return true;
    }

    protected function _addFacet($type,$value){
        if($type == 'maxValue' || $type == 'minValue'){
            if(!preg_match('#^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$#',$value))
                $value = date($this->_date_format,strtotime($value));
            $this->$type = new jDateTime();
            $this->$type->setFromString($value,$this->format);
        }
        else
            parent::_addFacet($type,$value);
    }
    /**
     * @since 1.0
     */
    public function getFormat() { return $this->format; }
}

/**
 * Datatype time
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeTime extends jDatatypeDateTime {
    protected $format=22;
}
/**
 * Datatype date
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeDate extends jDatatypeDateTime {
    protected $format=20;
    protected $_date_format = 'Y-m-d';
}

/**
 * Datatype localedatetime
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeLocaleDateTime extends jDatatypeDateTime {
    protected $format=11;
}

/**
 * Datatype localedate
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeLocaleDate extends jDatatypeDateTime {
    protected $format=10;
}

/**
 * Datatype localetime
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeLocaleTime extends jDatatypeDateTime {
    protected $format=12;
}


/**
 * Datatype localetime
 * @package     jelix
 * @subpackage  utils
 * @author dhughuet, time short
 */
class jDatatypeLocaleTimeShort extends jDatatypeDateTime {
    protected $format=14;
}


/**
 * Datatype url
 *
 * Possible facets are: 'schemeRequired','hostRequired','pathRequired', 'queryRequired'.
 * all are booleans.
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeUrl extends jDatatype {
    protected $schemeRequired=true;
    protected $hostRequired=true;
    protected $pathRequired=null;
    protected $queryRequired=null;

    protected $facets = array('schemeRequired','hostRequired','pathRequired', 'queryRequired');

    public function check($value){
        return jFilter::isUrl($value, $this->schemeRequired, $this->hostRequired, $this->pathRequired, $this->queryRequired);
    }
}

/**
 * Datatype ipv4
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeIPv4 extends jDatatype {
    public function check($value){
        return jFilter::isIPv4($value);
    }
}

/**
 * Datatype ipv6
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeIPv6 extends jDatatype {
    public function check($value){
        return jFilter::isIPv6($value);
    }
}

/**
 * Datatype mail
 * @package     jelix
 * @subpackage  utils
 */
class jDatatypeEmail extends jDatatype {
    public function check($value){
        return jFilter::isEmail($value);
    }
}
