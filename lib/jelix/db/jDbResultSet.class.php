<?php
/**
* @package    jelix
* @subpackage db
* @author      Laurent Jouanneau
* @copyright  2005-2010 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * represent a statement
 * @package  jelix
 * @subpackage db
 */
abstract class jDbResultSet implements Iterator {

    protected $_idResult=null;
    protected $_fetchMode = 0;
    protected $_fetchModeParam = null;
    protected $_fetchModeCtoArgs = null;

    function __construct ($idResult) {
        $this->_idResult = $idResult;
    }

    function __destruct(){
        if ($this->_idResult){
            $this->_free ();
            $this->_idResult = null;
        }
    }

    public function id() { return $this->_idResult; }

    /**
     * @param string $text a binary string to unescape
     * @return string the unescaped string
     * @since 1.1.6
     */
    public function unescapeBin($text) {
        return $text;
    }

    /**
     * a callback function which will modify on the fly record's value
     * @var array of callback
     * @since 1.1.6
     */
    protected $modifier = array();

    /**
     * @param callback $function a callback function
     *     the function should accept in parameter the record,
     *     and the resulset object
     * @since 1.1.6
     */
    public function addModifier($function) {
        $this->modifier[] = $function;
    }

    /**
    * set the fetch mode.
    * @param integer  $fetchmode   FETCH_OBJ, FETCH_CLASS or FETCH_INTO
    * @param string|object   $param   class name if FETCH_CLASS, an object if FETCH_INTO. else null.
    * @param array  $ctoargs  arguments for the constructor if FETCH_CLASS
    */
    public function setFetchMode($fetchmode, $param=null, $ctoargs=null){
        $this->_fetchMode = $fetchmode;
        $this->_fetchModeParam = $param;
        $this->_fetchModeCtoArgs = $ctoargs;
    }
    /**
     * fetch a result. The result is returned as an object.
     * @return object|boolean result object or false if there is no more result
     */
    public function fetch(){
        $result = $this->_fetch ();

        if (!$result)
            return $result;

        if (count($this->modifier)) {
            foreach($this->modifier as $m)
                call_user_func_array($m, array($result, $this));
        }

        if ($this->_fetchMode == jDbConnection::FETCH_OBJ)
            return $result;

        if ($this->_fetchMode == jDbConnection::FETCH_CLASS) {
            if ($result instanceof $this->_fetchModeParam)
                return $result;
            $values = get_object_vars ($result);
            $o = $this->_fetchModeParam;
            $result = new $o();
            foreach ( $values as $k=>$value){
                $result->$k = $value;
            }
        }
        else if ($this->_fetchMode == jDbConnection::FETCH_INTO) {
            $values = get_object_vars ($result);
            $result = $this->_fetchModeParam;
            foreach ( $values as $k=>$value){
                $result->$k = $value;
            }
        }
        return $result;
    }

    /**
     * Return all results in an array. Each result is an object.
     * @return array
     */
    public function fetchAll(){
        $result=array();
        while($res =  $this->fetch ()){
            $result[] = $res;
        }
        return $result;
    }

    /**
     * not implemented
     */
    public function getAttribute($attr){return null;}
    /**
     * not implemented
     */
    public function setAttribute($attr, $value){}

    /**
     * not implemented
     */
    abstract public function bindColumn($column, &$param , $type=null );
    /**
     * not implemented
     */
    abstract public function bindParam($parameter, &$variable , $data_type =null, $length=null,  $driver_options=null);
    /**
     * not implemented
     */
    abstract public function bindValue($parameter, $value, $data_type);
    /**
     * not implemented
     */
    abstract public function columnCount();

    /**
     * not implemented
     */
    abstract public function execute($parameters=null);

    abstract public function rowCount();

    abstract protected function _free ();
    abstract protected function _fetch ();
    abstract protected function _rewind ();

    //--------------- interface Iterator
    protected $_currentRecord = false;
    protected $_recordIndex = 0;

    public function current () {
        return $this->_currentRecord;
    }

    public function key () {
        return $this->_recordIndex;
    }

    public function next () {
        $this->_currentRecord =  $this->fetch ();
        if($this->_currentRecord)
            $this->_recordIndex++;
    }

    public function rewind () {
        $this->_rewind();
        $this->_recordIndex = 0;
        $this->_currentRecord =  $this->fetch ();
    }

    public function valid () {
        return ($this->_currentRecord != false);
    }

}

