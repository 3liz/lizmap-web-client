<?php
/**
* @package    jelix
* @subpackage utils
* @author     Laurent Jouanneau
* @copyright  2008-2010 Laurent Jouanneau
* @link       http://jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
* utility class to read and modify two ini files at the same time :
* one master file, and one file which overrides values of the master file,
* like we have in jelix with defaultconfig.ini.php and config.ini.php of an entry point
* @package    jelix
* @subpackage utils
* @since 1.1
*/
class jIniMultiFilesModifier {

    /**
     * @var jIniFileModifier
     */
    protected $master;

    /**
     * @var jIniFileModifier
     */
    protected $overrider;

    /**
     * load the two ini files
     * @param jIniFileModifier|string $master the master ini file (object or filename)
     * @param jIniFileModifier|string $overrider the ini file overriding the master ini file (object or filename)
     */
    function __construct($master, $overrider) {
        if (is_object($master))
            $this->master = $master;
        else
            $this->master = new jIniFileModifier($master);
        if (is_object($overrider))
            $this->overrider = $overrider;
        else
            $this->overrider = new jIniFileModifier($overrider);
    }

    /**
     * modify an option in the ini file. If the option doesn't exist,
     * it is created.
     * @param string $name    the name of the option to modify
     * @param string $value   the new value
     * @param string $section the section where to set the item. 0 is the global section
     * @param string $key     for option which is an item of array, the key in the array
     * @param boolean $master if true, change the value in the master file, else change
     *                        the value in the overrider file (default)
     */
    public function setValue($name, $value, $section=0, $key=null, $master = false) {
        if ($master) {
            $this->master->setValue($name, $value, $section, $key);
        }
        else {
            $this->overrider->setValue($name, $value, $section, $key);
        }
    }

    /**
     * return the value of an option from the ini files. If the option doesn't exist,
     * it returns null.
     * @param string $name    the name of the option to retrieve
     * @param string $section the section where the option is. 0 is the global section
     * @param string $key     for option which is an item of array, the key in the array
     * @param boolean $masterOnly if true, get the value from the master file, else
     *                        get the value from the overrider file or from the master file
     *                        if the value doesn't exists in the overrider file (default)
     * @return mixed the value
     */
    public function getValue($name, $section=0, $key=null, $masterOnly = false) {
        if ($masterOnly) {
            return $this->master->getValue($name, $section, $key);
        }
        else {
            $val = $this->overrider->getValue($name, $section, $key);
            if( $val === null)
                $val = $this->master->getValue($name, $section, $key);
            return $val;
        }
    }

    /**
     * save the ini files
     */
    public function save() {
        $this->master->save();
        $this->overrider->save();
    }

    /**
     * says if the ini content has been modified
     * @return boolean
     * @since 1.2
     */
    public function isModified() {
        return $this->master->isModified() || $this->overrider->isModified();
    }

    /**
     * @return jIniFileModifier the first ini file
     * @since 1.2
     */
    public function getMaster() {
        return $this->master;
    }
    
    /**
     * @return jIniFileModifier the second ini file
     * @since 1.2
     */
    public function getOverrider() {
        return $this->overrider;
    }
}

