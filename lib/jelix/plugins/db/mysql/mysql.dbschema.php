<?php
/**
* @package    jelix
* @subpackage db
* @author     Laurent Jouanneau
* @copyright  2005-2017 Laurent Jouanneau
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
        $this->primaryKey = false;
        $conn = $this->schema->getConn();
        $tools = $conn->tools();
        $rs = $conn->query ('SHOW FIELDS FROM '.$conn->encloseName($this->name));

        while ($line = $rs->fetch ()) {

            $length = 0;
            if (preg_match('/^(\w+)\s*(\((\d+)\))?.*$/',$line->Type,$m)) {
                $type = strtolower($m[1]);
                if ($type == 'varchar' && isset($m[3])) {
                    $length = intval($m[3]);
                }
            } else {
                $type = $line->Type;
            }
            $notNull = ($line->Null == 'NO');
            $autoIncrement  = ($line->Extra == 'auto_increment');
            $hasDefault = ($line->Default != '' || !($line->Default == null && $notNull));
            // to fix a bug in php 5.2.5 or mysql 5.0.51
            if($notNull && $line->Default === null && !$autoIncrement)
                $default ='';
            else
                $default = $line->Default;

            $col = new jDbColumn($line->Field, $type, $length, $hasDefault, $default, $notNull);
            $col->autoIncrement = $autoIncrement;

            $typeinfo = $tools->getTypeInfo($type);
            //$col->unifiedType = $typeinfo[1];
            $col->maxValue = $typeinfo[3];
            $col->minValue = $typeinfo[2];
            $col->maxLength = $typeinfo[5];
            $col->minLength = $typeinfo[4];
            if ($col->length !=0)
                $col->maxLength = $col->length;

            if ($line->Key == 'PRI') {
                if (!$this->primaryKey)
                    $this->primaryKey = new jDbPrimaryKey($line->Field);
                else
                    $this->primaryKey->columns[] = $line->Field;
            }
            
            $this->columns[$line->Field] = $col;
        }
    }

    protected function _alterColumn(jDbColumn $old, jDbColumn $new) {
        $conn = $this->schema->getConn();

        $pk = $this->getPrimaryKey();
        $isPk = ($pk && in_array($new->name, $pk->columns));

		$sql = 'ALTER TABLE '.$conn->encloseName($this->name)
                .' CHANGE COLUMN '.$conn->encloseName($old->name)
                .' '.$this->schema->_prepareSqlColumn($new);
        if ($isPk && $old->autoIncrement)
            $sql .= ' AUTO_INCREMENT';
		$conn->exec($sql);
    }

    protected function _addColumn(jDbColumn $new) {
        $conn = $this->schema->getConn();
        $pk = $this->getPrimaryKey();
        $isPk = ($pk && in_array($new->name, $pk->columns));
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name)
                .' ADD COLUMN '.$this->schema->_prepareSqlColumn($new);
        if ($isPk && $new->autoIncrement)
            $sql .= ' AUTO_INCREMENT';

		$conn->exec($sql);
    }


    protected function _loadIndexesAndKeys() {

        $conn = $this->schema->getConn();
		$rs = $conn->query('SHOW INDEX FROM '.$conn->encloseName($this->name));

        $this->uniqueKeys = $this->indexes = array();
        $this->primaryKey = false;

		while ($idx = $rs->fetch ()) {
            if ($idx->Key_name == 'PRIMARY') {
                if (!$this->primaryKey)
                    $this->primaryKey = new jDbPrimaryKey($idx->Column_name);
                else
                    $this->primaryKey->columns[$idx->Seq_in_index-1] = $idx->Column_name;
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
    }
    
    protected function _createIndex(jDbIndex $index) {

        $conn = $this->schema->getConn();
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name).' ADD ';

        if ($index instanceof jDbPrimaryKey) {
            $sql .= 'PRIMARY KEY';
        }
        else if ($index instanceof jDbUniqueKey) {
            $sql .= 'CONSTRAINT UNIQUE KEY '.$conn->encloseName($index->name);
        }
        else {
            $sql .= 'INDEX '.$conn->encloseName($index->name);
            if ($index->type != '')
                $sql.= ' USING '.$index->type;
        }

        $f = '';
        foreach ($index->columns as $col) {
            $f .= ','.$conn->encloseName($col);
        }

        $conn->exec($sql.'('.substr($f,1).')');
    }

    protected function _dropIndex(jDbIndex $index) {

        $conn = $this->schema->getConn();
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name).' DROP ';

        if ($index instanceof jDbPrimaryKey) {
            $sql .= 'PRIMARY KEY';
        }
        else {
            $sql .= 'INDEX '.$conn->encloseName($index->name);
        }

        $conn->exec($sql);
    }

    protected function _loadReferences() {
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

		preg_match_all('/^\s*(?:CONSTRAINT(?:\s+`(.+?)`)?\s+)?FOREIGN\s+KEY(?:\s+`(.+?)`)?\s+\((.+?)\)\s+REFERENCES\s+`(.+?)`\s+\((.+?)\)(?:\s+MATCH\s+(FULL|PARTIAL|SIMPLE))?(?:\s+ON DELETE\s+(RESTRICT|CASCADE|SET NULL|NO ACTION))?(?:\s+ON UPDATE\s+(RESTRICT|CASCADE|SET NULL|NO ACTION))?,?$/msi', $createTableQuery, $m);
        foreach ($m[1] as $i => $symbol) {
            //$match = $m[6][$i];
            $ref = new jDbReference();
            $ref->name = ($m[2][$i] != ''?$m[2][$i]:$symbol) ;
            $ref->fTable = $m[4][$i];
            $ref->onDelete = $m[7][$i];
            $ref->onUpdate = $m[8][$i];
            if (preg_match_all('/`([^`]+)`/', $m[3][$i], $mc))
                $ref->columns = $mc[1];
            if (preg_match_all('/`([^`]+)`/', $m[5][$i], $mc))
                $ref->fColumns = $mc[1];
            if ($ref->name && count($ref->columns) && count($ref->fColumns))
                $this->references[$ref->name] = $ref;
		}
    }

    protected function _createReference(jDbReference $ref) {
        $conn = $this->schema->getConn();
        $sql = 'ALTER TABLE '.$conn->encloseName($this->name).' ADD CONSTRAINT ';
        $sql.= $conn->encloseName($ref->name). ' FOREIGN KEY (';

        $cols = array();
		$fcols = array();
        foreach ($ref->columns as $c) {
            $cols[] = $conn->encloseName($c);
        }
        foreach ($ref->fColumns as $c) {
            $fcols[] = $conn->encloseName($c);
        }

        $sql .= implode(',', $cols).') REFERENCES '.$conn->encloseName($ref->fTable).'(';
        $sql .= implode(',', $fcols).')';

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

}
 
/**
 * 
 * @package    jelix
 * @subpackage db_driver
 */
class mysqlDbSchema extends jDbSchema {

    /**
     * @param string $name
     * @param array[jDbColumn] $columns
     * @return mysqlDbTable
     */
    function _createTable($name, $columns, $primaryKey, $attributes=array()) {

        $cols = array();

        if (is_string($primaryKey))
            $primaryKey = array($primaryKey);

        foreach ($columns as $col) {
            $colstr = $this->_prepareSqlColumn($col);

            if (in_array($col->name, $primaryKey) && $col->autoIncrement) {
                $colstr .= '  AUTO_INCREMENT';
            }

            $cols[] = $colstr;
        }

        $sql = 'CREATE TABLE '.$this->conn->encloseName($name).' ('.implode(", ",$cols);
        if (count($primaryKey))
            $sql .= ', PRIMARY KEY ('.implode(',', $primaryKey).')';
        $sql .= ')';

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
            $results[$line->$col_name] = new mysqlDbTable($line->$col_name, $this);
        }
        return $results;
    }
}
