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
 * control which contains several radio buttons
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlRadiobuttons extends jFormsControlDatasource {
    public $type="radiobuttons";
    public $defaultValue='';
    function check(){
        if($this->container->data[$this->ref] == '' && $this->required) {
            return $this->container->errors[$this->ref] = jForms::ERRDATA_REQUIRED;
        }
        return null;
    }
}

