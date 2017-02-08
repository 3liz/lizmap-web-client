<?php
/**
* @package     jelix
* @subpackage  db
* @author      Laurent Jouanneau
* @contributor Yannick Le Guédart, Laurent Raufaste, Julien Issler
* @contributor Christophe Thiriot
* @copyright   2005-2012 Laurent Jouanneau, 2008 Laurent Raufaste
* @copyright   2011 Julien Issler
*
* API ideas of this class were get originally from the Copix project (CopixDbFactory, Copix 2.3dev20050901, http://www.copix.org)
* No lines of code are copyrighted by CopixTeam
*
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 */
require(JELIX_LIB_PATH.'db/jDbConnection.class.php');
require(JELIX_LIB_PATH.'db/jDbResultSet.class.php');

/**
 * class that handles a sql query for a logger
 */
class jSQLLogMessage extends jLogMessage {

    protected $startTime = 0;
    protected $endTime = 0;
    protected $trace = array();
    public $originalQuery = '';

    public function __construct($message) {
        $this->category = 'sql';
        $this->message = $message;
        $this->startTime = microtime(true);

        $this->trace = debug_backtrace();
        array_shift($this->trace); // remove the current __construct call
    }

    public function setRealQuery($sql) {
        $this->originalQuery = $this->message;
        $this->message = $sql;
    }

    public function endQuery() {
        $this->endTime = microtime(true);
    }

    public function getTrace() {
        return $this->trace;
    }

    public function getTime() {
        return $this->endTime - $this->startTime;
    }

    public function getDao() {
        foreach ($this->trace as $t) {
            if (isset($t['class'])) {
                $dao = '';
                $class = $t['class'];
                if ($class == 'jDaoFactoryBase') {
                    if (isset($t['object'])) {
                        $class = get_class($t['object']);
                    }
                    else {
                        $class = 'jDaoFactoryBase';
                        $dao = 'unknow dao, jDaoFactoryBase';
                    }
                }
                if(preg_match('/^cDao_(.+)_Jx_(.+)_Jx_(.+)$/', $class, $m)) {
                    $dao = $m[1].'~'.$m[2];
                }
                if ($dao && isset($t['function'])) {
                    $dao.= '::'.$t['function'].'()';
                }
                if($dao)
                    return $dao;
            }
        }
        return '';
    }

    public function getFormatedMessage() {
        $message = $this->message."\n".$this->getTime().'ms';
        $dao = $this->getDao();
        if ($dao)
            $message.=', from dao:'.$dao."\n";
        if ($this->message != $this->originalQuery)
            $message.= 'Original query: '.$this->originalQuery."\n";

        $traceLog="";
        foreach($this->trace as $k=>$t){
            $traceLog.="\n\t$k\t".(isset($t['class'])?$t['class'].$t['type']:'').$t['function']."()\t";
            $traceLog.=(isset($t['file'])?$t['file']:'[php]').' : '.(isset($t['line'])?$t['line']:'');
        }

        return $message.$traceLog;
    }
}


/**
 * factory for database connector and other db utilities
 * @package  jelix
 * @subpackage db
 */
class jDb {

    /**
    * return a database connector. It uses a temporay pool of connection to reuse
    * currently opened connections.
    *
    * @param string  $name  profile name to use. if empty, use the default one
    * @return jDbConnection  the connector
    */
    public static function getConnection ($name = '') {
        return jProfiles::getOrStoreInPool('jdb', $name, array('jDb', '_createConnector'));
    }

    /**
     * create a new jDbWidget
     * @param string  $name  profile name to use. if empty, use the default one
     * @return jDbWidget
     */
    public static function getDbWidget ($name = null) {
        $dbw = new jDbWidget(self::getConnection($name));
        return $dbw;
    }

    /**
     * call it to test a profile (during an install for example)
     * @param array  $profile  profile properties
     * @return boolean  true if properties are ok
     */
    public function testProfile ($profile) {
        try {
            self::_createConnector ($profile);
            $ok = true;
        }
        catch(Exception $e) {
            $ok = false;
        }
        return $ok;
    }

    /**
     * create a connector. internal use (callback method for jProfiles)
     * @param array $profile profile properties
     * @return jDbConnection|jDbPDOConnection database connector
     * @throws jException
     */
    public static function _createConnector ($profile) {
        if ($profile['driver'] == 'pdo' || (isset($profile['usepdo']) && $profile['usepdo'])) {
            /*
            */
            $dbh = new jDbPDOConnectionDebug($profile);
            return $dbh;
        }
        else {
            $dbh = jApp::loadPlugin($profile['driver'], 'db', '.dbconnection.php', $profile['driver'].'DbConnection', $profile);
            if (is_null($dbh))
                throw new jException('jelix~db.error.driver.notfound', $profile['driver']);
            return $dbh;
        }
    }

    /**
     * perform a convertion float to str. It takes care about the decimal separator
     * which should be a '.' for SQL. Because when doing a native convertion float->str,
     * PHP uses the local decimal separator, and so, we don't want that.
     * @since 1.1.11
     */
    public static function floatToStr($value) {
        if (is_float($value)) {// this is a float
            return rtrim(rtrim(sprintf("%.20F", $value), "0"), '.'); // %F to not format with the local decimal separator
        }
        else if (is_integer($value)) {
            return sprintf('%d', $value);
        }
        // this is probably a string, so we expect that it contains a numerical value
        // is_numeric is true if the separator is ok for SQL
        // (is_numeric doesn't accept thousand separators nor other character than '.' as decimal separator)
        else if (is_numeric($value)) {
            return $value;
        }

        // we probably have a malformed float number here
        // if so, floatval will ignore all character after an invalid character (a ',' for example)
        // no warning, no exception here, to keep the same behavior of previous Jelix version
        // in order to no break stable applications.
        // FIXME: do a warning in next versions (> 1.2)
        return (string)(floatval($value));
    }
}
