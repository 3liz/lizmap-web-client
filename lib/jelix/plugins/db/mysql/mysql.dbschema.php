<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Laurent Jouanneau
* @copyright  2005-2018 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class mysqlDbTable extends jDbTable {

    public $attributes = array();

    protected function _loadColumns() {

        $this->columns = array ();
        $conn = $this->schema->getConn();
        $tools = $conn->tools();

        $rs = $conn->query ('SHOW FULL FIELDS FROM '.$conn->encloseName($this->name));
        while ($line = $rs->fetch ()) {
            list($type, $length, $precision, $scale) = $tools->parseSQLType($line->Type);
            if ($type == 'tinyint' && $precision == 1) {
                $type = 'boolean';
                $precision = 0;
            }

            $hasDefault = false;
            $default = null;
            $notNull = ($line->Null == 'NO');
            $autoIncrement  = ($line->Extra == 'auto_increment');
            $isPrimary = ($line->Key == 'PRI');

            // when default value is null, it can mean that there is a
            // default value to null, or it can mean there is no default value :-/

            if ($autoIncrement) {
                $hasDefault = true;
                $default = '';
            }
            else if ($line->Default == null) {
                if ($notNull) {
                    if ($autoIncrement) {
                        $hasDefault = true;
                        $default = '';
                    }
                }
                else {
                    $hasDefault = true;
                }
            }
            else if (!$isPrimary) {
                $hasDefault = true;
                $default = ($line->Default === 'NULL'?null:$line->Default);
            }

            $typeinfo = $tools->getTypeInfo($type);
            if ($hasDefault && $typeinfo[1] == 'boolean') {
                $default = ($default == '1' || $default === true || strtolower($default) == 'true');
            }

            $col = new jDbColumn($line->Field, $type, $length, $hasDefault, $default, $notNull);
            $col->autoIncrement = $autoIncrement;

            $col->nativeType = $typeinfo[0];
            $col->maxValue = $typeinfo[3];
            $col->minValue = $typeinfo[2];
            $col->maxLength = $typeinfo[5];
            $col->minLength = $typeinfo[4];
            $col->precision = $precision;
            $col->scale = $scale;
            if ($col->length !=0) {
                $col->maxLength = $col->length;
            }
            $this->columns[$line->Field] = $col;
        }
    }

    protected function _alterColumn(jDbColumn $old, jDbColumn $new) {
        $conn = $this->schema->getConn();

        $pk = $this->getPrimaryKey();
        $isPk = ($pk && in_array($new->name, $pk->columns));
        $isSinglePk = $isPk && count($pk->columns) == 1;

        $sql = 'ALTER TABLE '.$conn->encloseName($this->name)
                .' CHANGE COLUMN '.$conn->encloseName($old->name)
                .' '.$this->schema->_prepareSqlColumn($new, $isPk, $isSinglePk);
        $conn->exec($sql);
    }

    protected function _addColumn(jDbColumn $new) {
        $conn = $this->schema->getConn();
        $pk = $this->getPrimaryKey();
        $isPk = ($pk && in_array($new->name, $pk->columns));
        $isSinglePk = $isPk && count($pk->columns) == 1;
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name)
                .' ADD COLUMN '.$this->schema->_prepareSqlColumn($new, $isPk, $isSinglePk);
        $conn->exec($sql);
    }

    protected function _loadIndexesAndKeys() {
        $this->indexes = array();
        $this->references = array();
        $this->primaryKey = false;
        $this->uniqueKeys = array();

        $conn = $this->schema->getConn();

        // retrieve all constraints first
        $key_column_usageSupport = true;
        try {
            $rs = $conn->query('SELECT k.CONSTRAINT_CATALOG, k.CONSTRAINT_NAME, c.CONSTRAINT_TYPE,
                k.COLUMN_NAME, ORDINAL_POSITION, POSITION_IN_UNIQUE_CONSTRAINT,
                REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                FROM information_schema.key_column_usage  k
                INNER JOIN information_schema.table_constraints c ON
                    (k.CONSTRAINT_SCHEMA = c.CONSTRAINT_SCHEMA
                AND k.CONSTRAINT_NAME = c.CONSTRAINT_NAME
                AND k.CONSTRAINT_CATALOG = c.CONSTRAINT_CATALOG
                AND k.table_name = c.table_name
                AND k.table_schema = c.table_schema
                ) WHERE k.table_name = '.$conn->quote($this->name).
                ' AND k.table_schema = '.$conn->quote($conn->profile['database']).
                ' ORDER BY ORDINAL_POSITION ASC');

            while ($constraint = $rs->fetch ()) {
                if ($constraint->CONSTRAINT_TYPE == 'PRIMARY KEY') {
                    if (! $this->primaryKey) {
                        $this->primaryKey = new jDbPrimaryKey(
                            $constraint->COLUMN_NAME,
                            $constraint->CONSTRAINT_NAME);
                    }
                    else {
                        $this->primaryKey->columns[] = $constraint->COLUMN_NAME;
                    }
                }
                else if ($constraint->CONSTRAINT_TYPE == 'UNIQUE') {
                    if (!isset($this->uniqueKeys[$constraint->CONSTRAINT_NAME])) {
                        $unique = new jDbUniqueKey($constraint->CONSTRAINT_NAME,
                            $constraint->COLUMN_NAME);
                        $this->uniqueKeys[$constraint->CONSTRAINT_NAME] = $unique;
                    }
                    else {
                        $this->uniqueKeys[$constraint->CONSTRAINT_NAME]->columns[] = $constraint->COLUMN_NAME;
                    }
                }
                elseif ($constraint->CONSTRAINT_TYPE == 'FOREIGN KEY') {
                    if (!isset($this->references[$constraint->CONSTRAINT_NAME])) {
                        $fk = new jDbReference(
                            $constraint->CONSTRAINT_NAME,
                            $constraint->COLUMN_NAME,
                            $constraint->REFERENCED_TABLE_NAME,
                            array($constraint->REFERENCED_COLUMN_NAME)
                        );
                        $this->references[$constraint->CONSTRAINT_NAME] = $fk;
                    }
                    else {
                        $fk = $this->references[$constraint->CONSTRAINT_NAME];
                        $fk->columns[] = $constraint->COLUMN_NAME;
                        $fk->fColumns[] = $constraint->REFERENCED_COLUMN_NAME;
                    }
                }
            };

        }catch(Exception $e) {
            // for mysql <5.0.6, key_column_usage does not exist, so we ignore it
            $key_column_usageSupport = false;
        }


        // now read all indexes that are not related to a constraint
        // (except if we are with mysql <5.0.6, we use indexes as
        //  but in this case we don't know if the index is related to a
        //  foreign key or not, so we will have an unwanted index in indexes)
        $rs = $conn->query('SHOW INDEX FROM '.$conn->encloseName($this->name));

        while ($idx = $rs->fetch ()) {
            if ($key_column_usageSupport) {
                $name = $idx->Key_name;
                if (!isset($this->references[$name]) &&
                    !isset($this->uniqueKeys[$name]) &&
                    $name != 'PRIMARY'
                ) {
                    if(!isset($this->indexes[$name])) {
                        $this->indexes[$name] = new jDbIndex($name, $idx->Index_type);
                    }
                    $this->indexes[$name]->columns[$idx->Seq_in_index-1] = $idx->Column_name;
                }
                continue;
            }

            // deprecated
            if ($idx->Key_name == 'PRIMARY') {
                if (!$this->primaryKey) {
                    $this->primaryKey = new jDbPrimaryKey($idx->Column_name, $idx->Key_name);
                    $this->primaryKey->columns = array();
                }
                $this->primaryKey->columns[$idx->Seq_in_index - 1] = $idx->Column_name;
            }
            else if ($idx->Non_unique == 0) {
                if(!isset($this->uniqueKeys[$idx->Key_name])) {
                    $this->uniqueKeys[$idx->Key_name] = new jDbUniqueKey($idx->Key_name);
                }
                $this->uniqueKeys[$idx->Key_name]->columns[$idx->Seq_in_index-1] = $idx->Column_name;
            }
            else {
                if(!isset($this->indexes[$idx->Key_name])) {
                    $this->indexes[$idx->Key_name] = new jDbIndex($idx->Key_name, $idx->Index_type);
                }
                $this->indexes[$idx->Key_name]->columns[$idx->Seq_in_index-1] = $idx->Column_name;
            }
        }
        foreach($this->indexes as $name => $index) {
            ksort($index->columns);
            $index->columns = array_values($index->columns);
        }

        if (!$key_column_usageSupport) {
            foreach($this->uniqueKeys as $name => $index) {
                ksort($index->columns);
                $index->columns = array_values($index->columns);
            }
            if ($this->primaryKey) {
                ksort($this->primaryKey->columns);
                $this->primaryKey->columns = array_values($this->primaryKey->columns);
            }
        }
        else {
            // remove indexes that corresponds to references or unique keys
            foreach ($this->references as $ref) {
                if (isset($this->indexes[$ref->columns[0]])) {
                    if ($this->indexes[$ref->columns[0]]->columns == $ref->columns) {
                        unset($this->indexes[$ref->columns[0]]);
                    }
                }
            }
            foreach ($this->uniqueKeys as $ref) {
                if (isset($this->indexes[$ref->columns[0]])) {
                    if ($this->indexes[$ref->columns[0]]->columns == $ref->columns) {
                        unset($this->indexes[$ref->columns[0]]);
                    }
                }
            }
        }
    }
    
    protected function _createIndex(jDbIndex $index) {

        $conn = $this->schema->getConn();
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name).' ADD ';

        $sql .= 'INDEX '.$conn->encloseName($index->name);
        if ($index->type != '')
            $sql.= ' USING '.$index->type;

        $f = '';
        foreach ($index->columns as $col) {
            $f .= ','.$conn->encloseName($col);
        }

        $conn->exec($sql.'('.substr($f,1).')');
    }

    protected function _dropIndex(jDbIndex $index) {

        $conn = $this->schema->getConn();
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name).' DROP ';
        $sql .= 'INDEX '.$conn->encloseName($index->name);

        $conn->exec($sql);
    }

    protected function _loadReferences() {

        // references are loaded by _loadIndexesAndKeys, but some informations
        // such as ON DELETE are missing. So we will read the CREATE TABLE
        // statement. However, in the CREATE TABLE, we may not have the
        // constraint name, so let's create a table to match both
        $existingReferences = array();
        foreach($this->references as $ref) {
            $cols = $ref->columns;
            sort($cols);
            $key = implode('_', $cols);
            $existingReferences[$key] = $ref;
        }

        $conn = $this->schema->getConn();
        $sql = 'SHOW CREATE TABLE '.$conn->encloseName($this->name);
        $rs = $conn->query($sql);
        $rec = $rs->fetch();
        if (!$rec) {
            return;
        }
        $createTableQuery = $rec->{'Create Table'};
        /*
        CONSTRAINT [symbol] FOREIGN KEY [index_name] (col_name [(length)] [ASC | DESC],...)
        REFERENCES tbl_name (col_name [(length)] [ASC | DESC],...)
              [MATCH FULL | MATCH PARTIAL | MATCH SIMPLE]
              [ON DELETE  RESTRICT | CASCADE | SET NULL | NO ACTION]
              [ON UPDATE  RESTRICT | CASCADE | SET NULL | NO ACTION]
        */

        $regexp = '/^\s*(?:CONSTRAINT(?:\s+`(.+?)`)?\s+)?FOREIGN\s+KEY(?:\s+`(.+?)`)?\s+\((.+?)\)\s+REFERENCES\s+`(.+?)`\s+\((.+?)\)(?:\s+MATCH\s+(FULL|PARTIAL|SIMPLE))?(?:\s+ON DELETE\s+(RESTRICT|CASCADE|SET NULL|NO ACTION))?(?:\s+ON UPDATE\s+(RESTRICT|CASCADE|SET NULL|NO ACTION))?,?$/msi';
        if (preg_match_all($regexp, $createTableQuery, $m, PREG_SET_ORDER)) {
            foreach ($m as $constraint) {

                $columns = array();
                if (preg_match_all('/`([^`]+)`/', $constraint[3], $mc)) {
                    $columns = $mc[1];
                }
                if (!count($columns)) {
                    continue;
                }
                if ($constraint[1] != '' && isset($this->references[$constraint[1]])) {
                    $ref = $this->references[$constraint[1]];
                }
                else if ($constraint[2] != '' && isset($this->references[$constraint[2]])) {
                    $ref = $this->references[$constraint[2]];
                }
                else {
                    $cols = $columns;
                    sort($cols);
                    $key = implode('_', $cols);
                    if (isset($existingReferences[$key])) {
                        $ref = $existingReferences[$key];
                    }
                    else {
                        $ref = new jDbReference();
                        if ($constraint[1]) {
                            $ref->name = $constraint[1];
                        }
                        else if ($constraint[2]) {
                            $ref->name = $constraint[2];
                        }
                        else {
                            $ref->name = $this->name.'_'.$key.'_fk';
                        }

                        $ref->fTable = $constraint[4];
                        if (preg_match_all('/`([^`]+)`/', $constraint[5], $mc)) {
                            $ref->fColumns = $mc[1];
                        }

                        $this->references[$ref->name] = $ref;
                    }
                }
                if (isset($constraint[7])) {
                    $ref->onDelete = $constraint[7];
                }
                if (isset($constraint[8])) {
                    $ref->onUpdate = $constraint[8];
                }
            }
        }
    }

    protected function _createReference(jDbReference $ref) {
        $conn = $this->schema->getConn();
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name).' ADD CONSTRAINT ';
        $sql.= $conn->encloseName($ref->name). ' FOREIGN KEY (';

        $cols = $conn->tools()->getSQLColumnsList($ref->columns);
        $fcols = $conn->tools()->getSQLColumnsList($ref->fColumns);

        $sql .= $cols.') REFERENCES '.$conn->encloseName($ref->fTable).'(';
        $sql .= $fcols.')';

        if ($ref->onUpdate) {
            $sql .= 'ON UPDATE '.$ref->onUpdate.' ';
        }
        if ($ref->onDelete) {
            $sql .= 'ON DELETE '.$ref->onDelete.' ';
        }
        $conn->exec($sql);
    }

    protected function _dropReference(jDbReference $ref) {
        $conn = $this->schema->getConn();
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name).' DROP FOREIGN KEY '.$conn->encloseName($ref->name);
        $conn->exec($sql);
    }

    protected function _createConstraint(jDbConstraint $constraint) {
        if ($constraint instanceof jDbReference) {
            $this->_createReference($constraint);
            return;
        }

        $conn = $this->schema->getConn();
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name).' ADD ';

        if ($constraint instanceof jDbPrimaryKey) {
            $sql .= 'PRIMARY KEY';
        }
        else if ($constraint instanceof jDbUniqueKey) {
            $sql .= 'CONSTRAINT UNIQUE KEY '.$conn->encloseName($constraint->name);
        }

        $sql .= '('.$conn->tools()->getSQLColumnsList($constraint->columns).')';

        $conn->exec($sql);
    }

    protected function _dropConstraint(jDbConstraint $constraint) {
        if ($constraint instanceof jDbReference) {
            $this->_dropReference($constraint);
            return;
        }
        $conn = $this->schema->getConn();
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name).' DROP ';

        if ($constraint instanceof jDbPrimaryKey) {
            $sql .= 'PRIMARY KEY';
        }
        else {
            $sql .= 'KEY '.$conn->encloseName($constraint->name);
        }

        $conn->exec($sql);
    }

}
 
