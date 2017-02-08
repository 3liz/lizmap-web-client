<?php
/**
* @package     jelix
* @subpackage  installer
* @author      Laurent Jouanneau
* @copyright   2008 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* EXPERIMENTAL
* a class to install a module.
* @package     jelix
* @subpackage  installer
* @experimental
* @deprecated
* @since 1.2
*/
class jInstallerComponentPlugin extends jInstallerComponentBase {

    protected $identityNamespace = 'http://jelix.org/ns/plugin/1.0';
    protected $rootName = 'plugin';
    protected $identityFile = 'plugin.xml';


    function getInstaller($ep, $installWholeApp) {
        throw new Exception("Not implemented");
    }

    function getUpgraders($ep) {
        throw new Exception("Not implemented");
    }
}

