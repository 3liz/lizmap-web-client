<?php
/**
* @package    jelix
* @subpackage dao
* @author     Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau, Julien Issler, Yannick Le Guédart, Philippe Villiers
* @copyright  2001-2005 CopixTeam, 2005-2009 Laurent Jouanneau
* @copyright  2008 Thomas
* @copyright  2008 Julien Issler, 2009 Yannick Le Guédart
* @copyright  2013 Philippe Villiers
* This classes was get originally from the Copix project (CopixDAOSearchConditions, Copix 2.3dev20050901, http://www.copix.org)
* Some lines of code are copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix classes are Gerald Croes and Laurent Jouanneau,
* and this classes was adapted for Jelix by Laurent Jouanneau
*
* @link     http://jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * content a sub group of conditions
 * @package  jelix
 * @subpackage dao
 */
class jDaoCondition {

    /**
    * the parent group if any
    */
    public $parent = null;

    /**
    * the conditions in this group
    */
    public $conditions = array ();

    /**
    * the sub groups
    */
    public $group = array ();

    /**
    * the kind of group (AND/OR)
    */
    public $glueOp;

    function __construct ($glueOp='AND', $parent =null ){
        $this->parent = $parent;
        $this->glueOp = $glueOp;
    }

    public function isEmpty(){
        return empty($this->conditions) && empty($this->group);
    }
}

/**
 * container for all criteria of a query
 * @package  jelix
 * @subpackage dao
*/
class jDaoConditions {
    /**
    * @var jDaoCondition
    */
    public $condition;

    /**
    * the orders we wants the list to be
    */
    public $order = array ();

    /**
    * the groups we wants the list to be
    */
    public $group = array ();

    /**
    * the condition we actually are browsing
    */
    private $_currentCondition;

    /**
     * @param string $glueOp the logical operator which links each conditions : AND or OR
     */
    function __construct ($glueOp = 'AND'){
        $this->condition = new jDaoCondition ($glueOp);
        $this->_currentCondition = $this->condition;
    }

    /**
     * add an order clause
     * @param string $field_id the property name used to order results
     * @param string $way the order type : asc or desc
     * @param boolean $allowAnyWay true if the value of $way should be checked. Internal use.
     *                              Not recommended because it may cause security issues
     * @throws jException
     */
    function addItemOrder ($field_id, $way='ASC', $allowAnyWay=false) {
        if (!$allowAnyWay && strtoupper($way) !='DESC' && strtoupper($way) != 'ASC')
            throw new jException('jelix~dao.error.bad.operator', $way);

        $this->order[$field_id] = $way;
    }

    /**
     * add a group clause
     *
     * @param string $field_id	the property name used to group results
     */
    function addItemGroup($field_id) {
        $this->group[] = $field_id;
    }

    /**
    * says if there are no conditions nor order
    * @return boolean  false if there isn't condition
    */
    function isEmpty (){
        return (count ($this->condition->group) == 0) &&
        (count ($this->condition->conditions) == 0) &&
        (count ($this->order) == 0) ;
    }

    /**
    * says if there are no conditions
    * @return boolean  false if there isn't condition
    * @since 1.0
    */
    function hasConditions (){
        return (count ($this->condition->group) || count ($this->condition->conditions));
    }

    /**
     * starts a new condition group
     * @param string $glueOp the logical operator which links each conditions in the group : AND or OR
     * @throws jException
     */
    function startGroup ($glueOp = 'AND'){
        $glueOp = strtoupper($glueOp);
        if ($glueOp !='AND' && $glueOp != 'OR')
            throw new jException('jelix~dao.error.bad.operator', $glueOp);
        $cond= new jDaoCondition ($glueOp, $this->_currentCondition);
        $this->_currentCondition = $cond;
    }

    /**
    * ends a condition group
    */
    function endGroup (){
        if ($this->_currentCondition->parent !== null){
            if(!$this->_currentCondition->isEmpty())
                $this->_currentCondition->parent->group[] = $this->_currentCondition;
            $this->_currentCondition = $this->_currentCondition->parent;
        }
    }

    /**
     * adds a condition
     * @param string $field_id the property name on which the condition applies
     * @param string $operator the sql operator
     * @param string $value the value which is compared to the property
     * @param string $field_pattern the pattern to use on the property (WHERE clause)
     * @param boolean $foo parameter for internal use : don't use it or set to false
     * @throws jException
     */
    function addCondition ($field_id, $operator, $value, $field_pattern = '%s', $foo = false){
        $operator = trim(strtoupper($operator));
        if(preg_match ('/^[^\w\d\s;\(\)]+$/', $operator) ||
           in_array($operator, array('LIKE', 'NOT LIKE', 'ILIKE', 'IN', 'NOT IN', 'IS', 'IS NOT', 'IS NULL',
                    'IS NOT NULL', 'MATCH', 'REGEXP', 'NOT REGEXP', '~', '!~', '~*', '!~*', 'RLIKE', 'SOUNDS LIKE'))) {

            $this->_currentCondition->conditions[] = array (
               'field_id'=>$field_id,
               'field_pattern'=>$field_pattern,
               'value'=>$value,
               'operator'=>$operator, 'isExpr'=>$foo);
        }
        else
            throw new jException('jelix~dao.error.bad.operator', $operator);
    }
}
