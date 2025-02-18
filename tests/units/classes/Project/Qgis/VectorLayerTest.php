<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;
use Lizmap\Form;

/**
 * @internal
 * @coversNothing
 */
class VectorLayerTest extends TestCase
{
    public function testGetFormControls(): void
    {
        // VectorLayer
        $xmlStr = '
    <maplayer autoRefreshEnabled="0" readOnly="0" simplifyDrawingHints="0" simplifyMaxScale="1" type="vector" maxScale="0" geometry="Point" simplifyAlgorithm="0" hasScaleBasedVisibilityFlag="0" simplifyLocal="1" wkbType="Point" minScale="1e+8" refreshOnNotifyEnabled="0" autoRefreshTime="0" simplifyDrawingTol="1" styleCategories="AllStyleCategories" labelsEnabled="1" refreshOnNotifyMessage="">
      <extent>
        <xmin>3.84541513302194948</xmin>
        <ymin>43.59438300000000055</ymin>
        <xmax>3.8956343529661015</xmax>
        <ymax>43.64203625857223301</ymax>
      </extent>
      <id>edition_point20130118171631518</id>
      <datasource>dbname=\'./edition/edition_db.sqlite\' table="edition_point" (geometry) sql=</datasource>
      <title>Points of interest</title>
      <keywordList>
        <value></value>
      </keywordList>
      <layername>points of interest</layername>
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
        <extent>
          <spatial miny="0" dimensions="2" maxx="0" minz="0" maxy="0" maxz="0" crs="" minx="0"/>
          <temporal>
            <period>
              <start></start>
              <end></end>
            </period>
          </temporal>
        </extent>
      </resourceMetadata>
      <provider encoding="UTF-8">spatialite</provider>
      <vectorjoins/>
      <layerDependencies/>
      <dataDependencies/>
      <legend type="default-vector"/>
      <expressionfields/>
      <map-layer-style-manager current="default">
        <map-layer-style name="default"/>
      </map-layer-style-manager>
      <auxiliaryLayer/>
      <flags>
        <Identifiable>1</Identifiable>
        <Removable>1</Removable>
        <Searchable>1</Searchable>
      </flags>
      <renderer-v2 attr="type" forceraster="0" symbollevels="0" enableorderby="0" type="categorizedSymbol">
        <categories>
          <category label="café" symbol="0" value="1" render="true"/>
          <category label="pharmacy" symbol="1" value="2" render="true"/>
          <category label="bus stop" symbol="2" value="3" render="true"/>
          <category label="park" symbol="3" value="4" render="true"/>
        </categories>
        <symbols>
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="marker" name="0">
            <layer locked="0" enabled="1" class="SimpleMarker" pass="0">
              <prop v="0" k="angle"/>
              <prop v="255,255,255,255" k="color"/>
              <prop v="1" k="horizontal_anchor_point"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="circle" k="name"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="0,0,0,255" k="outline_color"/>
              <prop v="no" k="outline_style"/>
              <prop v="0" k="outline_width"/>
              <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="area" k="scale_method"/>
              <prop v="7" k="size"/>
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
            <layer locked="0" enabled="1" class="SvgMarker" pass="0">
              <prop v="0" k="angle"/>
              <prop v="255,0,0,255" k="color"/>
              <prop v="0" k="fixedAspectRatio"/>
              <prop v="1" k="horizontal_anchor_point"/>
              <prop v="entertainment/amenity=cafe.svg" k="name"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="0,0,0,255" k="outline_color"/>
              <prop v="0" k="outline_width"/>
              <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="diameter" k="scale_method"/>
              <prop v="6" k="size"/>
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
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="marker" name="1">
            <layer locked="0" enabled="1" class="SimpleMarker" pass="0">
              <prop v="0" k="angle"/>
              <prop v="255,255,255,255" k="color"/>
              <prop v="1" k="horizontal_anchor_point"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="circle" k="name"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="0,0,0,255" k="outline_color"/>
              <prop v="no" k="outline_style"/>
              <prop v="0" k="outline_width"/>
              <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="area" k="scale_method"/>
              <prop v="7" k="size"/>
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
            <layer locked="0" enabled="1" class="SvgMarker" pass="0">
              <prop v="0" k="angle"/>
              <prop v="0,255,127,255" k="color"/>
              <prop v="0" k="fixedAspectRatio"/>
              <prop v="1" k="horizontal_anchor_point"/>
              <prop v="services/amenity=pharmacy,dispensing=yes.svg" k="name"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="0,0,0,255" k="outline_color"/>
              <prop v="0" k="outline_width"/>
              <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="diameter" k="scale_method"/>
              <prop v="6" k="size"/>
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
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="marker" name="2">
            <layer locked="0" enabled="1" class="SimpleMarker" pass="0">
              <prop v="0" k="angle"/>
              <prop v="255,255,255,255" k="color"/>
              <prop v="1" k="horizontal_anchor_point"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="circle" k="name"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="0,0,0,255" k="outline_color"/>
              <prop v="no" k="outline_style"/>
              <prop v="0" k="outline_width"/>
              <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="area" k="scale_method"/>
              <prop v="7" k="size"/>
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
            <layer locked="0" enabled="1" class="SvgMarker" pass="0">
              <prop v="0" k="angle"/>
              <prop v="0,85,255,255" k="color"/>
              <prop v="0" k="fixedAspectRatio"/>
              <prop v="1" k="horizontal_anchor_point"/>
              <prop v="transport/highway=bus_stop.svg" k="name"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="0,0,0,255" k="outline_color"/>
              <prop v="0" k="outline_width"/>
              <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="diameter" k="scale_method"/>
              <prop v="6" k="size"/>
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
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="marker" name="3">
            <layer locked="0" enabled="1" class="SimpleMarker" pass="0">
              <prop v="0" k="angle"/>
              <prop v="255,255,255,255" k="color"/>
              <prop v="1" k="horizontal_anchor_point"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="circle" k="name"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="0,0,0,255" k="outline_color"/>
              <prop v="no" k="outline_style"/>
              <prop v="0" k="outline_width"/>
              <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="area" k="scale_method"/>
              <prop v="7" k="size"/>
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
            <layer locked="0" enabled="1" class="SvgMarker" pass="0">
              <prop v="0" k="angle"/>
              <prop v="0,170,0,255" k="color"/>
              <prop v="0" k="fixedAspectRatio"/>
              <prop v="1" k="horizontal_anchor_point"/>
              <prop v="symbol/landuse_coniferous_and_deciduous.svg" k="name"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="0,0,0,255" k="outline_color"/>
              <prop v="0" k="outline_width"/>
              <prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/>
              <prop v="MM" k="outline_width_unit"/>
              <prop v="diameter" k="scale_method"/>
              <prop v="6" k="size"/>
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
        </symbols>
        <source-symbol>
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="marker" name="0">
            <layer locked="0" enabled="1" class="SimpleMarker" pass="0">
              <prop v="0" k="angle"/>
              <prop v="91,198,110,255" k="color"/>
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
        </source-symbol>
        <colorramp type="random" name="[source]">
          <prop v="10" k="count"/>
          <prop v="359" k="hueMax"/>
          <prop v="0" k="hueMin"/>
          <prop v="random" k="rampType"/>
          <prop v="255" k="satMax"/>
          <prop v="0" k="satMin"/>
          <prop v="255" k="valMax"/>
          <prop v="0" k="valMin"/>
        </colorramp>
        <rotation/>
        <sizescale/>
      </renderer-v2>
      <labeling type="simple">
        <settings calloutType="simple">
          <text-style fontCapitals="0" fontItalic="0" textOpacity="1" fontSizeUnit="Point" fontSize="10" fontKerning="1" isExpression="0" textColor="41,41,124,255" fontWeight="50" previewBkgrdColor="255,255,255,255" blendMode="0" multilineHeight="1" namedStyle="Regular" useSubstitutions="0" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontWordSpacing="0" fieldName="name" fontLetterSpacing="0" fontUnderline="0" fontFamily="Ubuntu" fontStrikeout="0" textOrientation="horizontal">
            <text-buffer bufferSizeUnits="MM" bufferColor="255,255,255,255" bufferSize="0.3" bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="0" bufferDraw="1" bufferBlendMode="0" bufferOpacity="1" bufferJoinStyle="64"/>
            <background shapeType="0" shapeDraw="0" shapeSizeType="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeOffsetUnit="MM" shapeOpacity="1" shapeRotationType="0" shapeSizeY="0" shapeJoinStyle="64" shapeBorderWidth="0" shapeSVGFile="" shapeSizeUnit="MM" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeFillColor="255,255,255,255" shapeBorderWidthUnit="MM" shapeBlendMode="0" shapeRotation="0" shapeRadiiX="0" shapeOffsetY="0" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeBorderColor="128,128,128,255" shapeRadiiY="0" shapeRadiiUnit="MM" shapeSizeX="0" shapeOffsetX="0" shapeSizeMapUnitScale="3x:0,0,0,0,0,0"/>
            <shadow shadowRadiusUnit="MM" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetGlobal="1" shadowDraw="0" shadowOpacity="0.7" shadowColor="0,0,0,255" shadowOffsetAngle="135" shadowRadius="1.5" shadowRadiusAlphaOnly="0" shadowOffsetDist="1" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowUnder="0" shadowScale="100" shadowOffsetUnit="MM" shadowBlendMode="6"/>
            <dd_properties>
              <Option type="Map">
                <Option value="" type="QString" name="name"/>
                <Option name="properties"/>
                <Option value="collection" type="QString" name="type"/>
              </Option>
            </dd_properties>
            <substitutions/>
          </text-style>
          <text-format useMaxLineLengthForAutoWrap="1" decimals="0" wrapChar=" " addDirectionSymbol="0" plussign="0" multilineAlign="0" leftDirectionSymbol="&lt;" reverseDirectionSymbol="0" placeDirectionSymbol="0" autoWrapLength="0" formatNumbers="0" rightDirectionSymbol=">"/>
          <placement offsetType="0" maxCurvedCharAngleIn="20" repeatDistance="0" yOffset="0" quadOffset="4" maxCurvedCharAngleOut="-20" fitInPolygonOnly="0" distMapUnitScale="3x:0,0,0,0,0,0" geometryGenerator="" placement="0" geometryGeneratorType="PointGeometry" centroidWhole="0" offsetUnits="MapUnit" distUnits="MM" geometryGeneratorEnabled="0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" xOffset="0" centroidInside="0" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" overrunDistanceUnit="MM" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR" placementFlags="0" preserveRotation="1" overrunDistance="0" overrunDistanceMapUnitScale="3x:0,0,0,0,0,0" layerType="UnknownGeometry" repeatDistanceUnits="MM" dist="2" rotationAngle="0" priority="5"/>
          <rendering fontLimitPixelSize="0" drawLabels="1" limitNumLabels="0" obstacleFactor="1" scaleVisibility="0" displayAll="0" obstacle="1" obstacleType="0" fontMaxPixelSize="10000" upsidedownLabels="0" scaleMin="1" scaleMax="10000000" minFeatureSize="0" zIndex="0" labelPerPart="0" maxNumLabels="2000" mergeLines="0" fontMinPixelSize="3"/>
          <dd_properties>
            <Option type="Map">
              <Option value="" type="QString" name="name"/>
              <Option name="properties"/>
              <Option value="collection" type="QString" name="type"/>
            </Option>
          </dd_properties>
          <callout type="simple">
            <Option type="Map">
              <Option value="pole_of_inaccessibility" type="QString" name="anchorPoint"/>
              <Option type="Map" name="ddProperties">
                <Option value="" type="QString" name="name"/>
                <Option name="properties"/>
                <Option value="collection" type="QString" name="type"/>
              </Option>
              <Option value="false" type="bool" name="drawToAllParts"/>
              <Option value="0" type="QString" name="enabled"/>
              <Option value="&lt;symbol alpha=&quot;1&quot; force_rhr=&quot;0&quot; clip_to_extent=&quot;1&quot; type=&quot;line&quot; name=&quot;symbol&quot;>&lt;layer locked=&quot;0&quot; enabled=&quot;1&quot; class=&quot;SimpleLine&quot; pass=&quot;0&quot;>&lt;prop v=&quot;square&quot; k=&quot;capstyle&quot;/>&lt;prop v=&quot;5;2&quot; k=&quot;customdash&quot;/>&lt;prop v=&quot;3x:0,0,0,0,0,0&quot; k=&quot;customdash_map_unit_scale&quot;/>&lt;prop v=&quot;MM&quot; k=&quot;customdash_unit&quot;/>&lt;prop v=&quot;0&quot; k=&quot;draw_inside_polygon&quot;/>&lt;prop v=&quot;bevel&quot; k=&quot;joinstyle&quot;/>&lt;prop v=&quot;60,60,60,255&quot; k=&quot;line_color&quot;/>&lt;prop v=&quot;solid&quot; k=&quot;line_style&quot;/>&lt;prop v=&quot;0.3&quot; k=&quot;line_width&quot;/>&lt;prop v=&quot;MM&quot; k=&quot;line_width_unit&quot;/>&lt;prop v=&quot;0&quot; k=&quot;offset&quot;/>&lt;prop v=&quot;3x:0,0,0,0,0,0&quot; k=&quot;offset_map_unit_scale&quot;/>&lt;prop v=&quot;MM&quot; k=&quot;offset_unit&quot;/>&lt;prop v=&quot;0&quot; k=&quot;ring_filter&quot;/>&lt;prop v=&quot;0&quot; k=&quot;use_custom_dash&quot;/>&lt;prop v=&quot;3x:0,0,0,0,0,0&quot; k=&quot;width_map_unit_scale&quot;/>&lt;data_defined_properties>&lt;Option type=&quot;Map&quot;>&lt;Option value=&quot;&quot; type=&quot;QString&quot; name=&quot;name&quot;/>&lt;Option name=&quot;properties&quot;/>&lt;Option value=&quot;collection&quot; type=&quot;QString&quot; name=&quot;type&quot;/>&lt;/Option>&lt;/data_defined_properties>&lt;/layer>&lt;/symbol>" type="QString" name="lineSymbol"/>
              <Option value="0" type="double" name="minLength"/>
              <Option value="3x:0,0,0,0,0,0" type="QString" name="minLengthMapUnitScale"/>
              <Option value="MM" type="QString" name="minLengthUnit"/>
              <Option value="0" type="double" name="offsetFromAnchor"/>
              <Option value="3x:0,0,0,0,0,0" type="QString" name="offsetFromAnchorMapUnitScale"/>
              <Option value="MM" type="QString" name="offsetFromAnchorUnit"/>
              <Option value="0" type="double" name="offsetFromLabel"/>
              <Option value="3x:0,0,0,0,0,0" type="QString" name="offsetFromLabelMapUnitScale"/>
              <Option value="MM" type="QString" name="offsetFromLabelUnit"/>
            </Option>
          </callout>
        </settings>
      </labeling>
      <customproperties>
        <property value="0" key="embeddedWidgets/count"/>
        <property key="variableNames"/>
        <property key="variableValues"/>
      </customproperties>
      <blendMode>0</blendMode>
      <featureBlendMode>0</featureBlendMode>
      <layerOpacity>1</layerOpacity>
      <SingleCategoryDiagramRenderer diagramType="Pie" attributeLegend="1">
        <DiagramCategory minimumSize="0" sizeScale="3x:0,0,0,0,0,0" backgroundColor="#ffffff" penAlpha="255" backgroundAlpha="255" opacity="1" penWidth="0" labelPlacementMethod="XHeight" lineSizeScale="3x:0,0,0,0,0,0" rotationOffset="270" penColor="#000000" barWidth="5" sizeType="MM" enabled="0" lineSizeType="MM" scaleDependency="Area" height="15" scaleBasedVisibility="0" width="15" diagramOrientation="Up" maxScaleDenominator="1e+8" minScaleDenominator="0">
          <fontProperties description="Ubuntu,11,-1,5,50,0,0,0,0,0" style=""/>
          <attribute field="" label="" color="#000000"/>
        </DiagramCategory>
      </SingleCategoryDiagramRenderer>
      <DiagramLayerSettings placement="0" priority="0" zIndex="0" obstacle="0" showAll="1" dist="0" linePlacementFlags="2">
        <properties>
          <Option type="Map">
            <Option value="" type="QString" name="name"/>
            <Option type="Map" name="properties">
              <Option type="Map" name="show">
                <Option value="true" type="bool" name="active"/>
                <Option value="pkuid" type="QString" name="field"/>
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
        <field name="pkuid">
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
        <field name="description">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="1" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        </field>
        <field name="user">
          <editWidget type="Hidden">
            <config>
              <Option/>
            </config>
          </editWidget>
        </field>
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
        <field name="type">
          <editWidget type="Classification">
            <config>
              <Option/>
            </config>
          </editWidget>
        </field>
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
      <aliases>
        <alias index="0" field="pkuid" name=""/>
        <alias index="1" field="name" name=""/>
        <alias index="2" field="description" name=""/>
        <alias index="3" field="user" name=""/>
        <alias index="4" field="date" name=""/>
        <alias index="5" field="type" name=""/>
        <alias index="6" field="photo" name=""/>
      </aliases>
      <excludeAttributesWMS/>
      <excludeAttributesWFS/>
      <defaults>
        <default applyOnUpdate="0" field="pkuid" expression=""/>
        <default applyOnUpdate="0" field="name" expression=""/>
        <default applyOnUpdate="0" field="description" expression=""/>
        <default applyOnUpdate="0" field="user" expression=""/>
        <default applyOnUpdate="0" field="date" expression=""/>
        <default applyOnUpdate="0" field="type" expression=""/>
        <default applyOnUpdate="0" field="photo" expression=""/>
      </defaults>
      <constraints>
        <constraint field="pkuid" notnull_strength="1" constraints="3" unique_strength="1" exp_strength="0"/>
        <constraint field="name" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="description" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="user" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="date" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="type" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="photo" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
      </constraints>
      <constraintExpressions>
        <constraint field="pkuid" exp="" desc=""/>
        <constraint field="name" exp="" desc=""/>
        <constraint field="description" exp="" desc=""/>
        <constraint field="user" exp="" desc=""/>
        <constraint field="date" exp="" desc=""/>
        <constraint field="type" exp="" desc=""/>
        <constraint field="photo" exp="" desc=""/>
      </constraintExpressions>
      <expressionfields/>
      <attributeactions>
        <defaultAction value="{00000000-0000-0000-0000-000000000000}" key="Canvas"/>
      </attributeactions>
      <attributetableconfig sortOrder="0" actionWidgetStyle="dropDown" sortExpression="">
        <columns>
          <column width="-1" hidden="1" type="field" name="user"/>
          <column width="-1" hidden="0" type="field" name="pkuid"/>
          <column width="-1" hidden="0" type="field" name="name"/>
          <column width="-1" hidden="0" type="field" name="description"/>
          <column width="-1" hidden="0" type="field" name="date"/>
          <column width="-1" hidden="0" type="field" name="type"/>
          <column width="-1" hidden="0" type="field" name="photo"/>
          <column width="-1" hidden="1" type="actions"/>
        </columns>
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
      <editorlayout>tablayout</editorlayout>
      <attributeEditorForm>
        <attributeEditorContainer columnCount="0" visibilityExpressionEnabled="0" visibilityExpression="" groupBox="0" showLabel="1" name="Description">
          <attributeEditorContainer columnCount="0" visibilityExpressionEnabled="0" visibilityExpression="" groupBox="1" showLabel="1" name="Generic">
            <attributeEditorField index="0" showLabel="1" name="pkuid"/>
            <attributeEditorField index="1" showLabel="1" name="name"/>
            <attributeEditorField index="2" showLabel="1" name="description"/>
          </attributeEditorContainer>
          <attributeEditorContainer columnCount="0" visibilityExpressionEnabled="0" visibilityExpression="" groupBox="1" showLabel="1" name="Other">
            <attributeEditorField index="4" showLabel="1" name="date"/>
            <attributeEditorField index="5" showLabel="1" name="type"/>
            <attributeEditorField index="3" showLabel="1" name="user"/>
          </attributeEditorContainer>
        </attributeEditorContainer>
        <attributeEditorContainer columnCount="0" visibilityExpressionEnabled="0" visibilityExpression="" groupBox="0" showLabel="1" name="Photo">
          <attributeEditorField index="6" showLabel="1" name="photo"/>
        </attributeEditorContainer>
      </attributeEditorForm>
      <editable>
        <field editable="1" name="date"/>
        <field editable="1" name="description"/>
        <field editable="1" name="name"/>
        <field editable="1" name="photo"/>
        <field editable="1" name="pkuid"/>
        <field editable="1" name="type"/>
        <field editable="1" name="user"/>
      </editable>
      <labelOnTop>
        <field labelOnTop="0" name="date"/>
        <field labelOnTop="0" name="description"/>
        <field labelOnTop="0" name="name"/>
        <field labelOnTop="0" name="photo"/>
        <field labelOnTop="0" name="pkuid"/>
        <field labelOnTop="0" name="type"/>
        <field labelOnTop="0" name="user"/>
      </labelOnTop>
      <widgets/>
      <previewExpression>COALESCE( "name", \'&lt;NULL>\' )</previewExpression>
      <mapTip></mapTip>
    </maplayer>
        ';

        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);
        $this->assertFalse($layer->embedded);
        $this->assertInstanceOf(Qgis\Layer\VectorLayer::class, $layer);

        $this->assertNotNull($layer->constraints);
        $this->assertCount(7, $layer->constraints);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $layer->constraints[0]);
        $this->assertEquals('pkuid', $layer->constraints[0]->field);
        $this->assertEquals(3, $layer->constraints[0]->constraints);
        $this->assertTrue($layer->constraints[0]->notnull_strength);
        $this->assertTrue($layer->constraints[0]->unique_strength);
        $this->assertFalse($layer->constraints[0]->exp_strength);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $layer->constraints[1]);
        $this->assertEquals('name', $layer->constraints[1]->field);
        $this->assertEquals(0, $layer->constraints[1]->constraints);
        $this->assertFalse($layer->constraints[1]->notnull_strength);
        $this->assertFalse($layer->constraints[1]->unique_strength);
        $this->assertFalse($layer->constraints[1]->exp_strength);

        $formControls = $layer->getFormControls();
        $this->assertNotNull($formControls);
        $this->assertCount(7, $formControls);

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['pkuid']);
        $this->assertEquals('pkuid', $formControls['pkuid']->getName());
        $this->assertEquals('TextEdit', $formControls['pkuid']->getFieldEditType());
        $this->assertTrue($formControls['pkuid']->isEditable());
        $this->assertEquals('', $formControls['pkuid']->getFieldAlias());
        $this->assertEquals('input', $formControls['pkuid']->getMarkup());
        $this->assertFalse($formControls['pkuid']->isMultiline());
        $this->assertFalse($formControls['pkuid']->useHtml());

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['name']);
        $this->assertEquals('name', $formControls['name']->getName());
        $this->assertEquals('TextEdit', $formControls['name']->getFieldEditType());
        $this->assertTrue($formControls['name']->isEditable());
        $this->assertEquals('', $formControls['name']->getFieldAlias());
        $this->assertEquals('input', $formControls['name']->getMarkup());
        $this->assertFalse($formControls['name']->isMultiline());
        $this->assertFalse($formControls['name']->useHtml());

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['description']);
        $this->assertEquals('description', $formControls['description']->getName());
        $this->assertEquals('TextEdit', $formControls['description']->getFieldEditType());
        $this->assertTrue($formControls['description']->isEditable());
        $this->assertEquals('', $formControls['description']->getFieldAlias());
        $this->assertEquals('textarea', $formControls['description']->getMarkup());
        $this->assertTrue($formControls['description']->isMultiline());
        $this->assertFalse($formControls['description']->useHtml());

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['date']);
        $this->assertEquals('date', $formControls['date']->getName());
        $this->assertEquals('DateTime', $formControls['date']->getFieldEditType());
        $this->assertTrue($formControls['date']->isEditable());
        $this->assertEquals('', $formControls['date']->getFieldAlias());
        $this->assertEquals('date', $formControls['date']->getMarkup());
        $attributes = array (
            'allow_null' => false,
            'calendar_popup' => false,
            'display_format' => '',
            'field_format' => 'yyyy-MM-dd',
            'field_iso_format' => false,
            'filters' => [],
            'chainFilters' => false,
        );
        $this->assertEquals($attributes, $formControls['date']->getEditAttributes());

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['type']);
        $this->assertEquals('type', $formControls['type']->getName());
        $this->assertEquals('Classification', $formControls['type']->getFieldEditType());
        $this->assertTrue($formControls['type']->isEditable());
        $this->assertEquals('', $formControls['type']->getFieldAlias());
        $this->assertEquals('menulist', $formControls['type']->getMarkup());
        $categories = array(
            1 => 'café',
            2 => 'pharmacy',
            3 => 'bus stop',
            4 => 'park',
        );
        $this->assertEquals($categories, $formControls['type']->getRendererCategories());

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['photo']);
        $this->assertEquals('photo', $formControls['photo']->getName());
        $this->assertEquals('ExternalResource', $formControls['photo']->getFieldEditType());
        $this->assertTrue($formControls['photo']->isEditable());
        $this->assertEquals('', $formControls['photo']->getFieldAlias());
        $this->assertEquals('upload', $formControls['photo']->getMarkup());
        $mimeTypes = array(
            0 => 'image/gif',
            1 => 'image/jpg',
            2 => 'image/jpeg',
            3 => 'image/pjpeg',
            4 => 'image/png',
        );
        $this->assertEquals($mimeTypes, $formControls['photo']->getMimeTypes());
        $this->assertEquals('.gif, .jpeg, .png', $formControls['photo']->getUploadAccept());
        $this->assertEquals('environment', $formControls['photo']->getUploadCapture());
        $this->assertTrue($formControls['photo']->isImageUpload());

        $xmlStr = '
    <maplayer autoRefreshEnabled="0" readOnly="0" simplifyDrawingHints="1" simplifyMaxScale="1" type="vector" maxScale="0" geometry="Polygon" simplifyAlgorithm="0" hasScaleBasedVisibilityFlag="0" simplifyLocal="1" wkbType="Polygon" minScale="1e+8" refreshOnNotifyEnabled="0" autoRefreshTime="0" simplifyDrawingTol="1" styleCategories="AllStyleCategories" labelsEnabled="1" refreshOnNotifyMessage="">
      <extent>
        <xmin>3.86227799999999988</xmin>
        <ymin>43.60601400000000183</ymin>
        <xmax>3.8948940000000003</xmax>
        <ymax>43.64900599999998576</ymax>
      </extent>
      <id>edition_polygon20130409114333776</id>
      <datasource>dbname=\'./edition/edition_db.sqlite\' table="edition_polygon" (geom) sql=</datasource>
      <title>Areas of interest</title>
      <keywordList>
        <value></value>
      </keywordList>
      <layername>areas_of_interest</layername>
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
      <map-layer-style-manager current="default">
        <map-layer-style name="default"/>
      </map-layer-style-manager>
      <auxiliaryLayer/>
      <flags>
        <Identifiable>1</Identifiable>
        <Removable>1</Removable>
        <Searchable>1</Searchable>
      </flags>
      <renderer-v2 attr="checked" forceraster="0" symbollevels="0" enableorderby="0" type="categorizedSymbol">
        <categories>
          <category label="checked" symbol="0" value="0" render="true"/>
          <category label="not checked" symbol="1" value="1" render="true"/>
        </categories>
        <symbols>
          <symbol alpha="0.690196" force_rhr="0" clip_to_extent="1" type="fill" name="0">
            <layer locked="0" enabled="1" class="SimpleFill" pass="0">
              <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
              <prop v="0,255,127,255" k="color"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="130,130,130,255" k="outline_color"/>
              <prop v="solid" k="outline_style"/>
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
          <symbol alpha="0.690196" force_rhr="0" clip_to_extent="1" type="fill" name="1">
            <layer locked="0" enabled="1" class="SimpleFill" pass="0">
              <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
              <prop v="255,85,0,255" k="color"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="130,130,130,255" k="outline_color"/>
              <prop v="solid" k="outline_style"/>
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
        </symbols>
        <source-symbol>
          <symbol alpha="0.690196" force_rhr="0" clip_to_extent="1" type="fill" name="0">
            <layer locked="0" enabled="1" class="SimpleFill" pass="0">
              <prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/>
              <prop v="85,255,0,255" k="color"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="0,0" k="offset"/>
              <prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/>
              <prop v="MM" k="offset_unit"/>
              <prop v="130,130,130,255" k="outline_color"/>
              <prop v="solid" k="outline_style"/>
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
        </source-symbol>
        <colorramp type="random" name="[source]">
          <prop v="10" k="count"/>
          <prop v="359" k="hueMax"/>
          <prop v="0" k="hueMin"/>
          <prop v="random" k="rampType"/>
          <prop v="255" k="satMax"/>
          <prop v="0" k="satMin"/>
          <prop v="255" k="valMax"/>
          <prop v="0" k="valMin"/>
        </colorramp>
        <rotation/>
        <sizescale/>
      </renderer-v2>
      <customproperties>
        <property value="0" key="embeddedWidgets/count"/>
        <property key="variableNames"/>
        <property key="variableValues"/>
      </customproperties>
      <blendMode>0</blendMode>
      <featureBlendMode>0</featureBlendMode>
      <layerOpacity>1</layerOpacity>
      <SingleCategoryDiagramRenderer diagramType="Histogram" attributeLegend="1">
        <DiagramCategory minimumSize="0" sizeScale="3x:0,0,0,0,0,0" backgroundColor="#ffffff" penAlpha="255" backgroundAlpha="255" opacity="1" penWidth="0" labelPlacementMethod="XHeight" lineSizeScale="3x:0,0,0,0,0,0" rotationOffset="270" penColor="#000000" barWidth="5" sizeType="MM" enabled="0" lineSizeType="MM" scaleDependency="Area" height="15" scaleBasedVisibility="0" width="15" diagramOrientation="Up" maxScaleDenominator="1e+8" minScaleDenominator="inf">
          <fontProperties description="Ubuntu,11,-1,5,50,0,0,0,0,0" style=""/>
          <attribute field="" label="" color="#000000"/>
        </DiagramCategory>
      </SingleCategoryDiagramRenderer>
      <DiagramLayerSettings placement="0" priority="0" zIndex="0" obstacle="0" showAll="1" dist="0" linePlacementFlags="10">
        <properties>
          <Option type="Map">
            <Option value="" type="QString" name="name"/>
            <Option name="properties"/>
            <Option value="collection" type="QString" name="type"/>
          </Option>
        </properties>
      </DiagramLayerSettings>
      <geometryOptions geometryPrecision="0" removeDuplicateNodes="0">
        <activeChecks/>
        <checkConfiguration/>
      </geometryOptions>
      <fieldConfiguration>
        <field name="pkuid">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="0" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        </field>
        <field name="label">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="0" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        </field>
        <field name="description">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="1" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        </field>
        <field name="author">
          <editWidget type="UniqueValues">
            <config>
              <Option type="Map">
                <Option value="1" type="QString" name="Editable"/>
              </Option>
            </config>
          </editWidget>
        </field>
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
      <aliases>
        <alias index="0" field="pkuid" name=""/>
        <alias index="1" field="label" name=""/>
        <alias index="2" field="description" name=""/>
        <alias index="3" field="author" name=""/>
        <alias index="4" field="checked" name=""/>
      </aliases>
      <excludeAttributesWMS/>
      <excludeAttributesWFS/>
      <defaults>
        <default applyOnUpdate="0" field="pkuid" expression=""/>
        <default applyOnUpdate="0" field="label" expression=""/>
        <default applyOnUpdate="0" field="description" expression=""/>
        <default applyOnUpdate="0" field="author" expression=""/>
        <default applyOnUpdate="0" field="checked" expression=""/>
      </defaults>
      <constraints>
        <constraint field="pkuid" notnull_strength="1" constraints="3" unique_strength="1" exp_strength="0"/>
        <constraint field="label" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="description" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="author" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="checked" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
      </constraints>
      <constraintExpressions>
        <constraint field="pkuid" exp="" desc=""/>
        <constraint field="label" exp="" desc=""/>
        <constraint field="description" exp="" desc=""/>
        <constraint field="author" exp="" desc=""/>
        <constraint field="checked" exp="" desc=""/>
      </constraintExpressions>
      <expressionfields/>
      <attributeactions/>
      <attributetableconfig sortOrder="0" actionWidgetStyle="dropDown" sortExpression="">
        <columns>
          <column width="-1" hidden="0" type="field" name="pkuid"/>
          <column width="-1" hidden="0" type="field" name="label"/>
          <column width="-1" hidden="0" type="field" name="description"/>
          <column width="-1" hidden="0" type="field" name="author"/>
          <column width="-1" hidden="0" type="field" name="checked"/>
          <column width="-1" hidden="1" type="actions"/>
        </columns>
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

