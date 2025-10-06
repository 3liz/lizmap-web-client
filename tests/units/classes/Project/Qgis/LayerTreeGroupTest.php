<?php

use Lizmap\App;
use Lizmap\Project\Qgis;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class LayerTreeGroupTest extends TestCase
{
    public function testConstruct(): void
    {
        $xmlStr = '
      <layer-tree-group expanded="1" groupLayer="" name="Buildings" checked="Qt::Checked">
        <customproperties>
          <Option type="Map">
            <Option type="QString" name="wmsShortName" value="Buildings"/>
          </Option>
        </customproperties>
        <layer-tree-layer expanded="1" legend_exp="" name="publicbuildings" checked="Qt::Checked" id="publicbuildings20150420100958543" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/transport.sqlite\' table=&quot;publicbuildings&quot; (geom)" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option name="expandedLegendNodes"/>
            </Option>
          </customproperties>
        </layer-tree-layer>
        <layer-tree-layer expanded="1" legend_exp="" name="publicbuildings_tramstop" checked="Qt::Unchecked" id="publicbuildings_tramstop20150420095614071" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/transport.sqlite\' table=&quot;publicbuildings_tramstop&quot;" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option name="expandedLegendNodes"/>
            </Option>
          </customproperties>
        </layer-tree-layer>
      </layer-tree-group>
      ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $treeGroup = Qgis\LayerTreeGroup::fromXmlReader($oXml);

        $this->assertEquals('Buildings', $treeGroup->name);
        $this->assertFalse($treeGroup->mutuallyExclusive);

        $this->assertNotNull($treeGroup->customproperties);
        $this->assertIsArray($treeGroup->customproperties);
        $expectedCustomproperties = array(
            'wmsShortName' => 'Buildings',
        );
        $this->assertEquals($expectedCustomproperties, $treeGroup->customproperties);

        $this->assertNotNull($treeGroup->items);
        $this->assertIsArray($treeGroup->items);
        $this->assertCount(2, $treeGroup->items);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $treeGroup->items[0]);
        $this->assertEquals('publicbuildings', $treeGroup->items[0]->name);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $treeGroup->items[1]);
        $this->assertEquals('publicbuildings_tramstop', $treeGroup->items[1]->name);
    }

    public function testShortName(): void
    {

        $xmlStr = '
    <layer-tree-group checked="Qt::Unchecked" expanded="1" name="overview">
      <customproperties>
        <Option type="Map">
          <Option name="wmsShortName" type="QString" value="Overview"></Option>
        </Option>
      </customproperties>
      <layer-tree-layer expanded="1" patch_size="-1,-1" providerKey="" legend_split_behavior="0" id="quartiers_c6fea644_09fc_4f73_b4e8_201a2cc9f131" name="quartiers_overview" checked="Qt::Unchecked" source="service=\'lizmapdb\' sslmode=prefer key=\'quartier\' estimatedmetadata=true srid=4326 type=MultiPolygon checkPrimaryKeyUnicity=\'1\' table=&quot;tests_projects&quot;.&quot;quartiers&quot; (geom)" legend_exp="">
        <customproperties>
          <Option></Option>
        </customproperties>
      </layer-tree-layer>
    </layer-tree-group>
      ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $treeGroup = Qgis\LayerTreeGroup::fromXmlReader($oXml);
        $this->assertEquals(null, $treeGroup->shortname);
        $this->assertEquals('Overview', $treeGroup->customproperties['wmsShortName']);

        $xmlStr = '
    <layer-tree-group expanded="1" name="overview" checked="Qt::Unchecked" groupLayer="">
      <customproperties>
        <Option/>
      </customproperties>
      <shortname>Overview</shortname>
      <layer-tree-layer expanded="1" patch_size="-1,-1" providerKey="" legend_split_behavior="0" id="quartiers_c6fea644_09fc_4f73_b4e8_201a2cc9f131" name="quartiers_overview" checked="Qt::Unchecked" source="service=\'lizmapdb\' sslmode=prefer key=\'quartier\' estimatedmetadata=true srid=4326 type=MultiPolygon checkPrimaryKeyUnicity=\'1\' table=&quot;tests_projects&quot;.&quot;quartiers&quot; (geom)" legend_exp="">
        <customproperties>
          <Option/>
        </customproperties>
      </layer-tree-layer>
    </layer-tree-group>
      ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $treeGroup = Qgis\LayerTreeGroup::fromXmlReader($oXml);
        $this->assertEquals('Overview', $treeGroup->shortname);
    }

    public function testEmpty(): void
    {
        $xmlStr = '
      <layer-tree-group expanded="1" groupLayer="" name="Buildings" checked="Qt::Checked">
      </layer-tree-group>
      ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $treeGroup = Qgis\LayerTreeGroup::fromXmlReader($oXml);

        $this->assertEquals('Buildings', $treeGroup->name);
        $this->assertFalse($treeGroup->mutuallyExclusive);

        $this->assertNotNull($treeGroup->customproperties);
        $this->assertIsArray($treeGroup->customproperties);
        $this->assertCount(0, $treeGroup->customproperties);

        $this->assertNotNull($treeGroup->items);
        $this->assertIsArray($treeGroup->items);
        $this->assertCount(0, $treeGroup->items);
    }
}
