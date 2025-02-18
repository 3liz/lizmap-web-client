<?php

use PHPUnit\Framework\TestCase;

class OGCRequestTest extends TestCase
{
    public function testParam(): void
    {
        $params = array(
            'request' => 'getmap',
            'service' => 'WMS',
            'empty' => ''
        );
        $ogc = new OGCRequestForTests(new ProjectForOGCForTests(), $params, null);
        foreach ($params as $key => $value) {
            $this->assertEquals($value, $ogc->param($key));
        }
        $this->assertNull($ogc->param('not existing'));
        $default = 'default';
        $this->assertEquals($default, $ogc->param('not existing', $default));
        $this->assertEquals($default, $ogc->param('empty', $default, true));
    }

    public function testParameters(): void
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
        $testContext = new ContextForTests();
        $testContext->setResult($contextResult);

        $ogc = new OGCRequestForTests(new ProjectForOGCForTests($testContext), $params, null);
        $parameters = $ogc->parameters();
        $this->assertEquals($expectedParameters, $parameters);


        $proj = new ProjectForOGCForTests($testContext);
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
        $ogc = new OGCRequestForTests($proj, $params, null);
        $parameters = $ogc->parameters();
        $this->assertEquals($expectedParameters, $parameters);
    }

    public function testProcess(): void
    {
        $params = array(
            'service' => 'WMS',
            'request' => 'getcapabilities'
        );
        $ogc = $this->getMockBuilder(OGCRequestForTests::class)
            ->onlyMethods(['process_getcapabilities'])
            ->setConstructorArgs([new ProjectForOGCForTests(), $params, null])
            ->getMock();
        $ogc->expects($this->once())->method('process_getcapabilities');
        $ogc->process();
        $params = array(
            'service' => 'WMS',
            'request' => 'not existing method'
        );
        $ogc = $this->getMockBuilder(OGCRequestForTests::class)
            ->onlyMethods(['serviceException'])
            ->setConstructorArgs([new ProjectForOGCForTests(), $params, null])
            ->getMock();
        $ogc->expects($this->once())->method('serviceException')->with(501);
        $testMock = $ogc->process();
    }
}
