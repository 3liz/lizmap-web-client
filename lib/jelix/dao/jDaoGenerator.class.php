<?php
/**
* @package    jelix
* @subpackage dao
* @author     Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @contributor Bastien Jaillot (bug fix)
* @contributor Julien Issler, Guillaume Dugas
* @contributor Philippe Villiers
* @copyright  2001-2005 CopixTeam, 2005-2012 Laurent Jouanneau
* @copyright  2007-2008 Julien Issler
* This class was get originally from the Copix project (CopixDAOGeneratorV1, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix class are Gerald Croes and Laurent Jouanneau,
* and this class was rewrited for Jelix by Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
* This is a generator which creates php class from dao xml file.
*
* It is called by jDaoCompiler
* @package  jelix
* @subpackage dao
* @see jDaoCompiler
*/
class jDaoGenerator {

    /**
    * the dao definition.
    * @var jDaoParser
    */
    protected $_dataParser = null;

    /**
    * The DaoRecord ClassName
    * @var string
    */
    protected $_DaoRecordClassName = null;

    /**
    * the DAO classname
    * @var string
    */
    protected $_DaoClassName = null;

    protected $propertiesListForInsert = 'PrimaryTable';

    protected $aliasWord = ' AS ';

    /**
     * @var jDbTools
    */
    protected $tools;

    protected $_daoId;
    protected $_daoPath;
    protected $_dbType;

    /**
     * the real name of the main table
     */
    protected $tableRealName = '';

    /**
     * the real name of the main table, escaped in SQL
     * so it is ready to include into a SQL query.
     */
    protected $tableRealNameEsc = '';
    
    protected $sqlWhereClause = '';
    
    protected $sqlFromClause = '';
    
    protected $sqlSelectClause = '';

    /**
    * constructor
     * @param jSelectorDao $selector
     * @param jDbTools $tools
    * @param jDaoParser $daoParser
    */
    function __construct($selector, $tools, $daoParser){
        $this->_daoId = $selector->toString();
        $this->_daoPath = $selector->getPath();
        $this->_dbType = $selector->driver;
        $this->_dataParser = $daoParser;
        $this->_DaoClassName = $selector->getDaoClass();
        $this->_DaoRecordClassName = $selector->getDaoRecordClass();
        $this->tools = $tools;
    }

    /**
    * build all classes
    */
    public function buildClasses () {

        $src = array();
        $src[] = ' require_once ( JELIX_LIB_PATH .\'dao/jDaoRecordBase.class.php\');';
        $src[] = ' require_once ( JELIX_LIB_PATH .\'dao/jDaoFactoryBase.class.php\');';

        // prepare some values to generate properties and methods

        $this->buildFromWhereClause();
        $this->sqlSelectClause   = $this->buildSelectClause();

        $tables            = $this->_dataParser->getTables();
        $pkFields          = $this->_getPrimaryFieldsList();
        $this->tableRealName    = $tables[$this->_dataParser->getPrimaryTable()]['realname'];
        $this->tableRealNameEsc = $this->_encloseName('\'.$this->_conn->prefixTable(\''.$this->tableRealName.'\').\'');

        $sqlPkCondition    = $this->buildSimpleConditions($pkFields);
        if ($sqlPkCondition != '') {
            $sqlPkCondition= ($this->sqlWhereClause !='' ? ' AND ':' WHERE ').$sqlPkCondition;
        }

        //-----------------------
        // Build the record class
        //-----------------------
        $userRecord = $this->_dataParser->getUserRecord();
        if ($userRecord) {
            $src[] = ' require_once (\''.$userRecord->getPath().'\');';
            $extendedObject = $userRecord->resource . 'DaoRecord';
        }
        else {
            $extendedObject = 'jDaoRecordBase';
        }

        $src[] = "\nclass ".$this->_DaoRecordClassName.' extends '.$extendedObject.' {';

        $properties=array();

        foreach ($this->_dataParser->getProperties() as $id=>$field) {
            $properties[$id] = get_object_vars($field);
            if ($field->defaultValue !== null) {
                $src[] =' public $'.$id.'='.var_export($field->defaultValue, true).';';
            }
            else
                $src[] =' public $'.$id.';';
        }

        $src[] = '   public function getSelector() { return "'.$this->_daoId.'"; }';

        $src[] = '   public function getProperties() { return '.$this->_DaoClassName.'::$_properties; }';
        $src[] = '   public function getPrimaryKeyNames() { return '.$this->_DaoClassName.'::$_pkFields; }';
        $src[] = '}';

        //--------------------
        // Build the dao class
        //--------------------

        $src[] = "\nclass ".$this->_DaoClassName.' extends jDaoFactoryBase {';
        $src[] = '   protected $_tables = '.var_export($tables, true).';';
        $src[] = '   protected $_primaryTable = \''.$this->_dataParser->getPrimaryTable().'\';';
        $src[] = '   protected $_selectClause=\''.$this->sqlSelectClause.'\';';
        $src[] = '   protected $_fromClause;';
        $src[] = '   protected $_whereClause=\''.$this->sqlWhereClause.'\';';
        $src[] = '   protected $_DaoRecordClassName=\''.$this->_DaoRecordClassName.'\';';
        $src[] = '   protected $_daoSelector = \''.$this->_daoId.'\';';

        if($this->tools->trueValue != '1'){
            $src[]='   protected $trueValue ='.var_export($this->tools->trueValue, true).';';
            $src[]='   protected $falseValue ='.var_export($this->tools->falseValue, true).';';
        }

        if($this->_dataParser->hasEvent('deletebefore') || $this->_dataParser->hasEvent('delete'))
            $src[] = '   protected $_deleteBeforeEvent = true;';
        if ($this->_dataParser->hasEvent('deleteafter') || $this->_dataParser->hasEvent('delete'))
            $src[] = '   protected $_deleteAfterEvent = true;';
        if ($this->_dataParser->hasEvent('deletebybefore') || $this->_dataParser->hasEvent('deleteby'))
            $src[] = '   protected $_deleteByBeforeEvent = true;';
        if ($this->_dataParser->hasEvent('deletebyafter') || $this->_dataParser->hasEvent('deleteby'))
            $src[] = '   protected $_deleteByAfterEvent = true;';

        $src[] = '   public static $_properties = '.var_export($properties, true).';';
        $src[] = '   public static $_pkFields = array('.$this->_writeFieldNamesWith ($start = '\'', $end='\'', $beetween = ',', $pkFields).');';

        $src[] = ' ';
        $src[] = 'public function __construct($conn){';
        $src[] = '   parent::__construct($conn);';
        $src[] = '   $this->_fromClause = \''.$this->sqlFromClause.'\';';
        $src[] = '}';

        $src[] = ' ';
        $src[] = ' protected function _getPkWhereClauseForSelect($pk){';
        $src[] = '   extract($pk);';
        $src[] = ' return \''.$sqlPkCondition.'\';';
        $src[] = '}';

        $src[] = ' ';
        $src[] = 'protected function _getPkWhereClauseForNonSelect($pk){';
        $src[] = '   extract($pk);';
        $src[] = '   return \' where '.$this->buildSimpleConditions($pkFields,'',false).'\';';
        $src[] = '}';

        //----- Insert method

        $src[] = $this->buildInsertMethod($pkFields);

        //-----  update method

        $src[] = $this->buildUpdateMethod($pkFields);

        //----- other user methods

        $src[] = $this->buildUserMethods();

        $src[] = $this->buildEndOfClass();

        $src[] = '}';//end of class

        return implode("\n",$src);
    }

