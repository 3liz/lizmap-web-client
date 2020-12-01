<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__.'/ClassesForTests.php';

class OGCRequestTest extends TestCase
{
    public function testParam()
    {
        $params = array(
            'request' => 'getmap',
            'service' => 'WMS',
            'empty' => ''
        );
        $ogc = new OGCRequestForTest(new ProjectForOGC(), $params, null, new testContext());
        foreach ($params as $key => $value) {
            $this->assertEquals($value, $ogc->param($key));
        }
        $this->assertNull($ogc->param('not existing'));
        $default = 'default';
        $this->assertEquals($default, $ogc->param('not existing', $default));
        $this->assertEquals($default, $ogc->param('empty', $default, true));
    }

    public function testParameters()
    {
        $params = array(
            'request' => 'getmap',
            'service' => 'WMS',
        );
        $contextResult = array(
            'userIsConnected' => false
        );
        $expectedParameters = array(
            'request' => 'getmap',
            'service' => 'WMS',
            'map' => null,
            'Lizmap_User' => '',
            'Lizmap_User_Groups' => ''
        );
        $testContext = new testContext();
        $testContext->setResult($contextResult);
        $ogc = new OGCRequestForTest(new ProjectForOGC(), $params, null, $testContext);
        $parameters = $ogc->parameters();
        $this->assertEquals($expectedParameters, $parameters);
        $proj = new ProjectForOGC();
        $proj->setRepo(new Lizmap\Project\Repository('test', array(), '', null, $testContext));
        $contextResult = array(
            'userIsConnected' => true,
            'userSession' => (object)array('login' => 'alagroy-'),
            'groups' => array('admins', 'users'),
        );
        $testContext->setResult($contextResult);
        $expectedParameters = array(
            'request' => 'getmap',
            'service' => 'WMS',
            'map' => null,
            'Lizmap_User' => 'alagroy-',
            'Lizmap_User_Groups' => 'admins, users',
            'Lizmap_Override_Filter' => true
        );
        $ogc = new OGCRequestForTest($proj, $params, null, $testContext);
        $parameters = $ogc->parameters();
        $this->assertEquals($expectedParameters, $parameters);
    }

    public function testProcess()
    {
        $params = array(
            'service' => 'WMS',
            'request' => 'getcapabilities'
        );
        $ogc = $this->getMockBuilder(OGCRequestForTest::class)
            ->setMethods(['getcapabilities'])
            ->setConstructorArgs([new ProjectForOGC(), $params, null, new testContext()])->getMock();
        $ogc->expects($this->once())->method('getcapabilities');
        $ogc->process();
        $params = array(
            'service' => 'WMS',
            'request' => 'not existing method'
        );
        $ogc = $this->getMockBuilder(OGCRequestForTest::class)
            ->setMethods(['serviceException'])
            ->setConstructorArgs([new ProjectForOGC(), $params, null, new testContext()])->getMock();
        $ogc->expects($this->once())->method('serviceException')->with(501);
        $testMock = $ogc->process();
    }
}