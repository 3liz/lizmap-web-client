<?php
/**
* @package    jelix
* @subpackage db
* @author     Laurent Jouanneau
* @copyright  2012 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * A connection object based on PDO, for debugging
 * @package  jelix
 * @subpackage db
 */
class jDbPDOConnectionDebug extends jDbPDOConnection {

    public function query() {
        $args = func_get_args();

        switch (count($args)) {
        case 1:
            $log = new jSQLLogMessage($args[0]);
            $rs = parent::query($args[0]);
            $log->endQuery();
            jLog::log($log,'sql');
            $rs->setFetchMode(PDO::FETCH_OBJ);
            return $rs;
        case 2:
            $log = new jSQLLogMessage($args[0]);
            $result = parent::query($args[0], $args[1]);
            $log->endQuery();
            jLog::log($log,'sql');
            return $result;
        case 3:
            $log = new jSQLLogMessage($args[0]);
            $result = parent::query($args[0], $args[1], $args[2]);
            $log->endQuery();
            jLog::log($log,'sql');
            return $result;
        default:
            throw new Exception('jDbPDOConnectionDebug: bad argument number in query');
        }
    }

    public function exec($query) {
        $log = new jSQLLogMessage($query);
        $result = parent::exec($query);
        $log->endQuery();
        jLog::log($log,'sql');
        return $result;
    }
}
