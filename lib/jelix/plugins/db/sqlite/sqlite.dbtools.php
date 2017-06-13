<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Loic Mathaud
* @contributor Laurent Jouanneau
* @copyright  2006 Loic Mathaud, 2007-2011 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * tools to manage a sqlite database
 * @package    jelix
 * @subpackage db_driver
 */
class sqliteDbTools extends jDbTools {

    protected $typesInfo = array(
      // type                  native type        unified type  minvalue     maxvalue   minlength  maxlength
      'bool'            =>array('integer',          'boolean',  0,           1,          null,     null),
      'boolean'         =>array('integer',          'boolean',  0,           1,          null,     null),
      'bit'             =>array('integer',          'integer',  0,           1,          null,     null),
      'tinyint'         =>array('integer',          'integer',  -128,        127,        null,     null),
      'smallint'        =>array('integer',          'integer',  -32768,      32767,      null,     null),
      'mediumint'       =>array('integer',          'integer',  -8388608,    8388607,    null,     null),
      'integer'         =>array('integer',          'integer',  -2147483648, 2147483647, null,     null),
      'int'             =>array('integer',          'integer',  -2147483648, 2147483647, null,     null),
      'bigint'          =>array('numeric',          'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
      'serial'          =>array('numeric',          'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
      'bigserial'       =>array('numeric',          'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
      'autoincrement'   =>array('integer',          'integer',  -2147483648, 2147483647, null,     null), // for old dao files
      'bigautoincrement'=>array('numeric',           'numeric',  '-9223372036854775808', '9223372036854775807', null, null),// for old dao files

      'float'           =>array('float',            'float',    null,       null,       null,     null), //4bytes
      'money'           =>array('real',             'float',    null,       null,       null,     null), //4bytes
      'smallmoney'      =>array('float',            'float',    null,       null,       null,     null), //4bytes
      'double precision'=>array('double',           'decimal',  null,       null,       null,     null), //8bytes
      'double'          =>array('double',           'decimal',  null,       null,       null,     null), //8bytes
      'real'            =>array('real',             'decimal',  null,       null,       null,     null), //8bytes
      'number'          =>array('real',             'decimal',  null,       null,       null,     null), //8bytes
      'binary_float'    =>array('double',           'float',    null,       null,       null,     null), //4bytes
      'binary_double'   =>array('double',           'decimal',  null,       null,       null,     null), //8bytes
      
      'numeric'         =>array('numeric',          'numeric',  null,       null,       null,     null),
      'decimal'         =>array('real',             'decimal',  null,       null,       null,     null),
      'dec'             =>array('real',             'decimal',  null,       null,       null,     null),

      'date'            =>array('date',       'date',       null,       null,       10,    10),
      'time'            =>array('time',       'time',       null,       null,       8,     8),
      'datetime'        =>array('datetime',   'datetime',   null,       null,       19,    19),
      'datetime2'       =>array('datetime',   'datetime',   null,       null,       19,    27), // sqlsrv / 9999-12-31 23:59:59.9999999
      'datetimeoffset'  =>array('datetime',   'datetime',   null,       null,       19,    34), // sqlsrv / 9999-12-31 23:59:59.9999999 +14:00
      'smalldatetime'   =>array('datetime',   'datetime',   null,       null,       19,    19), // sqlsrv / 2079-06-06 23:59
      'timestamp'       =>array('datetime',   'datetime',   null,       null,       19,    19), // oracle/pgsql timestamp
      'utimestamp'      =>array('integer',    'integer',    0,          2147483647, null,  null), // mysql timestamp
      'year'            =>array('integer',    'year',       null,       null,       2,     4),
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

      'tinytext'        =>array('text',   'text',       null,       null,       0,     255),
      'text'            =>array('text',   'text',       null,       null,       0,     65535),
      'ntext'           =>array('text',   'text',       null,       null,       0,     0),
      'mediumtext'      =>array('text',   'text',       null,       null,       0,     16777215),
      'longtext'        =>array('text',   'text',       null,       null,       0,     0),
      'long'            =>array('text',   'text',       null,       null,       0,     0),
      'clob'            =>array('text',   'text',       null,       null,       0,     0),
      'nclob'           =>array('text',   'text',       null,       null,       0,     0),


      'tinyblob'        =>array('blob',   'blob',       null,       null,       0,     255),
      'blob'            =>array('blob',       'blob',       null,       null,       0,     65535),
      'mediumblob'      =>array('blob', 'blob',       null,       null,       0,     16777215),
      'longblob'        =>array('blob',   'blob',       null,       null,       0,     0),
      'bfile'           =>array('blob',   'blob',       null,       null,       0,     0),
      
      'bytea'           =>array('blob',   'varbinary',       null,       null,       0,     0),
      'binary'          =>array('blob',     'binary',     null,       null,       0,     255),
      'varbinary'       =>array('blob',  'varbinary',  null,       null,       0,     255),
      'raw'             =>array('blob',  'varbinary',  null,       null,       0,     2000),
      'long raw'        =>array('blob',  'varbinary',  null,       null,       0,     0),
      'image'           =>array('blob',  'varbinary',   null,       null,       0,     0),

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
    public function getTableList (){
        $results = array ();

        $rs = $this->_conn->query('SELECT name FROM sqlite_master WHERE type="table"');

        while ($line = $rs->fetch ()){
            $results[] = $line->name;
        }

        return $results;
    }

    /**
    * retrieve the list of fields of a table
    * @param string $tableName the name of the table
    * @param string $sequence  the sequence used to auto increment the primary key (not supported here)
    * @param string $schemaName the name of the schema (only for PostgreSQL, not supported here)
    * @return   array    keys are field names and values are jDbFieldProperties objects
    */
    public function getFieldList ($tableName, $sequence='', $schemaName='') {

        $tableName = $this->_conn->prefixTable($tableName);
        $results = array ();

        $query = "PRAGMA table_info(". sqlite_escape_string($tableName) .")";
        $rs = $this->_conn->query($query);
        while ($line = $rs->fetch()) {
            $field = new jDbFieldProperties();
            $field->name = $line->name;
            $field->primary  = ($line->pk == 1);
            $field->notNull   = ($line->notnull == '99' || $line->pk == 1);

            if (preg_match('/^(\w+)\s*(\((\d+)\))?.*$/',$line->type,$m)) {
                $field->type = strtolower($m[1]);
                if (isset($m[3])) {
                    $field->length = intval($m[3]);
                }
            }
            else {
                $field->type = $line->type;
            }

            $typeinfo = $this->getTypeInfo($field->type);
            $field->unifiedType = $typeinfo[1];
            $field->maxValue = $typeinfo[3];
            $field->minValue = $typeinfo[2];
            $field->maxLength = $typeinfo[5];
            $field->minLength = $typeinfo[4];

            if ($field->length !=0)
                $field->maxLength = $field->length;

            if ($field->type == 'integer' && $field->primary) {
                $field->autoIncrement = true;
            }
            if (!$field->primary) {
                if ($line->dflt_value !== null || ($line->dflt_value === null && !$field->notNull)) {
                    $field->hasDefault = true;
                    $field->default =  $line->dflt_value;
                }
            }
            $results[$line->name] = $field;
        }
        return $results;
    }
}

