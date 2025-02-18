<?php

use PHPUnit\Framework\TestCase;
use Lizmap\App\FileTools;

class FileToolsTest extends TestCase
{
    function testTail(): void {
        $TAIL_NL = "\n";

        $oneLinePath = __DIR__.'/Ressources/one-line.txt';
        $this->assertEquals('1 line', trim(FileTools::tail($oneLinePath, 1)));
        $this->assertEquals('1 line', trim(FileTools::tail($oneLinePath, 5)));

        $tenLinePath = __DIR__.'/Ressources/ten-lines.txt';
        $this->assertEquals('10 lines', trim(FileTools::tail($tenLinePath, 1)));

        $lines = explode($TAIL_NL, trim(FileTools::tail($tenLinePath, 5)));
        $this->assertCount(5, $lines);
        $this->assertEquals('10 lines', $lines[4]);
        $this->assertEquals('6 lines', $lines[0]);

        $dirPath = __DIR__.'/Ressources';
        $this->assertEquals('', trim(FileTools::tail($dirPath, 1)));
        $this->assertEquals('', trim(FileTools::tail($dirPath, 5)));

        $unknownPath = __DIR__.'/Ressources/unknown.txt';
        $this->assertEquals('', trim(FileTools::tail($unknownPath, 1)));
        $this->assertEquals('', trim(FileTools::tail($unknownPath, 5)));
    }
}
