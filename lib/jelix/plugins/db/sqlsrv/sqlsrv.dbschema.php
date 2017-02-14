<?php
/**
* @package    jelix
* @subpackage db
* @author     Laurent Jouanneau
* @copyright  2010-2017 Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class sqlsrvDbTable extends jDbTable {
    protected function _loadColumns() {
        throw new Exception ('Not Implemented');
    }

    protected function _alterColumn(jDbColumn $old, jDbColumn $new) {
        throw new Exception ('Not Implemented');
    }

    protected function _addColumn(jDbColumn $new) {
        throw new Exception ('Not Implemented');
    }

    protected function _loadIndexesAndKeys() {
        throw new Exception ('Not Implemented');
    }

    protected function _createIndex(jDbIndex $index) {
        throw new Exception ('Not Implemented');
    }

    protected function _dropIndex(jDbIndex $index) {
        throw new Exception ('Not Implemented');
    }

    protected function _loadReferences() {
        throw new Exception ('Not Implemented');
    }

    protected function _createReference(jDbReference $ref) {
        throw new Exception ('Not Implemented');
    }

    protected function _dropReference(jDbReference $ref) {
        throw new Exception ('Not Implemented');
    }

}

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class sqlsrvDbSchema extends jDbSchema {
    protected function _createTable($name, $columns, $primaryKey, $attributes = array()) {
        throw new Exception ('Not Implemented');
    }

    protected function _getTables() {
        throw new Exception ('Not Implemented');
    }
}
