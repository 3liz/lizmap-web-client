<?php

use Lizmap\Request\Proxy;
use Lizmap\Request\WMTSRequest;

class ProjectForOGC extends ProjectForTests
{
    public function getRelativeQgisPath()
    {
    }
}

class jTplForTests
{
    public function assign($arg1, $arg2)
    {}

    public function fetch($arg1)
    {}
}

class lizmapTilerForTests
{
    public static $tileCapFail = null;

    public static $tileCaps = null;

    public static function getTileCapabilities($project)
    {
        if (self::$tileCapFail) {
            throw new Exception('fail just for test');
        }
        if (self::$tileCaps) {
            return self::$tileCaps;
        }
    }
}

class OGCRequestForTest extends OGCRequest
{
}

class WMTSRequestForTest extends WMTSRequest
{
    public function getCapabilitiesForTests()
    {
        return $this->getcapabilities();
    }
}

class ProxyForTests extends Proxy
{
    public static function buildOptionsForTest($options, $method, $debug)
    {
        return parent::buildOptions($options, $method, $debug);
    }

    public static function buildHeadersForTests($url, $options)
    {
        return parent::buildHeaders($url, $options);
    }

    public static function userHttpHeadersForTests()
    {
        return parent::userHttpHeader();
    }
}