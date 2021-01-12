<?php

use PHPUnit\Framework\TestCase;
use Lizmap\App;
use Lizmap\Request;

require_once __DIR__.'/ClassesForTests.php';

class ProxyTest extends TestCase
{
    public function setUp()
    {
        $appContext = new testContext();
        Request\Proxy::setServices(new lizmapServices(array(), (object)array(), false, '', $appContext));
        Request\Proxy::setAppContext($appContext);
    }

    public function getBuildData()
    {
        $requestXmlWMS = '  <getcapabilities service="wms"></getcapabilities>';
        $requestXmlWFS = '  <getcapabilities service="wfs"></getcapabilities>';
        $requestXmlWMTS = '  <getcapabilities service="wmts"></getcapabilities>';
        $paramsService = array(
            'service' => 'wms'
        );
        $paramsRequest = array(
            'request' => 'getcapabilities'
        );
        return array(
            array(null, $requestXmlWMS, Request\WMSRequest::class),
            array(null, $requestXmlWFS, Request\WFSRequest::class),
            array(null, $requestXmlWMTS, Request\WMTSRequest::class),
            array(array_merge($paramsRequest, $paramsService), null, Request\WMSRequest::class),
            array($paramsRequest, $requestXmlWMS, Request\WMSRequest::class),
            array($paramsService, $requestXmlWFS, Request\WFSRequest::class),
            array($paramsRequest, null, null),
            array($paramsService, null, Request\WMSRequest::class),
            array(null, null, null)
        );
    }

    /**
     * @dataProvider getBuildData
     */
    public function testBuild($params, $requestXml, $expectedClass)
    {
        $project = new ProjectForOGC();
        $requestObj = Request\Proxy::build($project, $params, $requestXml);
        if (!$expectedClass) {
            $this->assertNull($requestObj);
        } else {
            $this->assertInstanceOf($expectedClass, $requestObj);
        }
    }

    public function getNormalizeParamsData()
    {
        $paramsNormal = array(
            'service' => 'WMS',
            'request' => 'getcapabilities',
        );
        $expectedNormal = array(
            'request' => 'getcapabilities',
            'service' => 'WMS'
        );
        $paramsBlock = array(
            'service' => 'WMS',
            'action' => 'select',
            'repository' => 'montpellier'
        );
        $expectedBlock = array(
            'service' => 'WMS',
        );
        $paramsBbox = array(
            'service' => 'WMS',
            'bbox' => '0.0123456,1.654321,6.6543211,4.424242'
        );
        $expectedBbox = array(
            'bbox' => '0.012346,1.654321,6.654321,4.424242',
            'service' => 'WMS'
        );
        return array(
            array($paramsNormal, $expectedNormal),
            array($paramsBlock, $expectedBlock),
            array($paramsBbox, $expectedBbox),
        );
    }
    
    /**
     * @dataProvider getNormalizeParamsData
     */
    public function testNormalizeParams($params, $expectedData)
    {
        $data = Request\Proxy::normalizeParams($params);
        $this->assertEquals($expectedData, $data);
    }

    public function getConstructUrlData()
    {
        $paramsNormal = array(
            'service' => 'WMS',
            'request' => 'getmap'
        );
        $resultNormal = 'https://localhost?service=WMS&request=getmap';
        $paramsReplace = array(
            'service' => 'WMS',
            'request' => 'getmap',
            'test_replace' => 'other replace'
        );
        $resultReplace = 'https://localhost?service=WMS&request=getmap&test%5Freplace=other%20replace';
        $resultUrl = 'https://google.com?service=WMS&request=getmap';
        return array(
            array($paramsNormal, $resultNormal, null),
            array($paramsReplace, $resultReplace, null),
            array($paramsNormal, $resultUrl, 'https://google.com'),
        );
    }

    /**
     * @dataProvider getConstructUrlData
     */
    public function testConstructUrl($params, $expectedUrl, $url)
    {
        $services = (object)array(
            'wmsServerURL' => 'https://localhost'
        );
        $result = Request\Proxy::constructUrl($params, $services, $url);
        $this->assertEquals($expectedUrl, $result);
    }

