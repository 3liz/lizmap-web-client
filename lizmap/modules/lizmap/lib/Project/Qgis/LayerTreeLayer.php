<?php

/**
 * QGIS Layer tree layer.
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
 * @property string $name
 * @property string $id
 * @property array  $customproperties
 */
class LayerTreeLayer extends BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'name',
        'id',
        'customproperties',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'layer-tree-layer';

    protected static $childParsers = array();

    /**
     * Get attributes from an XMLReader instance at an element.
     *
     * @param \XMLReader $oXmlReader An XMLReader instance at an element
     *
     * @return array{'name': string, 'id': string} the element attributes as keys / values
     */
    protected static function getAttributes($oXmlReader)
    {
        return array(
            'name' => $oXmlReader->getAttribute('name'),
            'id' => $oXmlReader->getAttribute('id'),
        );
    }
}
LayerTreeLayer::registerChildParser('customproperties', function ($oXmlReader) {
    return Parser::readCustomProperties($oXmlReader);
});