Entrez le nom de la fonction dans le champ "Fonction d\'initialisation Python".
Voici un exemple à suivre:
"""
from qgis.PyQt.QtWidgets import QWidget

def my_form_open(dialog, layer, feature):
    geom = feature.geometry()
    control = dialog.findChild(QWidget, "MyLineEdit")

]]></editforminitcode>
      <featformsuppress>0</featformsuppress>
      <editorlayout>generatedlayout</editorlayout>
      <editable/>
      <labelOnTop/>
      <widgets/>
      <previewExpression>COALESCE( "description", \'&lt;NULL>\' )</previewExpression>
      <mapTip></mapTip>
    </maplayer>
        ';

        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);
        $this->assertFalse($layer->embedded);
        $this->assertInstanceOf(Qgis\Layer\VectorLayer::class, $layer);

        $this->assertNotNull($layer->constraints);
        $this->assertCount(5, $layer->constraints);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $layer->constraints[0]);
        $this->assertEquals('pkuid', $layer->constraints[0]->field);
        $this->assertEquals(3, $layer->constraints[0]->constraints);
        $this->assertTrue($layer->constraints[0]->notnull_strength);
        $this->assertTrue($layer->constraints[0]->unique_strength);
        $this->assertFalse($layer->constraints[0]->exp_strength);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $layer->constraints[1]);
        $this->assertEquals('label', $layer->constraints[1]->field);
        $this->assertEquals(0, $layer->constraints[1]->constraints);
        $this->assertFalse($layer->constraints[1]->notnull_strength);
        $this->assertFalse($layer->constraints[1]->unique_strength);
        $this->assertFalse($layer->constraints[1]->exp_strength);

        $formControls = $layer->getFormControls();
        $this->assertNotNull($formControls);
        $this->assertCount(5, $formControls);

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['author']);
        $this->assertEquals('author', $formControls['author']->getName());
        $this->assertEquals('UniqueValues', $formControls['author']->getFieldEditType());
        $this->assertTrue($formControls['author']->isEditable());
        $this->assertEquals('', $formControls['author']->getFieldAlias());
        $this->assertEquals('menulist', $formControls['author']->getMarkup());


        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['checked']);
        $this->assertEquals('checked', $formControls['checked']->getName());
        $this->assertEquals('CheckBox', $formControls['checked']->getFieldEditType());
        $this->assertTrue($formControls['checked']->isEditable());
        $this->assertEquals('', $formControls['checked']->getFieldAlias());
        $this->assertEquals('checkbox', $formControls['checked']->getMarkup());

        $xmlStr = '
    <maplayer autoRefreshEnabled="0" readOnly="0" simplifyDrawingHints="1" simplifyMaxScale="1" type="vector" maxScale="0" geometry="Line" simplifyAlgorithm="0" hasScaleBasedVisibilityFlag="0" simplifyLocal="1" wkbType="LineString" minScale="1e+8" refreshOnNotifyEnabled="0" autoRefreshTime="0" simplifyDrawingTol="1" styleCategories="AllStyleCategories" labelsEnabled="1" refreshOnNotifyMessage="">
      <extent>
        <xmin>3.83129799999999987</xmin>
        <ymin>43.5719143059459455</ymin>
        <xmax>3.90753010594594707</xmax>
        <ymax>43.67051018486487379</ymax>
      </extent>
      <id>edition_line20130409161630329</id>
      <datasource>dbname=\'./edition/edition_db.sqlite\' table="edition_line" (geom) sql=</datasource>
      <title>Bicycle rides</title>
      <keywordList>
        <value></value>
      </keywordList>
      <layername>edition_line</layername>
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
      <map-layer-style-manager current="default">
        <map-layer-style name="default"/>
      </map-layer-style-manager>
      <auxiliaryLayer/>
      <flags>
        <Identifiable>1</Identifiable>
        <Removable>1</Removable>
        <Searchable>1</Searchable>
      </flags>
      <renderer-v2 attr="difficulty" forceraster="0" symbollevels="0" enableorderby="0" type="categorizedSymbol">
        <categories>
          <category label="easy" symbol="0" value="1" render="true"/>
          <category label="normal" symbol="1" value="2" render="true"/>
          <category label="difficult" symbol="2" value="3" render="true"/>
        </categories>
        <symbols>
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="line" name="0">
            <layer locked="0" enabled="1" class="SimpleLine" pass="0">
              <prop v="square" k="capstyle"/>
              <prop v="5;2" k="customdash"/>
              <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
              <prop v="MM" k="customdash_unit"/>
              <prop v="0" k="draw_inside_polygon"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="0,255,0,255" k="line_color"/>
              <prop v="solid" k="line_style"/>
              <prop v="1" k="line_width"/>
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
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="line" name="1">
            <layer locked="0" enabled="1" class="SimpleLine" pass="0">
              <prop v="square" k="capstyle"/>
              <prop v="5;2" k="customdash"/>
              <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
              <prop v="MM" k="customdash_unit"/>
              <prop v="0" k="draw_inside_polygon"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="255,255,0,255" k="line_color"/>
              <prop v="solid" k="line_style"/>
              <prop v="1" k="line_width"/>
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
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="line" name="2">
            <layer locked="0" enabled="1" class="SimpleLine" pass="0">
              <prop v="square" k="capstyle"/>
              <prop v="5;2" k="customdash"/>
              <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
              <prop v="MM" k="customdash_unit"/>
              <prop v="0" k="draw_inside_polygon"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="255,0,0,255" k="line_color"/>
              <prop v="solid" k="line_style"/>
              <prop v="1" k="line_width"/>
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
        <source-symbol>
          <symbol alpha="1" force_rhr="0" clip_to_extent="1" type="line" name="0">
            <layer locked="0" enabled="1" class="SimpleLine" pass="0">
              <prop v="square" k="capstyle"/>
              <prop v="5;2" k="customdash"/>
              <prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/>
              <prop v="MM" k="customdash_unit"/>
              <prop v="0" k="draw_inside_polygon"/>
              <prop v="bevel" k="joinstyle"/>
              <prop v="254,208,79,255" k="line_color"/>
              <prop v="solid" k="line_style"/>
              <prop v="1" k="line_width"/>
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
        </source-symbol>
        <colorramp type="random" name="[source]">
          <prop v="10" k="count"/>
          <prop v="359" k="hueMax"/>
          <prop v="0" k="hueMin"/>
          <prop v="random" k="rampType"/>
          <prop v="255" k="satMax"/>
          <prop v="0" k="satMin"/>
          <prop v="255" k="valMax"/>
          <prop v="0" k="valMin"/>
        </colorramp>
        <rotation/>
        <sizescale/>
      </renderer-v2>
      <customproperties/>
      <blendMode>0</blendMode>
      <featureBlendMode>0</featureBlendMode>
      <layerOpacity>1</layerOpacity>
      <geometryOptions geometryPrecision="0" removeDuplicateNodes="0">
        <activeChecks/>
        <checkConfiguration/>
      </geometryOptions>
      <fieldConfiguration>
        <field name="pkuid">
          <editWidget type="Hidden">
            <config>
              <Option/>
            </config>
          </editWidget>
        </field>
        <field name="label">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="0" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        </field>
        <field name="description">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="1" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>
        </field>
        <field name="difficulty">
          <editWidget type="Classification">
            <config>
              <Option/>
            </config>
          </editWidget>
        </field>
      </fieldConfiguration>
      <aliases>
        <alias index="0" field="pkuid" name=""/>
        <alias index="1" field="label" name=""/>
        <alias index="2" field="description" name=""/>
        <alias index="3" field="difficulty" name=""/>
      </aliases>
      <excludeAttributesWMS/>
      <excludeAttributesWFS/>
      <defaults>
        <default applyOnUpdate="0" field="pkuid" expression=""/>
        <default applyOnUpdate="0" field="label" expression=""/>
        <default applyOnUpdate="0" field="description" expression=""/>
        <default applyOnUpdate="0" field="difficulty" expression=""/>
      </defaults>
      <constraints>
        <constraint field="pkuid" notnull_strength="1" constraints="3" unique_strength="1" exp_strength="0"/>
        <constraint field="label" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="description" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
        <constraint field="difficulty" notnull_strength="0" constraints="0" unique_strength="0" exp_strength="0"/>
      </constraints>
      <constraintExpressions>
        <constraint field="pkuid" exp="" desc=""/>
        <constraint field="label" exp="" desc=""/>
        <constraint field="description" exp="" desc=""/>
        <constraint field="difficulty" exp="" desc=""/>
      </constraintExpressions>
      <expressionfields/>
      <attributeactions/>
      <attributetableconfig sortOrder="0" actionWidgetStyle="dropDown" sortExpression="">
        <columns>
          <column width="-1" hidden="1" type="field" name="pkuid"/>
        </columns>
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
      <editforminitcode><![CDATA[]]></editforminitcode>
      <featformsuppress>0</featformsuppress>
      <editorlayout>generatedlayout</editorlayout>
      <editable/>
      <labelOnTop/>
      <widgets/>
      <previewExpression>COALESCE( "description", \'&lt;NULL>\' )</previewExpression>
      <mapTip></mapTip>
    </maplayer>
        ';

        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);
        $this->assertFalse($layer->embedded);
        $this->assertInstanceOf(Qgis\Layer\VectorLayer::class, $layer);

        $this->assertNotNull($layer->constraints);
        $this->assertCount(4, $layer->constraints);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $layer->constraints[0]);
        $this->assertEquals('pkuid', $layer->constraints[0]->field);
        $this->assertEquals(3, $layer->constraints[0]->constraints);
        $this->assertTrue($layer->constraints[0]->notnull_strength);
        $this->assertTrue($layer->constraints[0]->unique_strength);
        $this->assertFalse($layer->constraints[0]->exp_strength);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $layer->constraints[1]);
        $this->assertEquals('label', $layer->constraints[1]->field);
        $this->assertEquals(0, $layer->constraints[1]->constraints);
        $this->assertFalse($layer->constraints[1]->notnull_strength);
        $this->assertFalse($layer->constraints[1]->unique_strength);
        $this->assertFalse($layer->constraints[1]->exp_strength);

        $layerToKeyArray = $layer->toKeyArray();
        $this->assertArrayHasKey('constraints', $layerToKeyArray);
        $this->assertArrayHasKey('pkuid', $layerToKeyArray['constraints']);
        $this->assertArrayHasKey('constraints', $layerToKeyArray['constraints']['pkuid']);
        $this->assertEquals(3, $layerToKeyArray['constraints']['pkuid']['constraints']);
        $this->assertTrue($layerToKeyArray['constraints']['pkuid']['notNull']);
        $this->assertTrue($layerToKeyArray['constraints']['pkuid']['unique']);
        $this->assertFalse($layerToKeyArray['constraints']['pkuid']['exp']);

        $formControls = $layer->getFormControls();
        $this->assertNotNull($formControls);
        $this->assertCount(4, $formControls);

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['pkuid']);
        $this->assertEquals('pkuid', $formControls['pkuid']->getName());
        $this->assertEquals('Hidden', $formControls['pkuid']->getFieldEditType());
        $this->assertTrue($formControls['pkuid']->isEditable());
        $this->assertEquals('', $formControls['pkuid']->getFieldAlias());
        $this->assertEquals('hidden', $formControls['pkuid']->getMarkup());

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['difficulty']);
        $this->assertEquals('difficulty', $formControls['difficulty']->getName());
        $this->assertEquals('Classification', $formControls['difficulty']->getFieldEditType());
        $this->assertTrue($formControls['difficulty']->isEditable());
        $this->assertEquals('', $formControls['difficulty']->getFieldAlias());
        $this->assertEquals('menulist', $formControls['difficulty']->getMarkup());
        $categories = array(
            1 => 'easy',
            2 => 'normal',
            3 => 'difficult',
        );
        $this->assertEquals($categories, $formControls['difficulty']->getRendererCategories());

        $xmlStr = '
    <maplayer maxScale="0" type="vector" refreshOnNotifyMessage="" simplifyAlgorithm="0" simplifyDrawingHints="0" labelsEnabled="0" wkbType="Point" simplifyLocal="1" legendPlaceholderImage="" hasScaleBasedVisibilityFlag="0" autoRefreshEnabled="0" minScale="100000000" symbologyReferenceScale="-1" simplifyDrawingTol="1" geometry="Point" readOnly="0" refreshOnNotifyEnabled="0" simplifyMaxScale="1" styleCategories="AllStyleCategories" autoRefreshTime="0">
      <extent>
        <xmin>-0.63213155735301818</xmin>
        <ymin>45.70204553664066083</ymin>
        <xmax>0.63937547315889365</xmax>
        <ymax>46.52953423903730368</ymax>
      </extent>
      <wgs84extent>
        <xmin>-0.63213155735301818</xmin>
        <ymin>45.70204553664066083</ymin>
        <xmax>0.63937547315889365</xmax>
        <ymax>46.52953423903730368</ymax>
      </wgs84extent>
      <id>for_edition_upload_webdav_shape_caf087fb_dfd0_40c5_93a4_ac1ae5648e96</id>
      <datasource>./form_edition_upload_webdav_shape.shp</datasource>
      <shortname>for_edition_upload_webdav_shape</shortname>
      <keywordList>
        <value></value>
      </keywordList>
      <layername>form_edition_upload_webdav_shape</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt">
          <wkt>GEOGCRS["WGS 84",ENSEMBLE["World Geodetic System 1984 ensemble",MEMBER["World Geodetic System 1984 (Transit)"],MEMBER["World Geodetic System 1984 (G730)"],MEMBER["World Geodetic System 1984 (G873)"],MEMBER["World Geodetic System 1984 (G1150)"],MEMBER["World Geodetic System 1984 (G1674)"],MEMBER["World Geodetic System 1984 (G1762)"],MEMBER["World Geodetic System 1984 (G2139)"],ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]],ENSEMBLEACCURACY[2.0]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["geodetic latitude (Lat)",north,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["geodetic longitude (Lon)",east,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],USAGE[SCOPE["Horizontal component of 3D system."],AREA["World."],BBOX[-90,-180,90,180]],ID["EPSG",4326]]</wkt>
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
        <fees></fees>
        <encoding></encoding>
        <crs>
          <spatialrefsys nativeFormat="Wkt">
            <wkt>GEOGCRS["WGS 84",ENSEMBLE["World Geodetic System 1984 ensemble",MEMBER["World Geodetic System 1984 (Transit)"],MEMBER["World Geodetic System 1984 (G730)"],MEMBER["World Geodetic System 1984 (G873)"],MEMBER["World Geodetic System 1984 (G1150)"],MEMBER["World Geodetic System 1984 (G1674)"],MEMBER["World Geodetic System 1984 (G1762)"],MEMBER["World Geodetic System 1984 (G2139)"],ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]],ENSEMBLEACCURACY[2.0]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["geodetic latitude (Lat)",north,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["geodetic longitude (Lon)",east,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],USAGE[SCOPE["Horizontal component of 3D system."],AREA["World."],BBOX[-90,-180,90,180]],ID["EPSG",4326]]</wkt>
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
          <spatial crs="EPSG:4326" dimensions="2" maxx="0" minx="0" miny="0" maxy="0" minz="0" maxz="0"/>
          <temporal>
            <period>
              <start></start>
              <end></end>
            </period>
          </temporal>
        </extent>
      </resourceMetadata>
      <provider encoding="UTF-8">ogr</provider>
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
      <temporal endExpression="" endField="" mode="0" startField="" enabled="0" limitMode="0" durationUnit="min" durationField="" startExpression="" fixedDuration="0" accumulate="0">
        <fixedRange>
          <start></start>
          <end></end>
        </fixedRange>
      </temporal>
      <elevation symbology="Line" zoffset="0" type="IndividualFeatures" clamping="Terrain" showMarkerSymbolInSurfacePlots="0" extrusionEnabled="0" binding="Centroid" respectLayerSymbol="1" extrusion="0" zscale="1">
        <data-defined-properties>
          <Option type="Map">
            <Option type="QString" name="name" value=""/>
            <Option name="properties"/>
            <Option type="QString" name="type" value="collection"/>
          </Option>
        </data-defined-properties>
        <profileLineSymbol>
          <symbol alpha="1" type="line" force_rhr="0" name="" frame_rate="10" is_animated="0" clip_to_extent="1">
            <data_defined_properties>
              <Option type="Map">
                <Option type="QString" name="name" value=""/>
                <Option name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
            </data_defined_properties>
            <layer class="SimpleLine" pass="0" enabled="1" locked="0">
              <Option type="Map">
                <Option type="QString" name="align_dash_pattern" value="0"/>
                <Option type="QString" name="capstyle" value="square"/>
                <Option type="QString" name="customdash" value="5;2"/>
                <Option type="QString" name="customdash_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="customdash_unit" value="MM"/>
                <Option type="QString" name="dash_pattern_offset" value="0"/>
                <Option type="QString" name="dash_pattern_offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="dash_pattern_offset_unit" value="MM"/>
                <Option type="QString" name="draw_inside_polygon" value="0"/>
                <Option type="QString" name="joinstyle" value="bevel"/>
                <Option type="QString" name="line_color" value="114,155,111,255"/>
                <Option type="QString" name="line_style" value="solid"/>
                <Option type="QString" name="line_width" value="0.6"/>
                <Option type="QString" name="line_width_unit" value="MM"/>
                <Option type="QString" name="offset" value="0"/>
                <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="offset_unit" value="MM"/>
                <Option type="QString" name="ring_filter" value="0"/>
                <Option type="QString" name="trim_distance_end" value="0"/>
                <Option type="QString" name="trim_distance_end_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="trim_distance_end_unit" value="MM"/>
                <Option type="QString" name="trim_distance_start" value="0"/>
                <Option type="QString" name="trim_distance_start_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="trim_distance_start_unit" value="MM"/>
                <Option type="QString" name="tweak_dash_pattern_on_corners" value="0"/>
                <Option type="QString" name="use_custom_dash" value="0"/>
                <Option type="QString" name="width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              </Option>
              <data_defined_properties>
                <Option type="Map">
                  <Option type="QString" name="name" value=""/>
                  <Option name="properties"/>
                  <Option type="QString" name="type" value="collection"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </profileLineSymbol>
        <profileFillSymbol>
          <symbol alpha="1" type="fill" force_rhr="0" name="" frame_rate="10" is_animated="0" clip_to_extent="1">
            <data_defined_properties>
              <Option type="Map">
                <Option type="QString" name="name" value=""/>
                <Option name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
            </data_defined_properties>
            <layer class="SimpleFill" pass="0" enabled="1" locked="0">
              <Option type="Map">
                <Option type="QString" name="border_width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="color" value="114,155,111,255"/>
                <Option type="QString" name="joinstyle" value="bevel"/>
                <Option type="QString" name="offset" value="0,0"/>
                <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="offset_unit" value="MM"/>
                <Option type="QString" name="outline_color" value="81,111,79,255"/>
                <Option type="QString" name="outline_style" value="solid"/>
                <Option type="QString" name="outline_width" value="0.2"/>
                <Option type="QString" name="outline_width_unit" value="MM"/>
                <Option type="QString" name="style" value="solid"/>
              </Option>
              <data_defined_properties>
                <Option type="Map">
                  <Option type="QString" name="name" value=""/>
                  <Option name="properties"/>
                  <Option type="QString" name="type" value="collection"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </profileFillSymbol>
        <profileMarkerSymbol>
          <symbol alpha="1" type="marker" force_rhr="0" name="" frame_rate="10" is_animated="0" clip_to_extent="1">
            <data_defined_properties>
              <Option type="Map">
                <Option type="QString" name="name" value=""/>
                <Option name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
            </data_defined_properties>
            <layer class="SimpleMarker" pass="0" enabled="1" locked="0">
              <Option type="Map">
                <Option type="QString" name="angle" value="0"/>
                <Option type="QString" name="cap_style" value="square"/>
                <Option type="QString" name="color" value="114,155,111,255"/>
                <Option type="QString" name="horizontal_anchor_point" value="1"/>
                <Option type="QString" name="joinstyle" value="bevel"/>
                <Option type="QString" name="name" value="diamond"/>
                <Option type="QString" name="offset" value="0,0"/>
                <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="offset_unit" value="MM"/>
                <Option type="QString" name="outline_color" value="81,111,79,255"/>
                <Option type="QString" name="outline_style" value="solid"/>
                <Option type="QString" name="outline_width" value="0.2"/>
                <Option type="QString" name="outline_width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="outline_width_unit" value="MM"/>
                <Option type="QString" name="scale_method" value="diameter"/>
                <Option type="QString" name="size" value="3"/>
                <Option type="QString" name="size_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="size_unit" value="MM"/>
                <Option type="QString" name="vertical_anchor_point" value="1"/>
              </Option>
              <data_defined_properties>
                <Option type="Map">
                  <Option type="QString" name="name" value=""/>
                  <Option name="properties"/>
                  <Option type="QString" name="type" value="collection"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </profileMarkerSymbol>
      </elevation>
      <renderer-v2 enableorderby="0" symbollevels="0" type="singleSymbol" referencescale="-1" forceraster="0">
        <symbols>
          <symbol alpha="1" type="marker" force_rhr="0" name="0" frame_rate="10" is_animated="0" clip_to_extent="1">
            <data_defined_properties>
              <Option type="Map">
                <Option type="QString" name="name" value=""/>
                <Option name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
            </data_defined_properties>
            <layer class="SimpleMarker" pass="0" enabled="1" locked="0">
              <Option type="Map">
                <Option type="QString" name="angle" value="0"/>
                <Option type="QString" name="cap_style" value="square"/>
                <Option type="QString" name="color" value="239,243,0,255"/>
                <Option type="QString" name="horizontal_anchor_point" value="1"/>
                <Option type="QString" name="joinstyle" value="bevel"/>
                <Option type="QString" name="name" value="circle"/>
                <Option type="QString" name="offset" value="0,0"/>
                <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="offset_unit" value="MM"/>
                <Option type="QString" name="outline_color" value="35,35,35,255"/>
                <Option type="QString" name="outline_style" value="solid"/>
                <Option type="QString" name="outline_width" value="0"/>
                <Option type="QString" name="outline_width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="outline_width_unit" value="MM"/>
                <Option type="QString" name="scale_method" value="diameter"/>
                <Option type="QString" name="size" value="2"/>
                <Option type="QString" name="size_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="size_unit" value="MM"/>
                <Option type="QString" name="vertical_anchor_point" value="1"/>
              </Option>
              <data_defined_properties>
                <Option type="Map">
                  <Option type="QString" name="name" value=""/>
                  <Option name="properties"/>
                  <Option type="QString" name="type" value="collection"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </symbols>
        <rotation/>
        <sizescale/>
      </renderer-v2>
      <customproperties>
        <Option type="Map">
          <Option type="List" name="dualview/previewExpressions">
            <Option type="QString" value="&quot;remote&quot;"/>
          </Option>
          <Option type="int" name="embeddedWidgets/count" value="0"/>
          <Option type="invalid" name="variableNames"/>
          <Option type="invalid" name="variableValues"/>
        </Option>
      </customproperties>
      <blendMode>0</blendMode>
      <featureBlendMode>0</featureBlendMode>
      <layerOpacity>1</layerOpacity>
      <SingleCategoryDiagramRenderer attributeLegend="1" diagramType="Histogram">
        <DiagramCategory labelPlacementMethod="XHeight" sizeScale="3x:0,0,0,0,0,0" backgroundColor="#ffffff" diagramOrientation="Up" minScaleDenominator="0" spacing="5" scaleDependency="Area" minimumSize="0" spacingUnit="MM" enabled="0" opacity="1" sizeType="MM" rotationOffset="270" penWidth="0" lineSizeScale="3x:0,0,0,0,0,0" width="15" direction="0" penAlpha="255" penColor="#000000" barWidth="5" height="15" scaleBasedVisibility="0" backgroundAlpha="255" lineSizeType="MM" maxScaleDenominator="1e+08" spacingUnitScale="3x:0,0,0,0,0,0" showAxis="1">
          <fontProperties strikethrough="0" bold="0" description="Sans,9,-1,5,50,0,0,0,0,0" underline="0" style="" italic="0"/>
          <attribute colorOpacity="1" color="#000000" label="" field=""/>
          <axisSymbol>
            <symbol alpha="1" type="line" force_rhr="0" name="" frame_rate="10" is_animated="0" clip_to_extent="1">
              <data_defined_properties>
                <Option type="Map">
                  <Option type="QString" name="name" value=""/>
                  <Option name="properties"/>
                  <Option type="QString" name="type" value="collection"/>
                </Option>
              </data_defined_properties>
              <layer class="SimpleLine" pass="0" enabled="1" locked="0">
                <Option type="Map">
                  <Option type="QString" name="align_dash_pattern" value="0"/>
                  <Option type="QString" name="capstyle" value="square"/>
                  <Option type="QString" name="customdash" value="5;2"/>
                  <Option type="QString" name="customdash_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                  <Option type="QString" name="customdash_unit" value="MM"/>
                  <Option type="QString" name="dash_pattern_offset" value="0"/>
                  <Option type="QString" name="dash_pattern_offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                  <Option type="QString" name="dash_pattern_offset_unit" value="MM"/>
                  <Option type="QString" name="draw_inside_polygon" value="0"/>
                  <Option type="QString" name="joinstyle" value="bevel"/>
                  <Option type="QString" name="line_color" value="35,35,35,255"/>
                  <Option type="QString" name="line_style" value="solid"/>
                  <Option type="QString" name="line_width" value="0.26"/>
                  <Option type="QString" name="line_width_unit" value="MM"/>
                  <Option type="QString" name="offset" value="0"/>
                  <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                  <Option type="QString" name="offset_unit" value="MM"/>
                  <Option type="QString" name="ring_filter" value="0"/>
                  <Option type="QString" name="trim_distance_end" value="0"/>
                  <Option type="QString" name="trim_distance_end_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                  <Option type="QString" name="trim_distance_end_unit" value="MM"/>
                  <Option type="QString" name="trim_distance_start" value="0"/>
                  <Option type="QString" name="trim_distance_start_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                  <Option type="QString" name="trim_distance_start_unit" value="MM"/>
                  <Option type="QString" name="tweak_dash_pattern_on_corners" value="0"/>
                  <Option type="QString" name="use_custom_dash" value="0"/>
                  <Option type="QString" name="width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                </Option>
                <data_defined_properties>
                  <Option type="Map">
                    <Option type="QString" name="name" value=""/>
                    <Option name="properties"/>
                    <Option type="QString" name="type" value="collection"/>
                  </Option>
                </data_defined_properties>
              </layer>
            </symbol>
          </axisSymbol>
        </DiagramCategory>
      </SingleCategoryDiagramRenderer>
      <DiagramLayerSettings linePlacementFlags="18" priority="0" placement="0" obstacle="0" showAll="1" zIndex="0" dist="0">
        <properties>
          <Option type="Map">
            <Option type="QString" name="name" value=""/>
            <Option name="properties"/>
            <Option type="QString" name="type" value="collection"/>
          </Option>
        </properties>
      </DiagramLayerSettings>
      <geometryOptions removeDuplicateNodes="0" geometryPrecision="0">
        <activeChecks/>
        <checkConfiguration/>
      </geometryOptions>
      <legend type="default-vector" showLabelLegend="0"/>
      <referencedLayers/>
      <fieldConfiguration>
        <field name="id" configurationFlags="None">
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option type="bool" name="IsMultiline" value="false"/>
                <Option type="bool" name="UseHtml" value="false"/>
              </Option>
            </config>
          </editWidget>
        </field>
        <field name="remote" configurationFlags="None">
          <editWidget type="ExternalResource">
            <config>
              <Option type="Map">
                <Option type="int" name="DocumentViewer" value="1"/>
                <Option type="int" name="DocumentViewerHeight" value="0"/>
                <Option type="int" name="DocumentViewerWidth" value="0"/>
                <Option type="bool" name="FileWidget" value="true"/>
                <Option type="bool" name="FileWidgetButton" value="true"/>
                <Option type="QString" name="FileWidgetFilter" value=""/>
                <Option type="Map" name="PropertyCollection">
                  <Option type="QString" name="name" value=""/>
                  <Option type="Map" name="properties">
                    <Option type="Map" name="storageUrl">
                      <Option type="bool" name="active" value="true"/>
                      <Option type="QString" name="expression" value="\'http://webdav/shapeData/\'||file_name(@selected_file_path)"/>
                      <Option type="int" name="type" value="3"/>
                    </Option>
                  </Option>
                  <Option type="QString" name="type" value="collection"/>
                </Option>
                <Option type="int" name="RelativeStorage" value="0"/>
                <Option type="QString" name="StorageAuthConfigId" value="k6k7lv8"/>
                <Option type="int" name="StorageMode" value="0"/>
                <Option type="QString" name="StorageType" value="WebDAV"/>
              </Option>
            </config>
          </editWidget>
        </field>
        <field name="local" configurationFlags="None">
          <editWidget type="ExternalResource">
            <config>
              <Option type="Map">
                <Option type="int" name="DocumentViewer" value="0"/>
                <Option type="int" name="DocumentViewerHeight" value="0"/>
                <Option type="int" name="DocumentViewerWidth" value="0"/>
                <Option type="bool" name="FileWidget" value="true"/>
                <Option type="bool" name="FileWidgetButton" value="true"/>
                <Option type="QString" name="FileWidgetFilter" value=""/>
                <Option type="Map" name="PropertyCollection">
                  <Option type="QString" name="name" value=""/>
                  <Option type="invalid" name="properties"/>
                  <Option type="QString" name="type" value="collection"/>
                </Option>
                <Option type="int" name="RelativeStorage" value="0"/>
                <Option type="QString" name="StorageAuthConfigId" value=""/>
                <Option type="int" name="StorageMode" value="0"/>
                <Option type="QString" name="StorageType" value=""/>
              </Option>
            </config>
          </editWidget>
        </field>
      </fieldConfiguration>
      <aliases>
        <alias index="0" name="" field="id"/>
        <alias index="1" name="" field="remote"/>
        <alias index="2" name="" field="local"/>
      </aliases>
      <defaults>
        <default applyOnUpdate="0" expression="" field="id"/>
        <default applyOnUpdate="0" expression="" field="remote"/>
        <default applyOnUpdate="0" expression="" field="local"/>
      </defaults>
      <constraints>
        <constraint constraints="0" unique_strength="0" notnull_strength="0" field="id" exp_strength="0"/>
        <constraint constraints="0" unique_strength="0" notnull_strength="0" field="remote" exp_strength="0"/>
        <constraint constraints="0" unique_strength="0" notnull_strength="0" field="local" exp_strength="0"/>
      </constraints>
      <constraintExpressions>
        <constraint exp="" field="id" desc=""/>
        <constraint exp="" field="remote" desc=""/>
        <constraint exp="" field="local" desc=""/>
      </constraintExpressions>
      <expressionfields/>
      <attributeactions>
        <defaultAction key="Canvas" value="{00000000-0000-0000-0000-000000000000}"/>
      </attributeactions>
      <attributetableconfig actionWidgetStyle="dropDown" sortExpression="" sortOrder="0">
        <columns>
          <column type="field" name="id" width="-1" hidden="0"/>
          <column type="field" name="remote" width="-1" hidden="0"/>
          <column type="field" name="local" width="-1" hidden="0"/>
          <column type="actions" width="-1" hidden="1"/>
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
        <labelStyle overrideLabelFont="0" overrideLabelColor="0" labelColor="0,0,0,255">
          <labelFont strikethrough="0" bold="0" description="Sans,9,-1,5,50,0,0,0,0,0" underline="0" style="" italic="0"/>
        </labelStyle>
        <attributeEditorField showLabel="1" index="0" name="id">
          <labelStyle overrideLabelFont="0" overrideLabelColor="0" labelColor="0,0,0,255">
            <labelFont strikethrough="0" bold="0" description="Sans,9,-1,5,50,0,0,0,0,0" underline="0" style="" italic="0"/>
          </labelStyle>
        </attributeEditorField>
        <attributeEditorField showLabel="1" index="1" name="remote">
          <labelStyle overrideLabelFont="0" overrideLabelColor="0" labelColor="0,0,0,255">
            <labelFont strikethrough="0" bold="0" description="Sans,9,-1,5,50,0,0,0,0,0" underline="0" style="" italic="0"/>
          </labelStyle>
        </attributeEditorField>
        <attributeEditorField showLabel="1" index="2" name="local">
          <labelStyle overrideLabelFont="0" overrideLabelColor="0" labelColor="0,0,0,255">
            <labelFont strikethrough="0" bold="0" description="Sans,9,-1,5,50,0,0,0,0,0" underline="0" style="" italic="0"/>
          </labelStyle>
        </attributeEditorField>
      </attributeEditorForm>
      <editable>
        <field editable="1" name="id"/>
        <field editable="1" name="local"/>
        <field editable="1" name="remote"/>
      </editable>
      <labelOnTop>
        <field name="id" labelOnTop="0"/>
        <field name="local" labelOnTop="0"/>
        <field name="remote" labelOnTop="0"/>
      </labelOnTop>
      <reuseLastValue>
        <field reuseLastValue="0" name="id"/>
        <field reuseLastValue="0" name="local"/>
        <field reuseLastValue="0" name="remote"/>
      </reuseLastValue>
      <dataDefinedFieldProperties/>
      <widgets/>
      <previewExpression>"remote"</previewExpression>
      <mapTip>&lt;table class="table table-condensed table-striped table-bordered lizmapPopupTable">
  &lt;thead>
    &lt;tr>
      &lt;th>Field&lt;/th>
      &lt;th>Value&lt;/th>
    &lt;/tr>
  &lt;/thead>
  &lt;tbody>
    &lt;tr>
      &lt;th>id&lt;/th>
      &lt;td>[% "id" %]&lt;/td>
    &lt;/tr>
    &lt;tr>
      &lt;th>remote&lt;/th>
      &lt;td>[% "remote" %]&lt;/td>
    &lt;/tr>
    &lt;tr>
      &lt;th>local&lt;/th>
      &lt;td>[% "local" %]&lt;/td>
    &lt;/tr>

  &lt;/tbody>
&lt;/table></mapTip>
    </maplayer>
        ';

        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);
        $this->assertFalse($layer->embedded);
        $this->assertInstanceOf(Qgis\Layer\VectorLayer::class, $layer);

        $layerToKeyArray = $layer->toKeyArray();
        $this->assertArrayHasKey('webDavFields', $layerToKeyArray);
        $this->assertCount(1, $layerToKeyArray['webDavFields']);
        $this->assertEquals(array('remote'), $layerToKeyArray['webDavFields']);
        $this->assertArrayHasKey('webDavBaseUris', $layerToKeyArray);
        $this->assertCount(1, $layerToKeyArray['webDavBaseUris']);
        $this->assertEquals(array("'http://webdav/shapeData/'||file_name(@selected_file_path)"), $layerToKeyArray['webDavBaseUris']);

        $formControls = $layer->getFormControls();
        $this->assertNotNull($formControls);
        $this->assertCount(3, $formControls);

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['id']);
        $this->assertEquals('id', $formControls['id']->getName());
        $this->assertEquals('TextEdit', $formControls['id']->getFieldEditType());
        $this->assertTrue($formControls['id']->isEditable());
        $this->assertEquals('', $formControls['id']->getFieldAlias());
        $this->assertEquals('input', $formControls['id']->getMarkup());

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['remote']);
        $this->assertEquals('remote', $formControls['remote']->getName());
        $this->assertEquals('ExternalResource', $formControls['remote']->getFieldEditType());
        $this->assertTrue($formControls['remote']->isEditable());
        $this->assertEquals('', $formControls['remote']->getFieldAlias());
        $this->assertEquals('upload', $formControls['remote']->getMarkup());

        $this->assertTrue($formControls['remote']->isImageUpload());
        $this->assertEquals(
            array('image/jpg', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'),
            $formControls['remote']->getMimeTypes()
        );
        $this->assertEquals('image/jpg, image/jpeg, image/pjpeg, image/png, image/gif', $formControls['remote']->getUploadAccept());
        $this->assertEquals('environment', $formControls['remote']->getUploadCapture());
        $this->assertEquals('', $formControls['remote']->getEditAttribute('DefaultRoot'));
        $this->assertEquals('WebDAV', $formControls['remote']->getEditAttribute('StorageType'));
        $this->assertEquals("'http://webdav/shapeData/'||file_name(@selected_file_path)", $formControls['remote']->getEditAttribute('webDAVStorageUrl'));
        $propertyCollection = $formControls['remote']->getEditAttribute('PropertyCollection');
        $this->assertTrue(isset($propertyCollection));
        $this->assertTrue(isset($propertyCollection['properties']));
        $this->assertFalse(isset($propertyCollection['properties']['propertyRootPath']));

        $this->assertInstanceOf(Form\QgisFormControlProperties::class, $formControls['local']);
        $this->assertEquals('local', $formControls['local']->getName());
        $this->assertEquals('ExternalResource', $formControls['local']->getFieldEditType());
        $this->assertTrue($formControls['local']->isEditable());
        $this->assertEquals('', $formControls['local']->getFieldAlias());
        $this->assertEquals('upload', $formControls['local']->getMarkup());

        $this->assertFalse($formControls['local']->isImageUpload());
        $this->assertEquals(
            array(),
            $formControls['local']->getMimeTypes()
        );
        $this->assertEquals('', $formControls['local']->getUploadAccept());
        $this->assertEquals('', $formControls['local']->getUploadCapture());
        $this->assertEquals('', $formControls['local']->getEditAttribute('DefaultRoot'));
        $this->assertEquals('', $formControls['local']->getEditAttribute('StorageType'));
    }

    public function testToKeyArray(): void {
        $xmlStr = '
  <maplayer refreshOnNotifyMessage="" minScale="100000000" maxScale="0" wkbType="Point" readOnly="0" styleCategories="AllStyleCategories" simplifyDrawingTol="1" type="vector" autoRefreshTime="0" geometry="Point" refreshOnNotifyEnabled="0" legendPlaceholderImage="" simplifyLocal="1" autoRefreshEnabled="0" simplifyMaxScale="1" simplifyAlgorithm="0" hasScaleBasedVisibilityFlag="0" labelsEnabled="0" simplifyDrawingHints="0" symbologyReferenceScale="-1">
    <extent>
      <xmin>695509.79609184700530022</xmin>
      <ymin>6321556.88189174793660641</ymin>
      <xmax>695509.79609184700530022</xmax>
      <ymax>6321556.88189174793660641</ymax>
    </extent>
    <wgs84extent>
      <xmin>2.94402361346026709</xmin>
      <ymin>43.99299944327356116</ymin>
      <xmax>2.94402361346026709</xmax>
      <ymax>43.99299944327356116</ymax>
    </wgs84extent>
    <id>table_for_form_8a6a46b7_21ef_47d6_a5cd_134f6e84dace</id>
    <datasource>service=\'lizmapdb\' sslmode=disable key=\'gid\' estimatedmetadata=true srid=2154 type=Point checkPrimaryKeyUnicity=\'1\' table="tests_projects"."table_for_form" (geom)</datasource>
    <shortname>table_for_form</shortname>
    <keywordList>
      <value></value>
    </keywordList>
    <layername>table_for_form</layername>
    <srs>
      <spatialrefsys nativeFormat="Wkt">
        <wkt>PROJCRS["RGF93 v1 / Lambert-93",BASEGEOGCRS["RGF93 v1",DATUM["Reseau Geodesique Francais 1993 v1",ELLIPSOID["GRS 1980",6378137,298.257222101,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],ID["EPSG",4171]],CONVERSION["Lambert-93",METHOD["Lambert Conic Conformal (2SP)",ID["EPSG",9802]],PARAMETER["Latitude of false origin",46.5,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8821]],PARAMETER["Longitude of false origin",3,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8822]],PARAMETER["Latitude of 1st standard parallel",49,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8823]],PARAMETER["Latitude of 2nd standard parallel",44,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8824]],PARAMETER["Easting at false origin",700000,LENGTHUNIT["metre",1],ID["EPSG",8826]],PARAMETER["Northing at false origin",6600000,LENGTHUNIT["metre",1],ID["EPSG",8827]]],CS[Cartesian,2],AXIS["easting (X)",east,ORDER[1],LENGTHUNIT["metre",1]],AXIS["northing (Y)",north,ORDER[2],LENGTHUNIT["metre",1]],USAGE[SCOPE["Engineering survey, topographic mapping."],AREA["France - onshore and offshore, mainland and Corsica."],BBOX[41.15,-9.86,51.56,10.38]],ID["EPSG",2154]]</wkt>
        <proj4>+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs</proj4>
        <srsid>145</srsid>
        <srid>2154</srid>
        <authid>EPSG:2154</authid>
        <description>RGF93 v1 / Lambert-93</description>
        <projectionacronym>lcc</projectionacronym>
        <ellipsoidacronym>EPSG:7019</ellipsoidacronym>
        <geographicflag>false</geographicflag>
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
      <fees></fees>
      <encoding></encoding>
      <crs>
        <spatialrefsys nativeFormat="Wkt">
          <wkt>PROJCRS["RGF93 v1 / Lambert-93",BASEGEOGCRS["RGF93 v1",DATUM["Reseau Geodesique Francais 1993 v1",ELLIPSOID["GRS 1980",6378137,298.257222101,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],ID["EPSG",4171]],CONVERSION["Lambert-93",METHOD["Lambert Conic Conformal (2SP)",ID["EPSG",9802]],PARAMETER["Latitude of false origin",46.5,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8821]],PARAMETER["Longitude of false origin",3,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8822]],PARAMETER["Latitude of 1st standard parallel",49,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8823]],PARAMETER["Latitude of 2nd standard parallel",44,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8824]],PARAMETER["Easting at false origin",700000,LENGTHUNIT["metre",1],ID["EPSG",8826]],PARAMETER["Northing at false origin",6600000,LENGTHUNIT["metre",1],ID["EPSG",8827]]],CS[Cartesian,2],AXIS["easting (X)",east,ORDER[1],LENGTHUNIT["metre",1]],AXIS["northing (Y)",north,ORDER[2],LENGTHUNIT["metre",1]],USAGE[SCOPE["Engineering survey, topographic mapping."],AREA["France - onshore and offshore, mainland and Corsica."],BBOX[41.15,-9.86,51.56,10.38]],ID["EPSG",2154]]</wkt>
          <proj4>+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs</proj4>
          <srsid>145</srsid>
          <srid>2154</srid>
          <authid>EPSG:2154</authid>
          <description>RGF93 v1 / Lambert-93</description>
          <projectionacronym>lcc</projectionacronym>
          <ellipsoidacronym>EPSG:7019</ellipsoidacronym>
          <geographicflag>false</geographicflag>
        </spatialrefsys>
      </crs>
      <extent>
        <spatial minz="0" minx="0" miny="0" crs="EPSG:2154" maxy="0" maxx="0" maxz="0" dimensions="2"/>
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
    <map-layer-style-manager current="défaut">
      <map-layer-style name="défaut"/>
    </map-layer-style-manager>
    <auxiliaryLayer/>
    <metadataUrls/>
    <flags>
      <Identifiable>1</Identifiable>
      <Removable>1</Removable>
      <Searchable>1</Searchable>
      <Private>0</Private>
    </flags>
    <temporal endExpression="" durationUnit="min" fixedDuration="0" accumulate="0" mode="0" durationField="" limitMode="0" endField="" startExpression="" enabled="0" startField="">
      <fixedRange>
        <start></start>
        <end></end>
      </fixedRange>
    </temporal>
    <elevation type="IndividualFeatures" extrusionEnabled="0" symbology="Line" zoffset="0" zscale="1" binding="Centroid" clamping="Terrain" respectLayerSymbol="1" extrusion="0" showMarkerSymbolInSurfacePlots="0">
      <data-defined-properties>
        <Option type="Map">
          <Option type="QString" name="name" value=""/>
          <Option name="properties"/>
          <Option type="QString" name="type" value="collection"/>
        </Option>
      </data-defined-properties>
      <profileLineSymbol>
        <symbol type="line" frame_rate="10" name="" is_animated="0" alpha="1" force_rhr="0" clip_to_extent="1">
          <data_defined_properties>
            <Option type="Map">
              <Option type="QString" name="name" value=""/>
              <Option name="properties"/>
              <Option type="QString" name="type" value="collection"/>
            </Option>
          </data_defined_properties>
          <layer class="SimpleLine" locked="0" pass="0" enabled="1">
            <Option type="Map">
              <Option type="QString" name="align_dash_pattern" value="0"/>
              <Option type="QString" name="capstyle" value="square"/>
              <Option type="QString" name="customdash" value="5;2"/>
              <Option type="QString" name="customdash_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="customdash_unit" value="MM"/>
              <Option type="QString" name="dash_pattern_offset" value="0"/>
              <Option type="QString" name="dash_pattern_offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="dash_pattern_offset_unit" value="MM"/>
              <Option type="QString" name="draw_inside_polygon" value="0"/>
              <Option type="QString" name="joinstyle" value="bevel"/>
              <Option type="QString" name="line_color" value="183,72,75,255"/>
              <Option type="QString" name="line_style" value="solid"/>
              <Option type="QString" name="line_width" value="0.6"/>
              <Option type="QString" name="line_width_unit" value="MM"/>
              <Option type="QString" name="offset" value="0"/>
              <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="offset_unit" value="MM"/>
              <Option type="QString" name="ring_filter" value="0"/>
              <Option type="QString" name="trim_distance_end" value="0"/>
              <Option type="QString" name="trim_distance_end_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="trim_distance_end_unit" value="MM"/>
              <Option type="QString" name="trim_distance_start" value="0"/>
              <Option type="QString" name="trim_distance_start_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="trim_distance_start_unit" value="MM"/>
              <Option type="QString" name="tweak_dash_pattern_on_corners" value="0"/>
              <Option type="QString" name="use_custom_dash" value="0"/>
              <Option type="QString" name="width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
            </Option>
            <data_defined_properties>
              <Option type="Map">
                <Option type="QString" name="name" value=""/>
                <Option name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
            </data_defined_properties>
          </layer>
        </symbol>
      </profileLineSymbol>
      <profileFillSymbol>
        <symbol type="fill" frame_rate="10" name="" is_animated="0" alpha="1" force_rhr="0" clip_to_extent="1">
          <data_defined_properties>
            <Option type="Map">
              <Option type="QString" name="name" value=""/>
              <Option name="properties"/>
              <Option type="QString" name="type" value="collection"/>
            </Option>
          </data_defined_properties>
          <layer class="SimpleFill" locked="0" pass="0" enabled="1">
            <Option type="Map">
              <Option type="QString" name="border_width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="color" value="183,72,75,255"/>
              <Option type="QString" name="joinstyle" value="bevel"/>
              <Option type="QString" name="offset" value="0,0"/>
              <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="offset_unit" value="MM"/>
              <Option type="QString" name="outline_color" value="131,51,54,255"/>
              <Option type="QString" name="outline_style" value="solid"/>
              <Option type="QString" name="outline_width" value="0.2"/>
              <Option type="QString" name="outline_width_unit" value="MM"/>
              <Option type="QString" name="style" value="solid"/>
            </Option>
            <data_defined_properties>
              <Option type="Map">
                <Option type="QString" name="name" value=""/>
                <Option name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
            </data_defined_properties>
          </layer>
        </symbol>
      </profileFillSymbol>
      <profileMarkerSymbol>
        <symbol type="marker" frame_rate="10" name="" is_animated="0" alpha="1" force_rhr="0" clip_to_extent="1">
          <data_defined_properties>
            <Option type="Map">
              <Option type="QString" name="name" value=""/>
              <Option name="properties"/>
              <Option type="QString" name="type" value="collection"/>
            </Option>
          </data_defined_properties>
          <layer class="SimpleMarker" locked="0" pass="0" enabled="1">
            <Option type="Map">
              <Option type="QString" name="angle" value="0"/>
              <Option type="QString" name="cap_style" value="square"/>
              <Option type="QString" name="color" value="183,72,75,255"/>
              <Option type="QString" name="horizontal_anchor_point" value="1"/>
              <Option type="QString" name="joinstyle" value="bevel"/>
              <Option type="QString" name="name" value="diamond"/>
              <Option type="QString" name="offset" value="0,0"/>
              <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="offset_unit" value="MM"/>
              <Option type="QString" name="outline_color" value="131,51,54,255"/>
              <Option type="QString" name="outline_style" value="solid"/>
              <Option type="QString" name="outline_width" value="0.2"/>
              <Option type="QString" name="outline_width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="outline_width_unit" value="MM"/>
              <Option type="QString" name="scale_method" value="diameter"/>
              <Option type="QString" name="size" value="3"/>
              <Option type="QString" name="size_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="size_unit" value="MM"/>
              <Option type="QString" name="vertical_anchor_point" value="1"/>
            </Option>
            <data_defined_properties>
              <Option type="Map">
                <Option type="QString" name="name" value=""/>
                <Option name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
            </data_defined_properties>
          </layer>
        </symbol>
      </profileMarkerSymbol>
    </elevation>
    <renderer-v2 type="singleSymbol" forceraster="0" referencescale="-1" enableorderby="0" symbollevels="0">
      <symbols>
        <symbol type="marker" frame_rate="10" name="0" is_animated="0" alpha="1" force_rhr="0" clip_to_extent="1">
          <data_defined_properties>
            <Option type="Map">
              <Option type="QString" name="name" value=""/>
              <Option name="properties"/>
              <Option type="QString" name="type" value="collection"/>
            </Option>
          </data_defined_properties>
          <layer class="SimpleMarker" locked="0" pass="0" enabled="1">
            <Option type="Map">
              <Option type="QString" name="angle" value="0"/>
              <Option type="QString" name="cap_style" value="square"/>
              <Option type="QString" name="color" value="183,72,75,255"/>
              <Option type="QString" name="horizontal_anchor_point" value="1"/>
              <Option type="QString" name="joinstyle" value="bevel"/>
              <Option type="QString" name="name" value="circle"/>
              <Option type="QString" name="offset" value="0,0"/>
              <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="offset_unit" value="MM"/>
              <Option type="QString" name="outline_color" value="35,35,35,255"/>
              <Option type="QString" name="outline_style" value="solid"/>
              <Option type="QString" name="outline_width" value="0"/>
              <Option type="QString" name="outline_width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="outline_width_unit" value="MM"/>
              <Option type="QString" name="scale_method" value="diameter"/>
              <Option type="QString" name="size" value="4"/>
              <Option type="QString" name="size_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              <Option type="QString" name="size_unit" value="MM"/>
              <Option type="QString" name="vertical_anchor_point" value="1"/>
            </Option>
            <data_defined_properties>
              <Option type="Map">
                <Option type="QString" name="name" value=""/>
                <Option name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
            </data_defined_properties>
          </layer>
        </symbol>
      </symbols>
      <rotation/>
      <sizescale/>
    </renderer-v2>
    <customproperties>
      <Option type="Map">
        <Option type="QString" name="dualview/previewExpressions" value="&quot;gid&quot;"/>
        <Option type="QString" name="embeddedWidgets/count" value="0"/>
        <Option type="invalid" name="variableNames"/>
        <Option type="invalid" name="variableValues"/>
      </Option>
    </customproperties>
    <blendMode>0</blendMode>
    <featureBlendMode>0</featureBlendMode>
    <layerOpacity>1</layerOpacity>
    <SingleCategoryDiagramRenderer diagramType="Histogram" attributeLegend="1">
      <DiagramCategory showAxis="0" backgroundAlpha="255" width="15" maxScaleDenominator="1e+08" penAlpha="255" spacingUnitScale="3x:0,0,0,0,0,0" enabled="0" spacingUnit="MM" backgroundColor="#ffffff" barWidth="5" penColor="#000000" spacing="0" rotationOffset="270" height="15" scaleBasedVisibility="0" sizeType="MM" lineSizeType="MM" minimumSize="0" labelPlacementMethod="XHeight" opacity="1" penWidth="0" scaleDependency="Area" minScaleDenominator="0" sizeScale="3x:0,0,0,0,0,0" direction="1" lineSizeScale="3x:0,0,0,0,0,0" diagramOrientation="Up">
        <fontProperties strikethrough="0" description="Ubuntu,11,-1,5,50,0,0,0,0,0" bold="0" underline="0" italic="0" style=""/>
        <attribute colorOpacity="1" field="" color="#000000" label=""/>
        <axisSymbol>
          <symbol type="line" frame_rate="10" name="" is_animated="0" alpha="1" force_rhr="0" clip_to_extent="1">
            <data_defined_properties>
              <Option type="Map">
                <Option type="QString" name="name" value=""/>
                <Option name="properties"/>
                <Option type="QString" name="type" value="collection"/>
              </Option>
            </data_defined_properties>
            <layer class="SimpleLine" locked="0" pass="0" enabled="1">
              <Option type="Map">
                <Option type="QString" name="align_dash_pattern" value="0"/>
                <Option type="QString" name="capstyle" value="square"/>
                <Option type="QString" name="customdash" value="5;2"/>
                <Option type="QString" name="customdash_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="customdash_unit" value="MM"/>
                <Option type="QString" name="dash_pattern_offset" value="0"/>
                <Option type="QString" name="dash_pattern_offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="dash_pattern_offset_unit" value="MM"/>
                <Option type="QString" name="draw_inside_polygon" value="0"/>
                <Option type="QString" name="joinstyle" value="bevel"/>
                <Option type="QString" name="line_color" value="35,35,35,255"/>
                <Option type="QString" name="line_style" value="solid"/>
                <Option type="QString" name="line_width" value="0.26"/>
                <Option type="QString" name="line_width_unit" value="MM"/>
                <Option type="QString" name="offset" value="0"/>
                <Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="offset_unit" value="MM"/>
                <Option type="QString" name="ring_filter" value="0"/>
                <Option type="QString" name="trim_distance_end" value="0"/>
                <Option type="QString" name="trim_distance_end_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="trim_distance_end_unit" value="MM"/>
                <Option type="QString" name="trim_distance_start" value="0"/>
                <Option type="QString" name="trim_distance_start_map_unit_scale" value="3x:0,0,0,0,0,0"/>
                <Option type="QString" name="trim_distance_start_unit" value="MM"/>
                <Option type="QString" name="tweak_dash_pattern_on_corners" value="0"/>
                <Option type="QString" name="use_custom_dash" value="0"/>
                <Option type="QString" name="width_map_unit_scale" value="3x:0,0,0,0,0,0"/>
              </Option>
              <data_defined_properties>
                <Option type="Map">
                  <Option type="QString" name="name" value=""/>
                  <Option name="properties"/>
                  <Option type="QString" name="type" value="collection"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </axisSymbol>
      </DiagramCategory>
    </SingleCategoryDiagramRenderer>
    <DiagramLayerSettings obstacle="0" showAll="1" linePlacementFlags="18" dist="0" zIndex="0" placement="0" priority="0">
      <properties>
        <Option type="Map">
          <Option type="QString" name="name" value=""/>
          <Option name="properties"/>
          <Option type="QString" name="type" value="collection"/>
        </Option>
      </properties>
    </DiagramLayerSettings>
    <geometryOptions geometryPrecision="0" removeDuplicateNodes="0">
      <activeChecks/>
      <checkConfiguration/>
    </geometryOptions>
    <legend type="default-vector" showLabelLegend="0"/>
    <referencedLayers/>
    <fieldConfiguration>
      <field name="gid" configurationFlags="None">
        <editWidget type="TextEdit">
          <config>
            <Option type="Map">
              <Option type="bool" name="IsMultiline" value="false"/>
              <Option type="bool" name="UseHtml" value="false"/>
            </Option>
          </config>
        </editWidget>
      </field>
      <field name="titre" configurationFlags="None">
        <editWidget type="TextEdit">
          <config>
            <Option/>
          </config>
        </editWidget>
      </field>
      <field name="test" configurationFlags="None">
        <editWidget type="ValueRelation">
          <config>
            <Option type="Map">
              <Option type="bool" name="AllowMulti" value="true"/>
              <Option type="bool" name="AllowNull" value="false"/>
              <Option type="QString" name="FilterExpression" value=""/>
              <Option type="QString" name="Key" value="code"/>
              <Option type="QString" name="Layer" value="table_for_relationnal_value_dc724c81_0004_4aec_89bf_2fa1e80fccb8"/>
              <Option type="QString" name="LayerName" value="table_for_relationnal_value"/>
              <Option type="QString" name="LayerProviderName" value="postgres"/>
              <Option type="QString" name="LayerSource" value="service=\'lizmapdb\' sslmode=disable key=\'gid\' checkPrimaryKeyUnicity=\'1\' table=&quot;tests_projects&quot;.&quot;table_for_relationnal_value&quot; sql="/>
              <Option type="int" name="NofColumns" value="1"/>
              <Option type="bool" name="OrderByValue" value="true"/>
              <Option type="bool" name="UseCompleter" value="false"/>
              <Option type="QString" name="Value" value="label"/>
            </Option>
          </config>
        </editWidget>
      </field>
      <field name="test_not_null_only" configurationFlags="None">
        <editWidget type="ValueRelation">
          <config>
            <Option type="Map">
              <Option type="bool" name="AllowMulti" value="true"/>
              <Option type="bool" name="AllowNull" value="false"/>
              <Option type="QString" name="FilterExpression" value=""/>
              <Option type="QString" name="Key" value="code"/>
              <Option type="QString" name="Layer" value="table_for_relationnal_value_dc724c81_0004_4aec_89bf_2fa1e80fccb8"/>
              <Option type="QString" name="LayerName" value="table_for_relationnal_value"/>
              <Option type="QString" name="LayerProviderName" value="postgres"/>
              <Option type="QString" name="LayerSource" value="service=\'lizmapdb\' sslmode=disable key=\'gid\' checkPrimaryKeyUnicity=\'1\' table=&quot;tests_projects&quot;.&quot;table_for_relationnal_value&quot; sql="/>
              <Option type="int" name="NofColumns" value="1"/>
              <Option type="bool" name="OrderByValue" value="true"/>
              <Option type="bool" name="UseCompleter" value="false"/>
              <Option type="QString" name="Value" value="label"/>
            </Option>
          </config>
        </editWidget>
      </field>
      <field name="test_empty_value_only" configurationFlags="None">
        <editWidget type="ValueRelation">
          <config>
            <Option type="Map">
              <Option type="bool" name="AllowMulti" value="true"/>
              <Option type="bool" name="AllowNull" value="true"/>
              <Option type="QString" name="FilterExpression" value=""/>
              <Option type="QString" name="Key" value="code"/>
              <Option type="QString" name="Layer" value="table_for_relationnal_value_dc724c81_0004_4aec_89bf_2fa1e80fccb8"/>
              <Option type="QString" name="LayerName" value="table_for_relationnal_value"/>
              <Option type="QString" name="LayerProviderName" value="postgres"/>
              <Option type="QString" name="LayerSource" value="service=\'lizmapdb\' sslmode=disable key=\'gid\' checkPrimaryKeyUnicity=\'1\' table=&quot;tests_projects&quot;.&quot;table_for_relationnal_value&quot; sql="/>
              <Option type="int" name="NofColumns" value="1"/>
              <Option type="bool" name="OrderByValue" value="true"/>
              <Option type="bool" name="UseCompleter" value="false"/>
              <Option type="QString" name="Value" value="label"/>
            </Option>
          </config>
        </editWidget>
      </field>
    </fieldConfiguration>
    <aliases>
      <alias name="" index="0" field="gid"/>
      <alias name="" index="1" field="titre"/>
      <alias name="" index="2" field="test"/>
      <alias name="Test constraint not null only" index="3" field="test_not_null_only"/>
      <alias name="Test with empty value only" index="4" field="test_empty_value_only"/>
    </aliases>
    <defaults>
      <default applyOnUpdate="0" field="gid" expression=""/>
      <default applyOnUpdate="0" field="titre" expression=""/>
      <default applyOnUpdate="0" field="test" expression=""/>
      <default applyOnUpdate="0" field="test_not_null_only" expression=""/>
      <default applyOnUpdate="0" field="test_empty_value_only" expression=""/>
    </defaults>
    <constraints>
      <constraint constraints="3" unique_strength="1" field="gid" notnull_strength="1" exp_strength="0"/>
      <constraint constraints="0" unique_strength="0" field="titre" notnull_strength="0" exp_strength="0"/>
      <constraint constraints="0" unique_strength="0" field="test" notnull_strength="0" exp_strength="0"/>
      <constraint constraints="1" unique_strength="0" field="test_not_null_only" notnull_strength="2" exp_strength="0"/>
      <constraint constraints="0" unique_strength="0" field="test_empty_value_only" notnull_strength="0" exp_strength="0"/>
    </constraints>
    <constraintExpressions>
      <constraint exp="" field="gid" desc=""/>
      <constraint exp="" field="titre" desc=""/>
      <constraint exp="" field="test" desc=""/>
      <constraint exp="" field="test_not_null_only" desc=""/>
      <constraint exp="" field="test_empty_value_only" desc=""/>
    </constraintExpressions>
    <expressionfields/>
    <attributeactions>
      <defaultAction key="Canvas" value="{00000000-0000-0000-0000-000000000000}"/>
    </attributeactions>
    <attributetableconfig actionWidgetStyle="dropDown" sortOrder="0" sortExpression="">
      <columns>
        <column type="field" name="gid" width="-1" hidden="0"/>
        <column type="field" name="titre" width="-1" hidden="0"/>
        <column type="actions" width="-1" hidden="1"/>
        <column type="field" name="test" width="-1" hidden="0"/>
        <column type="field" name="test_not_null_only" width="-1" hidden="0"/>
        <column type="field" name="test_empty_value_only" width="-1" hidden="0"/>
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
Les formulaires QGIS peuvent avoir une fonction Python qui sera appelée à l\'ouverture du formulaire.

Utilisez cette fonction pour ajouter plus de fonctionnalités à vos formulaires.

Entrez le nom de la fonction dans le champ "Fonction d\'initialisation Python".
Voici un exemple à suivre:
"""
from qgis.PyQt.QtWidgets import QWidget

