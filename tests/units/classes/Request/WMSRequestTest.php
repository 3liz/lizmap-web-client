<?php

use Lizmap\Project\Repository;
use PHPUnit\Framework\TestCase;
use Lizmap\Request\WMSRequest;

require_once __DIR__.'/ClassesForTests.php';

class WMSRequestTest extends TestCase
{
    public function testParameters()
    {
        $params = array(
            'request' => 'falseRequest',
            'service' => 'WMS',
        );
        $expectedParams = array(
            'request' => 'falseRequest',
            'service' => 'WMS',
            'map' => null,
            'Lizmap_User' => '',
            'Lizmap_User_Groups' => '',
        );
        $wms = new WMSRequest(new ProjectForOGC(), $params, null, new testContext());
        $this->assertEquals($expectedParams, $wms->parameters());
        $params = array(
            'request' => 'getmap',
            'service' => 'WMS',
        );
        $expectedParams = array(
            'request' => 'getmap',
            'service' => 'WMS',
            'map' => null,
            'Lizmap_User' => '',
            'Lizmap_User_Groups' => '',
        );
        $proj = new ProjectForOGC();
        $proj->setRepo(new Repository('key', array(), '', null, new testContext()));
        $wms = new WMSRequest($proj, $params, null, new testContext());
        $this->assertEquals($expectedParams, $wms->parameters());
    }

    public function getParametersWithFilterData()
    {
        $loginFilters = array(
            'layer1' => array(
                'filter' => 'test',
            ),
            'layer2' => array(
                'filter' => 'other test'
            )
        );
        return array(
            array(array(), null, null),
            array(array('layer' => array('filter' => '')), 'layer:filter', 'layer:filter'),
            array($loginFilters, 'layer1:filter;layer:dontExists', 'layer1:filter;layer:dontExists')
        );
    }

    /**
     * @dataProvider getParametersWithFilterData
     */
    public function testParametersWithFilters($loginFilter, $filter, $expectedFilter)
    {
        $proj = new ProjectForOGC();
        $proj->setRepo(new Repository('key', array(), '', null, new testContext()));
        $proj->loginFilters = $loginFilter;
        $testContext = new testContext();
        $testContext->setResult(array('lizmap.tools.loginFilteredLayers.override' => false));
        $params = array(
            'request' => 'getmap',
            'service' => 'WMS',
        );
        if ($filter) {
            $params['filter'] = $filter;
        }
        $wms = new WMSRequest($proj, $params, null, $testContext);
        $parameters = $wms->parameters();
        if ($expectedFilter) {
            $this->assertEquals($expectedFilter, $parameters['filter']);
        } else {
            $this->assertArrayNotHasKey('filter', $parameters);
        }
    }

    public function getGetContextData()
    {
        $responseNoUrl = (object)array(
            'code' => 200,
            'mime' => 'text/xml',
            'data' => '<whatever><nourl/></whatever>',
        );

        $responseSimpleUrl = (object)array(
            'code' => 200,
            'mime' => 'text/xml',
            'data' => '<whatever><location xlink:href="test.google.com"/></whatever>',
        );

        $expectedResponseSimpleUrl = (object)array(
            'code' => 200,
            'mime' => 'text/xml',
            'data' => '<whatever><location xlink:href="http://localhost?repo=test&amp;project=test&amp;&amp;"/></whatever>',
        );

        $responseMultiplesUrl = (object)array(
            'code' => 200,
            'mime' => 'text/xml',
            'data' => '<xml>
            <tagtest xlink:href="http://localhost?test=test&otherTest=test"/>
            <otherTagTest>
            <just to=see if=itsworking xlink:href=""/>
            </otherTagTest>
            </xml>',
        );

        $expectedResponseMultiplesUrl = (object)array(
            'code' => 200,
            'mime' => 'text/xml',
            'data' => '<xml>
            <tagtest xlink:href="http://localhost?repo=test&amp;project=test&amp;&amp;"/>
            <otherTagTest>
            <just to=see if=itsworking xlink:href="http://localhost?repo=test&amp;project=test&amp;&amp;"/>
            </otherTagTest>
            </xml>',
        );

        return array(
            array($responseNoUrl, 'http://localhost?repo=test&project=test', $responseNoUrl),
            array($responseSimpleUrl, 'http://localhost?repo=test&project=test', $expectedResponseSimpleUrl),
            array($responseSimpleUrl, 'http://localhost?repo=test&project=test', $expectedResponseSimpleUrl),
        );
    }

