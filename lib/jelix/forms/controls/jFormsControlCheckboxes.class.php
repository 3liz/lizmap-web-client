<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @copyright   2006-2008 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
 * Checkboxes control (contains several checkboxes)
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlCheckboxes extends jFormsControlDatasource {
    public $type="checkboxes";

    function isContainer(){
        return true;
    }

    function check(){
        $value = $this->container->data[$this->ref];
        if(is_array($value)){
            if(count($value) == 0 && $this->required){
                return $this->container->errors[$this->ref] = jForms::ERRDATA_REQUIRED;
            }
        }else{
            if(trim($value) == ''){
                if($this->required)
                    return $this->container->errors[$this->ref] = jForms::ERRDATA_REQUIRED;
            }else{
                return $this->container->errors[$this->ref] = jForms::ERRDATA_INVALID;
            }
        }
        return null;
    }
}
