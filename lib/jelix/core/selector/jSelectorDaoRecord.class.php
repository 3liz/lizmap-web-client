<?php
/**
* see jISelector.iface.php for documentation about selectors. 
* @package     jelix
* @subpackage  core_selector
* @author      Guillaume Dugas
* @copyright   2012 Guillaume Dugas
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Selector for dao file
 * syntax : "module~daoRecordName".
 * file : daos/daoRecordName.daorecord.php
 * @package    jelix
 * @subpackage core_selector
 */

class jSelectorDaoRecord extends jSelectorModule {
    protected $type = 'daorecord';
    protected $_dirname = 'daos/';
    protected $_suffix = '.daorecord.php';

    protected function _createCachePath(){
        $this->_cachePath = '';
    }
}
