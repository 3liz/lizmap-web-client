<?php
/**
 * @package    jelix
 * @subpackage db_driver
 * @author     Yann Lecommandoux
 * @copyright  2008 Yann Lecommandoux
 * @link     http://www.jelix.org
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

/**
 * driver for jDaoCompiler
 */
class mssqlDaoBuilder extends jDaoGenerator {

    protected $propertiesListForInsert = 'PrimaryFieldsExcludeAutoIncrement';


    protected function genUpdateAutoIncrementPK($pkai, $pTableRealName) {
        return '$record->'.$pkai->name.'= $this->_conn->lastInsertId();';
    }
    

    protected function _encloseName($name){
        return '['.$name.']';
    }
}
