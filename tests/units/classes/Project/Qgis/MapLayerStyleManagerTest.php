<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class MapLayerStyleManagerTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        // Simple default
        $xmlStr = '
        <map-layer-style-manager current="default">
          <map-layer-style name="default"/>
        </map-layer-style-manager>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $manager = Qgis\Layer\MapLayerStyleManager::fromXmlReader($oXml);

        $data = array(
            'current' => 'default',
            'styles' => array('default'),
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $manager->$prop, $prop);
        }


        $xmlStr = '
        <map-layer-style-manager current="black">
          <map-layer-style name="black"/>
          <map-layer-style name="colored"/>
          <map-layer-style name="other"/>
        </map-layer-style-manager>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $manager = Qgis\Layer\MapLayerStyleManager::fromXmlReader($oXml);

        $data = array(
            'current' => 'black',
            'styles' => array(
                'black',
                'colored',
                'other',
            ),
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $manager->$prop, $prop);
        }

        $xmlStr = '
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
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $manager = Qgis\Layer\MapLayerStyleManager::fromXmlReader($oXml);

        $data = array(
            'current' => 'black',
            'styles' => array(
                'black',
                'colored',
            ),
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $manager->$prop, $prop);
        }
    }
}
