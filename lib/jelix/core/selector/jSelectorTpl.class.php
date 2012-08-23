<?php
/**
* see jISelector.iface.php for documentation about selectors. Here abstract class for many selectors
*
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @copyright   2005-2007 Laurent Jouanneau
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
            if($GLOBALS['gJCoord']->response)
                $this->outputType = $GLOBALS['gJCoord']->response->getFormatType();
            else
                $this->outputType = $GLOBALS['gJCoord']->request->defaultResponseType;
        } else
            $this->outputType = $outputtype;
        $this->trusted = $trusted;
        $this->_compiler='jTplCompiler';
        $this->_compilerPath=JELIX_LIB_PATH.'tpl/jTplCompiler.class.php';
        parent::__construct($sel);
    }

    protected function _createPath(){
        global $gJConfig;
        if(!isset($gJConfig->_modulesPathList[$this->module])){
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $this->toString());
        }

        $path = $this->module.'/'.$this->resource;
        $lpath = $this->module.'/'.$gJConfig->locale.'/'.$this->resource;

        if($gJConfig->theme != 'default'){
            // check if there is a redefined template for the current theme
            $this->_where = 'themes/'.$gJConfig->theme.'/'.$lpath;
            $this->_path = jApp::varPath($this->_where.'.tpl');
            if (is_readable ($this->_path)){
                return;
            }
            // check if there is a redefined template for the current localized theme
            $this->_where = 'themes/'.$gJConfig->theme.'/'.$path;
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

        $this->_where = 'themes/default/'.$path;
        $this->_path = jApp::varPath($this->_where.'.tpl');
        if (is_readable ($this->_path)){
            return;
        }

        // else check if the template exists in the current module
        $this->_path = $gJConfig->_modulesPathList[$this->module].$this->_dirname.$gJConfig->locale.'/'.$this->resource.'.tpl';
        if (is_readable ($this->_path)){
            $this->_where = 'modules/'.$lpath;
            return;
        }

        $this->_path = $gJConfig->_modulesPathList[$this->module].$this->_dirname.$this->resource.'.tpl';
        if (is_readable ($this->_path)){
            $this->_where = 'modules/'.$path;
            return;
        }

        throw new jExceptionSelector('jelix~errors.selector.invalid.target', array($this->toString(), "template"));

    }

    protected function _createCachePath(){
       // don't share the same cache for all the possible dirs
       // in case of overload removal
       $this->_cachePath = jApp::tempPath('compiled/templates/'.$this->_where.'_'.$this->outputType.($this->trusted?'_t':'').$this->_cacheSuffix);
    }
}