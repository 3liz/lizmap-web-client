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

use Lizmap\Project\Qgis;

/**
 * QGIS Renderer V2 layer.
 *
 * @property string    $type
 * @property array-key $categories
 */
class RendererV2 extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'type',
        'categories',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'type',
    );

    /** @var array The default values for properties */
    protected $defaultValues = array(
        'categories' => array(),
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'renderer-v2';

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'categories',
    );

    protected static $childParsers = array();

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'type' => $oXmlReader->getAttribute('type'),
        );
    }
}
RendererV2::registerChildParser('categories', function ($oXmlReader) {
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
    while ($oXmlReader->read()) {
        if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
            && $oXmlReader->localName == $localName
            && $oXmlReader->depth == $depth) {
            break;
        }

        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            continue;
        }

        if ($oXmlReader->depth != $depth + 1) {
            continue;
        }

        if ($oXmlReader->localName == 'category') {
            $data[$oXmlReader->getAttribute('value')] = $oXmlReader->getAttribute('label');
        }
    }

    return $data;
});
