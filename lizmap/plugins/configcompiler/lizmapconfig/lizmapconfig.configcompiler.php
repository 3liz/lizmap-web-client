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
 *
 * Each time Lizmap is upgraded, files of temp directory should be deleted, so this is
 * the opportunity to generate a new assets revision number, so browsers will receive
 * new urls for CSS and JS files. (see lizmap/responses/AbstractLizmapHtmlResponse.php)
 */
class lizmapconfigConfigCompilerPlugin implements \jelix\core\ConfigCompilerPluginInterface
{
    public function getPriority()
    {
        return 20;
    }

    public function atStart($config)
    {
        if (isset($config->urlengine['assetsRevision'])) {
            $revision = $config->urlengine['assetsRevision'];
            if ($revision == 'autoconfig') {
                $revision = date('ymdHis');
            }
        } else {
            $revision = date('ymdHis');
        }
        $config->urlengine['assetsRevision'] = $revision;

        if ($revision != '') {
            $config->urlengine['assetsRevQueryUrl'] = '_r='.$revision;
        } else {
            $config->urlengine['assetsRevQueryUrl'] = '';
        }
    }

    public function onModule($config, $moduleName, $modulePath, $xml)
    {
    }

    public function atEnd($config)
    {
    }
}
