<?php

/**
* @package     jelix
* @subpackage  jacldb module
* @author      Laurent Jouanneau
* @copyright   2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class jacldbModuleUpgrader_pluginmoved extends jInstallerModule {

    public $targetVersions = array('1.4');
    public $date = '2012-02-10 09:37';

    function install() {
        $this->declarePluginsPath('module:jacldb');
    }
}