<?php

/**
 * QGIS Map layer style manager.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer;

use Lizmap\Project\Qgis;

/**
 * QGIS Map layer style manager.
 *
 * @property string        $current
 * @property array<string> $styles
 */
class MapLayerStyleManager extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'current',
        'styles',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'map-layer-style-manager';

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'map-layer-style',
    );

    protected static $childParsers = array();

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'current' => $oXmlReader->getAttribute('current'),
        );
    }

    protected static function buildInstance($data)
    {
        if (array_key_exists('map-layer-style', $data)) {
            $data['styles'] = $data['map-layer-style'];
            unset($data['map-layer-style']);
        }

        return new MapLayerStyleManager($data);
    }
}
MapLayerStyleManager::registerChildParser('map-layer-style', function ($oXmlReader) {
    return array($oXmlReader->getAttribute('name'));
});
