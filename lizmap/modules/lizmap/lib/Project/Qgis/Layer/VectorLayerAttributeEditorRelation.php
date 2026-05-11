<?php

/**
 * QGIS Vector layer attribute editor relation.
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
 * QGIS Vector layer attribute editor relation.
 *
 * @property string      $name
 * @property null|string $relation
 * @property null|string $label
 * @property null|string $nmRelationId
 * @property null|string $showLabel
 */
class VectorLayerAttributeEditorRelation extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'name',
        'relation',
        'label',
        'nmRelationId',
        'showLabel',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'name',
        'relation',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'attributeEditorRelation';

    /**
     * Get element attributes as array.
     *
     * @param \XMLReader $oXmlReader An XMLReader instance at an element
     *
     * @return array{label: null|string, name: null|string, nmRelationId: null|string, relation: null|string, showLabel: null|string}
     */
    protected static function getAttributes($oXmlReader)
    {
        return array(
            'name' => $oXmlReader->getAttribute('name'),
            'relation' => $oXmlReader->getAttribute('relation'),
            'label' => $oXmlReader->getAttribute('label'),
            'nmRelationId' => $oXmlReader->getAttribute('nmRelationId'),
            'showLabel' => $oXmlReader->getAttribute('showLabel'),
        );
    }

    /**
     * Reads relation cardinality from attributeEditorRelation configuration.
     *
     * @return bool
     */
    public function isnmRelation()
    {
        return $this->nmRelationId !== '';
    }
}
