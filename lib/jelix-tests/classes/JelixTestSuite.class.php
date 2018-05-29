<?php

/**
 * @package     jelix
 * @subpackage  jelix-tests
 * @author      Laurent Jouanneau
 * @copyright   2011-2012 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */
class JelixTestSuite extends PHPUnit_Framework_TestSuite {
    protected $module = null;

    public function __construct($module) {
        $this->module = $module;
        parent::__construct();
    }

    protected function setUp() {
        parent::setUp();
        jApp::pushCurrentModule($this->module);
    }

    protected function tearDown() {
        jApp::popCurrentModule();
    }
}