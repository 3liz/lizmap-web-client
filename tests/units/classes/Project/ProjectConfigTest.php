<?php
use PHPUnit\Framework\TestCase;
use Lizmap\Project;

/**
 * @internal
 * @coversNothing
 */
class projectConfigTest extends TestCase
{
    public static function getConstructData()
    {
        $file = __DIR__.'/Ressources/events.qgs.cfg';
        $json = json_decode(file_get_contents($file));

        $expected = clone $json;
        $expected->editionLayers = new stdClass();
        $expected->timemanagerLayers = new stdClass();
        $expected->atlas = new stdClass();
        $expected->tooltipLayers = new stdClass();
        $expected->loginFilteredLayers = new stdClass();
        $expected->filter_by_polygon = new stdClass();
        $expected->metadata = new stdClass();
        $expected->layouts = new stdClass();
        $expected->warnings = new stdClass();
        return array(
            array($json, $expected),
        );
    }

    /**
     * @dataProvider getConstructData
     *
     * @param mixed $data
     * @param mixed $expectedData
     */
    public function testConstruct($data, $expectedData): void
    {
        $testCfg = new Project\ProjectConfig($data);
        $this->assertEquals($expectedData, $testCfg->getConfigContent());
    }

    public function testConstructCache(): void
    {
        $file = __DIR__.'/Ressources/events.qgs.cfg';
        $data = json_decode(file_get_contents($file));
        $cachedProperties = array('layersOrder', 'locateByLayer', 'formFilterLayers', 'editionLayers',
            'attributeLayers', 'options', 'layers', 'metadata', 'warnings');
        $testCfg = new Project\ProjectConfig($data);
        foreach ($cachedProperties as $prop) {
            if (property_exists($data, $prop)) {
                $meth = 'get'.ucfirst($prop);
                $this->assertEquals($data->$prop, $testCfg->$meth(), 'failed Prop = '.$prop);
            }
        }
    }

    public static function getFindLayerData()
    {
        $file = __DIR__.'/Ressources/events.qgs.cfg';
        $layers = json_decode(file_get_contents($file));
        $layersNull = (object) array('layers' => null);

        return array(
            array($layers, 'events_4c3b47b8_3939_4c8c_8e91_55bdb13a2101', 'montpellier_events'),
            array($layers, 'test_shortname', 'Hidden'),
            array($layers, 'Hidden', 'Hidden'),
            array($layers, 'osm-test', 'osm-stamen-toner'),
            array($layers, 'test', null),
            array($layers, null, null),
            array($layersNull, 'test', null),
            array($layersNull, null, null),
        );
    }

    /**
     * @dataProvider getFindLayerData
     *
     * @param mixed $layers
     * @param mixed $key
     * @param mixed $layerName
     */
    public function testFindLayer($layers, $key, $layerName): void
    {
        $testCfg = new Project\ProjectConfig($layers);
        if ($layerName) {
            $this->assertSame($testCfg->getLayer($layerName), $testCfg->findLayerByAnyName($key));
        } else {
            $this->assertNull($testCfg->findLayerByAnyName($key));
        }
    }

    public static function getEditionLayerByNameData()
    {
        $file = __DIR__.'/Ressources/montpellier.qgs.cfg';
        $eLayer = json_decode(file_get_contents($file));
        $eLayerNull = (object) array('editionLayers' => null);

        return array(
            array($eLayer, 'tramstop'),
            array($eLayer, 'tram_stop_work'),
            array($eLayerNull, null),
        );
    }

    /**
     * @dataProvider getEditionLayerByNameData
     *
     * @param mixed $eLayers
     * @param mixed $name
     */
    public function testGetEditionLayerByName($eLayers, $name): void
    {
        $testCfg = new Project\ProjectConfig($eLayers);
        if ($name) {
            $this->assertSame($eLayers->editionLayers->{$name}, $testCfg->getEditionLayerByName($name));
        } else {
            $this->assertNull($testCfg->getEditionLayerByName($name));
        }
    }

    public static function getEditionLayerByLayerIdData()
    {
        $file = __DIR__.'/Ressources/montpellier.qgs.cfg';
        $eLayer = json_decode(file_get_contents($file));
        $eLayerNull = array('editionLayers' => null);

        return array(
            array($eLayer, 'edition_line20130409161630329', 'edition_line'),
            array($eLayer, 'edition_polygon20130409114333776', 'areas_of_interest'),
            array($eLayer, 'null', null),
            array($eLayerNull, 'null', null),
            array($eLayerNull, null, null),
        );
    }

