<?php
/**
* @package      jelix
* @subpackage   core_config_plugin
* @author       Laurent Jouanneau
* @copyright    2012 Laurent Jouanneau
* @link         http://jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


class responsesConfigCompilerPlugin implements \jelix\core\ConfigCompilerPluginInterface {

    function getPriority() {
        return 15;
    }

    function atStart($config) {
        $this->_initResponsesPath($config, 'responses');
        $this->_initResponsesPath($config, '_coreResponses');
    }

    function onModule($config, $moduleName, $modulePath, $xml) {
        
    }

    function atEnd($config) {
        
    }

    /**
     * get all physical paths of responses file
     */
    protected function _initResponsesPath($config, $list){
        $copylist = $config->$list; // because we modify $list and then it will search for "foo.path" responses...
        foreach ($copylist as $type=>$class) {
            if (strpos($class,'app:') === 0) {
                $config->{$list}[$type] = $class = substr($class, 4);
                $config->{$list}[$type.'.path'] = $path = jApp::appPath('responses/'.$class.'.class.php');
                if (file_exists($path))
                    continue;
            }
            else if (preg_match('@^(?:module:)?([^~]+)~(.+)$@', $class, $m)) {
                $mod = $m[1];
                if (isset($config->_modulesPathList[$mod])) {
                    $class = $m[2];
                    $path = $config->_modulesPathList[$mod].'responses/'.$class.'.class.php';
                    $config->{$list}[$type] = $class;
                    $config->{$list}[$type.'.path'] = $path;
                    if (file_exists($path))
                        continue;
                }
                else
                    $path = $class;
            }
            else if (file_exists($path=JELIX_LIB_CORE_PATH.'response/'.$class.'.class.php')) {
                $config->{$list}[$type.'.path'] = $path;
                continue;
            }
            else if (file_exists($path=jApp::appPath('responses/'.$class.'.class.php'))) {
                $config->{$list}[$type.'.path'] = $path;
                continue;
            }
            throw new Exception('Error in main configuration on responses parameters -- the class file of the response type "'.$type.'" is not found ('.$path.')',12);
        }
    }
}
