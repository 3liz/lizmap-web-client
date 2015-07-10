<?php
/**
 * @package     jelix
 * @subpackage  junittests
 * @author      Laurent Jouanneau
 * @contributor Christophe Thiriot, Rahal Aboulfeth
 * @copyright   2008-2012 Laurent Jouanneau
 * @copyright   2008 Christophe Thiriot, 2011 Rahal Aboulfeth
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Interface to handle controllers output
 *
 */
interface IHandleOutPut {

    const BEFORE = 0;
    const AFTER = 1;

    /**
     * outputs text
     */
    public function output($content, $when=IHandleOutPut::BEFORE);
}

/**
 * Simpletext output mode handler
 *
 */
class txtOutPutHandler implements  IHandleOutPut {

    protected $rep;

    function __construct($rep){
        if ($rep instanceof jResponseCmdline)
        $this->rep = $rep ;
        else throw new Exception ("Bad response " ) ;

    }
    /**
     * Outputs content
     */
    function output($content, $when=IHandleOutPut::BEFORE){
        // delegates to reponse ..
        $this->rep->addContent( $content )  ;
    }
}

/**
 * Xml output handler , handles junit style reporting
 *
 */
class xmlOutPutHandler extends txtOutPutHandler implements IHandleOutPut {

    private $savedOutput = array();

    /**
     * Delays messages printing ( at the end as comments )
     */
    function output($content , $when=IHandleOutPut::BEFORE){
        if ($when==IHandleOutPut::BEFORE)
        $this->savedOutput[]=$content;
        else {
            // Already tried to write..
            if ( count($this->savedOutput)){
                $content = implode ("\n",$this->savedOutput ) ."\n".$content ;
                $this->savedOutput=array();
            }
            // All the output is commented ( xml )
            parent::output( '<!-- '. $content.' -->' , $when ) ;
            // TODO: save to a file ?
            	
        }
    }

}


class defaultCtrl extends jControllerCmdLine {
    protected $allowed_options = array(
            'index' => array('--categ' => true , '--junitoutput' => false , '--output_dir' => true ),
            'help' => array('--categ' => true),
            'module' => array('--categ' => true , '--junitoutput' => false , '--output_dir' => true ),
            'single' => array('--categ' => true , '--junitoutput' => false , '--output_dir' => true ),
    );

    protected $allowed_parameters = array(
            'index' => array(),
            'help' => array(),
            'module' => array('mod'=>true),
            'single' => array('mod'=>true,'test'=>true),
    );



    protected $testsList = array();

    protected function setOutPutHandler($handler){
        $this->output = $handler ;
    }

    /**
     * By default Before test started
     */
    protected function output($content ,$when=IHandleOutPut::BEFORE) {
        $this->output->output($content,$when);
    }

    protected function getReporterType($rep){

        if ($this->option('--junitoutput' )){
            $outputHandler = new xmlOutPutHandler($rep);
            $type = 'jjunitrespreporter' ;
        } else {
            $outputHandler = new txtOutPutHandler($rep);
            $type = 'jtextrespreporter' ;
        }

        // Sets the output handler
        $this->setOutPutHandler($outputHandler);

        return $type;
    }

    protected function _prepareResponse(){
        $rep = $this->getResponse();
        $this->responseType='junittests~'.$this->getReporterType($rep);

        $toOutput='
Unit Tests        php version: '.phpversion().'   Jelix version: '.JELIX_VERSION.'
===========================================================================
';
        $this->output($toOutput , IHandleOutPut::BEFORE);
        $runnerPreparer = jClasses::create('junittests~jrunnerpreparer');
        $this->testsList = $runnerPreparer->getTestsList('cli');
        $this->category = $this->option('--categ' , false );
        $this->testsList = $runnerPreparer->filterTestsByCategory($this->category , $this->testsList );

        return $rep;
    }

    protected function _finishResponse($rep){
        // pour garder compatibilité avec mode reponse txt
        $this->output( "Test Complete" ,IHandleOutPut::AFTER);
        return $rep;
    }

    function help() {
        $rep = $this->_prepareResponse();
        $category = $this->category ? ' '.$this->category : '';
        if(count($this->testsList)){
            foreach($this->testsList as $module=>$tests) {
                $this->output('module "'.$module."\":\n", true);
                foreach($tests as $test){
                    $type = $test[3] ? "  ".$test[3] : "" ;
                    $this->output("\t".$test[2]."\t(".$test[1].$type.")\n", true);
                }
            }
        }
        else {
            $this->output('No available'.$category.' tests');
        }
        return $this->_finishResponse($rep);
    }


    function index() {

        $rep = $this->_prepareResponse();

        $reporter = jClasses::create($this->responseType);
        jClasses::inc('junittests~junittestcase');
        jClasses::inc('junittests~junittestcasedb');
        $reporter->setResponse($rep);
        $category = $this->category ? ' '.$this->category : '';
        if (count($this->testsList)){
            $reporter->paintSuiteStart();
            foreach($this->testsList as $module=>$tests){
                jApp::pushCurrentModule($module);
                $group = new TestSuite('Tests'.$category.' on module '.$module);
                foreach($this->testsList[$module] as $test){
                    $group->addFile(jApp::config()->_modulesPathList[$module].'tests/'.$test[0]);
                }
                $result = $group->run($reporter);
                if (!$result) $rep->setExitCode(jResponseCmdline::EXIT_CODE_ERROR);
                jApp::popCurrentModule();
            }
            $reporter->paintSuiteEnd();
        } else {
            $this->output('No available'.$category.' tests');
        }
        return $this->_finishResponse($rep);
    }


    function module() {

        $rep = $this->_prepareResponse();

        $module = $this->param('mod');
        $category = $this->category ? ' '.$this->category : '';
        if(isset($this->testsList[$module])){
            $reporter = jClasses::create($this->responseType);
            jClasses::inc('junittests~junittestcase');
            jClasses::inc('junittests~junittestcasedb');
            $reporter->setResponse($rep);

            $group = new TestSuite('All'.$category.' tests in "'.$module. '" module');
            foreach($this->testsList[$module] as $test){
                $group->addFile(jApp::config()->_modulesPathList[$module].'tests/'.$test[0]);
            }
            jApp::pushCurrentModule($module);
            $result = $group->run($reporter);
            if (!$result) $rep->setExitCode(jResponseCmdline::EXIT_CODE_ERROR);
            jApp::popCurrentModule();
        } else {
            $this->output('No available'.$category.' tests for module '.$module);
        }
        return $this->_finishResponse($rep);
    }


    function single() {
        $rep = $this->_prepareResponse();

        $module = $this->param('mod');
        $testname = $this->param('test');
        $category = $this->category ? ' '.$this->category : '';
        if(isset($this->testsList[$module])){
            $reporter = jClasses::create($this->responseType);
            jClasses::inc('junittests~junittestcase');
            jClasses::inc('junittests~junittestcasedb');
            $reporter->setResponse($rep);

            foreach($this->testsList[$module] as $test){
                if($test[1] == $testname){
                    $group = new TestSuite('"'.$module. '" module , '.$test[2]);
                    $group->addFile(jApp::config()->_modulesPathList[$module].'tests/'.$test[0]);
                    jApp::pushCurrentModule($module);
                    $result = $group->run($reporter);
                    if (!$result) $rep->setExitCode(jResponseCmdline::EXIT_CODE_ERROR);
                    jApp::popCurrentModule();
                    break;
                }
            }
        }else
        $this->output("\n" . 'no'.$category.' tests for "'.$module.'" module.' . "\n");
        return $this->_finishResponse($rep);
    }
}
?>
