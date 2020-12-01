<?php

use Lizmap\Request;
use PHPUnit\Framework\TestCase;

require_once __DIR__.'/ClassesForTests.php';

class WMTSRequestTest extends TestCase
{
    public function testGetCapabilities()
    {
        $appContext = new TestContext();
        $project = new ProjectForOGC();
        $repo = new \Lizmap\Project\Repository('test', array(), '', null, $appContext);
        $project->setRepo($repo);
        $project->setKey('test');
        $wmtsMock = $this->getMockBuilder(WMTSRequestForTest::class)->setMethods(['serviceException'])->setConstructorArgs(array($project, array(), null, $appContext))->getMock();
        lizmapTilerForTests::$tileCapFail = true;
        $wmtsMock->expects($this->exactly(2))->method('serviceException');
        $wmtsMock->getcapabilitiesForTests();
        lizmapTilerForTests::$tileCapFail = false;
        lizmapTilerForTests::$tileCaps = (object)array('tileMatrixSetList' => null);
        $wmtsMock->getcapabilitiesForTests();
        lizmapTilerForTests::$tileCapFail = false;
        lizmapTilerForTests::$tileCaps = (object)array('tileMatrixSetList' => 'not null', 'layerTileInfoList' => 'not null');
        $result = $wmtsMock->getcapabilitiesForTests();
        $this->assertEquals(200, $result->code);
        $this->assertEquals('text/xml', $result->mime);
        $this->assertFalse($result->cached);
    }
}