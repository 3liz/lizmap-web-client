<?php
/**
 * PHPUnit command line execution controller.
 * 
 * This suppose that PHPUnit is installed and declared in include path
 * 
 * @package jelix-tests
 * @author Laurent Jouanneau
 * @contributor  Christophe Thiriot (for some code imported from his jphpunit module)
 */

require_once(__DIR__.'/JelixTestSuite.class.php');
require_once(__DIR__.'/junittestcase.class.php');
require_once(__DIR__.'/junittestcasedb.class.php');


class jelix_TextUI_Command extends PHPUnit_TextUI_Command {

    protected $entryPoint = 'index';

    protected $epInfo = null;

    protected $testType = '';

    protected $version36 = false;

    function __construct() {
        $this->longOptions['all-modules'] = null;
        $this->longOptions['module'] = null;
        $this->longOptions['entrypoint='] = null;
        $this->longOptions['testtype='] = null;
        $this->version36 = (version_compare(PHPUnit_Runner_Version::id(), '3.6')>-1);
        
        if (!$this->version36) {
            require_once('PHPUnit/Runner/TestCollector.php');
            require_once('PHPUnit/Runner/IncludePathTestCollector.php');
        }
    }


    /**
     * @param boolean $exit
     */
    public static function main($exit = TRUE)
    {
        $command = new jelix_TextUI_Command;
        return $command->run($_SERVER['argv'], $exit);
    }


    protected function showMessage($message)
    {
        echo $message;
    }

    protected function createRunner()
    {
        if ($this->version36) {
            $filter = new PHP_CodeCoverage_Filter();
        }
        else {
            $filter = PHP_CodeCoverage_Filter::getInstance();
        }

        $filter->addFileToBlacklist(__FILE__, 'PHPUNIT');

        $filter->addFileToBlacklist(__DIR__.'/JelixTestSuite.class.php', 'PHPUNIT');
        $filter->addFileToBlacklist(__DIR__.'/junittestcase.class.php', 'PHPUNIT');
        $filter->addFileToBlacklist(__DIR__.'/junittestcasedb.class.php', 'PHPUNIT');
        $filter->addFileToBlacklist(dirname(__DIR__).'/phpunit.inc.php', 'PHPUNIT');

        if ($this->version36) {
            return new PHPUnit_TextUI_TestRunner($this->arguments['loader'], $filter);
        }
        else {
            return new PHPUnit_TextUI_TestRunner($this->arguments['loader']);
        }
    }

    protected function handleCustomTestSuite() {

        $modulesTests = -1;

        /*
        $this->options[0] is an array of all options '--xxx'.
          each values is an array(0=>'optionname', 1=>'value if given')
        $this->options[1] is a list of parameters given after options
          it can be array(0=>'test name', 1=>'filename')
        */

        foreach ($this->options[0] as $option) {
            switch ($option[0]) {
                case '--entrypoint':
                    $this->entryPoint = $option[1];
                    break;
                case '--all-modules':
                    $modulesTests = 0;
                    break;
                case '--module':
                    $modulesTests = 1;
                    // test is the module name
                    // testFile is the test file inside the module
                    break;
                case '--testtype':
                    $this->testType = $option[1];
                    break;
            }
        }

        if (isset($this->options[1][1]) && $modulesTests != 0) { // a specifique test file
            $this->arguments['testFile'] = $this->options[1][1];
        } else {
            $this->arguments['testFile'] = '';
        }

        $appInstaller = new jInstallerApplication();
        $this->epInfo = $appInstaller->getEntryPointInfo($this->entryPoint);

        // let's load configuration now, and coordinator. it could be needed by tests
        // (during load of their php files or during execution)
        jApp::setConfig(jConfigCompiler::readAndCache($this->epInfo->configFile, null, $this->entryPoint));
        jApp::setCoord(new jCoordinator('', false));

        if ($modulesTests == 0) {
            // we add all modules in the test list
            $suite = $this->getAllModulesTestSuites();
            if (count($suite)) {
                $this->arguments['test'] = $suite;
                unset ($this->arguments['testFile']);
            }
            else {
                $this->showMessage("Error: no tests in modules\n");
                exit(PHPUnit_TextUI_TestRunner::FAILURE_EXIT);
            }
        }
        else if ($modulesTests == 1 && !$this->version36) {
            $suite = $this->getModuleTestSuite($this->options[1][0]);
            if (count($suite)) {
                $this->arguments['test'] = $suite;
                if (isset($this->options[1][1])) { // a specifique test file
                    $this->arguments['testFile'] = $this->options[1][1];
                } else {
                    $this->arguments['testFile'] = '';
                }
            }
            else {
                $this->showMessage("Error: no tests in the module\n");
                exit(PHPUnit_TextUI_TestRunner::FAILURE_EXIT);
            }
        }
        else if ($modulesTests == 1) {
            if (isset($this->options[1][1])) { // a specifique test file
                $suite = $this->getModuleTestSuite($this->options[1][0], $this->options[1][1]);
            } else {
                $suite = $this->getModuleTestSuite($this->options[1][0]);
            }
            if (count($suite)) {
                $this->arguments['test'] = $suite;
            }
            else {
                $this->showMessage("Error: no tests in the module\n");
                exit(PHPUnit_TextUI_TestRunner::FAILURE_EXIT);
            }
        }
    }

