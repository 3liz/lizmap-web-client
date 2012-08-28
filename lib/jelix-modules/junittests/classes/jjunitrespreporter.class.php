<?php
/**
 * @package     jelix
 * @subpackage  jtests
 * @author    Rahal Aboulfeth
 * @copyright   2011 Rahal Aboulfeth
 * @link        http://www.jelix.org
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */


require_once(LIB_PATH.'/simpletest/unit_tester.php');
require_once(LIB_PATH.'/simpletest/extensions/junit_xml_reporter.php');
require_once(LIB_PATH.'diff/difflib.php');


/**
 * Junit Xml reporter, based  on junit_xml_reporter , this is a simple decorator that grabs the output from JUnitXMLReporter
 */

class jJunitRespReporter extends JUnitXMLReporter {
    protected $_response;

    function setResponse($response) {
        $this->_response = $response;
    }
    
    function __construct() {
        parent::__construct();

        $this->doc = new DOMDocument();
        $this->doc->loadXML('<testsuite/>');
        $this->root = $this->doc->documentElement;
    }

    function paintHeader($test_name) {
        $this->testsStart = microtime(true);
        
        $this->root->setAttribute('name', $test_name);
        $this->root->setAttribute('timestamp', date('c'));
        $this->root->setAttribute('hostname', 'localhost');

        $this->_response->addContent( "<!-- starting test suite $test_name\n" );
    }
    
    function paintSuiteStart(){
          $this->_response->addContent( "<?xml version=\"1.0\"?>\n<testsuites>" );
    }
    function paintSuiteEnd(){
          $this->_response->addContent( "</testsuites>" );
    }
    
    /**
     * Simple here.. just let XmlReporter ( parent ) do the job
     * just grab all what it is writing 
     */
    protected $startedOb=false;
    function appendToResponse ( $method , $arg1 , $arg2=null ) {
        // One is enough .. ( paintFooter is called from paintGroupEnd ) 
        // Start capture if not started yet
        if ( !$this->startedOb ){
            ob_start();
            $started=$this->startedOb=true;
        }
        $toCall = 'parent::'.$method ;
        try{
            if ($arg2===null)
                parent::$method($arg1);
            else 
                parent::$method($arg1,$arg2);

        } catch ( Exception $e){
            echo " Unkown Exception :".$e->getMessage();
        }
        // grab the content
        $content = ob_get_contents() ; 
        if ($content)
            ob_end_clean();
        $this->_response->addContent( $content );
        // set capture to off if we have started it here
        if (isset($started))    {
            $this->startedOb=false;
        }
    }

    function paintGroupStart($test_name, $size) {
        $this->appendToResponse( 'paintGroupStart' , $test_name  , $size  );
    }

    function paintGroupEnd($test_name) {
        $this->appendToResponse( 'paintGroupEnd' , $test_name );
    }

    function paintCaseStart($test_name) {
        $this->appendToResponse( 'paintCaseStart' , $test_name );
    }

    function paintCaseEnd($test_name) {
        $this->appendToResponse( 'paintCaseEnd' , $test_name );
    }

    function paintMethodStart($test_name) {
        $this->appendToResponse( 'paintMethodStart' , $test_name );
    }

    function paintMethodEnd($test_name) {
        $this->appendToResponse( 'paintMethodEnd' , $test_name );
    }
    /*
    function paintPass($message) {
        // do nothing 
    }*/

    function paintFooter($test_name) {
        $this->appendToResponse( 'paintFooter' , $test_name );
    }

    function paintFail($message) {
        $this->appendToResponse( 'paintFail' , $message  );
    }

    function paintException($message) {
        $this->appendToResponse( 'paintException' , $message  );
    }

    function paintError($message) {
        $this->appendToResponse( 'paintError' , $message  );
    }

    function paintMessage($message) {
        $this->appendToResponse( 'paintMessage' , $message  );
    }

    function paintFormattedMessage($message) {
        $this->appendToResponse( 'paintFormattedMessage' , $message  );
    }

    function paintDiff($stringA, $stringB){
        $diff = new Diff(explode("\n",$stringA),explode("\n",$stringB));
        if($diff->isEmpty()) {
            $this->_response->content.='<p>Diff Error  : weird, no difference said difflib...</p>';
        }else{
            $fmt = new UnifiedDiffFormatter();
            $this->_response->content.=$fmt->format($diff);
        }
    }
}
