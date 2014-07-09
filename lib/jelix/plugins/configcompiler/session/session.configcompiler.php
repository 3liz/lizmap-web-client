<?php
/**
* @package      jelix
* @subpackage   core
* @author       Laurent Jouanneau
* @copyright    2012 Laurent Jouanneau
* @link         http://jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


class sessionConfigCompilerPlugin implements \jelix\core\ConfigCompilerPluginInterface {

    function getPriority() {
        return 5;
    }

    function atStart($config) {
        if($config->sessions['storage'] == 'files'){
            $config->sessions['files_path'] = jFile::parseJelixPath( $config->sessions['files_path'] );
        }

        $config->sessions['_class_to_load'] = array();
        if ($config->sessions['loadClasses'] != '') {
            trigger_error("Configuration: loadClasses is deprecated, use instead autoload configuration in module.xml files", E_USER_NOTICE);
            $list = preg_split('/ *, */',$config->sessions['loadClasses']);
            foreach($list as $sel) {
                if(preg_match("/^([a-zA-Z0-9_\.]+)~([a-zA-Z0-9_\.\\/]+)$/", $sel, $m)){
                    if (!isset($config->_modulesPathList[$m[1]])) {
                        throw new Exception('Error in the configuration file -- in loadClasses parameter, '.$m[1].' is not a valid or activated module');
                    }

                    if( ($p=strrpos($m[2], '/')) !== false){
                        $className = substr($m[2],$p+1);
                        $subpath = substr($m[2],0,$p+1);
                    }else{
                        $className = $m[2];
                        $subpath ='';
                    }

                    $path = $config->_modulesPathList[$m[1]].'classes/'.$subpath.$className.'.class.php';

                    if (!file_exists($path) || strpos($subpath,'..') !== false ) {
                        throw new Exception('Error in the configuration file -- in loadClasses parameter, bad class selector: '.$sel);
                    }
                    $config->sessions['_class_to_load'][] = $path;
                }
                else
                    throw new Exception('Error in the configuration file --  in loadClasses parameter, bad class selector: '.$sel);
            }
        }
    }

    function onModule($config, $moduleName, $modulePath, $xml) {
        
    }

    function atEnd($config) {
        
    }
}