    /**
     * @dataProvider getEditionLayerByLayerIdData
     *
     * @param mixed $eLayers
     * @param mixed $id
     * @param mixed $eLayerName
     */
    public function testGetEditionLayerByLayerId($eLayers, $id, $eLayerName): void
    {
        $testCfg = new Project\ProjectConfig($eLayers);
        if ($eLayerName) {
            $this->assertSame($eLayers->editionLayers->$eLayerName, $testCfg->getEditionLayerByLayerId($id));
        } else {
            $this->assertNull($testCfg->getEditionLayerByLayerId($id));
        }
    }

    public static function getOptionsValues()
    {
        return array(
            array('mapScales', [
                1000,
                2500,
                5000,
                10000,
                25000,
                50000,
                100000,
                150000
            ]),
            array('minScale', 1000),
            array('maxScale', 150000),
            array('initialExtent',  [
                417006.613738,
                5394910.3409,
                447158.048911,
                5414844.99481
            ]),
            array('osmMapnik', "True"),
            array('measure', "True"),
            array('atlasDuration', 5),
        );
    }

    /**
     * @dataProvider getOptionsValues
     *
     * @param mixed $option
     * @param mixed $expectedValue
     */
    public function testGetOption($option, $expectedValue): void
    {
        $file = __DIR__.'/Ressources/montpellier.qgs.cfg';
        $data = json_decode(file_get_contents($file));
        $testCfg = new Project\ProjectConfig($data);
        $this->assertEquals($expectedValue, $testCfg->getOption($option));
    }

    /**
     */
    public function testGetBooleanOption(): void
    {
        $file = __DIR__.'/Ressources/events.qgs.cfg';
        $data = json_decode(file_get_contents($file));
        $testCfg = new Project\ProjectConfig($data);
        $this->assertTrue($testCfg->getBooleanOption('atlasHighlightGeometry'));
        $this->assertNull($testCfg->getBooleanOption('atlasEnabled'));
    }

    /**
     * Test an empty project config
     */
    public function testEmptyConfig(): void
    {
        $testCfg = new Project\ProjectConfig(new StdClass());
        $this->assertEquals(new stdClass(), $testCfg->getLayers());
        $this->assertNull($testCfg->getLayer('SousQuartiers'));
        $this->assertEquals(new stdClass(), $testCfg->getAttributeLayers());
        $this->assertEquals(new stdClass(), $testCfg->getLocateByLayer());
        $this->assertNull($testCfg->findLayerByAnyName('Sous-Quartiers'));
        $this->assertNull($testCfg->findLayerByName('SousQuartiers'));
        $this->assertNull($testCfg->findLayerByShortName('test_shortname'));
        $this->assertNull($testCfg->findLayerByTitle('Points of interest'));
        $this->assertNull($testCfg->findLayerByLayerId('edition_line20130409161630329'));
        $this->assertNull($testCfg->findLayerByTypeName('tramstop'));
        $this->assertEquals(new stdClass(), $testCfg->getEditionLayers());
        $this->assertNull($testCfg->getEditionLayerByName('tramstop'));
        $this->assertNull($testCfg->getEditionLayerByLayerId('edition_line20130409161630329'));
        $this->assertFalse($testCfg->hasEditionLayers());
        $this->assertEquals(new stdClass(), $testCfg->getOptions());
        $this->assertNull($testCfg->getOption('atlasDuration'));
        $this->assertNull($testCfg->getBooleanOption('atlasEnabled'));
        $this->assertEquals(new stdClass(), $testCfg->getFormFilterLayers());
        $this->assertEquals(new stdClass(), $testCfg->getTimemanagerLayers());
        $this->assertEquals(new stdClass(), $testCfg->getAtlas());
        $this->assertEquals(new stdClass(), $testCfg->getTooltipLayers());
        $this->assertEquals(new stdClass(), $testCfg->getLoginFilteredLayers());
        $this->assertEquals(new stdClass(), $testCfg->getPolygonFilterConfig());
        $this->assertEquals(new stdClass(), $testCfg->getDatavizLayers());
    }
}
