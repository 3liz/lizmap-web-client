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
 * @property string $field
 * @property string $expression
 * @property bool   $applyOnUpdate
 */
class VectorLayerDefault extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'field',
        'expression',
        'applyOnUpdate',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'field',
        'expression',
        'applyOnUpdate',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'default';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'field' => $oXmlReader->getAttribute('field'),
            'expression' => $oXmlReader->getAttribute('expression'),
            'applyOnUpdate' => filter_var($oXmlReader->getAttribute('applyOnUpdate'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        );
    }
}
