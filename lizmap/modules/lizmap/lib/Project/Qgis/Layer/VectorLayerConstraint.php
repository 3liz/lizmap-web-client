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
            'notnull_strength' => filter_var($oXmlReader->getAttribute('notnull_strength'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'unique_strength' => filter_var($oXmlReader->getAttribute('unique_strength'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'exp_strength' => filter_var($oXmlReader->getAttribute('exp_strength'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        );
    }
}