    /**
     * @dataProvider getGetContextData
     */
    public function testGetContext($response, $url, $expectedResponse)
    {
        $proj = new ProjectForOGC();
        $proj->setKey('proj');
        $proj->setRepo(new Repository('key', array(), '', null, new testContext()));
        $testContext = new testContext();
        $testContext->setResult(array('fullUrl' => $url));
        $wmsMock = $this->getMockBuilder(WMSRequestForTests::class)->setMethods(['request'])->setConstructorArgs([$proj, array(), null, $testContext])->getMock();
        $wmsMock->method('request')->willReturn($response);
        $newResponse = $wmsMock->getContextForTests();
        foreach($expectedResponse as $prop => $value) {
            $this->assertEquals($value, $newResponse->$prop);
        }
    }

    public function getCheckMaximumWidthHeightData()
    {
        return array(
            array(50, 25, 50, 25, false, false),
            array(50, 25, 50, 25, true, false),
            array(50, 25, 50, 55, false, false),
            array(50, 55, 50, 25, true, false),
            array(50, 55, 50, '', true, true),
            array(50, 55, 50, '', false, true),
        );
    }

    /**
     * @dataProvider getCheckMaximumWidthHeightData
     */
    public function testCheckMaximumWidthHeight($width, $maxWidth, $height, $maxHeight, $useServices, $expectedBool)
    {
        $params = array(
            'width' => $width,
            'height' => $height
        );
        $proj = new ProjectForOGC();
        $proj->setData('wmsMaxWidth', $useServices ? '' : $maxWidth);
        $proj->setData('wmsMaxHeight', $useServices ? '' : $maxHeight);
        $services = (object)array(
            'wmsMaxWidth' => $useServices ? $maxWidth : '',
            'wmsMaxHeight' => $useServices ? $maxHeight : '',
        );
        $wms = new WMSRequestForTests($proj, $params, $services, new testContext());
        $this->assertEquals($expectedBool, $wms->checkMaximumWidthHeightForTests());
    }

    public function getUseCacheData()
    {
        return array(
            array(array(), null, false, false, 'web'),
            array(array('width' => 50, 'height' => 50), null, 'true', false, 'web'),
            array(array('width' => 50, 'height' => 50), 'not null', 'true', true, 'web'),
            array(array('width' => 50, 'height' => 51), null, 'true', false, 'web'),
            array(array('width' => 50, 'height' => 51), 'not null', 'true', true, 'web'),
            array(array('width' => 50, 'height' => 351), 'not null', 'true', false, 'gis'),
            array(array('width' => 50, 'height' => 351), null, 'true', false, 'gis'),
        );
    }

    /**
     * @dataProvider getUseCacheData
     */
    public function testUseCache($params, $cacheDriver, $cached, $expectedUseCache, $expectedWmsClient)
    {
        $testContext = new testContext();
        $testContext->setResult(array('cacheDriver' => $cacheDriver));
        $wms = new WMSRequestForTests(new ProjectForOGC(), array(), null, $testContext);
        $configLayer = (object)array('cached' => $cached);
        list($useCache, $wmsClient) = $wms->useCacheForTests($configLayer, $params, '');
        $this->assertEquals($expectedUseCache, $useCache);
        $this->assertEquals($expectedWmsClient, $wmsClient);
    }
}