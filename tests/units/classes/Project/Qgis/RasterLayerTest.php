<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class RasterLayerTest extends TestCase
{
    public function testFromXmlReader(): void
    {
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

        $this->assertNotNull($layer->pipe);
        $pipe = $layer->pipe;
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
    <maplayer autoRefreshEnabled="0" autoRefreshTime="0" hasScaleBasedVisibilityFlag="0" legendPlaceholderImage="" maxScale="0" minScale="1e+08" refreshOnNotifyEnabled="0" refreshOnNotifyMessage="" styleCategories="AllStyleCategories" type="raster">
      <extent>
        <xmin>3.84850000000000003</xmin>
        <ymin>43.57310000000000372</ymin>
        <xmax>4.02449999999999974</xmax>
        <ymax>43.62810000000000343</ymax>
      </extent>
      <wgs84extent>
        <xmin>3.84850000000000003</xmin>
        <ymin>43.57310000000000372</ymin>
        <xmax>4.02450000000000152</xmax>
        <ymax>43.62809999999999633</ymax>
      </wgs84extent>
      <id>raster_78572dfa_41b3_42da_a9c6_933ead8bad8f</id>
      <datasource>./media/raster.asc</datasource>
      <shortname>local_raster</shortname>
      <keywordList>
        <value></value>
      </keywordList>
      <layername>local_raster_layer</layername>
      <srs>
        <spatialrefsys nativeFormat="Wkt">
          <wkt>GEOGCRS["WGS 84 (CRS84)",ENSEMBLE["World Geodetic System 1984 ensemble",MEMBER["World Geodetic System 1984 (Transit)"],MEMBER["World Geodetic System 1984 (G730)"],MEMBER["World Geodetic System 1984 (G873)"],MEMBER["World Geodetic System 1984 (G1150)"],MEMBER["World Geodetic System 1984 (G1674)"],MEMBER["World Geodetic System 1984 (G1762)"],MEMBER["World Geodetic System 1984 (G2139)"],ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]],ENSEMBLEACCURACY[2.0]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["geodetic longitude (Lon)",east,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["geodetic latitude (Lat)",north,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],USAGE[SCOPE["Not known."],AREA["World."],BBOX[-90,-180,90,180]],ID["OGC","CRS84"]]</wkt>
          <proj4>+proj=longlat +datum=WGS84 +no_defs</proj4>
          <srsid>63159</srsid>
          <srid>520003159</srid>
          <authid>OGC:CRS84</authid>
          <description>WGS 84 (CRS84)</description>
          <projectionacronym>longlat</projectionacronym>
          <ellipsoidacronym>EPSG:7030</ellipsoidacronym>
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
        <links></links>
        <fees></fees>
        <encoding></encoding>
        <crs>
          <spatialrefsys nativeFormat="Wkt">
            <wkt></wkt>
            <proj4></proj4>
            <srsid>0</srsid>
            <srid>0</srid>
            <authid></authid>
            <description></description>
            <projectionacronym></projectionacronym>
            <ellipsoidacronym></ellipsoidacronym>
            <geographicflag>false</geographicflag>
          </spatialrefsys>
        </crs>
        <extent></extent>
      </resourceMetadata>
      <provider>gdal</provider>
      <noData>
        <noDataList bandNo="1" useSrcNoData="1"></noDataList>
      </noData>
      <map-layer-style-manager current="default">
        <map-layer-style name="default"></map-layer-style>
      </map-layer-style-manager>
      <metadataUrls></metadataUrls>
      <flags>
        <Identifiable>1</Identifiable>
        <Removable>1</Removable>
        <Searchable>1</Searchable>
        <Private>0</Private>
      </flags>
      <temporal enabled="0" fetchMode="0" mode="0">
        <fixedRange>
          <start></start>
          <end></end>
        </fixedRange>
      </temporal>
      <elevation band="1" enabled="0" symbology="Line" zoffset="0" zscale="1">
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
                <Option name="line_color" type="QString" value="232,113,141,255"></Option>
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
                <Option name="color" type="QString" value="232,113,141,255"></Option>
                <Option name="joinstyle" type="QString" value="bevel"></Option>
                <Option name="offset" type="QString" value="0,0"></Option>
                <Option name="offset_map_unit_scale" type="QString" value="3x:0,0,0,0,0,0"></Option>
                <Option name="offset_unit" type="QString" value="MM"></Option>
                <Option name="outline_color" type="QString" value="35,35,35,255"></Option>
                <Option name="outline_style" type="QString" value="no"></Option>
                <Option name="outline_width" type="QString" value="0.26"></Option>
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
      </elevation>
      <customproperties>
        <Option type="Map">
          <Option name="identify/format" type="QString" value="Value"></Option>
        </Option>
      </customproperties>
      <pipe-data-defined-properties>
        <Option type="Map">
          <Option name="name" type="QString" value=""></Option>
          <Option name="properties"></Option>
          <Option name="type" type="QString" value="collection"></Option>
        </Option>
      </pipe-data-defined-properties>
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
      <blendMode>0</blendMode>
    </maplayer>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $layer = Qgis\Layer\MapLayer::fromXmlReader($oXml);
        $this->assertFalse($layer->embedded);
        $this->assertInstanceOf(Qgis\Layer\RasterLayer::class, $layer);

        $data = array(
            'id' => 'raster_78572dfa_41b3_42da_a9c6_933ead8bad8f',
            'embedded' => false,
            'type' => 'raster',
            'layername' => 'local_raster_layer',
            //'srs',
            'datasource' => './media/raster.asc',
            'provider' => 'gdal',
            'shortname' => 'local_raster',
            'title' => null,
            'abstract' => null,
            'keywordList' => array(''),
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $layer->$prop, $prop);
        }

        $this->assertNotNull($layer->srs);
        $data = array(
            'proj4' => '+proj=longlat +datum=WGS84 +no_defs',
            'srid' => 520003159,
            'authid' => 'OGC:CRS84',
            'description' => 'WGS 84 (CRS84)',
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $layer->srs->$prop, $prop);
        }

        $this->assertNotNull($layer->styleManager);
        $data = array(
          'current' => 'default',
          'styles' => array('default'),
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $layer->styleManager->$prop, $prop);
        }

        $keyData = $layer->toKeyArray();
        $this->assertTrue(is_array($keyData));
        $data = array(
            'type' => 'raster',
            'id' => 'raster_78572dfa_41b3_42da_a9c6_933ead8bad8f',
            'name' => 'local_raster_layer',
            'shortname' => 'local_raster',
            'title' => 'local_raster_layer',
            'abstract' => '',
            'proj4' => '+proj=longlat +datum=WGS84 +no_defs',
            'srid' => 520003159,
            'authid' => 'OGC:CRS84',
            'datasource' => './media/raster.asc',
            'provider' => 'gdal',
            'keywords' => array(''),
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $keyData[$prop], $prop);
        }

        $this->assertNotNull($layer->pipe);
        $pipe = $layer->pipe;
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
