<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2011 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jelixModuleUpgrader_cmd extends jInstallerModule {

    function install() {
        $cmdFile = jApp::appPath('cmd.php');
        if (!file_exists($cmdFile)) {
            $content = "<". "?php
/**
* @package  jelix
* @author   Laurent Jouanneau
* @contributor
* @copyright 2011 Laurent Jouanneau
* @link     http://jelix.org
* @licence  http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/
require (dirname(__FILE__).'/application.init.php');
require(LIB_PATH.'jelix-scripts/includes/cmd.inc.php');
";
            file_put_contents($cmdFile, $content);
        }
    }
}
