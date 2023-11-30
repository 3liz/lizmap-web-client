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
    public function testGetFormControls()
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
    }
}
