<?php
/**
* see jISelector.iface.php for documentation about selectors. 
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2005-2012 Laurent Jouanneau, 2007 Loic Mathaud
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Selector for dao file
 * syntax : "module~daoName".
 * file : daos/daoName.dao.xml
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorDao extends jSelectorModule {
    protected $type = 'dao';
    public $driver;
    protected $_dirname = 'daos/';
    protected $_suffix = '.dao.xml';
    protected $_where;

    function __construct($sel, $driver, $isprofile=true){
        if ($isprofile) {
            $p = jProfiles::get('jdb', $driver);
            if ($p['driver'] == 'pdo') {
                $this->driver = substr($p['dsn'], 0, strpos($p['dsn'],':'));
            }
            else {
                $this->driver = $p['driver'];
            }
        }
        else {
            $this->driver = $driver;
        }
        $this->_compiler='jDaoCompiler';
        $this->_compilerPath=JELIX_LIB_PATH.'dao/jDaoCompiler.class.php';
        parent::__construct($sel);
    }

    protected function _createPath(){

        if(!isset(jApp::config()->_modulesPathList[$this->module])){
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $this->toString());
        }

        // check if the dao was redefined (overloaded)
        $overloadedPath = jApp::varPath('overloads/'.$this->module.'/'.$this->_dirname.$this->resource.$this->_suffix);
        if (is_readable ($overloadedPath)){
           $this->_path = $overloadedPath;
           $this->_where = 'overloaded/';
           return;
        }

        // else check if the module exists in the current module
        $this->_path = jApp::config()->_modulesPathList[$this->module].$this->_dirname.$this->resource.$this->_suffix;

        if (!is_readable ($this->_path)){
            throw new jExceptionSelector('jelix~errors.selector.invalid.target', array($this->toString(), "dao"));
        }
        $this->_where = 'modules/';
    }

    protected function _createCachePath(){
        // don't share the same cache for all the possible dirs
        // in case of overload removal
        $this->_cachePath = jApp::tempPath('compiled/daos/'.$this->_where.$this->module.'~'.$this->resource.'~'.$this->driver.$this->_cacheSuffix);
    }

    public function getDaoClass(){
        return 'cDao_'.$this->module.'_Jx_'.$this->resource.'_Jx_'.$this->driver;
    }
    public function getDaoRecordClass(){
        return 'cDaoRecord_'.$this->module.'_Jx_'.$this->resource.'_Jx_'.$this->driver;
    }
}
