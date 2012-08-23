<?php
/**
* see jISelector.iface.php for documentation about selectors. Here abstract class for many selectors
*
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @contributor Christophe Thiriot
* @copyright   2005-2007 Laurent Jouanneau
* @copyright   2008 Christophe Thiriot
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * selector for interface
 *
 * interface is stored in interfacename.iface.php file in the classes/ module directory
 * or one of its subdirectory.
 * syntax : "iface:module~ifacename" or "module~ifacename.
 * @package    jelix
 * @subpackage core_selector
 * @since 1.0.3
 */
class jSelectorIface extends jSelectorClass {
    protected $type = 'iface';
    protected $_dirname = 'classes/';
    protected $_suffix = '.iface.php';
}
