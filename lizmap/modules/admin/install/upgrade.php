<?php
/**
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      http://www.3liz.com
 *
 * @license    Mozilla Public License - MPL
 */
class adminModuleUpgrader extends \Jelix\Installer\Module\Installer
{
    public function install(Jelix\Installer\Module\API\InstallHelpers $helpers)
    {
        // remove some unwanted web assets that may have been set by previous installation
        // having bugs into their installers.
        $localConf = $helpers->getLocalConfigIni();
        $localConf->removeValue('jauthdb_admin.js', 'webassets_common');
        $localConf->removeValue('jauthdb_admin.css', 'webassets_common');
        $localConf->removeValue('jauthdb_admin.require', 'webassets_common');

        $localConf->removeValue('jacl2_admin.js', 'webassets_common');
        $localConf->removeValue('jacl2_admin.css', 'webassets_common');
        $localConf->removeValue('jacl2_admin.require', 'webassets_common');
    }
}
