<?php
/**
* @package    jelix
* @subpackage db
* @author     Laurent Jouanneau
* @contributor Gwendal Jouannic, Thomas, Julien Issler, Vincent Herr
* @copyright  2005-2012 Laurent Jouanneau
* @copyright  2008 Gwendal Jouannic, 2009 Thomas
* @copyright  2009 Julien Issler
* @copyright  2011 Vincent Herr
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * A connection object based on PDO
 * @package  jelix
 * @subpackage db
 */
class jDbPDOConnection extends PDO {

    private $_mysqlCharsets = array('UTF-8'=>'utf8', 'ISO-8859-1'=>'latin1');
    private $_pgsqlCharsets = array('UTF-8'=>'UNICODE', 'ISO-8859-1'=>'LATIN1');

    /**
     * the profile the connection is using
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
     * Use a profile to do the connection
     * @param array $profile the profile data readed from the ini file
     */
    function __construct($profile) {
        $this->profile = $profile;
        $prof = $profile;
        $user = '';
        $password = '';

        if (isset($profile['dsn'])) {
            $this->dbms = $this->driverName = substr($profile['dsn'],0,strpos($profile['dsn'],':'));
            $dsn = $profile['dsn'];
            unset($prof['dsn']);
            if ($this->dbms == 'sqlite') {
                $dsn = 'sqlite:'.$this->_parseSqlitePath(substr($dsn, 7));
            }
        }
        else {
            $this->dbms = $this->driverName = $profile['driver'];
            if ($this->dbms == 'sqlite3') {
                $this->dbms = $this->driverName = 'sqlite';
            }
            $db = $profile['database'];
            if ($this->dbms != 'sqlite') {
                $dsn = $this->dbms.':host='.$profile['host'].';dbname='.$db;
            }
            else {
                $dsn = 'sqlite:'.$this->_parseSqlitePath($db);
            }
        }
        if(isset($prof['usepdo'])) {
            unset($prof['usepdo']);
        }

        // we check user and password because some db like sqlite doesn't have user/password
        if (isset($prof['user'])) {
            $user = $prof['user'];
            unset($prof['user']);
        }

        if (isset($prof['password'])) {
            $password = $profile['password'];
            unset($prof['password']);
        }

        unset($prof['driver']);
        parent::__construct($dsn, $user, $password, $prof);

        $this->setAttribute(PDO::ATTR_STATEMENT_CLASS, array('jDbPDOResultSet'));
        $this->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // we cannot launch two queries at the same time with PDO ! except if
        // we use mysql with the attribute MYSQL_ATTR_USE_BUFFERED_QUERY
        // TODO check if PHP 5.3 or higher fixes this issue
        if ($this->dbms == 'mysql') {
            $this->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
        }

        // Oracle returns names of columns in upper case by default. so here
        // we force the case in lower.
        if ($this->dbms == 'oci') {
            $this->setAttribute(PDO::ATTR_CASE, PDO::CASE_LOWER);
        }

        if (isset($prof['force_encoding']) && $prof['force_encoding']==true) {
            $charset = jApp::config()->charset;
            if ($this->dbms == 'mysql' && isset($this->_mysqlCharsets[$charset])) {
                $this->exec("SET NAMES '".$this->_mysqlCharsets[$charset]."'");
            }
            elseif($this->dbms == 'pgsql' && isset($this->_pgsqlCharsets[$charset])) {
                $this->exec("SET client_encoding to '".$this->_pgsqlCharsets[$charset]."'");
            }
        }
    }

    protected function _parseSqlitePath($path) {
        if (preg_match('/^(app|lib|var|temp|www)\:/', $path, $m)) {
            return jFile::parseJelixPath( $path );
        }
        else if (preg_match('!^[a-z]\\:(\\\\|/)[a-z]!i', $path) || // windows path
                 $path[0] == '/' // *nix path
                ) {
            if (file_exists($path) || file_exists(dirname($path))) {
                return $path;
            }
            else {
                throw new Exception ('jDbPDOConnection, sqlite: unknown database path scheme');
            }
        }
        else {
            return jApp::varPath('db/sqlite/'.$path);
        }
    }

    /**
     * @internal the implementation of Iterator on PDOStatement doesn't call
     * fetch method of classes which inherit of PDOStatement.
     * so, we cannot indicate to fetch object directly in jDbPDOResultSet::fetch().
     * So we overload query() to do it.
     * TODO check if this is still the case in PHP 5.3
     */
    public function query() {
        $args = func_get_args();

        switch (count($args)) {
        case 1:
            $rs = parent::query($args[0]);
            $rs->setFetchMode(PDO::FETCH_OBJ);
            return $rs;
        case 2:
            return parent::query($args[0], $args[1]);
        case 3:
            return parent::query($args[0], $args[1], $args[2]);
        default:
            throw new Exception('jDbPDOConnection: bad argument number in query');
        }
    }

