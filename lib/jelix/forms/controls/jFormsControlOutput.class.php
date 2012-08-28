<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Thomas
* @copyright   2006-2008 Laurent Jouanneau, 2009 Thomas
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlOutput extends jFormsControl {
    public $type='output';

    function setValueFromRequest($request) {
    }

    public function check(){
        return null;
    }
    
    function setDataFromDao($value, $daoDatatype) {
        if($this->datatype instanceof jDatatypeLocaleDateTime
            && $daoDatatype == 'datetime') {
            if($value != '') {
                $dt = new jDateTime();
                $dt->setFromString($value, jDateTime::DB_DTFORMAT);
                $value = $dt->toString(jDateTime::LANG_DTFORMAT);
            }
        }elseif($this->datatype instanceof jDatatypeLocaleDate
                && $daoDatatype == 'date') {
            if($value != '') {
                $dt = new jDateTime();
                $dt->setFromString($value, jDateTime::DB_DFORMAT);
                $value = $dt->toString(jDateTime::LANG_DFORMAT);
            }
        }
        $this->setData($value);
    }
}
