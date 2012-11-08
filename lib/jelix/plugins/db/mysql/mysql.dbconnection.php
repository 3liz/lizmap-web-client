<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @contributor Sylvain de Vathaire, Julien Issler
* @copyright  2001-2005 CopixTeam, 2005-2012 Laurent Jouanneau
* @copyright  2009 Julien Issler
* This class was get originally from the Copix project (CopixDbConnectionMysql, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix class are Gerald Croes and Laurent Jouanneau,
* and this class was adapted for Jelix by Laurent Jouanneau
*
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/
require_once(dirname(__FILE__).'/mysql.dbresultset.php');

/**
 *
 * @package    jelix
 * @subpackage db_driver
 */
class mysqlDbConnection extends jDbConnection {

    protected $_charsets =array( 'UTF-8'=>'utf8', 'ISO-8859-1'=>'latin1');

    function __construct($profile){
        // because of the @, we need to test mysl existance, else there would be 
        // a stop without error
        if(!function_exists('mysql_connect')){
            throw new jException('jelix~db.error.nofunction','mysql');
        }
        parent::__construct($profile);
    }

    /**
     * Enclose the field name
     * @param string $fieldName the field name
     * @return string the enclosed field name
     * @since 1.1.1
     */
    public function encloseName($fieldName){
        return '`'.$fieldName.'`';
    }

    /**
    * Begin a transaction
    */
    public function beginTransaction (){
        $this->_doExec ('SET AUTOCOMMIT=0');
        $this->_doExec ('BEGIN');
    }

    /**
    * Commit since the last begin
    */
    public function commit (){
        $this->_doExec ('COMMIT');
        $this->_doExec ('SET AUTOCOMMIT=1');
    }

    /**
    * Rollback since the last BEGIN
    */
    public function rollback (){
        $this->_doExec ('ROLLBACK');
        $this->_doExec ('SET AUTOCOMMIT=1');
    }

    /**
    *
    */
    public function prepare ($query){
        throw new jException('jelix~db.error.feature.unsupported', array('mysql','prepare'));
    }

    public function errorInfo(){
        return array( 'HY000' ,mysql_errno($this->_connection), mysql_error($this->_connection));
    }

    public function errorCode(){
       return mysql_errno($this->_connection);
    }

    protected function _connect (){
        $funcconnect= ($this->profile['persistent']? 'mysql_pconnect':'mysql_connect');
        if($cnx = @$funcconnect ($this->profile['host'], $this->profile['user'], $this->profile['password'])){
            if(isset($this->profile['force_encoding']) && $this->profile['force_encoding'] == true
              && isset($this->_charsets[jApp::config()->charset])){
                mysql_query("SET NAMES '".$this->_charsets[jApp::config()->charset]."'", $cnx);
            }
            return $cnx;
        }else{
            throw new jException('jelix~db.error.connection',$this->profile['host']);
        }
    }

    protected function _disconnect (){
        return mysql_close ($this->_connection);
    }


    protected function _doQuery ($query){
        // here and not during the connect, in case there would be multiple active connections
        if(!mysql_select_db ($this->profile['database'], $this->_connection)){
            if(mysql_errno($this->_connection))
                throw new jException('jelix~db.error.database.unknown',$this->profile['database']);
            else
                throw new jException('jelix~db.error.connection.closed',$this->profile['name']);
        }

        if ($qI = mysql_query ($query, $this->_connection)){
            return new mysqlDbResultSet ($qI);
        }else{
            throw new jException('jelix~db.error.query.bad',  mysql_error($this->_connection).'('.$query.')');
        }
    }

    protected function _doExec($query){
        if(!mysql_select_db ($this->profile['database'], $this->_connection))
            throw new jException('jelix~db.error.database.unknown',$this->profile['database']);

        if ($qI = mysql_query ($query, $this->_connection)){
            return mysql_affected_rows($this->_connection);
        }else{
            throw new jException('jelix~db.error.query.bad',  mysql_error($this->_connection).'('.$query.')');
        }
    }

    protected function _doLimitQuery ($queryString, $offset, $number){
        $queryString.= ' LIMIT '.$offset.','.$number;
        $this->lastQuery = $queryString;
        $result = $this->_doQuery($queryString);
        return $result;
    }


    public function lastInsertId($fromSequence=''){// on n'a pas besoin de l'argument pour mysql
        return mysql_insert_id ($this->_connection);
    }

    /**
    * tell mysql to be autocommit or not
    * @param boolean $state the state of the autocommit value
    * @return void
    */
    protected function _autoCommitNotify ($state){
        $this->query ('SET AUTOCOMMIT='.($state ? '1' : '0'));
    }

    /**
     * @return string escaped text or binary string
     */
    protected function _quote($text, $binary) {
        return mysql_real_escape_string($text, $this->_connection);
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
                return mysql_get_client_info();
            case self::ATTR_SERVER_VERSION:
                return mysql_get_server_info($this->_connection);
                break;
            case self::ATTR_SERVER_INFO:
                return mysql_get_host_info($this->_connection);
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
