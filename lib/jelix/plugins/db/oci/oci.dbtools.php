<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Gwendal Jouannic
* @contributor Laurent Jouanneau
* @copyright  2008 Gwendal Jouannic, 2009-2011 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


class ociDbTools extends jDbTools {

    protected $typesInfo = array(
      // type                  native type        unified type  minvalue     maxvalue   minlength  maxlength
      'bool'            =>array('number',          'boolean',  0,           1,          null,     null),
      'boolean'         =>array('boolean',          'boolean',  0,           1,          null,     null),
      'bit'             =>array('bit',              'integer',  0,           1,          null,     null),
      'tinyint'         =>array('tinyint',          'integer',  -128,        127,        null,     null),
      'smallint'        =>array('smallint',         'integer',  -32768,      32767,      null,     null),
      'mediumint'       =>array('mediumint',        'integer',  -8388608,    8388607,    null,     null),
      'integer'         =>array('integer',          'integer',  -2147483648, 2147483647, null,     null),
      'int'             =>array('integer',          'integer',  -2147483648, 2147483647, null,     null),
      'bigint'          =>array('bigint',           'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
      'serial'          =>array('integer',          'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
      'bigserial'       =>array('integer',          'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
      'autoincrement'   =>array('integer',          'integer',  -2147483648, 2147483647, null,     null), // for old dao files
      'bigautoincrement'=>array('bigint',           'numeric',  '-9223372036854775808', '9223372036854775807', null, null),// for old dao files

      'float'           =>array('float',            'float',    null,       null,       null,     null), //4bytes
      'money'           =>array('float',            'float',    null,       null,       null,     null), //4bytes
      'smallmoney'      =>array('float',            'float',    null,       null,       null,     null), //4bytes
      'double precision'=>array('double precision', 'decimal',  null,       null,       null,     null), //8bytes
      'double'          =>array('double precision', 'decimal',  null,       null,       null,     null), //8bytes
      'real'            =>array('real',             'decimal',  null,       null,       null,     null), //8bytes
      'number'          =>array('real',             'decimal',  null,       null,       null,     null), //8bytes
      'binary_float'    =>array('float',            'float',    null,       null,       null,     null), //4bytes
      'binary_double'   =>array('real',             'decimal',  null,       null,       null,     null), //8bytes
      
      'numeric'         =>array('numeric',          'numeric',  null,       null,       null,     null),
      'decimal'         =>array('decimal',          'decimal',  null,       null,       null,     null),
      'dec'             =>array('decimal',          'decimal',  null,       null,       null,     null),

      'date'            =>array('date',       'date',       null,       null,       10,    10),
      'time'            =>array('time',       'time',       null,       null,       8,     8),
      'datetime'        =>array('datetime',   'datetime',   null,       null,       19,    19),
      'datetime2'       =>array('datetime',   'datetime',   null,       null,       19,    27), // sqlsrv / 9999-12-31 23:59:59.9999999
      'datetimeoffset'  =>array('datetime',   'datetime',   null,       null,       19,    34), // sqlsrv / 9999-12-31 23:59:59.9999999 +14:00
      'smalldatetime'   =>array('datetime',   'datetime',   null,       null,       19,    19), // sqlsrv / 2079-06-06 23:59
      'timestamp'       =>array('datetime',   'datetime',   null,       null,       19,    19), // oracle/pgsql timestamp
      'utimestamp'      =>array('timestamp',  'integer',    0,          2147483647, null,  null), // mysql timestamp
      'year'            =>array('year',       'year',       null,       null,       2,     4),
      'interval'        =>array('datetime',   'datetime',   null,       null,       19,    19),

      'char'            =>array('char',       'char',       null,       null,       0,     255),
      'nchar'           =>array('char',       'char',       null,       null,       0,     255),
      'varchar'         =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'varchar2'        =>array('varchar',    'varchar',    null,       null,       0,     4000),
      'nvarchar2'       =>array('varchar',    'varchar',    null,       null,       0,     4000),
      'character'       =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'character varying'=>array('varchar',   'varchar',    null,       null,       0,     65535),
      'name'            =>array('varchar',    'varchar',    null,       null,       0,     64),
      'longvarchar'     =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'string'          =>array('varchar',    'varchar',    null,       null,       0,     65535),// for old dao files

      'tinytext'        =>array('tinytext',   'text',       null,       null,       0,     255),
      'text'            =>array('text',       'text',       null,       null,       0,     65535),
      'ntext'           =>array('text',       'text',       null,       null,       0,     0),
      'mediumtext'      =>array('mediumtext', 'text',       null,       null,       0,     16777215),
      'longtext'        =>array('longtext',   'text',       null,       null,       0,     0),
      'long'            =>array('longtext',   'text',       null,       null,       0,     0),
      'clob'            =>array('longtext',   'text',       null,       null,       0,     0),
      'nclob'           =>array('longtext',   'text',       null,       null,       0,     0),


      'tinyblob'        =>array('tinyblob',   'blob',       null,       null,       0,     255),
      'blob'            =>array('blob',       'blob',       null,       null,       0,     65535),
      'mediumblob'      =>array('mediumblob', 'blob',       null,       null,       0,     16777215),
      'longblob'        =>array('longblob',   'blob',       null,       null,       0,     0),
      'bfile'           =>array('longblob',   'blob',       null,       null,       0,     0),
      
      'bytea'           =>array('longblob',   'varbinary',  null,       null,       0,     0),
      'binary'          =>array('binary',     'binary',     null,       null,       0,     255),
      'varbinary'       =>array('varbinary',  'varbinary',  null,       null,       0,     255),
      'raw'             =>array('varbinary',  'varbinary',  null,       null,       0,     2000),
      'long raw'        =>array('varbinary',  'varbinary',  null,       null,       0,     0),
      'image'           =>array('varbinary',  'varbinary',   null,       null,       0,     0),

      'enum'            =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'set'             =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'xmltype'         =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'xml'             =>array('text',       'text',       null,       null,       0,     0),

      'point'           =>array('varchar',    'varchar',    null,       null,       0,     16),
      'line'            =>array('varchar',    'varchar',    null,       null,       0,     32),
      'lsed'            =>array('varchar',    'varchar',    null,       null,       0,     32),
      'box'             =>array('varchar',    'varchar',    null,       null,       0,     32),
      'path'            =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'polygon'         =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'circle'          =>array('varchar',    'varchar',    null,       null,       0,     24),
      'cidr'            =>array('varchar',    'varchar',    null,       null,       0,     24),
      'inet'            =>array('varchar',    'varchar',    null,       null,       0,     24),
      'macaddr'         =>array('integer',    'integer',    0,          0xFFFFFFFFFFFF, null,       null),
      'bit varying'     =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'arrays'          =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'complex types'   =>array('varchar',    'varchar',    null,       null,       0,     65535),
    );

    /**
    * returns the list of tables 
    * @return   array    list of table names
    */
    public function getTableList () {
        $results = array ();

        $rs = $this->_conn->query ('SELECT TABLE_NAME FROM USER_TABLES');

        while ($line = $rs->fetch ()){
            $results[] = $line->table_name;
        }

        return $results;
    }

    /**
    * retrieve the list of fields of a table
    * @param string $tableName the name of the table
    * @param string $sequence  the sequence used to auto increment the primary key
    * @param string $schemaName the name of the schema (only for PostgreSQL, not supported here)
    * @return   array    keys are field names and values are jDbFieldProperties objects
    */
    public function getFieldList ($tableName, $sequence='', $schemaName='') {
        $tableName = $this->_conn->prefixTable($tableName);
        $results = array ();

        $query = 'SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE, DATA_DEFAULT,  
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
                    WHERE UTC.TABLE_NAME = \''.strtoupper($tableName).'\'';

        $rs = $this->_conn->query ($query);

        while ($line = $rs->fetch ()){

            $field = new jDbFieldProperties();

            $field->name = strtolower($line->column_name);
            $field->type = strtolower($line->data_type);

            $typeinfo = $this->getTypeInfo($field->type);
            $field->unifiedType = $typeinfo[1];
            $field->maxValue = $typeinfo[3];
            $field->minValue = $typeinfo[2];
            $field->maxLength = $typeinfo[5];
            $field->minLength = $typeinfo[4];

            if ($field->type == 'varchar2' || $field->type == 'varchar' ){
                $field->length = intval($line->data_length);
                $field->maxLength = $field->length;
            }

            $field->notNull = ($line->nullable == 'N');
            $field->primary = ($line->constraint_type == 'P');

            if(isset($line->column_comment) && !empty($line->column_comment)) {
                $field->comment = $line->column_comment;
            }

            // FIXME, retrieve autoincrement property for other field than primary key
            if ($field->primary) {
                if ($sequence == '')
                    $sequence = $this->_getAISequenceName($tableName, $field->name);
                if ($sequence != '') {
                    $sqlai = "SELECT 'Y' FROM USER_SEQUENCES US
                                WHERE US.SEQUENCE_NAME = '".$sequence."'";
                    $rsai = $this->_conn->query ($sqlai);
                    if ($rsai->fetch()){
                        $field->autoIncrement  = true;
                        $field->sequence = $sequence;
                    }
                }
            }

            if ($line->data_default !== null || !($line->data_default === null && $field->notNull)){
                $field->hasDefault = true;
                $field->default =  $line->data_default;
            }

            $results[$field->name] = $field;
        }
        return $results;
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
}
