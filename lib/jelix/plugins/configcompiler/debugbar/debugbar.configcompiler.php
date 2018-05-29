<?php
/**
* @package      jelix
* @subpackage   core_config_plugin
* @author       Laurent Jouanneau
* @copyright    2012 Laurent Jouanneau
* @link         http://jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


class debugbarConfigCompilerPlugin implements \jelix\core\ConfigCompilerPluginInterface {

    function getPriority() {
        return 20;
    }

    function atStart($config) {
        if (strpos($config->jResponseHtml['plugins'], 'debugbar') !== false) {
            $all = $config->logger['_all'];
            if (strpos($all, 'memory') === false) {
                if (trim($all) == '') {
                    $all = 'memory';
                }
                else
                    $all.=',memory';
            }
            $config->logger['_all'] = $all;
        }
    }

    function onModule($config, $moduleName, $modulePath, $xml) {
        
    }

    function atEnd($config) {
        
    }
}
