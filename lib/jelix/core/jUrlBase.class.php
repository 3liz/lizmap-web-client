<?php
/**
* @package     jelix
* @subpackage  core_url
* @author      Laurent Jouanneau
* @copyright   2005-2006 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
 * base class for jUrl and jUrlAction
 * @package  jelix
 * @subpackage core_url
 * @author      Laurent Jouanneau
 * @copyright   2005-2006 Laurent Jouanneau
 */
abstract class jUrlBase {

    /**
     * parameters
     */
    public $params=array();

    /**
    * add or change the value of a parameter
    * @param    string    $name    parameter name
    * @param    string    $value   parameter value
    */
    public function setParam ($name, $value){
        $this->params[$name] = $value;
    }

    /**
    * delete a parameter
    * @param    string    $name    parameter name
    */
    public function delParam ($name){
        if (array_key_exists($name, $this->params))
            unset ($this->params[$name]);
    }

    /**
    * get a parameter value
    * @param string  $name    parameter name
    * @param string  $defaultValue   the default value returned if the parameter doesn't exists
    * @return string the value
    */
    public function getParam ($name, $defaultValue=null){
        return array_key_exists($name, $this->params)? $this->params[$name] :$defaultValue;
    }

    /**
    * Clear parameters
    */
    public function clearParam (){
        $this->params = array ();
    }


    /**
     * get the url string corresponding to the url/action
     * @param boolean $forxml  true: some characters will be escaped
     * @return string
     */
    abstract public function toString($forxml = false);


    /**
     * magic method for echo and others...
     */
    public function __toString(){
        return $this->toString();
    }
}
