<?php
/**
* see jISelector.iface.php for documentation about selectors. 
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @copyright   2005-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * selector for business class
 *
 * business class is a class stored in classname.class.php file in the classes/ module directory
 * or one of its subdirectory.
 * syntax : "module~classname" or "module~classname.
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorClass extends jSelectorModule {
    protected $type = 'class';
    protected $_dirname = 'classes/';
    protected $_suffix = '.class.php';

    /**
    * subpath part in the resource content
    * @since 1.0b2
    */
    public $subpath ='';
    /**
    * the class name specified in the selector
    * @since 1.0b2
    */
    public $className = '';

    function __construct($sel){
        if(preg_match("/^(([a-zA-Z0-9_\.]+)~)?([a-zA-Z0-9_\.\\/]+)$/", $sel, $m)){
            if($m[1]!='' && $m[2]!=''){
                $this->module = $m[2];
            }else{
                $this->module = jContext::get ();
            }
            $this->resource = $m[3];
            if( ($p=strrpos($m[3], '/')) !== false){
                $this->className = substr($m[3],$p+1);
                $this->subpath = substr($m[3],0,$p+1);
            }else{
                $this->className = $m[3];
                $this->subpath ='';
            }
            $this->_createPath();
            $this->_createCachePath();
        }else{
            throw new jExceptionSelector('jelix~errors.selector.invalid.syntax', array($sel,$this->type));
        }
    }

    protected function _createPath(){
        if (!isset(jApp::config()->_modulesPathList[$this->module])) {
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $this->toString());
        }
        $this->_path = jApp::config()->_modulesPathList[$this->module].$this->_dirname.$this->subpath.$this->className.$this->_suffix;

        if (!file_exists($this->_path) || strpos($this->subpath,'..') !== false ) { // second test for security issues
            throw new jExceptionSelector('jelix~errors.selector.invalid.target', array($this->toString(), $this->type));
        }
    }

    protected function _createCachePath(){
        $this->_cachePath = '';
    }

    public function toString($full=false){
        if($full)
            return $this->type.':'.$this->module.'~'.$this->subpath.$this->className;
        else
            return $this->module.'~'.$this->subpath.$this->className;
    }
}