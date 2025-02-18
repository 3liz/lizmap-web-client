<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class LayerTreeRootTest extends TestCase
{
    public function testConstruct(): void
    {
        $data = array(
          'customOrder' => new Qgis\LayerTreeCustomOrder(array(
            'enabled' => False,
          )),
        );

        $root = new Qgis\LayerTreeRoot($data);
        $this->assertInstanceOf(Qgis\LayerTreeCustomOrder::class, $root->customOrder);
        $this->assertFalse($root->customOrder->enabled);
        $this->assertCount(0, $root->customOrder->items);
        $this->assertEquals(array(), $root->customOrder->items);

        $items = array(
            'A',
            'B',
            'C',
        );
        $data = array(
            'customOrder' => new Qgis\LayerTreeCustomOrder(array(
              'enabled' => True,
              'items' => $items,
            )),
        );
        $root = new Qgis\LayerTreeRoot($data);
        $this->assertInstanceOf(Qgis\LayerTreeCustomOrder::class, $root->customOrder);
        $this->assertTrue($root->customOrder->enabled);
        $this->assertCount(3, $root->customOrder->items);
        $this->assertEquals($items, $root->customOrder->items);

        $items = array(
            'A',
            'B',
            'C',
        );
        $data = array(
            'customOrder' => new Qgis\LayerTreeCustomOrder(array(
              'enabled' => False,
              'items' => $items,
            )),
        );
        $root = new Qgis\LayerTreeRoot($data);
        $this->assertInstanceOf(Qgis\LayerTreeCustomOrder::class, $root->customOrder);
        $this->assertFalse($root->customOrder->enabled);
        $this->assertCount(0, $root->customOrder->items);
        $this->assertEquals(array(), $root->customOrder->items);
    }

    public function testFromXmlReader(): void
    {
        $xmlStr = '
      <layer-tree-group>
        <custom-order enabled="0">
          <item>edition_point20130118171631518</item>
          <item>edition_line20130409161630329</item>
          <item>edition_polygon20130409114333776</item>
          <item>bus_stops20121106170806413</item>
          <item>bus20121102133611751</item>
          <item>VilleMTP_MTP_Quartiers_2011_432620130116112610876</item>
          <item>VilleMTP_MTP_Quartiers_2011_432620130116112351546</item>
          <item>tramstop20150328114203878</item>
          <item>tramway20150328114206278</item>
          <item>publicbuildings20150420100958543</item>
          <item>SousQuartiers20160121124316563</item>
          <item>osm_stamen_toner20180315181710198</item>
          <item>osm_mapnik20180315181738526</item>
        </custom-order>
      </layer-tree-group>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $root = Qgis\LayerTreeRoot::fromXmlReader($oXml);

        $items = array();

        $this->assertInstanceOf(Qgis\LayerTreeCustomOrder::class, $root->customOrder);
        $this->assertFalse($root->customOrder->enabled);
        $this->assertCount(0, $root->customOrder->items);
        $this->assertEquals($items, $root->customOrder->items);

        $xmlStr = '
      <layer-tree-group>
        <custom-order enabled="1">
          <item>edition_point20130118171631518</item>
          <item>edition_line20130409161630329</item>
          <item>edition_polygon20130409114333776</item>
          <item>bus_stops20121106170806413</item>
          <item>bus20121102133611751</item>
          <item>VilleMTP_MTP_Quartiers_2011_432620130116112610876</item>
          <item>VilleMTP_MTP_Quartiers_2011_432620130116112351546</item>
          <item>tramstop20150328114203878</item>
          <item>tramway20150328114206278</item>
          <item>publicbuildings20150420100958543</item>
          <item>SousQuartiers20160121124316563</item>
          <item>osm_stamen_toner20180315181710198</item>
          <item>osm_mapnik20180315181738526</item>
        </custom-order>
      </layer-tree-group>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $root = Qgis\LayerTreeRoot::fromXmlReader($oXml);

        $items = array(
            'edition_point20130118171631518',
            'edition_line20130409161630329',
            'edition_polygon20130409114333776',
            'bus_stops20121106170806413',
            'bus20121102133611751',
            'VilleMTP_MTP_Quartiers_2011_432620130116112610876',
            'VilleMTP_MTP_Quartiers_2011_432620130116112351546',
            'tramstop20150328114203878',
            'tramway20150328114206278',
            'publicbuildings20150420100958543',
            'SousQuartiers20160121124316563',
            'osm_stamen_toner20180315181710198',
            'osm_mapnik20180315181738526',
        );

        $this->assertInstanceOf(Qgis\LayerTreeCustomOrder::class, $root->customOrder);
        $this->assertTrue($root->customOrder->enabled);
        $this->assertCount(13, $root->customOrder->items);
        $this->assertEquals($items, $root->customOrder->items);


        $xmlStr = '
  <layer-tree-group>
    <customproperties>
      <Option/>
    </customproperties>
    <layer-tree-group expanded="1" groupLayer="" name="Edition" checked="Qt::Checked">
      <customproperties>
        <Option type="Map">
          <Option type="QString" name="wmsShortName" value="Edition"/>
        </Option>
      </customproperties>
      <layer-tree-layer expanded="0" legend_exp="" name="points_of_interest" checked="Qt::Unchecked" id="edition_point20130118171631518" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/edition_db.sqlite\' table=&quot;edition_point&quot; (geometry)" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
        <customproperties>
          <Option type="Map">
            <Option type="StringList" name="expandedLegendNodes">
              <Option type="QString" value="0"/>
              <Option type="QString" value="1"/>
              <Option type="QString" value="2"/>
              <Option type="QString" value="3"/>
            </Option>
          </Option>
        </customproperties>
      </layer-tree-layer>
      <layer-tree-layer expanded="0" legend_exp="" name="edition_line" checked="Qt::Unchecked" id="edition_line20130409161630329" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/edition_db.sqlite\' table=&quot;edition_line&quot; (geom)" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
        <customproperties>
          <Option type="Map">
            <Option type="StringList" name="expandedLegendNodes">
              <Option type="QString" value="0"/>
              <Option type="QString" value="1"/>
              <Option type="QString" value="2"/>
            </Option>
          </Option>
        </customproperties>
      </layer-tree-layer>
      <layer-tree-layer expanded="0" legend_exp="" name="areas_of_interest" checked="Qt::Unchecked" id="edition_polygon20130409114333776" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/edition_db.sqlite\' table=&quot;edition_polygon&quot; (geom)" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
        <customproperties>
          <Option type="Map">
            <Option type="StringList" name="expandedLegendNodes">
              <Option type="QString" value="0"/>
              <Option type="QString" value="1"/>
            </Option>
          </Option>
        </customproperties>
      </layer-tree-layer>
    </layer-tree-group>
    <layer-tree-group expanded="1" groupLayer="" name="datalayers" checked="Qt::Checked">
      <customproperties>
        <Option type="Map">
          <Option type="QString" name="wmsShortName" value="datalayers"/>
        </Option>
      </customproperties>
      <layer-tree-group expanded="1" groupLayer="" name="Bus" checked="Qt::Unchecked">
        <customproperties>
          <Option type="Map">
            <Option type="QString" name="wmsShortName" value="Bus"/>
          </Option>
        </customproperties>
        <layer-tree-layer expanded="1" legend_exp="" name="bus_stops" checked="Qt::Unchecked" id="bus_stops20121106170806413" source="./data/vector/bus_stops.shp" providerKey="ogr" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option name="expandedLegendNodes"/>
            </Option>
          </customproperties>
        </layer-tree-layer>
        <layer-tree-layer expanded="0" legend_exp="" name="bus" checked="Qt::Unchecked" id="bus20121102133611751" source="./data/vector/bus.shp" providerKey="ogr" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option type="StringList" name="expandedLegendNodes">
                <Option type="QString" value="0"/>
                <Option type="QString" value="1"/>
                <Option type="QString" value="2"/>
                <Option type="QString" value="3"/>
                <Option type="QString" value="4"/>
                <Option type="QString" value="5"/>
                <Option type="QString" value="6"/>
                <Option type="QString" value="7"/>
                <Option type="QString" value="8"/>
                <Option type="QString" value="9"/>
                <Option type="QString" value="10"/>
                <Option type="QString" value="11"/>
                <Option type="QString" value="12"/>
                <Option type="QString" value="13"/>
                <Option type="QString" value="14"/>
                <Option type="QString" value="15"/>
                <Option type="QString" value="16"/>
                <Option type="QString" value="17"/>
                <Option type="QString" value="18"/>
                <Option type="QString" value="19"/>
                <Option type="QString" value="20"/>
                <Option type="QString" value="21"/>
                <Option type="QString" value="22"/>
                <Option type="QString" value="23"/>
                <Option type="QString" value="24"/>
                <Option type="QString" value="25"/>
                <Option type="QString" value="26"/>
                <Option type="QString" value="27"/>
                <Option type="QString" value="28"/>
                <Option type="QString" value="29"/>
                <Option type="QString" value="30"/>
              </Option>
            </Option>
          </customproperties>
        </layer-tree-layer>
      </layer-tree-group>
      <layer-tree-group expanded="1" groupLayer="" name="Tramway" checked="Qt::Unchecked">
        <customproperties>
          <Option type="Map">
            <Option type="QString" name="wmsShortName" value="Tramway"/>
          </Option>
        </customproperties>
        <layer-tree-layer expanded="1" legend_exp="" name="tramway_ref" checked="Qt::Unchecked" id="tramway_ref20150612171109044" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/transport.sqlite\' table=&quot;tramway_ref&quot;" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option name="expandedLegendNodes"/>
            </Option>
          </customproperties>
        </layer-tree-layer>
        <layer-tree-layer expanded="1" legend_exp="" name="tramway_pivot" checked="Qt::Unchecked" id="jointure_tram_stop20150328114216806" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/transport.sqlite\' table=&quot;jointure_tram_stop&quot;" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option name="expandedLegendNodes"/>
            </Option>
          </customproperties>
        </layer-tree-layer>
        <layer-tree-layer expanded="1" legend_exp="" name="tram_stop_work" checked="Qt::Unchecked" id="tram_stop_work20150416102656130" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/transport.sqlite\' table=&quot;tram_stop_work&quot;" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option name="expandedLegendNodes"/>
            </Option>
          </customproperties>
        </layer-tree-layer>
        <layer-tree-layer expanded="1" legend_exp="" name="tramstop" checked="Qt::Unchecked" id="tramstop20150328114203878" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/transport.sqlite\' table=&quot;tramstop&quot; (geometry)" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option name="expandedLegendNodes"/>
            </Option>
          </customproperties>
        </layer-tree-layer>
        <layer-tree-layer expanded="1" legend_exp="" name="tramway" checked="Qt::Unchecked" id="tramway20150328114206278" source="dbname=\'/bob/lizmapdemo/qgis-projects/demoqgis/edition/transport.sqlite\' table=&quot;tramway&quot; (geometry)" providerKey="spatialite" patch_size="0,0" legend_split_behavior="0">
          <customproperties>
            <Option type="Map">
              <Option name="expandedLegendNodes"/>
              <Option type="QString" name="showFeatureCount" value="1"/>
            </Option>
          </customproperties>
        </layer-tree-layer>
      </layer-tree-group>
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
    </layer-tree-group>
    <layer-tree-layer expanded="1" legend_exp="" name="donnes_sociodemo_sous_quartiers" checked="Qt::Checked" id="donnes_sociodemo_sous_quartiers20160121144525075" source="./data/vector/donnes_sociodemo_sous_quartiers.csv" providerKey="ogr" patch_size="0,0" legend_split_behavior="0">
      <customproperties>
        <Option type="Map">
          <Option name="expandedLegendNodes"/>
        </Option>
      </customproperties>
    </layer-tree-layer>
    <layer-tree-layer expanded="1" legend_exp="" name="SousQuartiers" checked="Qt::Checked" id="SousQuartiers20160121124316563" source="./data/vector/VilleMTP_MTP_SousQuartiers_2011.shp" providerKey="ogr" patch_size="0,0" legend_split_behavior="0">
      <customproperties>
        <Option type="Map">
          <Option name="expandedLegendNodes"/>
        </Option>
      </customproperties>
    </layer-tree-layer>
    <layer-tree-layer expanded="1" legend_exp="" name="Quartiers" checked="Qt::Checked" id="VilleMTP_MTP_Quartiers_2011_432620130116112610876" source="./data/vector/VilleMTP_MTP_Quartiers_2011_4326.shp" providerKey="ogr" patch_size="0,0" legend_split_behavior="0">
      <customproperties>
        <Option type="Map">
          <Option type="StringList" name="expandedLegendNodes">
            <Option type="QString" value="0"/>
            <Option type="QString" value="1"/>
            <Option type="QString" value="2"/>
            <Option type="QString" value="3"/>
            <Option type="QString" value="4"/>
            <Option type="QString" value="5"/>
            <Option type="QString" value="6"/>
            <Option type="QString" value="7"/>
          </Option>
        </Option>
      </customproperties>
    </layer-tree-layer>
    <layer-tree-group expanded="1" groupLayer="" name="Overview" checked="Qt::Unchecked">
      <customproperties>
        <Option type="Map">
          <Option type="QString" name="wmsShortName" value="Overview"/>
        </Option>
      </customproperties>
      <layer-tree-layer expanded="1" legend_exp="" name="VilleMTP_MTP_Quartiers_2011_4326" checked="Qt::Unchecked" id="VilleMTP_MTP_Quartiers_2011_432620130116112351546" source="./data/vector/VilleMTP_MTP_Quartiers_2011_4326.shp" providerKey="ogr" patch_size="0,0" legend_split_behavior="0">
        <customproperties>
          <Option type="Map">
            <Option type="StringList" name="expandedLegendNodes">
              <Option type="QString" value="0"/>
              <Option type="QString" value="1"/>
              <Option type="QString" value="2"/>
              <Option type="QString" value="3"/>
              <Option type="QString" value="4"/>
              <Option type="QString" value="5"/>
              <Option type="QString" value="6"/>
              <Option type="QString" value="7"/>
            </Option>
          </Option>
        </customproperties>
      </layer-tree-layer>
    </layer-tree-group>
    <layer-tree-group mutually-exclusive-child="-1" expanded="1" groupLayer="" name="Hidden" checked="Qt::Unchecked" mutually-exclusive="1">
      <customproperties>
        <Option type="Map">
          <Option type="QString" name="wmsShortName" value="Hidden"/>
        </Option>
      </customproperties>
      <layer-tree-layer expanded="1" legend_exp="" name="osm-mapnik" checked="Qt::Unchecked" id="osm_mapnik20180315181738526" source="crs=EPSG:3857&amp;format=&amp;type=xyz&amp;url=http://tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png" providerKey="wms" patch_size="0,0" legend_split_behavior="0">
        <customproperties>
          <Option type="Map">
            <Option type="QString" name="expandedLegendNodes" value=""/>
          </Option>
        </customproperties>
      </layer-tree-layer>
    </layer-tree-group>
    <custom-order enabled="0">
      <item>edition_point20130118171631518</item>
      <item>edition_line20130409161630329</item>
      <item>edition_polygon20130409114333776</item>
      <item>bus_stops20121106170806413</item>
      <item>bus20121102133611751</item>
      <item>VilleMTP_MTP_Quartiers_2011_432620130116112610876</item>
      <item>VilleMTP_MTP_Quartiers_2011_432620130116112351546</item>
      <item>tramstop20150328114203878</item>
      <item>tramway20150328114206278</item>
      <item>publicbuildings20150420100958543</item>
      <item>SousQuartiers20160121124316563</item>
      <item>osm_mapnik20180315181738526</item>
    </custom-order>
  </layer-tree-group>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $root = Qgis\LayerTreeRoot::fromXmlReader($oXml);

        $this->assertCount(0, $root->customproperties);

        $this->assertCount(7, $root->items);

        $this->assertInstanceOf(Qgis\LayerTreeGroup::class, $root->items[0]);
        $this->assertEquals('Edition', $root->items[0]->name);
        $this->assertCount(3, $root->items[0]->items);

        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[0]->items[0]);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[0]->items[1]);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[0]->items[2]);

        $this->assertInstanceOf(Qgis\LayerTreeGroup::class, $root->items[1]);
        $this->assertEquals('datalayers', $root->items[1]->name);
        $this->assertCount(3, $root->items[1]->items);

        $this->assertInstanceOf(Qgis\LayerTreeGroup::class, $root->items[1]->items[0]);
        $this->assertEquals('Bus', $root->items[1]->items[0]->name);
        $this->assertCount(2, $root->items[1]->items[0]->items);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[1]->items[0]->items[0]);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[1]->items[0]->items[1]);

        $this->assertInstanceOf(Qgis\LayerTreeGroup::class, $root->items[1]->items[1]);
        $this->assertEquals('Tramway', $root->items[1]->items[1]->name);
        $this->assertCount(5, $root->items[1]->items[1]->items);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[1]->items[1]->items[0]);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[1]->items[1]->items[1]);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[1]->items[1]->items[2]);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[1]->items[1]->items[3]);
        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[1]->items[1]->items[4]);

        $this->assertInstanceOf(Qgis\LayerTreeGroup::class, $root->items[1]->items[2]);
        $this->assertEquals('Buildings', $root->items[1]->items[2]->name);
        $this->assertCount(2, $root->items[1]->items[2]->items);

        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[2]);
        $this->assertEquals('donnes_sociodemo_sous_quartiers', $root->items[2]->name);

        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[3]);
        $this->assertEquals('SousQuartiers', $root->items[3]->name);

        $this->assertInstanceOf(Qgis\LayerTreeLayer::class, $root->items[4]);
        $this->assertEquals('Quartiers', $root->items[4]->name);

        $this->assertInstanceOf(Qgis\LayerTreeGroup::class, $root->items[5]);
        $this->assertEquals('Overview', $root->items[5]->name);

        $this->assertInstanceOf(Qgis\LayerTreeGroup::class, $root->items[6]);
        $this->assertEquals('Hidden', $root->items[6]->name);

        $this->assertInstanceOf(Qgis\LayerTreeCustomOrder::class, $root->customOrder);
        $this->assertFalse($root->customOrder->enabled);
        $this->assertCount(0, $root->customOrder->items);

        $groupShortNames = $root->getGroupShortNames();
        $this->assertCount(7, $groupShortNames);

        $expectedGroupShortNames = array(
            'Edition' => 'Edition',
            'Bus' => 'Bus',
            'Tramway' => 'Tramway',
            'Buildings' => 'Buildings',
            'datalayers' => 'datalayers',
            'Overview' => 'Overview',
            'Hidden' => 'Hidden',
        );
        $this->assertEquals($expectedGroupShortNames, $groupShortNames);

        $groupsMutuallyExclusive = $root->getGroupsMutuallyExclusive();
        $this->assertCount(1, $groupsMutuallyExclusive);
        $this->assertEquals('Hidden', $groupsMutuallyExclusive[0]);

        $layersShowFeatureCount = $root->getLayersShowFeatureCount();
        $this->assertCount(1, $layersShowFeatureCount);
        $this->assertEquals('tramway', $layersShowFeatureCount[0]);
    }
}
