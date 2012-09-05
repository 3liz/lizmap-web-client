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
 * switch
 * @package     jelix
 * @subpackage  forms
 * @experimental
 */
class jFormsControlSwitch extends jFormsControlChoice {
    public $type="switch";


    function setValueFromRequest($request) {
        //$this->setData($request->getParam($this->ref,''));
        if(isset($this->items[$this->container->data[$this->ref]])){
            foreach($this->items[$this->container->data[$this->ref]] as $name=>$ctrl) {
                $ctrl->setValueFromRequest($request);
            }
        }
    }
}

