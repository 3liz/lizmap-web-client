<?php

use Jelix\Installer\Module\API\InstallHelpers;
use Jelix\Installer\Module\Installer;

/**
 * @author    3liz
 * @copyright 2011-24 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
class presentationModuleUpgrader extends Installer
{
    public function install(InstallHelpers $helpers)
    {
        // Copy CSS and JS assets
        // We use overwrite to be sure the new versions of the JS files
        // will be used
        $overwrite = true;
        $helpers->copyDirectoryContent('../www/css', jApp::wwwPath('modules-assets/presentation/css'), $overwrite);
        $helpers->copyDirectoryContent('../www/js', jApp::wwwPath('modules-assets/presentation/js'), $overwrite);
    }
}
