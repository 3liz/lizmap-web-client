<?php
/**
* @package    jelix
* @subpackage db
* @author     Laurent Jouanneau
* @copyright  2010 Laurent Jouanneau
*
* @link        http://jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
 *
 */
class jDbIndex {
    public $name , $type;
    public $columns = array();

    function __construct($name, $type='') {
        $this->name = $name;
        $this->type = $type;
    }
}


/**
 *
 */
class jDbUniqueKey extends jDbIndex {

}

/**
 *
 */
class jDbPrimaryKey extends jDbIndex {
    function __construct($columns) {
        if (is_string($columns))
            $this->columns = array($columns);
        else
            $this->columns = $columns;
    }
}



/**
 *
 */
class jDbReference {
    public $name;
    /**
     * list of columns on which there is the constraint
     * @var string[]
     */
    public $columns = array();

    /**
     * name of the foreign table
     * @var string
     */
    public $fTable = '';
    /**
     * list of foreign columns
     * @var string[]
     */
    public $fColumns = array();
    
    public $onUpdate = '';
    public $onDelete = '';
}


/**
 *
 */
class jDbColumn {

    /**
     * native type of the field
     * @var string
     */
    public $type;

    /**
     * internal use
     * @internal
     */
    public $nativeType;

    /**
     * field name
     * @var string
     */
    public $name;

    /**
     * says if the field can be null or not
     * @var boolean
     */
    public $notNull = true;

    /**
     * says if the field is auto incremented
     * @var boolean
     */
    public $autoIncrement = false;

    /**
     * default value
     * @var string
     */
    public $default = '';

    /**
     * says if there is a default value
     * @var boolean
     */
    public $hasDefault = false;

    /**
     *
     */
    public $length = 0;
    
     /**
     * if there is a sequence
     * @var string
     */
    public $sequence = false;
    
    public $unsigned = false;
    
    public $minLength = null;
    
    public $maxLength = null;
    
    public $minValue = null;
    
    public $maxValue = null;
    
    function __construct ($name, $type, $length=0, $hasDefault = false, $default = null, $notNull = false) {
        $this->type = $type;
        $this->name = $name;
        $this->length = $length;
        $this->hasDefault = $hasDefault;
        if ($hasDefault) {
            $this->default = $default;
        }
        else {
            $this->default = '';
        }
        
        $this->notNull = $notNull;
    }
}
