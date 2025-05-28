<?php

/**
 * QGIS Vector layer constraint expression.
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
 * QGIS Vector layer constraint expression.
 *
 * @property string $field
 * @property string $exp
 * @property string $desc
 */
class VectorLayerConstraintExpression extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'field',
        'exp',
        'desc',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'field',
        'exp',
        'desc',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'constraint';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'field' => $oXmlReader->getAttribute('field'),
            'exp' => $oXmlReader->getAttribute('exp'),
            'desc' => $oXmlReader->getAttribute('desc'),
        );
    }
}
