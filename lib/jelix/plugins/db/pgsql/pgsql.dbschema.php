<?php
/**
* @package    jelix
* @subpackage db
* @author     Laurent Jouanneau
* @copyright  2010 Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 * @notimplemented
 */
class pgsqlDbTable extends jDbTable {

    protected function _loadColumns(){
        throw new Exception("Not Implemented");
    }

    protected function _alterColumn(jDbColumn $old, jDbColumn $new){
        throw new Exception("Not Implemented");
    }

    protected function _addColumn(jDbColumn $new){
        throw new Exception("Not Implemented");
    }

    protected function _loadIndexesAndKeys(){
        throw new Exception("Not Implemented");
    }

    protected function _createIndex(jDbIndex $index){
        throw new Exception("Not Implemented");
    }

    protected function _dropIndex(jDbIndex $index){
        throw new Exception("Not Implemented");
    }

    protected function _loadReferences(){
        throw new Exception("Not Implemented");
    }

    protected function _createReference(jDbReference $ref){
        throw new Exception("Not Implemented");
    }

    protected function _dropReference(jDbReference $ref){
        throw new Exception("Not Implemented");
    }
}

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class pgsqlDbSchema extends jDbSchema {

    /**
     *
     */
    function _createTable($name, $columns, $primaryKeys, $attributes=array()) {
        throw new Exception("Not Implemented");
    }

    /**
     * @return jDbTable
     */
    function getTable($name) {
        return  new pgsqlDbTable($this->getConn()->prefixTable($name), $this);
    }

    protected function _getTables () {
        $results = array ();
        $sql = "SELECT tablename FROM pg_tables
                  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
                  ORDER BY tablename";
        $rs = $this->getConn()->query ($sql);
        while ($line = $rs->fetch()){
            $results[] = new pgsqlDbTable($line->tablename, $this);
        }
        return $results;
    }



}
