<?php

/**
 * QGIS Raster layer hue saturation.
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
 * QGIS Raster layer hue saturation.
 *
 * @property int  $saturation
 * @property int  $grayscaleMode
 * @property bool $invertColors
 * @property bool $colorizeOn
 * @property int  $colorizeRed
 * @property int  $colorizeGreen
 * @property int  $colorizeBlue
 * @property int  $colorizeStrength
 */
class RasterLayerHueSaturation extends Project\Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'saturation',
        'grayscaleMode',
        'invertColors',
        'colorizeOn',
        'colorizeRed',
        'colorizeGreen',
        'colorizeBlue',
        'colorizeStrength',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'saturation',
        'grayscaleMode',
        'invertColors',
        'colorizeOn',
        'colorizeRed',
        'colorizeGreen',
        'colorizeBlue',
        'colorizeStrength',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'huesaturation';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'saturation' => (int) $oXmlReader->getAttribute('saturation'),
            'grayscaleMode' => (int) $oXmlReader->getAttribute('grayscaleMode'),
            'invertColors' => filter_var($oXmlReader->getAttribute('invertColors'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'colorizeOn' => filter_var($oXmlReader->getAttribute('colorizeOn'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'colorizeRed' => (int) $oXmlReader->getAttribute('colorizeRed'),
            'colorizeGreen' => (int) $oXmlReader->getAttribute('colorizeGreen'),
            'colorizeBlue' => (int) $oXmlReader->getAttribute('colorizeBlue'),
            'colorizeStrength' => (int) $oXmlReader->getAttribute('colorizeStrength'),
        );
    }
}
