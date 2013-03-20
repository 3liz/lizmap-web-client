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
 * menulist/combobox
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlMenulist extends jFormsControlRadiobuttons {
    public $type="menulist";
    public $defaultValue='';
    public $emptyItemLabel = null;
}
