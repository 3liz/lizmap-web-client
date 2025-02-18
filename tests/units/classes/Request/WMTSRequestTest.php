<?php

use PHPUnit\Framework\TestCase;

class WMTSRequestTest extends TestCase
{
    public function testGetCapabilities(): void
    {
        $appContext = new ContextForTests();
        $project = new ProjectForOGCForTests();
        $repo = new \Lizmap\Project\Repository('test', array(), '', null, $appContext);
        $project->setRepo($repo);
        $project->setKey('test');
        $wmtsMock = $this->getMockBuilder(WMTSRequestForTests::class)
                         ->onlyMethods(['serviceException'])
                         ->setConstructorArgs(array($project, array(), null))
                         ->getMock();
        LizmapTilerForTests::$tileCapFail = true;
        $wmtsMock->expects($this->exactly(2))->method('serviceException');
        $wmtsMock->getcapabilitiesForTests();
        LizmapTilerForTests::$tileCapFail = false;
        LizmapTilerForTests::$tileCaps = (object)array('tileMatrixSetList' => null);
        $wmtsMock->getcapabilitiesForTests();
        LizmapTilerForTests::$tileCapFail = false;
        LizmapTilerForTests::$tileCaps = (object)array('tileMatrixSetList' => 'not null', 'layerTileInfoList' => 'not null');
        $result = $wmtsMock->getcapabilitiesForTests();
        $this->assertEquals(200, $result->code);
        $this->assertEquals('text/xml; charset=utf-8', $result->mime);
        $this->assertFalse($result->cached);
    }
}
