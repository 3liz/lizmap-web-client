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
class mssqlDbTools extends jDbTools {

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

    protected $keywordNameCorrespondence = array(
        // sqlsrv,mysql,oci,pgsql -> date+time
        //'current_timestamp' => '',
        // mysql,oci,pgsql -> date
        'current_date' => 'DATEFROMPARTS(DATEPART(year,GETDATE()),DATEPART(month,GETDATE()),DATEPART(day,GETDATE()))',
        // mysql -> time, pgsql -> time+timezone
        'current_time' => 'TIMEFROMPARTS(DATEPART(hour,GETDATE()),DATEPART(minute,GETDATE()),DATEPART(second,GETDATE()),0,0)',
        // oci -> date+fractional secon + timezone
        'systimestamp' => 'GETDATE()',
        // oci -> date+time+tz
        'sysdate' => 'GETDATE()',
        // pgsql -> time
        'localtime' => 'TIMEFROMPARTS(DATEPART(hour,GETDATE()),DATEPART(minute,GETDATE()),DATEPART(second,GETDATE()),0,0)',
        // pgsql -> date+time
        'localtimestamp' => 'GETDATE()',
    );

    protected $functionNameCorrespondence = array(

        // sqlsrv, -> date+time
        //'sysdatetime' => '',
        // sqlsrv, -> date+time+offset
        //'sysdatetimeoffset' => '',
        // sqlsrv, -> date+time at utc
        //'sysutcdatetime' => '',
        // sqlsrv -> date+time
        //'getdate' => '',
        // sqlsrv -> date+time at utc
        //'getutcdate' => '',
        // sqlsrv,mysql (datetime)-> integer
        //'day' => '',
        // sqlsrv,mysql (datetime)-> integer
        //'month' => '',
        // sqlsrv, mysql (datetime)-> integer
        //'year' => '',
        // mysql -> date
        'curdate' => 'DATEFROMPARTS(DATEPART(year,GETDATE()),DATEPART(month,GETDATE()),DATEPART(day,GETDATE()))',
        // mysql -> date
        'current_date' => 'DATEFROMPARTS(DATEPART(year,GETDATE()),DATEPART(month,GETDATE()),DATEPART(day,GETDATE()))',
        // mysql -> time
        'curtime' => 'TIMEFROMPARTS(DATEPART(hour,GETDATE()),DATEPART(minute,GETDATE()),DATEPART(second,GETDATE()),0,0)',
        // mysql -> time
        'current_time' => 'TIMEFROMPARTS(DATEPART(hour,GETDATE()),DATEPART(minute,GETDATE()),DATEPART(second,GETDATE()),0,0)',
        // mysql,pgsql -> date+time
        'now' => 'GETDATE()',
        // mysql date+time
        'current_timestamp' => 'GETDATE()',
        // mysql (datetime)->date, sqlite (timestring, modifier)->date
        'date' => 'DATEFROMPARTS(DATEPART(year,%!p),DATEPART(month,%!p),DATEPART(day,%!p))',
        // mysql = day()
        'dayofmonth' => 'day(%!p)',
        // mysql -> date+time
        'localtime' => 'GETDATE()',
        // mysql -> date+time
        'localtimestamp' => 'GETDATE()',
        // mysql utc current date
        'utc_date' => 'DATEFROMPARTS(DATEPART(year,GETUTCDATE()),DATEPART(month,GETUTCDATE()),DATEPART(day,GETUTCDATE()))',
        // mysql utc current time
        'utc_time' => 'TIMEFROMPARTS(DATEPART(hour,GETUTCDATE()),DATEPART(minute,GETUTCDATE()),DATEPART(second,GETUTCDATE()),0,0)',
        // mysql utc current date+time
        'utc_timestamp' => 'GETUTCDATE()',
        // mysql (datetime)->time, , sqlite (timestring, modifier)->time
        'time' => 'TIMEFROMPARTS(DATEPART(hour,%!p),DATEPART(minute,%!p),DATEPART(second,%!p),0,0)',
        // mysql (datetime/time)-> hour
        'hour'=> 'DATEPART(hour,GETDATE())',
        // mysql (datetime/time)-> minute
        'minute'=> 'DATEPART(minute,GETDATE())',
        // mysql (datetime/time)-> second
        'second'=> 'DATEPART(second,GETDATE())',
        // sqlite (timestring, modifier)->datetime
        //'datetime' => '!sqliteDateTime',
        // oci, mysql (year|month|day|hour|minute|second FROM <datetime>)->value ,
        // pgsql (year|month|day|hour|minute|second <datetime>)->value
        'extract' => '!extractDateConverter',
        // pgsql ('year'|'month'|'day'|'hour'|'minute'|'second', <datetime>)->value
        'date_part' => '!extractDateConverter',
        // sqlsrv (year||month|day|hour|minute|second, <datetime>)->value
        //'datepart' => '!extractDateConverter',
    );

    protected function extractDateConverter($parametersString) {
        return 'datepart('.$parametersString.')';
    }

    /**
    * retrieve the list of fields of a table
    * @param string $tableName the name of the table
    * @param string $sequence  the sequence used to auto increment the primary key (not supported here)
    * @param string $schemaName the name of the schema (only for PostgreSQL, not supported here)
    * @return   jDbFieldProperties[]    keys are field names and values are jDbFieldProperties objects
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
