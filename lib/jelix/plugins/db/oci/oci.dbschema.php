<?php
/**
* @package     jelix
* @subpackage  db
* @author      Laurent Jouanneau
* @contributor Gwendal Jouannic
* @copyright   2008 Gwendal Jouannic, 2009-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class ociDbTable extends jDbTable {

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
class ociDbSchema extends jDbSchema {

    protected function _createTable($name, $columns, $primaryKey, $attributes = array()) {
        throw new Exception ('Not Implemented');
        //return  new ociDbTable($this->schema->getConn()->prefixTable($name), $this);
    }

    protected function _getTables() {
        $results = array ();

        $rs = $this->conn->query ('SELECT TABLE_NAME FROM USER_TABLES');

        while ($line = $rs->fetch ()){
            $results[$line->table_name] = new ociDbTable($line->table_name, $this);
        }

        return $results;
    }

}
