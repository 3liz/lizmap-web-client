<?php
/**
* @package    jelix
* @subpackage db
* @author     Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @copyright  2001-2005 CopixTeam, 2005-2007 Laurent Jouanneau
*
* This class was get originally from the Copix project (CopixDbWidget, Copix 2.3dev20050901, http://www.copix.org)
* Some lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix classes are Gerald Croes and Laurent Jouanneau,
* and this class was adapted/improved for Jelix by Laurent Jouanneau
*
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package  jelix
 * @subpackage db
 */
class jDbWidget {
    /**
    * a jDbConnection object
    */
    private $_conn;

    /**
    * Constructor
    */
    function __construct ($connection){
        $this->_conn = $connection;
    }

    /**
    * Run a query, and return only the first result.
    * @param   string   $query   SQL query (without LIMIT instruction !)
    * @return  object  the object which contains values of the record
    */
    public function  fetchFirst($query){
        $rs     = $this->_conn->limitQuery ($query,0,1);
        $result = $rs->fetch ();
        return $result;
    }

    /**
    * Run a query, and store values of the first result, into an object which has the given class
    * @param   string  $query     SQL query  (without LIMIT instruction !)
    * @param   string  $classname class name of the future object
    * @return  object the object which contains values of the record
    */
    public function fetchFirstInto ($query, $classname){
        $rs     = $this->_conn->query   ($query);
        $rs->setFetchMode(8, $classname);
        $result = $rs->fetch ();
        return $result;
    }

    /**
    * Get all results of a query
    * @param  string   $query   SQL query
    * @param  integer  $limitOffset  the first number of the results or null
    * @param  integer  $limitCount  number of results you want, or null
    * @return  array    array of objects which contains results values
    */
    public function fetchAll($query, $limitOffset=null, $limitCount=null){
        if($limitOffset===null || $limitCount===null){
            $rs = $this->_conn->query ($query);
        }else{
            $rs = $this->_conn->limitQuery ($query, $limitOffset, $limitCount);
        }
        return $rs->fetchAll ();
    }

    /**
    * Get all results of a query and store values into objects which have the given class
    * @param   string   $query   SQL query
    * @param   string  $classname class name of future objects
    * @param  integer  $limitOffset  the first number of the results or null
    * @param  integer  $limitCount  number of results you want, or null
    * @return  array    array of objects which contains results values
    */
    public function fetchAllInto($query, $className, $limitOffset=null, $limitCount=null){
        if($limitOffset===null || $limitCount===null){
            $rs = $this->_conn->query ($query);
        }else{
            $rs = $this->_conn->limitQuery ($query, $limitOffset, $limitCount);
        }
        $result = array();
        if ($rs){
            $rs->setFetchMode(8, $className);
            while($res = $rs->fetch()){
                $result[] = $res;
            }
        }
        return $result;
    }
}
