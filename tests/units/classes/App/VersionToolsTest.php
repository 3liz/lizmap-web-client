<?php

use Lizmap\App\VersionTools;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class VersionToolsTest extends TestCase
{
    public function testDropBuildId(): void
    {
        $this->assertEquals('3.10.0-pre', VersionTools::dropBuildId('3.10.0-pre.8697'));
        $this->assertEquals('3.10.0-pre', VersionTools::dropBuildId('3.10.0-pre'));
        $this->assertEquals('3.10.0', VersionTools::dropBuildId('3.10.0'));
        $this->assertEquals('3.10', VersionTools::dropBuildId('3.10'));
    }

    public function testQgisMajMinHumanVersion(): void
    {
        $this->assertEquals('3.40', VersionTools::qgisMajMinHumanVersion('340'));
        $this->assertEquals('1.40', VersionTools::qgisMajMinHumanVersion('1040')); // Fixme when QGIS 10 is released :)
    }

    public function testQgisVersionWithNameToInt(): void
    {
        $this->assertEquals(33410, VersionTools::qgisVersionWithNameToInt('3.34.10-Bratislava'));
        $this->assertEquals(34006, VersionTools::qgisVersionWithNameToInt('3.40.6-Bratislava'));
        $this->assertEquals(34010, VersionTools::qgisVersionWithNameToInt('3.40.10-Prizren'));
        $this->assertEquals(40000, VersionTools::qgisVersionWithNameToInt('4.0.0-Prizren'));
        $this->assertEquals(40400, VersionTools::qgisVersionWithNameToInt('4.4.0-Prizren'));
        $this->assertEquals(33412, VersionTools::qgisVersionWithNameToInt('03.34.12'));
    }

    public function testIntVersionToSortableString(): void
    {
        $this->assertEquals('01.01.02', VersionTools::intVersionToSortableString('01.01.02'));
        $this->assertEquals('01.01.02', VersionTools::intVersionToSortableString('1.01.02'));
        $this->assertEquals('01.01.02', VersionTools::intVersionToSortableString('1.1.2'));
        $this->assertEquals('01.01.02', VersionTools::intVersionToSortableString('10102'));
        $this->assertEquals('05.09.12', VersionTools::intVersionToSortableString('050912'));
        $this->assertEquals('00.00.00', VersionTools::intVersionToSortableString('master'));
        $this->assertEquals('00.00.00', VersionTools::intVersionToSortableString('dev'));
    }
}
