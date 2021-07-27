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

    function testXmlFromString() {
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

    function testXmlFromFile() {
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
}
