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
 * listbox
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlListbox extends jFormsControlDatasource {
    public $type="listbox";
    public $multiple = false;
    public $size = 4;
    public $emptyItemLabel;

    function isContainer(){
        return $this->multiple;
    }

    function check(){
        $value = $this->container->data[$this->ref];
        if(is_array($value)){
            if(!$this->multiple){
                return $this->container->errors[$this->ref] = jForms::ERRDATA_INVALID;
            }
            if(count($value) == 0 && $this->required){
                return $this->container->errors[$this->ref] = jForms::ERRDATA_REQUIRED;
            }
        }else{
            if(trim($value) == '' && $this->required){
                return $this->container->errors[$this->ref] = jForms::ERRDATA_REQUIRED;
            }
        }
        return null;
    }
}
