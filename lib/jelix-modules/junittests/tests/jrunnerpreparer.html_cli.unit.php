<?php
/**
* @package     testapp
* @subpackage  junittest module
* @author      Rahal Aboulfeth
* @contributor
* @copyright   2011 Rahal Aboulfeth
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/



require_once( __DIR__.DIRECTORY_SEPARATOR.'../classes/jrunnerpreparer.class.php');

class TestableRunnerPreparer extends jRunnerPreparer{ 

    /**
     * To be able to test a protected method
     */
    public function testableCategoriseTestFile($filename) { 
        return $this->categoriseTestFile($filename);
    }
}

class UTRunnerPreparation extends jUnitTestCase {

    function setUp(){
        $this->runnerPreparer =  new TestableRunnerPreparer() ;
    }
    function tearDown(){
        unset($this->runnerPreparer);
    }
    protected $correctCliFilenames = array(
        'mytest.html_cli.php' => array( 'mytest.html_cli.php' , 'mytest', 'mytest' , '' ) , 
        'mytest_unit.html_cli.unit.php' => array( 'mytest_unit.html_cli.unit.php' , 'mytest_unit.unit' , 'mytest unit (unit)',  'unit' ) ,        
        'mytest.cli.php' => array( 'mytest.cli.php' , 'mytest', 'mytest' , '' ) , 
    
    );
    protected $incorrectCliFilenames = array(
        'mytest_unit.html.unit.php' => false ,
        'mytest_unit.html.php' => false ,
        'mytest_unit.php' => false
    );
    function testFilenameCliCategorisationAcceptsCorrectNames(){
        // testing cli mode
        $this->runnerPreparer->setTestCategory('cli');
        foreach ( $this->correctCliFilenames as $filename=> $expected){
            $this->assertEqual( $this->runnerPreparer->testableCategoriseTestFile($filename) , $expected  );
        }
    }
    function testFilenameCliCategorisationRejectsIncorrectNames(){
        // testing cli mode
        $this->runnerPreparer->setTestCategory('cli');
        foreach ( $this->incorrectCliFilenames as $filename=> $expected){
            $this->assertEqual( $this->runnerPreparer->testableCategoriseTestFile($filename) , $expected  );
        }
    }
    
    protected $correctHtmlFilenames = array(
        'mytest.html_cli.php' => array( 'mytest.html_cli.php' , 'mytest', 'mytest' , '' ) , 
        'mytest_unit.html_cli.unit.php' => array( 'mytest_unit.html_cli.unit.php' , 'mytest_unit.unit' , 'mytest unit (unit)', 'unit' ) ,        
        'mytest.html.php' => array( 'mytest.html.php' , 'mytest', 'mytest' , '' ) , 
    
    );
    protected $incorrectHtmlFilenames = array(
        'mytest_unit.cli.unit.php' => false ,
        'mytest_unit.cli.php' => false,
    	'mytest_unit.php' => false
    );
    
    function testFilenameHtmlCategorisationAcceptsCorrectNames(){
        // testing html mode
        $this->runnerPreparer->setTestCategory('html');
        foreach ( $this->correctHtmlFilenames as $filename=> $expected){
            $this->assertEqual( $this->runnerPreparer->testableCategoriseTestFile($filename) , $expected  );
        }
    }
    
    function testFilenameHtmlCategorisationRejectsIncorrectNames(){
        // testing html mode
        $this->runnerPreparer->setTestCategory('html');
        foreach ( $this->incorrectHtmlFilenames as $filename=> $expected){
            $this->assertEqual( $this->runnerPreparer->testableCategoriseTestFile($filename) , $expected  );
        }
    }
    
    function testCategoryFilteringReturnsAllTestsWhenNoCategoryIsAsked(){
        // testing html mode
        $this->runnerPreparer->setTestCategory('html');
        $testsList= array ('testmodule' =>
                        array (
                            array( 'mytest.html_cli.php' , 'mytest', 'mytest' , '' ) ,
                            array( 'mytest_unit.html_cli.unit.php' , 'mytest_unit.unit' , 'mytest unit (unit)', 'unit' )
                        )
                    ) ;
        
        $filtered = $this->runnerPreparer->filterTestsByCategory( false , $testsList );
        $this->assertEqual($testsList , $filtered );
    }

   
    function testCategoryFilteringReturnsCategoryTestsOnly(){
        // testing html mode
        $this->runnerPreparer->setTestCategory('html');
        $testsList= array ('testmodule' => array (
                        array( 'mytest.html_cli.php' , 'mytest', 'mytest' , '' ) , 
                        array( 'mytest_unit.html_cli.unit.php' , 'mytest_unit.unit' , 'mytest unit (unit)', 'unit' )
                    )
        ) ; 
        $filtered = $this->runnerPreparer->filterTestsByCategory( 'unit' , $testsList );
        $expected =  array ('testmodule' => array (
                    array( 'mytest_unit.html_cli.unit.php' , 'mytest_unit.unit' , 'mytest unit (unit)', 'unit' )
                    )
        ) ; 
        $this->assertEqual($filtered , $expected );
    }
    

}
