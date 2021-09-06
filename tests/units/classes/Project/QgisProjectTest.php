<?php

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

    public function testReadLayers()
    {
        // Test if WFS 'label' field is not exposed in 3.10 and 3.16
        $expectedWfsFields = array(
            0 => 'id',
        );
        $testQgis = new qgisProjectForTests();

        $fileVersions = array('310', '316');

        foreach ($fileVersions as $fileVersion) {
            $xml = simplexml_load_file(__DIR__.'/Ressources/readLayers_'.$fileVersion.'.qgs');
            $layers = $testQgis->readLayersForTests($xml);
            $this->assertEquals($expectedWfsFields, $layers[0]['wfsFields']);
        }
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
        $services = new lizmapServices(array(), (object) array(), false, '', '');
        $testQgis = new Project\QgisProject(null, $services, new ContextForTests(), $data);
        $this->assertEquals($data, $testQgis->getCacheData($emptyData));
    }

    public function testSetLayerOpacity()
    {
        $file = __DIR__.'/Ressources/simpleLayer.qgs.cfg';
        $json = json_decode(file_get_contents($file));
        $expectedLayer = clone $json->layers;
        $expectedLayer->montpellier_events->opacity = (float) 0.85;
        $cfg = new Project\ProjectConfig((object) array('layers' => $json->layers));
        $testProj = new qgisProjectForTests();
        $testProj->setXml(simplexml_load_file(__DIR__.'/Ressources/opacity.qgs'));
        $testProj->setLayerOpacityForTest($cfg);
        $this->assertEquals($expectedLayer, $cfg->getLayers());
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
        $cfg = new Project\ProjectConfig((object) array('layers' => (object) $layers));
        $testProj->setShortNamesForTest($cfg);
        $layer = $cfg->getLayers();
        if ($sname) {
            $this->assertEquals($sname, $layer->{$lname}->shortname);
        } else {
            $this->assertObjectNotHasAttribute('shortname', $layer->{$lname});
        }
    }

    public function testGetEditType() {
        $xmlStr = '
        <maplayer autoRefreshEnabled="0" readOnly="0" simplifyDrawingHints="0" simplifyMaxScale="1" type="vector" maxScale="0" geometry="Point" simplifyAlgorithm="0" hasScaleBasedVisibilityFlag="0" simplifyLocal="1" wkbType="MultiPoint" minScale="1e+8" refreshOnNotifyEnabled="0" autoRefreshTime="0" simplifyDrawingTol="1" styleCategories="AllStyleCategories" labelsEnabled="1" refreshOnNotifyMessage="">
          <edittypes>
            <edittype widgetv2type="TextEdit" name="OGC_FID">
              <widgetv2config fieldEditable="1" labelOnTop="0" UseHtml="0" IsMultiline="0"/>
            </edittype>
            <edittype widgetv2type="TextEdit" name="osm_id">
              <widgetv2config fieldEditable="1" labelOnTop="0" UseHtml="0" IsMultiline="0"/>
            </edittype>
            <edittype widgetv2type="TextEdit" name="name">
              <widgetv2config fieldEditable="1" labelOnTop="0" UseHtml="0" IsMultiline="0"/>
            </edittype>
            <edittype widgetv2type="TextEdit" name="ref">
              <widgetv2config fieldEditable="1" labelOnTop="0" UseHtml="0" IsMultiline="0"/>
            </edittype>
            <edittype widgetv2type="TextEdit" name="from">
              <widgetv2config fieldEditable="1" labelOnTop="0" UseHtml="0" IsMultiline="0"/>
            </edittype>
            <edittype widgetv2type="TextEdit" name="to">
              <widgetv2config fieldEditable="1" labelOnTop="0" UseHtml="0" IsMultiline="0"/>
            </edittype>
            <edittype widgetv2type="TextEdit" name="colour">
              <widgetv2config fieldEditable="1" labelOnTop="0" UseHtml="0" IsMultiline="0"/>
            </edittype>
            <edittype widgetv2type="Hidden" name="html">
              <widgetv2config fieldEditable="1" labelOnTop="0"/>
            </edittype>
            <edittype widgetv2type="Hidden" name="wkt">
              <widgetv2config fieldEditable="1" labelOnTop="0"/>
            </edittype>
          </edittypes>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $testProj = new qgisProjectForTests();
        $props = $testProj->getEditTypeForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(9, $props);
        $this->assertTrue(array_key_exists('name', $props));

        $prop = $props['name'];
        $this->assertEquals($prop->getFieldEditType(), 'TextEdit');
        $this->assertFalse($prop->isMultiline());
        $this->assertFalse($prop->useHtml());
        $this->assertTrue(array_key_exists('wkt', $props));

        $prop = $props['wkt'];
        $this->assertEquals($prop->getFieldEditType(), 'Hidden');
    }

    public function testGetFieldConfiguration() {
        $testProj = new qgisProjectForTests();

        $xmlStr = '
        <maplayer autoRefreshEnabled="0" readOnly="0" simplifyDrawingHints="0" simplifyMaxScale="1" type="vector" maxScale="0" geometry="Point" simplifyAlgorithm="0" hasScaleBasedVisibilityFlag="0" simplifyLocal="1" wkbType="MultiPoint" minScale="1e+8" refreshOnNotifyEnabled="0" autoRefreshTime="0" simplifyDrawingTol="1" styleCategories="AllStyleCategories" labelsEnabled="1" refreshOnNotifyMessage="">
          <fieldConfiguration>
            <field name="OGC_FID">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="IsMultiline"/>
                    <Option value="0" type="QString" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
            <field name="osm_id">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="IsMultiline"/>
                    <Option value="0" type="QString" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
            <field name="name">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="IsMultiline"/>
                    <Option value="0" type="QString" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
            <field name="wkt">
              <editWidget type="Hidden">
                <config>
                  <Option/>
                </config>
              </editWidget>
            </field>
            <field name="unique_name">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="IsMultiline"/>
                    <Option value="0" type="QString" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(5, $props);
        $this->assertTrue(array_key_exists('name', $props));

        $prop = $props['name'];
        $this->assertEquals($prop->getFieldEditType(), 'TextEdit');
        $this->assertFalse($prop->isMultiline());
        $this->assertFalse($prop->useHtml());
        $this->assertTrue(array_key_exists('wkt', $props));

        $prop = $props['wkt'];
        $this->assertEquals($prop->getFieldEditType(), 'Hidden');

        # TextEdit widget editable
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="id">
              <editWidget type="TextEdit">
                <config>
                  <Option/>
                </config>
              </editWidget>
            </field>
            <field name="label">
              <editWidget type="TextEdit">
                <config>
                  <Option/>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
          <editable>
            <field name="id" editable="0"/>
            <field name="label" editable="1"/>
          </editable>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(2, $props);

        $this->assertTrue(array_key_exists('id', $props));
        $prop = $props['id'];
        $this->assertEquals($prop->getFieldEditType(), 'TextEdit');
        $this->assertFalse($prop->isMultiline());
        $this->assertFalse($prop->useHtml());
        $this->assertFalse($prop->isEditable());

        $this->assertTrue(array_key_exists('label', $props));
        $prop = $props['label'];
        $this->assertEquals($prop->getFieldEditType(), 'TextEdit');
        $this->assertFalse($prop->isMultiline());
        $this->assertFalse($prop->useHtml());
        $this->assertTrue($prop->isEditable());

        # DateTime widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="date">
              <editWidget type="DateTime">
                <config>
                  <Option type="Map">
                    <Option value="false" type="bool" name="allow_null"/>
                    <Option value="false" type="bool" name="calendar_popup"/>
                    <Option value="" type="QString" name="display_format"/>
                    <Option value="yyyy-MM-dd" type="QString" name="field_format"/>
                    <Option value="false" type="bool" name="field_iso_format"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('date', $props));

        $prop = $props['date'];
        $this->assertEquals($prop->getFieldEditType(), 'DateTime');
        $options = (object) $prop->getEditAttributes();
        $this->assertTrue(property_exists($options, 'field_format'));
        $this->assertEquals($options->field_format, 'yyyy-MM-dd');
        $this->assertTrue(property_exists($options, 'field_iso_format'));
        $this->assertFalse($options->field_iso_format);

        # Classification widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="type">
              <editWidget type="Classification">
                <config>
                  <Option/>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('type', $props));

        $prop = $props['type'];
        $this->assertEquals($prop->getFieldEditType(), 'Classification');

        # DateTime widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="photo">
              <editWidget type="ExternalResource">
                <config>
                  <Option type="Map">
                    <Option value="1" type="QString" name="DocumentViewer"/>
                    <Option value="400" type="QString" name="DocumentViewerHeight"/>
                    <Option value="400" type="QString" name="DocumentViewerWidth"/>
                    <Option value="1" type="QString" name="FileWidget"/>
                    <Option value="1" type="QString" name="FileWidgetButton"/>
                    <Option value="Images (*.gif *.jpeg *.jpg *.png)" type="QString" name="FileWidgetFilter"/>
                    <Option value="0" type="QString" name="StorageMode"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('photo', $props));
        $prop = $props['photo'];
        $this->assertEquals($prop->getFieldEditType(), 'ExternalResource');

        $options = (object) $prop->getEditAttributes();
        $this->assertTrue(property_exists($options, 'FileWidgetFilter'));
        $this->assertEquals($options->FileWidgetFilter, 'Images (*.gif *.jpeg *.jpg *.png)');

        # UniqueValues widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="author">
              <editWidget type="UniqueValues">
                <config>
                  <Option type="Map">
                    <Option value="1" type="QString" name="Editable"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('author', $props));
        $prop = $props['author'];
        $this->assertEquals($prop->getFieldEditType(), 'UniqueValues');
        $this->assertTrue($prop->isEditable());

        # CheckBox widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="checked">
              <editWidget type="CheckBox">
                <config>
                  <Option type="Map">
                    <Option value="1" type="QString" name="CheckedState"/>
                    <Option value="0" type="QString" name="UncheckedState"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('checked', $props));
        $prop = $props['checked'];
        $this->assertEquals($prop->getFieldEditType(), 'CheckBox');

        $options = (object) $prop->getEditAttributes();
        $this->assertTrue(property_exists($options, 'CheckedState'));
        $this->assertEquals($options->CheckedState, '1');
        $this->assertTrue(property_exists($options, 'UncheckedState'));
        $this->assertEquals($options->UncheckedState, '0');

        # ValueRelation widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="tram_id">
              <editWidget type="ValueRelation">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="AllowMulti"/>
                    <Option value="1" type="QString" name="AllowNull"/>
                    <Option value="" type="QString" name="FilterExpression"/>
                    <Option value="osm_id" type="QString" name="Key"/>
                    <Option value="tramway20150328114206278" type="QString" name="Layer"/>
                    <Option value="1" type="QString" name="OrderByValue"/>
                    <Option value="0" type="QString" name="UseCompleter"/>
                    <Option value="test" type="QString" name="Value"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('tram_id', $props));
        $prop = $props['tram_id'];
        $this->assertEquals($prop->getFieldEditType(), 'ValueRelation');


        $options = (object) $prop->getEditAttributes();
        $this->assertTrue(property_exists($options, 'Layer'));
        $this->assertEquals($options->Layer, 'tramway20150328114206278');
        $this->assertTrue(property_exists($options, 'Key'));
        $this->assertEquals($options->Key, 'osm_id');
        $this->assertTrue(property_exists($options, 'Value'));
        $this->assertEquals($options->Value, 'test');
        $this->assertTrue(property_exists($options, 'AllowMulti'));
        $this->assertFalse($options->AllowMulti);
        $this->assertTrue(property_exists($options, 'AllowNull'));
        $this->assertTrue($options->AllowNull);
        $this->assertTrue(property_exists($options, 'OrderByValue'));
        $this->assertEquals($options->OrderByValue, '1');
        $this->assertTrue(property_exists($options, 'FilterExpression'));
        $this->assertEquals($options->FilterExpression, '');

        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="code_with_geom_exp">
              <editWidget type="ValueRelation">
                <config>
                  <Option type="Map">
                    <Option value="false" type="bool" name="AllowMulti"/>
                    <Option value="true" type="bool" name="AllowNull"/>
                    <Option value="intersects(@current_geometry , $geometry)" type="QString" name="FilterExpression"/>
                    <Option value="code" type="QString" name="Key"/>
                    <Option value="form_edition_vr_list_934681e5_2397_4451_a9f4_37d292240173" type="QString" name="Layer"/>
                    <Option value="form_edition_vr_list" type="QString" name="LayerName"/>
                    <Option value="postgres" type="QString" name="LayerProviderName"/>
                    <Option value="service=\'lizmapdb\' sslmode=disable key=\'id\' estimatedmetadata=true srid=4326 type=Polygon checkPrimaryKeyUnicity=\'0\' table=&quot;tests_projects&quot;.&quot;form_edition_vr_list&quot; (geom) sql=" type="QString" name="LayerSource"/>
                    <Option value="1" type="int" name="NofColumns"/>
                    <Option value="false" type="bool" name="OrderByValue"/>
                    <Option value="false" type="bool" name="UseCompleter"/>
                    <Option value="label" type="QString" name="Value"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('code_with_geom_exp', $props));
        $prop = $props['code_with_geom_exp'];
        $this->assertEquals($prop->getFieldEditType(), 'ValueRelation');

        $options = (object) $prop->getEditAttributes();
        $this->assertTrue(property_exists($options, 'FilterExpression'));
        $this->assertEquals($options->FilterExpression, 'intersects(@current_geometry , $geometry)');

        # Range widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field configurationFlags="None" name="integer_field">
              <editWidget type="Range">
                <config>
                  <Option type="Map">
                    <Option name="AllowNull" type="bool" value="true"></Option>
                    <Option name="Max" type="int" value="2147483647"></Option>
                    <Option name="Min" type="int" value="-2147483648"></Option>
                    <Option name="Precision" type="int" value="0"></Option>
                    <Option name="Step" type="int" value="1"></Option>
                    <Option name="Style" type="QString" value="SpinBox"></Option>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('integer_field', $props));
        $prop = $props['integer_field'];

        $this->assertEquals($prop->getFieldEditType(), 'Range');

        $options = (object) $prop->getEditAttributes();
        $this->assertTrue(property_exists($options, 'AllowNull'));
        $this->assertTrue($options->AllowNull);
        $this->assertTrue(property_exists($options, 'Max'));
        $this->assertEquals($options->Max, 2147483647);
        $this->assertTrue(property_exists($options, 'Min'));
        $this->assertEquals($options->Min, -2147483648);
        $this->assertTrue(property_exists($options, 'Precision'));
        $this->assertEquals($options->Precision, 0);
        $this->assertTrue(property_exists($options, 'Step'));
        $this->assertEquals($options->Step, 1);
        $this->assertTrue(property_exists($options, 'Style'));
        $this->assertEquals($options->Style, 'SpinBox');

        # ValueMap widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field configurationFlags="None" name="boolean_nullable">
              <editWidget type="ValueMap">
                <config>
                  <Option type="Map">
                    <Option name="map" type="List">
                      <Option type="Map">
                        <Option name="&lt;NULL>" type="QString" value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}"></Option>
                      </Option>
                      <Option type="Map">
                        <Option name="True" type="QString" value="true"></Option>
                      </Option>
                      <Option type="Map">
                        <Option name="False" type="QString" value="false"></Option>
                      </Option>
                    </Option>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('boolean_nullable', $props));

        $prop = $props['boolean_nullable'];

        $this->assertEquals($prop->getFieldEditType(), 'ValueMap');
        $options = (object) $prop->getEditAttributes();
        $this->assertTrue(property_exists($options, 'map'));
        $this->assertCount(3, $options->map);
        $expectedOptions = array(
            '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => '<NULL>',
            'true' => 'True',
            'false' => 'False',
        );
        $this->assertEquals($expectedOptions, $options->map);

        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="code_for_drill_down_exp">
              <editWidget type="ValueMap">
                <config>
                  <Option type="Map">
                    <Option type="List" name="map">
                      <Option type="Map">
                        <Option value="A" type="QString" name="Zone A"/>
                      </Option>
                      <Option type="Map">
                        <Option value="B" type="QString" name="Zone B"/>
                      </Option>
                      <Option type="Map">
                        <Option value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}" type="QString" name="No Zone"/>
                      </Option>
                    </Option>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('code_for_drill_down_exp', $props));
        $prop = $props['code_for_drill_down_exp'];

        $this->assertEquals($prop->getFieldEditType(), 'ValueMap');

        $options = (object) $prop->getEditAttributes();
        $this->assertTrue(property_exists($options, 'map'));
        $this->assertCount(3, $options->map);
        $expectedOptions = array(
            'A' => 'Zone A',
            'B' => 'Zone B',
            '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => 'No Zone',
        );
        $this->assertEquals($expectedOptions, $options->map);

        # no edit widget type
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="label">
              <editWidget type="">
                <config>
                  <Option/>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);

        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(is_array($props));
        $this->assertCount(1, $props);
        $this->assertTrue(array_key_exists('label', $props));
        $prop = $props['label'];
        $this->assertEquals($prop->getFieldEditType(), '');
    }

    public function testGetValuesFromOptions() {
        $testProj = new qgisProjectForTests();

        $xmlStr = '
          <Option type="Map">
            <Option value="0" type="QString" name="IsMultiline"/>
            <Option value="0" type="QString" name="UseHtml"/>
          </Option>
        ';
        $xml = simplexml_load_string($xmlStr);
        $options = $testProj->getFieldConfigurationOptionsForTest($xml);
        $expectedOptions = array(
            'IsMultiline' => '0',
            'UseHtml' => '0',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
              <Option type="Map">
                <Option value="false" type="bool" name="IsMultiline"/>
                <Option value="false" type="bool" name="UseHtml"/>
              </Option>
        ';
        $xml = simplexml_load_string($xmlStr);

        $options = $testProj->getValuesFromOptionsForTest($xml);
        $this->assertTrue(is_array($options));
        $this->assertCount(2, $options);
        $expectedOptions = array(
            'IsMultiline' =>'false',
            'UseHtml' =>'false',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
              <Option type="Map">
                <Option value="A" type="QString" name="Zone A"/>
              </Option>
        ';
        $xml = simplexml_load_string($xmlStr);

        $options = $testProj->getValuesFromOptionsForTest($xml);
        $this->assertTrue(is_array($options));
        $this->assertCount(1, $options);
        $expectedOptions = array(
            'Zone A' =>'A'
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
           <Option type="Map">
           <Option type="List" name="map">
             <Option type="Map">
               <Option value="A" type="QString" name="Zone A"/>
             </Option>
             <Option type="Map">
               <Option value="B" type="QString" name="Zone B"/>
             </Option>
             <Option type="Map">
               <Option value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}" type="QString" name="No Zone"/>
             </Option>
           </Option>
           </Option>
        ';
        $xml = simplexml_load_string($xmlStr);
        $options = $testProj->getFieldConfigurationOptionsForTest($xml);
        $this->assertTrue(is_array($options));
        $expectedOptions = array(
            'map' => array(
                'A' => 'Zone A',
                'B' => 'Zone B',
                '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => 'No Zone',
            )
        );
        $this->assertEquals($expectedOptions, $options);
    }

    public function testGetMarkup() {
        $testProj = new qgisProjectForTests();

        # no widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="label">
              <editWidget type="">
                <config>
                  <Option/>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('label', $props));
        $this->assertEquals($props['label']->getMarkup(), '');

        # TextEdit widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="label">
              <editWidget type="TextEdit">
                <config>
                  <Option/>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('label', $props));
        $this->assertEquals($props['label']->getMarkup(), 'input');

        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="label">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="false" type="bool" name="IsMultiline"/>
                    <Option value="false" type="bool" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('label', $props));
        $this->assertEquals($props['label']->getMarkup(), 'input');

        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="label">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="1" type="QString" name="IsMultiline"/>
                    <Option value="0" type="QString" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('label', $props));
        $this->assertEquals($props['label']->getMarkup(), 'textarea');

        # Range widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field configurationFlags="None" name="integer_field">
              <editWidget type="Range">
                <config>
                  <Option type="Map">
                    <Option name="AllowNull" type="bool" value="true"></Option>
                    <Option name="Max" type="int" value="2147483647"></Option>
                    <Option name="Min" type="int" value="-2147483648"></Option>
                    <Option name="Precision" type="int" value="0"></Option>
                    <Option name="Step" type="int" value="1"></Option>
                    <Option name="Style" type="QString" value="SpinBox"></Option>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('integer_field', $props));
        $this->assertEquals($props['integer_field']->getMarkup(), 'input');

        # DateTime widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="date">
              <editWidget type="DateTime">
                <config>
                  <Option type="Map">
                    <Option value="false" type="bool" name="allow_null"/>
                    <Option value="false" type="bool" name="calendar_popup"/>
                    <Option value="" type="QString" name="display_format"/>
                    <Option value="yyyy-MM-dd" type="QString" name="field_format"/>
                    <Option value="false" type="bool" name="field_iso_format"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('date', $props));
        $this->assertEquals($props['date']->getMarkup(), 'date');

        # CheckBox widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="checked">
              <editWidget type="CheckBox">
                <config>
                  <Option type="Map">
                    <Option value="1" type="QString" name="CheckedState"/>
                    <Option value="0" type="QString" name="UncheckedState"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('checked', $props));
        $this->assertEquals($props['checked']->getMarkup(), 'checkbox');

        # ValueRelation widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="tram_id">
              <editWidget type="ValueRelation">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="AllowMulti"/>
                    <Option value="1" type="QString" name="AllowNull"/>
                    <Option value="" type="QString" name="FilterExpression"/>
                    <Option value="osm_id" type="QString" name="Key"/>
                    <Option value="tramway20150328114206278" type="QString" name="Layer"/>
                    <Option value="1" type="QString" name="OrderByValue"/>
                    <Option value="0" type="QString" name="UseCompleter"/>
                    <Option value="test" type="QString" name="Value"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('tram_id', $props));
        $this->assertEquals($props['tram_id']->getMarkup(), 'menulist');

        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="tram_id">
              <editWidget type="ValueRelation">
                <config>
                  <Option type="Map">
                    <Option value="false" type="bool" name="AllowMulti"/>
                    <Option value="true" type="bool" name="AllowNull"/>
                    <Option value="" type="QString" name="FilterExpression"/>
                    <Option value="osm_id" type="QString" name="Key"/>
                    <Option value="tramway20150328114206278" type="QString" name="Layer"/>
                    <Option value="true" type="bool" name="OrderByValue"/>
                    <Option value="false" type="bool" name="UseCompleter"/>
                    <Option value="test" type="QString" name="Value"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('tram_id', $props));
        $this->assertEquals($props['tram_id']->getMarkup(), 'menulist');

        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="tram_id">
              <editWidget type="ValueRelation">
                <config>
                  <Option type="Map">
                    <Option value="1" type="QString" name="AllowMulti"/>
                    <Option value="1" type="QString" name="AllowNull"/>
                    <Option value="" type="QString" name="FilterExpression"/>
                    <Option value="osm_id" type="QString" name="Key"/>
                    <Option value="tramway20150328114206278" type="QString" name="Layer"/>
                    <Option value="1" type="QString" name="OrderByValue"/>
                    <Option value="0" type="QString" name="UseCompleter"/>
                    <Option value="test" type="QString" name="Value"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('tram_id', $props));
        $this->assertEquals($props['tram_id']->getMarkup(), 'checkboxes');

        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="tram_id">
              <editWidget type="ValueRelation">
                <config>
                  <Option type="Map">
                    <Option value="true" type="bool" name="AllowMulti"/>
                    <Option value="true" type="bool" name="AllowNull"/>
                    <Option value="" type="QString" name="FilterExpression"/>
                    <Option value="osm_id" type="QString" name="Key"/>
                    <Option value="tramway20150328114206278" type="QString" name="Layer"/>
                    <Option value="true" type="bool" name="OrderByValue"/>
                    <Option value="false" type="bool" name="UseCompleter"/>
                    <Option value="test" type="QString" name="Value"/>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('tram_id', $props));
        $this->assertEquals($props['tram_id']->getMarkup(), 'checkboxes');

        # ValueMap widget
        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field configurationFlags="None" name="boolean_nullable">
              <editWidget type="ValueMap">
                <config>
                  <Option type="Map">
                    <Option name="map" type="List">
                      <Option type="Map">
                        <Option name="&lt;NULL>" type="QString" value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}"></Option>
                      </Option>
                      <Option type="Map">
                        <Option name="True" type="QString" value="true"></Option>
                      </Option>
                      <Option type="Map">
                        <Option name="False" type="QString" value="false"></Option>
                      </Option>
                    </Option>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('boolean_nullable', $props));
        $this->assertEquals($props['boolean_nullable']->getMarkup(), 'menulist');

        $xmlStr = '
        <maplayer>
          <fieldConfiguration>
            <field name="code_for_drill_down_exp">
              <editWidget type="ValueMap">
                <config>
                  <Option type="Map">
                    <Option type="List" name="map">
                      <Option type="Map">
                        <Option value="A" type="QString" name="Zone A"/>
                      </Option>
                      <Option type="Map">
                        <Option value="B" type="QString" name="Zone B"/>
                      </Option>
                      <Option type="Map">
                        <Option value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}" type="QString" name="No Zone"/>
                      </Option>
                    </Option>
                  </Option>
                </config>
              </editWidget>
            </field>
          </fieldConfiguration>
        </maplayer>
        ';
        $xml = simplexml_load_string($xmlStr);
        $props = $testProj->getFieldConfigurationForTest($xml);
        $this->assertTrue(array_key_exists('code_for_drill_down_exp', $props));
        $this->assertEquals($props['code_for_drill_down_exp']->getMarkup(), 'menulist');
    }
}
