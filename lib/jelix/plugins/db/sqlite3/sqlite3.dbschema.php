<?php
/**
* @package    jelix
* @subpackage db
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
class sqlite3DbTable extends jDbTable {

    protected function _loadColumns() {
        $conn = $this->schema->getConn();
        $this->columns = array();
        $sql = "PRAGMA table_info(". $conn->quote($this->name) .")";
        $rs = $conn->query($sql);

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

            $length = 0;
            if (preg_match('/^(\w+)\s*(\((\d+)\))?.*$/',$c->type,$m)) {
                $type = strtolower($m[1]);
                if (isset($m[3])) {
                    $length = intval($m[3]);
                }
            }
            else {
                $type = $c->type;
            }

            $col = new jDbColumn($c->name, $type,  $length, $hasDefault, $default, $notNull);

            $typeinfo = $conn->tools()->getTypeInfo($type);
            $col->nativeType = $typeinfo[0];
            $col->maxValue = $typeinfo[3];
            $col->minValue = $typeinfo[2];
            $col->maxLength = $typeinfo[5];
            $col->minLength = $typeinfo[4];

            if ($col->length !=0)
                $col->maxLength = $col->length;

            if ($col->type == 'integer' && $isPrimary) {
                $col->autoIncrement = true;
            }
            $this->columns[$col->name] = $col;
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
class sqlite3DbSchema extends jDbSchema {

    protected function _createTable($name, $columns, $primaryKey, $attributes = array()) {

        $cols = array();

        if (is_string($primaryKey))
            $primaryKey = array($primaryKey);

        foreach ($columns as $col) {
            $cols[] = $this->_prepareSqlColumn($col);
        }

        $sql = 'CREATE TABLE '.$name.' ('.implode(", ",$cols);
        if (count($primaryKey))
            $sql .= ', CONSTRAINT '.$name.'_pkey PRIMARY KEY ('.implode(',',$primaryKey).') ';
        $sql .= ')';

        $this->conn->exec($sql);
        $table = new sqlite3DbTable($name, $this);
        return $table;
    }

    protected function _getTables() {
        $results = array ();

        $rs = $this->conn->query('SELECT name FROM sqlite_master WHERE type="table"');

        while ($line = $rs->fetch ()){
            $results[$line->name] = new sqlite3DbTable($line->name, $this);
        }

        return $results;
    }
}


