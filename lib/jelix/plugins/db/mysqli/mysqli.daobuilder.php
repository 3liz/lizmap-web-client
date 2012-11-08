<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Laurent Jouanneau
* @copyright  2007-2009 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * driver for jDaoCompiler
 * @package    jelix
 * @subpackage db_driver
 */
class mysqliDaoBuilder extends jDaoGenerator {

    protected $propertiesListForInsert = 'PrimaryFieldsExcludeAutoIncrement';

}