/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class mysqlDbSchema extends jDbSchema {

    /**
     * @param string $name
     * @param jDbColumn[] $columns
     * @param string[]|string $primaryKey names of columns that represents primary keys
     * @return mysqlDbTable
     */
    function _createTable($name, $columns, $primaryKeys, $attributes=array()) {
        $sql = $this->_createTableQuery($name, $columns, $primaryKeys, $attributes);

        if (isset($attributes['engine'])) {
            $sql.= ' ENGINE='.$attributes['engine'];
        }
        if (isset($attributes['charset'])) {
            $sql.= ' CHARACTER SET '.$attributes['charset'];
        }
        if (isset($attributes['collate'])) {
            $sql.= ' COLLATE '.$attributes['collate'];
        }

        $this->conn->exec($sql);

        $table = new mysqlDbTable($name, $this);
        $table->attributes = $attributes;
        return $table;
    }

    protected $supportAutoIncrement = true;

    function _prepareSqlColumn($col, $isPrimaryKey=false, $isSinglePrimaryKey=false) {
        $colStr = parent::_prepareSqlColumn($col, $isPrimaryKey, $isSinglePrimaryKey);
        if ($col->comment) {
            $colStr .= ' COMMENT '.$this->conn->quote($col->comment);
        }
        return $colStr;
    }

    protected function _getTables() {
        $results = array ();
        if (isset($this->conn->profile['database'])) {
            $db = $this->conn->profile['database'];
        }
        else if (isset($this->conn->profile['dsn'])
                 && preg_match('/dbname=([a-z0-9_ ]*)/', $this->conn->profile['dsn'], $m)){
            $db = $m[1];
        }
        else {
            throw new jException("jelix~error.no.database.name", $this->conn->profile['name']);
        }
        $rs = $this->conn->query ('SHOW TABLES FROM '.$this->conn->encloseName($db));
        $col_name = 'Tables_in_'.$db;

        while ($line = $rs->fetch ()){
            $unpName = $this->conn->unprefixTable($line->$col_name);
            $results[$unpName] = new mysqlDbTable($line->$col_name, $this);
        }
        return $results;
    }

    protected function _getTableInstance($name) {
        return new mysqlDbTable($name, $this);
    }
}
