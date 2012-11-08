<?php
/**
 * @package    jelix
 * @subpackage core
 * @author     Laurent Jouanneau
 * @copyright  2005-2012 Laurent Jouanneau
 *   Idea of this class was picked from the Copix project (CopixInclude, Copix 2.3dev20050901, http://www.copix.org)
 * @link       http://www.jelix.org
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * interface for compiler which needs only one source file
 * @package  jelix
 * @subpackage core
 */
interface jISimpleCompiler {
    /**
     * parse the given file, and store the result in a cache file
     * @param jSelector $aSelector the file selector
     * @return boolean true : process ok
     */
    public function compile($aSelector);
}

/**
 * interface for compiler which needs many source files
 * @package  jelix
 * @subpackage core
 */
interface jIMultiFileCompiler {

    /**
     * parse one of needed file
     * @param string $sourceFile the file selector
     * @param string $module    the module name of the file
     * @return boolean true : process ok
     */
    public function compileItem($sourceFile, $module);

    /**
     * save the results in a temporary file
     * called at the end of the compilation.
     * @param string $cachefile the name of cache file
     */
    public function endCompile($cachefile);
}
/**
 * This object is responsible to load cache files.
 * Some jelix files needs to be compiled in PHP (templates, daos etc..) and their
 * correspondant php content are stored in a cache file.
 * jIncluder verify that cache file exists, is not obsolete, and if not,
 * it calls the correspondant compiler.
 * And then include the cache.
 * @package  jelix
 * @subpackage core
 * @author     Laurent Jouanneau
 * @copyright  2001-2005 CopixTeam, 2005-2006 Laurent Jouanneau
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html .
 * few line of code are copyrighted Copyright 2001-2005 CopixTeam (LGPL licence)
 * and piked from CopixInclude class of Copix 2.3dev20050901 framework.
 * initial author : Laurent Jouanneau
 */
class jIncluder {
    /**
     * list of loaded cache file.
     * It avoids to do all verification when a file is include many time
     * @var array
     */
    protected static $_includedFiles = array();

    /**
     * This is a static class, so private constructor
     */
    private function __construct(){}

    /**
     * includes cache of the correspondant file selector
     * check the cache, compile if needed, and include the cache
     * @param    jISelector   $aSelectorId    the selector corresponding to the file
    */
    public static function inc($aSelector){

        $cachefile = $aSelector->getCompiledFilePath();

        if($cachefile == '' || isset(jIncluder::$_includedFiles[$cachefile])){
            return;
        }

        $mustCompile = jApp::config()->compilation['force'] || !file_exists($cachefile);

        if(!$mustCompile && jApp::config()->compilation['checkCacheFiletime']){
            $sourcefile = $aSelector->getPath();
            if($sourcefile == '' || !file_exists($sourcefile)){
                throw new jException('jelix~errors.includer.source.missing',array( $aSelector->toString(true)));
            }
            if( filemtime($sourcefile) > filemtime($cachefile))
                $mustCompile = true;
        }

        if($mustCompile){
            $compiler = $aSelector->getCompiler();
            if($compiler && $compiler->compile($aSelector)){
                require($cachefile);
                jIncluder::$_includedFiles[$cachefile]=true;
            }
            else {
                throw new jException('jelix~errors.includer.source.compile',array( $aSelector->toString(true)));
            }
        }else{
            require($cachefile);
            jIncluder::$_includedFiles[$cachefile]=true;
        }
    }

    /**
     * include a cache file which is the results of the compilation of multiple file sotred in multiple modules
    * @param    array    $aType
    *    = array(
    *    'compilator class name',
    *    'relative path of the compilator class file to lib/jelix/',
    *    'foo.xml', // file name to compile (in each modules)
    *    'foo.php',  //cache filename
    *    );
    */
    public static function incAll($aType){

        $cachefile = jApp::tempPath('compiled/'.$aType[3]);
        if(isset(jIncluder::$_includedFiles[$cachefile])){
            return;
        }

        $config = jApp::config();
        $mustCompile = $config->compilation['force'] || !file_exists($cachefile);

        if(!$mustCompile && $config->compilation['checkCacheFiletime']){
            $compiledate = filemtime($cachefile);
            foreach($config->_modulesPathList as $module=>$path){
                $sourcefile = $path.$aType[2];
                if (is_readable ($sourcefile)){
                    if( filemtime($sourcefile) > $compiledate){
                        $mustCompile = true;
                        break;
                    }
                }
            }
        }

        if($mustCompile){
            require_once(JELIX_LIB_PATH.$aType[1]);
            $compiler = new $aType[0];
            $compileok = true;
            foreach($config->_modulesPathList as $module=>$path){
                $compileok = $compiler->compileItem($path.$aType[2], $module);
                if(!$compileok) break;
            }

            if($compileok){
                $compiler->endCompile($cachefile);
                require($cachefile);
                jIncluder::$_includedFiles[$cachefile]=true;
            }
        }else{
            require($cachefile);
            jIncluder::$_includedFiles[$cachefile]=true;
        }
    }
}
