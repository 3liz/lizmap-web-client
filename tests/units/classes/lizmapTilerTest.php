<?php

use Lizmap\Project\Project;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class lizmapTilerTest extends TestCase
{
    // same constants as in lizmapTiler
    private const METERS_PER_INCH = 0.02540005080010160020;
    private const INCHES_PER_METER = 39.37;

    private const PROJECTION_2154 = '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

    protected function getWmsXml($xml = null)
    {
        if ($xml === null) {
            $xml = file_get_contents(__DIR__.'/Ressources/WMTS/getcapabilities.xml');
        }
        $wmsXml = simplexml_load_string($xml);
        $wmsXml->registerXPathNamespace('wms', 'http://www.opengis.net/wms');
        $wmsXml->registerXPathNamespace('xlink', 'http://www.w3.org/1999/xlink');

        return $wmsXml;
    }

    protected function getLayerConfig($name, $properties = array())
    {
        return (object) array_merge(array(
            'id' => $name.'_id',
            'name' => $name,
            'title' => ucfirst($name),
            'abstract' => '',
            'imageFormat' => 'image/png',
            'cached' => 'True',
            'singleTile' => 'False',
            'minScale' => 1,
            'maxScale' => 1000000000000,
        ), $properties);
    }

    protected function getProject($mapScales = array(1000, 5000, 25000, 100000), $proj4 = self::PROJECTION_2154)
    {
        $layers = (object) array(
            'group1' => $this->getLayerConfig('group1', array('shortname' => 'g1')),
            'quartiers' => $this->getLayerConfig('quartiers', array('minScale' => 2000, 'maxScale' => 50000)),
            'outside' => $this->getLayerConfig('outside'),
            'singletile' => $this->getLayerConfig('singletile', array('singleTile' => 'True')),
            'notcached' => $this->getLayerConfig('notcached', array('cached' => 'False')),
            'Overview' => $this->getLayerConfig('Overview'),
            'unknown' => $this->getLayerConfig('unknown'),
        );

        $project = $this->createStub(Project::class);
        $project->method('getOption')->willReturnMap(array(
            array('mapScales', $mapScales),
            array('projection', (object) array(
                'ref' => 'EPSG:2154',
                'proj4' => $proj4,
            )),
        ));
        $project->method('getLayers')->willReturn($layers);

        return $project;
    }

    public function testGetTileBbox(): void
    {
        $tileMatrixSet = (object) array(
            'tileMatrixList' => array(
                (object) array('resolution' => 10, 'left' => 1000, 'top' => 5000),
                (object) array('resolution' => 0.5, 'left' => -100, 'top' => 200),
            ),
        );

        $this->assertEquals('1000,5000,3560,2440', lizmapTiler::getTileBbox($tileMatrixSet, 0, 0, 0));
        $this->assertEquals('6120,-120,8680,-2680', lizmapTiler::getTileBbox($tileMatrixSet, '0', '2', '2'));
        $this->assertEquals('28,72,156,-56', lizmapTiler::getTileBbox($tileMatrixSet, 1, 1, 1));
    }

    public function testGetTileMatrixSetList(): void
    {
        $tileMatrixSetList = lizmapTiler::getTileMatrixSetList($this->getProject(), $this->getWmsXml());

        // EPSG:32631 is neither a predefined tile matrix set, nor the project projection
        $this->assertCount(3, $tileMatrixSetList);
        $this->assertEquals(
            array('EPSG:2154', 'EPSG:3857', 'EPSG:4326'),
            array_map(function ($tms) { return $tms->ref; }, $tileMatrixSetList)
        );

        // Project projection: one tile matrix per project scale
        $tms = $tileMatrixSetList[0];
        $this->assertEquals('m', $tms->unit);
        $this->assertCount(4, $tms->tileMatrixList);
        $previousResolution = INF;
        foreach (array(100000, 25000, 5000, 1000) as $k => $scale) {
            $tileMatrix = $tms->tileMatrixList[$k];
            $res = $scale / (self::INCHES_PER_METER * 96.0);
            $this->assertEqualsWithDelta($res, $tileMatrix->resolution, 1e-9);
            $this->assertEqualsWithDelta(
                $scale * self::METERS_PER_INCH / (96.0 * 0.28E-3),
                $tileMatrix->scaleDenominator,
                1e-6
            );
            $this->assertLessThan($previousResolution, $tileMatrix->resolution);
            $previousResolution = $tileMatrix->resolution;
        }
        // The extent is aligned on the first tile matrix grid
        $extent = $tms->extent;
        $firstTileMatrix = $tms->tileMatrixList[0];
        $tileSize = 256 * $firstTileMatrix->resolution;
        $this->assertCount(4, $extent);
        $this->assertEqualsWithDelta($firstTileMatrix->col, ($extent[2] - $extent[0]) / $tileSize, 1e-6);
        $this->assertEqualsWithDelta($firstTileMatrix->row, ($extent[3] - $extent[1]) / $tileSize, 1e-6);
        $this->assertEqualsWithDelta($extent[0], $firstTileMatrix->left, 1e-6);
        $this->assertEqualsWithDelta($extent[3], $firstTileMatrix->top, 1e-6);
        // Montpellier in Lambert 93
        $this->assertGreaterThan(700000, $extent[0]);
        $this->assertLessThan(800000, $extent[2]);
        $this->assertGreaterThan(6200000, $extent[1]);
        $this->assertLessThan(6300000, $extent[3]);

        // EPSG:3857: scales halved from the world scale to the project minimum scale
        $tms = $tileMatrixSetList[1];
        $this->assertEquals('m', $tms->unit);
        $this->assertEquals(
            array(-20037508.3427892480, -20037508.3427892480, 20037508.3427892480, 20037508.3427892480),
            $tms->extent
        );
        // 559082264.0287179 / 2^20 < 1000 < 559082264.0287179 / 2^19
        $this->assertCount(21, $tms->tileMatrixList);
        foreach ($tms->tileMatrixList as $z => $tileMatrix) {
            $this->assertEqualsWithDelta(559082264.0287179 / pow(2, $z), $tileMatrix->scaleDenominator, 1e-6);
            $this->assertEquals(pow(2, $z), $tileMatrix->col);
            $this->assertEquals(pow(2, $z), $tileMatrix->row);
            $this->assertEqualsWithDelta(-20037508.3427892480, $tileMatrix->left, 1e-6);
            $this->assertEqualsWithDelta(20037508.3427892480, $tileMatrix->top, 1e-6);
        }
        $this->assertEqualsWithDelta(156543.03392804097, $tms->tileMatrixList[0]->resolution, 1e-6);

        // EPSG:4326
        $tms = $tileMatrixSetList[2];
        $this->assertEquals('dd', $tms->unit);
        $this->assertEquals(array(-180, -90, 180, 90), $tms->extent);
        // 279541132.0143589 / 2^19 < 1000 < 279541132.0143589 / 2^18
        $this->assertCount(20, $tms->tileMatrixList);
        $this->assertEquals(2, $tms->tileMatrixList[0]->col);
        $this->assertEquals(1, $tms->tileMatrixList[0]->row);
        $this->assertEquals(-180, $tms->tileMatrixList[0]->left);
        $this->assertEquals(90, $tms->tileMatrixList[0]->top);
    }

    public static function getProjectionUnitData()
    {
        $lcc = '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0';

        return array(
            'meters' => array($lcc.' +units=m +no_defs', 'm', 39.37),
            'kilometers' => array($lcc.' +units=km +no_defs', 'km', 39370),
            'US survey feet' => array($lcc.' +units=us-ft +no_defs', 'ft', 12.0),
            'Indian yards' => array($lcc.' +units=ind-yd +no_defs', 'yd', 36),
            'to_meter' => array($lcc.' +to_meter=0.3048 +no_defs', 'to_meter', 0.3048 * 39.37),
        );
    }

    #[DataProvider('getProjectionUnitData')]
    public function testGetTileMatrixSetListProjectionUnit($proj4, $expectedUnit, $inchesPerUnit): void
    {
        $tileMatrixSetList = lizmapTiler::getTileMatrixSetList($this->getProject(array(1000, 100000), $proj4), $this->getWmsXml());

        $tms = $tileMatrixSetList[0];
        $this->assertEquals('EPSG:2154', $tms->ref);
        $this->assertEquals($expectedUnit, $tms->unit);
        $this->assertCount(2, $tms->tileMatrixList);
        $this->assertEqualsWithDelta(100000 / ($inchesPerUnit * 96.0), $tms->tileMatrixList[0]->resolution, 1e-9);
        $this->assertEqualsWithDelta(1000 / ($inchesPerUnit * 96.0), $tms->tileMatrixList[1]->resolution, 1e-9);
    }

    public function testGetTileMatrixSetListWithoutRootLayer(): void
    {
        $xml = '<?xml version="1.0" encoding="utf-8"?>
            <WMS_Capabilities xmlns="http://www.opengis.net/wms" version="1.3.0">
              <Capability></Capability>
            </WMS_Capabilities>';

        $this->assertEquals(array(), lizmapTiler::getTileMatrixSetList($this->getProject(), $this->getWmsXml($xml)));
        $this->assertNull(lizmapTiler::getLayerTileInfo('quartiers', $this->getProject(), $this->getWmsXml($xml), array()));
    }

    public function testGetLayerTileInfo(): void
    {
        $project = $this->getProject();
        $wmsXml = $this->getWmsXml();
        $tileMatrixSetList = lizmapTiler::getTileMatrixSetList($project, $wmsXml);

        // Group with a shortname: the extent is the union of its children
        $layer = lizmapTiler::getLayerTileInfo('group1', $project, $wmsXml, $tileMatrixSetList);
        $this->assertNotNull($layer);
        $this->assertEquals('group1_id', $layer->id);
        $this->assertEquals('g1', $layer->name);
        $this->assertEquals('Group1', $layer->title);
        $this->assertEquals('image/png', $layer->imageFormat);
        $this->assertEquals((object) array('x' => 3.75, 'y' => 43.52), $layer->lowerCorner);
        $this->assertEquals((object) array('x' => 3.95, 'y' => 43.68), $layer->upperCorner);

        $this->assertCount(3, $layer->tileMatrixSetLinkList);
        foreach ($layer->tileMatrixSetLinkList as $k => $tileMatrixSetLink) {
            $tms = $tileMatrixSetList[$k];
            $this->assertEquals($tms->ref, $tileMatrixSetLink->ref);
            // no scale limit: every tile matrix is available
            $this->assertCount(count($tms->tileMatrixList), $tileMatrixSetLink->tileMatrixLimits);
            foreach ($tileMatrixSetLink->tileMatrixLimits as $limits) {
                $this->assertLessThanOrEqual($limits->maxCol, $limits->minCol);
                $this->assertLessThanOrEqual($limits->maxRow, $limits->minRow);
                $this->assertGreaterThanOrEqual(0, $limits->minCol);
                $this->assertGreaterThanOrEqual(0, $limits->minRow);
            }
        }
        // EPSG:3857 first tile matrix is the whole world in one tile
        $this->assertEquals(
            (object) array('id' => 0, 'minRow' => 0, 'maxRow' => 0, 'minCol' => 0, 'maxCol' => 0),
            $layer->tileMatrixSetLinkList[1]->tileMatrixLimits[0]
        );

        // Layer extent is clamped to the root layer extent
        $layer = lizmapTiler::getLayerTileInfo('outside', $project, $wmsXml, $tileMatrixSetList);
        $this->assertEquals('outside', $layer->name);
        $this->assertEquals((object) array('x' => 3.7, 'y' => 43.5), $layer->lowerCorner);
        $this->assertEquals((object) array('x' => 4.0, 'y' => 43.7), $layer->upperCorner);

        // Tile matrices are filtered by the layer scale range
        $layer = lizmapTiler::getLayerTileInfo('quartiers', $project, $wmsXml, $tileMatrixSetList);
        $this->assertEquals((object) array('x' => 3.8, 'y' => 43.55), $layer->lowerCorner);
        $this->assertEquals((object) array('x' => 3.95, 'y' => 43.65), $layer->upperCorner);
        $this->assertEquals(2000, $layer->minScale);
        $this->assertEquals(50000, $layer->maxScale);
        foreach ($layer->tileMatrixSetLinkList as $k => $tileMatrixSetLink) {
            $tileMatrixList = $tileMatrixSetList[$k]->tileMatrixList;
            $expectedIds = array_keys(array_filter($tileMatrixList, function ($tileMatrix) {
                return $tileMatrix->scaleDenominator <= 50000 && $tileMatrix->scaleDenominator >= 2000;
            }));
            $this->assertNotEmpty($expectedIds);
            $this->assertEquals(
                $expectedIds,
                array_map(function ($limits) { return $limits->id; }, $tileMatrixSetLink->tileMatrixLimits)
            );
        }
    }

    public function testGetLayerTileInfoUnknownLayer(): void
    {
        $project = $this->getProject();
        $wmsXml = $this->getWmsXml();
        $tileMatrixSetList = lizmapTiler::getTileMatrixSetList($project, $wmsXml);

        // the layer is in the project config but not in the WMS capabilities
        $this->assertNull(lizmapTiler::getLayerTileInfo('unknown', $project, $wmsXml, $tileMatrixSetList));
    }

    public function testGetLayerTileInfoList(): void
    {
        $project = $this->getProject();
        $wmsXml = $this->getWmsXml();
        $tileMatrixSetList = lizmapTiler::getTileMatrixSetList($project, $wmsXml);

        $layers = lizmapTiler::getLayerTileInfoList($project, $wmsXml, $tileMatrixSetList);
        // single tile, not cached, overview and unknown layers are excluded
        $this->assertEquals(
            array('g1', 'quartiers', 'outside'),
            array_map(function ($layer) { return $layer->name; }, $layers)
        );
    }

    public function testNormalizeProjectScales(): void
    {
        $method = new ReflectionMethod(lizmapTiler::class, 'normalizeProjectScales');

        $this->assertEquals(
            array(100000, 25000, 5000, 1000),
            $method->invoke(null, $this->getProject(array(1000, 5000, 25000, 100000)))
        );

        $notices = array();
        set_error_handler(function ($errno, $errstr) use (&$notices) {
            $notices[] = array($errno, $errstr);

            return true;
        });

        try {
            $scales = $method->invoke(null, $this->getProject(array(0, 5000, 25000, 100000)));
        } finally {
            restore_error_handler();
        }

        $this->assertEquals(array(100000, 25000, 5000, 1), $scales);
        $this->assertEquals(
            array(array(E_USER_NOTICE, 'The minimum scale cannot have a value of 0, redefined as 1.')),
            $notices
        );
    }
}
