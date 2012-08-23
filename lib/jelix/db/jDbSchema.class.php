<?php
/**
* @package    jelix
* @subpackage db
* @author     Laurent Jouanneau
* @contributor Aurélien Marcel
* @copyright  2010 Laurent Jouanneau, 2011 Aurélien Marcel
*
* @link        http://jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

require_once(JELIX_LIB_PATH.'db/jDbTable.class.php');
require_once(JELIX_LIB_PATH.'db/jDbColumn.class.php');

/**
 *
 */
abstract class jDbSchema {

    /**
     * @var jDbConnection
     */
    protected $conn;

    function __construct(jDbConnection $conn) {
        $this->conn = $conn;
    }

    /**
     * @return jDbConnection
     */
    public function getConn() {
        return $this->conn;
    }

    /**
     * create the given table
     * @return jDbTable the object corresponding to the created table
     */
    function createTable($name, $columns, $primaryKey, $attributes = array()) {
        $name = $this->conn->prefixTable($name);
        if ($this->tables === null) {
            $this->tables = $this->_getTables();
        }

        if (isset($this->tables[$name])) {
            return null;
        }

        $this->tables[$name] = $this->_createTable($name, $columns, $primaryKey, $attributes);

        return $this->tables[$name];
    }

    /**
     * load informations of the given table
     * @return jDbTable ready to make change
     */
    function getTable($name) {
        $name = $this->conn->prefixTable($name);

        if ($this->tables === null) {
            $this->tables = $this->_getTables();
        }

        if (isset($this->tables[$name])) {
            return $this->tables[$name];
        }
        return null;
    }


    protected $tables = null;

    /**
     * @return array of jDbTable
     */
    public function getTables() {
        if ($this->tables === null) {
            $this->tables = $this->_getTables();
        }
        return $this->tables;
    }


    public function dropTable(jDbTable $table) {
        if ($this->tables === null) {
            $this->tables = $this->_getTables();
        }
        $name = $table->getName();
        if (isset($this->tables[$name])) {
            $this->_dropTable($name);
            unset($this->tables[$name]);
        }
    }

    /**
     * create the given table into the database
     * @return jDbTable the object corresponding to the created table
     */
    abstract protected function _createTable($name, $columns, $primaryKey, $attributes = array());

    abstract protected function _getTables();

    protected function _dropTable($name) {
        $this->conn->exec('DROP TABLE '.$this->conn->encloseName($name));
    }

    /**
     * return the SQL string corresponding to the given column.
     * private method, should be used only by a jDbTable object
     * @param jDbColumn $col  the column
     * @param jDbTools $tools
     * @return string the sql string
     * @access private
     */
    function _prepareSqlColumn($col) {
        $this->normalizeColumn($col);
        $colstr = $this->conn->encloseName($col->name).' '.$col->nativeType;

        if ($col->length) {
            $colstr .= '('.$col->length.')';
        }

        $colstr.= ($col->notNull?' NOT NULL':' NULL');

        if ($col->hasDefault && !$col->autoIncrement) {
            if (!($col->notNull && $col->default === null)) {
                if ($col->default === null)
                    $colstr .= ' DEFAULT NULL';
                else
                    $colstr .= ' DEFAULT '.$this->conn->quote($col->default);
            }
        }
        return $colstr;
    }

    /**
     * fill correctly some properties of the column, depending of its type
     * and other properties
     * @param jDbColumn $col
     */
    function normalizeColumn($col) {
        $type = $this->conn->tools()->getTypeInfo($col->type);

        $col->nativeType = $type[0];
        if (!$col->length && $type[5]) {
            $col->length = $type[5];
        }

        if ($type[6]) {
            $col->autoIncrement = true;
            $col->notNull = true;
        }
    }
}
