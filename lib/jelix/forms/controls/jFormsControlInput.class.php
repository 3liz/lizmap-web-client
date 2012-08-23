<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2006-2010 Laurent Jouanneau
* @copyright   2007 Loic Mathaud
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlInput extends jFormsControl {
    public $type='input';
    public $size=0;

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

    /**
     * @since 1.2
     */
    public function isHtmlContent() {
        return ($this->datatype instanceof jDatatypeHtml);
    }

}

