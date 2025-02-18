<?php
use PHPUnit\Framework\TestCase;

class lizmapWktTest extends TestCase {

    function testChecking(): void
    {
        $wktArray = array(
            'POINT (30 10)',
            'POINT(30 10)',
            'MULTIPOINT ((30 10))',
            'MULTIPOINT ((30 10), (40 40))',
            'MULTIPOINT((30 10))',
            'LINESTRING (30 10, 10 30, 40 40)',
            'LINESTRING(30 10, 10 30, 40 40)',
            'MULTILINESTRING ((30 10, 10 30, 40 40))',
            'MULTILINESTRING ((30 10, 10 30, 40 40), (20 30, 35 35))',
            'MULTILINESTRING((30 10, 10 30, 40 40))',
            'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))',
            'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))',
            'POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))',
            'MULTIPOLYGON (((30 10, 40 40, 20 40, 10 20, 30 10)))',
            'MULTIPOLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))',
            'MULTIPOLYGON(((30 10, 40 40, 20 40, 10 20, 30 10)))',
            'GEOMETRY (((30 10, 40 40, 20 40, 10 20, 30 10)))',
        );
        foreach($wktArray as $wkt) {
            $checked = lizmapWkt::check($wkt);
            $this->assertIsArray($checked, 'The '.$wkt.' has not been checked!');
            $this->assertArrayHasKey('geomType', $checked);
            $this->assertArrayHasKey('dim', $checked);
            $this->assertEquals('', $checked['dim']);
            $this->assertArrayHasKey('str', $checked);
        }

        $zWktArray = array(
            'POINT Z (30 10 0)',
            'POINT Z(30 10 0)',
            'POINTZ(30 10 0)',
            'LINESTRING Z (30 10 0, 10 30 1, 40 40 2)',
            'LINESTRING Z(30 10 0, 10 30 1, 40 40 2)',
            'LINESTRINGZ(30 10 0, 10 30 1, 40 40 2)',
            'POLYGON Z ((30 10 0, 40 40 2, 20 40 1, 10 20 2, 30 10 0))',
            'POLYGON Z((30 10 0, 40 40 2, 20 40 1, 10 20 2, 30 10 0))',
            'POLYGONZ((30 10 0, 40 40 2, 20 40 1, 10 20 2, 30 10 0))',
        );
        foreach($zWktArray as $wkt) {
            $checked = lizmapWkt::check($wkt);
            $this->assertIsArray($checked, 'The '.$wkt.' has not been checked!');
            $this->assertArrayHasKey('geomType', $checked);
            $this->assertArrayHasKey('dim', $checked);
            $this->assertEquals('z', $checked['dim']);
            $this->assertArrayHasKey('str', $checked);
        }

        $wkt = 'MultiPoint ((15086.677 -105584.25))';
        $checked = lizmapWkt::check($wkt);
        $this->assertIsArray($checked, 'The '.$wkt.' has not been checked!');
        $this->assertArrayHasKey('geomType', $checked);
        $this->assertArrayHasKey('dim', $checked);
        $this->assertEquals('', $checked['dim']);
        $this->assertArrayHasKey('str', $checked);
        $this->assertEquals('(15086.677 -105584.25)', $checked['str']);


        $wkt = 'MultiLineString ((12875.475 -104903.9644, 13191.533 -104786.96, -2699.383 -80765.69))';
        $checked = lizmapWkt::check($wkt);
        $this->assertIsArray($checked, 'The '.$wkt.' has not been checked!');
        $this->assertArrayHasKey('geomType', $checked);
        $this->assertArrayHasKey('dim', $checked);
        $this->assertEquals('', $checked['dim']);
        $this->assertArrayHasKey('str', $checked);
        $this->assertEquals(
            '(12875.475 -104903.9644, 13191.533 -104786.96, -2699.383 -80765.69)',
            $checked['str'],
        );

        $wkt = 'MULTIPOLYGON (((13186.1 -104723.44, 13234.679 -104763.3, 13126.31 -104640.92, 13186.1 -104723.44)))';
        $checked = lizmapWkt::check($wkt);
        $this->assertIsArray($checked, 'The '.$wkt.' has not been checked!');
        $this->assertArrayHasKey('geomType', $checked);
        $this->assertArrayHasKey('dim', $checked);
        $this->assertEquals('', $checked['dim']);
        $this->assertArrayHasKey('str', $checked);
        $this->assertEquals(
            '((13186.1 -104723.44, 13234.679 -104763.3, 13126.31 -104640.92, 13186.1 -104723.44))',
            $checked['str'],
        );

        $notWktArray = array(
            '',
            'POINT',
            'POINT ',
            'POINT()',
            'POINT(A)',
            'POINT(A 10)',
            'POINT(30 A)',
        );
        foreach($notWktArray as $wkt) {
            $this->assertFalse(lizmapWkt::check($wkt), 'The '.$wkt.' has been checked!');
        }
    }

