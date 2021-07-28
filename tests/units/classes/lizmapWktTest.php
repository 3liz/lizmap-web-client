<?php
use PHPUnit\Framework\TestCase;

class lizmapWktTest extends TestCase {

    function testPoint() {
        $wkt = 'POINT (30 10)';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'Point');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(2, $geom['coordinates']);
    }

    function testLineString() {
        $wkt = 'LINESTRING (30 10, 10 30, 40 40)';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'LineString');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(3, $geom['coordinates']);
    }

    function testPolygon() {
        $wkt = 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'Polygon');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(1, $geom['coordinates']);
        $this->assertCount(5, $geom['coordinates'][0]);

        $wkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'Polygon');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(2, $geom['coordinates']);
        $this->assertCount(5, $geom['coordinates'][0]);
        $this->assertCount(4, $geom['coordinates'][1]);
    }
}
