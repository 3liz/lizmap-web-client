<?php

/**
 * QGIS Vector layer default.
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
 * QGIS Vector layer default.
 *
 * @property string $name
 * @property bool   $editable
 */
class VectorLayerEditableField extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'name',
        'editable',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'name',
        'editable',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'field';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'name' => $oXmlReader->getAttribute('name'),
            'editable' => filter_var($oXmlReader->getAttribute('editable'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        );
    }
}
