<?php

use Jelix\Scripts\Installer;

require __DIR__.'/../application.init.php';

jFile::copyDirectoryContent(__DIR__.'/../vendor/jelix/jelix/lib/jelix-www', __DIR__.'/../www/assets/jelix');

exit(Installer::launch());
