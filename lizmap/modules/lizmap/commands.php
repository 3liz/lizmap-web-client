<?php

if (isset($application)) {
    $application->add(new \Lizmap\Commands\CreateRepository());
    $application->add(new \Lizmap\Commands\DbMigrateLog());
    $application->add(new \Lizmap\Commands\DbMigrateUsers());
    $application->add(new \Lizmap\Commands\ProjectLoad());
}
