<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class RasterLayerPipeTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        $xmlStr = '
      <pipe>
        <provider>
          <resampling enabled="false" maxOversampling="2" zoomedInResamplingMethod="nearestNeighbour" zoomedOutResamplingMethod="nearestNeighbour"/>
        </provider>
        <rasterrenderer nodataColor="" type="singlebandcolordata" alphaBand="-1" band="1" opacity="1">
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
        <brightnesscontrast brightness="0" gamma="1" contrast="0"/>
        <huesaturation grayscaleMode="0" colorizeRed="255" saturation="0" invertColors="0" colorizeStrength="100" colorizeBlue="128" colorizeOn="0" colorizeGreen="128"/>
        <rasterresampler maxOversampling="2"/>
        <resamplingStage>resamplingFilter</resamplingStage>
      </pipe>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $pipe = Qgis\Layer\RasterLayerPipe::fromXmlReader($oXml);

        $this->assertInstanceOf(Qgis\Layer\RasterLayerPipe::class, $pipe);

        $this->assertNotNull($pipe->renderer);
        $this->assertEquals('singlebandcolordata', $pipe->renderer->type);
        $this->assertEquals(1, $pipe->renderer->opacity);

        $this->assertNotNull($pipe->hueSaturation);
        $this->assertEquals(0, $pipe->hueSaturation->saturation);
        $this->assertEquals(0, $pipe->hueSaturation->grayscaleMode);
        $this->assertFalse($pipe->hueSaturation->invertColors);
        $this->assertFalse($pipe->hueSaturation->colorizeOn);
        $this->assertEquals(255, $pipe->hueSaturation->colorizeRed);
        $this->assertEquals(128, $pipe->hueSaturation->colorizeGreen);
        $this->assertEquals(128, $pipe->hueSaturation->colorizeBlue);
        $this->assertEquals(100, $pipe->hueSaturation->colorizeStrength);

        $xmlStr = '
      <pipe>
        <provider>
          <resampling enabled="false" maxOversampling="2" zoomedInResamplingMethod="nearestNeighbour" zoomedOutResamplingMethod="nearestNeighbour"></resampling>
        </provider>
        <rasterrenderer alphaBand="-1" gradient="BlackToWhite" grayBand="1" nodataColor="" opacity="0.6835" type="singlebandgray">
          <rasterTransparency></rasterTransparency>
          <minMaxOrigin>
            <limits>MinMax</limits>
            <extent>WholeRaster</extent>
            <statAccuracy>Estimated</statAccuracy>
            <cumulativeCutLower>0.02</cumulativeCutLower>
            <cumulativeCutUpper>0.98</cumulativeCutUpper>
            <stdDevFactor>2</stdDevFactor>
          </minMaxOrigin>
          <contrastEnhancement>
            <minValue>50</minValue>
            <maxValue>125</maxValue>
            <algorithm>StretchToMinimumMaximum</algorithm>
          </contrastEnhancement>
          <rampLegendSettings direction="0" maximumLabel="" minimumLabel="" orientation="2" prefix="" suffix="" useContinuousLegend="1">
            <numericFormat id="basic">
              <Option type="Map">
                <Option name="decimal_separator" type="invalid"></Option>
                <Option name="decimals" type="int" value="6"></Option>
                <Option name="rounding_type" type="int" value="0"></Option>
                <Option name="show_plus" type="bool" value="false"></Option>
                <Option name="show_thousand_separator" type="bool" value="true"></Option>
                <Option name="show_trailing_zeros" type="bool" value="false"></Option>
                <Option name="thousand_separator" type="invalid"></Option>
              </Option>
            </numericFormat>
          </rampLegendSettings>
        </rasterrenderer>
        <brightnesscontrast brightness="0" contrast="0" gamma="1"></brightnesscontrast>
        <huesaturation colorizeBlue="128" colorizeGreen="128" colorizeOn="0" colorizeRed="255" colorizeStrength="100" grayscaleMode="0" invertColors="0" saturation="0"></huesaturation>
        <rasterresampler maxOversampling="2"></rasterresampler>
        <resamplingStage>resamplingFilter</resamplingStage>
      </pipe>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $pipe = Qgis\Layer\RasterLayerPipe::fromXmlReader($oXml);

        $this->assertInstanceOf(Qgis\Layer\RasterLayerPipe::class, $pipe);

        $this->assertNotNull($pipe->renderer);
        $this->assertEquals('singlebandgray', $pipe->renderer->type);
        $this->assertEquals(0.6835, $pipe->renderer->opacity);

        $this->assertNotNull($pipe->hueSaturation);
        $this->assertEquals(0, $pipe->hueSaturation->saturation);
        $this->assertEquals(0, $pipe->hueSaturation->grayscaleMode);
        $this->assertFalse($pipe->hueSaturation->invertColors);
        $this->assertFalse($pipe->hueSaturation->colorizeOn);
        $this->assertEquals(255, $pipe->hueSaturation->colorizeRed);
        $this->assertEquals(128, $pipe->hueSaturation->colorizeGreen);
        $this->assertEquals(128, $pipe->hueSaturation->colorizeBlue);
        $this->assertEquals(100, $pipe->hueSaturation->colorizeStrength);
    }
}
