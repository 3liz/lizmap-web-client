<?php
/**
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


class viewModuleInstaller extends jInstallerModule {

    function install() {

        if ($this->firstDbExec()) {
            $this->useDbProfile('auth');
            $this->execSQLScript('sql/install');
        }
    }
}
