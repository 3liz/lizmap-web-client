<?php
/**
* @package     jelix
* @subpackage  junittests
* @author      Laurent Jouanneau
* @contributor Christophe Thiriot, Rahal Aboulfeth
* @copyright   2008-2012 Laurent Jouanneau
* @copyright   2008 Christophe Thiriot
* @copyright   2011 Rahal Aboulfeth
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


// used by a usort function
// PHP5.1.2 generates a strict message if I put this function into defaultCtrl class, although it has the static keyword
function JUTcompareTestName($a,$b){ 
    return strcmp($a[0], $b[0]);
}

/**
 * This class prepares the tests to be run
 *
 */
class jRunnerPreparer { 
    
    protected $testList = array();
    
    /*function getTestsList($accesType = 'cli' ){
        $regAcces = ( $accesType=='cli' ) ? '(html_)?cli' : 'html(_cli)?' ;
        $regCategory = '(\\.\w+)?' ;
        foreach(jApp::config()->_modulesPathList as $module=>$path){
            if(file_exists($path.'tests/')){
                $dir = new DirectoryIterator($path.'tests/');
                foreach ($dir as $dirContent) {
                    if ($dirContent->isFile() && preg_match("/^(.+)\\.".$regAcces.$regCategory."\\.php$/", $dirContent->getFileName(), $m) ) {
                        $lib = str_replace('.',': ',$m[1]);
                        $lib = str_replace('_',' ',$lib);
                        $category = isset($m[3]) ? str_replace('.','',$m[3]) : '';
                        $testCategory = $category ? ' ('.$category.')' : '' ;
                        $testName = $category ? $m[1].'.'.$category : $m[1] ;
                        $this->testsList[$module][] = array($dirContent->getFileName(), $testName , $lib.$testCategory , $category ) ;
                    }
                }
                if(isset($this->testsList[$module])){
                    usort($this->testsList[$module], "JUTcompareTestName");
                }
            }
        }
        return $this->testsList;
        
    } */
    const REG_CATEGORY = '(\\.\w+)?' ;
    const REG_CLI = '(html_)?cli';
    const REG_HTML ='html(_cli)?';

    
    function setTestCategory($accesType = 'cli'){
        $this->regAcces = ( $accesType=='cli' ) ? self::REG_CLI : self::REG_HTML ;
    }
    
    function getTestsList($accesType = 'cli'){
        $this->setTestCategory($accesType);
        foreach(jApp::config()->_modulesPathList as $module=>$path){
            if(file_exists($path.'tests/')){
                $dir = new DirectoryIterator($path.'tests/');
                foreach ($dir as $dirContent) {
                    if ($dirContent->isFile()) {
                        if ( $categorisedTest = $this->categoriseTestFile( $dirContent->getFileName() ) ) {
                            $this->testsList[$module][] = $categorisedTest ;
                        }
                    }
                }
                if(isset($this->testsList[$module])){
                    usort($this->testsList[$module], "JUTcompareTestName");
                }
            }
        }
        return $this->testsList;
        
    }
    
    protected function categoriseTestFile($filename){
        if (  preg_match("/^(.+)\\.".$this->regAcces.self::REG_CATEGORY."\\.php$/", $filename, $m)  ){
            $lib = str_replace('.',': ',$m[1]);
            $lib = str_replace('_',' ',$lib);
            $category = isset($m[3]) ? str_replace('.','',$m[3]) : '';
            $testCategory = $category ? ' ('.$category.')' : '' ;
            $testName = $category ? $m[1].'.'.$category : $m[1] ;
            return array($filename, $testName , $lib.$testCategory , $category ) ;
        } else {
            return false;
        }
    }
    
    function filterTestsByCategory( $category = false , $testsList=array() ) { 
        if ( $category ==false || count($testsList)==0 ) {
            return $testsList;
        } else {
            $filtredTestsList = array();
            foreach ( $testsList as $module=> $tests){
                foreach ($tests as $key => $test) {
                    if ($test[3]==$category)
                        $filtredTestsList[$module][] = $test ;
                }
            }
            return $filtredTestsList;
        }
    }
    
}