    /**
    * Launch a SQL Query with limit parameter (so only a subset of a result)
    * @param   string   $queryString   the SQL query
    * @param   integer  $limitOffset   the offset of the first row to return
    * @param   integer  $limitCount    the maximum of number of rows to return
    * @return  jDbPDOResultSet|boolean  SQL Select. False if the query has failed.
    */
    public function limitQuery ($queryString, $limitOffset = null, $limitCount = null) {
        if ($limitOffset !== null && $limitCount !== null) {
            if ($this->dbms == 'mysql' || $this->dbms == 'sqlite') {
                $queryString.= ' LIMIT '.intval($limitOffset).','. intval($limitCount);
            }
            elseif ($this->dbms == 'pgsql') {
                $queryString .= ' LIMIT '.intval($limitCount).' OFFSET '.intval($limitOffset);
            }
            elseif ($this->dbms == 'oci') {
                $limitOffset = $limitOffset + 1; // rnum begins at 1
                $queryString = 'SELECT * FROM ( SELECT ocilimit.*, rownum rnum FROM ('.$queryString.') ocilimit WHERE
                    rownum<'.(intval($limitOffset)+intval($limitCount)).'  ) WHERE rnum >='.intval($limitOffset);
            }
        }
        return $this->query ($queryString);
    }

    /**
     * sets the autocommit state
     * @param boolean $state the status of autocommit
     */
    public function setAutoCommit($state=true) {
        $this->setAttribute(PDO::ATTR_AUTOCOMMIT,$state);
    }

    /**
     * return the maximum value of the given primary key in a table
     * @param string $fieldName the name of the primary key
     * @param string $tableName the name of the table
     * @return integer the maximum value
     */
    public function lastIdInTable($fieldName, $tableName) {
      $rs = $this->query ('SELECT MAX('.$fieldName.') as ID FROM '.$tableName);
      if (($rs !== null) && $r = $rs->fetch ()){
         return $r->ID;
      }
      return 0;
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
    public function prefixTable($table_name) {
        if (!isset($this->profile['table_prefix'])) {
            return $table_name;
        }
        return $this->profile['table_prefix'].$table_name;
    }

    /**
     * Check if the current connection has a table prefix set
     *
     * @return boolean
     * @author Julien Issler
     * @since 1.0
     */
    public function hasTablePrefix() {
        return (isset($this->profile['table_prefix']) && $this->profile['table_prefix']!='');
    }

    /**
     * enclose the field name
     * @param string $fieldName the field name
     * @return string the enclosed field name
     * @since 1.1.2
     */
    public function encloseName($fieldName) {
        switch ($this->dbms) {
            case 'mysql': return '`'.$fieldName.'`';
            case 'pgsql': return '"'.$fieldName.'"';
            default: return $fieldName;
        }
    }

    /**
    * Escape and quotes strings. if null, will only return the text "NULL"
    * @param string $text   string to quote
    * @param boolean $checknull if true, check if $text is a null value, and then return NULL
    * @param boolean $binary  set to true if $text contains a binary string
    * @return string escaped string
    * @since 1.2
    * @todo $binary parameter is not really supported, check if PDOConnection::quote supports binary strings
    */
    public function quote2 ($text, $checknull=true, $binary=false) {
        if ($checknull)
            return (is_null ($text) ? 'NULL' : $this->quote($text));
        else
            return $this->quote($text);
    }

    /**
     * @var jDbTools
     */
    protected $_tools = null;

    /**
     * @return jDbTools
     * @throws jException
     */
    public function tools () {
        if (!$this->_tools) {
            $dbms = ($this->dbms === 'sqlite') ? 'sqlite3' : $this->dbms; 
            $this->_tools = jApp::loadPlugin($dbms, 'db', '.dbtools.php', $dbms.'DbTools', $this);
            if (is_null($this->_tools)) {
                throw new jException('jelix~db.error.driver.notfound', $dbms);
            }
        }

        return $this->_tools;
    }

    /**
     * Get the ID of the last inserted row
     * Mssql pdo driver does not support this feature.
     * so, we use a custom query
     * @param string $fromSequence the sequence name, if needed
     * @return string
     */
    public function lastInsertId($fromSequence=null) {
        if ($this->dbms == 'mssql') {
            $res = $this->query('SELECT SCOPE_IDENTITY()');
            return (int) $res->fetchColumn();
        }

        return parent::lastInsertId($fromSequence);
    }
}