def my_form_open(dialog, layer, feature):
  geom = feature.geometry()
  control = dialog.findChild(QWidget, "MyLineEdit")

]]></editforminitcode>
    <featformsuppress>0</featformsuppress>
    <editorlayout>generatedlayout</editorlayout>
    <editable>
      <field name="gid" editable="0"/>
      <field name="test" editable="1"/>
      <field name="test_empty_value_only" editable="1"/>
      <field name="test_not_null_only" editable="1"/>
      <field name="titre" editable="1"/>
      <field name="type" editable="1"/>
    </editable>
    <labelOnTop>
      <field labelOnTop="0" name="gid"/>
      <field labelOnTop="0" name="test"/>
      <field labelOnTop="0" name="test_empty_value_only"/>
      <field labelOnTop="0" name="test_not_null_only"/>
      <field labelOnTop="0" name="titre"/>
      <field labelOnTop="0" name="type"/>
    </labelOnTop>
    <reuseLastValue/>
    <dataDefinedFieldProperties/>
    <widgets/>
    <previewExpression>"gid"</previewExpression>
    <mapTip></mapTip>
  </maplayer>
        ';

        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);

        $this->assertNotNull($layer->constraints);
        $this->assertCount(5, $layer->constraints);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraint::class, $layer->constraints[3]);
        $this->assertEquals('test_not_null_only', $layer->constraints[3]->field);
        $this->assertEquals(1, $layer->constraints[3]->constraints);
        $this->assertTrue($layer->constraints[3]->notnull_strength);
        $this->assertFalse($layer->constraints[3]->unique_strength);
        $this->assertFalse($layer->constraints[3]->exp_strength);

        $layerToKeyArray = $layer->toKeyArray();
        $this->assertArrayHasKey('constraints', $layerToKeyArray);
        $this->assertArrayHasKey('test_not_null_only', $layerToKeyArray['constraints']);
        $this->assertArrayHasKey('constraints', $layerToKeyArray['constraints']['test_not_null_only']);
        $this->assertEquals(1, $layerToKeyArray['constraints']['test_not_null_only']['constraints']);
        $this->assertTrue($layerToKeyArray['constraints']['test_not_null_only']['notNull']);
        $this->assertFalse($layerToKeyArray['constraints']['test_not_null_only']['unique']);
        $this->assertFalse($layerToKeyArray['constraints']['test_not_null_only']['exp']);

        $this->assertArrayHasKey('type', $layerToKeyArray);
        $this->assertEquals('vector', $layerToKeyArray['type']);

        $this->assertArrayHasKey('id', $layerToKeyArray);
        $this->assertEquals('table_for_form_8a6a46b7_21ef_47d6_a5cd_134f6e84dace', $layerToKeyArray['id']);

        $this->assertArrayHasKey('name', $layerToKeyArray);
        $this->assertEquals('table_for_form', $layerToKeyArray['name']);

        $this->assertArrayHasKey('shortname', $layerToKeyArray);
        $this->assertEquals('table_for_form', $layerToKeyArray['shortname']);

        $this->assertArrayHasKey('title', $layerToKeyArray);
        $this->assertEquals('table_for_form', $layerToKeyArray['title']);

        $this->assertArrayHasKey('abstract', $layerToKeyArray);
        $this->assertEquals('', $layerToKeyArray['abstract']);

        $this->assertArrayHasKey('proj4', $layerToKeyArray);
        $this->assertEquals('+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', $layerToKeyArray['proj4']);

        $this->assertArrayHasKey('srid', $layerToKeyArray);
        $this->assertEquals(2154, $layerToKeyArray['srid']);

        $this->assertArrayHasKey('authid', $layerToKeyArray);
        $this->assertEquals('EPSG:2154', $layerToKeyArray['authid']);

        $this->assertArrayHasKey('datasource', $layerToKeyArray);
        $this->assertEquals("service='lizmapdb' sslmode=disable key='gid' estimatedmetadata=true srid=2154 type=Point checkPrimaryKeyUnicity='1' table=\"tests_projects\".\"table_for_form\" (geom)", $layerToKeyArray['datasource']);

        $this->assertArrayHasKey('provider', $layerToKeyArray);
        $this->assertEquals('postgres', $layerToKeyArray['provider']);

        $this->assertArrayHasKey('keywords', $layerToKeyArray);
        $this->assertCount(1, $layerToKeyArray['keywords']);
        $this->assertEquals(array(''), $layerToKeyArray['keywords']);

        $this->assertArrayHasKey('fields', $layerToKeyArray);
        $this->assertCount(5, $layerToKeyArray['fields']);
        $this->assertEquals(array('gid', 'titre', 'test', 'test_not_null_only', 'test_empty_value_only'), $layerToKeyArray['fields']);

        $this->assertArrayHasKey('aliases', $layerToKeyArray);
        $this->assertCount(5, $layerToKeyArray['aliases']);
        $this->assertEquals(
            array(
            'gid' => '',
            'titre' => '',
            'test' => '',
            'test_not_null_only' => 'Test constraint not null only',
            'test_empty_value_only' => 'Test with empty value only'
            ),
            $layerToKeyArray['aliases']);

        $this->assertArrayHasKey('defaults', $layerToKeyArray);
        $this->assertCount(5, $layerToKeyArray['defaults']);
        $this->assertEquals(
            array(
            'gid' => '',
            'titre' => '',
            'test' => '',
            'test_not_null_only' => '',
            'test_empty_value_only' => ''
            ),
            $layerToKeyArray['defaults']
        );

        $this->assertArrayHasKey('wfsFields', $layerToKeyArray);
        $this->assertCount(5, $layerToKeyArray['wfsFields']);
        $this->assertEquals(array('gid', 'titre', 'test', 'test_not_null_only', 'test_empty_value_only'), $layerToKeyArray['wfsFields']);

        $this->assertArrayHasKey('webDavFields', $layerToKeyArray);
        $this->assertCount(0, $layerToKeyArray['webDavFields']);
        $this->assertEquals(array(), $layerToKeyArray['webDavFields']);

        $this->assertArrayHasKey('webDavBaseUris', $layerToKeyArray);
        $this->assertCount(0, $layerToKeyArray['webDavBaseUris']);
        $this->assertEquals(array(), $layerToKeyArray['webDavBaseUris']);
    }

    public function testToKeyArrayConstraintExpressions(): void
    {
        $xmlStr = '
  <maplayer autoRefreshEnabled="0" autoRefreshTime="0" geometry="Point" hasScaleBasedVisibilityFlag="0" labelsEnabled="0" legendPlaceholderImage="" maxScale="0" minScale="100000000" readOnly="0" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" simplifyAlgorithm="0" simplifyDrawingHints="0" simplifyDrawingTol="1" simplifyLocal="0" simplifyMaxScale="1" styleCategories="AllStyleCategories" symbologyReferenceScale="-1" type="vector" wkbType="Point">
    <id>form_advanced_point_0805ae82_fa78_4e67_a0cf_4ff25c4728b5</id>
    <datasource>service=\'lizmapdb\' sslmode=disable key=\'id\' estimatedmetadata=true srid=2154 type=Point checkPrimaryKeyUnicity=\'1\' table="tests_projects"."form_advanced_point" (geom)</datasource>
    <shortname>form_advanced_point</shortname>
    <keywordList>
      <value></value>
    </keywordList>
    <layername>form_advanced_point</layername>
    <srs>
      <spatialrefsys nativeFormat="Wkt">
        <wkt>PROJCRS["RGF93 v1 / Lambert-93",BASEGEOGCRS["RGF93 v1",DATUM["Reseau Geodesique Francais 1993 v1",ELLIPSOID["GRS 1980",6378137,298.257222101,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],ID["EPSG",4171]],CONVERSION["Lambert-93",METHOD["Lambert Conic Conformal (2SP)",ID["EPSG",9802]],PARAMETER["Latitude of false origin",46.5,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8821]],PARAMETER["Longitude of false origin",3,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8822]],PARAMETER["Latitude of 1st standard parallel",49,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8823]],PARAMETER["Latitude of 2nd standard parallel",44,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8824]],PARAMETER["Easting at false origin",700000,LENGTHUNIT["metre",1],ID["EPSG",8826]],PARAMETER["Northing at false origin",6600000,LENGTHUNIT["metre",1],ID["EPSG",8827]]],CS[Cartesian,2],AXIS["easting (X)",east,ORDER[1],LENGTHUNIT["metre",1]],AXIS["northing (Y)",north,ORDER[2],LENGTHUNIT["metre",1]],USAGE[SCOPE["Engineering survey, topographic mapping."],AREA["France - onshore and offshore, mainland and Corsica."],BBOX[41.15,-9.86,51.56,10.38]],ID["EPSG",2154]]</wkt>
        <proj4>+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs</proj4>
        <srsid>145</srsid>
        <srid>2154</srid>
        <authid>EPSG:2154</authid>
        <description>RGF93 v1 / Lambert-93</description>
        <projectionacronym>lcc</projectionacronym>
        <ellipsoidacronym>EPSG:7019</ellipsoidacronym>
        <geographicflag>false</geographicflag>
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
      <links></links>
      <fees></fees>
      <encoding></encoding>
      <crs>
        <spatialrefsys nativeFormat="Wkt">
          <wkt>PROJCRS["RGF93 v1 / Lambert-93",BASEGEOGCRS["RGF93 v1",DATUM["Reseau Geodesique Francais 1993 v1",ELLIPSOID["GRS 1980",6378137,298.257222101,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],ID["EPSG",4171]],CONVERSION["Lambert-93",METHOD["Lambert Conic Conformal (2SP)",ID["EPSG",9802]],PARAMETER["Latitude of false origin",46.5,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8821]],PARAMETER["Longitude of false origin",3,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8822]],PARAMETER["Latitude of 1st standard parallel",49,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8823]],PARAMETER["Latitude of 2nd standard parallel",44,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8824]],PARAMETER["Easting at false origin",700000,LENGTHUNIT["metre",1],ID["EPSG",8826]],PARAMETER["Northing at false origin",6600000,LENGTHUNIT["metre",1],ID["EPSG",8827]]],CS[Cartesian,2],AXIS["easting (X)",east,ORDER[1],LENGTHUNIT["metre",1]],AXIS["northing (Y)",north,ORDER[2],LENGTHUNIT["metre",1]],USAGE[SCOPE["Engineering survey, topographic mapping."],AREA["France - onshore and offshore, mainland and Corsica."],BBOX[41.15,-9.86,51.56,10.38]],ID["EPSG",2154]]</wkt>
          <proj4>+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs</proj4>
          <srsid>145</srsid>
          <srid>2154</srid>
          <authid>EPSG:2154</authid>
          <description>RGF93 v1 / Lambert-93</description>
          <projectionacronym>lcc</projectionacronym>
          <ellipsoidacronym>EPSG:7019</ellipsoidacronym>
          <geographicflag>false</geographicflag>
        </spatialrefsys>
      </crs>
      <extent>
        <spatial crs="EPSG:2154" dimensions="2" maxx="0" maxy="0" maxz="0" minx="0" miny="0" minz="0"></spatial>
        <temporal>
          <period>
            <start></start>
            <end></end>
          </period>
        </temporal>
      </extent>
    </resourceMetadata>
    <provider encoding="">postgres</provider>
    <vectorjoins></vectorjoins>
    <layerDependencies></layerDependencies>
    <dataDependencies></dataDependencies>
    <expressionfields></expressionfields>
    <map-layer-style-manager current="défaut">
      <map-layer-style name="défaut"></map-layer-style>
    </map-layer-style-manager>
    <auxiliaryLayer></auxiliaryLayer>
    <metadataUrls></metadataUrls>
    <flags>
      <Identifiable>1</Identifiable>
      <Removable>1</Removable>
      <Searchable>1</Searchable>
      <Private>0</Private>
    </flags>
    <temporal accumulate="0" durationField="" durationUnit="min" enabled="0" endExpression="" endField="" fixedDuration="0" limitMode="0" mode="0" startExpression="" startField="">
      <fixedRange>
        <start></start>
        <end></end>
      </fixedRange>
    </temporal>
    <elevation binding="Centroid" clamping="Terrain" extrusion="0" extrusionEnabled="0" respectLayerSymbol="1" showMarkerSymbolInSurfacePlots="0" symbology="Line" type="IndividualFeatures" zoffset="0" zscale="1">
      <data-defined-properties>
        <Option type="Map">
          <Option name="name" type="QString" value=""></Option>
          <Option name="properties"></Option>
          <Option name="type" type="QString" value="collection"></Option>
        </Option>
      </data-defined-properties>
      <profileLineSymbol>
        <symbol alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0" name="" type="line">
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" type="QString" value=""></Option>
              <Option name="properties"></Option>
              <Option name="type" type="QString" value="collection"></Option>
            </Option>
          </data_defined_properties>
          <layer class="SimpleLine" enabled="1" locked="0" pass="0">
            <Option type="Map">
              <Option name="align_dash_pattern" type="QString" value="0"></Option>
              <Option name="capstyle" type="QString" value="square"></Option>
              <Option name="customdash" type="QString" value="5;2"></Option>
              <Option name="customdash_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="customdash_unit" type="QString" value="MM"></Option>
              <Option name="dash_pattern_offset" type="QString" value="0"></Option>
              <Option name="dash_pattern_offset_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="dash_pattern_offset_unit" type="QString" value="MM"></Option>
              <Option name="draw_inside_polygon" type="QString" value="0"></Option>
              <Option name="joinstyle" type="QString" value="bevel"></Option>
              <Option name="line_color" type="QString" value="190,207,80,255"></Option>
              <Option name="line_style" type="QString" value="solid"></Option>
              <Option name="line_width" type="QString" value="0.6"></Option>
              <Option name="line_width_unit" type="QString" value="MM"></Option>
              <Option name="offset" type="QString" value="0"></Option>
              <Option name="offset_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="offset_unit" type="QString" value="MM"></Option>
              <Option name="ring_filter" type="QString" value="0"></Option>
              <Option name="trim_distance_end" type="QString" value="0"></Option>
              <Option name="trim_distance_end_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="trim_distance_end_unit" type="QString" value="MM"></Option>
              <Option name="trim_distance_start" type="QString" value="0"></Option>
              <Option name="trim_distance_start_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="trim_distance_start_unit" type="QString" value="MM"></Option>
              <Option name="tweak_dash_pattern_on_corners" type="QString" value="0"></Option>
              <Option name="use_custom_dash" type="QString" value="0"></Option>
              <Option name="width_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
            </Option>
            <data_defined_properties>
              <Option type="Map">
                <Option name="name" type="QString" value=""></Option>
                <Option name="properties"></Option>
                <Option name="type" type="QString" value="collection"></Option>
              </Option>
            </data_defined_properties>
          </layer>
        </symbol>
      </profileLineSymbol>
      <profileFillSymbol>
        <symbol alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0" name="" type="fill">
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" type="QString" value=""></Option>
              <Option name="properties"></Option>
              <Option name="type" type="QString" value="collection"></Option>
            </Option>
          </data_defined_properties>
          <layer class="SimpleFill" enabled="1" locked="0" pass="0">
            <Option type="Map">
              <Option name="border_width_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="color" type="QString" value="190,207,80,255"></Option>
              <Option name="joinstyle" type="QString" value="bevel"></Option>
              <Option name="offset" type="QString" value="0,0"></Option>
              <Option name="offset_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="offset_unit" type="QString" value="MM"></Option>
              <Option name="outline_color" type="QString" value="136,148,57,255"></Option>
              <Option name="outline_style" type="QString" value="solid"></Option>
              <Option name="outline_width" type="QString" value="0.2"></Option>
              <Option name="outline_width_unit" type="QString" value="MM"></Option>
              <Option name="style" type="QString" value="solid"></Option>
            </Option>
            <data_defined_properties>
              <Option type="Map">
                <Option name="name" type="QString" value=""></Option>
                <Option name="properties"></Option>
                <Option name="type" type="QString" value="collection"></Option>
              </Option>
            </data_defined_properties>
          </layer>
        </symbol>
      </profileFillSymbol>
      <profileMarkerSymbol>
        <symbol alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0" name="" type="marker">
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" type="QString" value=""></Option>
              <Option name="properties"></Option>
              <Option name="type" type="QString" value="collection"></Option>
            </Option>
          </data_defined_properties>
          <layer class="SimpleMarker" enabled="1" locked="0" pass="0">
            <Option type="Map">
              <Option name="angle" type="QString" value="0"></Option>
              <Option name="cap_style" type="QString" value="square"></Option>
              <Option name="color" type="QString" value="190,207,80,255"></Option>
              <Option name="horizontal_anchor_point" type="QString" value="1"></Option>
              <Option name="joinstyle" type="QString" value="bevel"></Option>
              <Option name="name" type="QString" value="diamond"></Option>
              <Option name="offset" type="QString" value="0,0"></Option>
              <Option name="offset_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="offset_unit" type="QString" value="MM"></Option>
              <Option name="outline_color" type="QString" value="136,148,57,255"></Option>
              <Option name="outline_style" type="QString" value="solid"></Option>
              <Option name="outline_width" type="QString" value="0.2"></Option>
              <Option name="outline_width_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="outline_width_unit" type="QString" value="MM"></Option>
              <Option name="scale_method" type="QString" value="diameter"></Option>
              <Option name="size" type="QString" value="3"></Option>
              <Option name="size_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="size_unit" type="QString" value="MM"></Option>
              <Option name="vertical_anchor_point" type="QString" value="1"></Option>
            </Option>
            <data_defined_properties>
              <Option type="Map">
                <Option name="name" type="QString" value=""></Option>
                <Option name="properties"></Option>
                <Option name="type" type="QString" value="collection"></Option>
              </Option>
            </data_defined_properties>
          </layer>
        </symbol>
      </profileMarkerSymbol>
    </elevation>
    <renderer-v2 enableorderby="0" forceraster="0" referencescale="-1" symbollevels="0" type="singleSymbol">
      <symbols>
        <symbol alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0" name="0" type="marker">
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" type="QString" value=""></Option>
              <Option name="properties"></Option>
              <Option name="type" type="QString" value="collection"></Option>
            </Option>
          </data_defined_properties>
          <layer class="SimpleMarker" enabled="1" locked="0" pass="0">
            <Option type="Map">
              <Option name="angle" type="QString" value="0"></Option>
              <Option name="cap_style" type="QString" value="square"></Option>
              <Option name="color" type="QString" value="26,2,243,255"></Option>
              <Option name="horizontal_anchor_point" type="QString" value="1"></Option>
              <Option name="joinstyle" type="QString" value="bevel"></Option>
              <Option name="name" type="QString" value="circle"></Option>
              <Option name="offset" type="QString" value="0,0"></Option>
              <Option name="offset_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="offset_unit" type="QString" value="MM"></Option>
              <Option name="outline_color" type="QString" value="35,35,35,255"></Option>
              <Option name="outline_style" type="QString" value="solid"></Option>
              <Option name="outline_width" type="QString" value="0"></Option>
              <Option name="outline_width_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="outline_width_unit" type="QString" value="MM"></Option>
              <Option name="scale_method" type="QString" value="diameter"></Option>
              <Option name="size" type="QString" value="3"></Option>
              <Option name="size_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              <Option name="size_unit" type="QString" value="MM"></Option>
              <Option name="vertical_anchor_point" type="QString" value="1"></Option>
            </Option>
            <data_defined_properties>
              <Option type="Map">
                <Option name="name" type="QString" value=""></Option>
                <Option name="properties"></Option>
                <Option name="type" type="QString" value="collection"></Option>
              </Option>
            </data_defined_properties>
          </layer>
        </symbol>
      </symbols>
      <rotation></rotation>
      <sizescale></sizescale>
    </renderer-v2>
    <customproperties>
      <Option type="Map">
        <Option name="dualview/previewExpressions" type="QString" value="&quot;id&quot;"></Option>
        <Option name="embeddedWidgets/count" type="QString" value="0"></Option>
        <Option name="variableNames"></Option>
        <Option name="variableValues"></Option>
      </Option>
    </customproperties>
    <blendMode>0</blendMode>
    <featureBlendMode>0</featureBlendMode>
    <layerOpacity>1</layerOpacity>
    <SingleCategoryDiagramRenderer attributeLegend="1" diagramType="Histogram">
      <DiagramCategory backgroundAlpha="255" backgroundColor="#ffffff" barWidth="5" diagramOrientation="Up" direction="0" enabled="0" height="15" labelPlacementMethod="XHeight" lineSizeScale="3x:0,0,0,0,0,0" lineSizeType="MM" maxScaleDenominator="1e+08" minScaleDenominator="0" minimumSize="0" opacity="1" penAlpha="255" penColor="#000000" penWidth="0" rotationOffset="270" scaleBasedVisibility="0" scaleDependency="Area" showAxis="1" sizeScale="3x:0,0,0,0,0,0" sizeType="MM" spacing="5" spacingUnit="MM" spacingUnitScale="3x:0,0,0,0,0,0" width="15">
        <fontProperties bold="0" description="Ubuntu,11,-1,5,50,0,0,0,0,0" italic="0" strikethrough="0" style="" underline="0"></fontProperties>
        <attribute color="#000000" colorOpacity="1" field="" label=""></attribute>
        <axisSymbol>
          <symbol alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0" name="" type="line">
            <data_defined_properties>
              <Option type="Map">
                <Option name="name" type="QString" value=""></Option>
                <Option name="properties"></Option>
                <Option name="type" type="QString" value="collection"></Option>
              </Option>
            </data_defined_properties>
            <layer class="SimpleLine" enabled="1" locked="0" pass="0">
              <Option type="Map">
                <Option name="align_dash_pattern" type="QString" value="0"></Option>
                <Option name="capstyle" type="QString" value="square"></Option>
                <Option name="customdash" type="QString" value="5;2"></Option>
                <Option name="customdash_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
                <Option name="customdash_unit" type="QString" value="MM"></Option>
                <Option name="dash_pattern_offset" type="QString" value="0"></Option>
                <Option name="dash_pattern_offset_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
                <Option name="dash_pattern_offset_unit" type="QString" value="MM"></Option>
                <Option name="draw_inside_polygon" type="QString" value="0"></Option>
                <Option name="joinstyle" type="QString" value="bevel"></Option>
                <Option name="line_color" type="QString" value="35,35,35,255"></Option>
                <Option name="line_style" type="QString" value="solid"></Option>
                <Option name="line_width" type="QString" value="0.26"></Option>
                <Option name="line_width_unit" type="QString" value="MM"></Option>
                <Option name="offset" type="QString" value="0"></Option>
                <Option name="offset_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
                <Option name="offset_unit" type="QString" value="MM"></Option>
                <Option name="ring_filter" type="QString" value="0"></Option>
                <Option name="trim_distance_end" type="QString" value="0"></Option>
                <Option name="trim_distance_end_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
                <Option name="trim_distance_end_unit" type="QString" value="MM"></Option>
                <Option name="trim_distance_start" type="QString" value="0"></Option>
                <Option name="trim_distance_start_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
                <Option name="trim_distance_start_unit" type="QString" value="MM"></Option>
                <Option name="tweak_dash_pattern_on_corners" type="QString" value="0"></Option>
                <Option name="use_custom_dash" type="QString" value="0"></Option>
                <Option name="width_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
              </Option>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" type="QString" value=""></Option>
                  <Option name="properties"></Option>
                  <Option name="type" type="QString" value="collection"></Option>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </axisSymbol>
      </DiagramCategory>
    </SingleCategoryDiagramRenderer>
    <DiagramLayerSettings dist="0" linePlacementFlags="18" obstacle="0" placement="0" priority="0" showAll="1" zIndex="0">
      <properties>
        <Option type="Map">
          <Option name="name" type="QString" value=""></Option>
          <Option name="properties"></Option>
          <Option name="type" type="QString" value="collection"></Option>
        </Option>
      </properties>
    </DiagramLayerSettings>
    <geometryOptions geometryPrecision="0" removeDuplicateNodes="0">
      <activeChecks></activeChecks>
      <checkConfiguration></checkConfiguration>
    </geometryOptions>
    <legend showLabelLegend="0" type="default-vector"></legend>
    <referencedLayers></referencedLayers>
    <fieldConfiguration>
      <field configurationFlags="None" name="id">
        <editWidget type="TextEdit">
          <config>
            <Option type="Map">
              <Option name="IsMultiline" type="bool" value="false"></Option>
              <Option name="UseHtml" type="bool" value="false"></Option>
            </Option>
          </config>
        </editWidget>
      </field>
      <field configurationFlags="None" name="has_photo">
        <editWidget type="CheckBox">
          <config>
            <Option type="Map">
              <Option name="CheckedState" type="QString" value=""></Option>
              <Option name="TextDisplayMethod" type="int" value="1"></Option>
              <Option name="UncheckedState" type="QString" value=""></Option>
            </Option>
          </config>
        </editWidget>
      </field>
      <field configurationFlags="None" name="website">
        <editWidget type="TextEdit">
          <config>
            <Option type="Map">
              <Option name="IsMultiline" type="bool" value="false"></Option>
              <Option name="UseHtml" type="bool" value="false"></Option>
            </Option>
          </config>
        </editWidget>
      </field>
      <field configurationFlags="None" name="quartier">
        <editWidget type="ValueRelation">
          <config>
            <Option type="Map">
              <Option name="AllowMulti" type="bool" value="false"></Option>
              <Option name="AllowNull" type="bool" value="false"></Option>
              <Option name="Description" type="QString" value=""></Option>
              <Option name="FilterExpression" type="QString" value="intersects($geometry, transform(@current_geometry,\'EPSG:2154\',\'EPSG:4326\'))"></Option>
              <Option name="Key" type="QString" value="quartmno"></Option>
              <Option name="Layer" type="QString" value="quartiers_9948ccbd_d390_4324_b2e2_e5bd0ebddcb7"></Option>
              <Option name="LayerName" type="QString" value="quartiers"></Option>
              <Option name="LayerProviderName" type="QString" value="postgres"></Option>
              <Option name="LayerSource" type="QString" value="service=\'lizmapdb\' sslmode=disable key=\'quartier\' estimatedmetadata=true srid=4326 type=MultiPolygon checkPrimaryKeyUnicity=\'1\' table=&quot;tests_projects&quot;.&quot;quartiers&quot; (geom)"></Option>
              <Option name="NofColumns" type="int" value="1"></Option>
              <Option name="OrderByValue" type="bool" value="false"></Option>
              <Option name="UseCompleter" type="bool" value="false"></Option>
              <Option name="Value" type="QString" value="libquart"></Option>
            </Option>
          </config>
        </editWidget>
      </field>
      <field configurationFlags="None" name="sousquartier">
        <editWidget type="ValueRelation">
          <config>
            <Option type="Map">
              <Option name="AllowMulti" type="bool" value="false"></Option>
              <Option name="AllowNull" type="bool" value="false"></Option>
              <Option name="Description" type="QString" value=""></Option>
              <Option name="FilterExpression" type="QString" value="&quot;quartmno&quot; =  current_value(\'quartier\')"></Option>
              <Option name="Key" type="QString" value="squartmno"></Option>
              <Option name="Layer" type="QString" value="sousquartiers_e1ffdafd_f1e3_4e62_a6ac_fcd717175021"></Option>
              <Option name="LayerName" type="QString" value="sousquartiers"></Option>
              <Option name="LayerProviderName" type="QString" value="postgres"></Option>
              <Option name="LayerSource" type="QString" value="service=\'lizmapdb\' sslmode=disable key=\'id\' estimatedmetadata=true srid=2154 type=MultiPolygon checkPrimaryKeyUnicity=\'1\' table=&quot;tests_projects&quot;.&quot;sousquartiers&quot; (geom)"></Option>
              <Option name="NofColumns" type="int" value="1"></Option>
              <Option name="OrderByValue" type="bool" value="false"></Option>
              <Option name="UseCompleter" type="bool" value="false"></Option>
              <Option name="Value" type="QString" value="libsquart"></Option>
            </Option>
          </config>
        </editWidget>
      </field>
    </fieldConfiguration>
    <aliases>
      <alias field="id" index="0" name=""></alias>
      <alias field="has_photo" index="1" name=""></alias>
      <alias field="website" index="2" name=""></alias>
      <alias field="quartier" index="3" name=""></alias>
      <alias field="sousquartier" index="4" name=""></alias>
    </aliases>
    <defaults>
      <default applyOnUpdate="0" expression="" field="id"></default>
      <default applyOnUpdate="0" expression="" field="has_photo"></default>
      <default applyOnUpdate="0" expression="" field="website"></default>
      <default applyOnUpdate="0" expression="" field="quartier"></default>
      <default applyOnUpdate="0" expression="" field="sousquartier"></default>
    </defaults>
    <constraints>
      <constraint constraints="3" exp_strength="0" field="id" notnull_strength="1" unique_strength="1"></constraint>
      <constraint constraints="0" exp_strength="0" field="has_photo" notnull_strength="0" unique_strength="0"></constraint>
      <constraint constraints="4" exp_strength="1" field="website" notnull_strength="0" unique_strength="0"></constraint>
      <constraint constraints="0" exp_strength="0" field="quartier" notnull_strength="0" unique_strength="0"></constraint>
      <constraint constraints="0" exp_strength="0" field="sousquartier" notnull_strength="0" unique_strength="0"></constraint>
    </constraints>
    <constraintExpressions>
      <constraint desc="" exp="" field="id"></constraint>
      <constraint desc="" exp="" field="has_photo"></constraint>
      <constraint desc="Web site URL must start with \'http\'" exp="left( &quot;website&quot;, 4) = \'http\'" field="website"></constraint>
      <constraint desc="" exp="" field="quartier"></constraint>
      <constraint desc="" exp="" field="sousquartier"></constraint>
    </constraintExpressions>
    <expressionfields></expressionfields>
    <attributeactions>
      <defaultAction key="Canvas" value="{00000000-0000-0000-0000-000000000000}"></defaultAction>
    </attributeactions>
    <attributetableconfig actionWidgetStyle="dropDown" sortExpression="" sortOrder="0">
      <columns>
        <column hidden="0" name="id" type="field" width="-1"></column>
        <column hidden="0" name="has_photo" type="field" width="-1"></column>
        <column hidden="1" type="actions" width="-1"></column>
        <column hidden="0" name="website" type="field" width="-1"></column>
        <column hidden="0" name="quartier" type="field" width="-1"></column>
        <column hidden="0" name="sousquartier" type="field" width="-1"></column>
      </columns>
    </attributetableconfig>
    <conditionalstyles>
      <rowstyles></rowstyles>
      <fieldstyles></fieldstyles>
    </conditionalstyles>
    <storedexpressions></storedexpressions>
    <editform tolerant="1"></editform>
    <editforminit></editforminit>
    <editforminitcodesource>0</editforminitcodesource>
    <editforminitfilepath></editforminitfilepath>
    <editforminitcode># -*- coding: utf-8 -*-
