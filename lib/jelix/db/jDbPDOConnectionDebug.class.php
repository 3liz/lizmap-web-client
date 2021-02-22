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

    public function query($queryString, $fetchmode = PDO::FETCH_OBJ, ...$fetchModeArgs)
    {
        $log = new jSQLLogMessage($queryString);
        if (count($fetchModeArgs) === 0) {
            $rs = parent::query($queryString, $fetchmode);
        }
        else if (count($fetchModeArgs) === 1 || $fetchModeArgs[1] === array()) {
            $rs = parent::query($queryString, $fetchmode, $fetchModeArgs[0]);
        }
        else {
            $rs = parent::query($queryString, $fetchmode, $fetchModeArgs[0], $fetchModeArgs[1]);
        }

        $log->endQuery();
        jLog::log($log, 'sql');
        return $rs;
    }

    public function exec($query) {
        $log = new jSQLLogMessage($query);
        $result = parent::exec($query);
        $log->endQuery();
        jLog::log($log,'sql');
        return $result;
    }
}
