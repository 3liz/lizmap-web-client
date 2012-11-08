<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2012 Laurent Jouanneau
* @link       http://jelix.org
* @licence    http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
*
* @package    jelix
* @subpackage core
*/
class jConfigAutoloader {


    public function __construct($config) {
        $this->config = $config;
    }

    /**
     * @var object a configuration object readed from an ini file
     * @see jConfig
     */
    protected $config = null;

    /**
     * the method that should be called by the autoload system
     */
    public function loadClass($className) {
        $path = $this->getPath($className);
        if (is_array($path)) {
            foreach($path as $p) {
                if (file_exists($p)) {
                    require($p);
                    return true;
                }
            }
        }
        else if ($path) {
            require($path);
            return true;
        }
        return false;
    }

    /**
     * @return string the full path of the file declaring the given class
     */
    protected function getPath($className) {

        if (!$this->config)
            return '';

        $className = ltrim($className, '\\');

        /*
        [_autoload_class]
        className = includefile
        */
        if (isset($this->config->_autoload_class[$className])) {
            return $this->config->_autoload_class[$className];
        }

        $lastNsPos = strripos($className, '\\');
        if ($lastNsPos !== false) {
            // the class name contains a namespace, let's split ns and class
            $namespace = substr($className, 0, $lastNsPos);
            $class = substr($className, $lastNsPos + 1);
        }
        else {
            $namespace = '';
            $class = &$className;
            // the given class name does not contains namespace
        }

        /*
        [_autoload_namespace]
        namespace = "/path|.ext"
        */
        foreach($this->config->_autoload_namespace as $ns=>$info) {
            if (strpos($className, $ns) === 0) {
                $path = '';
                if ($lastNsPos !== false) {
                    if ($namespace) {
                        $path = str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
                    }
                }

                list($incPath, $ext) = explode('|', $info);
                $fileName = str_replace('_', DIRECTORY_SEPARATOR, $class) . $ext;
                return $incPath.DIRECTORY_SEPARATOR.$path.$fileName;
            }
        }

        /*
        [_autoload_namespacepathmap]
        namespace = "/path|.ext"
        */
        foreach($this->config->_autoload_namespacepathmap as $ns=>$info) {
            if (strpos($className, $ns) === 0) {
                $path = '';
                if ($lastNsPos !== false) {
                    $namespace = substr($namespace, strlen($ns)+1);
                    if ($namespace) {
                        $path = str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
                    }
                }
                list($incPath, $ext) = explode('|', $info);
                $fileName = str_replace('_', DIRECTORY_SEPARATOR, $class) . $ext;
                return $incPath.DIRECTORY_SEPARATOR.$path.$fileName;
            }
        }

        /*
        [_autoload_classpattern]
        regexp[] = "regexp"
        path[]= "/path|ext"
        */
        if (isset($this->config->_autoload_classpattern['regexp'])) {
            foreach ($this->config->_autoload_classpattern['regexp'] as $k=>$reg) {
                if (preg_match($reg, $className)) {
                    list($incPath, $ext) = explode('|', $this->config->_autoload_classpattern['path'][$k]);
                    return $incPath. DIRECTORY_SEPARATOR .$className.$ext;
                }
            }
        }

        /*
        [_autoload_includepath]
        path[]="/path|.ext"
        */
        $pathList = array();
        if (isset($this->config->_autoload_includepath['path'])) {
            foreach($this->config->_autoload_includepath['path'] as $info) {
                list($incPath, $ext) = explode('|',$info);
                if ($namespace)
                    $path = str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
                else $path = '';
                $pathList[] = $incPath.DIRECTORY_SEPARATOR.$path.str_replace('_', DIRECTORY_SEPARATOR, $class) . $ext;
            }
        }

        /*
        [_autoload_includepathmap]
        path[]="/path|.ext"
        */
        if (isset($this->config->_autoload_includepathmap['path'])) {
            foreach($this->config->_autoload_includepathmap['path'] as $info) {
                list($incPath, $ext) = explode('|',$info);
                $pathList[] = $incPath.DIRECTORY_SEPARATOR.str_replace('_', DIRECTORY_SEPARATOR, $class) . $ext;
            }
        }
        if (count($pathList)) {
            return $pathList;
        }
        return '';
    }
}