    public function getBuildOptionsData()
    {
        $optionsStr = 'proxyHttp';
        $options = array(
            'method' => 'POST',
            'referer' => 'referer'
        );
        $expectedStr = array(
            'method' => 'post',
            'referer' => '',
            'headers' => array(),
            'proxyHttpBackend' => 'proxyHttp',
            'debug' => 'on',
            'body' => '',
        );
        $expectedNull = array(
            'method' => 'post',
            'referer' => '',
            'headers' => array(),
            'proxyHttpBackend' => 'proxy',
            'debug' => 'on',
            'body' => '',
        );
        $expectedArray = array(
            'method' => 'post',
            'referer' => 'referer',
            'headers' => array(),
            'proxyHttpBackend' => 'proxy',
            'debug' => 'off',
            'body' => '',
        );
        return array(
            array($optionsStr, 'post', 'on', $expectedStr),
            array(null, 'post', 'on', $expectedNull),
            array($options, 'post', 'on', $expectedArray),
        );
    }

    /**
     * @dataProvider getBuildOptionsData
     */
    public function testBuildOptions($options, $method, $debug, $expectedResult)
    {
        $services = (object)array(
            'proxyHttpBackend' => 'proxy',
            'debugMode' => 'off',
        );
        ProxyForTests::setServices($services);
        $result = ProxyForTests::buildOptionsForTest($options, $method, $debug);
        $this->assertEquals($expectedResult, $result);
    }

    public function getBuildHeadersData()
    {
        $options1 = array(
            'method' => 'get',
            'headers' => array(),
            'body' => ''
        );
        $expectedHeaders1 = array(
            'Connection' => 'close',
            'User-Agent' => ini_get('user_agent') ?: 'Lizmap',
            'Accept' => '*/*',
            'X-Lizmap-User' => '',
            'X-Lizmap-User-Groups' => '',
        );
        $options2 = array(
            'method' => 'post',
            'headers' => array('test' => 'test'),
            'body' => '',
        );
        $expectedHeaders2 = array(
            'Connection' => 'close',
            'User-Agent' => ini_get('user_agent') ?: 'Lizmap',
            'Accept' => '*/*',
            'Content-type' => 'application/x-www-form-urlencoded',
            'test' => 'test',
            'X-Lizmap-User' => '',
            'X-Lizmap-User-Groups' => '',
        );
        $options3 = array(
            'method' => 'post',
            'headers' => array(),
            'body' => 'not empty',
            'loginFilteredOverride' => 'test login filter'
        );
        $expectedHeaders3 = array(
            'Connection' => 'close',
            'User-Agent' => ini_get('user_agent') ?: 'Lizmap',
            'Accept' => '*/*',
            'Content-type' => 'application/x-www-form-urlencoded',
            'X-Lizmap-Override-Filter' => 'test login filter',
            'X-Lizmap-User' => '',
            'X-Lizmap-User-Groups' => '',
        );
        return array(
            array($options1, $expectedHeaders1, ''),
            array($options2, $expectedHeaders2, 'test=test', 'http://localhost'),
            array($options3, $expectedHeaders3, 'not empty'),
        );
    }

    /**
     * @dataProvider getBuildHeadersData
     */
    public function testBuildHeaders($options, $expectedHeaders, $expectedBody, $expectedUrl = null)
    {
        $url = 'http://localhost?test=test';
        ProxyForTests::setServices((object)array('wmsServerURL' => 'http://localhost', 'wmsServerHeaders' => array()));
        list($url, $result) = ProxyForTests::buildHeadersForTests($url, $options);
        $this->assertEquals($expectedHeaders, $result['headers']);
        $this->assertEquals($expectedBody, $result['body']);
        if ($expectedUrl) {
            $this->assertEquals($expectedUrl, $url);
        }
    }

    public function getUserHttpHeadersData()
    {
        return array(
            array(false, null, null, '', ''),
            array(true, array('login' => 'alagroy-'), array('admin'), 'alagroy-', 'admin'),
            array(true, array('login' => 'alagroy-'), array('admin', 'users'), 'alagroy-', 'admin, users'),
        );
    }

    /**
     * @dataProvider getUserHttpHeadersData
     */
    public function testUserHttpHeader($connected, $userSession, $userGroups, $expectedUser, $expectedGroups)
    {
        $contextResult = array(
            'userIsConnected' => $connected,
            'userSession' => (object)$userSession,
            'groups' => $userGroups
        );
        $testContext = new testContext();
        $testContext->setResult($contextResult);
        ProxyForTests::setAppContext($testContext);
        $userHeaders = ProxyForTests::userHttpHeadersForTests();
        $this->assertEquals($expectedUser, $userHeaders['X-Lizmap-User']);
        $this->assertEquals($expectedGroups, $userHeaders['X-Lizmap-User-Groups']);
    }
}