<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Loic Mathaud
* @contributor Laurent Jouanneau
* @copyright  2006 Loic Mathaud, 2007-2012 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/
require_once(dirname(__FILE__).'/sqlite3.dbresultset.php');

/**
 *
 * @package    jelix
 * @subpackage db_driver
 */
class sqlite3DbConnection extends jDbConnection {

    function __construct($profile){
        if (!class_exists('SQLite3')) {
            throw new jException('jelix~db.error.nofunction','sqlite3');
        }
        parent::__construct($profile);
        $this->dbms = 'sqlite';
    }

    /**
    * begin a transaction
    */
    public function beginTransaction (){
        $this->_doExec ('BEGIN');
    }

    /**
    * Commit since the last begin
    */
    public function commit (){
        $this->_doExec ('COMMIT');
    }

    /**
    * Rollback since the last BEGIN
    */
    public function rollback (){
        $this->_doExec ('ROLLBACK');
    }

    /**
    *
    */
    public function prepare ($query){
        throw new jException('jelix~db.error.feature.unsupported', array('sqlite','prepare'));
    }

    public function errorInfo(){
        return array($this->_connection->lastErrorCode(), $this->_connection->lastErrorMsg());
    }

    public function errorCode(){
        return $this->_connection->lastErrorCode();
    }

    protected function _connect (){
        $db = $this->profile['database'];
        if (preg_match('/^(app|lib|var|temp|www)\:/', $db)) {
            $path = jFile::parseJelixPath( $db );
        }
        else if ($db[0] == '/' || // *nix path
                 preg_match('!^[a-z]\\:(\\\\|/)[a-z]!i', $db) // windows path
                ) {
            if (file_exists($db) || file_exists(dirname($db))) {
                $path = $db;
            }
            else {
                throw new Exception ('sqlite3 connector: unknown database path scheme');
            }
        }
        else {
            $path = jApp::varPath('db/sqlite3/'.$db);
        }

        $sqlite = new SQLite3($path);

        // Load extensions if needed
        if (isset($this->profile['extensions']) ) {
            $list = preg_split('/ *, */',$this->profile['extensions']);
            foreach($list as $ext){
                try {
                    $sqlite->loadExtension($ext);
                } catch(Exception $e) {
                    throw new Exception('sqlite3 connector: error while loading sqlite extension '.$ext);
                }
            }
        }

        // set timeout
        if (isset($this->profile['busytimeout']) ) {
            $timeout = intval($this->profile['busytimeout']);
            if ($timeout) {
                $sqlite->busyTimeout($timeout);
            }
        }
        return $sqlite;
    }

    protected function _disconnect (){
        return $this->_connection->close();
    }

    protected function _doQuery($query){
        if ($qI = $this->_connection->query($query)) {
            return new sqlite3DbResultSet($qI);
        } else {
            throw new jException('jelix~db.error.query.bad', $this->_connection->lastErrorMsg().' ('.$query.')');
        }
    }

    protected function _doExec($query){
        if ($qI = $this->_connection->exec($query)){
            return $this->_connection->changes();
        } else {
            throw new jException('jelix~db.error.query.bad', $this->_connection->lastErrorMsg().' ('.$query.')');
        }
    }

    protected function _doLimitQuery ($queryString, $offset, $number){
        $queryString.= ' LIMIT '.$offset.','.$number;
        $this->lastQuery = $queryString;
        $result = $this->_doQuery($queryString);
        return $result;
    }

    public function lastInsertId($fromSequence='') {
        return $this->_connection->lastInsertRowID();
    }

    /**
    * tell sqlite to be autocommit or not
    * @param boolean $state the state of the autocommit value
    * @return void
    */
    protected function _autoCommitNotify ($state){
        $this->query ('SET AUTOCOMMIT='.$state ? '1' : '0');
    }

    /**
    * @return string the text with non ascii char and quotes escaped
    */
    protected function _quote($text, $binary) {
        return $this->_connection->escapeString($text);
    }


    /**
     *
     * @param integer $id the attribut id
     * @return string the attribute value
     * @see PDO::getAttribute()
     */
    public function getAttribute($id) {
        switch($id) {
            case self::ATTR_CLIENT_VERSION:
            case self::ATTR_SERVER_VERSION:
                $v = SQLite3::version();
                return $v['versionString'];
        }
        return "";
    }

    /**
     *
     * @param integer $id the attribut id
     * @param string $value the attribute value
     * @see PDO::setAttribute()
     */
    public function setAttribute($id, $value) {
    }

}

