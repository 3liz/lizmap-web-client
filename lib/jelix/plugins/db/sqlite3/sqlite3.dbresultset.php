<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Loic Mathaud
* @contributor Laurent Jouanneau
* @copyright  2006 Loic Mathaud, 2008-2012 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * Couche d'encapsulation des resultset sqlite.
 * @package    jelix
 * @subpackage db_driver
 */
class sqlite3DbResultSet extends jDbResultSet {

    /**
     * number of rows
     */
    protected $numRows = 0;

    /**
     * when reaching the end of a result set, sqlite3 api do a rewind
     * we don't want this behavior, to mimic the behavior of other drivers
     * this property indicates that we reached the end.
     */
    protected $ended = false;

    /**
     * contains all unreaded records when
     * rowCount() have been called
     */
    protected $buffer = array();

    protected function _fetch () {
        if (count($this->buffer)) {
            return array_shift($this->buffer);
        }
        if ($this->ended) {
            return false;
        }
        $res = $this->_idResult->fetchArray(SQLITE3_ASSOC);
        if ($res === false) {
            $this->ended = true;
            return false;
        }
        $this->numRows++;
        return (object)$res;
    }

    protected function _free () {
        $this->numRows = 0;
        $this->buffer = array();
        $this->ended = false;
        $this->_idResult->finalize();
    }

    protected function _rewind () {
        $this->numRows = 0;
        $this->buffer = array();
        $this->ended = false;
        return $this->_idResult->reset();
    }

    public function rowCount() {
        // the mysqlite3 api doesn't provide a numrows property like any other
        // database. The only way to now the number of rows, is to
        // fetch all rows :-/
        // let's store it into a buffer
        if ($this->ended)
            return $this->numRows;

        $res = $this->_idResult->fetchArray(SQLITE3_ASSOC);
        if ($res !== false) {
            while($res !== false) {
                $this->buffer[] = (object)$res;
                $res = $this->_idResult->fetchArray(SQLITE3_ASSOC);
            }
            $this->numRows += count($this->buffer);
        }
        $this->ended = true;
        return $this->numRows;
    }

    public function bindColumn ($column, &$param , $type=null)
      {throw new jException('jelix~db.error.feature.unsupported', array('sqlite3','bindColumn')); }
    public function bindParam($parameter, &$variable , $data_type =null, $length=null,  $driver_options=null)
      {throw new jException('jelix~db.error.feature.unsupported', array('sqlite3','bindParam')); }
    public function bindValue($parameter, $value, $data_type)
      {throw new jException('jelix~db.error.feature.unsupported', array('sqlite3','bindValue')); }
    public function columnCount()
      { return $this->_idResult->numColumns(); }
    public function execute($parameters=null)
      {throw new jException('jelix~db.error.feature.unsupported', array('sqlite3','bindColumn')); }
}

