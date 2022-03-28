<?php
/**
 * @package    jelix
 * @subpackage db
 *
 * @author     Laurent Jouanneau
 * @contributor Gwendal Jouannic, Thomas, Julien Issler
 *
 * @copyright  2005-2021 Laurent Jouanneau
 * @copyright  2008 Gwendal Jouannic, 2009 Thomas
 * @copyright  2009 Julien Issler
 *
 * @see      http://www.jelix.org
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

/**
 * a resultset based on PDOStatement for PHP >= 8.0
 *
 * @package  jelix
 * @subpackage db
 */
class jDbPDOResultSet extends PDOStatement {

    protected $_fetchMode = 0;

    #[\ReturnTypeWillChange]
    public function fetch($fetch_style = null, $cursor_orientation = PDO::FETCH_ORI_NEXT, $cursor_offset = 0)
    {
        // we take a shortcut: unused parameters are ignored by parent::fetch
        // let the parent::setFetchMode override as needed, and PHP use its default
        if ($fetch_style) {
            $rec = parent::fetch($fetch_style, $cursor_orientation, $cursor_offset);
        }
        else {
            $rec = parent::fetch();
        }

        if ($rec) {
            $this->applyModifiers($rec);
        }
        return $rec;
    }

    /**
     * return all results from the statement.
     * @param integer $fetch_style
     * @param integer $fetch_argument
     * @param array $ctor_arg
     * @return object[] list of object which contain all rows
     */
    #[\ReturnTypeWillChange]
    public function fetchAll($fetch_style = null, ...$args)
    {
        // if the user requested to override the style set with setFetchMode, use it
        $final_style = ($fetch_style ?: $this->_fetchMode);

        // Check how many arguments, if available should be given
        if (!$final_style) {
            $records = parent::fetchAll(PDO::FETCH_OBJ);
        } elseif (isset($args[1])) {
            $records = parent::fetchAll($final_style, $args[0], $args[1]);
        } elseif (isset($args[0])) {
            $records = parent::fetchAll($final_style, $args[0]);
        } else {
            $records = parent::fetchAll($final_style);
        }

        if (count($this->modifier)) {
            foreach ($records as $rec) {
                $this->applyModifiers($rec);
            }
        }
        return $records;
    }

    protected function applyModifiers($result) {
        if (count($this->modifier)) {
            foreach($this->modifier as $m) {
                call_user_func_array($m, array($result, $this));
            }
        }
    }

    /**
     * Set the fetch mode.
     * @param int $mode  the mode, a PDO::FETCH_* constant
     * @param mixed $arg1 a parameter for the given mode
     * @param mixed $arg2 a parameter for the given mode
     * @return boolean true if the fetch mode is ok
     */
    public function setFetchMode($mode, ...$args)
    {
        $this->_fetchMode = $mode;
        // depending the mode, original setFetchMode throw an error if wrong arguments
        // are given, even if there are null
        if (count($args) === 0) {
            return parent::setFetchMode($mode);
        }
        if (count($args) === 1 || $args[1] === null || $args[1] == array()) {
            return parent::setFetchMode($mode, $args[0]);
        }

        return parent::setFetchMode($mode, $args[0], $args[1]);
    }

    /**
     * @param string $text a binary string to unescape
     * @return string the unescaped string
     * @since 1.1.6
     */
    public function unescapeBin($text) {
        return $text;
    }

    /**
     * a callback function which will modify on the fly record's value
     * @var callable[]
     * @since 1.1.6
     */
    protected $modifier = array();

    /**
     * @param callable $function a callback function
     *     the function should accept in parameter the record,
     *     and the resulset object
     * @since 1.1.6
     */
    public function addModifier($function) {
        $this->modifier[] = $function;
    }
}
