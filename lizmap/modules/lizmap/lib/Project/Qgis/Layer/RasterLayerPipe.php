<?php

/**
 * QGIS Raster layer pipe.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer;

use Lizmap\Project;

/**
 * QGIS Raster layer pipe.
 *
 * @property RasterLayerRasterRenderer $renderer
 * @property RasterLayerHueSaturation  $hueSaturation
 */
class RasterLayerPipe extends Project\Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'renderer',
        'hueSaturation',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'renderer',
        'hueSaturation',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'pipe';

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'rasterrenderer',
        'huesaturation',
    );

    protected static $childParsers = array();

    protected static function buildInstance($data)
    {
        if (array_key_exists('rasterrenderer', $data)) {
            $data['renderer'] = $data['rasterrenderer'];
            unset($data['rasterrenderer']);
        }

        if (array_key_exists('huesaturation', $data)) {
            $data['hueSaturation'] = $data['huesaturation'];
            unset($data['huesaturation']);
        }

        return new RasterLayerPipe($data);
    }
}
RasterLayerPipe::registerChildParser('rasterrenderer', function ($oXmlReader) {
    return RasterLayerRasterRenderer::fromXmlReader($oXmlReader);
});
RasterLayerPipe::registerChildParser('huesaturation', function ($oXmlReader) {
    return RasterLayerHueSaturation::fromXmlReader($oXmlReader);
});
