<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @contributor Florian Lonqueu-Brochard
* @copyright  2001-2005 CopixTeam, 2005-2010 Laurent Jouanneau
* @copyright  2012 Florian Lonqueu-Brochard
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * Couche d'encapsulation des resultset mysql.
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

