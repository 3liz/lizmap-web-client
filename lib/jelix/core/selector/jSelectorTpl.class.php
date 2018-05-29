<?php
/**
 * see jISelector.iface.php for documentation about selectors. Here abstract class for many selectors
 *
 * @package     jelix
 * @subpackage  core_selector
 * @author      Laurent Jouanneau
 * @copyright   2005-2018 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */


/**
 * Template selector
 *
 * syntax : "module~tplName".
 * file : templates/tplName.tpl .
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorTpl extends jSelectorModule {
    protected $type = 'tpl';
    protected $_dirname = 'templates/';
    protected $_suffix = '.tpl';
    protected $_where;
    public $outputType='';
    public $trusted=true;
    public $userModifiers = array();
    public $userFunctions = array();

    /**
     * @param string $sel the template selector
     * @param string $outputtype  the type of output (html, text..) By default, it takes the response type
     * @param boolean $trusted  says if the template file is trusted or not
     */
    function __construct($sel, $outputtype='', $trusted=true){
        if($outputtype == '') {
            if(jApp::coord()->response)
                $this->outputType = jApp::coord()->response->getFormatType();
            else
                $this->outputType = jApp::coord()->request->defaultResponseType;
        } else
            $this->outputType = $outputtype;
        $this->trusted = $trusted;
        $this->_compiler='jTplCompiler';
        $this->_compilerPath=JELIX_LIB_PATH.'tpl/jTplCompiler.class.php';
        parent::__construct($sel);
    }

    protected function _createPath(){

        if(!isset(jApp::config()->_modulesPathList[$this->module])){
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $this->toString());
        }

        $locale = jApp::config()->locale;
        $fallbackLocale = jApp::config()->fallbackLocale;
        $path = $this->module.'/'.$this->resource;
        $lpath = $this->module.'/'.$locale.'/'.$this->resource;
        $flpath = '';

        if ($locale != $fallbackLocale && $fallbackLocale) {
            $flpath = $this->module.'/'.$fallbackLocale.'/'.$this->resource;
        }

        if(($theme = jApp::config()->theme) != 'default'){
            // check if there is a redefined template for the current theme
            $this->_where = 'themes/'.$theme.'/'.$lpath;
            $this->_path = jApp::varPath($this->_where.'.tpl');
            if (is_readable ($this->_path)){
                return;
            }

            if ($flpath) {
                $this->_where = 'themes/'.$theme.'/'.$flpath;
                $this->_path = jApp::varPath($this->_where.'.tpl');
                if (is_readable ($this->_path)){
                    return;
                }
            }

            // check if there is a redefined template for the current localized theme
            $this->_where = 'themes/'.$theme.'/'.$path;
            $this->_path = jApp::varPath($this->_where.'.tpl');
            if (is_readable ($this->_path)){
                return;
            }
        }

        // check if there is a redefined template for the default theme
        $this->_where = 'themes/default/'.$lpath;
        $this->_path = jApp::varPath($this->_where.'.tpl');
        if (is_readable ($this->_path)){
            return;
        }

        if ($flpath) {
            $this->_where = 'themes/default/'.$flpath;
            $this->_path = jApp::varPath($this->_where.'.tpl');
            if (is_readable ($this->_path)){
                return;
            }
        }

        $this->_where = 'themes/default/'.$path;
        $this->_path = jApp::varPath($this->_where.'.tpl');
        if (is_readable ($this->_path)){
            return;
        }

        // else check if the template exists in the current module
        $mpath = jApp::config()->_modulesPathList[$this->module].$this->_dirname;
        $this->_path = $mpath.$locale.'/'.$this->resource.'.tpl';
        if (is_readable ($this->_path)){
            $this->_where = 'modules/'.$lpath;
            return;
        }

        if ($flpath) {
            $this->_path = $mpath.$fallbackLocale.'/'.$this->resource.'.tpl';
            if (is_readable ($this->_path)){
                $this->_where = 'modules/'.$flpath;
                return;
            }
        }

        $this->_path = $mpath.$this->resource.'.tpl';
        if (is_readable ($this->_path)){
            $this->_where = 'modules/'.$path;
            return;
        }

        throw new jExceptionSelector('jelix~errors.selector.invalid.target', array($this->toString(), "template"));

    }

    protected function _createCachePath(){
        // don't share the same cache for all the possible dirs
        // in case of overload removal
        $this->_cachePath = jApp::tempPath('compiled/templates/'.$this->_where.'_'.$this->outputType.($this->trusted?'_t':'').'_15'.$this->_cacheSuffix);
    }
}