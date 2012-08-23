<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @copyright  2001-2005 CopixTeam, 2005-2010 Laurent Jouanneau
* This class was get originally from the Copix project (CopixDbResultsetMysql, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix class are Gerald Croes and Laurent Jouanneau,
* and this class was adapted/improved for Jelix by Laurent Jouanneau
*
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * Couche d'encapsulation des resultset mysql.
 * @package    jelix
 * @subpackage db_driver
 */
class mysqlDbResultSet extends jDbResultSet {

    protected function  _fetch () {
        if($this->_fetchMode == jDbConnection::FETCH_CLASS) {
            if ($this->_fetchModeCtoArgs)
                $ret =  mysql_fetch_object ($this->_idResult, $this->_fetchModeParam, $this->_fetchModeCtoArgs);
            else
                $ret =  mysql_fetch_object ($this->_idResult, $this->_fetchModeParam);
        }else{
            $ret =  mysql_fetch_object ($this->_idResult);
        }
        return $ret;
    }

    protected function _free (){
        return mysql_free_result ($this->_idResult);
    }

    protected function _rewind (){
        return @mysql_data_seek ( $this->_idResult, 0);
    }

    public function rowCount(){
        return mysql_num_rows($this->_idResult);
    }

    public function bindColumn($column, &$param , $type=null )
      {throw new jException('jelix~db.error.feature.unsupported', array('mysql','bindColumn')); }
    public function bindParam($parameter, &$variable , $data_type =null, $length=null,  $driver_options=null)
      {throw new jException('jelix~db.error.feature.unsupported', array('mysql','bindParam')); }
    public function bindValue($parameter, $value, $data_type)
      {throw new jException('jelix~db.error.feature.unsupported', array('mysql','bindValue')); }
    public function columnCount()
      { return mysql_num_fields($this->_idResult); }
    public function execute($parameters=null)
      {throw new jException('jelix~db.error.feature.unsupported', array('mysql','bindColumn')); }
}