    /**
     * build the insert() method in the final class
     * @return string the source of the method
     */
    protected function buildInsertMethod($pkFields) {
        $pkai = $this->getAutoIncrementPKField();
        $src = array();
        $src[] = 'public function insert ($record){';

        if($pkai !== null){
            // if there is an autoincrement field as primary key

            // if a value is given for the autoincrement field, then with do a full insert
            $src[]=' if($record->'.$pkai->name.' > 0 ){';
            $src[] = '    $query = \'INSERT INTO '.$this->tableRealNameEsc.' (';
            $fields = $this->_getPropertiesBy('PrimaryTable');
            list($fields, $values) = $this->_prepareValues($fields,'insertPattern', 'record->');

            $src[] = implode(',',$fields);
            $src[] = ') VALUES (';
            $src[] = implode(', ',$values);
            $src[] = ")';";

            $src[] = '}else{';

            $fields = $this->_getPropertiesBy($this->propertiesListForInsert);
        }else{
            $fields = $this->_getPropertiesBy('PrimaryTable');
        }

        if($this->_dataParser->hasEvent('insertbefore') || $this->_dataParser->hasEvent('insert')){
            $src[] = '   jEvent::notify("daoInsertBefore", array(\'dao\'=>$this->_daoSelector, \'record\'=>$record));';
        }
        
        // if there isn't a autoincrement as primary key, then we do a full insert.
        // if there isn't a value for the autoincrement field and if this is a mysql/sqlserver and pgsql,
        // we do an insert without given primary key. In other case, we do a full insert.

        $src[] = '    $query = \'INSERT INTO '.$this->tableRealNameEsc.' (';

        list($fields, $values) = $this->_prepareValues($fields,'insertPattern', 'record->');

        $src[] = implode(',',$fields);
        $src[] = ') VALUES (';
        $src[] = implode(', ',$values);
        $src[] = ")';";

        if($pkai !== null)
            $src[] = '}';

        $src[] = '   $result = $this->_conn->exec ($query);';

        if($pkai !== null){
            $src[] = '   if(!$result)';
            $src[] = '       return false;';

            $src[] = '   if($record->'.$pkai->name.' < 1 ) ';
            $src[] = $this->buildUpdateAutoIncrementPK($pkai);
        }

        // we generate a SELECT query to update field on the record object, which are autoincrement or calculated
        $fields = $this->_getPropertiesBy('FieldToUpdate');
        if (count($fields)) {
            $result = array();
            foreach ($fields as $id=>$prop){
                $result[]= $this->buildSelectPattern($prop->selectPattern, '', $prop->fieldName, $prop->name);
            }

            $sql = 'SELECT '.(implode (', ',$result)). ' FROM '.$this->tableRealNameEsc.' WHERE ';
            $sql.= $this->buildSimpleConditions($pkFields, 'record->', false);

            $src[] = '  $query =\''.$sql.'\';';
            $src[] = '  $rs  =  $this->_conn->query ($query);';
            $src[] = '  $newrecord =  $rs->fetch ();';
            foreach ($fields as $id=>$prop){
                $src[] = '  $record->'.$prop->name.' = $newrecord->'.$prop->name.';';
            }
        }

        if($this->_dataParser->hasEvent('insertafter') || $this->_dataParser->hasEvent('insert')){
            $src[] = '   jEvent::notify("daoInsertAfter", array(\'dao\'=>$this->_daoSelector, \'record\'=>$record));';
        }

        $src[] = '    return $result;';
        $src[] = '}';

        return implode("\n",$src);
    }

