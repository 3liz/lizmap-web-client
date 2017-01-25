<?php
/**
* @package     jelix
* @subpackage  dao
* @author      Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @contributor Olivier Demah
* @contributor Philippe Villiers
* @copyright   2001-2005 CopixTeam, 2005-2009 Laurent Jouanneau, 2010 Olivier Demah, 2013 Philippe Villiers
* This class was get originally from the Copix project (CopixDAODefinitionV1, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix class are Gerald Croes and Laurent Jouanneau,
* and this class was adapted/improved for Jelix by Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * containers for properties of dao method
 * @package  jelix
 * @subpackage dao
 */
class jDaoMethod {
    public $name;
    public $type;
    public $distinct=false;
    public $eventBeforeEnabled = false;
    public $eventAfterEnabled = false;
    private $_conditions = null;
    private $_parameters   = array();
    private $_parametersDefaultValues = array();
    private $_limit = null;
    private $_values = array();
    private $_parser = null;
    private $_procstock=null;
    private $_body=null;
    private $_groupBy=null;

    /**
     * @param simpleXmlElement $method the xml element describing the method to generate
     * @param jDaoParser $parser the parser on a dao file
     * @throws jDaoXmlException
     */
    function __construct ($method, $parser){
        $this->_parser = $parser;

        $params = $parser->getAttr($method, array('name', 'type', 'call','distinct',
                                                  'eventbefore', 'eventafter', 'groupby'));

        if ($params['name']===null){
            throw new jDaoXmlException ($this->_parser->selector, 'missing.attr', array('name', 'method'));
        }

        $this->name = $params['name'];
        $this->type = $params['type'] ? strtolower($params['type']) : 'select';

        if (isset ($method->parameter)){
            foreach ($method->parameter as $param){
                $attr = $param->attributes();
                if (!isset ($attr['name'])){
                    throw new jDaoXmlException ($this->_parser->selector, 'method.parameter.unknowname', array($this->name));
                }
                if (!preg_match('/[a-zA-Z_][a-zA-Z0-9_]*/', (string)$attr['name'])) {
                    throw new jDaoXmlException($this->_parser->selector,'method.parameter.invalidname',array($method->name,$attr['name']));
                }
                $this->_parameters[]=(string)$attr['name'];
                if (isset ($attr['default'])){
                    $this->_parametersDefaultValues[(string)$attr['name']]=(string)$attr['default'];
                }
            }
        }

        if($this->type == 'sql'){
            if($params['call'] === null){
                throw new jDaoXmlException ($this->_parser->selector, 'method.procstock.name.missing');
            }
            $this->_procstock=$params['call'];
            return;
        }

        if($this->type == 'php'){
            if (isset ($method->body)){
                $this->_body = (string)$method->body;
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'method.body.missing');
            }
            return;
        }

        $this->_conditions = new jDaoConditions();
        if (isset ($method->conditions)){
            $this->_parseConditions($method->conditions[0],false);
        }

        if ($this->type == 'update' || $this->type == 'delete') {
            if ($params['eventbefore'] == 'true')
                $this->eventBeforeEnabled = true;
            if ($params['eventafter'] == 'true')
                $this->eventAfterEnabled = true;
        }

