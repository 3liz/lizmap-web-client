<?php
/**
* @package     jelix
* @subpackage  junittests
* @author      Laurent Jouanneau
* @contributor Christophe Thiriot , Rahal Aboulfeth
* @copyright   2005-2008 Laurent Jouanneau
* @copyright   2008 Christophe Thiriot , 2011 Rahal Aboulfeth
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require_once(LIB_PATH.'/simpletest/unit_tester.php');
require_once(LIB_PATH.'/simpletest/reporter.php');
require_once(LIB_PATH.'diff/difflib.php');

class jTextRespReporter extends SimpleReporter {
    protected $_response;

    function setResponse($response) {
        $this->_response = $response;
    }
   
    function paintSuiteStart(){
        // Nothing here
    }
   
    function paintSuiteEnd(){
        // Nothing here
    }

    function paintHeader($test_name) {
        $this->_response->addContent("\n".$test_name."\n--------------------------------\n");
    }

    function paintFooter($test_name) {
        if ($this->getFailCount() + $this->getExceptionCount() == 0) {
            $this->_response->addContent("OK\n");
        } else {
            $this->_response->addContent("FAILURES!!!\n");
        }
        $this->_response->addContent("Test cases run: " . $this->getTestCaseProgress() .
                "/" . $this->getTestCaseCount() .
                ", Passes: " . $this->getPassCount() .
                ", Failures: " . $this->getFailCount() .
                ", Exceptions: " . $this->getExceptionCount() . "\n");
    }

    function paintFail($message) {
        parent::paintFail($message);
        $this->_response->addContent($this->getFailCount() . ") $message\n");
        $breadcrumb = $this->getTestList();
        array_shift($breadcrumb);
        $this->_response->addContent("\tin " . implode("\n\tin ", array_reverse($breadcrumb)));
        $this->_response->addContent("\n");
    }

    function paintException($message) {
        parent::paintException($message);
        $this->_response->addContent("Exception !!\n");

        $breadcrumb = $this->getTestList();
        array_shift($breadcrumb);
        $this->_response->addContent("\tin " . implode("\n\tin ", array_reverse($breadcrumb)));
        $this->_response->addContent("\n\t " .$message."\n");
    }

    function paintError($message) {
        parent::paintError($message);
        $this->_response->addContent("Error !!\n");

        $breadcrumb = $this->getTestList();
        array_shift($breadcrumb);
        $this->_response->addContent("\tin " . implode("\n\tin ", array_reverse($breadcrumb)));
        $this->_response->addContent("\n\t " .$message."\n");
    }

    function paintMessage($message) {
        $this->_response->addContent($message."\n");
    }

    function paintFormattedMessage($message) {
        $this->_response->addContent($message."\n");
    }

    function paintDiff($stringA, $stringB){
        $diff = new Diff(explode("\n",$stringA),explode("\n",$stringB));
        if($diff->isEmpty()) {
            $this->_response->addContent('<p>Erreur diff : bizarre, aucune différence d\'aprés la difflib...</p>');
        }else{
            $fmt = new UnifiedDiffFormatter();
            $this->_response->addContent($fmt->format($diff));
        }
    }
}

