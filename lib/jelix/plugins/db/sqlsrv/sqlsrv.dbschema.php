<?php
/**
* @package    jelix
* @subpackage db_driver
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

    public function getPrimaryKey() {
        if ($this->primaryKey === null) {
            $this->_loadColumns();
        }
        return $this->primaryKey;
    }

    protected function _loadColumns() {
        $conn = $this->schema->getConn();
        $tools = $conn->tools();

        $sql = "exec sp_columns @table_name = " . $conn->encloseName($this->name);
        $rs = $conn->query($sql);
        $tableOwner = null;
        while ($line = $rs->fetch()) {
            if ($tableOwner === null) {
                $tableOwner = $line->TABLE_OWNER;
            }
            $name = $line->COLUMN_NAME;
            $type = $line->TYPE_NAME;
            $autoIncrement = false;
            if ($type == 'int identity'){
                $type = 'int';
                $autoIncrement = true;
            }
            else {
                $pos = strpos($type, ' ');
                if ($pos !== false) {
                    $type = substr($type, 0, $pos);
                }
            }
            if ($type == 'bit'){
                $type = 'int';
            }
            $length = intval($line->LENGTH);
            $notNull = !($line->NULLABLE);
            $default = $line->COLUMN_DEF;
            $hasDefault = ($line->default != "");

            $col = new jDbColumn($name, $type, $length, $hasDefault, $default, $notNull);
            $col->autoIncrement = $autoIncrement;

            $typeinfo = $tools->getTypeInfo($type);
            $col->nativeType = $typeinfo[0];
            $col->maxValue = $typeinfo[3];
            $col->minValue = $typeinfo[2];
            $col->maxLength = $typeinfo[5];
            $col->minLength = $typeinfo[4];
            $col->precision = intval($line->PRECISION);
            $col->scale = intval($line->SCALE);
            if ($col->length !=0) {
                $col->maxLength = $col->length;
            }
            $this->columns[$name] = $col;
        }

        // get primary key info
        $sql = "exec sp_pkeys @table_owner = ".$tableOwner.", @table_name = " .
            $conn->encloseName($this->name);
        $rs = $conn->query($sql);
        while ($line = $rs->fetch()) {
            if (!$this->primaryKey) {
                $this->primaryKey = new jDbPrimaryKey($line->COLUMN_NAME);
            }
            else {
                $this->primaryKey->columns[] = $line->COLUMN_NAME;
            }
        }
        if ($this->primaryKey === null) {
            $this->primaryKey = false;
        }
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

    protected function _createConstraint(jDbConstraint $constraint) {
        throw new Exception ('Not Implemented');
    }

    protected function _dropConstraint(jDbConstraint $constraint) {
        throw new Exception ('Not Implemented');
    }
}

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class sqlsrvDbSchema extends jDbSchema {

    protected function _createTable($name, $columns, $primaryKeys, $attributes = array()) {
        $sql = $this->_createTableQuery($name, $columns, $primaryKeys, $attributes);

        $this->conn->exec($sql);

        $table = new sqlsrvDbTable($name, $this);
        $table->attributes = $attributes;
        return $table;
    }

    protected function _getTables() {
        $results = array ();
        $sql = "SELECT TABLE_NAME FROM " .
            $this->conn->profile['database']. ".INFORMATION_SCHEMA.TABLES
                WHERE TABLE_TYPE = 'BASE TABLE' AND
                TABLE_NAME NOT LIKE ('sys%') AND
                TABLE_NAME NOT LIKE ('dt%')";
        $rs = $this->conn->query ($sql);
        while ($line = $rs->fetch()){
            $unpName = $this->conn->unprefixTable($line->TABLE_NAME);
            $results[$unpName] = new sqlsrvDbTable($line->TABLE_NAME, $this);
        }
        return $results;
    }

    protected function _getTableInstance($name) {
        return new sqlsrvDbTable($name, $this);
    }

    protected function _renameTable($oldName, $newName) {
        $this->conn->exec("EXEC sp_rename '".$oldName.
            "', '".$newName."'");
    }
}