    /**
     * build the update() method for the final class
     * @return string the source of the method
     */
    protected function buildUpdateMethod($pkFields) {
        $src = array();
        
        $src[] = 'public function update ($record){';
        list($fields, $values) = $this->_prepareValues($this->_getPropertiesBy('PrimaryFieldsExcludePk'),'updatePattern', 'record->');
        
        if(count($fields)){
        	
            if($this->_dataParser->hasEvent('updatebefore') || $this->_dataParser->hasEvent('update')){
                $src[] = '   jEvent::notify("daoUpdateBefore", array(\'dao\'=>$this->_daoSelector, \'record\'=>$record));';
            }
            
        	$src[] = '   $query = \'UPDATE '.$this->tableRealNameEsc.' SET ';
            $sqlSet='';
            foreach($fields as $k=> $fname){
                $sqlSet.= ', '.$fname. '= '. $values[$k];
            }
            $src[] = substr($sqlSet,1);

            $sqlCondition = $this->buildSimpleConditions($pkFields, 'record->', false);
            if($sqlCondition!='')
                $src[] = ' where '.$sqlCondition;

            $src[] = "';";

            $src[] = '   $result = $this->_conn->exec ($query);';

            // we generate a SELECT query to update field on the record object, which are autoincrement or calculated
            $fields = $this->_getPropertiesBy('FieldToUpdateOnUpdate');
            if (count($fields)) {
                $result = array();
                foreach ($fields as $id=>$prop){
                    $result[]= $this->buildSelectPattern($prop->selectPattern, '', $prop->fieldName, $prop->name);
                }

                $sql = 'SELECT '.(implode (', ',$result)). ' FROM '.$this->tableRealNameEsc.' WHERE ';
                $sql.= $this->buildSimpleConditions($pkFields, 'record->', false);

                $src[] = '  $query =\''.$sql.'\';';
                $src[] = '  $rs  =  $this->_conn->query ($query, jDbConnection::FETCH_INTO, $record);';
                $src[] = '  $record =  $rs->fetch ();';
            }

            if($this->_dataParser->hasEvent('updateafter') || $this->_dataParser->hasEvent('update'))
                $src[] = '   jEvent::notify("daoUpdateAfter", array(\'dao\'=>$this->_daoSelector, \'record\'=>$record));';

            $src[] = '   return $result;';
        }else{
            //the dao is mapped on a table which contains only primary key : update is impossible
            // so we will generate an error on update
            $src[] = "     throw new jException('jelix~dao.error.update.impossible',array('".$this->_daoId."','".$this->_daoPath."'));";
        }

        $src[] = ' }';//ends the update function
        return implode("\n",$src);
    }