    function testFixing(): void
    {
        // Unfixed WKT
        $wkt = 'POINT (30 10)';
        $nWkt = lizmapWkt::fix($wkt);
        $this->assertEquals($wkt, $nWkt);

        $wkt = 'POINT Z (30 10 0)';
        $nWkt = lizmapWkt::fix($wkt);
        $this->assertEquals($wkt, $nWkt);

        $wkt = 'POINT M (30 10 0)';
        $nWkt = lizmapWkt::fix($wkt);
        $this->assertEquals($wkt, $nWkt);

        $wkt = 'POINT ZM (30 10 0 0)';
        $nWkt = lizmapWkt::fix($wkt);
        $this->assertEquals($wkt, $nWkt);

        $wkt = 'MultiPoint ((15086.677 -105584.25))';
        $nWkt = lizmapWkt::fix($wkt);
        $this->assertEquals(strtoupper($wkt), $nWkt);

        $wkt = 'MultiLineString ((12875.475 -104903.9644, 13191.533 -104786.96, -2699.383 -80765.69))';
        $nWkt = lizmapWkt::fix($wkt);
        $this->assertEquals(strtoupper($wkt), $nWkt);

        $wkt = 'MULTIPOLYGON (((13186.1 -104723.44, 13234.679 -104763.3, 13126.31 -104640.92, 13186.1 -104723.44)))';
        $nWkt = lizmapWkt::fix($wkt);
        $this->assertEquals($wkt, $nWkt);

        // Fixed WKT
        $expectedWkt = 'POINT Z (30 10 0)';
        $wkt = 'POINT Z(30 10 0)';
        $nWkt = lizmapWkt::fix($wkt);
        $this->assertEquals($expectedWkt, $nWkt);

        $wkt = 'POINTZ(30 10 0)';
        $nWkt = lizmapWkt::fix($wkt);
        $this->assertEquals($expectedWkt, $nWkt);
    }

    function testPoint(): void
    {
        $wkt = 'POINT (30 10)';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'Point');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(2, $geom['coordinates']);

        $wkt = 'POINT(30 10)';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'Point');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(2, $geom['coordinates']);
    }

    function testMultiPoint(): void {
        $wkt = 'MULTIPOINT ((30 10))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'MultiPoint');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(1, $geom['coordinates']);
        $this->assertCount(2, $geom['coordinates'][0]);

        $wkt = 'MULTIPOINT ((30 10), (40 40))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'MultiPoint');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(2, $geom['coordinates']);
        $this->assertCount(2, $geom['coordinates'][0]);
        $this->assertCount(2, $geom['coordinates'][1]);

        $wkt = 'MULTIPOINT((30 10))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'MultiPoint');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(1, $geom['coordinates']);
        $this->assertCount(2, $geom['coordinates'][0]);
    }

    function testLineString(): void
    {
        $wkt = 'LINESTRING (30 10, 10 30, 40 40)';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'LineString');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(3, $geom['coordinates']);

        $wkt = 'LINESTRING(30 10, 10 30, 40 40)';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'LineString');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(3, $geom['coordinates']);
    }

    function testMultiLineString(): void
    {
        $wkt = 'MULTILINESTRING ((30 10, 10 30, 40 40))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'MultiLineString');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(1, $geom['coordinates']);
        $this->assertCount(3, $geom['coordinates'][0]);

        $wkt = 'MULTILINESTRING ((30 10, 10 30, 40 40), (20 30, 35 35))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'MultiLineString');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(2, $geom['coordinates']);
        $this->assertCount(3, $geom['coordinates'][0]);
        $this->assertCount(2, $geom['coordinates'][1]);

        $wkt = 'MULTILINESTRING((30 10, 10 30, 40 40))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'MultiLineString');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(1, $geom['coordinates']);
        $this->assertCount(3, $geom['coordinates'][0]);
    }

    function testPolygon(): void
    {
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

        $wkt = 'POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'Polygon');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(1, $geom['coordinates']);
        $this->assertCount(5, $geom['coordinates'][0]);
    }

    function testMultiPolygon(): void
    {
        $wkt = 'MULTIPOLYGON (((30 10, 40 40, 20 40, 10 20, 30 10)))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'MultiPolygon');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(1, $geom['coordinates']);
        $this->assertCount(1, $geom['coordinates'][0]);
        $this->assertCount(5, $geom['coordinates'][0][0]);

        $wkt = 'MULTIPOLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'MultiPolygon');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(1, $geom['coordinates']);
        $this->assertCount(2, $geom['coordinates'][0]);
        $this->assertCount(5, $geom['coordinates'][0][0]);
        $this->assertCount(4, $geom['coordinates'][0][1]);

        $wkt = 'MULTIPOLYGON(((30 10, 40 40, 20 40, 10 20, 30 10)))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNotNull($geom);
        $this->assertArrayHasKey('type', $geom);
        $this->assertEquals($geom['type'], 'MultiPolygon');
        $this->assertArrayHasKey('coordinates', $geom);
        $this->assertCount(1, $geom['coordinates']);
        $this->assertCount(1, $geom['coordinates'][0]);
        $this->assertCount(5, $geom['coordinates'][0][0]);
    }

    function testUnknown(): void
    {
        $wkt = 'GEOMETRY (((30 10, 40 40, 20 40, 10 20, 30 10)))';
        $geom = lizmapWkt::parse($wkt);

        $this->assertNull($geom);
    }
}
