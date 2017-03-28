<?php
/**
* @package     jelix
* @subpackage  db
* @author      Laurent Jouanneau, Gerald Croes
* @contributor Julien Issler
* @copyright   2005-2012 Laurent Jouanneau
* @copyright   2007-2009 Julien Issler
* @copyright 2001-2005 CopixTeam
* This class was get originally from the Copix project (CopixDbConnection, Copix 2.3dev20050901, http://www.copix.org)
* However only few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix classes are Gerald Croes and Laurent Jouanneau,
*
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * @package  jelix
 * @subpackage db
 */
abstract class jDbConnection {

    const FETCH_OBJ = 5;
    const FETCH_CLASS = 8;
    const FETCH_INTO = 9;
    const ATTR_AUTOCOMMIT = 0;
    const ATTR_PREFETCH = 1;
    const ATTR_TIMEOUT = 2;
    const ATTR_ERRMODE = 3;
    const ATTR_SERVER_VERSION = 4;
    const ATTR_SERVER_INFO = 6;
    const ATTR_CLIENT_VERSION = 5;
    const ATTR_CONNECTION_STATUS = 7;
    const ATTR_CASE = 8;
    const ATTR_CURSOR = 10;
    const ATTR_ORACLE_NULLS = 11;
    const ATTR_PERSISTENT = 12;
    const ATTR_DRIVER_NAME = 16;
    const CURSOR_FWDONLY = 0;
    const CURSOR_SCROLL = 1;

    /**
    * profile properties used by the connector
    * @var array
    */
    public $profile;

    /**
     * The database type name (mysql, pgsql ...)
     * It is not the driver name. Several drivers could connect to the same database
     * type. This type name is often used to know whish SQL language we should use.
     * @var string
     */
    public $dbms;

    /**
     * driver name
     * @var string
     */
    public $driverName = '';

    /**
    * The last error message if any
    * @var string
    */
    public $msgError = '';

    /**
     * last executed query
     */
    public $lastQuery;

    /**
    * Are we using an automatic commit ?
    * @var boolean
    */
    private $_autocommit = true;

    /**
    * the internal connection.
     * @var mixed
    */
    protected $_connection = null;

    protected $_debugMode = false;
    /**
    * do a connection to the database, using properties of the given profile
    * @param array $profile  profile properties
    */
    function __construct($profile) {
        $this->profile = & $profile;
        $this->dbms = $this->driverName = $profile['driver'];
        $this->_connection = $this->_connect();
        $this->_debugMode = true;
    }

    function __destruct() {
        if ($this->_connection !== null) {
            $this->_disconnect ();
        }
    }


    function disconnect() {
        if ($this->_connection !== null) {
            $this->_disconnect ();
        }
    }

    /**
    * Launch a SQL Query which returns rows (typically, a SELECT statement)
    * @param string   $queryString   the SQL query
    * @param integer  $fetchmode   FETCH_OBJ, FETCH_CLASS or FETCH_INTO
    * @param string|object   $param   class name if FETCH_CLASS, an object if FETCH_INTO. else null.
    * @param array  $ctoargs  arguments for the constructor if FETCH_CLASS
    * @return  jDbResultSet|boolean  False if the query has failed.
    */
    public function query ($queryString, $fetchmode = self::FETCH_OBJ, $arg1 = null, $ctoargs = null) {
        $this->lastQuery = $queryString;
        if ($this->_debugMode) {
            $log = new jSQLLogMessage($queryString);
            $result = $this->_doQuery ($queryString);
            $log->endQuery();
            jLog::log($log,'sql');
        }
        else {
            $result = $this->_doQuery ($queryString);
        }
        if ($fetchmode != self::FETCH_OBJ) {
            $result->setFetchMode($fetchmode, $arg1, $ctoargs);
        }
        return $result;
    }

    /**
    * Launch a SQL Query with limit parameter, so it returns only a subset of a result
    * @param   string   $queryString   the SQL query
    * @param   integer  $limitOffset   the offset of the first row to return
    * @param   integer  $limitCount    the maximum of number of rows to return
    * @return  jDbResultSet|boolean  SQL Select. False if the query has failed.
    */
    public function limitQuery ($queryString, $limitOffset, $limitCount){
        $this->lastQuery = $queryString;
        if ($this->_debugMode) {
            $log = new jSQLLogMessage($queryString);
            $result = $this->_doLimitQuery ($queryString, intval($limitOffset), intval($limitCount));
            $log->endQuery();
            $log->setRealQuery($this->lastQuery);
            jLog::log($log,'sql');
            return $result;
        }
        else {
            return $this->_doLimitQuery ($queryString, intval($limitOffset), intval($limitCount));
        }
    }

