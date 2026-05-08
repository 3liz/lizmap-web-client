<?php

use Lizmap\App;
use Lizmap\Project\Qgis;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class MapLayerTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        // EmbeddedLayer
        $xmlStr = '
        <maplayer project="./relations_project.qgs" id="child_layer_8dec6d75_eeed_494b_b97f_5f2c7e16fd00" embedded="1"/>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);
        $this->assertTrue($layer->embedded);
        $this->assertInstanceOf(Qgis\Layer\EmbeddedLayer::class, $layer);

        $data = array(
            'id' => 'child_layer_8dec6d75_eeed_494b_b97f_5f2c7e16fd00',
            'embedded' => true,
            'type' => 'embedded',
            'project' => './relations_project.qgs',
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $layer->{$prop}, $prop);
        }

        $keyData = $layer->toKeyArray();
        $this->assertTrue(is_array($keyData));
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $keyData[$prop], $prop);
        }

        // MapLayer
        $xmlStr = '
        <maplayer hasScaleBasedVisibilityFlag="0" refreshOnNotifyEnabled="0" styleCategories="AllStyleCategories" maxScale="0" minScale="1e+8" autoRefreshEnabled="0" refreshOnNotifyMessage="" type="raster" autoRefreshTime="0">
          <extent>
            <xmin>-20037508.34278924390673637</xmin>
            <ymin>-20037508.34278925508260727</ymin>
            <xmax>20037508.34278924390673637</xmax>
            <ymax>20037508.34278924390673637</ymax>
          </extent>
          <id>osm_mapnik20180315181738526</id>
          <datasource>crs=EPSG:3857&amp;format=&amp;type=xyz&amp;url=http://tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png</datasource>
          <keywordList>
            <value></value>
          </keywordList>
          <layername>osm-mapnik</layername>
          <srs>
            <spatialrefsys>
              <wkt>PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["X",EAST],AXIS["Y",NORTH],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs"],AUTHORITY["EPSG","3857"]]</wkt>
              <proj4>+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs</proj4>
              <srsid>3857</srsid>
              <srid>3857</srid>
              <authid>EPSG:3857</authid>
              <description>WGS 84 / Pseudo-Mercator</description>
              <projectionacronym>merc</projectionacronym>
              <ellipsoidacronym>WGS84</ellipsoidacronym>
              <geographicflag>false</geographicflag>
            </spatialrefsys>
          </srs>
          <resourceMetadata>
            <identifier></identifier>
            <parentidentifier></parentidentifier>
            <language></language>
            <type></type>
            <title></title>
            <abstract></abstract>
            <links/>
            <fees></fees>
            <encoding></encoding>
            <crs>
              <spatialrefsys>
                <wkt></wkt>
                <proj4></proj4>
                <srsid>0</srsid>
                <srid>0</srid>
                <authid></authid>
                <description></description>
                <projectionacronym></projectionacronym>
                <ellipsoidacronym></ellipsoidacronym>
                <geographicflag>true</geographicflag>
              </spatialrefsys>
            </crs>
            <extent/>
          </resourceMetadata>
          <provider>wms</provider>
          <noData>
            <noDataList bandNo="1" useSrcNoData="0"/>
          </noData>
          <map-layer-style-manager current="default">
            <map-layer-style name="default"/>
          </map-layer-style-manager>
          <flags>
            <Identifiable>1</Identifiable>
            <Removable>1</Removable>
            <Searchable>1</Searchable>
          </flags>
          <customproperties>
            <property value="Undefined" key="identify/format"/>
          </customproperties>
          <pipe>
            <rasterrenderer band="1" type="singlebandcolordata" alphaBand="-1" opacity="1">
              <rasterTransparency/>
              <minMaxOrigin>
                <limits>None</limits>
                <extent>WholeRaster</extent>
                <statAccuracy>Estimated</statAccuracy>
                <cumulativeCutLower>0.02</cumulativeCutLower>
                <cumulativeCutUpper>0.98</cumulativeCutUpper>
                <stdDevFactor>2</stdDevFactor>
              </minMaxOrigin>
            </rasterrenderer>
            <brightnesscontrast contrast="0" brightness="0"/>
            <huesaturation colorizeOn="0" colorizeRed="255" colorizeBlue="128" saturation="0" colorizeStrength="100" grayscaleMode="0" colorizeGreen="128"/>
            <rasterresampler maxOversampling="2"/>
          </pipe>
          <blendMode>0</blendMode>
        </maplayer>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);
        $this->assertFalse($layer->embedded);
        $this->assertInstanceOf(Qgis\Layer\RasterLayer::class, $layer);

        $data = array(
            'id' => 'osm_mapnik20180315181738526',
            'embedded' => false,
            'type' => 'raster',
            'layername' => 'osm-mapnik',
            // 'srs',
            'datasource' => 'crs=EPSG:3857&format=&type=xyz&url=http://tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png',
            'provider' => 'wms',
            'shortname' => null,
            'title' => null,
            'abstract' => null,
            'keywordList' => array(''),
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $layer->{$prop}, $prop);
        }

        $this->assertNotNull($layer->srs);
        $data = array(
            'proj4' => '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
            'srid' => 3857,
            'authid' => 'EPSG:3857',
            'description' => 'WGS 84 / Pseudo-Mercator',
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $layer->srs->{$prop}, $prop);
        }

        $this->assertNotNull($layer->styleManager);
        $data = array(
            'current' => 'default',
            'styles' => array('default'),
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $layer->styleManager->{$prop}, $prop);
        }

        $keyData = $layer->toKeyArray();
        $this->assertTrue(is_array($keyData));
        $data = array(
            'type' => 'raster',
            'id' => 'osm_mapnik20180315181738526',
            'name' => 'osm-mapnik',
            'shortname' => '',
            'title' => 'osm-mapnik',
            'abstract' => '',
            'proj4' => '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
            'srid' => 3857,
            'authid' => 'EPSG:3857',
            'datasource' => 'crs=EPSG:3857&format=&type=xyz&url=http://tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png',
            'provider' => 'wms',
            'keywords' => array(''),
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $keyData[$prop], $prop);
        }

        // VectorLayer
        $xmlStr = '
        <maplayer autoRefreshEnabled="0" readOnly="0" simplifyDrawingHints="1" simplifyMaxScale="1" type="vector" maxScale="-4.65661e-10" geometry="Line" simplifyAlgorithm="0" hasScaleBasedVisibilityFlag="0" simplifyLocal="1" wkbType="MultiLineString" minScale="1e+8" refreshOnNotifyEnabled="0" autoRefreshTime="0" simplifyDrawingTol="1" styleCategories="AllStyleCategories" labelsEnabled="1" refreshOnNotifyMessage="">
          <extent>
            <xmin>3.8097468000000001</xmin>
            <ymin>43.55760910000000052</ymin>
            <xmax>3.96392439999999979</xmax>
            <ymax>43.65461210000000136</ymax>
          </extent>
          <id>tramway20150328114206278</id>
          <datasource>dbname=\'./edition/transport.sqlite\' table="tramway" (geometry) sql=</datasource>
          <title>Tram lines</title>
          <keywordList>
            <value></value>
          </keywordList>
          <layername>tramway</layername>
          <srs>
            <spatialrefsys>
              <wkt>GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]</wkt>
              <proj4>+proj=longlat +datum=WGS84 +no_defs</proj4>
              <srsid>3452</srsid>
              <srid>4326</srid>
              <authid>EPSG:4326</authid>
              <description>WGS 84</description>
              <projectionacronym>longlat</projectionacronym>
              <ellipsoidacronym>WGS84</ellipsoidacronym>
              <geographicflag>true</geographicflag>
            </spatialrefsys>
          </srs>
          <resourceMetadata>
            <identifier></identifier>
            <parentidentifier></parentidentifier>
            <language></language>
            <type></type>
            <title></title>
            <abstract></abstract>
            <links/>
            <fees></fees>
            <encoding></encoding>
            <crs>
              <spatialrefsys>
                <wkt></wkt>
                <proj4></proj4>
                <srsid>0</srsid>
                <srid>0</srid>
                <authid></authid>
                <description></description>
                <projectionacronym></projectionacronym>
                <ellipsoidacronym></ellipsoidacronym>
                <geographicflag>true</geographicflag>
              </spatialrefsys>
            </crs>
            <extent/>
          </resourceMetadata>
          <provider encoding="UTF-8">spatialite</provider>
          <vectorjoins/>
          <layerDependencies/>
          <dataDependencies/>
          <legend type="default-vector"/>
          <expressionfields/>
          <map-layer-style-manager current="black">
            <map-layer-style name="black"/>
            <map-layer-style name="colored">
              <qgis hasScaleBasedVisibilityFlag="0" maximumScale="1e+08" minLabelScale="1" scaleBasedLabelVisibilityFlag="0" simplifyLocal="1" simplifyMaxScale="1" minimumScale="-4.65661e-10" version="2.14.2-Essen" maxLabelScale="1e+08" simplifyDrawingTol="1" simplifyDrawingHints="1">
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
                <renderer-v2 attr="ref" forceraster="0" enableorderby="0" symbollevels="0" type="categorizedSymbol">
                  <categories>
                    <category label="1" symbol="0" render="true" value="1"/>
                    <category label="2" symbol="1" render="true" value="2"/>
                    <category label="3" symbol="2" render="true" value="3"/>
                    <category label="4" symbol="3" render="true" value="4"/>
                  </categories>
                  <symbols>
                    <symbol alpha="1" clip_to_extent="1" type="line" name="0">
                      <layer locked="0" class="SimpleLine" pass="0">
                        <prop v="square" k="capstyle"/>
                        <prop v="5;2" k="customdash"/>
                        <prop v="0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                        <prop v="MM" k="customdash_unit"/>
                        <prop v="0" k="draw_inside_polygon"/>
                        <prop v="bevel" k="joinstyle"/>
                        <prop v="0,0,255,255" k="line_color"/>
                        <prop v="solid" k="line_style"/>
                        <prop v="1.5" k="line_width"/>
                        <prop v="MM" k="line_width_unit"/>
                        <prop v="0" k="offset"/>
                        <prop v="0,0,0,0,0,0" k="offset_map_unit_scale"/>
                        <prop v="MM" k="offset_unit"/>
                        <prop v="0" k="use_custom_dash"/>
                        <prop v="0,0,0,0,0,0" k="width_map_unit_scale"/>
                      </layer>
                    </symbol>
                    <symbol alpha="1" clip_to_extent="1" type="line" name="1">
                      <layer locked="0" class="SimpleLine" pass="0">
                        <prop v="square" k="capstyle"/>
                        <prop v="5;2" k="customdash"/>
                        <prop v="0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                        <prop v="MM" k="customdash_unit"/>
                        <prop v="0" k="draw_inside_polygon"/>
                        <prop v="bevel" k="joinstyle"/>
                        <prop v="255,85,0,255" k="line_color"/>
                        <prop v="solid" k="line_style"/>
                        <prop v="1.5" k="line_width"/>
                        <prop v="MM" k="line_width_unit"/>
                        <prop v="0" k="offset"/>
                        <prop v="0,0,0,0,0,0" k="offset_map_unit_scale"/>
                        <prop v="MM" k="offset_unit"/>
                        <prop v="0" k="use_custom_dash"/>
                        <prop v="0,0,0,0,0,0" k="width_map_unit_scale"/>
                      </layer>
                    </symbol>
                    <symbol alpha="1" clip_to_extent="1" type="line" name="2">
                      <layer locked="0" class="SimpleLine" pass="0">
                        <prop v="square" k="capstyle"/>
                        <prop v="5;2" k="customdash"/>
                        <prop v="0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                        <prop v="MM" k="customdash_unit"/>
                        <prop v="0" k="draw_inside_polygon"/>
                        <prop v="bevel" k="joinstyle"/>
                        <prop v="52,221,193,255" k="line_color"/>
                        <prop v="solid" k="line_style"/>
                        <prop v="1.5" k="line_width"/>
                        <prop v="MM" k="line_width_unit"/>
                        <prop v="0" k="offset"/>
                        <prop v="0,0,0,0,0,0" k="offset_map_unit_scale"/>
                        <prop v="MM" k="offset_unit"/>
                        <prop v="0" k="use_custom_dash"/>
                        <prop v="0,0,0,0,0,0" k="width_map_unit_scale"/>
                      </layer>
                    </symbol>
                    <symbol alpha="1" clip_to_extent="1" type="line" name="3">
                      <layer locked="0" class="SimpleLine" pass="0">
                        <prop v="square" k="capstyle"/>
                        <prop v="5;2" k="customdash"/>
                        <prop v="0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                        <prop v="MM" k="customdash_unit"/>
                        <prop v="0" k="draw_inside_polygon"/>
                        <prop v="bevel" k="joinstyle"/>
                        <prop v="206,208,26,255" k="line_color"/>
                        <prop v="solid" k="line_style"/>
                        <prop v="1.5" k="line_width"/>
                        <prop v="MM" k="line_width_unit"/>
                        <prop v="0" k="offset"/>
                        <prop v="0,0,0,0,0,0" k="offset_map_unit_scale"/>
                        <prop v="MM" k="offset_unit"/>
                        <prop v="0" k="use_custom_dash"/>
                        <prop v="0,0,0,0,0,0" k="width_map_unit_scale"/>
                      </layer>
                    </symbol>
                  </symbols>
                  <source-symbol>
                    <symbol alpha="1" clip_to_extent="1" type="line" name="0">
                      <layer locked="0" class="SimpleLine" pass="0">
                        <prop v="square" k="capstyle"/>
                        <prop v="5;2" k="customdash"/>
                        <prop v="0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                        <prop v="MM" k="customdash_unit"/>
                        <prop v="0" k="draw_inside_polygon"/>
                        <prop v="bevel" k="joinstyle"/>
                        <prop v="91,8,151,255" k="line_color"/>
                        <prop v="solid" k="line_style"/>
                        <prop v="1.5" k="line_width"/>
                        <prop v="MM" k="line_width_unit"/>
                        <prop v="0" k="offset"/>
                        <prop v="0,0,0,0,0,0" k="offset_map_unit_scale"/>
                        <prop v="MM" k="offset_unit"/>
                        <prop v="0" k="use_custom_dash"/>
                        <prop v="0,0,0,0,0,0" k="width_map_unit_scale"/>
                      </layer>
                    </symbol>
                  </source-symbol>
                  <colorramp type="colorbrewer" name="[source]">
                    <prop v="10" k="colors"/>
                    <prop v="Paired" k="schemeName"/>
                  </colorramp>
                  <invertedcolorramp value="0"/>
                  <rotation/>
                  <sizescale scalemethod="diameter"/>
                </renderer-v2>
                <labeling type="simple"/>
                <customproperties>
                  <property value="pal" key="labeling"/>
                  <property value="false" key="labeling/addDirectionSymbol"/>
                  <property value="0" key="labeling/angleOffset"/>
                  <property value="0" key="labeling/blendMode"/>
                  <property value="0" key="labeling/bufferBlendMode"/>
                  <property value="255" key="labeling/bufferColorA"/>
                  <property value="255" key="labeling/bufferColorB"/>
                  <property value="255" key="labeling/bufferColorG"/>
                  <property value="255" key="labeling/bufferColorR"/>
                  <property value="false" key="labeling/bufferDraw"/>
                  <property value="64" key="labeling/bufferJoinStyle"/>
                  <property value="false" key="labeling/bufferNoFill"/>
                  <property value="1" key="labeling/bufferSize"/>
                  <property value="false" key="labeling/bufferSizeInMapUnits"/>
                  <property value="0" key="labeling/bufferSizeMapUnitMaxScale"/>
                  <property value="0" key="labeling/bufferSizeMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/bufferSizeMapUnitScale"/>
                  <property value="0" key="labeling/bufferTransp"/>
                  <property value="false" key="labeling/centroidInside"/>
                  <property value="false" key="labeling/centroidWhole"/>
                  <property value="3" key="labeling/decimals"/>
                  <property value="false" key="labeling/displayAll"/>
                  <property value="0" key="labeling/dist"/>
                  <property value="false" key="labeling/distInMapUnits"/>
                  <property value="0" key="labeling/distMapUnitMaxScale"/>
                  <property value="0" key="labeling/distMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/distMapUnitScale"/>
                  <property value="false" key="labeling/drawLabels"/>
                  <property value="false" key="labeling/enabled"/>
                  <property value="" key="labeling/fieldName"/>
                  <property value="false" key="labeling/fitInPolygonOnly"/>
                  <property value="true" key="labeling/fontBold"/>
                  <property value="0" key="labeling/fontCapitals"/>
                  <property value="Ubuntu" key="labeling/fontFamily"/>
                  <property value="false" key="labeling/fontItalic"/>
                  <property value="0" key="labeling/fontLetterSpacing"/>
                  <property value="false" key="labeling/fontLimitPixelSize"/>
                  <property value="10000" key="labeling/fontMaxPixelSize"/>
                  <property value="3" key="labeling/fontMinPixelSize"/>
                  <property value="11" key="labeling/fontSize"/>
                  <property value="false" key="labeling/fontSizeInMapUnits"/>
                  <property value="0" key="labeling/fontSizeMapUnitMaxScale"/>
                  <property value="0" key="labeling/fontSizeMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/fontSizeMapUnitScale"/>
                  <property value="false" key="labeling/fontStrikeout"/>
                  <property value="false" key="labeling/fontUnderline"/>
                  <property value="63" key="labeling/fontWeight"/>
                  <property value="0" key="labeling/fontWordSpacing"/>
                  <property value="false" key="labeling/formatNumbers"/>
                  <property value="true" key="labeling/isExpression"/>
                  <property value="true" key="labeling/labelOffsetInMapUnits"/>
                  <property value="0" key="labeling/labelOffsetMapUnitMaxScale"/>
                  <property value="0" key="labeling/labelOffsetMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/labelOffsetMapUnitScale"/>
                  <property value="false" key="labeling/labelPerPart"/>
                  <property value="&lt;" key="labeling/leftDirectionSymbol"/>
                  <property value="false" key="labeling/limitNumLabels"/>
                  <property value="20" key="labeling/maxCurvedCharAngleIn"/>
                  <property value="-20" key="labeling/maxCurvedCharAngleOut"/>
                  <property value="2000" key="labeling/maxNumLabels"/>
                  <property value="false" key="labeling/mergeLines"/>
                  <property value="0" key="labeling/minFeatureSize"/>
                  <property value="0" key="labeling/multilineAlign"/>
                  <property value="1" key="labeling/multilineHeight"/>
                  <property value="Medium" key="labeling/namedStyle"/>
                  <property value="true" key="labeling/obstacle"/>
                  <property value="1" key="labeling/obstacleFactor"/>
                  <property value="0" key="labeling/obstacleType"/>
                  <property value="0" key="labeling/offsetType"/>
                  <property value="0" key="labeling/placeDirectionSymbol"/>
                  <property value="2" key="labeling/placement"/>
                  <property value="10" key="labeling/placementFlags"/>
                  <property value="false" key="labeling/plussign"/>
                  <property value="TR,TL,BR,BL,R,L,TSR,BSR" key="labeling/predefinedPositionOrder"/>
                  <property value="true" key="labeling/preserveRotation"/>
                  <property value="#ffffff" key="labeling/previewBkgrdColor"/>
                  <property value="5" key="labeling/priority"/>
                  <property value="4" key="labeling/quadOffset"/>
                  <property value="0" key="labeling/repeatDistance"/>
                  <property value="0" key="labeling/repeatDistanceMapUnitMaxScale"/>
                  <property value="0" key="labeling/repeatDistanceMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/repeatDistanceMapUnitScale"/>
                  <property value="1" key="labeling/repeatDistanceUnit"/>
                  <property value="false" key="labeling/reverseDirectionSymbol"/>
                  <property value=">" key="labeling/rightDirectionSymbol"/>
                  <property value="10000000" key="labeling/scaleMax"/>
                  <property value="1" key="labeling/scaleMin"/>
                  <property value="false" key="labeling/scaleVisibility"/>
                  <property value="6" key="labeling/shadowBlendMode"/>
                  <property value="0" key="labeling/shadowColorB"/>
                  <property value="0" key="labeling/shadowColorG"/>
                  <property value="0" key="labeling/shadowColorR"/>
                  <property value="false" key="labeling/shadowDraw"/>
                  <property value="135" key="labeling/shadowOffsetAngle"/>
                  <property value="1" key="labeling/shadowOffsetDist"/>
                  <property value="true" key="labeling/shadowOffsetGlobal"/>
                  <property value="0" key="labeling/shadowOffsetMapUnitMaxScale"/>
                  <property value="0" key="labeling/shadowOffsetMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/shadowOffsetMapUnitScale"/>
                  <property value="1" key="labeling/shadowOffsetUnits"/>
                  <property value="1.5" key="labeling/shadowRadius"/>
                  <property value="false" key="labeling/shadowRadiusAlphaOnly"/>
                  <property value="0" key="labeling/shadowRadiusMapUnitMaxScale"/>
                  <property value="0" key="labeling/shadowRadiusMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/shadowRadiusMapUnitScale"/>
                  <property value="1" key="labeling/shadowRadiusUnits"/>
                  <property value="100" key="labeling/shadowScale"/>
                  <property value="30" key="labeling/shadowTransparency"/>
                  <property value="0" key="labeling/shadowUnder"/>
                  <property value="0" key="labeling/shapeBlendMode"/>
                  <property value="255" key="labeling/shapeBorderColorA"/>
                  <property value="128" key="labeling/shapeBorderColorB"/>
                  <property value="128" key="labeling/shapeBorderColorG"/>
                  <property value="128" key="labeling/shapeBorderColorR"/>
                  <property value="0" key="labeling/shapeBorderWidth"/>
                  <property value="0" key="labeling/shapeBorderWidthMapUnitMaxScale"/>
                  <property value="0" key="labeling/shapeBorderWidthMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/shapeBorderWidthMapUnitScale"/>
                  <property value="1" key="labeling/shapeBorderWidthUnits"/>
                  <property value="false" key="labeling/shapeDraw"/>
                  <property value="255" key="labeling/shapeFillColorA"/>
                  <property value="255" key="labeling/shapeFillColorB"/>
                  <property value="255" key="labeling/shapeFillColorG"/>
                  <property value="255" key="labeling/shapeFillColorR"/>
                  <property value="64" key="labeling/shapeJoinStyle"/>
                  <property value="0" key="labeling/shapeOffsetMapUnitMaxScale"/>
                  <property value="0" key="labeling/shapeOffsetMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/shapeOffsetMapUnitScale"/>
                  <property value="1" key="labeling/shapeOffsetUnits"/>
                  <property value="0" key="labeling/shapeOffsetX"/>
                  <property value="0" key="labeling/shapeOffsetY"/>
                  <property value="0" key="labeling/shapeRadiiMapUnitMaxScale"/>
                  <property value="0" key="labeling/shapeRadiiMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/shapeRadiiMapUnitScale"/>
                  <property value="1" key="labeling/shapeRadiiUnits"/>
                  <property value="0" key="labeling/shapeRadiiX"/>
                  <property value="0" key="labeling/shapeRadiiY"/>
                  <property value="0" key="labeling/shapeRotation"/>
                  <property value="0" key="labeling/shapeRotationType"/>
                  <property value="" key="labeling/shapeSVGFile"/>
                  <property value="0" key="labeling/shapeSizeMapUnitMaxScale"/>
                  <property value="0" key="labeling/shapeSizeMapUnitMinScale"/>
                  <property value="0,0,0,0,0,0" key="labeling/shapeSizeMapUnitScale"/>
                  <property value="0" key="labeling/shapeSizeType"/>
                  <property value="1" key="labeling/shapeSizeUnits"/>
                  <property value="0" key="labeling/shapeSizeX"/>
                  <property value="0" key="labeling/shapeSizeY"/>
                  <property value="0" key="labeling/shapeTransparency"/>
                  <property value="0" key="labeling/shapeType"/>
                  <property value="255" key="labeling/textColorA"/>
                  <property value="0" key="labeling/textColorB"/>
                  <property value="0" key="labeling/textColorG"/>
                  <property value="0" key="labeling/textColorR"/>
                  <property value="0" key="labeling/textTransp"/>
                  <property value="0" key="labeling/upsidedownLabels"/>
                  <property value="" key="labeling/wrapChar"/>
                  <property value="0" key="labeling/xOffset"/>
                  <property value="0" key="labeling/yOffset"/>
                  <property value="0" key="labeling/zIndex"/>
                  <property value="_fields_" key="variableNames"/>
                  <property value="" key="variableValues"/>
                </customproperties>
                <blendMode>0</blendMode>
                <featureBlendMode>0</featureBlendMode>
                <layerTransparency>0</layerTransparency>
                <displayfield>name</displayfield>
                <label>0</label>
                <labelattributes>
                  <label text="Étiquette" fieldname=""/>
                  <family fieldname="" name="Ubuntu"/>
                  <size units="pt" fieldname="" value="12"/>
                  <bold fieldname="" on="0"/>
                  <italic fieldname="" on="0"/>
                  <underline fieldname="" on="0"/>
                  <strikeout fieldname="" on="0"/>
                  <color red="0" fieldname="" blue="0" green="0"/>
                  <x fieldname=""/>
                  <y fieldname=""/>
                  <offset units="pt" x="0" y="0" xfieldname="" yfieldname=""/>
                  <angle auto="0" fieldname="" value="0"/>
                  <alignment fieldname="" value="center"/>
                  <buffercolor red="255" fieldname="" blue="255" green="255"/>
                  <buffersize units="pt" fieldname="" value="1"/>
                  <bufferenabled fieldname="" on=""/>
                  <multilineenabled fieldname="" on=""/>
                  <selectedonly on=""/>
                </labelattributes>
                <SingleCategoryDiagramRenderer diagramType="Pie">
                  <DiagramCategory minimumSize="0" backgroundColor="#ffffff" penAlpha="255" backgroundAlpha="255" angleOffset="1440" penWidth="0" transparency="0" labelPlacementMethod="XHeight" penColor="#000000" barWidth="5" sizeType="MM" enabled="0" scaleDependency="Area" height="15" scaleBasedVisibility="0" width="15" diagramOrientation="Up" maxScaleDenominator="1e+08" minScaleDenominator="-4.65661e-10">
                    <fontProperties description="Ubuntu,11,-1,5,50,0,0,0,0,0" style=""/>
                    <attribute field="" label="" color="#000000"/>
                  </DiagramCategory>
                </SingleCategoryDiagramRenderer>
                <DiagramLayerSettings placement="2" priority="0" xPosColumn="-1" yPosColumn="-1" zIndex="0" obstacle="0" showAll="1" dist="0" linePlacementFlags="10"/>
                <annotationform>.</annotationform>
                <aliases>
                  <alias index="0" field="OGC_FID" name="Id"/>
                  <alias index="6" field="colour" name="Colour"/>
                  <alias index="4" field="from" name="From"/>
                  <alias index="2" field="name" name="Line"/>
                  <alias index="1" field="osm_id" name="Id OSM"/>
                  <alias index="3" field="ref" name="Ref"/>
                  <alias index="5" field="to" name="To"/>
                </aliases>
                <excludeAttributesWMS>
                  <attribute>osm_id</attribute>
                  <attribute>OGC_FID</attribute>
                  <attribute>wkt</attribute>
                  <attribute>from</attribute>
                  <attribute>to</attribute>
                  <attribute>colour</attribute>
                  <attribute>name</attribute>
                  <attribute>ref</attribute>
                </excludeAttributesWMS>
                <excludeAttributesWFS>
                  <attribute>OGC_FID</attribute>
                  <attribute>wkt</attribute>
                  <attribute>from</attribute>
                  <attribute>html</attribute>
                  <attribute>to</attribute>
                  <attribute>colour</attribute>
                </excludeAttributesWFS>
                <attributeactions/>
                <editform>.</editform>
                <editforminit/>
                <editforminitcodesource>0</editforminitcodesource>
                <editforminitfilepath>.</editforminitfilepath>
                <editforminitcode># -*- coding: utf-8 -*-
    """
    Les formulaires QGIS peuvent avoir une fonction Python qui sera appelée à l\'ouverture du formulaire.

    Utilisez cette fonction pour ajouter plus de fonctionnalités à vos formulaires.

    Entrez le nom de la fonction dans le champ
    "Fonction d\'initialisation Python"
    Voici un exemple à suivre:
    """
    from PyQt4.QtGui import QWidget

    def my_form_open(dialog, layer, feature):
    ⇥geom = feature.geometry()
    ⇥control = dialog.findChild(QWidget, "MyLineEdit")
    </editforminitcode>
                <featformsuppress>0</featformsuppress>
                <editorlayout>generatedlayout</editorlayout>
                <widgets>
                  <widget name="jointure_tram_stop20150328114216806_tram_id_tramway20150328114206278_osm_id">
                    <config/>
                  </widget>
                </widgets>
                <conditionalstyles>
                  <rowstyles/>
                  <fieldstyles/>
                </conditionalstyles>
                <layerGeometryType>1</layerGeometryType>
              </qgis>
            </map-layer-style>
          </map-layer-style-manager>
          <auxiliaryLayer/>
          <flags>
            <Identifiable>1</Identifiable>
            <Removable>1</Removable>
            <Searchable>1</Searchable>
          </flags>
          <renderer-v2 forceraster="0" symbollevels="0" enableorderby="0" type="singleSymbol">
            <symbols>
              <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="line" name="0">
                <layer locked="0" enabled="1" class="SimpleLine" pass="0">
                  <prop v="square" k="capstyle"/>
                  <prop v="5;2" k="customdash"/>
                  <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
                  <prop v="MM" k="customdash_unit"/>
                  <prop v="0" k="draw_inside_polygon"/>
                  <prop v="bevel" k="joinstyle"/>
                  <prop v="0,0,0,255" k="line_color"/>
                  <prop v="solid" k="line_style"/>
                  <prop v="0.7" k="line_width"/>
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
            </symbols>
            <rotation/>
            <sizescale/>
          </renderer-v2>
          <customproperties>
            <property value="_fields_" key="variableNames"/>
            <property value="" key="variableValues"/>
          </customproperties>
          <blendMode>0</blendMode>
          <featureBlendMode>0</featureBlendMode>
          <layerOpacity>1</layerOpacity>
          <SingleCategoryDiagramRenderer diagramType="Pie" attributeLegend="1">
            <DiagramCategory minimumSize="0" sizeScale="3x:0,0,0,0,0,0" backgroundColor="#ffffff" penAlpha="255" backgroundAlpha="255" opacity="1" penWidth="0" labelPlacementMethod="XHeight" lineSizeScale="3x:0,0,0,0,0,0" rotationOffset="270" penColor="#000000" barWidth="5" sizeType="MM" enabled="0" lineSizeType="MM" scaleDependency="Area" height="15" scaleBasedVisibility="0" width="15" diagramOrientation="Up" maxScaleDenominator="1e+8" minScaleDenominator="-4.65661e-10">
              <fontProperties description="Ubuntu,11,-1,5,50,0,0,0,0,0" style=""/>
              <attribute field="" label="" color="#000000"/>
            </DiagramCategory>
          </SingleCategoryDiagramRenderer>
          <DiagramLayerSettings placement="2" priority="0" zIndex="0" obstacle="0" showAll="1" dist="0" linePlacementFlags="10">
            <properties>
              <Option type="Map">
                <Option value="" type="QString" name="name"/>
                <Option type="Map" name="properties">
                  <Option type="Map" name="show">
                    <Option value="true" type="bool" name="active"/>
                    <Option value="OGC_FID" type="QString" name="field"/>
                    <Option value="2" type="int" name="type"/>
                  </Option>
                </Option>
                <Option value="collection" type="QString" name="type"/>
              </Option>
            </properties>
          </DiagramLayerSettings>
          <geometryOptions geometryPrecision="0" removeDuplicateNodes="0">
            <activeChecks/>
            <checkConfiguration/>
          </geometryOptions>
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
            <field name="ref">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="IsMultiline"/>
                    <Option value="0" type="QString" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
            <field name="from">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="IsMultiline"/>
                    <Option value="0" type="QString" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
            <field name="to">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="IsMultiline"/>
                    <Option value="0" type="QString" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
            <field name="colour">
              <editWidget type="TextEdit">
                <config>
                  <Option type="Map">
                    <Option value="0" type="QString" name="IsMultiline"/>
                    <Option value="0" type="QString" name="UseHtml"/>
                  </Option>
                </config>
              </editWidget>
            </field>
            <field name="html">
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
          <aliases>
            <alias index="0" field="OGC_FID" name="Id"/>
            <alias index="1" field="osm_id" name="Id OSM"/>
            <alias index="2" field="name" name="Line"/>
            <alias index="3" field="ref" name="Ref"/>
            <alias index="4" field="from" name="From"/>
            <alias index="5" field="to" name="To"/>
            <alias index="6" field="colour" name="Colour"/>
            <alias index="7" field="html" name=""/>
            <alias index="8" field="wkt" name=""/>
          </aliases>
          <excludeAttributesWMS>
            <attribute>wkt</attribute>
            <attribute>from</attribute>
            <attribute>OGC_FID</attribute>
            <attribute>colour</attribute>
            <attribute>osm_id</attribute>
            <attribute>to</attribute>
            <attribute>ref</attribute>
            <attribute>name</attribute>
          </excludeAttributesWMS>
          <excludeAttributesWFS>
            <attribute>wkt</attribute>
            <attribute>html</attribute>
            <attribute>OGC_FID</attribute>
            <attribute>colour</attribute>
          </excludeAttributesWFS>
          <defaults>
            <default applyOnUpdate="0" field="OGC_FID" expression=""/>
            <default applyOnUpdate="0" field="osm_id" expression=""/>
            <default applyOnUpdate="0" field="name" expression=""/>
            <default applyOnUpdate="0" field="ref" expression=""/>
            <default applyOnUpdate="0" field="from" expression=""/>
            <default applyOnUpdate="0" field="to" expression=""/>
            <default applyOnUpdate="0" field="colour" expression=""/>
            <default applyOnUpdate="0" field="html" expression=""/>
            <default applyOnUpdate="0" field="wkt" expression=""/>
          </defaults>
          <constraints>
            <constraint field="OGC_FID" notnull_strength="1" constraints="3" unique_strength="1" exp_strength="0"/>
            <constraint field="osm_id" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
            <constraint field="name" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
            <constraint field="ref" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
            <constraint field="from" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
            <constraint field="to" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
            <constraint field="colour" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
            <constraint field="html" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
            <constraint field="wkt" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
          </constraints>
          <constraintExpressions>
            <constraint field="OGC_FID" exp="" desc=""/>
            <constraint field="osm_id" exp="" desc=""/>
            <constraint field="name" exp="" desc=""/>
            <constraint field="ref" exp="" desc=""/>
            <constraint field="from" exp="" desc=""/>
            <constraint field="to" exp="" desc=""/>
            <constraint field="colour" exp="" desc=""/>
            <constraint field="html" exp="" desc=""/>
            <constraint field="wkt" exp="" desc=""/>
          </constraintExpressions>
          <expressionfields/>
          <attributeactions/>
          <attributetableconfig sortOrder="0" actionWidgetStyle="dropDown" sortExpression="">
            <columns/>
          </attributetableconfig>
          <conditionalstyles>
            <rowstyles/>
            <fieldstyles/>
          </conditionalstyles>
          <storedexpressions/>
          <editform tolerant="1">.</editform>
          <editforminit/>
          <editforminitcodesource>0</editforminitcodesource>
          <editforminitfilepath>.</editforminitfilepath>
          <editforminitcode><![CDATA[# -*- coding: utf-8 -*-
    """
    Les formulaires QGIS peuvent avoir une fonction Python qui sera appelée à l\'ouverture du formulaire.

    Utilisez cette fonction pour ajouter plus de fonctionnalités à vos formulaires.

    Entrez le nom de la fonction dans le champ
    "Fonction d\'initialisation Python"
    Voici un exemple à suivre:
    """
    from PyQt4.QtGui import QWidget

    def my_form_open(dialog, layer, feature):
    ⇥geom = feature.geometry()
    ⇥control = dialog.findChild(QWidget, "MyLineEdit")
    ]]></editforminitcode>
          <featformsuppress>0</featformsuppress>
          <editorlayout>generatedlayout</editorlayout>
          <editable/>
          <labelOnTop/>
          <widgets>
            <widget name="jointure_tram_stop20150328114216806_tram_id_tramway20150328114206278_osm_id">
              <config/>
            </widget>
          </widgets>
          <previewExpression>COALESCE("name", \'&lt;NULL>\')</previewExpression>
          <mapTip></mapTip>
        </maplayer>
        ';

        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);
        $this->assertFalse($layer->embedded);
        $this->assertInstanceOf(Qgis\Layer\VectorLayer::class, $layer);

        $data = array(
            'id' => 'tramway20150328114206278',
            'embedded' => false,
            'type' => 'vector',
            'layername' => 'tramway',
            // 'srs',
            'datasource' => 'dbname=\'./edition/transport.sqlite\' table="tramway" (geometry) sql=',
            'provider' => 'spatialite',
            'shortname' => null,
            'title' => 'Tram lines',
            'abstract' => null,
            'keywordList' => array(''),
            'previewExpression' => 'COALESCE("name", \'<NULL>\')',
            'layerOpacity' => 1,
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $layer->{$prop}, $prop);
        }

        $this->assertNotNull($layer->srs);
        $data = array(
            'proj4' => '+proj=longlat +datum=WGS84 +no_defs',
            'srid' => 4326,
            'authid' => 'EPSG:4326',
            'description' => 'WGS 84',
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $layer->srs->{$prop}, $prop);
        }

        $this->assertNotNull($layer->styleManager);
        $data = array(
            'current' => 'black',
            'styles' => array('black', 'colored'),
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $layer->styleManager->{$prop}, $prop);
        }

        $this->assertNotNull($layer->fieldConfiguration);
        $this->assertCount(9, $layer->fieldConfiguration);

        $this->assertNotNull($layer->aliases);
        $this->assertCount(9, $layer->aliases);

        $this->assertNotNull($layer->defaults);
        $this->assertCount(9, $layer->defaults);

        $this->assertNotNull($layer->constraints);
        $this->assertCount(9, $layer->constraints);

        $this->assertNotNull($layer->constraintExpressions);
        $this->assertCount(9, $layer->constraintExpressions);

        $this->assertNotNull($layer->excludeAttributesWFS);
        $this->assertCount(4, $layer->excludeAttributesWFS);

        $this->assertNotNull($layer->excludeAttributesWMS);
        $this->assertCount(8, $layer->excludeAttributesWMS);

        $this->assertNotNull($layer->attributetableconfig);
        $this->assertCount(0, $layer->attributetableconfig->columns);

        $this->assertNotNull($layer->vectorjoins);
        $this->assertCount(0, $layer->vectorjoins);

        $this->assertNotNull($layer->editable);
        $this->assertCount(0, $layer->editable);

        $this->assertNotNull($layer->rendererV2);
        $this->assertEquals($layer->rendererV2->type, 'singleSymbol');

        $keyData = $layer->toKeyArray();
        $this->assertTrue(is_array($keyData));
        $data = array(
            'type' => 'vector',
            'id' => 'tramway20150328114206278',
            'name' => 'tramway',
            'shortname' => '',
            'title' => 'Tram lines',
            'abstract' => '',
            'proj4' => '+proj=longlat +datum=WGS84 +no_defs',
            'srid' => 4326,
            'authid' => 'EPSG:4326',
            'datasource' => 'dbname=\'./edition/transport.sqlite\' table="tramway" (geometry) sql=',
            'provider' => 'spatialite',
            'keywords' => array(''),
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $keyData[$prop], $prop);
        }

        $formControls = $layer->getFormControls();
        $this->assertNotNull($formControls);
        $this->assertCount(9, $formControls);

        // attributeEditorForm
        $xmlStr = '
        <maplayer geometry="Polygon" refreshOnNotifyMessage="" simplifyDrawingTol="1" simplifyAlgorithm="0" type="vector" simplifyDrawingHints="1" minScale="100000000" styleCategories="AllStyleCategories" readOnly="0" refreshOnNotifyEnabled="0" wkbType="Polygon" autoRefreshMode="Disabled" labelsEnabled="0" hasScaleBasedVisibilityFlag="0" autoRefreshTime="0" symbologyReferenceScale="-1" legendPlaceholderImage="" simplifyMaxScale="1" maxScale="0" simplifyLocal="0">
        <extent>
          <xmin>4.58213930607160602</xmin>
          <ymin>43.35054476032322412</ymin>
          <xmax>4.64863080116274929</xmax>
          <ymax>43.45587426605017356</ymax>
        </extent>
        <wgs84extent>
          <xmin>4.58213930607160602</xmin>
          <ymin>43.35054476032322412</ymin>
          <xmax>4.64863080116274929</xmax>
          <ymax>43.45587426605017356</ymax>
        </wgs84extent>
        <id>natural_areas_5f5587de_ddf8_4740_a724_00bcdf518813</id>
        <datasource>service="lizmapdb" key="id" estimatedmetadata=true srid=4326 type=Polygon checkPrimaryKeyUnicity="1" table="tests_projects"."natural_areas" (geom)</datasource>
        <shortname>natural_areas</shortname>
        <title>Natural areas</title>
        <keywordList>
          <value></value>
        </keywordList>
        <layername>natural_areas</layername>
        <srs>
          <spatialrefsys nativeFormat="Wkt">
            <wkt>GEOGCRS["WGS 84",ENSEMBLE["World Geodetic System 1984 ensemble",MEMBER["World Geodetic System 1984 (Transit)"],MEMBER["World Geodetic System 1984 (G730)"],MEMBER["World Geodetic System 1984 (G873)"],MEMBER["World Geodetic System 1984 (G1150)"],MEMBER["World Geodetic System 1984 (G1674)"],MEMBER["World Geodetic System 1984 (G1762)"],MEMBER["World Geodetic System 1984 (G2139)"],MEMBER["World Geodetic System 1984 (G2296)"],ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]],ENSEMBLEACCURACY[2.0]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["geodetic latitude (Lat)",north,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["geodetic longitude (Lon)",east,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],USAGE[SCOPE["Horizontal component of 3D system."],AREA["World."],BBOX[-90,-180,90,180]],ID["EPSG",4326]]</wkt>
            <proj4>+proj=longlat +datum=WGS84 +no_defs</proj4>
            <srsid>3452</srsid>
            <srid>4326</srid>
            <authid>EPSG:4326</authid>
            <description>WGS 84</description>
            <projectionacronym>longlat</projectionacronym>
            <ellipsoidacronym>EPSG:7030</ellipsoidacronym>
            <geographicflag>true</geographicflag>
          </spatialrefsys>
        </srs>
        <resourceMetadata>
          <identifier></identifier>
          <parentidentifier></parentidentifier>
          <language></language>
          <type>dataset</type>
          <title></title>
          <abstract></abstract>
          <contact>
            <name></name>
            <organization></organization>
            <position></position>
            <voice></voice>
            <fax></fax>
            <email></email>
            <role></role>
          </contact>
          <links/>
          <dates/>
          <fees></fees>
          <encoding></encoding>
          <crs>
            <spatialrefsys nativeFormat="Wkt">
              <wkt>GEOGCRS["WGS 84",ENSEMBLE["World Geodetic System 1984 ensemble",MEMBER["World Geodetic System 1984 (Transit)"],MEMBER["World Geodetic System 1984 (G730)"],MEMBER["World Geodetic System 1984 (G873)"],MEMBER["World Geodetic System 1984 (G1150)"],MEMBER["World Geodetic System 1984 (G1674)"],MEMBER["World Geodetic System 1984 (G1762)"],MEMBER["World Geodetic System 1984 (G2139)"],MEMBER["World Geodetic System 1984 (G2296)"],ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]],ENSEMBLEACCURACY[2.0]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["geodetic latitude (Lat)",north,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["geodetic longitude (Lon)",east,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],USAGE[SCOPE["Horizontal component of 3D system."],AREA["World."],BBOX[-90,-180,90,180]],ID["EPSG",4326]]</wkt>
              <proj4>+proj=longlat +datum=WGS84 +no_defs</proj4>
              <srsid>3452</srsid>
              <srid>4326</srid>
              <authid>EPSG:4326</authid>
              <description>WGS 84</description>
              <projectionacronym>longlat</projectionacronym>
              <ellipsoidacronym>EPSG:7030</ellipsoidacronym>
              <geographicflag>true</geographicflag>
            </spatialrefsys>
          </crs>
          <extent>
            <spatial dimensions="2" maxy="0" maxx="0" crs="EPSG:4326" minx="0" miny="0" minz="0" maxz="0"/>
            <temporal>
              <period>
                <start></start>
                <end></end>
              </period>
            </temporal>
          </extent>
        </resourceMetadata>
        <provider encoding="">postgres</provider>
        <vectorjoins/>
        <layerDependencies/>
        <dataDependencies/>
        <expressionfields/>
        <map-layer-style-manager current="default">
          <map-layer-style name="default"/>
        </map-layer-style-manager>
        <auxiliaryLayer/>
        <metadataUrls/>
        <flags>
          <Identifiable>1</Identifiable>
          <Removable>1</Removable>
          <Searchable>1</Searchable>
          <Private>0</Private>
        </flags>
        <temporal mode="0" durationUnit="min" fixedDuration="0" durationField="" limitMode="0" endField="" endExpression="" startField="" startExpression="" accumulate="0" enabled="0">
          <fixedRange>
            <start></start>
            <end></end>
          </fixedRange>
        </temporal>
        <elevation binding="Centroid" zscale="1" type="IndividualFeatures" zoffset="0" extrusionEnabled="0" extrusion="0" symbology="Line" clamping="Terrain" respectLayerSymbol="1" showMarkerSymbolInSurfacePlots="0">
          <data-defined-properties>
            <Option type="Map">
              <Option value="" type="QString" name="name"/>
              <Option name="properties"/>
              <Option value="collection" type="QString" name="type"/>
            </Option>
          </data-defined-properties>
          <profileLineSymbol>
            <symbol clip_to_extent="1" is_animated="0" type="line" alpha="1" name="" force_rhr="0" frame_rate="10">
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
              <layer pass="0" class="SimpleLine" id="{44cad848-0ddb-47d4-b55d-29c18d0638c7}" enabled="1" locked="0">
                <Option type="Map">
                  <Option value="0" type="QString" name="align_dash_pattern"/>
                  <Option value="square" type="QString" name="capstyle"/>
                  <Option value="5;2" type="QString" name="customdash"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="customdash_map_unit_scale"/>
                  <Option value="MM" type="QString" name="customdash_unit"/>
                  <Option value="0" type="QString" name="dash_pattern_offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="dash_pattern_offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="dash_pattern_offset_unit"/>
                  <Option value="0" type="QString" name="draw_inside_polygon"/>
                  <Option value="bevel" type="QString" name="joinstyle"/>
                  <Option value="229,182,54,255,rgb:0.89803921568627454,0.71372549019607845,0.21176470588235294,1" type="QString" name="line_color"/>
                  <Option value="solid" type="QString" name="line_style"/>
                  <Option value="0.6" type="QString" name="line_width"/>
                  <Option value="MM" type="QString" name="line_width_unit"/>
                  <Option value="0" type="QString" name="offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="offset_unit"/>
                  <Option value="0" type="QString" name="ring_filter"/>
                  <Option value="0" type="QString" name="trim_distance_end"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="trim_distance_end_map_unit_scale"/>
                  <Option value="MM" type="QString" name="trim_distance_end_unit"/>
                  <Option value="0" type="QString" name="trim_distance_start"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="trim_distance_start_map_unit_scale"/>
                  <Option value="MM" type="QString" name="trim_distance_start_unit"/>
                  <Option value="0" type="QString" name="tweak_dash_pattern_on_corners"/>
                  <Option value="0" type="QString" name="use_custom_dash"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="width_map_unit_scale"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
          </profileLineSymbol>
          <profileFillSymbol>
            <symbol clip_to_extent="1" is_animated="0" type="fill" alpha="1" name="" force_rhr="0" frame_rate="10">
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
              <layer pass="0" class="SimpleFill" id="{095c8f8e-00eb-4109-a8f8-aa1cb8cb3c71}" enabled="1" locked="0">
                <Option type="Map">
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="border_width_map_unit_scale"/>
                  <Option value="229,182,54,255,rgb:0.89803921568627454,0.71372549019607845,0.21176470588235294,1" type="QString" name="color"/>
                  <Option value="bevel" type="QString" name="joinstyle"/>
                  <Option value="0,0" type="QString" name="offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="offset_unit"/>
                  <Option value="164,130,39,255,rgb:0.64313725490196083,0.50980392156862742,0.15294117647058825,1" type="QString" name="outline_color"/>
                  <Option value="solid" type="QString" name="outline_style"/>
                  <Option value="0.2" type="QString" name="outline_width"/>
                  <Option value="MM" type="QString" name="outline_width_unit"/>
                  <Option value="solid" type="QString" name="style"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
          </profileFillSymbol>
          <profileMarkerSymbol>
            <symbol clip_to_extent="1" is_animated="0" type="marker" alpha="1" name="" force_rhr="0" frame_rate="10">
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
              <layer pass="0" class="SimpleMarker" id="{65b37710-c39f-45f6-87e0-0f3266aeb832}" enabled="1" locked="0">
                <Option type="Map">
                  <Option value="0" type="QString" name="angle"/>
                  <Option value="square" type="QString" name="cap_style"/>
                  <Option value="229,182,54,255,rgb:0.89803921568627454,0.71372549019607845,0.21176470588235294,1" type="QString" name="color"/>
                  <Option value="1" type="QString" name="horizontal_anchor_point"/>
                  <Option value="bevel" type="QString" name="joinstyle"/>
                  <Option value="diamond" type="QString" name="name"/>
                  <Option value="0,0" type="QString" name="offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="offset_unit"/>
                  <Option value="164,130,39,255,rgb:0.64313725490196083,0.50980392156862742,0.15294117647058825,1" type="QString" name="outline_color"/>
                  <Option value="solid" type="QString" name="outline_style"/>
                  <Option value="0.2" type="QString" name="outline_width"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="outline_width_map_unit_scale"/>
                  <Option value="MM" type="QString" name="outline_width_unit"/>
                  <Option value="diameter" type="QString" name="scale_method"/>
                  <Option value="3" type="QString" name="size"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="size_map_unit_scale"/>
                  <Option value="MM" type="QString" name="size_unit"/>
                  <Option value="1" type="QString" name="vertical_anchor_point"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
          </profileMarkerSymbol>
        </elevation>
        <renderer-v2 forceraster="0" symbollevels="0" type="categorizedSymbol" referencescale="-1" enableorderby="0" attr="id">
          <categories>
            <category label="1" value="1" type="long" symbol="0" uuid="0" render="true"/>
            <category label="2" value="2" type="long" symbol="1" uuid="1" render="true"/>
            <category label="3" value="3" type="long" symbol="2" uuid="2" render="true"/>
            <category label="" value="" type="string" symbol="3" uuid="3" render="true"/>
          </categories>
          <symbols>
            <symbol clip_to_extent="1" is_animated="0" type="fill" alpha="1" name="0" force_rhr="0" frame_rate="10">
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
              <layer pass="0" class="SimpleFill" id="{93209251-2141-495b-a7cb-8ae01aaa9ca1}" enabled="1" locked="0">
                <Option type="Map">
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="border_width_map_unit_scale"/>
                  <Option value="46,220,83,255,rgb:0.1803921568627451,0.86274509803921573,0.32549019607843138,1" type="QString" name="color"/>
                  <Option value="bevel" type="QString" name="joinstyle"/>
                  <Option value="0,0" type="QString" name="offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="offset_unit"/>
                  <Option value="35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1" type="QString" name="outline_color"/>
                  <Option value="solid" type="QString" name="outline_style"/>
                  <Option value="0.26" type="QString" name="outline_width"/>
                  <Option value="MM" type="QString" name="outline_width_unit"/>
                  <Option value="solid" type="QString" name="style"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
            <symbol clip_to_extent="1" is_animated="0" type="fill" alpha="1" name="1" force_rhr="0" frame_rate="10">
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
              <layer pass="0" class="SimpleFill" id="{7ac1311a-d402-47f1-9188-7fd068561f19}" enabled="1" locked="0">
                <Option type="Map">
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="border_width_map_unit_scale"/>
                  <Option value="236,177,28,255,rgb:0.92549019607843142,0.69411764705882351,0.10980392156862745,1" type="QString" name="color"/>
                  <Option value="bevel" type="QString" name="joinstyle"/>
                  <Option value="0,0" type="QString" name="offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="offset_unit"/>
                  <Option value="35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1" type="QString" name="outline_color"/>
                  <Option value="solid" type="QString" name="outline_style"/>
                  <Option value="0.26" type="QString" name="outline_width"/>
                  <Option value="MM" type="QString" name="outline_width_unit"/>
                  <Option value="solid" type="QString" name="style"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
            <symbol clip_to_extent="1" is_animated="0" type="fill" alpha="1" name="2" force_rhr="0" frame_rate="10">
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
              <layer pass="0" class="SimpleFill" id="{62ed713c-be81-451f-b82b-d34d99e47931}" enabled="1" locked="0">
                <Option type="Map">
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="border_width_map_unit_scale"/>
                  <Option value="127,151,211,255,rgb:0.49803921568627452,0.59215686274509804,0.82745098039215681,1" type="QString" name="color"/>
                  <Option value="bevel" type="QString" name="joinstyle"/>
                  <Option value="0,0" type="QString" name="offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="offset_unit"/>
                  <Option value="35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1" type="QString" name="outline_color"/>
                  <Option value="solid" type="QString" name="outline_style"/>
                  <Option value="0.26" type="QString" name="outline_width"/>
                  <Option value="MM" type="QString" name="outline_width_unit"/>
                  <Option value="solid" type="QString" name="style"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
            <symbol clip_to_extent="1" is_animated="0" type="fill" alpha="1" name="3" force_rhr="0" frame_rate="10">
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
              <layer pass="0" class="SimpleFill" id="{94f65594-73c0-428a-b85f-8aaa9bb16a98}" enabled="1" locked="0">
                <Option type="Map">
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="border_width_map_unit_scale"/>
                  <Option value="200,77,173,255,rgb:0.78431372549019607,0.30196078431372547,0.67843137254901964,1" type="QString" name="color"/>
                  <Option value="bevel" type="QString" name="joinstyle"/>
                  <Option value="0,0" type="QString" name="offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="offset_unit"/>
                  <Option value="35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1" type="QString" name="outline_color"/>
                  <Option value="solid" type="QString" name="outline_style"/>
                  <Option value="0.26" type="QString" name="outline_width"/>
                  <Option value="MM" type="QString" name="outline_width_unit"/>
                  <Option value="solid" type="QString" name="style"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
          </symbols>
          <source-symbol>
            <symbol clip_to_extent="1" is_animated="0" type="fill" alpha="1" name="0" force_rhr="0" frame_rate="10">
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
              <layer pass="0" class="SimpleFill" id="{b2d80baf-86ea-46f5-bb6a-e7e8411a7067}" enabled="1" locked="0">
                <Option type="Map">
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="border_width_map_unit_scale"/>
                  <Option value="196,60,57,255,rgb:0.7686274509803922,0.23529411764705882,0.22352941176470589,1" type="QString" name="color"/>
                  <Option value="bevel" type="QString" name="joinstyle"/>
                  <Option value="0,0" type="QString" name="offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="offset_unit"/>
                  <Option value="35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1" type="QString" name="outline_color"/>
                  <Option value="solid" type="QString" name="outline_style"/>
                  <Option value="0.26" type="QString" name="outline_width"/>
                  <Option value="MM" type="QString" name="outline_width_unit"/>
                  <Option value="solid" type="QString" name="style"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
          </source-symbol>
          <rotation/>
          <sizescale/>
          <data-defined-properties>
            <Option type="Map">
              <Option value="" type="QString" name="name"/>
              <Option name="properties"/>
              <Option value="collection" type="QString" name="type"/>
            </Option>
          </data-defined-properties>
        </renderer-v2>
        <selection mode="Default">
          <selectionColor invalid="1"/>
          <selectionSymbol>
            <symbol clip_to_extent="1" is_animated="0" type="fill" alpha="1" name="" force_rhr="0" frame_rate="10">
              <data_defined_properties>
                <Option type="Map">
                  <Option value="" type="QString" name="name"/>
                  <Option name="properties"/>
                  <Option value="collection" type="QString" name="type"/>
                </Option>
              </data_defined_properties>
              <layer pass="0" class="SimpleFill" id="{bef8bdc5-5090-4f6d-9190-45967dfe302d}" enabled="1" locked="0">
                <Option type="Map">
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="border_width_map_unit_scale"/>
                  <Option value="0,0,255,255,rgb:0,0,1,1" type="QString" name="color"/>
                  <Option value="bevel" type="QString" name="joinstyle"/>
                  <Option value="0,0" type="QString" name="offset"/>
                  <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                  <Option value="MM" type="QString" name="offset_unit"/>
                  <Option value="35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1" type="QString" name="outline_color"/>
                  <Option value="solid" type="QString" name="outline_style"/>
                  <Option value="0.26" type="QString" name="outline_width"/>
                  <Option value="MM" type="QString" name="outline_width_unit"/>
                  <Option value="solid" type="QString" name="style"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
          </selectionSymbol>
        </selection>
        <customproperties>
          <Option type="Map">
            <Option type="List" name="dualview/previewExpressions">
              <Option value="natural_area_name" type="QString"/>
              <Option value="&quot;natural_area_name&quot;" type="QString"/>
            </Option>
            <Option value="0" type="int" name="embeddedWidgets/count"/>
            <Option type="invalid" name="variableNames"/>
            <Option type="invalid" name="variableValues"/>
          </Option>
        </customproperties>
        <blendMode>0</blendMode>
        <featureBlendMode>0</featureBlendMode>
        <layerOpacity>1</layerOpacity>
        <LinearlyInterpolatedDiagramRenderer attributeLegend="1" lowerHeight="0" upperHeight="5" upperWidth="5" diagramType="Histogram" lowerWidth="0" classificationAttributeExpression="" lowerValue="0" upperValue="0">
          <DiagramCategory scaleBasedVisibility="0" backgroundAlpha="255" showAxis="1" diagramOrientation="Up" stackedDiagramMode="Horizontal" spacing="5" labelPlacementMethod="XHeight" lineSizeScale="3x:0,0,0,0,0,0" scaleDependency="Area" spacingUnit="MM" width="15" direction="0" barWidth="5" stackedDiagramSpacingUnitScale="3x:0,0,0,0,0,0" penAlpha="255" penColor="#000000" stackedDiagramSpacing="0" penWidth="0" sizeType="MM" rotationOffset="270" minScaleDenominator="0" opacity="1" sizeScale="3x:0,0,0,0,0,0" spacingUnitScale="3x:0,0,0,0,0,0" enabled="0" stackedDiagramSpacingUnit="MM" backgroundColor="#ffffff" height="15" minimumSize="0" maxScaleDenominator="1e+08" lineSizeType="MM">
            <fontProperties description="Sans,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
            <attribute label="" field="" color="#000000" colorOpacity="1"/>
            <axisSymbol>
              <symbol clip_to_extent="1" is_animated="0" type="line" alpha="1" name="" force_rhr="0" frame_rate="10">
                <data_defined_properties>
                  <Option type="Map">
                    <Option value="" type="QString" name="name"/>
                    <Option name="properties"/>
                    <Option value="collection" type="QString" name="type"/>
                  </Option>
                </data_defined_properties>
                <layer pass="0" class="SimpleLine" id="{2d7ebc3f-9658-4828-9d9e-0c5ae8651516}" enabled="1" locked="0">
                  <Option type="Map">
                    <Option value="0" type="QString" name="align_dash_pattern"/>
                    <Option value="square" type="QString" name="capstyle"/>
                    <Option value="5;2" type="QString" name="customdash"/>
                    <Option value="3x:0,0,0,0,0,0" type="QString" name="customdash_map_unit_scale"/>
                    <Option value="MM" type="QString" name="customdash_unit"/>
                    <Option value="0" type="QString" name="dash_pattern_offset"/>
                    <Option value="3x:0,0,0,0,0,0" type="QString" name="dash_pattern_offset_map_unit_scale"/>
                    <Option value="MM" type="QString" name="dash_pattern_offset_unit"/>
                    <Option value="0" type="QString" name="draw_inside_polygon"/>
                    <Option value="bevel" type="QString" name="joinstyle"/>
                    <Option value="35,35,35,255,rgb:0.13725490196078433,0.13725490196078433,0.13725490196078433,1" type="QString" name="line_color"/>
                    <Option value="solid" type="QString" name="line_style"/>
                    <Option value="0.26" type="QString" name="line_width"/>
                    <Option value="MM" type="QString" name="line_width_unit"/>
                    <Option value="0" type="QString" name="offset"/>
                    <Option value="3x:0,0,0,0,0,0" type="QString" name="offset_map_unit_scale"/>
                    <Option value="MM" type="QString" name="offset_unit"/>
                    <Option value="0" type="QString" name="ring_filter"/>
                    <Option value="0" type="QString" name="trim_distance_end"/>
                    <Option value="3x:0,0,0,0,0,0" type="QString" name="trim_distance_end_map_unit_scale"/>
                    <Option value="MM" type="QString" name="trim_distance_end_unit"/>
                    <Option value="0" type="QString" name="trim_distance_start"/>
                    <Option value="3x:0,0,0,0,0,0" type="QString" name="trim_distance_start_map_unit_scale"/>
                    <Option value="MM" type="QString" name="trim_distance_start_unit"/>
                    <Option value="0" type="QString" name="tweak_dash_pattern_on_corners"/>
                    <Option value="0" type="QString" name="use_custom_dash"/>
                    <Option value="3x:0,0,0,0,0,0" type="QString" name="width_map_unit_scale"/>
                  </Option>
                  <data_defined_properties>
                    <Option type="Map">
                      <Option value="" type="QString" name="name"/>
                      <Option name="properties"/>
                      <Option value="collection" type="QString" name="type"/>
                    </Option>
                  </data_defined_properties>
                </layer>
              </symbol>
            </axisSymbol>
          </DiagramCategory>
        </LinearlyInterpolatedDiagramRenderer>
        <DiagramLayerSettings linePlacementFlags="18" priority="0" zIndex="0" showAll="1" placement="1" dist="0" obstacle="0">
          <properties>
            <Option type="Map">
              <Option value="" type="QString" name="name"/>
              <Option name="properties"/>
              <Option value="collection" type="QString" name="type"/>
            </Option>
          </properties>
        </DiagramLayerSettings>
        <geometryOptions removeDuplicateNodes="0" geometryPrecision="0">
          <activeChecks/>
          <checkConfiguration type="Map">
            <Option type="Map" name="QgsGeometryGapCheck">
              <Option value="0" type="double" name="allowedGapsBuffer"/>
              <Option value="false" type="bool" name="allowedGapsEnabled"/>
              <Option type="invalid" name="allowedGapsLayer"/>
            </Option>
          </checkConfiguration>
        </geometryOptions>
        <legend type="default-vector" showLabelLegend="0"/>
        <referencedLayers/>
        <fieldConfiguration>
          <field configurationFlags="NoFlag" name="id">
            <editWidget type="TextEdit">
              <config>
                <Option type="Map">
                  <Option value="false" type="bool" name="IsMultiline"/>
                  <Option value="false" type="bool" name="UseHtml"/>
                </Option>
              </config>
            </editWidget>
          </field>
          <field configurationFlags="NoFlag" name="natural_area_name">
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
        <aliases>
          <alias field="id" index="0" name="id"/>
          <alias field="natural_area_name" index="1" name="Natural area name"/>
        </aliases>
        <splitPolicies>
          <policy field="id" policy="Duplicate"/>
          <policy field="natural_area_name" policy="Duplicate"/>
        </splitPolicies>
        <duplicatePolicies>
          <policy field="id" policy="Duplicate"/>
          <policy field="natural_area_name" policy="Duplicate"/>
        </duplicatePolicies>
        <defaults>
          <default field="id" applyOnUpdate="0" expression=""/>
          <default field="natural_area_name" applyOnUpdate="0" expression=""/>
        </defaults>
        <constraints>
          <constraint field="id" unique_strength="1" notnull_strength="1" exp_strength="0" constraints="3"/>
          <constraint field="natural_area_name" unique_strength="0" notnull_strength="0" exp_strength="0" constraints="0"/>
        </constraints>
        <constraintExpressions>
          <constraint field="id" desc="" exp=""/>
          <constraint field="natural_area_name" desc="" exp=""/>
        </constraintExpressions>
        <expressionfields/>
        <attributeactions>
          <defaultAction value="{00000000-0000-0000-0000-000000000000}" key="Canvas"/>
        </attributeactions>
        <attributetableconfig actionWidgetStyle="dropDown" sortExpression="" sortOrder="0">
          <columns>
            <column hidden="0" width="-1" type="field" name="id"/>
            <column hidden="0" width="-1" type="field" name="natural_area_name"/>
            <column hidden="1" width="-1" type="actions"/>
          </columns>
        </attributetableconfig>
        <conditionalstyles>
          <rowstyles/>
          <fieldstyles/>
        </conditionalstyles>
        <storedexpressions/>
        <editform tolerant="1"></editform>
        <editforminit/>
        <editforminitcodesource>0</editforminitcodesource>
        <editforminitfilepath></editforminitfilepath>
        <editforminitcode><![CDATA[# -*- coding: utf-8 -*-
  """
  QGIS forms can have a Python function that is called when the form is
  opened.

  Use this function to add extra logic to your forms.

  Enter the name of the function in the "Python Init function"
  field.
  An example follows:
  """
  from qgis.PyQt.QtWidgets import QWidget

  def my_form_open(dialog, layer, feature):
      geom = feature.geometry()
      control = dialog.findChild(QWidget, "MyLineEdit")
  ]]></editforminitcode>
        <featformsuppress>0</featformsuppress>
        <editorlayout>tablayout</editorlayout>
        <attributeEditorForm>
          <labelStyle labelColor="" overrideLabelFont="0" overrideLabelColor="0">
            <labelFont description="Sans Serif,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
          </labelStyle>
          <attributeEditorField showLabel="1" horizontalStretch="0" index="0" verticalStretch="0" name="id">
            <labelStyle labelColor="0,0,0,255,rgb:0,0,0,1" overrideLabelFont="0" overrideLabelColor="0">
              <labelFont description="Noto Sans,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
            </labelStyle>
          </attributeEditorField>
          <attributeEditorField showLabel="1" horizontalStretch="0" index="1" verticalStretch="0" name="natural_area_name">
            <labelStyle labelColor="0,0,0,255,rgb:0,0,0,1" overrideLabelFont="0" overrideLabelColor="0">
              <labelFont description="Noto Sans,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
            </labelStyle>
          </attributeEditorField>
          <attributeEditorRelation label="Associated birds" relation="birds_area_natural_area_id_natural_ar_id" showLabel="1" horizontalStretch="0" nmRelationId="birds_area_bird_id_birds_4069_id" verticalStretch="0" forceSuppressFormPopup="0" name="birds_area_natural_area_id_natural_ar_id" relationWidgetTypeId="relation_editor">
            <labelStyle labelColor="0,0,0,255,rgb:0,0,0,1" overrideLabelFont="0" overrideLabelColor="0">
              <labelFont description="Noto Sans,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
            </labelStyle>
            <editor_configuration type="Map">
              <Option value="false" type="bool" name="allow_add_child_feature_with_no_geometry"/>
              <Option value="AllButtons" type="QString" name="buttons"/>
              <Option type="invalid" name="filter_expression"/>
              <Option value="true" type="bool" name="show_first_feature"/>
            </editor_configuration>
          </attributeEditorRelation>
          <attributeEditorRelation label="card" relation="birds_area_natural_area_id_natural_ar_id_1" showLabel="1" horizontalStretch="0" nmRelationId="" verticalStretch="0" forceSuppressFormPopup="0" name="birds_area_natural_area_id_natural_ar_id_1" relationWidgetTypeId="relation_editor">
            <labelStyle labelColor="" overrideLabelFont="0" overrideLabelColor="0">
              <labelFont description="Noto Sans,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
            </labelStyle>
            <editor_configuration type="Map">
              <Option value="false" type="bool" name="allow_add_child_feature_with_no_geometry"/>
              <Option value="AllButtons" type="QString" name="buttons"/>
              <Option type="invalid" name="filter_expression"/>
              <Option value="true" type="bool" name="show_first_feature"/>
            </editor_configuration>
          </attributeEditorRelation>
          <attributeEditorRelation label="spots" relation="birds_spot_area_id_natural_ar_id" showLabel="1" horizontalStretch="0" nmRelationId="" verticalStretch="0" forceSuppressFormPopup="0" name="birds_spot_area_id_natural_ar_id" relationWidgetTypeId="relation_editor">
            <labelStyle labelColor="0,0,0,255,rgb:0,0,0,1" overrideLabelFont="0" overrideLabelColor="0">
              <labelFont description="Noto Sans,9,-1,5,50,0,0,0,0,0" style="" underline="0" bold="0" italic="0" strikethrough="0"/>
            </labelStyle>
            <editor_configuration type="Map">
              <Option value="false" type="bool" name="allow_add_child_feature_with_no_geometry"/>
              <Option value="AllButtons" type="QString" name="buttons"/>
              <Option type="invalid" name="filter_expression"/>
              <Option value="true" type="bool" name="show_first_feature"/>
            </editor_configuration>
          </attributeEditorRelation>
        </attributeEditorForm>
        <editable>
          <field editable="0" name="id"/>
          <field editable="1" name="natural_area_name"/>
        </editable>
        <labelOnTop>
          <field labelOnTop="0" name="id"/>
          <field labelOnTop="0" name="natural_area_name"/>
        </labelOnTop>
        <reuseLastValue>
          <field name="id" reuseLastValue="0"/>
          <field name="natural_area_name" reuseLastValue="0"/>
        </reuseLastValue>
        <dataDefinedFieldProperties/>
        <widgets>
          <widget name="birds_area_natural_area_id_natural_ar_id">
            <config type="Map">
              <Option value="false" type="bool" name="force-suppress-popup"/>
              <Option value="birds_area_bird_id_birds_4069_id" type="QString" name="nm-rel"/>
            </config>
          </widget>
          <widget name="birds_area_natural_area_id_natural_ar_id_1">
            <config type="Map">
              <Option value="false" type="bool" name="force-suppress-popup"/>
              <Option type="invalid" name="nm-rel"/>
            </config>
          </widget>
          <widget name="birds_spot_area_id_natural_ar_id">
            <config type="Map">
              <Option value="false" type="bool" name="force-suppress-popup"/>
              <Option type="invalid" name="nm-rel"/>
            </config>
          </widget>
        </widgets>
        <previewExpression>natural_area_name</previewExpression>
        <mapTip enabled="1"></mapTip>
      </maplayer>
        ';

        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);

        $this->assertInstanceOf(Qgis\Layer\VectorLayer::class, $layer);
        $this->assertCount(3, $layer->attributeEditorRelation);
        $this->assertCount(2, $layer->attributeEditorField);

    }
}
