<?php

/**
 * QGIS Raster layer raster renderer.
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
 * QGIS Raster layer raster renderer.
 *
 * @property string $type
 * @property float  $opacity
 */
class RasterLayerRasterRenderer extends Project\Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'type',
        'opacity',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'type',
        'opacity',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'rasterrenderer';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'type' => $oXmlReader->getAttribute('type'),
            'opacity' => (float) $oXmlReader->getAttribute('opacity'),
        );
    }
}
