<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Yannick Le Guédart
* @copyright  2007 Over-blog, 2007 Yannick Le Guédart
* @link       http://www.jelix.org
* @link 	  http://www.sinequa.com
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
* @package    jelix
* @subpackage db_driver
*/
class intuitionDbResultSet extends jDbResultSet {

    protected $_stmtId;
    protected $_cnt;

    function __construct ($idResult, $stmtId = null, $cnt = null){
        $this->_idResult = $idResult;
        $this->_stmtId   = $stmtId;
        $this->_cnt      = $cnt;
    }

    public function fetch(){
        $res = false;
        if ($row = $this->_idResult->in_fetch_array ()){
            $res = new stdClass();
            foreach ($row as $key => $value){
                $res->$key = $value;
            }
        }
        return $res;
    }

    protected function _fetch(){ }

    protected function _free (){
        return $this->_idResult->close ();
    }

    protected function _rewind (){
        return $this->_idResult->in_data_seek (0);
    }

    public  function rowCount (){
        return $this->_idResult->in_num_rows ();
    }

    public function bindColumn($column, &$param , $type=null) {
        throw new JException (
            'jelix~db.error.feature.unsupported', 
            array ('pgsql','bindColumn')); 
    }

    public function bindParam (	$parameter, &$variable , $data_type = null, 
            $length = null, $driver_options = null){
        throw new JException (
            'jelix~db.error.feature.unsupported', 
            array ('pgsql','bindParam')); 
    }

    public function bindValue ($parameter, $value, $data_type) {
        throw new JException (
            'jelix~db.error.feature.unsupported', 
            array ('pgsql','bindValue')); 
    }

    public function columnCount(){
        return $this->_idResult->_fields ();
    }

    public function execute ($parameters = array ()){
        throw new JException (
            'jelix~db.error.feature.unsupported', 
            array ('pgsql','bindValue')); 
    }
}
