<?php

use PHPUnit\Framework\TestCase;
use GuzzleHttp\Psr7\Request;
use Lizmap\Request\QgisServerMetadataRequestMatcher;

class QgisServerMetadataRequestMatcherTest extends TestCase
{
    public function testMapHost(): void
    {
        $matcher = new QgisServerMetadataRequestMatcher('http://map:8080/lizmap/server.json');
        $request = new Request(
            'GET',
            'http://map:8080/lizmap/server.json',
        );
        $this->assertTrue($matcher->matches($request));

        $request = new Request(
            'GET',
            'http://map:8080/ows/?SERVICE=WMS&REQUEST=Getcapabilities',
        );
        $this->assertFalse($matcher->matches($request));

        $request = new Request(
            'GET',
            'http://localhost/qgis_mapserv.fcgi/lizmap/server.json',
        );
        $this->assertFalse($matcher->matches($request));
    }

    public function testLocalHost(): void
    {
        $matcher = new QgisServerMetadataRequestMatcher('http://localhost/qgis_mapserv.fcgi/lizmap/server.json');
        $request = new Request(
            'GET',
            'http://localhost/qgis_mapserv.fcgi/lizmap/server.json',
        );
        $this->assertTrue($matcher->matches($request));

        $request = new Request(
            'GET',
            'http://map:8080/lizmap/server.json',
        );
        $this->assertFalse($matcher->matches($request));

        $request = new Request(
            'GET',
            'http://localhost/qgis_mapserv.fcgi?SERVICE=WMS&REQUEST=Getcapabilities',
        );
        $this->assertFalse($matcher->matches($request));
    }
}
