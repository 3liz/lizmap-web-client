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
 * base class for controls which uses a datasource to fill their contents.
 * @package     jelix
 * @subpackage  forms
 */
abstract class jFormsControlDatasource extends jFormsControl {

    public $type="datasource";

    /**
     * @var jIFormsDatasource
     */
    public $datasource;
    public $defaultValue=array();

    function getDisplayValue($value){
        if(is_array($value)){
            $labels = array();
            foreach($value as $val){
                $labels[$val] = $this->_getLabel($val);
            }
            return $labels;
        }else{
            return $this->_getLabel($value);
        }
    }

    protected function _getLabel($value){
        if ($this->datasource instanceof jIFormsDatasource2)
            return $this->datasource->getLabel2($value, $this->form);
        else
            return $this->datasource->getLabel($value);
    }
}


