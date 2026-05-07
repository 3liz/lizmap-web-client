<?php

/**
 * QGIS Vector layer attribute editor field.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer;

use Lizmap\Project\Qgis;

/**
 * QGIS Vector layer attribute editor field.
 *
 * @property string      $name
 * @property null|string $showLabel
 */
class VectorLayerAttributeEditorField extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'name',
        'showLabel',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'attributeEditorField';

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'name',
        'showLabel',
    );

    /**
     * Get element attributes as array.
     *
     * @param \XMLReader $oXmlReader An XMLReader instance at an element
     *
     * @return array{name: null|string, showLabel: null|string}
     */
    protected static function getAttributes($oXmlReader)
    {
        return array(
            'name' => $oXmlReader->getAttribute('name'),
            'showLabel' => $oXmlReader->getAttribute('showLabel'),
        );
    }
}
