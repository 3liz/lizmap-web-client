<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @contributor Florian Lonqueu-Brochard
* @copyright  2001-2005 CopixTeam, 2005-2012 Laurent Jouanneau
* @copyright  2012 Florian Lonqueu-Brochard
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * Object to fetch result, wrapping the underlaying result object of mysqli
 * @package    jelix
 * @subpackage db_driver
 */
class mysqliDbResultSet extends jDbResultSet {

    protected function  _fetch () {
        if($this->_fetchMode == jDbConnection::FETCH_CLASS) {
            if ($this->_fetchModeCtoArgs)
                $ret =  $this->_idResult->fetch_object($this->_fetchModeParam, $this->_fetchModeCtoArgs);
            else
                $ret =  $this->_idResult->fetch_object($this->_fetchModeParam);
        }else{
            $ret =  $this->_idResult->fetch_object();
        }
        return $ret;
    }

    protected function _free (){
        //free_result may lead to a warning if close() has been called before by dbconnection's _disconnect()
        return @$this->_idResult->free_result();
    }

    protected function _rewind (){
        return @$this->_idResult->data_seek(0);
    }

    public function rowCount(){
        return $this->_idResult->num_rows;
    }

    public function columnCount(){ 
        return $this->_idResult->field_count; 
    }

    public function bindColumn($column, &$param , $type=null )
      {throw new jException('jelix~db.error.feature.unsupported', array('mysql','bindColumn')); }
    public function bindValue($parameter, $value, $data_type)
      {throw new jException('jelix~db.error.feature.unsupported', array('mysql','bindValue')); }
    public function bindParam($parameter, &$variable , $data_type =null, $length=null,  $driver_options=null)
      {throw new jException('jelix~db.error.feature.unsupported', array('mysql','bindParam')); }
    public function execute($parameters=null)
      {throw new jException('jelix~db.error.feature.unsupported', array('mysql','execute')); }
}


/**
 * Object to fetch result, wrapping a statement object of mysqli,
 * for installation where mysqlnd is not used
 * @package    jelix
 * @subpackage db_driver
 */
class mysqliDbStmtResultSet extends mysqliDbResultSet {

    protected $resultObject = null;

    function __construct ($result) {
        parent::__construct($result);
        //this call to store_result() will buffer all results but is necessary for num_rows to have
        //its real value and thus for dbresultset's ->rowCount() to work fine :
        $result->store_result();

        // we have a statement, so no fetch_object method
        // so we will create results object. We need to bind result.
        $meta = $result->result_metadata();

        $this->resultObject = new stdClass();

        $variables = array();
        while($field = $meta->fetch_field()) {
            $this->resultObject->{$field->name} = null;
            $variables[] = & $this->resultObject->{$field->name}; // pass by reference
        }
        call_user_func_array(array($result, 'bind_result'), $variables);
        $meta->close();
    }

    protected function  _fetch () {
        if (!$this->_idResult->fetch())
            return false;
        $result = clone $this->resultObject;
        return $result;
    }

}
