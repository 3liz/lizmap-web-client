<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class ParserTest extends TestCase
{
    public function testReadVersion(): void
    {
        $xml_path = __DIR__.'/../../Project/Ressources/montpellier.qgs';
        // Open the document with XML Reader at the root element document
        $oXml = App\XmlTools::xmlReaderFromFile($xml_path);
        $this->assertEquals(XMLReader::ELEMENT, $oXml->nodeType);
        $this->assertEquals(0, $oXml->depth);
        $this->assertEquals('qgis', $oXml->localName);
        $this->assertEquals('3.10.5-A Coruña', $oXml->getAttribute('version'));
    }

    public function testReadAttributes(): void
    {
        $xmlStr = '
        <excludeAttributesWFS>
          <attribute>OGC_FID</attribute>
          <attribute>wkt</attribute>
          <attribute>from</attribute>
          <attribute>html</attribute>
          <attribute>to</attribute>
          <attribute>colour</attribute>
        </excludeAttributesWFS>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $values = Qgis\Parser::readAttributes($oXml);
        $this->assertTrue(is_array($values));
        $this->assertCount(6, $values);
        $expected = array(
            'OGC_FID',
            'wkt',
            'from',
            'html',
            'to',
            'colour',
        );
        $this->assertEquals($expected, $values);
    }

    public function testReadItems(): void
    {
        $xmlStr = '
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
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $values = Qgis\Parser::readItems($oXml);
        $this->assertTrue(is_array($values));
        $this->assertCount(13, $values);
        $this->assertEquals('edition_point20130118171631518', $values[0]);
        $this->assertEquals('VilleMTP_MTP_Quartiers_2011_432620130116112610876', $values[5]);
        $this->assertEquals('VilleMTP_MTP_Quartiers_2011_432620130116112351546', $values[6]);
        $this->assertEquals('osm_mapnik20180315181738526', $values[12]);
    }

    public function testReadValues(): void
    {
        $xmlStr = '
        <WMSCrsList type="QStringList">
          <value>EPSG:2154</value>
          <value>EPSG:4326</value>
          <value>EPSG:3857</value>
        </WMSCrsList>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $values = Qgis\Parser::readValues($oXml);
        $this->assertTrue(is_array($values));
        $this->assertCount(3, $values);
        $expected = array(
            'EPSG:2154',
            'EPSG:4326',
            'EPSG:3857',
        );
        $this->assertEquals($expected, $values);
    }

    public function testReadOption(): void
    {
        $xmlStr = '
              <Option type="Map">
                <Option value="A" type="QString" name="Zone A"/>
              </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Qgis\Parser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $this->assertCount(1, $options);
        $expectedOptions = array(
            'Zone A' => 'A',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
          <Option type="Map">
            <Option value="0" type="QString" name="IsMultiline"/>
            <Option value="0" type="QString" name="UseHtml"/>
          </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Qgis\Parser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $this->assertCount(2, $options);
        $expectedOptions = array(
            'IsMultiline' => '0',
            'UseHtml' => '0',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
          <Option type="Map">
            <Option value="0" type="int" name="IsMultiline"/>
            <Option value="0" type="int" name="UseHtml"/>
          </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Qgis\Parser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $this->assertCount(2, $options);
        $expectedOptions = array(
            'IsMultiline' => 0,
            'UseHtml' => 0,
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
              <Option type="Map">
                <Option value="false" type="bool" name="IsMultiline"/>
                <Option value="false" type="bool" name="UseHtml"/>
              </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Qgis\Parser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $this->assertCount(2, $options);
        $expectedOptions = array(
            'IsMultiline' => false,
            'UseHtml' => false,
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
          <Option type="Map">
            <Option name="AllowNull" type="bool" value="true"></Option>
            <Option name="Max" type="int" value="2147483647"></Option>
            <Option name="Min" type="int" value="-2147483648"></Option>
            <Option name="Precision" type="int" value="0"></Option>
            <Option name="Step" type="int" value="1"></Option>
            <Option name="Style" type="QString" value="SpinBox"></Option>
          </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Qgis\Parser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $expectedOptions = array(
            'AllowNull' => true,
            'Max' => 2147483647,
            'Min' => -2147483648,
            'Precision' => 0,
            'Step' => 1,
            'Style' => 'SpinBox',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
           <Option type="Map">
           <Option type="List" name="map">
             <Option type="Map">
               <Option value="A" type="QString" name="Zone A"/>
             </Option>
             <Option type="Map">
               <Option value="B" type="QString" name="Zone B"/>
             </Option>
             <Option type="Map">
               <Option value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}" type="QString" name="No Zone"/>
             </Option>
           </Option>
           </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);

        $options = Qgis\Parser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $expectedOptions = array(
            'map' => array(
                'A' => 'Zone A',
                'B' => 'Zone B',
                '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => 'No Zone',
            ),
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
           <Option type="StringList">
               <Option type="QString" value="Zone A"></Option>
               <Option type="QString" value="Zone B"></Option>
               <Option type="QString" value="No Zone"></Option>
           </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->assertEquals('StringList', $oXml->getAttribute('type'));

        $options = Qgis\Parser::readOption($oXml);
        $this->assertTrue(is_array($options));
        $expectedOptions = array(
                'Zone A',
                'Zone B',
                'No Zone',
        );
        $this->assertEquals($expectedOptions, $options);

        $xmlStr = '
        <Option type="Map">
          <Option value="1" name="DocumentViewer" type="int"/>
          <Option value="0" name="DocumentViewerHeight" type="int"/>
          <Option value="0" name="DocumentViewerWidth" type="int"/>
          <Option value="true" name="FileWidget" type="bool"/>
          <Option value="true" name="FileWidgetButton" type="bool"/>
          <Option value="" name="FileWidgetFilter" type="QString"/>
          <Option name="PropertyCollection" type="Map">
            <Option value="" name="name" type="QString"/>
            <Option name="properties" type="Map">
              <Option name="storageUrl" type="Map">
                <Option value="true" name="active" type="bool"/>
                <Option value="\'http://webdav/shapeData/\'||file_name(@selected_file_path)" name="expression" type="QString"/>
                <Option value="3" name="type" type="int"/>
              </Option>
            </Option>
            <Option value="collection" name="type" type="QString"/>
          </Option>
          <Option value="0" name="RelativeStorage" type="int"/>
          <Option value="k6k7lv8" name="StorageAuthConfigId" type="QString"/>
          <Option value="0" name="StorageMode" type="int"/>
          <Option value="WebDAV" name="StorageType" type="QString"/>
        </Option>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->assertEquals('Map', $oXml->getAttribute('type'));

        $options = Qgis\Parser::readOption($oXml);

        $this->assertTrue(is_array($options));
        $expectedOptions = array(
                'DocumentViewer' => 1,
                'DocumentViewerHeight' => 0,
                'DocumentViewerWidth' => 0,
                'FileWidget' => true,
                'FileWidgetButton' => true,
                'FileWidgetFilter' => '',
                'PropertyCollection' => array(
                  'name' => '',
                  'properties' => array(
                    'storageUrl' => array (
                      'active' => true,
                      'expression' => '\'http://webdav/shapeData/\'||file_name(@selected_file_path)',
                      'type' => 3,
                    ),
                  ),
                  'type' => 'collection',
                ),
                'RelativeStorage' => 0,
                'StorageAuthConfigId' => 'k6k7lv8',
                'StorageMode' => 0,
                'StorageType' => 'WebDAV',
        );
        $this->assertEquals($expectedOptions, $options);
    }

    public function testReadCustomProperties(): void
    {
        $xmlStr = '
        <customproperties>
          <Option type="Map">
            <Option type="QString" name="wmsShortName" value="Buildings"/>
          </Option>
        </customproperties>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->assertEquals('customproperties', $oXml->localName);

        $customProperties = Qgis\Parser::readCustomProperties($oXml);
        $this->assertCount(1, $customProperties);
        $expectedCustomProperties = array(
          'wmsShortName' => 'Buildings',
        );
        $this->assertEquals($expectedCustomProperties, $customProperties);

        $xmlStr = '
        <customproperties>
          <Option type="Map">
            <Option name="expandedLegendNodes"/>
          </Option>
        </customproperties>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->assertEquals('customproperties', $oXml->localName);

        $customProperties = Qgis\Parser::readCustomProperties($oXml);
        $this->assertCount(1, $customProperties);
        $expectedCustomProperties = array(
          'expandedLegendNodes' => null,
        );
        $this->assertEquals($expectedCustomProperties, $customProperties);

        $xmlStr = '
        <customproperties>
          <Option type="Map">
            <Option name="expandedLegendNodes"/>
            <Option type="QString" name="showFeatureCount" value="1"/>
          </Option>
        </customproperties>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->assertEquals('customproperties', $oXml->localName);

        $customProperties = Qgis\Parser::readCustomProperties($oXml);
        $this->assertCount(2, $customProperties);
        $expectedCustomProperties = array(
          'expandedLegendNodes' => null,
          'showFeatureCount' => '1',
        );
        $this->assertEquals($expectedCustomProperties, $customProperties);

        $xmlStr = '
        <customproperties>
          <Option/>
        </customproperties>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->assertEquals('customproperties', $oXml->localName);

        $customProperties = Qgis\Parser::readCustomProperties($oXml);
        $this->assertCount(0, $customProperties);
        $expectedCustomProperties = array(
        );
        $this->assertEquals($expectedCustomProperties, $customProperties);
    }

}