    /**
    * Launch a SQL Query (update, delete..) which doesn't return rows
    * @param   string   $query   the SQL query
    * @return  integer  the number of affected rows. False if the query has failed.
    */
    public function exec ($query) {
        $this->lastQuery = $query;
        if ($this->_debugMode) {
            $log = new jSQLLogMessage($query);
            $result = $this->_doExec ($query);
            $log->endQuery();
            jLog::log($log,'sql');
            return $result;
        }
        else {
            return $this->_doExec ($query);
        }
    }

    /**
    * Escape and quotes strings.
    * @param string $text   string to quote
    * @param int $parameter_type unused, just for compatibility with PDO
    * @return string escaped string
    */
    public function quote ($text, $parameter_type = 0) {
        // for compatibility with older jelix version
        if ($parameter_type === false || $parameter_type === true)
            trigger_error("signature of jDbConnection::quote has changed, you should use quote2()", E_USER_WARNING);
        return "'".$this->_quote($text, false)."'";
    }

    /**
    * Escape and quotes strings. if null, will only return the text "NULL"
    * @param string $text   string to quote
    * @param boolean $checknull if true, check if $text is a null value, and then return NULL
    * @param boolean $binary  set to true if $text contains a binary string
    * @return string escaped string
    * @since 1.2
    */
    public function quote2 ($text, $checknull=true, $binary=false) {
        if ($checknull)
            return (is_null ($text) ? 'NULL' : "'".$this->_quote($text, $binary)."'");
        else
            return "'".$this->_quote($text, $binary)."'";
    }

    /**
     * enclose the field name
     * @param string $fieldName the field name
     * @return string the enclosed field name
     * @since 1.1.1
     */
    public function encloseName ($fieldName) {
        return $fieldName;
    }

    /**
      * Prefix the given table with the prefix specified in the connection's profile
      * If there's no prefix for the connection's profile, return the table's name unchanged.
      *
      * @param string $table the table's name
      * @return string the prefixed table's name
      * @author Julien Issler
      * @since 1.0
      */
    public function prefixTable($table_name){
        if(!isset($this->profile['table_prefix']))
            return $table_name;
        return $this->profile['table_prefix'].$table_name;
    }

    /**
      * Check if the current connection has a table prefix set
      *
      * @return boolean
      * @author Julien Issler
      * @since 1.0
      */
    public function hasTablePrefix(){
        return (isset($this->profile['table_prefix']) && $this->profile['table_prefix'] != '');
    }

    /**
    * sets the autocommit state
    * @param boolean $state the status of autocommit
    */
    public function setAutoCommit($state=true){
        $this->_autocommit = $state;
        $this->_autoCommitNotify ($this->_autocommit);
    }

    /**
     * begin a transaction. Call it before query, limitQuery, exec
     * And then commit() or rollback()
     */
    abstract public function beginTransaction ();

    /**
     * validate all queries and close a transaction
     */
    abstract public function commit ();

    /**
     * cancel all queries of a transaction and close the transaction
     */
    abstract public function rollback ();

    /**
     * prepare a query
     * @param string $query a sql query with parameters
     * @return statement a statement
     */
    abstract public function prepare ($query);

    /**
     * @return string the last error description
     */
    abstract public function errorInfo();

    /**
     * @return integer the last error code
     */
    abstract public function errorCode();

    /**
     * return the id value of the last inserted row.
     * Some driver need a sequence name, so give it at first parameter
     * @param string $fromSequence the sequence name
     * @return integer the id value
     */
    abstract public function lastInsertId($fromSequence='');

    /**
     *
     * @param integer $id the attribut id
     * @return string the attribute value
     * @see PDO::getAttribute()
     */
    abstract public function getAttribute($id);

    /**
     * 
     * @param integer $id the attribut id
     * @param string $value the attribute value
     * @see PDO::setAttribute()
     */
    abstract public function setAttribute($id, $value);

    /**
     * return the maximum value of the given primary key in a table
     * @param string $fieldName the name of the primary key
     * @param string $tableName the name of the table
     * @return integer the maximum value
     */
    public function lastIdInTable($fieldName, $tableName){
        $rs = $this->query ('SELECT MAX('.$fieldName.') as ID FROM '.$tableName);
        if (($rs !== null) && $r = $rs->fetch ()){
            return $r->ID;
        }
        return 0;
    }

