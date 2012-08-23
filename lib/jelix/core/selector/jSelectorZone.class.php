<?php
/**
* see jISelector.iface.php for documentation about selectors. Here abstract class for many selectors
*
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @copyright   2005-2008 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
 * Zone selector
 *
 * syntax : "module~zoneName".
 * file : zones/zoneName.zone.php .
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorZone extends jSelectorModule {
    protected $type = 'zone';
    protected $_dirname = 'zones/';
    protected $_suffix = '.zone.php';

    protected function _createCachePath(){
        $this->_cachePath = '';
    }
}