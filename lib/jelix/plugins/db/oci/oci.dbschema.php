<?php
/**
* @package     jelix
* @subpackage  db_driver
* @author      Laurent Jouanneau
* @contributor Gwendal Jouannic
* @copyright   2008 Gwendal Jouannic, 2009-2018 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class ociDbTable extends jDbTable {

    public function getPrimaryKey() {
        if ($this->primaryKey === null) {
            $this->_loadColumns();
        }
        return $this->primaryKey;
    }

    protected function _loadColumns() {
        $conn = $this->schema->getConn();
        $results = array ();

        $query = 'SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE, NULLABLE, DATA_DEFAULT,  
                        (SELECT CONSTRAINT_TYPE 
                         FROM USER_CONSTRAINTS UC, USER_CONS_COLUMNS UCC 
                         WHERE UCC.TABLE_NAME = UTC.TABLE_NAME
                            AND UC.TABLE_NAME = UTC.TABLE_NAME
                            AND UCC.COLUMN_NAME = UTC.COLUMN_NAME
                            AND UC.CONSTRAINT_NAME = UCC.CONSTRAINT_NAME
                            AND UC.CONSTRAINT_TYPE = \'P\') AS CONSTRAINT_TYPE,  
                        (SELECT COMMENTS 
                         FROM USER_COL_COMMENTS UCCM
                         WHERE UCCM.TABLE_NAME = UTC.TABLE_NAME
                         AND UCCM.COLUMN_NAME = UTC.COLUMN_NAME) AS COLUMN_COMMENT
                    FROM USER_TAB_COLUMNS UTC 
                    WHERE UTC.TABLE_NAME = \''.strtoupper($this->name).'\'';

        $rs = $conn->query ($query);

        while ($line = $rs->fetch ()){

            $name = strtolower($line->column_name);
            $type = strtolower($line->data_type);
            $length = intval($line->data_length);

            $typeinfo = $conn->tools()->getTypeInfo($type);
            $phpType =  $conn->tools()->unifiedToPHPType($typeinfo[1]);
            $maxLength = $typeinfo[5];
            if ($phpType == 'string') {
                $maxLength = $length;
            }

            $notNull = ($line->nullable == 'N');
            $isPrimary = $line->constraint_type == 'P';
            $hasDefault = false;
            $default = '';
            if ($line->data_default !== null || !($line->data_default === null && $notNull)){
                $hasDefault = true;
                $default =  $line->data_default;
            }

            $col = new jDbColumn($name, $type,  $length, $hasDefault, $default, $notNull);
            $col->nativeType = $typeinfo[0];
            $col->maxValue = $typeinfo[3];
            $col->minValue = $typeinfo[2];
            $col->maxLength = $maxLength;
            $col->minLength = $typeinfo[4];
            $col->scale = intval($line->data_scale);
            $col->precision = intval($line->data_precision);

            // FIXME, retrieve autoincrement property for other field than primary key
            if ($isPrimary) {
                $sequence = $this->_getAISequenceName($this->name, $name);
                if ($sequence != '') {
                    $sqlai = "SELECT 'Y' FROM USER_SEQUENCES US
                                WHERE US.SEQUENCE_NAME = '".$sequence."'";
                    $rsai = $conn->query ($sqlai);
                    if ($rsai->fetch()){
                        $col->autoIncrement  = true;
                        $col->sequence = $sequence;
                    }
                }
            }

            $this->columns[$name] = $col;

            if ($isPrimary) {
                if (!$this->primaryKey)
                    $this->primaryKey = new jDbPrimaryKey($name);
                else
                    $this->primaryKey->columns[] = $name;
            }
        }
        if ($this->primaryKey === null) {
            $this->primaryKey = false;
        }
    }

    /**
     * Get the sequence name corresponding to an auto_increment field
     * @return string the sequence name, empty if not found
     */
    function _getAISequenceName($tbName, $clName){
        if (isset($this->_conn->profile['sequence_AI_pattern']))
            return preg_replace(array('/\*tbName\*/', '/\*clName\*/'),
                array(strtoupper($tbName), strtoupper($clName)),
                $this->_conn->profile['sequence_AI_pattern']);
        return '';
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
class ociDbSchema extends jDbSchema {

    protected function _createTable($name, $columns, $primaryKeys, $attributes = array()) {
        $sql = $this->_createTableQuery($name, $columns, $primaryKeys, $attributes);

        $this->conn->exec($sql);

        $table = new ociDbTable($name, $this);
        $table->attributes = $attributes;
        return $table;
    }

    protected function _getTables() {
        $results = array ();

        $rs = $this->conn->query ('SELECT TABLE_NAME FROM USER_TABLES');

        while ($line = $rs->fetch ()){
            $unpName = $this->conn->unprefixTable($line->table_name);
            $results[$unpName] = new ociDbTable($line->table_name, $this);
        }

        return $results;
    }

    protected function _getTableInstance($name) {
        return new ociDbTable($name, $this);
    }

    protected function _renameTable($oldName, $newName) {
        $this->conn->exec('RENAME TABLE '.$this->conn->encloseName($oldName).
            ' TO '.$this->conn->encloseName($newName));
    }
}