    /**
    * Notify the changes on autocommit
    * Drivers may overload this
    * @param boolean $state the new state of autocommit
    */
    abstract protected function _autoCommitNotify ($state);

    /**
    * return a connection identifier or false/null if there is an error
    * @return integer connection identifier
    */
    abstract protected function _connect ();

    /**
    * do a disconnection
    * (no need to do a test on the connection id)
    */
    abstract protected function _disconnect ();

    /**
    * do a query which return results
    * @return jDbResultSet/boolean
    */
    abstract protected function _doQuery ($queryString);
    /**
    * do a query which return nothing
    * @return jDbResultSet/boolean
    */
    abstract protected function _doExec ($queryString);

    /**
    * do a query which return a limited number of results
    * @return jDbResultSet/boolean
    */
    abstract protected function _doLimitQuery ($queryString, $offset, $number);

    /**
    * do the escaping of a string.
    * you should override it into the driver
    * @param string $text the text to escape
    * @param boolean $binary true if the content of the string is a binary content
    * @return string the escaped string
    */
    protected function _quote($text, $binary){
        return addslashes($text);
    }
    
    /**
     * @var jDbTools
     * @since 1.2
     */
    protected $_tools = null;
    
    /**
     * @return jDbTools
     * @since 1.2
     */
    public function tools () {
        if (!$this->_tools) {
            require_once(jApp::config()->_pluginsPathList_db[$this->driverName].$this->driverName.'.dbtools.php');
            $class = $this->driverName.'DbTools';
            $this->_tools = new $class($this);
        }

        return $this->_tools;
    }


    /**
     * @var jDbSchema
     * @since 1.2
     */
    protected $_schema = null;
    
    /**
     * @return jDbSchema
     * @since 1.2
     */
    public function schema () {
        if (!$this->_schema) {
            require_once(jApp::config()->_pluginsPathList_db[$this->driverName].$this->driverName.'.dbschema.php');
            $class = $this->driverName.'DbSchema';
            $this->_schema = new $class($this);
        }

        return $this->_schema;
    }

    /**
     * replace named parameters into the given query, by the given marker, for
     * db API that don't support named parameters for prepared queries.
     *
     * @param string $sql
     * @param string $marker a string which will replace each named parameter in the query.
     *    it may end by a '%' so named parameters are replaced by numerical parameter.
     *    ex : '$%' : named parameters will be replaced by $1, $2, $3...
     * @return array  0:the new sql, 1: list of parameters names, in the order they
     * appear into the query
     */
    protected function findParameters($sql, $marker) {
        $queryParts = preg_split("/([`\"'\\\\])/", $sql, -1, PREG_SPLIT_DELIM_CAPTURE);
        $finalQuery = '';
        $ignoreNext = false;
        $insideString = false;
        $this->foundParameters = array();
        $this->numericalMarker = (substr($marker, -1) == '%');
        if ($this->numericalMarker) {
            $this->parameterMarker = substr($marker,0,-1);
        }
        else {
            $this->parameterMarker = $marker;
        }

        foreach($queryParts as $token) {
            if ($token == '\\') {
                $ignoreNext = true;
                $finalQuery .= $token;
            }
            else if ($token == '"' || $token == "'" || $token =='`') {
                if ($ignoreNext) {
                    $ignoreNext = false;
                    $finalQuery .= $token;
                }
                else if ($insideString == $token) {
                    $insideString = false;
                    $finalQuery .= $token;
                }
                else if ($insideString === false) {
                    $insideString = $token;
                    $finalQuery .= $token;
                }
                else if ($insideString !== false) {
                    $finalQuery .= $token;
                }
            }
            else if ($insideString !== false) {
                $finalQuery .= $token;
            }
            else {
                $finalQuery .= preg_replace_callback("/(\\:)([a-zA-Z0-9_]+)/", array($this, '_replaceParam'), $token);
            }
        }

        return array($finalQuery, $this->foundParameters);
    }

    protected function _replaceParam($matches) {
        if ($this->numericalMarker) {
            $index = array_search($matches[2], $this->foundParameters);
            if ($index === false) {
                $this->foundParameters[] = $matches[2];
                $index = count($this->foundParameters) -1;
            }
            return $this->parameterMarker.($index+1);
        }
        else {
            $this->foundParameters[] = $matches[2];
            return $this->parameterMarker;
        }
    }

}
