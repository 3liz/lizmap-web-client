<?php
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
class lizmapconfigConfigCompilerPlugin implements \jelix\core\ConfigCompilerPluginInterface
{
    public function getPriority()
    {
        return 20;
    }

    public function atStart($config)
    {
    }

    public function onModule($config, $moduleName, $modulePath, $xml)
    {
    }

    public function atEnd($config)
    {
    }
}
