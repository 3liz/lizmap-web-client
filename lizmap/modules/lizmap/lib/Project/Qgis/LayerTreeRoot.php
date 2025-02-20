<?php

/**
 * QGIS Layer tree root.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis;

/**
 * QGIS Layer tree root.
 *
 * @property string                               $name
 * @property array                                $customproperties
 * @property array<LayerTreeGroup|LayerTreeLayer> $items
 * @property LayerTreeCustomOrder                 $customOrder
 */
class LayerTreeRoot extends LayerTreeGroup
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'customproperties',
        'items',
        'customOrder',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'customproperties',
        'items',
        'customOrder',
    );

    /** @var array The default values for properties */
    protected $defaultValues = array(
        'customproperties' => array(),
        'items' => array(),
    );

    /** @var array<string, string> The XML element tagname associated with a collector property name */
    protected static $childrenCollection = array(
        'layer-tree-group' => 'items',
        'layer-tree-layer' => 'items',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'layer-tree-group';

    protected static $childParsers = array();

    protected static function buildInstance($data)
    {
        if (array_key_exists('custom-order', $data)) {
            $data['customOrder'] = $data['custom-order'];
            unset($data['custom-order']);
        } else {
            $data['customOrder'] = new LayerTreeCustomOrder(array(
                'enabled' => false,
            ));
        }

        return new LayerTreeRoot($data);
    }
}
LayerTreeRoot::registerChildParser('layer-tree-group', function ($oXmlReader) {
    return LayerTreeGroup::fromXmlReader($oXmlReader);
});
LayerTreeRoot::registerChildParser('layer-tree-layer', function ($oXmlReader) {
    return LayerTreeLayer::fromXmlReader($oXmlReader);
});
LayerTreeRoot::registerChildParser('customproperties', function ($oXmlReader) {
    return Parser::readCustomProperties($oXmlReader);
});
LayerTreeRoot::registerChildParser('custom-order', function ($oXmlReader) {
    $data = array(
        'enabled' => filter_var($oXmlReader->getAttribute('enabled'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        'items' => array(),
    );
    if ($data['enabled']) {
        $data['items'] = Parser::readItems($oXmlReader);
    } else {
        $oXmlReader->next();
    }

    return new LayerTreeCustomOrder($data);
});
