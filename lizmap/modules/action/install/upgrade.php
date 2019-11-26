<?php
/**
* @package   lizmap
* @subpackage action
* @author    3liz
* @copyright 2011-2019 3liz
* @link      http://3liz.com
* @license   Mozilla Public License : http://www.mozilla.org/MPL/
*/

class actionModuleUpgrader extends jInstallerModule {

    function install() {
        // Copy CSS and JS assets
        //$this->copyDirectoryContent('www', jApp::wwwPath());
    }
}