    /**
     * build all methods defined by the developer in the dao file
     * @return string the source of the methods
     */
    protected function buildUserMethods() {
        
        $allField = $this->_getPropertiesBy('All');
        $primaryFields = $this->_getPropertiesBy('PrimaryTable');
        $src = array();

        foreach($this->_dataParser->getMethods() as $name=>$method){

            $defval = $method->getParametersDefaultValues();
            if(count($defval)){
                $mparam='';
                foreach($method->getParameters() as $param){
                    $mparam.=', $'.$param;
                    if(isset($defval[$param]))
                        $mparam.='=\''.str_replace("'","\'",$defval[$param]).'\'';
                }
                $mparam = substr($mparam,1);
            }else{
                $mparam=implode(', $',$method->getParameters());
                if($mparam != '') $mparam ='$'.$mparam;
            }

            $src[] = ' function '.$method->name.' ('. $mparam.'){';

            $limit='';

            switch($method->type){
                case 'delete':
                    $this->buildDeleteUserQuery($method, $src, $primaryFields);
                    break;
                case 'update':
                    $this->buildUpdateUserQuery($method, $src, $primaryFields);
                    break;
                case 'php':
                    $src[] = $method->getBody();
                    $src[] = '}';
                    break;

                case 'count':
                    $this->buildCountUserQuery($method, $src, $allField);
                    break;
                case 'selectfirst':
                case 'select':
                default:
                    $limit = $this->buildSelectUserQuery($method, $src, $allField);
            }

            if($method->type == 'php')
                continue;


            switch($method->type){
                case 'delete':
                case 'update' :
                    if ($method->eventBeforeEnabled || $method->eventAfterEnabled) {
                        $src[] = '   $args = func_get_args();';
                        $methname = ($method->type == 'update'?'Update':'Delete');
                        if ($method->eventBeforeEnabled) {
                            $src[] = '   jEvent::notify("daoSpecific'.$methname.'Before", array(\'dao\'=>$this->_daoSelector,\'method\'=>\''.
                            $method->name.'\', \'params\'=>$args));';
                        }
                        if ($method->eventAfterEnabled) {
                            $src[] = '   $result = $this->_conn->exec ($__query);';
                            $src[] = '   jEvent::notify("daoSpecific'.$methname.'After", array(\'dao\'=>$this->_daoSelector,\'method\'=>\''.
                                $method->name.'\', \'params\'=>$args));';
                            $src[] = '   return $result;';
                        } else {
                            $src[] = '    return $this->_conn->exec ($__query);';
                        }
                    } else {
                        $src[] = '    return $this->_conn->exec ($__query);';
                    }
                    break;
                case 'count':
                    $src[] = '    $__rs = $this->_conn->query($__query);';
                    $src[] = '    $__res = $__rs->fetch();';
                    $src[] = '    return intval($__res->c);';
                    break;
                case 'selectfirst':
                    $src[] = '    $__rs = $this->_conn->limitQuery($__query,0,1);';
                    $src[] = '    $this->finishInitResultSet($__rs);';
                    $src[] = '    return $__rs->fetch();';
                    break;
                case 'select':
                default:
                    if($limit)
                        $src[] = '    $__rs = $this->_conn->limitQuery($__query'.$limit.');';
                    else
                        $src[] = '    $__rs = $this->_conn->query($__query);';
                    $src[] = '    $this->finishInitResultSet($__rs);';
                    $src[] = '    return $__rs;';
            }
            $src[] = '}';
        }
        return implode("\n",$src);
    }

    /**
     *
     */
    protected function buildDeleteUserQuery($method, &$src, &$primaryFields) {
        $src[] = '    $__query = \'DELETE FROM '.$this->tableRealNameEsc.' \';';
        $cond = $method->getConditions();
        if($cond !== null) {
            $sqlCond = $this->buildConditions($cond, $primaryFields, $method->getParameters(), false);
            if(trim($sqlCond) != '')
                $src[] = '$__query .=\' WHERE '.$sqlCond."';";
        }
    }

    /**
     *
     */
    protected function buildUpdateUserQuery($method, &$src, &$primaryFields) {
        $src[] = '    $__query = \'UPDATE '.$this->tableRealNameEsc.' SET ';
        $updatefields = $this->_getPropertiesBy('PrimaryFieldsExcludePk');
        $sqlSet='';

        foreach($method->getValues() as $propname=>$value){
            if($value[1]){
                preg_match_all('/\$([a-zA-Z0-9_]+)/', $value[0], $varMatches, PREG_OFFSET_CAPTURE );
                $parameters = $method->getParameters();
                if (count($varMatches[0])) {
                    $result = '';
                    $len = 0;
                    foreach($varMatches[1] as $k=>$var) {
                        $result .= substr($value[0], $len, $len+$varMatches[0][$k][1]);
                        $len += $varMatches[0][$k][1] + strlen($varMatches[0][$k][0]);
                        if (in_array($var[0], $parameters)) {
                            $result .= '\'.'.$this->_preparePHPExpr($varMatches[0][$k][0], $updatefields[$propname],true).'.\'';
                        }
                        else {
                            $result .= $varMatches[0][$k][0];
                        }
                    }
                    $value[0] = $result;
                }
                $sqlSet.= ', '.$this->_encloseName($updatefields[$propname]->fieldName). '= '. $value[0];
            }else{
                $sqlSet.= ', '.$this->_encloseName($updatefields[$propname]->fieldName). '= '.
                    $this->tools->escapeValue($updatefields[$propname]->unifiedType, $value[0], false, true);
            }
        }
        $src[] = substr($sqlSet,1).'\';';
        $cond = $method->getConditions();
        if($cond !== null) {
            $sqlCond = $this->buildConditions($cond, $primaryFields, $method->getParameters(), false);
            if(trim($sqlCond) != '')
                $src[] = '$__query .=\' WHERE '.$sqlCond."';";
        }
    }

    /**
     *
     */
    protected function buildCountUserQuery($method, &$src, &$allField) {
        if ($method->distinct !='') {
            $properties = $this->_dataParser->getProperties ();
            $tables = $this->_dataParser->getTables();
            $prop = $properties[$method->distinct];
            $count=' DISTINCT '.$this->_encloseName($tables[$prop->table]['name']) .'.'.$this->_encloseName($prop->fieldName);
        }
        else {
            $count='*';
        }
        $src[] = '    $__query = \'SELECT COUNT('.$count.') as c \'.$this->_fromClause.$this->_whereClause;';
        $glueCondition = ($this->sqlWhereClause !='' ? ' AND ':' WHERE ');

        $cond = $method->getConditions();
        if($cond !== null) {
            $sqlCond = $this->buildConditions($cond, $allField, $method->getParameters(), true);
            if(trim($sqlCond) != '')
                $src[] = '$__query .=\''.$glueCondition.$sqlCond."';";
        }
    }

