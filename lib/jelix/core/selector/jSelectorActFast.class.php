<?php
/**
* see jISelector.iface.php for documentation about selectors. 
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @contributor Thibault Piront (nuKs)
* @copyright   2005-2012 Laurent Jouanneau
* @copyright   2007 Thibault Piront
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Special Action selector for jcoordinator
 * Don't use it ! Only for internal purpose.
 * @internal
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorActFast extends jSelectorModule {
    protected $type = 'act';
    /**
     * @var string type of request
     */
    public $request = '';
    public $controller = '';
    public $method='';
    protected $_dirname='actions/';

    /**
     * @var string $requestType type of request ('classic', 'soap'...)
     * @param $module
     * @param $action
     * @throws jExceptionSelector
     */
    function __construct($requestType, $module, $action){
        $this->module = $module;
        $r = explode(':',$action);
        if(count($r) == 1){
            $this->controller = 'default';
            $this->method = $r[0]==''?'index':$r[0];
        }else{
            $this->controller = $r[0]=='' ? 'default':$r[0];
            $this->method = $r[1]==''?'index':$r[1];
        }
        if (substr($this->method,0,2) == '__')
            throw new jExceptionSelector('jelix~errors.selector.method.invalid', $this->toString());
        $this->resource = $this->controller.':'.$this->method;
        $this->request = $requestType;
        $this->_createPath();
    }

    protected function _createPath(){
        if(!isset(jApp::config()->_modulesPathList[$this->module])){
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $this->toString());
        }else{
            $this->_path = jApp::config()->_modulesPathList[$this->module].'controllers/'.$this->controller.'.'.$this->request.'.php';
        }
    }

    protected function _createCachePath(){
        $this->_cachePath = '';
    }

    public function toString($full=false){
        if($full)
            return $this->type.':'.$this->module.'~'.$this->resource.'@'.$this->request;
        else
            return $this->module.'~'.$this->resource.'@'.$this->request;
    }

    public function getClass(){
        return $this->controller.'Ctrl';
    }

    public function isEqualTo(jSelectorActFast $otherAction) {
        return ($this->module == $otherAction->module &&
                $this->controller == $otherAction->controller &&
                $this->method == $otherAction->method &&
                $this->request == $otherAction->request
                );
    }
}
