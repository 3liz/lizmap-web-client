<?php
/**
* @package    jelix
* @subpackage db_driver
* @author      Florian Lonqueu-Brochard
* @contributor Laurent Jouanneau
* @copyright  2012 Florian Lonqueu-Brochard, 2012 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

require_once(__DIR__.'/mysqli.dbresultset.php');

class mysqliDbStatement extends jDbStatement {

    private $_usesMysqlnd = true;

    function __construct($connection, $usesMysqlnd){
        $this->_usesMysqlnd = $usesMysqlnd;
        parent::__construct($connection);
    }

    public function execute(){
        $this->_stmt->execute();

        if($this->_stmt->result_metadata()){
            //the query produces a result
            try{
                if( $this->_usesMysqlnd ) {
                    //with the MySQL native driver - mysqlnd (by default in php 5.3.0)
                    $res = new mysqliDbResultSet($this->_stmt->get_result());
                } else {
                    $res = new mysqliDbStmtResultSet($this->_stmt);
                }
            }
            catch(Exception $e){
                throw new jException('jelix~db.error.query.bad', $this->_stmt->errno);
            }
        }
        else{
            if($this->_stmt->affected_rows > 0) {
                $res = $this->_stmt->affected_rows;
            }
            elseif ($this->_stmt->affected_rows === null) {
                throw new jException('jelix~db.error.invalid.param');
            }
            else{
                throw new jException('jelix~db.error.query.bad', $this->_stmt->errno);
            }
        }
        return $res;
    }

    /**
     * @see http://www.php.net/manual/fr/mysqli-stmt.bind-param.php
     */
    public function bindParam(){
        $args = func_get_args();
        $params = array();
        // we should pass parameters by references to bind_param
        $args = array_walk($args, function($val, $key) use (&$params) {
            $params[$key] = $val;
            $args[$key] = &$params[$key];
        }, $args);
        $method = new ReflectionMethod('mysqli_stmt', 'bind_param');
        $res = $method->invokeArgs($this->_stmt, $params);
        if(!$res){
            throw new jException('jelix~db.error.invalid.param');
        }
        return $res;
    }


    protected function _free(){
        return $this->_stmt->close();
    }


    public function getAttribute($attr){
        return $this->_stmt->get_attr($attr);
    }

    public function setAttribute($attr, $value){
        return $this->_stmt->get_attr($attr, $value);
    }
}