    /**
     *
     */
    protected function buildSelectUserQuery($method, &$src, &$allField) {
        $limit = '';
        if($method->distinct !=''){
            $select = '\''.$this->buildSelectClause($method->distinct).'\'';
        }
        else{
            $select=' $this->_selectClause';
        }
        $src[] = '    $__query = '.$select.'.$this->_fromClause.$this->_whereClause;';
        $glueCondition = ($this->sqlWhereClause !='' ? ' AND ':' WHERE ');
        if( $method->type == 'select' && ($lim = $method->getLimit ()) !==null){
            $limit =', '.$lim['offset'].', '.$lim['count'];
        }

        $sqlCond = $this->buildConditions($method->getConditions(), $allField, $method->getParameters(), true, $method->getGroupBy());

        if(trim($sqlCond) != '')
            $src[] = '$__query .=\''.$glueCondition.$sqlCond."';";

        return $limit;
    }


    /**
    * create FROM clause and WHERE clause for all SELECT query
    */
    protected function buildFromWhereClause(){

        $tables = $this->_dataParser->getTables();

        foreach($tables as $table_name => $table){
            $tables[$table_name]['realname'] = '\'.$this->_conn->prefixTable(\''.$table['realname'].'\').\'';
        }

        $primarytable = $tables[$this->_dataParser->getPrimaryTable()];
        $ptrealname = $this->_encloseName($primarytable['realname']);
        $ptname = $this->_encloseName($primarytable['name']);

        list($sqlFrom, $sqlWhere) = $this->buildOuterJoins($tables, $ptname);

        $sqlFrom =$ptrealname.$this->aliasWord.$ptname.$sqlFrom;

        foreach($this->_dataParser->getInnerJoins() as $tablejoin){
            $table= $tables[$tablejoin];
            $tablename = $this->_encloseName($table['name']);
            $sqlFrom .=', '.$this->_encloseName($table['realname']).$this->aliasWord.$tablename;

            foreach($table['fk'] as $k => $fk){
                $sqlWhere.=' AND '.$ptname.'.'.$this->_encloseName($fk).'='.$tablename.'.'.$this->_encloseName($table['pk'][$k]);
            }
        }

        $this->sqlWhereClause = ($sqlWhere !='' ? ' WHERE '.substr($sqlWhere,4) :'');
        $this->sqlFromClause = ' FROM '.$sqlFrom;
    }

    /**
     * generates the part of the FROM clause for outer joins
     * @return array  [0]=> the part of the FROM clause, [1]=> the part to add to the WHERE clause when needed
     */
    protected function buildOuterJoins(&$tables, $primaryTableName){
        $sqlFrom = '';
        foreach($this->_dataParser->getOuterJoins() as $tablejoin){
            $table= $tables[$tablejoin[0]];
            $tablename = $this->_encloseName($table['name']);

            $r =$this->_encloseName($table['realname']).$this->aliasWord.$tablename;

            $fieldjoin='';
            foreach($table['fk'] as $k => $fk){
                $fieldjoin.=' AND '.$primaryTableName.'.'.$this->_encloseName($fk).'='.$tablename.'.'.$this->_encloseName($table['pk'][$k]);
            }
            $fieldjoin=substr($fieldjoin,4);

            if($tablejoin[1] == 0){
                $sqlFrom.=' LEFT JOIN '.$r.' ON ('.$fieldjoin.')';
            }elseif($tablejoin[1] == 1){
                $sqlFrom.=' RIGHT JOIN '.$r.' ON ('.$fieldjoin.')';
            }
        }
        return array($sqlFrom, '');
    }

    /**
    * build a SELECT clause for all SELECT queries
    * @return string the select clause.
    */
    protected function buildSelectClause ($distinct=false){
        $result = array();

        $tables = $this->_dataParser->getTables();
        foreach ($this->_dataParser->getProperties () as $id=>$prop){

            $table = $this->_encloseName($tables[$prop->table]['name']) .'.';

            if ($prop->selectPattern !=''){
                $result[]= $this->buildSelectPattern($prop->selectPattern, $table, $prop->fieldName, $prop->name);
            }
        }

        return 'SELECT '.($distinct?'DISTINCT ':'').(implode (', ',$result));
    }

    /**
     * build an item for the select clause
    */
    protected function buildSelectPattern ($pattern, $table, $fieldname, $propname ){
        if ($pattern =='%s'){
            $field = $table.$this->_encloseName($fieldname);
            if ($fieldname != $propname){
                $field .= ' as '.$this->_encloseName($propname);    
            }
        }else{
            $field = str_replace(array("'", "%s"), array("\\'",$table.$this->_encloseName($fieldname)),$pattern).' as '.$this->_encloseName($propname);
        }
        return $field;
    }

    protected function buildEndOfClass() {
        return '';
    }

