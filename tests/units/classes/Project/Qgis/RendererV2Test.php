<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class RendererV2Test extends TestCase
{
    public function testFromXmlReader(): void
    {
        // singleSymbol
        $xmlStr = '
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
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $renderer = Qgis\Layer\RendererV2::fromXmlReader($oXml);

        $this->assertEquals($renderer->type, 'singleSymbol');
        $this->assertCount(0, $renderer->categories);


        // categorizedSymbol
        $xmlStr = '
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
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $renderer = Qgis\Layer\RendererV2::fromXmlReader($oXml);

        $this->assertEquals($renderer->type, 'categorizedSymbol');
        $this->assertCount(4, $renderer->categories);

        $data = array(
            '1' => '1',
            '2' => '2',
            '3' => '3',
            '4' => '4',
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $renderer->categories[$prop], $value);
        }
    }
}
