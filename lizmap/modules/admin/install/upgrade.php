<?php

use Jelix\IniFile\IniModifierInterface;
use Jelix\Installer\Module\API\InstallHelpers;
use Jelix\Installer\Module\Installer;

/**
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      http://www.3liz.com
 *
 * @license    Mozilla Public License - MPL
 */
class adminModuleUpgrader extends Installer
{
    public function install(InstallHelpers $helpers)
    {
        // remove some unwanted web assets that may have been set by previous installation
        // having bugs into their installers.
        /** @var IniModifierInterface $localConf */
        $localConf = $helpers->getLocalConfigIni();
        $localConf->removeValue('jauthdb_admin.js', 'webassets_common');
        $localConf->removeValue('jauthdb_admin.css', 'webassets_common');
        $localConf->removeValue('jauthdb_admin.require', 'webassets_common');

        $localConf->removeValue('jacl2_admin.js', 'webassets_common');
        $localConf->removeValue('jacl2_admin.css', 'webassets_common');
        $localConf->removeValue('jacl2_admin.require', 'webassets_common');
    }
}
