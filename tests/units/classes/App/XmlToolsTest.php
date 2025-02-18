<?php

use PHPUnit\Framework\TestCase;
use Lizmap\App;

class XmlToolsTest extends TestCase
{

    public function arrayToXml(array $array, SimpleXMLElement &$xml)
    {
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                if (array_keys($value) !== range(0, count($value) - 1)) {
                    $subnode = $xml->addChild($key);
                    $this->arrayToXml($value, $subnode);
                } else {
                    foreach ($value as $val) {
                        $xml->addChild($key, $val);
                    }
                }
            } else {
                $xml->addChild($key, $value);
            }
        }
    }

    function testXmlFromString(): void {
        $data = array(
            'properties' => array(
                'WMSServiceTitle' => 'title',
                'WMSServiceAbstract' => 'abstract',
                'WMSKeywordList' => array(
                    'value' => array('key', 'word', 'WMS'),
                ),
                'WMSExtent' => array(
                    'value' => array('42', '24', '21', '12'),
                ),
                'WMSOnlineResource' => 'ressource',
                'WMSContactMail' => 'test.mail@3liz.org',
                'WMSContactOrganization' => '3liz',
                'WMSContactPerson' => 'marvin',
                'WMSContactPhone' => '',
            ),
        );
        $qgis = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $qgis);
        $xml_str = $qgis->asXML();

        $xml = App\XmlTools::xmlFromString($xml_str);
        $this->assertTrue(!is_string($xml));
        $this->assertTrue(is_object($xml));
        $this->assertEquals($xml_str, $xml->asXML());

        $xml_str_invalid = str_replace('</qgis>', '', $xml_str);
        $this->assertNotEquals($xml_str, $xml_str_invalid);

        $xml = App\XmlTools::xmlFromString($xml_str_invalid);
        $this->assertTrue(!is_object($xml));
        $this->assertTrue(is_string($xml));
        $this->assertStringStartsNotWith('\n', $xml);
        $this->assertStringContainsString('Fatal', $xml);
    }

    function testXmlFromFile(): void {
        $xml_path = __DIR__.'/../Project/Ressources/WMSInfotest.qgs';

        $xml = App\XmlTools::xmlFromFile($xml_path);
        $this->assertTrue(!is_string($xml));
        $this->assertTrue(is_object($xml));
        $this->assertEquals($xml->getName(), 'qgis');

        $xml_path_invalid = __DIR__.'/../Project/Ressources/WMSInfotest_invalid.qgs';

        $xml = App\XmlTools::xmlFromFile($xml_path_invalid);
        $this->assertTrue(!is_object($xml));
        $this->assertTrue(is_string($xml));
        $this->assertStringStartsNotWith('\n', $xml);
        $this->assertStringContainsString('Fatal', $xml);
    }

    function testXmlReaderFromString(): void {
        $data = array(
            'properties' => array(
                'WMSServiceTitle' => 'title',
                'WMSServiceAbstract' => 'abstract',
                'WMSKeywordList' => array(
                    'value' => array('key', 'word', 'WMS'),
                ),
                'WMSExtent' => array(
                    'value' => array('42', '24', '21', '12'),
                ),
                'WMSOnlineResource' => 'ressource',
                'WMSContactMail' => 'test.mail@3liz.org',
                'WMSContactOrganization' => '3liz',
                'WMSContactPerson' => 'marvin',
                'WMSContactPhone' => '',
            ),
        );
        $qgis = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $qgis);
        $xml_str = $qgis->asXML();

        $xml = App\XmlTools::xmlReaderFromString($xml_str);
        $this->assertTrue(is_object($xml));
        $this->assertEquals($xml_str, '<?xml version="1.0"?>'."\n".$xml->readOuterXml()."\n");
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('qgis', $xml->localName);
        $this->assertEquals(0, $xml->depth);

        // first child element
        $xml->read();
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('properties', $xml->localName);
        $this->assertEquals(1, $xml->depth);

        // Go to next sibling
        $xml->next();
        // No sibling we are at the end of the parent element
        $this->assertEquals(\XMLReader::END_ELEMENT, $xml->nodeType);
        $this->assertEquals('qgis', $xml->localName);
        $this->assertEquals(0, $xml->depth);

        // Removing the closing root element does not invalidate xml string
        // for XML Reader
        $xml_str_invalid = str_replace('</qgis>', '', $xml_str);
        $this->assertNotEquals($xml_str, $xml_str_invalid);

        $xml = App\XmlTools::xmlReaderFromString($xml_str_invalid);
        $this->assertTrue(is_object($xml));
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('qgis', $xml->localName);

        // The validate parser option must be enabled for
        // this method to work properly
        $xml->setParserProperty(\XMLReader::VALIDATE, true);
        $this->assertTrue($xml->isValid());

        // first child element
        $xml->read();
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('properties', $xml->localName);
        $this->assertEquals(1, $xml->depth);

        // Go to next sibling
        $xml->next();
        // No sibling we should be at the end of the parent element
        // But the XML is invalid here
        $this->assertFalse($xml->isValid());
        // And we are some where else
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('WMSContactPerson', $xml->localName);
        $this->assertEquals(2, $xml->depth);
    }

    function testXmlReaderFromStringException(): void {
        $this->expectExceptionMessage('Fatal Error 5: Line: 1 Column: 7 Extra content at the end of the document');
        App\XmlTools::xmlReaderFromString('<qgis>');
    }

    function testXmlReaderFromFile(): void {
        $xml_path = __DIR__.'/../Project/Ressources/WMSInfotest.qgs';

        // Open the document with XML Reader at the root element document
        $xml = App\XmlTools::xmlReaderFromFile($xml_path);
        $this->assertTrue(is_object($xml));
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('qgis', $xml->localName);
        $this->assertEquals(0, $xml->depth);

        // next element
        $xml->read();
        $this->assertEquals(\XMLReader::SIGNIFICANT_WHITESPACE, $xml->nodeType);
        // next element
        $xml->read();
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('homePath', $xml->localName);
        $this->assertEquals(1, $xml->depth);

        // Go to next sibling
        $xml->next();
        $this->assertEquals(\XMLReader::SIGNIFICANT_WHITESPACE, $xml->nodeType);
        // Go to next sibling
        $xml->next();
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('title', $xml->localName);
        $this->assertEquals(1, $xml->depth);

        $xml_path_invalid = __DIR__.'/../Project/Ressources/WMSInfotest_invalid.qgs';

        // Open the document with XML Reader at the root element document
        $xml = App\XmlTools::xmlReaderFromFile($xml_path_invalid);
        $this->assertTrue(is_object($xml));
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('qgis', $xml->localName);
        $this->assertEquals(0, $xml->depth);

        // The validate parser option must be enabled for
        // this method to work properly
        $xml->setParserProperty(\XMLReader::VALIDATE, true);
        $this->assertTrue($xml->isValid());

        // next element
        $xml->read();
        $this->assertEquals(\XMLReader::SIGNIFICANT_WHITESPACE, $xml->nodeType);
        // next element
        $xml->read();
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('homePath', $xml->localName);
        $this->assertEquals(1, $xml->depth);

        // Go to next sibling
        $xml->next();
        $this->assertEquals(\XMLReader::SIGNIFICANT_WHITESPACE, $xml->nodeType);
        // Go to next sibling
        $xml->next();
        $this->assertEquals(\XMLReader::ELEMENT, $xml->nodeType);
        $this->assertEquals('title', $xml->localName);
        $this->assertEquals(1, $xml->depth);
    }
}
