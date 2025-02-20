<?php

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/rector.php';

use Symfony\Component\Console\Output\ConsoleOutput;

use Rector\Config\Level\TypeDeclarationLevel;
use Rector\Config\Level\DeadCodeLevel;
use Rector\Config\Level\CodeQualityLevel;

$levelTypeCoverage = getLevelTypeCoverage();
$levelDeadCode = getLevelDeadCode();
$levelCodeQuality = getLevelCodeQuality();

$coverageList = [];

$coverageList["withTypeCoverageLevel"] = [
    $levelTypeCoverage,
    TypeDeclarationLevel::RULES
];
$coverageList["withDeadCodeLevel"] = [
    $levelDeadCode,
    DeadCodeLevel::RULES
];
$coverageList["withCodeQualityLevel"] = [
    $levelCodeQuality,
    CodeQualityLevel::RULES
];

$output = new ConsoleOutput();

foreach ($coverageList as $key => $value) {
    $level = $value[0] + 1;

    if ($level <= 0) {
        continue;
    }

    $totalRules = count($value[1]);

    if ($level > $totalRules) {
        $level = $totalRules;
    }

    $output->writeln(sprintf("<fg=green>For %s, you're using %d rule(s) out of %d :</fg=green>", $key, $level, $totalRules));
    for ($i = 0; $i < $level; $i++) {
        $rule = $value[1][$i];
        $ruleFormatted = basename(str_replace('\\', '/', $rule));
        $output->writeln(sprintf("<fg=yellow>\t* %s</fg=yellow>", $ruleFormatted));
    }

    $output->writeln("");
}
