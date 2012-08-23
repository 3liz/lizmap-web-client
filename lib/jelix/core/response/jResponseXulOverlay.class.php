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
* Generate a XUL overlay
* @package  jelix
* @subpackage core_response
* @see jResponseXul
*/
class jResponseXulOverlay extends jResponseXul {
    protected $_type = 'xuloverlay';
    protected $_root = 'overlay';
    function _otherthings(){ } // pas d'overlay dans un overlay
}
