<?php
/**
 * @package    jelix
 * @subpackage db_driver
 * @author     Yann Lecommandoux
 * @contributor Julien, Laurent Jouanneau
 * @copyright  2008 Yann Lecommandoux, 2010 Julien, 2017 Laurent Jouanneau
 * @link      http://jelix.org
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

/**
 * @experimental
 */
class sqlsrvDbTools extends jDbTools {

    protected $dbmsStyle = array('/^\s*(#|\-\- )/', '/;\s*$/');

    protected $typesInfo = array(
        // type                  native type        unified type  minvalue     maxvalue   minlength  maxlength
        'bool'            =>array('tinyint',          'boolean',  0,           1,          null,     null),
        'boolean'         =>array('tinyint',          'boolean',  0,           1,          null,     null),
        'bit'             =>array('bit',              'integer',  0,           1,          null,     null),
        'tinyint'         =>array('tinyint',          'integer',  0,        255,        null,     null),
        'smallint'        =>array('smallint',         'integer',  -32768,      32767,      null,     null),
        'mediumint'       =>array('int',              'integer',  -8388608,    8388607,    null,     null),
        'integer'         =>array('int',              'integer',  -2147483648, 2147483647, null,     null),
        'int'             =>array('int',              'integer',  -2147483648, 2147483647, null,     null),
        'bigint'          =>array('bigint',           'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
        'serial'          =>array('int',              'integer',  -2147483648, 2147483647, null, null),
        'bigserial'       =>array('bigint',           'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
        'autoincrement'   =>array('int',              'integer',  -2147483648, 2147483647, null,     null), // for old dao files
        'bigautoincrement'=>array('bigint',           'numeric',  '-9223372036854775808', '9223372036854775807', null, null),// for old dao files

        'float'           =>array('float',          'float',    null,       null,       null,     null), //4bytes
        'money'           =>array('money',          'float',    null,       null,       null,     null), //8bytes
        'smallmoney'      =>array('smallmoney',     'float',    null,       null,       null,     null), //4bytes
        'double precision'=>array('real',           'float',  null,       null,       null,     null), //8bytes
        'double'          =>array('real',           'float',  null,       null,       null,     null), //8bytes
        'real'            =>array('real',           'float',    null,       null,       null,     null), //8bytes
        'number'          =>array('real',           'decimal',  null,       null,       null,     null), //8bytes
        'binary_float'    =>array('real',            'float',    null,       null,       null,     null), //4bytes
        'binary_double'   =>array('real',           'decimal',  null,       null,       null,     null), //8bytes

        'numeric'         =>array('numeric',          'decimal',  null,       null,       null,     null),
        'decimal'         =>array('decimal',          'decimal',  null,       null,       null,     null),
        'dec'             =>array('decimal',          'decimal',  null,       null,       null,     null),

        'date'            =>array('date',           'date',       null,       null,       10,    10),
        'time'            =>array('time',           'time',       null,       null,       8,     16), //23:59:59.9999999
        'datetime'        =>array('datetime',       'datetime',   null,       null,       19,    23), // 9999-12-31 23:59:59.997
        'datetime2'       =>array('datetime2',      'datetime',   null,       null,       19,    27), // 9999-12-31 23:59:59.9999999
        'datetimeoffset'  =>array('datetimeoffset',   'datetime',   null,       null,       19,    34), // 9999-12-31 23:59:59.9999999 +14:00
        'smalldatetime'   =>array('smalldatetime',   'datetime',   null,       null,       19,    19), // 2079-06-06 23:59
        'timestamp'       =>array('datetime',   'datetime',   null,       null,       19,    19), // oracle/pgsql timestamp
        'utimestamp'      =>array('integer',    'integer',    0,          2147483647, null,  null), // mysql timestamp
        'year'            =>array('integer',    'year',       null,       null,       2,     4),
        'interval'        =>array('datetime',   'datetime',   null,       null,       19,    19),


        'char'             =>array('char',      'char',       null,       null,       0,     0),
        'nchar'            =>array('nchar',     'char',       null,       null,       0,     0),
        'varchar'          =>array('varchar',   'varchar',    null,       null,       0,     0),
        'varchar2'         =>array('varchar',   'varchar',    null,       null,       0,     0),
        'nvarchar'         =>array('nvarchar',  'varchar',    null,       null,       0,     0),
        'nvarchar2'        =>array('nvarchar',  'varchar',    null,       null,       0,     0),
        'character'        =>array('varchar',   'varchar',    null,       null,       0,     0),
        'character varying'=>array('varchar',   'varchar',    null,       null,       0,     0),
        'name'             =>array('varchar',   'varchar',    null,       null,       0,     64),
        'longvarchar'      =>array('varchar',   'varchar',    null,       null,       0,     0),
        'string'           =>array('varchar',   'varchar',    null,       null,       0,     0),// for old dao files

        'tinytext'        =>array('text',   'text',       null,       null,       0,     255),
        'text'            =>array('text',   'text',       null,       null,       0,     0),
        'ntext'           =>array('ntext',  'text',       null,       null,       0,     0),
        'mediumtext'      =>array('text',   'text',       null,       null,       0,     0),
        'longtext'        =>array('text',   'text',       null,       null,       0,     0),
        'long'            =>array('text',   'text',       null,       null,       0,     0),
        'clob'            =>array('text',   'text',       null,       null,       0,     0),
        'nclob'           =>array('text',   'text',       null,       null,       0,     0),

        'tinyblob'        =>array('varbinary',   'blob',       null,       null,       0,     255),
        'blob'            =>array('varbinary',   'blob',       null,       null,       0,     65535),
        'mediumblob'      =>array('varbinary',   'blob',       null,       null,       0,     16777215),
        'longblob'        =>array('varbinary',   'blob',       null,       null,       0,     0),
        'bfile'           =>array('varbinary',   'blob',       null,       null,       0,     0),

        'bytea'           =>array('varbinary',  'varbinary',   null,       null,       0,     0),
        'binary'          =>array('binary',     'binary',      null,       null,       0,     8000),
        'varbinary'       =>array('varbinary',  'varbinary',   null,       null,       0,     8000),
        'raw'             =>array('varbinary',  'varbinary',   null,       null,       0,     2000),
        'long raw'        =>array('varbinary',  'varbinary',   null,       null,       0,     0),
        'image'           =>array('image',      'varbinary',   null,       null,       0,     0),

        'enum'            =>array('varchar',    'varchar',    null,       null,       0,     65535),
        'set'             =>array('varchar',    'varchar',    null,       null,       0,     65535),
        'xmltype'         =>array('varchar',    'varchar',    null,       null,       0,     65535),
        'xml'             =>array('xml',        'text',       null,       null,       0,     0),

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
     * 	List of tables
     * @return   array    $tab[] = $nomDeTable
     */
    function getTableList (){
        $results = array ();
        $sql = "SELECT TABLE_NAME FROM " .$this->_conn->profile['database']. ".INFORMATION_SCHEMA.TABLES
                WHERE TABLE_NAME NOT LIKE ('sys%') AND TABLE_NAME NOT LIKE ('dt%')";
        $rs = $this->_conn->query ($sql);
        while ($line = $rs->fetch ()){
            $results[] = $line->TABLE_NAME;
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

        $results = array ();

        $pkeys = array();
        // get primary keys informations
        $rs = $this->_conn->query('EXEC sp_pkeys ' . $tableName);
        while ($line = $rs->fetch()){
            $pkeys[] = $line->COLUMN_NAME;
        }
        // get table informations
        unset($line);
        $rs = $this->_conn->query ('EXEC sp_columns ' . $tableName);
        while ($line = $rs->fetch ()){
            $field = new jDbFieldProperties();
            $field->name = $line->COLUMN_NAME;
            $field->type = $line->TYPE_NAME;
            $field->length = $line->LENGTH;
            if ($field->type == 'int identity'){
                $field->type = 'int';
                $field->autoIncrement = true;
            }
            if ($field->type == 'bit'){
                $field->type = 'int';
            }
            if ($line->IS_NULLABLE == 'No'){
                $field->notNull = false;
            }
            $field->hasDefault = false;
            $field->default = '';
            if(in_array($field->name, $pkeys)){
                $field->primary = true;
            }
            $results[$line->COLUMN_NAME] = $field;
        }
        return $results;
    }
}
