<?php

use Jelix\Installer\Module\API\ConfigurationHelpers;
use Jelix\Installer\Module\Configurator;

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */
class admin_apiModuleConfigurator extends Configurator
{
    public function getDefaultParameters()
    {
        return array();
    }

    public function configure(ConfigurationHelpers $helpers) {}
}
