<?php
/**
 * @package    jelix
 * @subpackage db_driver
 * @author     Yann Lecommandoux
 * @copyright  2008 Yann Lecommandoux
 * @link      http:/localhost/
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

/**
 * Layer encapsulation resultset mssql.
 * @experimental
 */
class mssqlDbResultSet extends jDbResultSet {

    protected function  _fetch (){
        return mssql_fetch_object ($this->_idResult);
    }

    protected function _free (){
        return mssql_free_result ($this->_idResult);
    }

    protected function _rewind (){
        return @mssql_data_seek ( $this->_idResult, 0);
    }

    public function rowCount(){
        return mssql_num_rows($this->_idResult);
    }

    public function bindColumn($column, &$param , $type=null ) {
        throw new jException('jelix~db.error.feature.unsupported', array('mssql','bindColumn'));
    }

    public function bindParam($parameter, &$variable , $data_type =null, $length=null,  $driver_options=null) {
        throw new jException('jelix~db.error.feature.unsupported', array('mssql','bindParam'));
    }

    public function bindValue($parameter, $value, $data_type) {
        throw new jException('jelix~db.error.feature.unsupported', array('mssql','bindValue'));
    }

    public function columnCount() {
        return mssql_num_fields($this->_idResult);
    }

    public function execute($parameters=null) {
        throw new jException('jelix~db.error.feature.unsupported', array('mssql','bindColumn'));
    }
    
    public function fetch_array(){
        return mssql_fetch_array($this->_idResult);
    }
    
}

