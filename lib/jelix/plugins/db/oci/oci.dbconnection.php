<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Philippe Villiers
* @copyright  2013 Philippe Villiers
*
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/
require_once(dirname(__FILE__).'/oci.dbresultset.php');

/**
 *
 * @package    jelix
 * @subpackage db_driver
 */
class ociDbConnection extends jDbConnection {

    // Charsets equivalents
    protected $_charsets =array( 'UTF-8'=>'AL32UTF8', 'ISO-8859-1'=>'WE8ISO8859P1');

    function __construct($profile){
        if(!function_exists('oci_connect')){
            throw new jException('jelix~db.error.nofunction','oci');
        }
        parent::__construct($profile);

        $this->dbms = 'oci';
    }

    protected function _connect () {
        $funcConnect = (isset($this->profile['persistent']) && $this->profile['persistent'] ? 'oci_pconnect':'oci_connect');

        if(isset($this->profile['dsn'])) {
            $connString = $this->profile['dsn'];
        } else {
            $connString = $this->profile['host'];
            if(isset($this->profile['port'])) {
                $connString .= ':' . $this->profile['port'];
            }
            $connString .= '/' . $this->profile['database'];
        }
        $charset = $this->_charsets[jApp::config()->charset];

        $conn = $funcConnect($this->profile['user'], $this->profile['password'], $connString, $charset);
        if (!$conn) {
            $err = oci_error();
            throw new jException('jelix~db.error.connection', $this->profile['host']);
        }
        
        return $conn;
    }

    protected function _disconnect() {
        return oci_close ($this->_connection);
    }

    protected function _doQuery ($queryString) {
        if ($stId = oci_parse($this->_connection, $queryString)){
            $rs= new ociDbResultSet ($stId, $this->_connection);
            $rs->_connector = $this;
            if($res = $rs->execute()) {
                return $rs;
            }
        }
        $err = oci_error();
        throw new jException('jelix~db.error.query.bad', $err['message'].'('.$queryString.')');
    }

    protected function _doLimitQuery($queryString, $offset, $number) {
        $offset = $offset + 1; // rnum begins at 1
        $queryString = 'SELECT * FROM ( SELECT ocilimit.*, rownum rnum FROM ('.$queryString.') ocilimit WHERE
            rownum<'.(intval($offset)+intval($number)).'  ) WHERE rnum >='.intval($offset);
        return $this->_doQuery ($queryString);
    }

    protected function _doExec($query) {
        if($rs = $this->_doQuery($query)) {
            return oci_num_rows($rs->id());
        } else {
            return 0;
        }
    }

    public function prepare($query) {
        $stId = oci_parse($this->_connection, $query);
        if($stId){
            $rs = new ociDbResultSet ($stId, $this->_connection);
        } else {
            $err = oci_error();
            throw new jException('jelix~db.error.query.bad', $err['message'].'('.$query.')');
        }
        return $rs;
    }


    public function beginTransaction (){
        return true;
    }

    public function commit () {
        return oci_commit($this->_connection);
    }

    public function rollback () {
        return oci_rollback($this->_connection);
    }

    public function errorInfo() {
        $err = oci_error();
        return array( 'HY000', $err['code'], $err['message']);
    }

    public function errorCode() {
        $err = oci_error();
        return $err['code'];
    }

    public function lastInsertId($seqName = '') {
        if($seqName == '') {
            trigger_error(get_class($this).'::lastInstertId invalid sequence name', E_USER_WARNING);
            return false;
        }
        $cur = $this->query('select ' . $seqName . '.currval as "id" from dual');
        if($cur) {
            $res = $cur->fetch();
            if($res) {
                return $res->id;
            } else {
                return false;
            }
        } else {
            trigger_error(get_class($this).'::lastInstertId invalid sequence name', E_USER_WARNING);
            return false;
        }
    }

    public function getAttribute($id) {
    }

    public function setAttribute($id, $value) {
    }

    protected function _autoCommitNotify ($state) {
        $this->_doExec('SET AUTOCOMMIT '.($state ? 'ON' : 'OFF'));
    }
}

