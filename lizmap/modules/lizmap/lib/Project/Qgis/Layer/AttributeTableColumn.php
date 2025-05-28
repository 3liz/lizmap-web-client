<?php

/**
 * QGIS Vector layer attribute table column.
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
 * QGIS Vector layer attribute table column.
 *
 * @property string $type
 * @property string $name
 * @property bool   $hidden
 */
class AttributeTableColumn extends Project\Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'type',
        'name',
        'hidden',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'type',
        'name',
        'hidden',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'column';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'type' => $oXmlReader->getAttribute('type'),
            'name' => $oXmlReader->getAttribute('name'),
            'hidden' => filter_var($oXmlReader->getAttribute('hidden'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        );
    }
}
