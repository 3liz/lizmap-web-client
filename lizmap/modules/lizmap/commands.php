<?php

use Lizmap\Commands\CreateRepository;
use Lizmap\Commands\DbMigrateLog;
use Lizmap\Commands\DbMigrateUsers;
use Lizmap\Commands\ProjectLoad;
use Lizmap\Commands\WMTSCacheClean;
use Lizmap\Commands\WMTSCapabilities;
use Lizmap\Commands\WMTSSeed;

if (isset($application)) {
    $application->add(new CreateRepository());
    $application->add(new DbMigrateLog());
    $application->add(new DbMigrateUsers());
    $application->add(new ProjectLoad());

    $application->add(new WMTSCapabilities());
    $application->add(new WMTSSeed());
    $application->add(new WMTSCacheClean());
}
