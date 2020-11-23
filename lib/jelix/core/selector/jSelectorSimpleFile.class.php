<?php
/**
* see jISelector.iface.php for documentation about selectors. Here abstract class for many selectors
*
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @copyright   2005-2020 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * base class for simple file selector
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorSimpleFile implements jISelector {
    protected $type = 'simplefile';
    public $file = '';
    protected $_path;
    protected $_basePath='';

    function __construct($sel){
        if(preg_match("/^([\w_\-\.\/]+)$/", $sel, $m)){
            $this->file = $m[1];
            $this->_path = $this->_basePath.$m[1];
        }else{
            throw new jExceptionSelector('jelix~errors.selector.invalid.syntax', array($sel,$this->type));
        }
    }

    public function getPath (){
        return $this->_path;
    }

    public function toString($full=false){
        if($full)
            return $this->type.':'.$this->file;
        else
            return $this->file;
    }
    public function getCompiler(){ return null;}
    public function useMultiSourceCompiler() { return false;}
    public function getCompiledFilePath (){ return '';}
}
