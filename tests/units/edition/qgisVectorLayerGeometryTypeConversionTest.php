<?php

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 */
#[CoversNothing]
class qgisVectorLayerGeometryTypeConversionTest extends TestCase
{
    public static function getConversionData()
    {
        return array(
            // same type: nothing to do
            array('polygon', 'POLYGON', 1, ''),
            array('multipolygon', 'MULTIPOLYGON', 2, ''),
            array('point', 'POINT', 1, ''),
            // single geometry into a multi column
            array('multipolygon', 'POLYGON', 1, 'multi'),
            array('multilinestring', 'LINESTRING', 1, 'multi'),
            array('multipoint', 'POINT', 1, 'multi'),
            array('multipolygonz', 'POLYGON', 1, 'multi'),
            array('multilinestringm', 'LINESTRINGM', 1, 'multi'),
            // multi geometry with one part into a single column
            array('polygon', 'MULTIPOLYGON', 1, 'single'),
            array('linestring', 'MULTILINESTRING', 1, 'single'),
            array('point', 'MULTIPOINT', 1, 'single'),
            array('polygonz', 'MULTIPOLYGON', 1, 'single'),
            array('polygonzm', 'MULTIPOLYGONM', 1, 'single'),
            // multi geometry with several parts cannot be stored in a single column
            array('polygon', 'MULTIPOLYGON', 2, ''),
            array('linestring', 'MULTILINESTRING', 3, ''),
            // generic column or different geometry types
            array('geometry', 'MULTIPOLYGON', 1, ''),
            array('polygon', 'MULTILINESTRING', 1, ''),
            array('multipolygon', 'LINESTRING', 1, ''),
            array('polygon', 'GEOMETRYCOLLECTION', 1, ''),
        );
    }

    #[DataProvider('getConversionData')]
    public function testGetGeometryTypeConversion($columnType, $geometryType, $nbGeometries, $expected): void
    {
        $this->assertEquals(
            $expected,
            qgisVectorLayer::getGeometryTypeConversion($columnType, $geometryType, $nbGeometries)
        );
    }
}
