<?php
/**
* @package      jelix
* @subpackage   coord_plugin
* @author       Loic Mathaud
* @copyright    2007 Loic Mathaud
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
* Jelix plugin to use the Zend Framework library
*
* In order not to load Zend at each action, you need to explicitely activate it !
*
* Use the $pluginParams property of the controller
* Example : public $pluginParams = array('index' => array('zd.active' => true));
*/
class zendframeworkCoordPlugin implements jICoordPlugin {
    
    public $config;
    
    /**
    * @param array $config list of configuration parameters
    */
    public function __construct($config) {
        $this->config = $config;
    }

    /**
    * Add the ZF library directory to the include_path
    * Include the Zend Loader class to enable the use of Zend_Loader::loadClass()
    */
    public function beforeAction($params) {
        if (isset($params['zf.active']) && $params['zf.active'] == 'true') {
            set_include_path(get_include_path().PATH_SEPARATOR.$this->config['zendLibPath']);
            include_once($this->config['zendLibPath'].'/Zend/Loader.php');
        }
        return null;
    }

    public function beforeOutput() {}
    public function afterProcess() {}
}