    /**
    * format field names with a start, an end and a between strings.
    *
    * ex: give 'name' as $info, it will output the result of $field->name
     *
    * @param string   $info    property to get from objects in $using
    * @param string   $start   string to add before the info
    * @param string   $end     string to add after the info
    * @param string   $beetween string to add between each info
    * @param jDaoProperty[]    $using     list of jDaoProperty object. if null, get default fields list
    * @see  jDaoProperty
     * @return string list of field names seperated by the $between character
    */
    protected function _writeFieldsInfoWith ($info, $start = '', $end='', $beetween = '', $using = null){
        $result = array();
        if ($using === null){
            //if no fields are provided, using _dataParser's as default.
            $using = $this->_dataParser->getProperties ();
        }

        foreach ($using as $id=>$field){
            $result[] = $start . $field->$info . $end;
        }

        return implode ($beetween, $result);
    }

    /**
    * format field names with start, end and between strings.
    */
    protected function _writeFieldNamesWith ($start = '', $end='', $beetween = '', $using = null){
        return $this->_writeFieldsInfoWith ('name', $start, $end, $beetween, $using);
    }

    protected function _getPrimaryFieldsList() {
        $tables            = $this->_dataParser->getTables();
        $pkFields          = array();

        $primTable = $tables[$this->_dataParser->getPrimaryTable()];
        $props  = $this->_dataParser->getProperties();
        // we want to have primary keys as the same order indicated into primarykey attr
        foreach($primTable['pk'] as $pkname) {
            foreach($primTable['fields'] as $f){
                if ($props[$f]->fieldName == $pkname) {
                    $pkFields[$props[$f]->name] = $props[$f];
                    break;
                }
            }
        }
        return $pkFields;
    }

    /**
    * gets fields that match a condition returned by the $captureMethod
    * @internal
    */
    protected function _getPropertiesBy ($captureMethod){
        $captureMethod = '_capture'.$captureMethod;
        $result = array ();

        foreach ($this->_dataParser->getProperties() as $field){
            if ( $this->$captureMethod($field)){
                $result[$field->name] = $field;
            }
        }
        return $result;
    }

    protected function _capturePrimaryFieldsExcludeAutoIncrement(&$field){
        return ($field->table == $this->_dataParser->getPrimaryTable() && !$field->autoIncrement);
    }

    protected function _capturePrimaryFieldsExcludePk(&$field){
        return ($field->table == $this->_dataParser->getPrimaryTable()) && !$field->isPK;
    }

    protected function _capturePrimaryTable(&$field){
        return ($field->table == $this->_dataParser->getPrimaryTable());
    }

    protected function _captureAll(&$field){
        return true;
    }

    protected function _captureFieldToUpdate(&$field){
        return ($field->table == $this->_dataParser->getPrimaryTable()
                && !$field->isPK
                && !$field->isFK
                && ( $field->autoIncrement || ($field->insertPattern != '%s' && $field->selectPattern != '')));
    }

    protected function _captureFieldToUpdateOnUpdate(&$field){
        return ($field->table == $this->_dataParser->getPrimaryTable()
                && !$field->isPK
                && !$field->isFK
                && ( $field->autoIncrement || ($field->updatePattern != '%s' && $field->selectPattern != '')));
    }

    protected function _captureBinaryField(&$field) {
        return ($field->unifiedType == 'binary' || $field->unifiedType == 'varbinary');
    }

    /**
    * get autoincrement PK field
    */
    protected function getAutoIncrementPKField ($using = null){
        if ($using === null){
            $using = $this->_dataParser->getProperties ();
        }

        foreach ($using as $id=>$field) {
            if(!$field->isPK)
                continue;
            if ($field->autoIncrement) {
                return $field;
            }
        }
        return null;
    }

    /**
     * build a WHERE clause with conditions on given properties : conditions are
     * equality between a variable and the field.
     * the variable name is the name of the property, made with an optional prefix
     * given in $fieldPrefix parameter.
     * This method is called to generate WHERE clause for primary keys.
     * @param array $fields  list of jDaoPropery objects
     * @param string $fieldPrefix  an optional prefix to prefix variable names
     * @param boolean $forSelect  if true, the table name or table alias will prefix
     *                            the field name in the query
     * @return string the WHERE clause (without the WHERE keyword)
     * @internal
     */
    protected function buildSimpleConditions (&$fields, $fieldPrefix='', $forSelect=true){
        $r = ' ';

        $first = true;
        foreach($fields as $field){
            if (!$first){
                $r .= ' AND ';
            }else{
                $first = false;
            }

            if($forSelect){
                $condition = $this->_encloseName($field->table).'.'.$this->_encloseName($field->fieldName);
            }else{
                $condition = $this->_encloseName($field->fieldName);
            }

            $var = '$'.$fieldPrefix.$field->name;
            $value = $this->_preparePHPExpr($var, $field, !$field->requiredInConditions, '=');

            $r .= $condition.'\'.'.$value.'.\'';
        }

        return $r;
    }


