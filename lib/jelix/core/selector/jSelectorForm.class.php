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
 * Form selector
 *
 * syntax : "module~formName".
 * file : forms/formName.form.xml .
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorForm extends jSelectorModule {
    protected $type = 'form';
    protected $_where;
    protected $_dirname = 'forms/';
    protected $_suffix = '.form.xml';

    function __construct($sel){

        $this->_compiler='jFormsCompiler';
        $this->_compilerPath=JELIX_LIB_PATH.'forms/jFormsCompiler.class.php';

        parent::__construct($sel);
    }

    public function getClass(){
        return 'cForm_'.$this->module.'_Jx_'.$this->resource;
    }


    protected function _createPath(){
        if(!isset(jApp::config()->_modulesPathList[$this->module])){
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $this->toString(true));
        }

        // we see if the forms have been redefined
        $overloadedPath = jApp::varPath('overloads/'.$this->module.'/'.$this->_dirname.$this->resource.$this->_suffix);
        if (is_readable ($overloadedPath)){
           $this->_path = $overloadedPath;
           $this->_where = 'overloaded/';
           return;
        }

        $this->_path = jApp::config()->_modulesPathList[$this->module].$this->_dirname.$this->resource.$this->_suffix;
        if (!is_readable ($this->_path)){
            throw new jExceptionSelector('jelix~errors.selector.invalid.target', array($this->toString(), $this->type));
        }
        $this->_where = 'modules/';
    }

    protected function _createCachePath(){
        // don't share the same cache for all the possible dirs
        // in case of overload removal
        $this->_cachePath = jApp::tempPath('compiled/'.$this->_dirname.$this->_where.$this->module.'~'.$this->resource.$this->_cacheSuffix);
    }

    public function getCompiledBuilderFilePath ($type){
        return jApp::tempPath('compiled/'.$this->_dirname.$this->_where.$this->module.'~'.$this->resource.'_builder_'.$type.$this->_cacheSuffix);
    }

}
