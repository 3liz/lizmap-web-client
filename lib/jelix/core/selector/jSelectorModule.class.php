<?php
/**
* see jISelector.iface.php for documentation about selectors. Here abstract class for many selectors
*
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @copyright   2005-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * base class for all selector concerning module files
 *
 * General syntax for them : "module~resource".
 * Syntax of resource depend on the selector type.
 * module is optional.
 * @package    jelix
 * @subpackage core_selector
 */
abstract class jSelectorModule implements jISelector {
    public $module = null;
    public $resource = null;

    protected $type = '_module';
    protected $_dirname='';
    protected $_suffix='';
    protected $_cacheSuffix='.php';
    protected $_path;
    protected $_cachePath;
    protected $_compiler = null;
    protected $_compilerPath;
    protected $_useMultiSourceCompiler=false;

    function __construct ($sel) {
        if(jelix_scan_module_sel($sel, $this)){
            if($this->module ==''){
                $this->module = jApp::getCurrentModule ();
            }
            $this->_createPath();
            $this->_createCachePath();
        }else{
            throw new jExceptionSelector('jelix~errors.selector.invalid.syntax', array($sel,$this->type));
        }
    }

    public function getPath (){
        return $this->_path;
    }

    public function getCompiledFilePath (){
        return $this->_cachePath;
    }

    public function getCompiler(){
        if($this->_compiler == null) return null;
        $n = $this->_compiler;
        require_once($this->_compilerPath);
        $o = new $n();
        return $o;
    }

    public function useMultiSourceCompiler(){
        return $this->_useMultiSourceCompiler;
    }

    public function toString($full=false){
        if($full)
            return $this->type.':'.$this->module.'~'.$this->resource;
        else
            return $this->module.'~'.$this->resource;
    }

    protected function _createPath(){

        if(!isset(jApp::config()->_modulesPathList[$this->module])){
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $this->toString(true));
        }
        $this->_path = jApp::config()->_modulesPathList[$this->module].$this->_dirname.$this->resource.$this->_suffix;
        if (!is_readable ($this->_path)){
            if($this->type == 'loc'){
                throw new Exception('(202) The file of the locale key "'.$this->toString().'" (charset '.$this->charset.', lang '.$this->locale.') does not exist');
            }elseif($this->toString() == 'jelix~errors.selector.invalid.target'){
                throw new Exception("Jelix Panic ! don't find localization files to show you an other error message !");
            }else{
                throw new jExceptionSelector('jelix~errors.selector.invalid.target', array($this->toString(), $this->type));
            }
        }
    }

    protected function _createCachePath(){
        $this->_cachePath = jApp::tempPath('compiled/'.$this->_dirname.$this->module.'~'.$this->resource.$this->_cacheSuffix);
    }
}