    protected function getAllModulesTestSuites() {


        $moduleList = $this->epInfo->getModulesList();

        $topsuite = new PHPUnit_Framework_TestSuite();

        $type = ($this->testType?'.'.$this->testType: '').'.pu.php';

        foreach ($moduleList as $module=>$path) {
            $suite = new JelixTestSuite($module);
            if ($this->version36) {
                $fileIteratorFacade = new File_Iterator_Facade;
                $files = $fileIteratorFacade->getFilesAsArray(
                  $path,
                  $type
                );
                $suite->addTestFiles($files);
            }
            else {
                $testCollector = new PHPUnit_Runner_IncludePathTestCollector(
                    array($path),
                    $type
                );
                $suite->addTestFiles($testCollector->collectTests());
            }

            if (count($suite->tests()) > 0)
                $topsuite->addTestSuite($suite);
        }
        return $topsuite;
    }


    protected function getModuleTestSuite($module, $testFile = '') {

        $moduleList = $this->epInfo->getModulesList();

        $topsuite = new PHPUnit_Framework_TestSuite();

        if (isset($moduleList[$module])) {
            $type = ($this->testType?'.'.$this->testType: '').'.pu.php';
            $suite = new JelixTestSuite($module);
            if ($this->version36) {
                if ($testFile) {
                    $suite->addTestFile($moduleList[$module].'tests/'.$testFile);
                }
                else {
                    $fileIteratorFacade = new File_Iterator_Facade;
                    $files = $fileIteratorFacade->getFilesAsArray(
                      $moduleList[$module],
                      $type
                    );
                    $suite->addTestFiles($files);
                }
            }
            else {
                $testCollector = new PHPUnit_Runner_IncludePathTestCollector(
                    array($moduleList[$module]),
                    $type
                );
                $suite->addTestFiles($testCollector->collectTests());
            }
            if (count($suite->tests()) > 0)
                $topsuite->addTestSuite($suite);
        }
        return $topsuite;
    }

    protected function showHelp() {
        parent::showHelp();
        echo "

Specific options for Jelix:

       phpunit [switches] --all-modules
       phpunit [switches] --module <modulename> [testfile.pu.php]

  --all-modules           Run tests of all installed modules.
  --module <module>       Run tests of a specific module. An optional filename can be indicated
                          to run a specific test of this module.

  --entrypoint <ep>       Run tests in the context (same configuration) of the given entry point. By default: 'index'
  --testtype <type>       Run only tests of the given type, ie. tests that have a filename suffix like '.<type>.pu.php'

";
    }
}
