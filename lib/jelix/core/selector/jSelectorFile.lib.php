<?php
/**
* see jISelector.iface.php for documentation about selectors. Here abstract class for many selectors
*
* @package     jelix
* @subpackage  core_selector
* @author      Laurent Jouanneau
* @copyright   2005-2008 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
 * Selector for files stored in the var directory
 *
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorVar extends jSelectorSimpleFile {
    protected $type = 'var';
    function __construct($sel){
        $this->_basePath = jApp::varPath();
        parent::__construct($sel);
    }
}

/**
 * Selector for files stored in the config directory
 *
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorCfg extends jSelectorSimpleFile {
    protected $type = 'cfg';
    function __construct($sel){
        $this->_basePath = jApp::configPath();
        parent::__construct($sel);
    }
}

/**
 * Selector for files stored in the temp directory
 *
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorTmp extends jSelectorSimpleFile {
    protected $type = 'tmp';
    function __construct($sel){
        $this->_basePath = jApp::tempPath();
        parent::__construct($sel);
    }
}

/**
 * Selector for files stored in the log directory
 *
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorLog extends jSelectorSimpleFile {
    protected $type = 'log';
    function __construct($sel){
        $this->_basePath = jApp::logPath();
        parent::__construct($sel);
    }
}

/**
 * Selector for files stored in the lib directory
 *
 * @package    jelix
 * @subpackage core_selector
 */
class jSelectorLib extends jSelectorSimpleFile {
    protected $type = 'lib';
    function __construct($sel){
        $this->_basePath = LIB_PATH;
        parent::__construct($sel);
    }
}

