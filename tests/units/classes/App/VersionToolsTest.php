<?php

use Lizmap\App\VersionTools;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

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

    public static function intVersionToSortableProvider() {
        return [
            'string version with starting 0' => ['01.01.02' , '01.01.02'],
            'string version without starting 0' => ['1.01.02' , '01.01.02'],
            'string version only 1 digit' => ['1.1.2' , '01.01.02'],
            'int version (5char)' => ['10102' , '01.01.02'],
            'int version (6 char)' => ['050912', '05.09.12'],
            'master' =>['master', '00.00.00'],
            'dev' =>['dev', '00.00.00'],
        ];
    }

    /**
     * @dataProvider intVersionToSortableProvider
     */
    #[DataProvider('intVersionToSortableProvider')]
    public function testIntVersionToSortableString(string $intVersion, string $expected): void
    {
        $this->assertEquals($expected, VersionTools::intVersionToSortableString($intVersion));
    }

    public static function intVersionToHumanProvider() {
        return [
            '1 digit (5char)' => ['10102' , '1.1.2', false],
            '1 digit (6 char)' => ['050912', '5.9.12', false],
            '2 digit' =>  ['311225' , '31.12.25', false],
            '2 digit no patch' =>  ['031415' , '3.14', true],
            'no patch version' => ['056000' , '5.60', true],
            'only maj version' => ['600000' , '60.0.0', false],
            'only maj version no patch' => ['600000' , '60.0', true],
        ];
    }

    /**
     * @dataProvider intVersionToHumanProvider
     */
    #[DataProvider('intVersionToHumanProvider')]
    public function testIntVersionToHumanString(string $intVersion, string $expected, bool $stripPatch): void
    {
        $this->assertEquals($expected, VersionTools::intVersionToHumanString($intVersion, $stripPatch));
    }
}
