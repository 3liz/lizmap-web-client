<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Laurent Jouanneau
* @copyright  2007-2010 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * driver for jDaoCompiler
 * @package    jelix
 * @subpackage db_driver
 */
class pgsqlDaoBuilder extends jDaoGenerator {

    protected $propertiesListForInsert = 'PrimaryFieldsExcludeAutoIncrement';

    protected function buildUpdateAutoIncrementPK($pkai) {
        return '          $record->'.$pkai->name.'= $this->_conn->lastInsertId(\''.$pkai->sequenceName.'\');';
    }

    protected function getAutoIncrementPKField ($using = null){
        if ($using === null){
            $using = $this->_dataParser->getProperties ();
        }

        $tb = $this->_dataParser->getTables();
        $tb = $tb[$this->_dataParser->getPrimaryTable()]['realname'];

        foreach ($using as $id=>$field) {
            if(!$field->isPK)
                continue;
            if ($field->autoIncrement) {
               if(!strlen($field->sequenceName)){
                  $field->sequenceName = $tb.'_'.$field->name.'_seq';
               }
               return $field;
            }
        }
        return null;
    }

    protected function buildEndOfClass() {
        $fields = $this->_getPropertiesBy('BinaryField');
        if (count($fields)) {

            $src = '    protected function finishInitResultSet($rs) {
        $rs->setFetchMode(8,$this->_DaoRecordClassName);
        $rs->addModifier(array($this, \'unescapeRecord\'));
    }'."\n";

            // we build the callback function for the resultset, to unescape
            // binary fields.
            $src .= 'public function unescapeRecord($record, $resultSet) {'."\n";
            foreach ($fields as $f) {
                $src .= '$record->'.$f->name.' = $resultSet->unescapeBin($record->'.$f->name.");\n";
            }
            $src .= '}';
            return $src;
        }
        return '';
    }
}
