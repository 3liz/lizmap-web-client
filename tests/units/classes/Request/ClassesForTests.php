<?php

use Lizmap\Request\OGCRequest;
use Lizmap\Request\Proxy;
use Lizmap\Request\WFSRequest;
use Lizmap\Request\WMSRequest;
use Lizmap\Request\WMTSRequest;

class ProjectForOGC extends ProjectForTests
{
    public $loginFilters;

    public function getRelativeQgisPath()
    {
    }

    public function getLoginFilters($layerName, $edition = false)
    {
        return $this->loginFilters;
    }

    public function setData($key, $value)
    {
        $this->data[$key] = $value;
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

class WFSRequestForTests extends WFSRequest {

    public $datasource;

    public $selectFields;

    public $qgisLayer;

    public $appContext;

    public function __construct()
    {}

    public function buildQueryBaseForTests($cnx, $params, $wfsFields)
    {
        return $this->buildQueryBase($cnx, $params, $wfsFields);
    }

    public function getBboxSqlForTests($params)
    {
        return $this->getBboxSql($params);
    }

    public function parseExpFilterForTests($cnx, $params)
    {
        return $this->parseExpFilter($cnx, $params);
    }

    public function parseFeatureIdForTests($cnx, $params)
    {
        return $this->parseFeatureId($cnx, $params);
    }

    public function getQueryOrderForTests($cnx, $params, $wfsFields)
    {
        return $this->getQueryOrder($cnx, $params, $wfsFields);
    }

    public function validateFilterForTests($filter)
    {
        return $this->validateFilter($filter);
    }
}

class WMSRequestForTests extends WMSRequest
{
    public function getContextForTests()
    {
        return $this->getcontext();
    }

    public function checkMaximumWidthHeightForTests()
    {
        return $this->checkMaximumWidthHeight();
    }

    public function useCacheForTests($configLayer, $params, $profile)
    {
        return $this->useCache($configLayer, $params, $profile);
    }
}

class LayerForWFS
{
    public function getSrid()
    {
        return 'SRID';
    }
}

class jDbConnectionForTests
{
    public function encloseName($name)
    {
        return $name;
    }

    public function quote($name)
    {
        return '"'.$name.'"';
    }
}