<?php

/**
 * QGIS Layout.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layout;

use Lizmap\Project\Qgis;

/**
 * QGIS Layout.
 *
 * @property string                                          $name
 * @property array<LayoutItemPage>                           $PageCollection
 * @property array<LayoutItem|LayoutItemLabel|LayoutItemMap> $Items
 * @property array                                           $Atlas
 */
class Layout extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'name',
        'PageCollection',
        'Items',
        'Atlas',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'name',
        'PageCollection',
        'Items',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'Layout';

    protected static $childParsers = array();

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
        );
    }

    protected static function buildInstance($data)
    {
        $data['Items'] = array();
        if (array_key_exists('LayoutItem', $data)) {
            $data['Items'] = $data['LayoutItem'];
            unset($data['LayoutItem']);
        }

        return new Layout($data);
    }
}
Layout::registerChildParser('PageCollection', function ($oXmlReader) {
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
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

        if ($oXmlReader->localName == 'LayoutItem') {
            $data[] = LayoutItem::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
Layout::registerChildParser('LayoutItem', function ($oXmlReader) {
    return array(
        LayoutItem::fromXmlReader($oXmlReader),
    );
});
Layout::registerChildParser('Atlas', function ($oXmlReader) {
    return array(
        'enabled' => filter_var($oXmlReader->getAttribute('enabled'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        'coverageLayer' => $oXmlReader->getAttribute('coverageLayer'),
    );
});
