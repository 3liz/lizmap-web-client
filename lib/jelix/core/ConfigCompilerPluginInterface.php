<?php
/**
* @package      jelix
* @subpackage   core
* @author       Laurent Jouanneau
* @copyright    2012 Laurent Jouanneau
* @link         http://jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

namespace jelix\core;

/**
 * interface for plugins of jConfigCompiler
 */
interface ConfigCompilerPluginInterface {

    /**
     * lower number is higher priority. Numbers lower than 50 are reserved
     * @return integer the level of priority
     */
    function getPriority();

    /**
     * called before processing module informations
     * @param object $config the configuration object
     */
    function atStart($config);

    /**
     * called for each activated modules
     * @param object $config the configuration object
     * @param string $moduleName the module name
     * @param string $modulePath the path to the module directory
     * @param SimpleXml $moduleXml the xml object representing the content of module.xml of the module
     */
    function onModule($config, $moduleName, $modulePath, $moduleXml);

    /**
     * called after processing module informations
     * @param object $config the configuration object
     */
    function atEnd($config);

}