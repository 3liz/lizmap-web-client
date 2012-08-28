<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Dominique Papin, Julien Issler
* @copyright   2006-2010 Laurent Jouanneau
* @copyright   2008 Dominique Papin
* @copyright   2010 Julien Issler
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/
/**
 * Interface for objects which provides a source of data to fill some controls in a form,
 * like menulist, listbox etc...
 * @package     jelix
 * @subpackage  forms
 */
interface jIFormsDatasource {
    /**
     * load and returns data to fill a control. The returned array should be
     * an associative array  key => label
     * @param jFormsBase $form  the form
     * @return array the data
     */
    public function getData($form);

    /**
     * Return the label corresponding to the given key
     * if the class implements also jIFormsDatasource2,
     * you must not call getLabel but getLabel2
     * @param string $key the key
     * @return string the label
     */
    public function getLabel($key);
}

/**
 * Interface for objects which provides a source of data to fill some controls in a form,
 * like menulist, listbox etc...
 * @package     jelix
 * @subpackage  forms
 */
interface jIFormsDatasource2 extends jIFormsDatasource {
    /**
     * Says if data are grouped, ie, if getData() returns a simple array
     * value=>label (false) or if it returns an array of simple arrays
     * array('group label'=>array(value=>label,)) (true)
     * @return boolean
     */
    public function hasGroupedData();

    /**
     * set a parameter indicating how data are grouped
     * @param string $group the group parameter
     */
    public function setGroupBy($group);

    /**
     * Return the label corresponding to the given key.
     * It replace getLabel so it should be called instead of getLabel.
     * @param string $key the key
     * @param jFormsBase $form  the form
     * @return string the label
     */
    public function getLabel2($key, $form);

}


/**
 * A datasource which is based on static values.
 * @package     jelix
 * @subpackage  forms
 */
class jFormsStaticDatasource implements jIFormsDatasource2 {
    /**
     * associative array which contains keys and labels
     * @var array
     */
    public $data = array();
    
    protected $grouped = false;

    public function getData($form){
        return $this->data;
    }

    public function getLabel2($key, $form) {
        return $this->getLabel($key);
    }

    public function getLabel($key){
        if ($this->grouped) {
            foreach ($this->data as $group=>$data){
                if(isset($data[$key]))
                    return $data[$key];
            }
        }
        elseif(isset($this->data[$key]))
            return $this->data[$key];
        return null;
    }

    public function hasGroupedData() {
        return $this->grouped;
    }

    public function setGroupBy($group) {
        $this->grouped = $group;
    }
}


/**
 * A datasource which is based on a dao
 * @package     jelix
 * @subpackage  forms
 */
class jFormsDaoDatasource implements jIFormsDatasource2 {

    protected $selector;
    protected $method;
    protected $labelProperty = array();
    protected $labelSeparator;
    public $labelMethod = 'get';
    protected $keyProperty;
    protected $profile;

    protected $criteria = null;
    protected $criteriaFrom = null;

    protected $dao = null;

    protected $groupeBy = '';

    function __construct ($selector ,$method , $label, $key, $profile='', $criteria=null, $criteriaFrom=null, $labelSeparator=''){
        $this->selector  = $selector;
        $this->profile = $profile;
        $this->method = $method ;
        $this->labelProperty = preg_split('/[\s,]+/',$label);
        $this->labelSeparator = $labelSeparator;
        if ( $criteria !== null )
            $this->criteria = preg_split('/[\s,]+/',$criteria) ;
        if ( $criteriaFrom !== null )
            $this->criteriaFrom = preg_split('/[\s,]+/',$criteriaFrom) ;

        if($key == ''){
            $rec = jDao::createRecord($this->selector, $this->profile);
            $pfields = $rec->getPrimaryKeyNames();
            $key = $pfields[0];
        }
        $this->keyProperty = $key;
    }

    public function getData($form){
        if($this->dao === null)
            $this->dao = jDao::get($this->selector, $this->profile);
        if($this->criteria !== null) {
            $found = call_user_func_array( array($this->dao, $this->method), $this->criteria);
        } else if ($this->criteriaFrom !== null) {
            $args = array() ;
            foreach( (array)$this->criteriaFrom as $criteria ) {
              array_push( $args, $form->getData($criteria) ) ;
            }
            $found = call_user_func_array( array($this->dao, $this->method), $args);
        } else {
            $found = $this->dao->{$this->method}();
        }

        $result = array();

        foreach($found as $obj){
            $label = $this->buildLabel($obj);
            $value = $obj->{$this->keyProperty};
            if ($this->groupeBy) {
                $group = (string)$obj->{$this->groupeBy};
                if (!isset($result[$group]))
                    $result[$group] = array();
                $result[$group][$value] = $label;
            }
            else {
                $result[$value] = $label;
            }
        }
        return $result;
    }

    public function getLabel($key) {
        throw new Exception("should not be called");
    }

    public function getLabel2($key, $form){
        if($this->dao === null)
            $this->dao = jDao::get($this->selector, $this->profile);

        $method = $this->labelMethod;


        if ($this->criteria !== null || $this->criteriaFrom !== null) {
            $countPKeys = count($this->dao->getPrimaryKeyNames());
            if ($this->criteria !== null) {
                $values = $this->criteria;
                array_unshift($values, $key);                
            }
            else if ($this->criteriaFrom !== null) {
                $values = array($key);
                foreach( (array)$this->criteriaFrom as $criteria ) {
                    array_push($values, $form->getData($criteria));
                }
            }

            if ($method == 'get') {
                // in the case where the number of criterias doesn't correspond
                // to the number of field of the primary key, we give only
                // the expected number of values. So the retrieved record
                // won't correspond to the criterias. However, in some case,
                // it could make sens.
                // for example, the dependence could be just a filter...
                while (count($values) != $countPKeys) {
                    array_pop($values);
                }
            }
            $rec = call_user_func_array( array($this->dao, $method), $values);

        }
        else {
            $rec = $this->dao->{$method}($key);
        }
        if ($rec) {
            return $this->buildLabel($rec);
        }
        else {
            return null;
        }
    }

    protected function buildLabel($rec) {
        $label = '' ;
        foreach( (array)$this->labelProperty as $property ) {
            if ((string)$rec->{$property} !== '')
                $label .= $rec->{$property}.$this->labelSeparator;
        }
        if ($this->labelSeparator != '')
            $label = substr($label, 0, -strlen($this->labelSeparator));
        return $label ;
    }

    public function getDependentControls() {
        return $this->criteriaFrom;
    }

    public function hasGroupedData() {
        return $this->groupeBy;
    }

    public function setGroupBy($group) {
        $this->groupeBy = $group;
    }
}

