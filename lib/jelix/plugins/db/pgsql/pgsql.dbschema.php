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
    function createTable($name, $columns, $primaryKeys, $attributes=array()) {
        
    }

    /**
     * @return jDbTable
     */
    function getTable($name) {
        return  new pgsqlDbTable($this->schema->getConn()->prefixTable($name), $this);
    }

    public function getTables () {
        $results = array ();
        $sql = "SELECT tablename FROM pg_tables
                  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
                  ORDER BY tablename";
        $rs = $this->schema->getConn()->query ($sql);
        while ($line = $rs->fetch()){
            $results[] = new pgsqlDbTable($line->tablename, $this);
        }
        return $results;
    }



}
