<?php

use Jelix\JCommunity\Command;

$application->add(new Command\CreateUser());
$application->add(new Command\ChangePassword());
$application->add(new Command\ResetPassword());
