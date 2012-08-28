<?php
/**
* @package  jelix
* @subpackage core
* @author   Laurent Jouanneau
* @copyright 2005-2011 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence  GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * static class which loads the configuration
 * @package  jelix
 * @subpackage core
 * @static
 */
class jConfig {

    /**
     * this is a static class, so private constructor
     */
    private function __construct (){ }

    /**
     * load and read the configuration of the application
     * The combination of all configuration files (the given file
     * and the defaultconfig.ini.php) is stored
     * in a single temporary file. So it calls the jConfigCompiler
     * class if needed
     * @param string $configFile the config file name
     * @return object it contains all configuration options
     * @see jConfigCompiler
     */
    static public function load($configFile){
        $config=array();
        $file = jApp::tempPath();
        if(BYTECODE_CACHE_EXISTS)
            $file .= str_replace('/','~',$configFile).'.conf.php';
        else
            $file .= str_replace('/','~',$configFile).'.resultini.php';
        $compil=false;
        if(!file_exists($file)){
            // no cache, let's compile
            $compil=true;
        }else{
            $t = filemtime($file);
            $dc = jApp::configPath('defaultconfig.ini.php');
            if( (file_exists($dc) && filemtime($dc)>$t)
                || filemtime(jApp::configPath($configFile))>$t){
                // one of the two config file have been modified: let's compile
                $compil=true;
            }else{

                // let's read the cache file
                if(BYTECODE_CACHE_EXISTS){
                    include($file);
                    $config = (object) $config;
                }else{
                    $config = parse_ini_file($file,true);
                    $config = (object) $config;
                }
                // we check all directories to see if it has been modified
                if($config->compilation['checkCacheFiletime']){
                    foreach($config->_allBasePath as $path){
                        if(!file_exists($path) || filemtime($path)>$t){
                            $compil = true;
                            break;
                        }
                    }
                }
            }
        }
        if($compil){
            require_once(JELIX_LIB_CORE_PATH.'jConfigCompiler.class.php');
            return jConfigCompiler::readAndCache($configFile);
        }else
            return $config;
    }
}

