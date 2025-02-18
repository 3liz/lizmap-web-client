<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class ProjectPropertiesTest extends TestCase
{
    public function testConstruct(): void
    {
        $data = array(
            'WMSServiceTitle' => 'Montpellier - Transports',
            'WMSServiceAbstract' => 'Demo project with bus and tramway lines in Montpellier, France.
Data is licensed under ODbl, OpenStreetMap contributors',
            'WMSKeywordList' => array(''),
            'WMSExtent' => array('417006.61373760335845873', '5394910.34090302512049675', '447158.04891100589884445', '5414844.99480544030666351'),
            'WMSOnlineResource' => 'http://www.3liz.com/lizmap.html',
            'WMSContactMail' => 'info@3liz.com',
            'WMSContactOrganization' => '3liz',
            'WMSContactPerson' => '3liz',
            'WMSContactPhone' => '+334 67 16 64 51',
            'WMSRestrictedComposers' => array('Composeur1'),
            'WMSRestrictedLayers' => array(),
            'WMSUseLayerIDs' => false,
        );

        $properties = new Qgis\ProjectProperties($data);
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $properties->$prop);
        }
        $this->assertNull($properties->Variables);
        $this->assertNull($properties->Gui);
    }

    public function testFromXmlReader(): void
    {
        $xmlStr = '
        <properties>
          <Gui>
            <CanvasColorBluePart type="int">255</CanvasColorBluePart>
            <CanvasColorGreenPart type="int">255</CanvasColorGreenPart>
            <CanvasColorRedPart type="int">255</CanvasColorRedPart>
            <SelectionColorAlphaPart type="int">255</SelectionColorAlphaPart>
            <SelectionColorBluePart type="int">0</SelectionColorBluePart>
            <SelectionColorGreenPart type="int">255</SelectionColorGreenPart>
            <SelectionColorRedPart type="int">255</SelectionColorRedPart>
          </Gui>
          <Variables>
            <variableNames type="QStringList"/>
            <variableValues type="QStringList"/>
          </Variables>
          <WMSContactMail type="QString">info@3liz.com</WMSContactMail>
          <WMSContactOrganization type="QString">3liz</WMSContactOrganization>
          <WMSContactPerson type="QString">3liz</WMSContactPerson>
          <WMSContactPhone type="QString">+334 67 16 64 51</WMSContactPhone>
          <WMSContactPosition type="QString"></WMSContactPosition>
          <WMSExtent type="QStringList">
            <value>417006.61373760335845873</value>
            <value>5394910.34090302512049675</value>
            <value>447158.04891100589884445</value>
            <value>5414844.99480544030666351</value>
          </WMSExtent>
          <WMSKeywordList type="QStringList">
            <value></value>
          </WMSKeywordList>
          <WMSOnlineResource type="QString">http://www.3liz.com/lizmap.html</WMSOnlineResource>
          <WMSRestrictedComposers type="QStringList">
            <value>Composeur1</value>
          </WMSRestrictedComposers>
          <WMSRestrictedLayers type="QStringList"/>
          <WMSServiceAbstract type="QString">Demo project with bus and tramway lines in Montpellier, France.
Data is licensed under ODbl, OpenStreetMap contributors</WMSServiceAbstract>
          <WMSServiceCapabilities type="bool">true</WMSServiceCapabilities>
          <WMSServiceTitle type="QString">Montpellier - Transports</WMSServiceTitle>
          <WMSUseLayerIDs type="bool">false</WMSUseLayerIDs>
          <WMSAddWktGeometry type="bool">true</WMSAddWktGeometry>
        </properties>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $properties = Qgis\ProjectProperties::fromXmlReader($oXml);

        $data = array(
            'WMSServiceTitle' => 'Montpellier - Transports',
            'WMSServiceAbstract' => 'Demo project with bus and tramway lines in Montpellier, France.
Data is licensed under ODbl, OpenStreetMap contributors',
            'WMSKeywordList' => array(''),
            'WMSExtent' => array('417006.61373760335845873', '5394910.34090302512049675', '447158.04891100589884445', '5414844.99480544030666351'),
            'WMSOnlineResource' => 'http://www.3liz.com/lizmap.html',
            'WMSContactMail' => 'info@3liz.com',
            'WMSContactOrganization' => '3liz',
            'WMSContactPerson' => '3liz',
            'WMSContactPhone' => '+334 67 16 64 51',
            'WMSRestrictedComposers' => array('Composeur1'),
            'WMSRestrictedLayers' => array(),
            'WFSLayers' => null,
            'WMSUseLayerIDs' => false,
            'WMSAddWktGeometry' => true,
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $properties->$prop, $prop);
        }

        $this->assertNotNull($properties->Variables);
        $data = array(
            'variableNames' => array(),
            'variableValues' => array(),
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $properties->Variables->$prop, $prop);
        }

        $this->assertNotNull($properties->Gui);
        $data = array(
          'CanvasColorBluePart' => 255,
          'CanvasColorGreenPart' => 255,
          'CanvasColorRedPart' => 255,
          'SelectionColorAlphaPart' => 255,
          'SelectionColorBluePart' => 0,
          'SelectionColorGreenPart' => 255,
          'SelectionColorRedPart' => 255,
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $properties->Gui->$prop, $prop);
        }
    }
}
