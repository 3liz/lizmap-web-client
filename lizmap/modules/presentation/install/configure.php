<?php

use Jelix\Installer\Module\Configurator;

/**
 * @author    3liz
 * @copyright 2011-2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license   Mozilla Public License : http://www.mozilla.org/MPL/
 */
class presentationModuleConfigurator extends Configurator
{
    public function getFilesToCopy()
    {
        return array(
            '../www/css' => 'www:modules-assets/presentation/css',
            '../www/js' => 'www:modules-assets/presentation/js',
        );
    }
}
