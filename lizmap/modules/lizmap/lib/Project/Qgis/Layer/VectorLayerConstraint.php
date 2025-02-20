<?php

/**
 * QGIS Vector layer constraint.
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
 * QGIS Vector layer constraint.
 *
 * @property string $field
 * @property int    $constraints
 * @property bool   $notnull_strength
 * @property bool   $unique_strength
 * @property bool   $exp_strength
 */
class VectorLayerConstraint extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'field',
        'constraints',
        'notnull_strength',
        'unique_strength',
        'exp_strength',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'field',
        'constraints',
        'notnull_strength',
        'unique_strength',
        'exp_strength',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'constraint';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'field' => $oXmlReader->getAttribute('field'),
            'constraints' => (int) $oXmlReader->getAttribute('constraints'),
            'notnull_strength' => (int) $oXmlReader->getAttribute('notnull_strength') > 0,
            'unique_strength' => (int) $oXmlReader->getAttribute('unique_strength') > 0,
            'exp_strength' => (int) $oXmlReader->getAttribute('exp_strength') > 0,
        );
    }
}
