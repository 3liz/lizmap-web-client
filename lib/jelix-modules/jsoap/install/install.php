<?php
/**
* @package     jelix
* @subpackage  jsoap module
* @author      Laurent Jouanneau
* @contributor
* @copyright   2009-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


class jsoapModuleInstaller extends jInstallerModule {

    function install() {
        $this->config->setValue('soap', "jsoap~jResponseSoap", "responses");
    }
}