    protected function _prepareValues ($fieldList, $pattern='', $prefixfield=''){
        $values = $fields = array();

        foreach ((array)$fieldList as $fieldName=>$field) {
            if ($pattern != '' && $field->$pattern == '') {
                continue;
            }

            $value = $this->_preparePHPExpr('$'.$prefixfield.$fieldName, $field, true);

            if($pattern != ''){
                if(strpos($field->$pattern, "'") !== false && strpos($field->$pattern, "\\'") === false) {
                    $values[$field->name] = sprintf(str_replace("'", "\\'", $field->$pattern),'\'.'.$value.'.\'');
                } else {
                    $values[$field->name] = sprintf($field->$pattern,'\'.'.$value.'.\'');
                }
            }else{
                $values[$field->name] = '\'.'.$value.'.\'';
            }

            $fields[$field->name] = $this->_encloseName($field->fieldName);
        }
        return array($fields, $values);
    }


    /**
     * build 'where' clause from conditions declared with condition tag in a user method
     * @param jDaoConditions $cond the condition object which contains conditions data
     * @param array $fields  array of jDaoProperty
     * @param array $params  list of parameters name of the method
     * @param boolean $withPrefix true if the field name should be preceded by the table name/table alias
     * @param array $groupby  list of properties to use in a groupby
     * @return string a WHERE clause (without the WHERE keyword) with eventually an ORDER clause
     * @internal
     */
    protected function buildConditions ($cond, $fields, $params=array(), $withPrefix=true, $groupby=null){
        if($cond)
            $sql = $this->buildOneSQLCondition ($cond->condition, $fields, $params, $withPrefix, true);
        else
            $sql = '';

        if($groupby && count($groupby)) {
            if(trim($sql) =='') {
                $sql = ' 1=1 ';
            }
            foreach($groupby as $k=>$f) {
                if ($withPrefix)
                    $groupby[$k]= $this->_encloseName($fields[$f]->table).'.'.$this->_encloseName($fields[$f]->fieldName);
                else
                    $groupby[$k]= $this->_encloseName($fields[$f]->fieldName);
            }
            $sql .= ' GROUP BY '.implode (', ', $groupby);
        }

        $order = array ();
        foreach ($cond->order as $name => $way){
            if (isset($fields[$name])){
                if ($withPrefix)
                    $ord = $this->_encloseName($fields[$name]->table).'.'.$this->_encloseName($fields[$name]->fieldName);
                else
                    $ord = $this->_encloseName($fields[$name]->fieldName);
            }elseif($name[0] == '$'){
                $ord = '\'.'.$name.'.\'';
            }else{
                continue;
            }
            if($way[0] == '$'){
                $order[]=$ord.' \'.( strtolower('.$way.') ==\'asc\'?\'asc\':\'desc\').\'';
            }else{
                $order[]=$ord.' '.$way;
            }
        }
        if(count ($order) > 0){
            if(trim($sql) =='') {
                $sql = ' 1=1 ';
            }
            $sql.=' ORDER BY '.implode (', ', $order);
        }
        return $sql;
    }

    /**
     * build a condition for the SQL WHERE clause.
     * this method call itself recursively.
     * @param jDaoCondition $cond a condition object which contains conditions data
     * @param array $fields  array of jDaoProperty
     * @param array $params  list of parameters name of the method
     * @param boolean $withPrefix true if the field name should be preceded by the table name/table alias
     * @param boolean $principal  should be true for the first call, and false for recursive call
     * @return string a WHERE clause (without the WHERE keyword)
     * @see jDaoGenerator::buildConditions
     * @internal
     */
    protected function buildOneSQLCondition ($condition, $fields, $params, $withPrefix, $principal=false){

        $r = ' ';

        //direct conditions for the group
        $first = true;
        foreach ($condition->conditions as $cond){
            if (!$first){
                $r .= ' '.$condition->glueOp.' ';
            }
            $first = false;

            $prop = $fields[$cond['field_id']];

            $pattern = (isset($cond['field_pattern']) && !empty($cond['field_pattern'])) ? $cond['field_pattern'] : '%s';

            if($withPrefix){
                if($pattern == '%s') {
                    $f = $this->_encloseName($prop->table).'.'.$this->_encloseName($prop->fieldName);
                } else {
                    $f = str_replace(array("'", "%s"), array("\\'", $this->_encloseName($prop->table).'.'.$this->_encloseName($prop->fieldName)), $pattern);
                }
            }else{
                if($pattern == '%s') {
                    $f = $this->_encloseName($prop->fieldName);
                } else {
                    $f = str_replace(array("'", "%s"), array("\\'", $this->_encloseName($prop->fieldName)), $pattern);
                }
            }

            $r .= $f.' ';

            if($cond['operator'] == 'IN' || $cond['operator'] == 'NOT IN'){
                if($cond['isExpr']){
                    $phpexpr = $this->_preparePHPCallbackExpr($prop);
                    $phpvalue = 'implode(\',\', array_map( '.$phpexpr.', is_array('.$cond['value'].')?'.$cond['value'].':array('.$cond['value'].')))';
                    $value= '(\'.'.$phpvalue.'.\')';
                }else{
                    $value= '('.str_replace("'", "\\'", $cond['value']).')';
                }
                $r.=$cond['operator'].' '.$value;
            }elseif($cond['operator'] == 'IS NULL' || $cond['operator'] == 'IS NOT NULL'){
                $r.=$cond['operator'].' ';
            }else{
                if($cond['isExpr']){
                    $value=str_replace("'","\\'",$cond['value']);
                    // we need to know if the expression is like "$foo" (1) or a thing like "concat($foo,'bla')" (2)
                    // because of the nullability of the parameter. If the value of the parameter is null and the operator
                    // is = or <>, then we need to generate a thing like :
                    // - in case 1: ($foo === null ? 'IS NULL' : '='.$this->_conn->quote($foo))
                    // - in case 2: '= concat('.($foo === null ? 'NULL' : $this->_conn->quote($foo)).' ,\'bla\')'
                    if($value[0] == '$'){
                        $value = '\'.'.$this->_preparePHPExpr($value, $prop, !$prop->requiredInConditions,$cond['operator']).'.\'';
                    }else{
                        foreach($params as $param){
                            $value = str_replace('$'.$param, '\'.'.$this->_preparePHPExpr('$'.$param, $prop, !$prop->requiredInConditions).'.\'',$value);
                        }
                        $value = $cond['operator'].' '.$value;
                    }
                } else {
                    $value = $cond['operator'].' ';
                    if ($cond['operator'] == 'LIKE' || $cond['operator'] == 'NOT LIKE') {
                        $value .= $this->tools->escapeValue('varchar', $cond['value'], false, true);
                    } else {
                        $value .= $this->tools->escapeValue($prop->unifiedType, $cond['value'], false, true);
                    }
                }
                $r.=$value;
            }
        }
        //sub conditions
        foreach ($condition->group as $conditionDetail){
            if (!$first){
                $r .= ' '.$condition->glueOp.' ';
            }
            $r .= $this->buildOneSQLCondition($conditionDetail, $fields, $params, $withPrefix);
            $first=false;
        }

        //adds parenthesis around the sql if needed (non empty)
        if (strlen (trim ($r)) > 0 && (!$principal ||($principal && $condition->glueOp != 'AND'))){
            $r = '('.$r.')';
        }
        return $r;
    }

