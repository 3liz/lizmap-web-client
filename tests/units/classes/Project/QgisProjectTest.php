<?php

require('qgisProjectForTests.php');

use Lizmap\Project;
use PHPUnit\Framework\TestCase;

class QgisProjectTest extends TestCase
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

    public function testReadWMSInfo()
    {
        $data = array(
            'mapcanvas' => array(
                'destinationsrs' => array('spatialrefsys' => array('authid' => 'CRS4242'))
            ),
            'properties' => array(
                'WMSServiceTitle' => 'title',
                'WMSServiceAbstract' => 'abstract',
                'WMSKeywordList' => array(
                    'value' => array('key', 'word', 'WMS')
                ),
                'WMSExtent' => array(
                    'value' => array('42', '24', '21', '12')
                ),
                'WMSOnlineResource' => 'ressource',
                'WMSContactMail' => 'test.mail@3liz.org',
                'WMSContactOrganization' => '3liz',
                'WMSContactPerson' => 'marvin',
                'WMSContactPhone' => '',
            ),
        );
        $expectedWMS = array(
            'WMSServiceTitle' => 'title',
            'WMSServiceAbstract' => 'abstract',
            'WMSKeywordList' => 'key, word, WMS',
            'WMSExtent' => '42, 24, 21, 12',
            'ProjectCrs' => 'CRS4242',
            'WMSOnlineResource' => 'ressource',
            'WMSContactMail' => 'test.mail@3liz.org',
            'WMSContactOrganization' => '3liz',
            'WMSContactPerson' => 'marvin',
            'WMSContactPhone' => '',
        );
        $xml = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $xml);
        $testQgis = new qgisProjectForTests();
        $this->assertEquals($expectedWMS, $testQgis->readWMSInfoTest($xml));
    }

    public function testReadCanvasColor()
    {
        $data = array(
            'properties' => array(
                'Gui' => array(
                    'CanvasColorGreenPart' => '21',
                    'CanvasColorRedPart' => '42',
                    'CanvasColorBluePart' => '84',
                )
            )
        );
        $xml = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $xml);
        $testQgis = new qgisProjectForTests();
        $this->assertEquals('rgb(42,21,84)', $testQgis->readCanvasColorTest($xml));
    }

    public function testReadAllProj4()
    {
        $data = array(
            array('spatialrefsys' => array(
                'authid' => 'CRS1',
                'proj4' =>'1'
            )),
            array('spatialrefsys' => array(
                'authid' => 'CRS2',
                'proj4' =>'2'
            )),
            array('spatialrefsys' => array(
                'authid' => 'CRS3',
                'proj4' =>'3'
            )),
            array('spatialrefsys' => array(
                'authid' => 'CRS4',
                'proj4' =>'4'
            )),
        );
        $expectedProj4 = array(
            'CRS1' => '1',
            'CRS2' => '2',
            'CRS3' => '3',
            'CRS4' => '4',
        );
        $xml = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $xml);
        $testQgis = new qgisProjectForTests();
        $this->assertEquals($expectedProj4, $testQgis->readAllProj4Test($xml));
    }

    public function testReadUseLayersIDs()
    {
        $data = array(
            'properties' => array(
                'WMSUseLayerIDs' => 'false'
            )
        );
        $xml = new SimpleXMLElement('<qgis></qgis>');
        $this->arrayToXml($data, $xml);
        $testQgis = new qgisProjectForTests();
        $this->assertFalse($testQgis->readUseLayersIDsTest($xml));
    }
}
