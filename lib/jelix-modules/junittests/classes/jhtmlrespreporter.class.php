<?php
/**
* @package     jelix
* @subpackage  junittests
* @author     Laurent Jouanneau
* @contributor
* @copyright  2005-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require_once(LIB_PATH.'/simpletest/unit_tester.php');
require_once(LIB_PATH.'/simpletest/reporter.php');
require_once(LIB_PATH.'diff/diffhtml.php');

class jHtmlRespReporter extends SimpleReporter {
   protected $_response;

   function setResponse($response) {
      $this->_response = $response;
   }

   function paintHeader($test_name) {
      $this->_response->title=$test_name;
      $this->_response->body->append('MAIN','<h2>'.$test_name.'</h2>');
   }

   function paintFooter($test_name) {
      $colour = ($this->getFailCount() + $this->getExceptionCount() > 0 ? "resultfail" : "resultsuccess");
      $str = "<div class=\"$colour\">";
      $str.= $this->getTestCaseProgress() . "/" . $this->getTestCaseCount();
      $str.= " test cases complete:\n";
      $str.= "<strong>" . $this->getPassCount() . "</strong> passes, ";
      $str.= "<strong>" . $this->getFailCount() . "</strong> fails and ";
      $str.= "<strong>" . $this->getExceptionCount() . "</strong> exceptions.";
      $str.= "</div>\n";
      $this->_response->body->append('MAIN',$str);
   }

   /*function paintPass($message) {
      parent::paintPass($message);

      $str = "<span class=\"pass\">Pass</span>: ";
      $breadcrumb = $this->getTestList();
      array_shift($breadcrumb);
      $str.= implode(" -&gt; ", $breadcrumb);
      $str.= " -&gt; " . $this->_htmlEntities($message) . "<br />\n";
      $this->_response->body->append('MAIN',$str);
   }*/

   function paintFail($message) {
      parent::paintFail($message);

      $str = "<span class=\"fail\">Fail</span>: ";
      $breadcrumb = $this->getTestList();
      array_shift($breadcrumb);
      $str.= implode(" -&gt; ", $breadcrumb);
      $str.= " -&gt; " . $this->_htmlEntities($message) . "<br />\n";
      $this->_response->body->append('MAIN',$str);
   }

   function paintException($exception) {
      parent::paintException($exception);
      $str=  "<span class=\"exception\">Exception</span>: ";
      $breadcrumb = $this->getTestList();
      array_shift($breadcrumb);
      $str.=  implode(" -&gt; ", $breadcrumb);
      $str.=  'Unexpected exception of type [' . get_class($exception) .
        '] with message [<strong>"'. $this->_htmlEntities($exception->getMessage()) .
        '</strong>] in ['. $this->_htmlEntities($exception->getFile()) .
        ' line ' . $exception->getLine() . "]<br />\n";

      $this->_response->body->append('MAIN',$str);
   }

    function paintError($message) {
        parent::paintError($message);
        $str = "<span class=\"fail\">Exception</span>: ";
        $breadcrumb = $this->getTestList();
        array_shift($breadcrumb);
        $str .= implode(" -&gt; ", $breadcrumb);
        $str .= " -&gt; <strong>" . $this->_htmlEntities($message) . "</strong><br />\n";
        $this->_response->body->append('MAIN',$str);
    }


    function paintSkip($message) {
        parent::paintSkip($message);
         $str = "<span class=\"pass\">Skipped</span>: ";
        $breadcrumb = $this->getTestList();
        array_shift($breadcrumb);
        $str .= implode(" -&gt; ", $breadcrumb);
        $str .= " -&gt; " . $this->_htmlEntities($message) . "<br />\n";
        $this->_response->body->append('MAIN',$str);
    }


   function paintMessage($message) {
      $this->_response->body->append('MAIN','<p>'.$message.'</p>');
   }

   function paintFormattedMessage($message) {
      $this->_response->body->append('MAIN','<pre>' . $this->_htmlEntities($message) . '</pre>');
   }

   function paintDiff($stringA, $stringB){
$this->_response->body->append('MAIN','<!--A:'.$stringA.'-->');
$this->_response->body->append('MAIN','<!--B:'.$stringB.'-->');
        $diff = new Diff(explode("\n",$stringA),explode("\n",$stringB));
        if($diff->isEmpty()) {
            $this->_response->body->append('MAIN','<p>Erreur diff : bizarre, aucune différence d\'aprés la difflib...</p>');
        }else{
            $fmt = new HtmlUnifiedDiffFormatter();
            $this->_response->body->append('MAIN',$fmt->format($diff));
        }
   }

   function _htmlEntities($message) {
      return htmlentities($message, ENT_COMPAT, jApp::config()->charset);
   }
}

?>