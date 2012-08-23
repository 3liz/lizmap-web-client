<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2006-2008 Laurent Jouanneau
* @copyright   2007 Loic Mathaud
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlSecretConfirm extends jFormsControl {
    public $type='secretconfirm';
    public $size=0;
    /**
     * ref value of the associated secret control
     */
    public $primarySecret='';

    function check(){
        if($this->container->data[$this->ref] != $this->form->getData($this->primarySecret))
            return $this->container->errors[$this->ref] = jForms::ERRDATA_INVALID;
        return null;
    }
}