        if($this->type == 'update'){
            if($this->_parser->hasOnlyPrimaryKeys)
                throw new jDaoXmlException ($this->_parser->selector, 'method.update.forbidden',array($this->name));

            if(isset($method->values) && isset($method->values[0]->value)){
                foreach ($method->values[0]->value as $val){
                    $this->_addValue($val);
                }
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'method.values.undefine',array($this->name));
            }
            return;
        }

        if(strlen($params['distinct'])){
            if($this->type == 'select'){
                $this->distinct=$this->_parser->getBool($params['distinct']);
            }elseif($this->type == 'count'){
                $props = $this->_parser->getProperties();
                if (!isset ($props[$params['distinct']])){
                    throw new jDaoXmlException ($this->_parser->selector, 'method.property.unknown', array($this->name, $params['distinct']));
                }
                $this->distinct=$params['distinct'];
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'forbidden.attr.context', array('distinct', '<method name="'.$this->name.'"'));
            }
        }

        if($this->type == 'count')
            return;

        if (isset ($method->order) && isset($method->order[0]->orderitem)){
            foreach($method->order[0]->orderitem as $item){
                $this->_addOrder ($item);
            }
        }

        if(strlen($params['groupby'])){
            if($this->type == 'select' || $this->type == 'selectfirst'){
                $this->_groupBy = preg_split("/[\s,]+/", $params['groupby']);
                $props = $this->_parser->getProperties();
                foreach($this->_groupBy as $p){
                    if (!isset ($props[$p])) {
                        throw new jDaoXmlException ($this->_parser->selector, 'method.property.unknown', array($this->name, $p));
                    }
                }
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'forbidden.attr.context', array('groupby', '<method name="'.$this->name.'"'));
            }
        }

        if (isset($method->limit)){
            if(isset($method->limit[1])){
                throw new jDaoXmlException ($this->_parser->selector, 'tag.duplicate', array('limit', $this->name));
            }
            if($this->type == 'select'){
                $this->_addLimit($method->limit[0]);
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'method.limit.forbidden', $this->name);
            }
        }
    }

    public function getConditions (){ return $this->_conditions;}
    public function getParameters (){ return $this->_parameters;}
    public function getParametersDefaultValues (){ return $this->_parametersDefaultValues;}
    public function getLimit (){ return $this->_limit;}
    public function getValues (){ return $this->_values;}
    public function getProcStock (){ return $this->_procstock;}
    public function getBody (){ return $this->_body;}
    public function getGroupBy() { return $this->_groupBy;}

    /**
     * @param simpleXmlElement $conditions
     * @param bool $subcond
     */
    private function _parseConditions($conditions, $subcond=true){
        if (isset ($conditions['logic'])){
            $kind = strtoupper((string)$conditions['logic']);
        }else{
            $kind = 'AND';
        }

        if ($subcond){
            $this->_conditions->startGroup ($kind);
        }else{
            $this->_conditions->condition->glueOp =$kind;
        }

        foreach($conditions->children() as $op=>$cond){
            if($op !='conditions')
                $this->_addCondition ($op,$cond);
            else
                $this->_parseConditions ($cond);
        }

        if ($subcond) {
            $this->_conditions->endGroup();
        }

    }

    private $_op = array('eq'=>'=', 'neq'=>'<>', 'lt'=>'<', 'gt'=>'>', 'lteq'=>'<=', 'gteq'=>'>=',
        'like'=>'LIKE', 'notlike'=>'NOT LIKE', 'isnull'=>'IS NULL', 'isnotnull'=>'IS NOT NULL','in'=>'IN', 'notin'=>'NOT IN',
        'binary_op'=>'dummy');
      // 'between'=>'BETWEEN',  'notbetween'=>'NOT BETWEEN',

    private $_attrcond = array('property', 'pattern', 'expr', 'operator', 'driver'); //, 'min', 'max', 'exprmin', 'exprmax'

    private function _addCondition($op, $cond){

        $attr = $this->_parser->getAttr($cond, $this->_attrcond);

        $field_id = ($attr['property']!==null? $attr['property']:'');

        if(!isset($this->_op[$op])){
            throw new jDaoXmlException ($this->_parser->selector, 'method.condition.unknown', array($this->name, $op));
        }

        $operator = $this->_op[$op];

        $props = $this->_parser->getProperties();

        if (!isset ($props[$field_id])){
            throw new jDaoXmlException ($this->_parser->selector, 'method.property.unknown', array($this->name, $field_id));
        }

        $field_pattern = ($attr['pattern']!==null? $attr['pattern']:'');

        if($this->type=='update'){
            if($props[$field_id]->table != $this->_parser->getPrimaryTable()){
                throw new jDaoXmlException ($this->_parser->selector, 'method.property.forbidden', array($this->name, $field_id));
            }
        }

        if(isset($cond['value']))
            $value=(string)$cond['value'];
        else
            $value = null;

        if($value!==null && $attr['expr']!==null){
            throw new jDaoXmlException ($this->_parser->selector, 'method.condition.valueexpr.together', array($this->name, $op));
        }else if($value!==null){
            if($op == 'isnull' || $op =='isnotnull'){
                throw new jDaoXmlException ($this->_parser->selector, 'method.condition.valueexpr.notallowed', array($this->name, $op,$field_id));
            }
            if($op == 'binary_op') {
                if (!isset($attr['operator']) || empty($attr['operator'])) {
                    throw new jDaoXmlException ($this->_parser->selector, 'method.condition.operator.missing', array($this->name, $op,$field_id));
                }
                if (isset($attr['driver']) && !empty($attr['driver'])) {
                    if ($this->_parser->selector->driver != $attr['driver']) {
                        throw new jDaoXmlException ($this->_parser->selector, 'method.condition.driver.notallowed', array($this->name, $op,$field_id));
                    }
                }
                $operator = $attr['operator'];
            }
            $this->_conditions->addCondition ($field_id, $operator, $value, $field_pattern);
        }else if($attr['expr']!==null){
            if($op == 'isnull' || $op =='isnotnull'){
                throw new jDaoXmlException ($this->_parser->selector, 'method.condition.valueexpr.notallowed', array($this->name, $op, $field_id));
            }
            if(($op == 'in' || $op =='notin')&& !preg_match('/^\$[a-zA-Z0-9_]+$/', $attr['expr'])){
                throw new jDaoXmlException ($this->_parser->selector, 'method.condition.innotin.bad.expr', array($this->name, $op, $field_id));
            }
            if($op == 'binary_op') {
                if (!isset($attr['operator']) || empty($attr['operator'])) {
                    throw new jDaoXmlException ($this->_parser->selector, 'method.condition.operator.missing', array($this->name, $op,$field_id));
                }
                if (isset($attr['driver']) && !empty($attr['driver'])) {
                    if ($this->_parser->selector->driver != $attr['driver']) {
                        throw new jDaoXmlException ($this->_parser->selector, 'method.condition.driver.notallowed', array($this->name, $op,$field_id));
                    }
                }
                $operator = $attr['operator'];
            }
            $this->_conditions->addCondition ($field_id, $operator, $attr['expr'], $field_pattern, true);
        }else{
            if($op != 'isnull' && $op !='isnotnull'){
                throw new jDaoXmlException ($this->_parser->selector, 'method.condition.valueexpr.missing', array($this->name, $op, $field_id));
            }
            $this->_conditions->addCondition ($field_id, $operator, '', $field_pattern, false);
        }
    }

    private function _addOrder($order){
        $attr = $this->_parser->getAttr($order, array('property','way'));

        $way  = ($attr['way'] !== null ? $attr['way']:'ASC');

        if(substr ($way,0,1) == '$'){
            if(!in_array (substr ($way,1),$this->_parameters)){
                throw new jDaoXmlException ($this->_parser->selector, 'method.orderitem.parameter.unknown', array($this->name, $way));
            }
        }

        if ($attr['property'] != ''){
            $prop =$this->_parser->getProperties();
            if(isset($prop[$attr['property']])){
                $this->_conditions->addItemOrder($attr['property'], $way, true);
            }elseif(substr ($attr['property'],0,1) == '$'){
                if(!in_array (substr ($attr['property'],1),$this->_parameters)){
                    throw new jDaoXmlException ($this->_parser->selector, 'method.orderitem.parameter.unknown', array($this->name, $way));
                }
                $this->_conditions->addItemOrder($attr['property'], $way, true);
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'method.orderitem.bad', array($attr['property'], $this->name));
            }
        }else{
            throw new jDaoXmlException ($this->_parser->selector, 'method.orderitem.property.missing', array($this->name));
        }
    }

    private function _addValue($attr){
        if(isset($attr['value']))
            $value=(string)$attr['value'];
        else
            $value = null;

        $attr = $this->_parser->getAttr($attr, array('property','expr'));

        $prop = $attr['property'];
        $props =$this->_parser->getProperties();

        if ($prop === null){
            throw new jDaoXmlException ($this->_parser->selector, 'method.values.property.unknown', array($this->name, $prop));
        }

        if(!isset($props[$prop])){
            throw new jDaoXmlException ($this->_parser->selector, 'method.values.property.unknown', array($this->name, $prop));
        }

        if($props[$prop]->table != $this->_parser->getPrimaryTable()){
            throw new jDaoXmlException ($this->_parser->selector, 'method.values.property.bad', array($this->name,$prop ));
        }

        if($props[$prop]->isPK){
            throw new jDaoXmlException ($this->_parser->selector, 'method.values.property.pkforbidden', array($this->name,$prop ));
        }

        if($value!==null && $attr['expr']!==null){
            throw new jDaoXmlException ($this->_parser->selector, 'method.values.valueexpr', array($this->name, $prop));
        }else if($value!==null){
            $this->_values [$prop]= array( $value, false);
        }else if($attr['expr']!==null){
            $this->_values [$prop]= array( $attr['expr'], true);
        }else{
            $this->_values [$prop]= array( '', false);
        }
    }

    private function _addLimit($limit){
        $attr = $this->_parser->getAttr($limit, array('offset','count'));

        extract($attr);

        if( $offset === null){
            throw new jDaoXmlException ($this->_parser->selector, 'missing.attr',array('offset','limit'));
        }
        if($count === null){
            throw new jDaoXmlException ($this->_parser->selector, 'missing.attr',array('count','limit'));
        }

        if(substr ($offset,0,1) == '$'){
            if(in_array (substr ($offset,1),$this->_parameters)){
                $offsetparam=true;
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'method.limit.parameter.unknown', array($this->name, $offset));
            }
        }else{
            if(is_numeric ($offset)){
                $offsetparam=false;
                $offset = intval ($offset);
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'method.limit.badvalue', array($this->name, $offset));
            }
        }

        if(substr ($count,0,1) == '$'){
            if(in_array (substr ($count,1),$this->_parameters)){
                $countparam=true;
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'method.limit.parameter.unknown', array($this->name, $count));
            }
        }else{
            if(is_numeric($count)){
                $countparam=false;
                $count=intval($count);
            }else{
                throw new jDaoXmlException ($this->_parser->selector, 'method.limit.badvalue', array($this->name, $count));
            }
        }
        $this->_limit= compact('offset', 'count', 'offsetparam','countparam');
    }
}
