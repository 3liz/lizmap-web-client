<?php

use Lizmap\Request\Proxy;


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
