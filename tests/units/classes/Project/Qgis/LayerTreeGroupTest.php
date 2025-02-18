<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
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

      $expectedCustomproperties = array(
        'wmsShortName' => 'Buildings',
      );
      $this->assertEquals($expectedCustomproperties, $treeGroup->customproperties);

      $this->assertCount(2, $treeGroup->items);
      $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $treeGroup->items[0]);
      $this->assertEquals('publicbuildings', $treeGroup->items[0]->name);
      $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $treeGroup->items[1]);
      $this->assertEquals('publicbuildings_tramstop', $treeGroup->items[1]->name);
    }
}
