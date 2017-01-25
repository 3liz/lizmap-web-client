<?php
/**
* @package     jelix
* @subpackage  controllers
* @author      Loic Mathaud
* @contributor Christophe Thiriot, Laurent Jouanneau
* @copyright   2006 Loic Mathaud, 2007 Christophe Thiriot, 2008-2013 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*
*/

/**
 * a base class for controllers used in command line application
 * @package    jelix
 * @subpackage controllers
 * @since 1.0a3
 */
class jControllerCmdLine extends jController {
    /**
     * help for each action
     * it should be an array('method'=>'help',...);
     * @var array
     */
    public $help = array();

    /**
     *   allowed options
     * @var array
     * @see jCmdUtils::getOptionsAndParams
     */
    protected $allowed_options;

    /**
     *   allowed parameters
     * @var array
     * @see jCmdUtils::getOptionsAndParams
     */
    protected $allowed_parameters;

    /**
     *   founded options
     * @var array
     * @see jCmdUtils::getOptionsAndParams
     */
    protected $_options;

    /**
     *   founded parameters
     * @var array
     * @see jCmdUtils::getOptionsAndParams
     */
    protected $_parameters;

    /**
     *
     * @param jRequest $request
     * @throws jException
     */
    function __construct ($request){
        // we receive null when the controller is created only for help
        if($request == null)
            return;
        $this->request = $request;
        $params = $this->request->params;
        unset($params['module']);
        unset($params['action']);

        $method = jApp::coord()->action->method;

        if( !in_array($method, get_class_methods(get_class($this)))) {
            throw new jException('jelix~errors.cli.unknown.command', $method);
         }
        $opt = isset($this->allowed_options[$method]) ? $this->allowed_options[$method]: array();
        $par = isset($this->allowed_parameters[$method]) ? $this->allowed_parameters[$method]: array();

        list($this->_options,$this->_parameters) = jCmdUtils::getOptionsAndParams($params, $opt, $par);

    }

    protected function param ($parName, $parDefaultValue=null, $useDefaultIfEmpty=false){
        if (isset($this->_parameters[$parName])) {
            if($this->_parameters[$parName] == '' && $useDefaultIfEmpty)
                return $parDefaultValue;
            else
                return $this->_parameters[$parName];
        } else {
            return $parDefaultValue;
        }
    }

    protected function option($name) {
        if (isset($this->_options[$name])) {
            return $this->_options[$name];
        } else {
            return false;
        }
    }
}

