<?php

require_once 'qgisProjectForTests.php';

use Lizmap\Project;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class QgisProjectTest extends TestCase
{
    public function arrayToXml(array $array, SimpleXMLElement &$xml)
    {
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                if (array_keys($value) !== range(0, count($value) - 1)) {
                    $subnode = $xml->addChild($key);
                    $this->arrayToXml($value, $subnode);
                } else {
                    foreach ($value as $val) {
                        $xml->addChild($key, $val);
                    }
                }
            } else {
                $xml->addChild($key, $value);
            }
        }
    }

    public function testReadWMSInfo()
    {
        $data = array(
            'mapcanvas' => array(
                'destinationsrs' => array('spatialrefsys' => array('authid' => 'CRS4242')),
            ),
            'properties' => array(
                'WMSServiceTitle' => 'title',
                'WMSServiceAbstract' => 'abstract',
                'WMSKeywordList' => array(
                    'value' => array('key', 'word', 'WMS'),
                ),
                'WMSExtent' => array(
                    'value' => array('42', '24', '21', '12'),
                ),
                'WMSOnlineResource' => 'ressource',
                'WMSContactMail' => 'test.mail@3liz.org',
                'WMSContactOrganization' => '3liz',
                'WMSContactPerson' => 'marvin',
                'WMSContactPhone' => '',
            ),
        );
        $expectedWMS = array(
            'WMSServiceTitle' => 'title',
            'WMSServiceAbstract' => 'abstract',
            'WMSKeywordList' => 'key, word, WMS',
            'WMSExtent' => '42, 24, 21, 12',
            'ProjectCrs' => 'CRS4242',
            'WMSOnlineResource' => 'ressource',
            'WMSContactMail' => 'test.mail@3liz.org',
            'WMSContactOrganization' => '3liz',
            'WMSContactPerson' => 'marvin',
            'WMSContactPhone' => '',
        );
        $xml = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $xml);
        $testQgis = new qgisProjectForTests();
        $this->assertEquals($expectedWMS, $testQgis->readWMSInfoTest($xml));
    }

    public function testReadCanvasColor()
    {
        $data = array(
            'properties' => array(
                'Gui' => array(
                    'CanvasColorGreenPart' => '21',
                    'CanvasColorRedPart' => '42',
                    'CanvasColorBluePart' => '84',
                ),
            ),
        );
        $xml = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $xml);
        $testQgis = new qgisProjectForTests();
        $this->assertEquals('rgb(42,21,84)', $testQgis->readCanvasColorTest($xml));
    }

    public function testReadAllProj4()
    {
        $data = array(
            array('spatialrefsys' => array(
                'authid' => 'CRS1',
                'proj4' => '1',
            )),
            array('spatialrefsys' => array(
                'authid' => 'CRS2',
                'proj4' => '2',
            )),
            array('spatialrefsys' => array(
                'authid' => 'CRS3',
                'proj4' => '3',
            )),
            array('spatialrefsys' => array(
                'authid' => 'CRS4',
                'proj4' => '4',
            )),
        );
        $expectedProj4 = array(
            'CRS1' => '1',
            'CRS2' => '2',
            'CRS3' => '3',
            'CRS4' => '4',
        );
        $xml = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $xml);
        $testQgis = new qgisProjectForTests();
        $this->assertEquals($expectedProj4, $testQgis->readAllProj4Test($xml));
    }

    public function testReadUseLayersIDs()
    {
        $data = array(
            'properties' => array(
                'WMSUseLayerIDs' => 'false',
            ),
        );
        $xml = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $xml);
        $testQgis = new qgisProjectForTests();
        $this->assertFalse($testQgis->readUseLayersIDsTest($xml));
    }

    public function testReadThemes()
    {
        $expectedThemes = array(
            'Administrative' => array(
                'layers' => array(
                    'SousQuartiers20160121124316563' => array(
                        'style' => 'default',
                        'expanded' => '1',
                    ),
                    'VilleMTP_MTP_Quartiers_2011_432620130116112610876' => array(
                        'style' => 'default',
                        'expanded' => '0',
                    ),
                ),
                'expandedGroupNode' => array(
                    'datalayers/Buildings',
                    'Overview',
                    'datalayers/Bus',
                    'datalayers',
                ),
            ),
        );
        $file = __DIR__.'/Ressources/themes.qgs';
        $xml = simplexml_load_file($file);
        $testQgis = new qgisProjectForTests();
        $themes = $testQgis->readThemesForTests($xml);
        $this->assertEquals($expectedThemes, $themes);
    }

    public function testReadRelations()
    {
        $expectedRelations = array(
            'VilleMTP_MTP_Quartiers_2011_432620130116112610876' => array(
                array('referencingLayer' => 'SousQuartiers20160121124316563',
                    'referencedField' => 'QUARTMNO',
                    'referencingField' => 'QUARTMNO',
                ),
            ),
            'tramstop20150328114203878' => array(
                array('referencingLayer' => 'jointure_tram_stop20150328114216806',
                    'referencedField' => 'osm_id',
                    'referencingField' => 'stop_id',
                ),
            ),
            'pivot' => array(),
        );
        $file = __DIR__.'/Ressources/relations.qgs';
        $xml = simplexml_load_file($file);
        $testQgis = new qgisProjectForTests();
        $relations = $testQgis->readRelationsForTests($xml);
        $this->assertEquals($expectedRelations, $relations);
    }

    public function testCacheConstruct()
    {
        $cachedProperties = array('WMSInformation', 'canvasColor', 'allProj4',
            'relations', 'themes', 'useLayerIDs', 'layers', 'data', 'qgisProjectVersion', );
        $data = array();
        $emptyData = array();
        foreach ($cachedProperties as $prop) {
            $data[$prop] = 'some stuff about'.$prop;
        }
        $services = new lizmapServices('', '', false, '', '');
        $testQgis = new Project\QgisProject(null, $services, new TestContext(), $data);
        $this->assertEquals($data, $testQgis->getCacheData($emptyData));
    }

    public function testSetLayerOpacity()
    {
        $file = __DIR__.'/Ressources/simpleLayer.qgs.cfg';
        $json = json_decode(file_get_contents($file));
        $expectedLayer = clone $json->layers;
        $expectedLayer->montpellier_events->opacity = (float) 0.85;
        $cfg = new Project\ProjectConfig(null, array('cfgContent' => (object) array('layers' => $json->layers)));
        $testProj = new qgisProjectForTests();
        $testProj->setXml(simplexml_load_file(__DIR__.'/Ressources/opacity.qgs'));
        $testProj->setLayerOpacityForTest($cfg);
        $this->assertEquals($expectedLayer, $cfg->getProperty('layers'));
    }

    public function getLayerData()
    {
        $layers = array(
            'montpellier' => array(
                'name' => 'Montpellier',
                'id' => '42',
            ),
            'test' => array(
                'name' => 'test',
                'id' => '21',
            ),
        );

        return array(
            array($layers, '42', 'montpellier'),
            array($layers, '21', 'test'),
            array($layers, '38', null),
            array($layers, null, null),
            array(array(), null, null),
            array(array(), '', null),
        );
    }

    /**
     * @dataProvider getLayerData
     *
     * @param mixed $layers
     * @param mixed $id
     * @param mixed $key
     */
    public function testGetLayerDefinition($layers, $id, $key)
    {
        $testProj = new qgisProjectForTests();
        $testProj->setLayers($layers);
        $layer = $testProj->getLayerDefinition($id);
        if (isset($key)) {
            $this->assertEquals($layers[$key], $layer);
        } else {
            $this->assertNull($layer);
        }
    }

    public function getReadEditionLayersData()
    {
        $intraELayer = '{
            "anno_point": {
                "layerId": "anno_point20140627181806369",
                "geometryType": "point",
                "capabilities": {
                    "createFeature": "True",
                    "modifyAttribute": "True",
                    "modifyGeometry": "True",
                    "deleteFeature": "True"
                },
                "acl": "",
                "order": 0
            }
        }';
        $eLayer = json_decode($intraELayer);

        return array(
            array('montpellier', (object) array()),
            array('montpellier_intranet', $eLayer),
        );
    }

    /**
     * @dataProvider getReadEditionLayersData
     *
     * @param mixed $fileName
     * @param mixed $expectedELayer
     */
    public function testReadEditionLayers($fileName, $expectedELayer)
    {
        $file = __DIR__.'/Ressources/'.$fileName.'.qgs';
        $eLayers = json_decode(file_get_contents($file.'.cfg'))->editionLayers;
        $testProj = new qgisProjectForTests();
        $testProj->setXml(simplexml_load_file($file));
        $testProj->readEditionLayersForTest($eLayers);
        $this->assertEquals($expectedELayer, $eLayers);
    }

    public function testReadAttributeLayer()
    {
        $table = '<attributetableconfig actionWidgetStyle="dropDown" sortExpression="&quot;field_communes&quot;" sortOrder="1">
          <columns>
            <column type="field" hidden="0" width="100" name="nid"/>
            <column type="field" hidden="0" width="371" name="titre"/>
            <column type="field" hidden="1" width="-1" name="vignette_src"/>
            <column type="field" hidden="1" width="-1" name="vignette_alt"/>
            <column type="field" hidden="0" width="226" name="field_date"/>
            <column type="field" hidden="1" width="-1" name="description"/>
            <column type="field" hidden="0" width="190" name="field_communes"/>
            <column type="field" hidden="0" width="234" name="field_lieu"/>
            <column type="field" hidden="0" width="100" name="field_access"/>
            <column type="field" hidden="0" width="166" name="field_thematique"/>
            <column type="field" hidden="1" width="-1" name="x"/>
            <column type="field" hidden="1" width="-1" name="y"/>
            <column type="field" hidden="0" width="186" name="url"/>
            <column type="actions" hidden="1" width="-1"/>
            <column type="field" hidden="0" width="-1" name="fid"/>
          </columns>
        </attributetableconfig>';

        $file = __DIR__.'/Ressources/events.qgs';
        $aLayer = json_decode(file_get_contents($file.'.cfg'))->attributeLayers;
        $xml = simplexml_load_string($table);
        $testProj = new qgisProjectForTests();
        $testProj->setXml(simplexml_load_file($file));
        $testProj->readAttributeLayersForTest($aLayer);
        $xml = json_decode(str_replace('@', '', json_encode($xml)));
        $this->assertEquals($xml, $aLayer->montpellier_events->attributetableconfig);
    }

    public function getShortNamesData()
    {
        $dir = __DIR__.'/Ressources/Projs/';

        return array(
            array($dir.'test_project.qgs', 'testlayer', 'layer_with_short_name'),
            array($dir.'Project1.qgs', 'points', 'PointsLayerShortName'),
            array($dir.'test_project_use_layer_ids.qgs', 'testlayer', 'layer_with_short_name'),
            array($dir.'test_project_use_layer_ids.qgs', 'wrong_layer_name', null),
        );
    }

    /**
     * @dataProvider getShortNamesData
     *
     * @param mixed $file
     * @param mixed $lname
     * @param mixed $sname
     */
    public function testSetShortNames($file, $lname, $sname)
    {
        $layers = array(
            $lname => (object) array(
                'name' => $lname,
                'id' => $lname,
            ),
        );
        $testProj = new qgisProjectForTests();
        $testProj->setXml(simplexml_load_file($file));
        $cfg = new Project\ProjectConfig(null, array('cfgContent' => (object) array('layers' => (object) $layers)));
        $testProj->setShortNamesForTest($cfg);
        $layer = $cfg->getProperty('layers');
        if ($sname) {
            $this->assertEquals($sname, $layer->{$lname}->shortname);
        } else {
            $this->assertObjectNotHasAttribute('shortname', $layer->{$lname});
        }
    }
}
