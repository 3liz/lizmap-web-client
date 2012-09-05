<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Laurent Jouanneau
* @copyright   2005-2006 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
*
*/
require_once(JELIX_LIB_CORE_PATH.'response/jResponseXul.class.php');

/**
* Generate a XUL dialog
* @package  jelix
* @subpackage core_response
* @see jResponseXul
*/
class jResponseXulDialog extends jResponseXul {
    protected $_type =  'xuldialog';
    protected $_root = 'dialog';
}
