<?php

class JelixTestSuite extends PHPUnit_Framework_TestSuite {
    protected $module = null;

    public function __construct($module) {
        $this->module = $module;
        parent::__construct();
    }

    protected function setUp() {
        parent::setUp();
        jContext::push($this->module);
    }

    protected function tearDown() {
        jContext::pop();
    }
}