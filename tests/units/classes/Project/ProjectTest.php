<?php

require('ProjectForTests.php');

use PHPUnit\Framework\TestCase;
use Lizmap\Project;

class ProjectTest extends TestCase
{
    protected $qgis_default;

    public function setUp()
    {
        $data = array(
            'WMSInformation' => array(),
            'xml' => new SimpleXMLElement('<root></root>'),
            'layers' => array(),
        );
        $this->qgis_default = new Project\QgisProject(__FILE__, new lizmapServices(null, null, false, '', ''), $data);
    }

    public function testReadProject()
    {
        $props = array(
            'repository' => 'key',
            'id' => 'test',
            'title' => 'Test',
            'abstract' => '',
            'proj' => 'EPSG:4242',
            'bbox' => '42.42, 21.21, 20.2, 48.84'
        );
        $rep = new lizmapRepository('key', array(), null, null, null);
        $proj = new ProjectForTests();
        $cfg = json_decode(file_get_contents(__DIR__.'/Ressources/readProject.qgs.cfg'));
        $config = new Project\ProjectConfig('', array('cfgContent' => $cfg, 'options' => $cfg->options));
        $proj->setCfg($config);
        $proj->setQgis($this->qgis_default);
        $proj->readProjectForTest('test', $rep);
        foreach ($props as $prop => $expectedValue) {
            $this->assertEquals($expectedValue, $proj->getData($prop));
        }
    }

    public function getQgisPathData()
    {
        return array(
            array('/srv/lzm/tests/qgis-projects/demoqgis', 'montpellier', '/srv/lzm/tests/qgis-projects/demoqgis/montpellier.qgs'),
            array('/srv/lzm/tests/qgis-projects/notexisting', 'montpellier', false),
            array(__DIR__.'/../false', 'montpellier', false),
        );
    }

    /**
     * @dataProvider getQgisPathData
     */
    public function testGetQgisPath($repPath, $key, $expectedPath)
    {
        $rep = new lizmapRepository($key, array('path' => $repPath), null, null, null);
        $proj = new ProjectForTests();
        $proj->setRepo($rep);
        $proj->setKey($key);
        $this->assertEquals($expectedPath, $proj->getQgisPath());
    }

    public function getRelativeQgisPathData()
    {
        return array(
            array('', null, '/srv/lzm/absolute/path', '/srv/lzm/absolute/path'),
            array('1', '/srv/lzm/repo/root/path', '/srv/lzm/repo/root/path/project.qgs', 'project.qgs'),
            array('1', '/srv/lzm/repo/root/path', '/srv/lzm/not/the/same/project.qgs', '/srv/lzm/not/the/same/project.qgs'),
        );
    }

    /**
     * @dataProvider getRelativeQgisPathData
     */
    public function testGetRelativeQgisPath($relative, $root, $file, $expectedPath)
    {
        $services = new lizmapServices(array('services' => array('relativeWMSPath' => $relative, 'rootRepositories' => $root)), null, false, null, null);
        $proj = new ProjectForTests();
        $proj->setRepo(new lizmapRepository(null, array('path' => ''), null, null, null));
        $proj->setServices($services);
        $proj->setFile($file);
        $path = $proj->getRelativeQgisPath();
        $this->assertEquals($expectedPath, $path);
    }

    public function getAttributeLayersData()
    {
        $aLayer1 = (object)array(
            'layer1' => (object)array('hideLayer' => 'true'),
            'layer2' => (object)array('hideLayer' => 'true'),
            'layer3' => (object)array('hideLayer' => 'true'),
        );
        $aLayer2 = (object)array(
            'layer1' => (object)array('hideLayer' => 'false'),
            'layer2' => (object)array('hideLayer' => 'false'),
            'layer3' => (object)array('hideLayer' => 'false'),
        );
        $aLayer3 = (object)array(
            'layer1' => (object)array('UnknownProp' => ''),
            'layer2' => (object)array('UnknownProp' => ''),
            'layer3' => (object)array('UnknownProp' => ''),
        );
        return array(
            array(true, $aLayer1, false),
            array(false, $aLayer1, true),
            array(true, $aLayer2, true),
            array(false, $aLayer2, true),
            array(true, $aLayer3, true),
            array(false, $aLayer3, true),
            array(false, (object)array(), false),
            array(true, (object)array(), false),
        );
    }

    /**
     * @dataProvider getAttributeLayersData
     */
    public function testHasAttributeLayer($only, $attributeLayers, $expectedReturn)
    {
        $config = new Project\ProjectConfig(null, array('attributeLayers' => $attributeLayers));
        $proj = new ProjectForTests();
        $proj->setCfg($config);
        $this->assertEquals($expectedReturn, $proj->hasAttributeLayers($only));
    }
}
