<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;

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
    ->withTypeCoverageLevel(0);
