<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class LayoutItemTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        // LayoutItemPage
        $xmlStr = '
        <LayoutItem templateUuid="{c7f5eda5-28b1-4804-b7d2-50154503de18}" positionOnPage="0,0,mm" id="" size="297,210,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65638" groupUuid="" positionLock="false" frameJoinStyle="miter" background="true" visibility="1" position="0,0,mm" frame="false" uuid="{c7f5eda5-28b1-4804-b7d2-50154503de18}" excludeFromExports="0" zValue="0">
          <FrameColor red="0" alpha="255" green="0" blue="0"/>
          <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
          <LayoutObject>
            <dataDefinedProperties>
              <Option type="Map">
                <Option value="" type="QString" name="name"/>
                <Option name="properties"/>
                <Option value="collection" type="QString" name="type"/>
              </Option>
            </dataDefinedProperties>
            <customproperties/>
          </LayoutObject>
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="fill" name="">
            <layer locked="0" enabled="1" class="SimpleFill" pass="0">
              <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
              <prop v="255,255,255,255" k="color"/>
              <prop v="miter" k="joinstyle"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="35,35,35,255" k="outline_color"/>
              <prop v="no" k="outline_style"/>
              <prop v="0.26" k="outline_width"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="solid" k="style"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </LayoutItem>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $item = Qgis\Layout\LayoutItem::fromXmlReader($oXml);
        $this->assertInstanceOf(Qgis\Layout\LayoutItemPage::class, $item);

        $data = array(
            'type' => 65638,
            'typeName' => 'page',
            'width' => 297,
            'height' => 210,
            'x' => 0,
            'y' => 0,
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $item->$prop, $prop);
        }

        // LayoutItemLabel
        $xmlStr = '
        <LayoutItem templateUuid="{1882e5b6-7d46-4bbc-af77-e0c6ab1681f6}" positionOnPage="8.10892,83.121,mm" labelText="Tram stops in the district" id="" valign="32" marginY="1" halign="1" size="278.374,7.59424,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" blendMode="0" opacity="1" type="65641" groupUuid="" positionLock="false" frameJoinStyle="miter" background="false" visibility="1" position="8.10892,303.121,mm" marginX="1" frame="false" uuid="{1882e5b6-7d46-4bbc-af77-e0c6ab1681f6}" excludeFromExports="0" zValue="24" htmlState="0">
          <FrameColor red="0" alpha="255" green="0" blue="0"/>
          <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
          <LayoutObject>
            <dataDefinedProperties>
              <Option type="Map">
                <Option value="" type="QString" name="name"/>
                <Option name="properties"/>
                <Option value="collection" type="QString" name="type"/>
              </Option>
            </dataDefinedProperties>
            <customproperties/>
          </LayoutObject>
          <LabelFont description="Bitstream Vera Sans,16,-1,5,50,2,0,0,0,0" style=""/>
          <FontColor red="0" alpha="255" green="0" blue="0"/>
        </LayoutItem>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $item = Qgis\Layout\LayoutItem::fromXmlReader($oXml);
        $this->assertInstanceOf(Qgis\Layout\LayoutItemLabel::class, $item);

        $data = array(
            'type' => 65641,
            'typeName' => 'label',
            'id' => '',
            'htmlState' => false,
            'text' => 'Tram stops in the district',
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $item->$prop, $prop);
        }

        // LayoutItemMap
        $xmlStr = '
        <LayoutItem templateUuid="{a50537f9-5e73-4610-955e-31b092d81b94}" positionOnPage="237.35,162.072,mm" mapRotation="0" id="" size="60.5889,45,mm" referencePoint="0" outlineWidthM="0.3,mm" itemRotation="0" mapFlags="0" blendMode="0" opacity="1" type="65639" groupUuid="" positionLock="false" drawCanvasItems="true" labelMargin="0,mm" frameJoinStyle="miter" background="true" visibility="1" position="237.35,162.072,mm" keepLayerSet="true" frame="false" uuid="{a50537f9-5e73-4610-955e-31b092d81b94}" excludeFromExports="0" followPresetName="" followPreset="false" zValue="3">
          <FrameColor red="0" alpha="255" green="0" blue="0"/>
          <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
          <LayoutObject>
            <dataDefinedProperties>
              <Option type="Map">
                <Option value="" type="QString" name="name"/>
                <Option name="properties"/>
                <Option value="collection" type="QString" name="type"/>
              </Option>
            </dataDefinedProperties>
            <customproperties/>
          </LayoutObject>
          <Extent xmax="448907.96636085514910519" ymax="5417374.24027335178107023" ymin="5392381.09543511364609003" xmin="415256.69628775410819799"/>
          <LayerSet>
            <Layer provider="ogr" source="/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/data/vector/VilleMTP_MTP_Quartiers_2011_4326.shp" name="VilleMTP_MTP_Quartiers_2011_4326">VilleMTP_MTP_Quartiers_2011_432620130116112351546</Layer>
          </LayerSet>
          <ComposerMapGrid showAnnotation="0" rightAnnotationDirection="0" gridFrameMargin="0" bottomAnnotationDisplay="0" bottomFrameDivisions="0" topAnnotationDirection="0" annotationExpression="" rightAnnotationDisplay="0" gridFrameWidth="2" topAnnotationDisplay="0" rightAnnotationPosition="1" annotationPrecision="3" bottomAnnotationDirection="0" gridFramePenColor="0,0,0,255" show="0" gridStyle="0" annotationFormat="0" name="Grille 1" unit="0" crossLength="3" gridFrameSideFlags="15" topFrameDivisions="0" uuid="{79ab9045-ef71-4cf1-83f1-f90bfe64ad9f}" intervalX="0" gridFrameStyle="0" offsetY="0" rightFrameDivisions="0" leftAnnotationPosition="1" leftFrameDivisions="0" intervalY="0" offsetX="0" annotationFontColor="0,0,0,255" leftAnnotationDisplay="0" bottomAnnotationPosition="1" frameFillColor1="255,255,255,255" frameAnnotationDistance="1" topAnnotationPosition="1" leftAnnotationDirection="0" blendMode="0" maximumIntervalWidth="100" position="3" gridFramePenThickness="0.5" frameFillColor2="0,0,0,255" minimumIntervalWidth="50">
            <lineStyle>
              <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="line" name="">
                <layer locked="0" enabled="1" class="SimpleLine" pass="0">
                  <prop v="flat" k="capstyle"/>
                  <prop v="5;2" k="customdash"/>
                  <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                  <prop v="MM" k="customdash_unit"/>
                  <prop v="0" k="draw_inside_polygon"/>
                  <prop v="bevel" k="joinstyle"/>
                  <prop v="0,0,0,255" k="line_color"/>
                  <prop v="solid" k="line_style"/>
                  <prop v="0.3" k="line_width"/>
                  <prop v="MM" k="line_width_unit"/>
                  <prop v="0" k="offset"/>
                  <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                  <prop v="MM" k="offset_unit"/>
                  <prop v="0" k="ring_filter"/>
                  <prop v="0" k="use_custom_dash"/>
                  <prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/>
                  <data_defined_properties>
                    <Option type="Map">
                      <Option value="" type="QString" name="name"/>
                      <Option name="properties"/>
                      <Option value="collection" type="QString" name="type"/>
                    </Option>
                  </data_defined_properties>
                </layer>
              </symbol>
            </lineStyle>
            <markerStyle>
              <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="marker" name="">
                <layer locked="0" enabled="1" class="SimpleMarker" pass="0">
                  <prop v="0" k="angle"/>
                  <prop v="0,0,0,255" k="color"/>
                  <prop v="1" k="horizontal_anchor_point"/>
                  <prop v="bevel" k="joinstyle"/>
                  <prop v="circle" k="name"/>
                  <prop v="0,0" k="offset"/>
                  <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                  <prop v="MM" k="offset_unit"/>
                  <prop v="0,0,0,255" k="outline_color"/>
                  <prop v="solid" k="outline_style"/>
                  <prop v="0" k="outline_width"/>
                  <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
                  <prop v="MM" k="outline_width_unit"/>
                  <prop v="area" k="scale_method"/>
                  <prop v="2" k="size"/>
                  <prop v="3x:0,0,0,0,0,0" k="size_map_unit_scale"/>
                  <prop v="MM" k="size_unit"/>
                  <prop v="1" k="vertical_anchor_point"/>
                  <data_defined_properties>
                    <Option type="Map">
                      <Option value="" type="QString" name="name"/>
                      <Option name="properties"/>
                      <Option value="collection" type="QString" name="type"/>
                    </Option>
                  </data_defined_properties>
                </layer>
              </symbol>
            </markerStyle>
            <annotationFontProperties description="Cantarell,11,-1,5,50,0,0,0,0,0" style=""/>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
          </ComposerMapGrid>
          <ComposerMapOverview uuid="{cccfa4de-c508-4cc3-a6fb-7d18d2491b66}" blendMode="0" position="3" frameMap="{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}" show="1" inverted="0" centered="0" name="Overview 1">
            <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="fill" name="">
              <layer locked="0" enabled="1" class="SimpleLine" pass="0">
                <prop v="square" k="capstyle"/>
                <prop v="5;2" k="customdash"/>
                <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                <prop v="MM" k="customdash_unit"/>
                <prop v="0" k="draw_inside_polygon"/>
                <prop v="bevel" k="joinstyle"/>
                <prop v="227,26,28,255" k="line_color"/>
                <prop v="solid" k="line_style"/>
                <prop v="0.78" k="line_width"/>
                <prop v="MM" k="line_width_unit"/>
                <prop v="0" k="offset"/>
                <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
                <prop v="MM" k="offset_unit"/>
                <prop v="0" k="ring_filter"/>
                <prop v="0" k="use_custom_dash"/>
                <prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
            <LayoutObject>
              <dataDefinedProperties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </dataDefinedProperties>
              <customproperties/>
            </LayoutObject>
          </ComposerMapOverview>
          <AtlasMap scalingMode="2" atlasDriven="0" margin="0.10000000000000001"/>
          <labelBlockingItems/>
        </LayoutItem>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $item = Qgis\Layout\LayoutItem::fromXmlReader($oXml);
        $this->assertInstanceOf(Qgis\Layout\LayoutItemMap::class, $item);

        $data = array(
            'type' => 65639,
            'typeName' => 'map',
            'uuid' => '{a50537f9-5e73-4610-955e-31b092d81b94}',
            'width' => 60,
            'height' => 45,
            'grid' => false,
            'overviewMap' => '{a228885d-4d7a-4ae0-af9b-02a4fe7cd814}',
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $item->$prop, $prop);
        }

        // LayoutItemMap
        $xmlStr = '
        <LayoutItem legendFilterByAtlas="0" positionLock="false" referencePoint="0" boxSpace="2" symbolWidth="7" outlineWidthM="0.3,mm" groupUuid="" title="Legend" wmsLegendWidth="50" templateUuid="{628b29bf-e618-468f-b6e7-190fe07de241}" frameJoinStyle="miter" symbolAlignment="1" rasterBorderColor="0,0,0,255" itemRotation="0" uuid="{628b29bf-e618-468f-b6e7-190fe07de241}" titleAlignment="1" rasterBorderWidth="0" type="65642" size="85.35,130.9,mm" zValue="5" map_uuid="{370e313a-d6da-4ab9-832f-3765b747d630}" positionOnPage="252.331,84.0089,mm" lineSpacing="1" rasterBorder="1" resizeToContents="1" wrapChar="" columnSpace="2" opacity="1" splitLayer="0" background="false" wmsLegendHeight="25" columnCount="1" id="" excludeFromExports="0" fontColor="#000000" equalColumnWidth="0" blendMode="0" position="252.331,84.0089,mm" symbolHeight="4" frame="true" visibility="1">
        <FrameColor red="0" alpha="255" green="0" blue="0"/>
        <BackgroundColor red="255" alpha="255" green="255" blue="255"/>
        <LayoutObject>
          <dataDefinedProperties>
            <Option type="Map">
              <Option value="" type="QString" name="name"/>
              <Option name="properties"/>
              <Option value="collection" type="QString" name="type"/>
            </Option>
          </dataDefinedProperties>
          <customproperties/>
        </LayoutObject>
        <styles>
          <style marginBottom="2" alignment="1" name="title">
            <styleFont description="Ubuntu,16,-1,5,50,0,0,0,0,0" style=""/>
          </style>
          <style alignment="1" marginTop="2" name="group">
            <styleFont description="Ubuntu,14,-1,5,50,0,0,0,0,0" style=""/>
          </style>
          <style alignment="1" marginTop="2" name="subgroup">
            <styleFont description="Ubuntu,12,-1,5,50,0,0,0,0,0" style=""/>
          </style>
          <style alignment="1" marginTop="2" name="symbol">
            <styleFont description="Cantarell,11,-1,5,50,0,0,0,0,0" style=""/>
          </style>
          <style marginLeft="2" alignment="1" marginTop="2" name="symbolLabel">
            <styleFont description="Ubuntu,12,-1,5,50,0,0,0,0,0" style=""/>
          </style>
        </styles>
        <layer-tree-group>
          <customproperties/>
          <layer-tree-layer providerKey="spatialite" legend_exp="" source="dbname=\'/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/edition/edition_db.sqlite\' table=&quot;edition_polygon&quot; (geom) sql=" id="edition_polygon20130409114333776" expanded="1" checked="Qt::Checked" name="areas_of_interest">
            <customproperties>
              <property value="subgroup" key="legend/title-style"/>
            </customproperties>
          </layer-tree-layer>
          <layer-tree-layer providerKey="spatialite" legend_exp="" source="dbname=\'/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/edition/edition_db.sqlite\' table=&quot;edition_point&quot; (geometry) sql=" id="edition_point20130118171631518" expanded="1" checked="Qt::Checked" name="points of interest">
            <customproperties>
              <property value="subgroup" key="legend/title-style"/>
            </customproperties>
          </layer-tree-layer>
          <layer-tree-layer providerKey="spatialite" legend_exp="" source="dbname=\'/home/nboisteault/3liz/infra/lizmap-qgis-3.10/extra-modules/lizmapdemo/qgis-projects/demoqgis/edition/edition_db.sqlite\' table=&quot;edition_line&quot; (geom) sql=" id="edition_line20130409161630329" expanded="1" checked="Qt::Checked" name="edition_line">
            <customproperties>
              <property value="subgroup" key="legend/title-style"/>
            </customproperties>
          </layer-tree-layer>
          <layer-tree-layer legend_exp="" id="VilleMTP_MTP_SousQuartiers_201120130929113137811" expanded="1" checked="Qt::Checked" name="SousQuartiers">
            <customproperties>
              <property value="hidden" key="legend/title-style"/>
            </customproperties>
          </layer-tree-layer>
          <layer-tree-layer legend_exp="" id="frmt_wms_openstreetmap_mapnik_tms20140610162910636" expanded="1" checked="Qt::Checked" name="frmt_wms_openstreetmap_mapnik_tms">
            <customproperties>
              <property value="subgroup" key="legend/title-style"/>
            </customproperties>
          </layer-tree-layer>
          <layer-tree-layer legend_exp="" id="frmt_wms_openstreetmap_stamen_toner_tms20140610162911446" expanded="1" checked="Qt::Checked" name="frmt_wms_openstreetmap_stamen_toner_tms">
            <customproperties>
              <property value="subgroup" key="legend/title-style"/>
            </customproperties>
          </layer-tree-layer>
          <custom-order enabled="0"/>
        </layer-tree-group>
        </LayoutItem>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $item = Qgis\Layout\LayoutItem::fromXmlReader($oXml);
        $this->assertInstanceOf(Qgis\Layout\LayoutItem::class, $item);

        $data = array(
            'type' => 65642,
            'width' => 85,
            'height' => 130,
            'x' => 252,
            'y' => 84,
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $item->$prop, $prop);
        }
    }
}
