<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Laurent Jouanneau
* @contributor Laurent Jouanneau
* @contributor Nicolas Jeudy (patch ticket #99)
* @copyright  2005-2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package    jelix
 * @subpackage db_driver
 */
class pgsqlDbTools extends jDbTools {

    public $trueValue = 'TRUE';
    
    public $falseValue = 'FALSE';

    protected $typesInfo = array(
      // type                  native type        unified type  minvalue     maxvalue   minlength  maxlength
      'bool'            =>array('boolean',          'boolean',  0,           1,          null,     null),
      'boolean'         =>array('boolean',          'boolean',  0,           1,          null,     null),
      'bit'             =>array('smallint',         'integer',  0,           1,          null,     null),
      'tinyint'         =>array('smallint',         'integer',  -128,        127,        null,     null),
      'smallint'        =>array('smallint',         'integer',  -32768,      32767,      null,     null),
      'mediumint'       =>array('integer',          'integer',  -8388608,    8388607,    null,     null),
      'integer'         =>array('integer',          'integer',  -2147483648, 2147483647, null,     null),
      'int'             =>array('integer',          'integer',  -2147483648, 2147483647, null,     null),
      'bigint'          =>array('bigint',           'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
      'serial'          =>array('serial',           'integer',  -2147483648, 2147483647, null, null),
      'bigserial'       =>array('bigserial',        'numeric',  '-9223372036854775808', '9223372036854775807', null, null),
      'autoincrement'   =>array('serial',           'integer',  -2147483648, 2147483647, null,     null), // for old dao files
      'bigautoincrement'=>array('bigserial',        'numeric',  '-9223372036854775808', '9223372036854775807', null, null),// for old dao files

      'float'           =>array('real',             'float',    null,       null,       null,     null), //4bytes
      'money'           =>array('money',            'float',    null,       null,       null,     null), //4bytes
      'smallmoney'      =>array('money',            'float',    null,       null,       null,     null),
      'double precision'=>array('double precision', 'decimal',  null,       null,       null,     null), //8bytes
      'double'          =>array('double precision', 'decimal',  null,       null,       null,     null), //8bytes
      'real'            =>array('real',             'float',    null,       null,       null,     null), //8bytes
      'number'          =>array('double',           'decimal',  null,       null,       null,     null), //8bytes
      'binary_float'    =>array('real',             'float',    null,       null,       null,     null), //4bytes
      'binary_double'   =>array('double',           'decimal',  null,       null,       null,     null), //8bytes
      
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
      'interval'        =>array('interval',   'integer',    null,       null,       19,    19),

      'char'            =>array('char',       'char',       null,       null,       0,     255),
      'nchar'           =>array('nchar',       'char',       null,       null,       0,     255),
      'varchar'         =>array('varchar',    'varchar',    null,       null,       0,     0),
      'varchar2'        =>array('varchar',    'varchar',    null,       null,       0,     0),
      'nvarchar2'       =>array('nvarchar',    'varchar',    null,       null,       0,     0),
      'character'       =>array('character',    'varchar',    null,       null,       0,     0),
      'character varying'=>array('character varying',   'varchar',    null,       null,       0,     0),
      'name'            =>array('name',    'varchar',    null,       null,       0,     64),
      'longvarchar'     =>array('varchar',    'varchar',    null,       null,       0,     0),
      'string'          =>array('varchar',    'varchar',    null,       null,       0,     0),// for old dao files

      'tinytext'        =>array('text',   'text',       null,       null,       0,     255),
      'text'            =>array('text',   'text',       null,       null,       0,     0),
      'ntext'           =>array('text',   'text',       null,       null,       0,     0),
      'mediumtext'      =>array('text',   'text',       null,       null,       0,     0),
      'longtext'        =>array('text',   'text',       null,       null,       0,     0),
      'long'            =>array('text',   'text',       null,       null,       0,     0),
      'clob'            =>array('text',   'text',       null,       null,       0,     0),
      'nclob'           =>array('text',   'text',       null,       null,       0,     0),


      'tinyblob'        =>array('bytea',   'blob',       null,       null,       0,     255),
      'blob'            =>array('bytea',   'blob',       null,       null,       0,     65535),
      'mediumblob'      =>array('bytea',   'blob',       null,       null,       0,     16777215),
      'longblob'        =>array('bytea',   'blob',       null,       null,       0,     0),
      'bfile'           =>array('bytea',   'blob',       null,       null,       0,     0),
      
      'bytea'           =>array('bytea',  'varbinary',   null,       null,       0,     0),
      'binary'          =>array('bytea',  'binary',      null,       null,       0,     255),
      'varbinary'       =>array('bytea',  'varbinary',   null,       null,       0,     255),
      'raw'             =>array('bytea',  'varbinary',   null,       null,       0,     2000),
      'long raw'        =>array('bytea',  'varbinary',   null,       null,       0,     0),
      'image'           =>array('bytea',  'varbinary',   null,       null,       0,     0),

      'enum'            =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'set'             =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'xmltype'         =>array('varchar',    'varchar',    null,       null,       0,     65535),
      'xml'             =>array('text',       'text',       null,       null,       0,     0),

      'point'           =>array('point',    'varchar',    null,       null,       0,     16),
      'line'            =>array('line',     'varchar',    null,       null,       0,     32),
      'lsed'            =>array('lsed',     'varchar',    null,       null,       0,     32),
      'box'             =>array('box',      'varchar',    null,       null,       0,     32),
      'path'            =>array('path',     'varchar',    null,       null,       0,     65535),
      'polygon'         =>array('polygon',  'varchar',    null,       null,       0,     65535),
      'circle'          =>array('circle',   'varchar',    null,       null,       0,     24),
      'cidr'            =>array('cidr',     'varchar',    null,       null,       0,     24),
      'inet'            =>array('inet',     'varchar',    null,       null,       0,     24),
      'macaddr'         =>array('macaddr',    'integer',    0,          0xFFFFFFFFFFFF, null,       null),
      'bit varying'     =>array('bit varying', 'varchar', null,       null,       0,     65535),
      'arrays'          =>array('array',    'varchar',    null,       null,       0,     65535),
      'complex types'   =>array('complex',  'varchar',    null,       null,       0,     65535),
    );

    public function encloseName($name){
        return '"'.$name.'"';
    }

   /*
    * returns the list of tables 
    * @return   array    list of table names
   */
   public function getTableList () {
      $results = array ();
      $sql = "SELECT tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY tablename";
      $rs = $this->_conn->query ($sql);
      while ($line = $rs->fetch()){
         $results[] = $line->tablename;
      }
      return $results;
   }

    /**
     * retrieve the list of fields of a table
     * @param string $tableName the name of the table
     * @param string $sequence the sequence used to auto increment the primary key
     * @param string $schemaName the name of the schema
     * @return array keys are field names and values are jDbFieldProperties objects
     * @throws Exception
     */
    public function getFieldList ($tableName, $sequence='', $schemaName='') {
        $tableName = $this->_conn->prefixTable($tableName);

        // get table informations
        $sql =' SELECT pg_class.oid, pg_class.relhaspkey, pg_class.relhasindex';
        $sql.=' FROM pg_class';
        if(!empty($schemaName)){
            $sql.= ' JOIN pg_catalog.pg_namespace n ON n.oid = pg_class.relnamespace';
        }
        $sql.=' WHERE relname = \''.$tableName.'\'';
        if(!empty($schemaName)){
            $sql.= ' AND n.nspname = \''.$schemaName.'\'';
        }

        $rs = $this->_conn->query ($sql);
        if (! ($table = $rs->fetch())) {
            throw new Exception('dbtools, pgsql: unknown table');
        }

        $pkeys = array();
        // get primary keys informations
        if ($table->relhaspkey == 't') {
            $sql = 'SELECT indkey FROM pg_index WHERE indrelid = '.$table->oid.' and indisprimary = true';
            $rs = $this->_conn->query ($sql);
            $pkeys = preg_split("/[\s]+/", $rs->fetch()->indkey);
        }

        // get field informations
        $sql_get_fields = "SELECT t.typname, a.attname, a.attnotnull, a.attnum, a.attlen, a.atttypmod,
        a.atthasdef, d.adsrc
        FROM pg_type t, pg_attribute a LEFT JOIN pg_attrdef d ON (d.adrelid=a.attrelid AND d.adnum=a.attnum)
        WHERE
          a.attnum > 0 AND a.attrelid = ".$table->oid." AND a.atttypid = t.oid
        ORDER BY a.attnum";

        $toReturn=array();
        $rs = $this->_conn->query ($sql_get_fields);
        while ($line = $rs->fetch ()){
            $field = new jDbFieldProperties();
            $field->name = $line->attname;
            $field->type = preg_replace('/(\D*)\d*/','\\1',$line->typname);
            $field->notNull = ($line->attnotnull=='t');
            $field->hasDefault = ($line->atthasdef == 't');
            $field->default = $line->adsrc;

            $typeinfo = $this->getTypeInfo($field->type);
            $field->unifiedType = $typeinfo[1];
            $field->maxValue = $typeinfo[3];
            $field->minValue = $typeinfo[2];
            $field->maxLength = $typeinfo[5];
            $field->minLength = $typeinfo[4];

            if(preg_match('/^nextval\(.*\)$/', $line->adsrc) || $typeinfo[6]){
                $field->autoIncrement=true;
                $field->default = '';
            }

            if(in_array($line->attnum, $pkeys))
                $field->primary = true;

            if($field->autoIncrement && $sequence && $field->primary)
                $field->sequence = $sequence;

            if($line->attlen == -1 && $line->atttypmod != -1) {
                $field->length = $line->atttypmod - 4;
                $field->maxLength = $field->length;
            }

            $toReturn[$line->attname]=$field;
        }

        return $toReturn;
    }

    public function execSQLScript ($file) {
        if(!isset($this->_conn->profile['table_prefix']))
            $prefix = '';
        else
            $prefix = $this->_conn->profile['table_prefix'];
        $sqlQueries = str_replace('%%PREFIX%%', $prefix, file_get_contents($file));
        $this->_conn->query ($sqlQueries);
    }
}

