<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Loic Mathaud
* @contributor Laurent Jouanneau
* @copyright  2006 Loic Mathaud, 2008 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * Couche d'encapsulation des resultset sqlite.
 * @package    jelix
 * @subpackage db_driver
 */
class sqliteDbResultSet extends jDbResultSet {

    protected function  _fetch (){
        $ret =  sqlite_fetch_object($this->_idResult);
        return $ret;
        /*if($this->_fetchMode == jDbConnection::FETCH_CLASS){
            if ($this->_fetchModeCtoArgs)
                $ret =  sqlite_fetch_object ($this->_idResult, $this->_fetchModeParam, $this->_fetchModeCtoArgs);
            else
                $ret =  sqlite_fetch_object ($this->_idResult, $this->_fetchModeParam);
        }else{
            $ret =  sqlite_fetch_object ($this->_idResult);
        }
        return $ret;*/
    }
    protected function _free (){
        return;
    }

    protected function _rewind (){
        return @sqlite_rewind ( $this->_idResult );
    }

    public function rowCount(){
        return sqlite_num_rows($this->_idResult);
    }

    public function bindColumn($column, &$param , $type=null )
      {throw new jException('jelix~db.error.feature.unsupported', array('sqlite','bindColumn')); }
    public function bindParam($parameter, &$variable , $data_type =null, $length=null,  $driver_options=null)
      {throw new jException('jelix~db.error.feature.unsupported', array('sqlite','bindParam')); }
    public function bindValue($parameter, $value, $data_type)
      {throw new jException('jelix~db.error.feature.unsupported', array('sqlite','bindValue')); }
    public function columnCount()
      { return sqlite_num_fields($this->_idResult); }
    public function execute($parameters=null)
      {throw new jException('jelix~db.error.feature.unsupported', array('sqlite','bindColumn')); }
}