"""
Les formulaires QGIS peuvent avoir une fonction Python qui sera appelée à l\'ouverture du formulaire.

Utilisez cette fonction pour ajouter plus de fonctionnalités à vos formulaires.

Entrez le nom de la fonction dans le champ "Fonction d\'initialisation Python".
Voici un exemple à suivre:
"""
from qgis.PyQt.QtWidgets import QWidget

def my_form_open(dialog, layer, feature):
geom = feature.geometry()
control = dialog.findChild(QWidget, "MyLineEdit")

</editforminitcode>
    <featformsuppress>0</featformsuppress>
    <editorlayout>tablayout</editorlayout>
    <attributeEditorForm>
      <labelStyle labelColor="0,0,0,255" overrideLabelColor="0" overrideLabelFont="0">
        <labelFont bold="0" description="Sans Serif,9,-1,5,50,0,0,0,0,0" italic="0" strikethrough="0" style="" underline="0"></labelFont>
      </labelStyle>
      <attributeEditorContainer collapsed="0" collapsedExpression="" collapsedExpressionEnabled="0" columnCount="1" groupBox="0" name="main" showLabel="1" visibilityExpression="" visibilityExpressionEnabled="0">
        <labelStyle labelColor="0,0,0,255" overrideLabelColor="0" overrideLabelFont="0">
          <labelFont bold="0" description="Sans Serif,9,-1,5,50,0,0,0,0,0" italic="0" strikethrough="0" style="" underline="0"></labelFont>
        </labelStyle>
        <attributeEditorField index="0" name="id" showLabel="1">
          <labelStyle labelColor="0,0,0,255" overrideLabelColor="0" overrideLabelFont="0">
            <labelFont bold="0" description="Sans Serif,9,-1,5,50,0,0,0,0,0" italic="0" strikethrough="0" style="" underline="0"></labelFont>
          </labelStyle>
        </attributeEditorField>
        <attributeEditorField index="1" name="has_photo" showLabel="1">
          <labelStyle labelColor="0,0,0,255" overrideLabelColor="0" overrideLabelFont="0">
            <labelFont bold="0" description="Sans Serif,9,-1,5,50,0,0,0,0,0" italic="0" strikethrough="0" style="" underline="0"></labelFont>
          </labelStyle>
        </attributeEditorField>
        <attributeEditorField index="2" name="website" showLabel="1">
          <labelStyle labelColor="0,0,0,255" overrideLabelColor="0" overrideLabelFont="0">
            <labelFont bold="0" description="Sans Serif,9,-1,5,50,0,0,0,0,0" italic="0" strikethrough="0" style="" underline="0"></labelFont>
          </labelStyle>
        </attributeEditorField>
        <attributeEditorField index="3" name="quartier" showLabel="1">
          <labelStyle labelColor="0,0,0,255" overrideLabelColor="0" overrideLabelFont="0">
            <labelFont bold="0" description="Sans Serif,9,-1,5,50,0,0,0,0,0" italic="0" strikethrough="0" style="" underline="0"></labelFont>
          </labelStyle>
        </attributeEditorField>
        <attributeEditorField index="4" name="sousquartier" showLabel="1">
          <labelStyle labelColor="0,0,0,255" overrideLabelColor="0" overrideLabelFont="0">
            <labelFont bold="0" description="Sans Serif,9,-1,5,50,0,0,0,0,0" italic="0" strikethrough="0" style="" underline="0"></labelFont>
          </labelStyle>
        </attributeEditorField>
      </attributeEditorContainer>
      <attributeEditorContainer collapsed="0" collapsedExpression="" collapsedExpressionEnabled="0" columnCount="1" groupBox="0" name="photo" showLabel="1" visibilityExpression=" &quot;has_photo&quot; = true OR &quot;has_photo&quot; = \'t\'" visibilityExpressionEnabled="1">
        <labelStyle labelColor="0,0,0,255" overrideLabelColor="0" overrideLabelFont="0">
          <labelFont bold="0" description="Sans Serif,9,-1,5,50,0,0,0,0,0" italic="0" strikethrough="0" style="" underline="0"></labelFont>
        </labelStyle>
      </attributeEditorContainer>
    </attributeEditorForm>
    <editable>
      <field editable="1" name="has_photo"></field>
      <field editable="1" name="id"></field>
      <field editable="1" name="quartier"></field>
      <field editable="1" name="sousquartier"></field>
      <field editable="1" name="website"></field>
    </editable>
    <labelOnTop>
      <field labelOnTop="0" name="has_photo"></field>
      <field labelOnTop="0" name="id"></field>
      <field labelOnTop="0" name="quartier"></field>
      <field labelOnTop="0" name="sousquartier"></field>
      <field labelOnTop="0" name="website"></field>
    </labelOnTop>
    <reuseLastValue></reuseLastValue>
    <dataDefinedFieldProperties></dataDefinedFieldProperties>
    <widgets></widgets>
    <previewExpression>"id"</previewExpression>
    <mapTip></mapTip>
  </maplayer>
        ';

        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);

        $this->assertNotNull($layer->constraints);
        $this->assertCount(5, $layer->constraints);

        $this->assertNotNull($layer->constraintExpressions);
        $this->assertCount(5, $layer->constraintExpressions);

        $this->assertInstanceOf(Qgis\Layer\VectorLayerConstraintExpression::class, $layer->constraintExpressions[2]);
        $this->assertEquals('website', $layer->constraintExpressions[2]->field);
        $this->assertEquals('left( "website", 4) = \'http\'', $layer->constraintExpressions[2]->exp);
        $this->assertEquals('Web site URL must start with \'http\'', $layer->constraintExpressions[2]->desc);

        $layerToKeyArray = $layer->toKeyArray();
        $this->assertArrayHasKey('constraints', $layerToKeyArray);
        $this->assertArrayHasKey('website', $layerToKeyArray['constraints']);
        $this->assertArrayHasKey('constraints', $layerToKeyArray['constraints']['website']);
        $this->assertEquals(4, $layerToKeyArray['constraints']['website']['constraints']);
        $this->assertFalse($layerToKeyArray['constraints']['website']['notNull']);
        $this->assertFalse($layerToKeyArray['constraints']['website']['unique']);
        $this->assertTrue($layerToKeyArray['constraints']['website']['exp']);
        $this->assertEquals('left( "website", 4) = \'http\'', $layerToKeyArray['constraints']['website']['exp_value']);
        $this->assertEquals('Web site URL must start with \'http\'', $layerToKeyArray['constraints']['website']['exp_desc']);
    }
}
