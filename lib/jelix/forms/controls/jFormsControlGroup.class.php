<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @copyright   2006-2014 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
 * group control
 *
 * Contains a list of controls.
 * If it has a checkbox, child controls can be disabled by the user.
 * The "value" of the group is then the status of the checkbox "on" or "".
 * if the group is in readonly mode or is deactivated, every children are readonly or deactivated
 * 
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlGroup extends jFormsControlGroups {
    public $type="group";

    /**
     * indicates if the group has a checkbox to enable/disable its child controls
     * @since 1.6.2
     */
    public $hasCheckbox = false;

    /**
     * value that is stored when the checkbox is checked
     * @since 1.6.2
     */
    public $valueOnCheck = '1';

    /**
     * value that is stored when the checkbox is unchecked
     * @since 1.6.2
     */
    public $valueOnUncheck = '0';

    /**
     * If the group has a checkbox, label that is displayed when the value has to be displayed, when the checkbox is checked.
     * If empty, the value of valueOnCheck is displayed.
     * @since 1.6.2
     */
    public $valueLabelOnCheck='';

    /**
     * If the group has a checkbox, label that is displayed when the value has to be displayed, when the checkbox is unchecked.
     * If empty, the value of valueOnUncheck is displayed.
     * @since 1.6.2
     */
    public $valueLabelOnUncheck='';


    function check(){
        if (!$this->hasCheckbox) {
            return parent::check();
        }
        $value = $this->container->data[$this->ref];

        if($value != $this->valueOnCheck && $value != $this->valueOnUncheck) {
            return $this->container->errors[$this->ref] = jForms::ERRDATA_INVALID;
        }

        if ($value == $this->valueOnCheck) {
            // the checkbox is checked, let's check children
            return parent::check();
        }
        // the checkbox is NOT checked
        return null;
    }

    function setValueFromRequest($request) {

        if (!$this->hasCheckbox) {
            parent::setValueFromRequest($request);
            return;
        }

        $this->setData($request->getParam($this->ref,''));

        $value = $this->container->data[$this->ref];
        if ($value == $this->valueOnCheck) {
            foreach($this->childControls as $name => $ctrl) {
                if (!$this->form->isActivated($name) || $this->form->isReadOnly($name)) {
                    continue;
                }
                $ctrl->setValueFromRequest($request);
            }
        }
    }

    function setData($value) {
        if ($this->hasCheckbox) {
            $value = (string) $value;
            if ($value != $this->valueOnCheck){
                if ($value =='on') {
                    $value = $this->valueOnCheck;
                }
                else {
                    $value = $this->valueOnUncheck;
                }
            }
        }
        parent::setData($value);
    }

    function setDataFromDao($value, $daoDatatype) {
        if (!$this->hasCheckbox) {
            parent::setDataFromDao($value, $daoDatatype);
            return;
        }
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
        if (!$this->hasCheckbox) {
            return $value;
        }
        if ($value == $this->valueOnCheck) {
            return ($this->valueLabelOnCheck !== ''?$this->valueLabelOnCheck:$value);
        }
        return ($this->valueLabelOnUncheck !== ''?$this->valueLabelOnUncheck:$value);
    }
}
