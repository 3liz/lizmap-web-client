<?php

use jelix\core\ConfigCompilerPluginInterface;

/**
 * Plugin for the jelix configuration compiler.
 *
 * @author    3liz
 * @copyright 2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

/**
 * This object is called each time Jelix should generate the configuration cache into the
 * temp/ directory.
 */
class lizmapconfigConfigCompilerPlugin implements ConfigCompilerPluginInterface
{
    public function getPriority()
    {
        return 20;
    }

    public function atStart($config) {}

    public function onModule($config, $moduleName, $modulePath, $xml)
    {
        if ($moduleName == 'lizmap') {
            // we store the version into the configuration file, it avoids
            // to read it from the project.xml file, as it is an heavy process.
            if (property_exists($config, 'lizmap')) {
                $config->lizmap['version'] = (string) $xml->info->version;
            }
        }
    }

    public function atEnd($config) {}
}
