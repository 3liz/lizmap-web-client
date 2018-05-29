<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Laurent Jouanneau
* @contributor     Loic Mathaud
* @copyright  2006 Loic Mathaud, 2007-2017 Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class sqliteDbTable extends jDbTable {

    public function getPrimaryKey() {
        if ($this->primaryKey === null) {
            $this->_loadColumns();
        }
        return $this->primaryKey;
    }

    protected function _loadColumns() {
        $conn = $this->schema->getConn();
        $this->columns = array();
        $sql = "PRAGMA table_info(". $conn->quote($this->name) .")";
        $rs = $conn->query($sql);
        $tools = $conn->tools();

        while ($c = $rs->fetch()) {
            $hasDefault = false;
            $default = null;
            $isPrimary  = ($c->pk == 1);
            $notNull   = ($c->notnull == '99' || $c->pk == 1);

            if (!$isPrimary) {
                if ($c->dflt_value !== null || ($c->dflt_value === null && !$notNull)) {
                    $hasDefault = true;
                    $default =  $c->dflt_value;
                }
            }

            list($type, $length, $precision, $scale) = $tools->parseSQLType($c->type);

            $col = new jDbColumn($c->name, $type,  $length, $hasDefault, $default, $notNull);

            $typeinfo = $tools->getTypeInfo($type);
            $col->nativeType = $typeinfo[0];
            $col->maxValue = $typeinfo[3];
            $col->minValue = $typeinfo[2];
            $col->maxLength = $typeinfo[5];
            $col->minLength = $typeinfo[4];
            $col->precision = $precision;
            $col->scale = $scale;

            if ($col->length !=0)
                $col->maxLength = $col->length;

            if ($col->type == 'integer' && $isPrimary) {
                $col->autoIncrement = true;
            }
            if ($isPrimary) {
                if (!$this->primaryKey)
                    $this->primaryKey = new jDbPrimaryKey($c->name);
                else
                    $this->primaryKey->columns[] = $c->name;
            }
            $this->columns[$col->name] = $col;
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

    protected function _replaceConstraint(jDbConstraint $oldConstraint, jDbConstraint $newConstraint) {
        throw new Exception ('Not Implemented');
    }

}

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class sqliteDbSchema extends jDbSchema {

    protected function _createTable($name, $columns, $primaryKey, $attributes = array()) {

        $sql = $this->_createTableQuery($name, $columns, $primaryKey, $attributes);
        $this->conn->exec($sql);
        $table = new sqliteDbTable($name, $this);
        return $table;
    }

    protected $supportAutoIncrement = true;

    protected function _getTables() {
        $results = array ();

        $rs = $this->conn->query('SELECT name FROM sqlite_master WHERE type="table"');

        while ($line = $rs->fetch ()){
            $unpName = $this->conn->unprefixTable($line->name);
            $results[$unpName] = new sqliteDbTable($line->name, $this);
        }

        return $results;
    }

    protected function _getTableInstance($name) {
        return new sqliteDbTable($name, $this);
    }
}


