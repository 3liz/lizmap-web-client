<?php
/**
* @package    jelix
* @subpackage db
* @author     Laurent Jouanneau
* @copyright  2010-2020 Laurent Jouanneau
*
* @link        http://jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
 * Represents an index on some columns
 */
class jDbIndex {
    /**
     * @var string the index name
     */
    public $name;

    /**
     *  the type of index : 'btree', 'hash'...
     * @var string
     */
    public $type;

    /**
     * @var string[]  list of indexed columns
     */
    public $columns = array();

    /**
     * @var string   SQL where clause for the index
     */
    //public $predicat = '';

    public $isUnique = false;

    /**
     * jDbIndex constructor.
     * @param string $name  the index name
     * @param string[] $columns  the list of column names
     */
    function __construct($name, $type='', $columns = array()) { //, $predicat='', ) {
        $this->name = $name;
        $this->columns = $columns;
        $this->type = $type;
        //$this->predicat = $predicat;
    }
}

abstract class jDbConstraint {
    public $name;
    public $columns = array();

    /**
     * jDbConstraint constructor.
     * @param string $name
     * @param string[]|string $columns
     */
    function __construct($name, $columns) {
        $this->name = $name;
        if (is_string($columns)) {
            $this->columns = array($columns);
        }
        else {
            $this->columns = $columns;
        }
    }
}

/**
 * represents a unique key
 */
class jDbUniqueKey extends jDbConstraint {

    function __construct($name, $columns = null) {
        // for previous version <1.6.16, where $columns was $type
        if ($columns === null) {
            parent::__construct($name, array());
        }
        else {
            parent::__construct($name, $columns);
        }


    }
}

/**
 * used to declare a primary key
 */
class jDbPrimaryKey extends jDbConstraint {

    function __construct($columns, $name = '') {
        // for previous version <1.6.16, where there was only one argument, $columns
        parent::__construct($name, $columns);
    }
}



/**
 * used to declare a foreign key
 */
class jDbReference  extends jDbConstraint {
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

    /**
     * jDbReference constructor.
     *
     * Note: all parameters are optional, to be compatible with Jelix < 1.6.16
     * where parameters didn't exist
     * @param string $name
     * @param string[]|string $columns
     * @param string $foreignTable
     * @param string[]|string $foreignColumns
     */
    function __construct($name = '', $columns = array(), $foreignTable='', $foreignColumns=array()) {
        parent::__construct($name, $columns);
        $this->fTable = $foreignTable;
        if (is_string($foreignColumns)) {
            $this->fColumns = array($foreignColumns);
        }
        else {
            $this->fColumns = $foreignColumns;
        }
    }
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
    public $notNull = false;

    /**
     * says if the field is auto incremented
     * @var boolean
     */
    public $autoIncrement = false;

    /**
     * default value
     * @var string
     */
    public $default = null;

    /**
     * says if there is a default value
     * @var boolean
     */
    public $hasDefault = false;

    /**
     * The length for a string
     * @var int
     */
    public $length = 0;

    /**
     * The precision for a number
     * @var int
     */
    public $precision = 0;

    /**
     * The scale for a number (value after the coma, in the precision)
     * @var int
     */
    public $scale = 0;

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

    public $comment = '';

    function __construct ($name, $type, $length=0, $hasDefault = false,
                          $default = null, $notNull = false) {
        $this->type = $type;
        $this->name = $name;
        $this->length = $length;
        $this->hasDefault = $hasDefault;
        if ($hasDefault) {
            $this->default = ($notNull&&$default === null?'':$default);
        }
        else {
            $this->default = ($notNull?'':null);
        }
        $this->notNull = $notNull;
    }

    function isEqualTo($column) {
        return (
            $this->name == $column->name &&
            $this->_isEqualToExceptName($column)
        );
    }

    function hasOnlyDifferentName($otherColumn) {
        return (
            $this->name != $otherColumn->name &&
            $this->_isEqualToExceptName($otherColumn)
        );
    }

    protected function _isEqualToExceptName($column)
    {
        $isAutoIncremented = false;
        if ($column->nativeType && $this->nativeType) {
            if ($column->nativeType != $this->nativeType) {
                $isAutoIncremented =  ($this->isAutoincrementedColumn() && $column->isAutoincrementedColumn()) ||
                    ($this->isBigAutoincrementedColumn() && $column->isBigAutoincrementedColumn());
                if (!$isAutoIncremented) {
                    return false;
                }
            }
        } elseif ($this->type != $column->type) {
            $isAutoIncremented =  ($this->isAutoincrementedColumn() && $column->isAutoincrementedColumn()) ||
                ($this->isBigAutoincrementedColumn() && $column->isBigAutoincrementedColumn());
            if (!$isAutoIncremented) {
                return false;
            }
        }

        if (!$isAutoIncremented && ($this->sequence || $column->sequence) &&
            $this->sequence != $column->sequence) {
            return false;
        }

        return
            $this->notNull == $column->notNull &&
            $this->autoIncrement == $column->autoIncrement &&
            $this->default == $column->default &&
            $this->hasDefault == $column->hasDefault &&
            $this->length == $column->length &&
            $this->scale == $column->scale &&
            $this->unsigned == $column->unsigned
            ;
    }

    public function isAutoincrementedColumn()
    {
        if ($this->nativeType) {
            return (
                ($this->autoIncrement && (
                        $this->nativeType == 'integer' ||
                        $this->nativeType == 'int')
                ) ||
                $this->nativeType == 'serial'
            );
        }

        if (
            ($this->autoIncrement && (
                    $this->type == 'integer' ||
                    $this->type == 'int' )
            ) ||
            $this->type == 'serial' ||
            $this->type == 'autoincrement'
        ) {
            return true;
        }

        return false;
    }

    public function isBigAutoincrementedColumn()
    {
        if ($this->nativeType) {
            return (
                ($this->autoIncrement && (
                        $this->nativeType == 'bigint' ||
                        $this->nativeType == 'numeric')
                ) ||
                $this->nativeType == 'bigserial'
            );
        }

        if (
            ($this->autoIncrement && (
                    $this->type == 'bigint' )
            ) ||
            $this->type == 'bigserial'  ||
            $this->type == 'bigautoincrement'
        ) {
            return true;
        }

        return false;
    }
}
