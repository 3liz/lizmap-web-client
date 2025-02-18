<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class LayerTreeLayerTest extends TestCase
{
    public function testConstruct(): void
    {
      $xmlStr = '
        <layer-tree-layer expanded="1" legend_exp="" name="tramway" checked="Qt::Unchecked" id="tramway20150328114206278" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/transport.sqlite\' table=&quot;tramway&quot; (geometry)" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option name="expandedLegendNodes"/>
              <Option type="QString" name="showFeatureCount" value="1"/>
            </Option>
          </customproperties>
        </layer-tree-layer>
      ';
      $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
      $treeLayer = Qgis\LayerTreeLayer::fromXmlReader($oXml);

      $this->assertEquals('tramway', $treeLayer->name);
      $this->assertEquals('tramway20150328114206278', $treeLayer->id);

      $expectedCustomproperties = array(
        'expandedLegendNodes' => null,
        'showFeatureCount' => '1',
      );
      $this->assertEquals($expectedCustomproperties, $treeLayer->customproperties);
    }
}
