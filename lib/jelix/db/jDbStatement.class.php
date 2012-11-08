<?php
/**
* @package    jelix
* @subpackage db
* @author      Florian Lonqueu-Brochard
* @copyright  2012 Florian Lonqueu-Brochard
* @link      http://www.jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

abstract class jDbStatement {

    protected $_stmt=null;

    function __construct ($stmt) {
        $this->_stmt = $stmt;
    }

    function __destruct(){
        if ($this->_stmt){
            $this->_free ();
            $this->_stmt = null;
        }
    }

    public function getAttribute($attr){return null;}

    public function setAttribute($attr, $value){}

    abstract public function execute();

    abstract public function bindParam();

    abstract protected function _free ();
}

