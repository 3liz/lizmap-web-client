<?php

/**
 * QGIS Vector layer attribute table config.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer;

use Lizmap\Project;

/**
 * QGIS Vector layer attribute table config.
 *
 * @property string                      $sortExpression
 * @property int                         $sortOrder
 * @property array<AttributeTableColumn> $columns
 */
class AttributeTableConfig extends Project\Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'sortExpression',
        'sortOrder',
        'columns',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'sortExpression',
        'sortOrder',
        'columns',
    );

    /**
     * Get vector layer attribute table config as key array.
     *
     * @return array
     */
    public function toKeyArray()
    {
        $data = array();
        if ($this->columns) {
            foreach ($this->columns as $idx => $column) {
                if ($column->hidden) {
                    continue;
                }
                $data[] = array(
                    'index' => $idx,
                    'type' => $column->type,
                    'name' => $column->name,
                );
            }
        }

        return array(
            'columns' => $data,
        );
    }

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'attributetableconfig';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'sortExpression' => $oXmlReader->getAttribute('sortExpression'),
            'sortOrder' => (int) $oXmlReader->getAttribute('sortOrder'),
        );
    }

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'columns',
    );

    protected static $childParsers = array();
}
AttributeTableConfig::registerChildParser('columns', function ($oXmlReader) {
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

        if ($oXmlReader->localName == 'column') {
            $data[] = AttributeTableColumn::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
