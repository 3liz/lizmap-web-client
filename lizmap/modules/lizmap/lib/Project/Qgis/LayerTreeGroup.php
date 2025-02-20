<?php

/**
 * QGIS Layer tree group.
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
 * QGIS Layer tree group.
 *
 * @property string                               $name
 * @property bool                                 $mutuallyExclusive
 * @property array                                $customproperties
 * @property array<LayerTreeGroup|LayerTreeLayer> $items
 */
class LayerTreeGroup extends BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'name',
        'mutuallyExclusive',
        'customproperties',
        'items',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'layer-tree-group';

    protected static $childParsers = array();

    /** @var array<string, string> The XML element tagname associated with a collector property name */
    protected static $childrenCollection = array(
        'layer-tree-group' => 'items',
        'layer-tree-layer' => 'items',
    );

    /**
     * Get attributes from an XMLReader instance at an element.
     *
     * @param \XMLReader $oXmlReader An XMLReader instance at an element
     *
     * @return array{'name': string} the element attributes as keys / values
     */
    protected static function getAttributes($oXmlReader)
    {
        return array(
            'name' => $oXmlReader->getAttribute('name'),
            'mutuallyExclusive' => filter_var($oXmlReader->getAttribute('mutually-exclusive'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        );
    }

    /**
     * Get group short names.
     *
     * @return array<string, string>
     */
    public function getGroupShortNames()
    {
        $data = array();
        foreach ($this->items as $item) {
            if (!$item instanceof LayerTreeGroup) {
                continue;
            }
            $data += $item->getGroupShortNames();
            if (!array_key_exists('wmsShortName', $item->customproperties)) {
                continue;
            }
            $data[$item->name] = $item->customproperties['wmsShortName'];
        }

        return $data;
    }

    /**
     * Get groups mutually exclusive.
     *
     * @return array<string>
     */
    public function getGroupsMutuallyExclusive()
    {
        $data = array();
        foreach ($this->items as $item) {
            if (!$item instanceof LayerTreeGroup) {
                continue;
            }
            $data = array_merge($data, $item->getGroupsMutuallyExclusive());
            if (!$item->mutuallyExclusive) {
                continue;
            }
            $data[] = $item->name;
        }

        return $data;
    }

    /**
     * Get layer show feature count.
     *
     * @return array<string>
     */
    public function getLayersShowFeatureCount()
    {
        $data = array();
        foreach ($this->items as $item) {
            if ($item instanceof LayerTreeGroup) {
                $data = array_merge($data, $item->getLayersShowFeatureCount());

                continue;
            }
            if (!array_key_exists('showFeatureCount', $item->customproperties)) {
                continue;
            }
            $data[] = $item->name;
        }

        return $data;
    }
}
LayerTreeGroup::registerChildParser('layer-tree-group', function ($oXmlReader) {
    return LayerTreeGroup::fromXmlReader($oXmlReader);
});
LayerTreeGroup::registerChildParser('layer-tree-layer', function ($oXmlReader) {
    return LayerTreeLayer::fromXmlReader($oXmlReader);
});
LayerTreeGroup::registerChildParser('customproperties', function ($oXmlReader) {
    return Parser::readCustomProperties($oXmlReader);
});
