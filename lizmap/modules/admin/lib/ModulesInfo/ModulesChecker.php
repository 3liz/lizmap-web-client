<?php

namespace LizmapAdmin\ModulesInfo;

use Jelix\IniFile\IniReader;
use Lizmap\App\VersionTools;

class ModulesChecker
{
    private const coreExternalModules = array(
        'jelix',
        'jacl2',
        'jacl2db',
        'jcommunity',
        'jacl2db_admin',
        'jauthdb_admin',
        'master_admin',
    );
    private const coreLizmapModules = array(
        'action',
        'admin',
        'admin_api',
        'dataviz',
        'filter',
        'action',
        'dynamicLayers',
        'lizmap',
        'proj4php',
        'view',
    );

    /**
     * Get the list of installed modules with their metadata.
     *
     * @param bool $withExternalCore Include or not core external modules (Jelix, JCommunity…). False by default.
     * @param bool $withLizmapCore   Include or not core Lizmap modules (Action, Dataviz…). False by default.
     * @param bool $withAdditional   Include or not Lizmap additional modules (AltiProfil, MapBuilder…). True by default.
     *
     * @return array[ModuleMetaData] The list of installed modules
     */
    public function getList($withExternalCore = false, $withLizmapCore = false, $withAdditional = true)
    {
        $moduleConfig = \jApp::config()->modules;
        $installReader = new IniReader(\jApp::varConfigPath('installer.ini.php'));

        $enabledModuleNames = array();
        foreach ($moduleConfig as $paramName => $value) {
            if (preg_match('/(\w*)\.enabled/', $paramName, $matches) && $value == '1') {
                $moduleSlug = $matches[1];
                $coreExternalModule = in_array($moduleSlug, self::coreExternalModules);
                if ($coreExternalModule && !$withExternalCore) {
                    continue;
                }
                $coreLizmapModule = in_array($moduleSlug, self::coreLizmapModules);
                if ($coreLizmapModule && !$withLizmapCore) {
                    continue;
                }
                if (!$coreExternalModule && !$coreLizmapModule && !$withAdditional) {
                    // If the module is not "core external" and not "core Lizmap",
                    // it means it's an additional module, such as AltiProfil, MapBuilder…
                    // We might don't want them
                    continue;
                }
                $version = $installReader->getValue($moduleSlug.'.version', 'modules');
                $enabledModuleNames[] = new ModuleMetaData(
                    $moduleSlug,
                    $version,
                    $coreExternalModule || $coreLizmapModule
                );
            }
        }

        return $enabledModuleNames;
    }

    /**
     * Compare the list of Lizmap core modules to a given version.
     * It returns True if all versions are the same within all Lizmap core modules.
     * It means migrations are done correctly.
     *
     * @param string $version
     *
     * @return bool
     */
    public function compareLizmapCoreModulesVersions($version)
    {
        $semanticVersion = VersionTools::dropBuildId($version);
        // We only want Lizmap core modules, without additional modules such as (AltiProfil, MapBuilder…)
        $modules = $this->getList(false, true, false);
        foreach ($modules as $module) {
            // It should be improved
            // 3.9.0-beta.2    → 3.9.0-beta
            // 3.10.0-pre.8697 → 3.10.0-pre
            if ($semanticVersion != VersionTools::dropBuildId($module->version)) {

                return false;
            }
        }

        return true;
    }
}
