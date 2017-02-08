<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @copyright   2011-2012 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * classes that are mapped to soap types could inherits from this object
 * in order to have some helpers and a better mapping than the default soap mapper
 */
class jSoapObject {

    /**
     * you can give a jFormsBase or an array, containing values
     * that will be mapped to properties of the object.
     * Note that SoapClient do not call the constructor when
     * it does the mapping with soap results.
     * @param array|jFormsBase $data data to hydrate the object
     * @see soapObject::_initFromArray
     */
    function __construct($data = null) {
        if ($data) {
            if ($data instanceof \jFormsBase) {
                $data = $data->getAllData();
            }
            $this->_initFromArray($data);
        }
    }

    /**
     * hydrate the object with values stored into the given
     * associative array. Keys should be name of properties.
     * You can override this method if you want to do specific
     * processing on given values before to set properties.
     * @param array $data
     */
    public function _initFromArray(&$data) {
        foreach($data as $key=>$value) {
            $this->_setData($key, $value);
        }
    }

    /**
     * set the form content with the object properties.
     * Only controls of the form that have the same name
     * of object properties, are set.
     * You can override this methods to do specific
     * settings.
     * @param jFormsBase $form
     */
    public function _fillForm($form) {
        $ar = get_object_vars($this);
        foreach ($ar as $key=>$value) {
            if ($form->getControl($key))
                $form->setData($key, $this->_getData($key));
        }
    }

    /**
     * setter used by _fillForm and _initFromArray.
     * Override it to do specific setting.
     * @param string $key the name of the property to set
     * @param mixed $value the value of the property
     */
    function _setData($key, $value) {
        $this->$key = $value;
    }

    /**
     * getter used by _fillForm and _initFromArray.
     * Override it to do specific processing before returning the value.
     * @param string $key the name of the property to get
     * @return mixed the value
     */
    function _getData($key) {
        return $this->$key;
    }

    /**
     * list of properties that are virtually an array of 0,1 or more elements.
     * When we try to retrieve one of these properties, we will have always
     * an array, even if the soap result did not populate the property,
     * or gave only one object.
     * These properties should not be declared explicitely as PHP properties.
     * @var array
     */
    protected $_mapArray = array();

    /**
     * virtual properties
     */
    protected $_vProp = array();

    /**
     * magic setter for properties that are not explicitely defined.
     * check if the given property is registered into _mapArray
     */
    public function __set($name, $value) {
        if (in_array($name, $this->_mapArray)) {
            if (is_array($value)) {
                $this->_vProp[$name] = $value;
            }
            else
                $this->_vProp[$name] = array($value);
        }
        else {
            $this->$name = $value;
        }
    }

    /**
     * magic getter for properties that are not explicitely defined.
     * @return mixed  an array for properties list in _mapArray, null for others
     */
    public function __get($name) {
        if (!isset ($this->_vProp[$name])) {
            if (in_array($name, $this->_mapArray))
                return ($this->_vProp[$name] = array());
            return null;
        }
        return $this->_vProp[$name];
    }

    public function __isset($name) {
        if (!isset($this->_vProp[$name])) {
            if (in_array($name, $this->_mapArray)) {
                $this->_vProp[$name] = array();
                return true;
            }
            return false;
        }
        return true;
    }

    public function __unset ($name) {
        unset($this->_vProp[$name]);
    }
}
