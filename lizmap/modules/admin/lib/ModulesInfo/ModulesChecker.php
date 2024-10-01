<?php

namespace LizmapAdmin\ModulesInfo;

use Jelix\IniFile\IniReader;

class ModulesChecker
{
    private const coreModules = array('jelix',
        'jacl2',
        'jacl2db',
        'jcommunity',
        'admin',
        'dataviz',
        'filter',
        'action',
        'lizmap',
        'proj4php',
        'view',
        'jacl2db_admin',
        'jauthdb_admin',
        'master_admin',
    );

    public function getList($withCore = false)
    {
        $moduleConfig = \jApp::config()->modules;
        $installReader = new IniReader(\jApp::varConfigPath('installer.ini.php'));

        $enabledModuleName = array();
        foreach ($moduleConfig as $paramName => $value) {
            if (preg_match('/(\w*)\.enabled/', $paramName, $matches) && $value == '1') {
                $moduleSlug = $matches[1];
                $coreModule = in_array($moduleSlug, self::coreModules);
                if ($coreModule && !$withCore) {
                    continue;
                }
                $version = $installReader->getValue($moduleSlug.'.version', 'modules');
                $enabledModuleName[] = new ModuleMetaData($moduleSlug, $version, $coreModule);
            }
        }

        return $enabledModuleName;
    }
}
