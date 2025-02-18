<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;

// Set the level of type coverage
$levelTypeCoverage = 5;
$levelDeadCode = 1;
$levelCodeQuality = 10;

function getLevelTypeCoverage(): int
{
    global $levelTypeCoverage;
    return $levelTypeCoverage;
}

function getLevelDeadCode(): int
{
    global $levelDeadCode;
    return $levelDeadCode;
}

function getLevelCodeQuality(): int
{
    global $levelCodeQuality;
    return $levelCodeQuality;
}

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/../../lizmap/modules/lizmap/classes/',
        __DIR__ . '/../../lizmap/modules/lizmap/lib/',
        __DIR__ . '/../../lizmap/modules/view/classes/',
        __DIR__ . '/../../lizmap/modules/admin/classes/',
        __DIR__ . '/../../lizmap/modules/admin/lib/',
        __DIR__ . '/../../lizmap/modules/dataviz/classes/',
        __DIR__ . '/../../lizmap/modules/action/classes/',
        __DIR__ . '/../../lizmap/modules/filter/classes/',
        __DIR__ . '/classes',
        __DIR__ . '/edition',
        __DIR__ . '/testslib',
    ])
    // uncomment to reach your current PHP version
    // ->withPhpSets()
    ->withTypeCoverageLevel($levelTypeCoverage)
    ->withDeadCodeLevel($levelDeadCode)
    ->withCodeQualityLevel($levelCodeQuality);
