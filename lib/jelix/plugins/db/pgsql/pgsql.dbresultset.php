<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @copyright  2001-2005 CopixTeam, 2005-2010 Laurent Jouanneau
* This class was get originally from the Copix project (CopixDBResultSetPostgreSQL, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix class are Gerald Croes and Laurent Jouanneau,
* and this class was adapted/improved for Jelix by Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * @package    jelix
 * @subpackage db_driver
 */
class pgsqlDbResultSet extends jDbResultSet {
    protected $_stmtId;
    protected $_cnt;

    function __construct ($idResult, $stmtId = null, $cnt=null) {
        $this->_idResult = $idResult;
        $this->_stmtId = $stmtId;
        $this->_cnt = $cnt;
    }

    public function fetch() {
        if ($this->_fetchMode == jDbConnection::FETCH_CLASS) {
            if ($this->_fetchModeCtoArgs)
                $res = pg_fetch_object ($this->_idResult, null , $this->_fetchModeParam, $this->_fetchModeCtoArgs);
            else
                $res = pg_fetch_object ($this->_idResult, null , $this->_fetchModeParam);
        }
        else if ($this->_fetchMode == jDbConnection::FETCH_INTO) {
             $res = pg_fetch_object ($this->_idResult);
            $values = get_object_vars ($res);
            $res = $this->_fetchModeParam;
            foreach ($values as $k=>$value) {
                $res->$k = $value;
            }
        }
        else {
            $res = pg_fetch_object ($this->_idResult);
        }

        if ($res && count($this->modifier)) {
            foreach($this->modifier as $m)
                call_user_func_array($m, array($res, $this));
         }
        return $res;
    }

    protected function _fetch(){ }

    protected function _free (){
        return pg_free_result ($this->_idResult);
    }

    protected function _rewind (){
        return pg_result_seek ( $this->_idResult, 0 );
    }

    public  function rowCount(){
        return pg_num_rows($this->_idResult);
    }

    public function bindColumn($column, &$param , $type=null )
      {throw new jException('jelix~db.error.feature.unsupported', array('pgsql','bindColumn')); }
    public function bindParam($parameter, &$variable , $data_type =null, $length=null,  $driver_options=null)
       {throw new jException('jelix~db.error.feature.unsupported', array('pgsql','bindParam')); }
    public function bindValue($parameter, $value, $data_type)
       {throw new jException('jelix~db.error.feature.unsupported', array('pgsql','bindValue')); }

    public function columnCount() {
        return pg_num_fields($this->_idResult);
    }

    public function execute($parameters=array()) {
        $this->_idResult= pg_execute($this->_cnt,$this->_stmtId, $parameters);
        return true;
    }

    public function unescapeBin($text) {
        return pg_unescape_bytea($text);
    }
}
