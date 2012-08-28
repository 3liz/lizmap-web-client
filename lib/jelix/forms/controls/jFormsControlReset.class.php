<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Dominique Papin
* @copyright   2006-2008 Laurent Jouanneau, 2007 Dominique Papin
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package     jelix
 * @subpackage  forms
 */
class jFormsControlReset extends jFormsControl {
    public $type='reset';

    public function check(){
        return null;
    }
}
