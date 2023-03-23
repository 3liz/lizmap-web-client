<?php

if (isset($application)) {
    $application->add(new \Lizmap\Commands\CreateRepository());
    $application->add(new \Lizmap\Commands\DbMigrateLog());
    $application->add(new \Lizmap\Commands\DbMigrateUsers());
    $application->add(new \Lizmap\Commands\ProjectLoad());

    $application->add(new \Lizmap\Commands\WMTSCapabilities());
    $application->add(new \Lizmap\Commands\WMTSSeed());
    $application->add(new \Lizmap\Commands\WMTSCacheClean());
}
