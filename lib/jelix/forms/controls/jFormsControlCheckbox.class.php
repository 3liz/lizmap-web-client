<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Julien Issler
* @copyright   2006-2008 Laurent Jouanneau
* @copyright   2008 Julien Issler
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlCheckbox extends jFormsControl {
    public $type='checkbox';
    public $defaultValue='0';

    /**
     * value that is stored when the checkbox is checked
     */
    public $valueOnCheck='1';

    /**
     * value that is stored when the checkbox is unchecked
     */
    public $valueOnUncheck='0';

    /**
     * label that is displayed when the value has to be displayed, when the checkbox is checked.
     * If empty, the value of valueOnCheck is displayed.
     */
    public $valueLabelOnCheck='';

    /**
     * label that is displayed when the value has to be displayed, when the checkbox is unchecked.
     * If empty, the value of valueOnUncheck is displayed.
     */
    public $valueLabelOnUncheck='';

    function __construct($ref){
        $this->ref = $ref;
        $this->datatype = new jDatatypeBoolean();
    }

    function check(){
        $value = $this->container->data[$this->ref];
        if($this->required && $value == $this->valueOnUncheck)
            return $this->container->errors[$this->ref] = jForms::ERRDATA_REQUIRED;
        if($value != $this->valueOnCheck && $value != $this->valueOnUncheck)
            return $this->container->errors[$this->ref] = jForms::ERRDATA_INVALID;
        return null;
    }

    function setValueFromRequest($request) {
        $value = $request->getParam($this->ref);
        if($value){
            $this->setData($this->valueOnCheck);
        }else{
            $this->setData($this->valueOnUncheck);
        }
    }

    function setData($value) {
        $value = (string) $value;
        if($value != $this->valueOnCheck){
            if($value =='on')
                $value = $this->valueOnCheck;
            else
                $value = $this->valueOnUncheck;
        }
        parent::setData($value);
    }

    function setDataFromDao($value, $daoDatatype) {
        if( $daoDatatype == 'boolean') {
            if(strtolower($value) == 'true' ||  $value === 't'|| intval($value) == 1 || $value === 'on' || $value === true){
                $value = $this->valueOnCheck;
            }else {
                $value = $this->valueOnUncheck;
            }
        }
        $this->setData($value);
    }

    function getDisplayValue($value){
        if ($value == $this->valueOnCheck) {
            return ($this->valueLabelOnCheck !== ''?$this->valueLabelOnCheck:$value);
        }
        return ($this->valueLabelOnUncheck !== ''?$this->valueLabelOnUncheck:$value);
    }
}