    protected function _preparePHPExpr($expr, $field, $checknull=true, $forCondition=''){
        $opnull = $opval = '';
        if($checknull && $forCondition != ''){
            if($forCondition == '=')
                $opnull = 'IS ';
            elseif($forCondition == '<>')
                $opnull = 'IS NOT ';
            else
                $checknull=false;
        }
        $type = '';
        if ($forCondition != 'LIKE' && $forCondition != 'NOT LIKE')
            $type = strtolower($field->unifiedType);

        if ($forCondition != '') {
            $forCondition = '\' '.$forCondition.' \'.'; // spaces for operators like LIKE
        }

        switch($type){
            case 'integer':
                if($checknull){
                    $expr= '('.$expr.' === null ? \''.$opnull.'NULL\' : '.$forCondition.'intval('.$expr.'))';
                }else{
                    $expr= $forCondition.'intval('.$expr.')';
                }
                break;
            case 'double':
            case 'float':
            case 'numeric':
            case 'decimal':
                if($checknull){
                    $expr='('.$expr.' === null ? \''.$opnull.'NULL\' : '.$forCondition.'jDb::floatToStr('.$expr.'))';
                }else{
                    $expr=$forCondition.'jDb::floatToStr('.$expr.')';
                }
                break;
            case 'boolean':
                if($checknull){
                    $expr= '('.$expr.' === null ? \''.$opnull.'NULL\' : '.$forCondition.'$this->_prepareValue('.$expr.', "boolean", true))';
                }else{
                    $expr= $forCondition.'$this->_prepareValue('.$expr.', "boolean", true)';
                }
                break;
            default:
                if ($type=='varbinary' || $type=='binary')
                    $qparam = ',true';
                else
                    $qparam = '';

                if ($checknull) {
                   $expr = '('.$expr.' === null ? \''.$opnull.'NULL\' : '.$forCondition.'$this->_conn->quote2('.$expr.',false'.$qparam.'))';
                }
                else {
                   $expr = $forCondition.'$this->_conn->quote'.($qparam?'2('.$expr.',true,true)':'('.$expr.')');
                }
        }
        return $expr;
    }

    protected function _preparePHPCallbackExpr($field){
        $type = strtolower($field->unifiedType);
        switch($type){
            case 'integer':
                return 'function($__e){return intval($__e);}';
            case 'double':
            case 'float':
            case 'numeric':
            case 'decimal':
                return 'function($__e){return jDb::floatToStr($__e);}';
            case 'boolean':
                return 'array($this, \'_callbackBool\')';
            default:
                if ($type=='varbinary' || $type=='binary')
                    return 'array($this, \'_callbackQuoteBin\')';
                else
                    return 'array($this, \'_callbackQuote\')';
        }
    }

    protected function _encloseName($name){
        return $this->tools->encloseName($name);
    }

    protected function buildUpdateAutoIncrementPK($pkai) {
        return '       $record->'.$pkai->name.'= $this->_conn->lastInsertId();';
    }
}
