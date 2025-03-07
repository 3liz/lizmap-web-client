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
