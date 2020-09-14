<?php


class lizmapWktTest extends PHPUnit_Framework_TestCase {

    function testPoint() {
        $wkt = 'POINT (30 10)';
        $geom = lizmapWkt::parse($wkt);

        $this->assertFalse($geom === null);
        $this->assertTrue(array_key_exists('type', $geom));
        $this->assertEquals($geom['type'], 'Point');
        $this->assertTrue(array_key_exists('coordinates', $geom));
        $this->assertEquals(count($geom['coordinates']), 2);
    }

    function testLineString() {
        $wkt = 'LINESTRING (30 10, 10 30, 40 40)';
        $geom = lizmapWkt::parse($wkt);

        $this->assertFalse($geom === null);
        $this->assertTrue(array_key_exists('type', $geom));
        $this->assertEquals($geom['type'], 'LineString');
        $this->assertTrue(array_key_exists('coordinates', $geom));
        $this->assertEquals(count($geom['coordinates']), 3);
    }

    function testPolygon() {
        $wkt = 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertFalse($geom === null);
        $this->assertTrue(array_key_exists('type', $geom));
        $this->assertEquals($geom['type'], 'Polygon');
        $this->assertTrue(array_key_exists('coordinates', $geom));
        $this->assertEquals(count($geom['coordinates']), 1);
        $this->assertEquals(count($geom['coordinates'][0]), 5);

        $wkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertFalse($geom === null);
        $this->assertTrue(array_key_exists('type', $geom));
        $this->assertEquals($geom['type'], 'Polygon');
        $this->assertTrue(array_key_exists('coordinates', $geom));
        $this->assertEquals(count($geom['coordinates']), 2);
        $this->assertEquals(count($geom['coordinates'][0]), 5);
        $this->assertEquals(count($geom['coordinates'][1]), 4);
    }
}