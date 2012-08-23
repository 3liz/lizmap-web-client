<?php
/**
* @package    jelix
* @subpackage db_driver
* @author     Laurent Jouanneau
* @contributor Gwendal Jouannic
* @copyright  2007-2009 Laurent Jouanneau
* @link      http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * driver for jDaoCompiler
 * @package    jelix
 * @subpackage db_driver
 */
class ociDaoBuilder extends jDaoGenerator {

    protected $aliasWord = ' ';
    protected $propertiesListForInsert = 'PrimaryFieldsExcludeAutoIncrement';

    protected function buildOuterJoins(&$tables, $primaryTableName){
        $sqlFrom = '';
        $sqlWhere ='';
        foreach($this->_dataParser->getOuterJoins() as $tablejoin){
            $table= $tables[$tablejoin[0]];
            $tablename = $this->_encloseName($table['name']);

            $r = $this->_encloseName($table['realname']).' '.$tablename;

            $fieldjoin='';

            if($tablejoin[1] == 0){
                $operand='='; $opafter='(+)';
            }elseif($tablejoin[1] == 1){
                $operand='(+)='; $opafter='';
            }
            foreach($table['fk'] as $k => $fk){
                $fieldjoin.=' AND '.$primaryTableName.'.'.$this->_encloseName($fk).$operand.$tablename.'.'.$this->_encloseName($table['pk'][$k]).$opafter;
            }
            $sqlFrom.=', '.$r;
            $sqlWhere.=$fieldjoin;
        }
        return array($sqlFrom, $sqlWhere);
    }

    protected function buildSelectPattern ($pattern, $table, $fieldname, $propname ){
        if ($pattern =='%s'){
            if ($fieldname != $propname){
                $field = $table.$this->_encloseName($fieldname).' "'.$propname.'"';
            }else{
                $field = $table.$this->_encloseName($fieldname);
            }
        }else{
            $field = str_replace(array("'", "%s"), array("\\'",$table.$this->_encloseName($fieldname)),$pattern).' "'.$propname.'"';
        }
        return $field;
    }

    /*
     * Replaces the lastInsertId which doesn't work with oci
     */
    protected function buildUpdateAutoIncrementPK($pkai) {
        return '          $record->'.$pkai->name.'= $this->_conn->query(\'SELECT '.$pkai->sequenceName.'.currval as '.$pkai->name.' from dual\')->fetch()->'.$pkai->name.';';
    }

}
